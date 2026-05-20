import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { FeedSyncStreamConsumer } from './feed-sync-stream.consumer';
import type {
  RedisStreamConfig,
  RedisStreamMap,
  RedisStreamRetryConfig,
} from './redis-stream.config';
import { REDIS_STREAM_CLIENT } from './redis-stream.tokens';
import { fieldsToRecord, redisValueToString } from './stream-fields.util';

interface PendingEntry {
  id: string;
  idleMs: number;
  deliveries: number;
}

const DEFAULT_FEED_DLQ = 'feed-chat-events-dlq-chat';

/**
 * 피드 동기화 스트림 PEL 재시도 + DLQ (auth 재시도와 동일 패턴).
 */
@Injectable()
export class FeedSyncStreamRetryScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FeedSyncStreamRetryScheduler.name);
  private interval?: NodeJS.Timeout;
  private tickRunning = false;

  constructor(
    @Inject(REDIS_STREAM_CLIENT) private readonly redis: Redis,
    private readonly config: ConfigService,
    private readonly feedSyncConsumer: FeedSyncStreamConsumer,
  ) {}

  onModuleInit(): void {
    const map = this.config.getOrThrow<RedisStreamMap>('redisStream');
    const streamCfg = map.streams.feedSync;
    const retry = map.retry;

    if (!streamCfg.enabled || !retry.enabled) {
      this.logger.log(
        'Feed sync stream retry scheduler off (REDIS_FEED_STREAM_ENABLED or REDIS_STREAM_RETRY_ENABLED=false)',
      );
      return;
    }

    const delay = Math.max(1000, retry.fixedDelayMs);
    this.interval = setInterval(() => {
      void this.tick();
    }, delay);
    const dlq =
      process.env.REDIS_FEED_STREAM_DLQ_KEY ?? DEFAULT_FEED_DLQ;
    this.logger.log(
      `Feed sync retry scheduler on (fixedDelayMs=${delay}, dlq=${dlq})`,
    );
  }

  onModuleDestroy(): void {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  private async tick(): Promise<void> {
    if (this.tickRunning) return;
    this.tickRunning = true;

    try {
      const map = this.config.getOrThrow<RedisStreamMap>('redisStream');
      const streamCfg = map.streams.feedSync;
      const retry = map.retry;

      if (!streamCfg.enabled || !retry.enabled) return;

      await this.runRetryRound(streamCfg, retry);
    } catch (e: unknown) {
      this.logger.warn(
        `feed sync retry tick: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      this.tickRunning = false;
    }
  }

  private feedDlqKey(): string {
    return process.env.REDIS_FEED_STREAM_DLQ_KEY ?? DEFAULT_FEED_DLQ;
  }

  private async runRetryRound(
    streamCfg: RedisStreamConfig,
    retry: RedisStreamRetryConfig,
  ): Promise<void> {
    const streamKey = streamCfg.streamKey;
    const group = streamCfg.group;

    let pendingRaw: unknown;
    try {
      pendingRaw = await this.redis.xpending(
        streamKey,
        group,
        '-',
        '+',
        retry.batchSize,
      );
    } catch (e: unknown) {
      this.logger.error(
        `Feed sync XPENDING failed: ${e instanceof Error ? e.message : String(e)}`,
      );
      return;
    }

    const pending = this.parsePending(pendingRaw);
    if (pending.length === 0) return;

    const retryIds: string[] = [];

    for (const p of pending) {
      if (p.deliveries >= retry.maxDeliveries) {
        await this.moveToDlqAndAck(streamKey, group, retry, p);
        continue;
      }
      if (p.idleMs >= retry.minIdleMs) {
        retryIds.push(p.id);
      }
    }

    if (retryIds.length === 0) return;

    let claimedRaw: unknown;
    try {
      claimedRaw = await this.redis.xclaim(
        streamKey,
        group,
        retry.consumerName,
        retry.minIdleMs,
        ...retryIds,
      );
    } catch (e: unknown) {
      this.logger.error(
        `Feed sync XCLAIM failed: ${e instanceof Error ? e.message : String(e)}`,
      );
      return;
    }

    const claimed = this.parseClaimed(claimedRaw);
    if (claimed.length === 0) return;

    this.logger.log(`Feed sync PEL reclaim count=${claimed.length}`);

    for (const { id, fields } of claimed) {
      try {
        await this.feedSyncConsumer.processMessageWithAck(
          streamKey,
          group,
          id,
          fields,
        );
      } catch (e: unknown) {
        this.logger.error(
          `Feed sync retry failed id=${id}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }
  }

  private parsePending(raw: unknown): PendingEntry[] {
    if (!Array.isArray(raw)) return [];

    const out: PendingEntry[] = [];
    for (const row of raw) {
      if (!Array.isArray(row) || row.length < 4) continue;

      const id = redisValueToString(row[0]);

      const idleMs = Number(redisValueToString(row[2]));

      const deliveries = Number(redisValueToString(row[3]));

      if (!id || Number.isNaN(deliveries)) continue;
      out.push({
        id,
        idleMs: Number.isNaN(idleMs) ? 0 : idleMs,
        deliveries,
      });
    }
    return out;
  }

  private parseClaimed(
    raw: unknown,
  ): Array<{ id: string; fields: Record<string, string> }> {
    if (!Array.isArray(raw)) return [];
    const out: Array<{ id: string; fields: Record<string, string> }> = [];
    for (const item of raw) {
      if (!Array.isArray(item) || item.length < 2) continue;
      const id = redisValueToString(item[0]);
      const fieldListCandidate: unknown = item[1];
      if (!Array.isArray(fieldListCandidate)) continue;
      const strFields = fieldListCandidate.map((f: unknown) =>
        redisValueToString(f),
      );
      out.push({ id, fields: fieldsToRecord(strFields) });
    }
    return out;
  }

  private async moveToDlqAndAck(
    streamKey: string,
    group: string,
    retry: RedisStreamRetryConfig,
    p: PendingEntry,
  ): Promise<void> {
    let claimedRaw: unknown;
    try {
      claimedRaw = await this.redis.xclaim(
        streamKey,
        group,
        retry.consumerName,
        0,
        p.id,
      );
    } catch (e: unknown) {
      this.logger.error(
        `Feed sync DLQ XCLAIM failed id=${p.id}: ${e instanceof Error ? e.message : String(e)}`,
      );
      return;
    }

    const claimed = this.parseClaimed(claimedRaw);
    if (claimed.length === 0) return;

    const fields = claimed[0].fields;
    const eventType = fields.eventType ?? 'UNKNOWN';
    const eventValue = fields.value ?? '';
    const dlqKey = this.feedDlqKey();

    try {
      await this.redis.xadd(
        dlqKey,
        '*',
        'originalStream',
        streamKey,
        'originalGroup',
        group,
        'originalId',
        p.id,
        'eventType',
        eventType,
        'value',
        eventValue,
        'deliveries',
        String(p.deliveries),
        'idleMs',
        String(p.idleMs),
      );

      await this.redis.xack(streamKey, group, p.id);

      this.logger.warn(
        `Feed sync DLQ moved id=${p.id} ex=${eventType} deliveries=${p.deliveries}`,
      );
    } catch (e: unknown) {
      this.logger.error(
        `Feed sync DLQ xadd/xack failed id=${p.id}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}
