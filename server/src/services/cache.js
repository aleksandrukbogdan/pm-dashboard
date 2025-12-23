/**
 * Simple in-memory cache with TTL support
 * Used to cache Google Sheets data to reduce API calls
 */

class MemoryCache {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {any|null} - Cached value or null if expired/missing
     */
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    /**
     * Set value in cache with TTL
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttlMs - Time-to-live in milliseconds
     */
    set(key, value, ttlMs) {
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttlMs
        });
    }

    /**
     * Delete a specific key from cache
     * @param {string} key - Cache key to delete
     */
    delete(key) {
        this.cache.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getStats() {
        let validEntries = 0;
        const now = Date.now();

        for (const [key, item] of this.cache) {
            if (now <= item.expiresAt) {
                validEntries++;
            }
        }

        return {
            totalEntries: this.cache.size,
            validEntries
        };
    }
}

// Singleton instance
const cache = new MemoryCache();

// Default TTL: 60 seconds
export const DEFAULT_TTL = 60 * 1000;

export default cache;
