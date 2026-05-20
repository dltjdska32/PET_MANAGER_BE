"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AuthUserStreamRetryScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUserStreamRetryScheduler = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
const auth_user_stream_consumer_1 = require("./auth-user-stream.consumer");
const redis_stream_tokens_1 = require("./redis-stream.tokens");
const stream_fields_util_1 = require("./stream-fields.util");
let AuthUserStreamRetryScheduler = AuthUserStreamRetryScheduler_1 = class AuthUserStreamRetryScheduler {
    redis;
    config;
    authUserConsumer;
    logger = new common_1.Logger(AuthUserStreamRetryScheduler_1.name);
    interval;
    tickRunning = false;
    constructor(redis, config, authUserConsumer) {
        this.redis = redis;
        this.config = config;
        this.authUserConsumer = authUserConsumer;
    }
    onModuleInit() {
        const map = this.config.getOrThrow('redisStream');
        const streamCfg = map.streams.auth;
        const retry = map.retry;
        if (!streamCfg.enabled || !retry.enabled) {
            this.logger.log('Auth stream retry scheduler off (REDIS_STREAM_ENABLED or REDIS_STREAM_RETRY_ENABLED=false)');
            return;
        }
        const delay = Math.max(1000, retry.fixedDelayMs);
        this.interval = setInterval(() => {
            void this.tick();
        }, delay);
        this.logger.log(`Auth stream retry scheduler on (fixedDelayMs=${delay}, dlq=${retry.dlqStreamKey})`);
    }
    onModuleDestroy() {
        if (this.interval !== undefined) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }
    async tick() {
        if (this.tickRunning)
            return;
        this.tickRunning = true;
        try {
            const map = this.config.getOrThrow('redisStream');
            const streamCfg = map.streams.auth;
            const retry = map.retry;
            if (!streamCfg.enabled || !retry.enabled)
                return;
            await this.runRetryRound(streamCfg, retry);
        }
        catch (e) {
            this.logger.warn(`retry tick: ${e instanceof Error ? e.message : String(e)}`);
        }
        finally {
            this.tickRunning = false;
        }
    }
    async runRetryRound(streamCfg, retry) {
        const streamKey = streamCfg.streamKey;
        const group = streamCfg.group;
        let pendingRaw;
        try {
            pendingRaw = await this.redis.xpending(streamKey, group, '-', '+', retry.batchSize);
        }
        catch (e) {
            this.logger.error(`XPENDING failed: ${e instanceof Error ? e.message : String(e)}`);
            return;
        }
        const pending = this.parsePending(pendingRaw);
        if (pending.length === 0)
            return;
        const retryIds = [];
        for (const p of pending) {
            if (p.deliveries >= retry.maxDeliveries) {
                await this.moveToDlqAndAck(streamKey, group, retry, p);
                continue;
            }
            if (p.idleMs >= retry.minIdleMs) {
                retryIds.push(p.id);
            }
        }
        if (retryIds.length === 0)
            return;
        let claimedRaw;
        try {
            claimedRaw = await this.redis.xclaim(streamKey, group, retry.consumerName, retry.minIdleMs, ...retryIds);
        }
        catch (e) {
            this.logger.error(`XCLAIM failed: ${e instanceof Error ? e.message : String(e)}`);
            return;
        }
        const claimed = this.parseClaimed(claimedRaw);
        if (claimed.length === 0)
            return;
        this.logger.log(`PEL reclaim count=${claimed.length}`);
        for (const { id, fields } of claimed) {
            try {
                await this.authUserConsumer.processMessageWithAck(streamKey, group, id, fields);
            }
            catch (e) {
                this.logger.error(`Retry failed id=${id}: ${e instanceof Error ? e.message : String(e)}`);
            }
        }
    }
    parsePending(raw) {
        if (!Array.isArray(raw))
            return [];
        const out = [];
        for (const row of raw) {
            if (!Array.isArray(row) || row.length < 4)
                continue;
            const id = (0, stream_fields_util_1.redisValueToString)(row[0]);
            const idleMs = Number((0, stream_fields_util_1.redisValueToString)(row[2]));
            const deliveries = Number((0, stream_fields_util_1.redisValueToString)(row[3]));
            if (!id || Number.isNaN(deliveries))
                continue;
            out.push({
                id,
                idleMs: Number.isNaN(idleMs) ? 0 : idleMs,
                deliveries,
            });
        }
        return out;
    }
    parseClaimed(raw) {
        if (!Array.isArray(raw))
            return [];
        const out = [];
        for (const item of raw) {
            if (!Array.isArray(item) || item.length < 2)
                continue;
            const id = (0, stream_fields_util_1.redisValueToString)(item[0]);
            const fieldList = item[1];
            if (!Array.isArray(fieldList))
                continue;
            const strFields = fieldList.map((f) => (0, stream_fields_util_1.redisValueToString)(f));
            out.push({ id, fields: (0, stream_fields_util_1.fieldsToRecord)(strFields) });
        }
        return out;
    }
    async moveToDlqAndAck(streamKey, group, retry, p) {
        let claimedRaw;
        try {
            claimedRaw = await this.redis.xclaim(streamKey, group, retry.consumerName, 0, p.id);
        }
        catch (e) {
            this.logger.error(`DLQ XCLAIM failed id=${p.id}: ${e instanceof Error ? e.message : String(e)}`);
            return;
        }
        const claimed = this.parseClaimed(claimedRaw);
        if (claimed.length === 0)
            return;
        const fields = claimed[0].fields;
        const eventType = fields.eventType ?? 'UNKNOWN';
        const eventValue = fields.value ?? '';
        try {
            await this.redis.xadd(retry.dlqStreamKey, '*', 'originalStream', streamKey, 'originalGroup', group, 'originalId', p.id, 'eventType', eventType, 'value', eventValue, 'deliveries', String(p.deliveries), 'idleMs', String(p.idleMs));
            await this.redis.xack(streamKey, group, p.id);
            this.logger.warn(`DLQ moved and ACKed id=${p.id} eventType=${eventType} deliveries=${p.deliveries} idleMs=${p.idleMs}`);
        }
        catch (e) {
            this.logger.error(`DLQ xadd/xack failed id=${p.id}: ${e instanceof Error ? e.message : String(e)}`);
        }
    }
};
exports.AuthUserStreamRetryScheduler = AuthUserStreamRetryScheduler;
exports.AuthUserStreamRetryScheduler = AuthUserStreamRetryScheduler = AuthUserStreamRetryScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(redis_stream_tokens_1.REDIS_STREAM_CLIENT)),
    __metadata("design:paramtypes", [ioredis_1.default,
        config_1.ConfigService,
        auth_user_stream_consumer_1.AuthUserStreamConsumer])
], AuthUserStreamRetryScheduler);
//# sourceMappingURL=auth-user-stream-retry.scheduler.js.map