/**
 * IndexedDB Cache for Exoplanet Data
 * Stores downloaded chunks locally to avoid re-downloading
 */

const DB_NAME = 'ExoplanetDataCache';
const DB_VERSION = 1;
const STORE_NAME = 'chunks';
const CACHE_EXPIRY_DAYS = 7; // Cache expires after 7 days

interface CachedChunk {
  key: string;
  data: any;
  timestamp: number;
  size: number;
}

class IndexedDBCache {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('📦 IndexedDB cache initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('📦 IndexedDB object store created');
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Check if a chunk is cached and not expired
   */
  async has(key: string): Promise<boolean> {
    await this.init();
    const chunk = await this.get(key);
    return chunk !== null;
  }

  /**
   * Get a cached chunk
   */
  async get(key: string): Promise<any | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const cached = request.result as CachedChunk | undefined;
        if (!cached) {
          resolve(null);
          return;
        }

        // Check if expired
        const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        const isExpired = Date.now() - cached.timestamp > expiryTime;

        if (isExpired) {
          console.log(`🗑️ Cache expired for ${key}`);
          this.delete(key); // Clean up expired entry
          resolve(null);
        } else {
          console.log(`✅ Cache hit for ${key} (${(cached.size / 1024).toFixed(1)} KB)`);
          resolve(cached.data);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store a chunk in cache
   */
  async set(key: string, data: any): Promise<void> {
    await this.init();
    if (!this.db) return;

    const dataStr = JSON.stringify(data);
    const size = new Blob([dataStr]).size;

    const cached: CachedChunk = {
      key,
      data,
      timestamp: Date.now(),
      size
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(cached);

      request.onsuccess = () => {
        console.log(`💾 Cached ${key} (${(size / 1024).toFixed(1)} KB)`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a cached chunk
   */
  async delete(key: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🗑️ All cache cleared');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ count: number; totalSize: number; oldestTimestamp: number }> {
    await this.init();
    if (!this.db) return { count: 0, totalSize: 0, oldestTimestamp: 0 };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const chunks = request.result as CachedChunk[];
        const stats = {
          count: chunks.length,
          totalSize: chunks.reduce((sum, chunk) => sum + chunk.size, 0),
          oldestTimestamp: chunks.length > 0
            ? Math.min(...chunks.map(c => c.timestamp))
            : 0
        };
        resolve(stats);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clean up expired entries
   */
  async cleanExpired(): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = async () => {
        const chunks = request.result as CachedChunk[];
        const expired = chunks.filter(chunk => now - chunk.timestamp > expiryTime);

        for (const chunk of expired) {
          await this.delete(chunk.key);
          deletedCount++;
        }

        console.log(`🗑️ Cleaned ${deletedCount} expired cache entries`);
        resolve(deletedCount);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
export const indexedDBCache = new IndexedDBCache();
