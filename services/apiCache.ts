// Simple in-memory API cache

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class APICache {
    private cache: Map<string, CacheEntry<unknown>> = new Map();
    private defaultTTL: number = 60000; // 60 seconds

    /**
     * Get cached data if not expired
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key) as CacheEntry<T> | undefined;
        if (!entry) return null;

        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Set data in cache with optional TTL
     */
    set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    /**
     * Check if key exists and is valid
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    /**
     * Clear specific key
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Clear expired entries
     */
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Generate cache key from URL and params
     */
    static generateKey(url: string, params?: Record<string, unknown>): string {
        let key = url;
        if (params) {
            key += '?' + JSON.stringify(params);
        }
        return key;
    }
}

// Singleton instance
export const apiCache = new APICache();

// Auto-cleanup every 5 minutes
setInterval(() => apiCache.cleanup(), 300000);

export default apiCache;
