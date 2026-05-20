"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisStreamClientProvider = void 0;
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
const redis_stream_tokens_1 = require("./redis-stream.tokens");
exports.redisStreamClientProvider = {
    provide: redis_stream_tokens_1.REDIS_STREAM_CLIENT,
    useFactory: (config) => {
        const cfg = config.getOrThrow('redisStream');
        return new ioredis_1.default(cfg.url, {
            maxRetriesPerRequest: null,
        });
    },
    inject: [config_1.ConfigService],
};
//# sourceMappingURL=redis-stream.providers.js.map