// src/config/cache.ts
import NodeCache from 'node-cache';

export class CacheManager {
    private static instance: CacheManager;
    private cache: NodeCache;

    private constructor() {
        this.cache = new NodeCache({
            stdTTL: 600, // 10 minutes
            checkperiod: 120 // 2 minutes
        });
    }

    public static getInstance(): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }

    set<T>(key: string, value: T, ttl: number | string = 600): boolean {
        return this.cache.set(key, value, ttl);
    }

    get<T>(key: string): T | undefined {
        return this.cache.get<T>(key);
    }

    delete(key: string): number {
        return this.cache.del(key);
    }

    flush(): void {
        this.cache.flushAll();
    }
}

export default CacheManager.getInstance();