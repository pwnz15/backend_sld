// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis, { RedisOptions } from 'ioredis';
import { RedisReply } from 'rate-limit-redis';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable is required');
}

// Initialize Redis with proper options
const redisOptions: RedisOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        console.log(`Retrying Redis connection in ${delay}ms...`);
        return delay;
    },
    maxRetriesPerRequest: 3
};

let redis: Redis;

try {
    redis = new Redis(redisOptions);
    
    redis.on('connect', () => {
        console.log('Successfully connected to Redis');
    });

    redis.on('error', (error) => {
        console.error('Redis connection error:', error);
    });
} catch (error) {
    console.error('Failed to initialize Redis:', error);
    // Fallback to memory store if Redis fails
    
}

export const createRateLimiter = (
    windowMs: number = 15 * 60 * 1000,
    max: number = 100
) => {
    const options = {
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            error: 'Too many requests, please try again later.',
            retryAfter: Math.ceil(windowMs / 1000)
        }
    };

    if (redis) {
        return rateLimit({
            ...options,
            store: new RedisStore({
                sendCommand: async (...args: (string | number)[]) => {
                    const command = args[0] as string;
                    const commandArgs = args.slice(1) as (string | number)[];
                    const result = await redis.call(command, ...commandArgs);
                    return result as RedisReply;
                }
            })
        });
    }

    // Fallback to default memory store
    console.warn('Using memory store for rate limiting (Redis not available)');
    return rateLimit(options);
};

export default createRateLimiter;