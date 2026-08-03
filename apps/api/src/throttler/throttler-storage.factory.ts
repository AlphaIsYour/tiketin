// apps/api/src/throttler/throttler-storage.factory.ts
import { Logger } from '@nestjs/common';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';

const logger = new Logger('ThrottlerStorage');

export function createThrottlerStorage() {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
        logger.warn(
            'REDIS_URL not set — using in-memory throttler storage. ' +
            'This is fine for a single API instance but MUST be set before scaling apps/api ' +
            'across multiple instances, or rate limits will be inconsistent per-instance (see PROGRESS_DEVOPS.md).',
        );
        return undefined;
    }

    const redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 2,
        retryStrategy: (times) => Math.min(times * 200, 2000),
    });

    redis.on('error', (err) => {
        logger.error(`Redis connection error for throttler storage: ${err.message}`);
    });

    logger.log('Using Redis-backed throttler storage (shared across instances)');
    return new ThrottlerStorageRedisService(redis);
}