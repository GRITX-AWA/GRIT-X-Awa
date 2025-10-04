/**
 * Optimized data loader with chunking support for large datasets
 * Features:
 * - Progressive loading (shows initial data instantly, loads rest in background)
 * - IndexedDB caching (downloads once, uses local cache afterward)
 * - Fetches from Supabase Storage (no local files needed)
 */

import { getSupabasePublicUrl } from '../config/supabase';
import { indexedDBCache } from './indexedDBCache';

export interface DatasetMetadata {
  total_rows: number;
  chunk_size: number;
  total_chunks: number;
  columns: string[];
}

export type DatasetType = 'kepler' | 'tess';

export interface LoadProgress {
  loaded: number;
  total: number;
  percentage: number;
  fromCache: boolean;
}

// Configuration: Set to true to use Supabase Storage, false to use local files
const USE_SUPABASE_STORAGE = true;
const INITIAL_CHUNKS_TO_LOAD = 3; // Load first 3 chunks immediately (3000 rows)

class DataLoader {
  private memoryCache: Map<string, any[]> = new Map(); // In-memory cache for current session
  private metadataCache: Map<string, DatasetMetadata> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map(); // Prevent duplicate requests

  /**
   * Get the URL for a dataset file (either Supabase or local)
   */
  private getFileUrl(path: string): string {
    if (USE_SUPABASE_STORAGE) {
      return getSupabasePublicUrl(path);
    } else {
      // Fallback to local files
      return `/src/data/${path}`;
    }
  }

  /**
   * Load metadata for a dataset (with IndexedDB cache)
   */
  async loadMetadata(datasetType: DatasetType): Promise<DatasetMetadata> {
    const cacheKey = `${datasetType}_metadata`;

    // Check memory cache first
    if (this.metadataCache.has(cacheKey)) {
      return this.metadataCache.get(cacheKey)!;
    }

    // Check IndexedDB cache
    const cached = await indexedDBCache.get(cacheKey);
    if (cached) {
      this.metadataCache.set(cacheKey, cached);
      return cached;
    }

    try {
      const url = this.getFileUrl(`${datasetType}_chunks/metadata.json`);
      console.log(`📥 Loading metadata from: ${USE_SUPABASE_STORAGE ? 'Supabase Storage' : 'Local'}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const metadata: DatasetMetadata = await response.json();

      // Store in both caches
      this.metadataCache.set(cacheKey, metadata);
      await indexedDBCache.set(cacheKey, metadata);

      return metadata;
    } catch (error) {
      console.error(`Failed to load metadata for ${datasetType}:`, error);
      throw error;
    }
  }

  /**
   * Load a specific chunk of data (with IndexedDB cache and deduplication)
   */
  async loadChunk(datasetType: DatasetType, chunkNumber: number): Promise<any[]> {
    const cacheKey = `${datasetType}_chunk_${chunkNumber}`;

    // Check memory cache first (fastest)
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey)!;
    }

    // Check if already loading (prevent duplicate requests)
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // Check IndexedDB cache (fast, local)
    const cached = await indexedDBCache.get(cacheKey);
    if (cached) {
      this.memoryCache.set(cacheKey, cached);
      return cached;
    }

    // Not in cache - need to download
    const loadPromise = (async () => {
      try {
        const url = this.getFileUrl(`${datasetType}_chunks/chunk_${chunkNumber}.json`);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const chunk = await response.json();

        // Store in both caches
        this.memoryCache.set(cacheKey, chunk);
        await indexedDBCache.set(cacheKey, chunk);

        return chunk;
      } catch (error) {
        console.error(`Failed to load chunk ${chunkNumber} for ${datasetType}:`, error);
        throw error;
      } finally {
        // Clean up loading promise
        this.loadingPromises.delete(cacheKey);
      }
    })();

    this.loadingPromises.set(cacheKey, loadPromise);
    return loadPromise;
  }

  /**
   * Load multiple chunks at once
   */
  async loadChunks(datasetType: DatasetType, chunkNumbers: number[]): Promise<any[]> {
    const chunks = await Promise.all(
      chunkNumbers.map(num => this.loadChunk(datasetType, num))
    );
    return chunks.flat();
  }

  /**
   * Load initial data (first N chunks)
   */
  async loadInitialData(datasetType: DatasetType, chunksToLoad: number = 3): Promise<any[]> {
    const metadata = await this.loadMetadata(datasetType);
    const maxChunks = Math.min(chunksToLoad, metadata.total_chunks);
    const chunkNumbers = Array.from({ length: maxChunks }, (_, i) => i);
    return this.loadChunks(datasetType, chunkNumbers);
  }

  /**
   * Load all data progressively (for when user wants full dataset)
   */
  async loadAllData(
    datasetType: DatasetType,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<any[]> {
    const metadata = await this.loadMetadata(datasetType);
    const allData: any[] = [];

    for (let i = 0; i < metadata.total_chunks; i++) {
      const chunk = await this.loadChunk(datasetType, i);
      allData.push(...chunk);

      if (onProgress) {
        onProgress(i + 1, metadata.total_chunks);
      }
    }

    return allData;
  }

  /**
   * Load data with pagination
   */
  async loadPage(
    datasetType: DatasetType,
    page: number,
    pageSize: number
  ): Promise<{ data: any[]; total: number }> {
    const metadata = await this.loadMetadata(datasetType);
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;

    // Calculate which chunks we need
    const startChunk = Math.floor(startIndex / metadata.chunk_size);
    const endChunk = Math.floor(endIndex / metadata.chunk_size);

    // Load necessary chunks
    const chunkNumbers = Array.from(
      { length: endChunk - startChunk + 1 },
      (_, i) => startChunk + i
    );
    const chunksData = await this.loadChunks(datasetType, chunkNumbers);

    // Extract the specific page
    const chunkStartIndex = startIndex % metadata.chunk_size;
    const data = chunksData.slice(chunkStartIndex, chunkStartIndex + pageSize);

    return {
      data,
      total: metadata.total_rows
    };
  }

  /**
   * Load data with progressive strategy - instant UI, background loading
   */
  async loadProgressively(
    datasetType: DatasetType,
    onProgress?: (progress: LoadProgress) => void
  ): Promise<any[]> {
    const metadata = await this.loadMetadata(datasetType);
    const totalChunks = metadata.total_chunks;

    console.log(`🚀 Progressive load: ${totalChunks} chunks, loading first ${INITIAL_CHUNKS_TO_LOAD} immediately`);

    // Phase 1: Load initial chunks immediately (for instant UI)
    const initialChunks = Math.min(INITIAL_CHUNKS_TO_LOAD, totalChunks);
    const initialData: any[] = [];

    for (let i = 0; i < initialChunks; i++) {
      const chunk = await this.loadChunk(datasetType, i);
      initialData.push(...chunk);

      if (onProgress) {
        const cached = await indexedDBCache.has(`${datasetType}_chunk_${i}`);
        onProgress({
          loaded: i + 1,
          total: totalChunks,
          percentage: Math.round(((i + 1) / totalChunks) * 100),
          fromCache: cached
        });
      }
    }

    // Phase 2: Load remaining chunks in background (don't block UI)
    if (totalChunks > initialChunks) {
      // Fire and forget - load in background
      setTimeout(async () => {
        for (let i = initialChunks; i < totalChunks; i++) {
          await this.loadChunk(datasetType, i);

          if (onProgress) {
            const cached = await indexedDBCache.has(`${datasetType}_chunk_${i}`);
            onProgress({
              loaded: i + 1,
              total: totalChunks,
              percentage: Math.round(((i + 1) / totalChunks) * 100),
              fromCache: cached
            });
          }
        }
        console.log(`✅ Background loading complete: ${totalChunks} chunks loaded`);
      }, 100); // Small delay to let UI render first
    }

    return initialData;
  }

  /**
   * Check if dataset is fully cached
   */
  async isFullyCached(datasetType: DatasetType): Promise<boolean> {
    try {
      const metadata = await this.loadMetadata(datasetType);
      for (let i = 0; i < metadata.total_chunks; i++) {
        const cached = await indexedDBCache.has(`${datasetType}_chunk_${i}`);
        if (!cached) return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Preload entire dataset (for offline use)
   */
  async preloadDataset(
    datasetType: DatasetType,
    onProgress?: (progress: LoadProgress) => void
  ): Promise<void> {
    console.log(`📥 Preloading entire ${datasetType} dataset...`);
    const metadata = await this.loadMetadata(datasetType);

    for (let i = 0; i < metadata.total_chunks; i++) {
      await this.loadChunk(datasetType, i);

      if (onProgress) {
        onProgress({
          loaded: i + 1,
          total: metadata.total_chunks,
          percentage: Math.round(((i + 1) / metadata.total_chunks) * 100),
          fromCache: false
        });
      }
    }

    console.log(`✅ Preload complete: ${metadata.total_chunks} chunks cached`);
  }

  /**
   * Clear memory cache only (keep IndexedDB)
   */
  clearMemoryCache() {
    this.memoryCache.clear();
    this.metadataCache.clear();
    console.log('🧹 Memory cache cleared');
  }

  /**
   * Clear all caches (memory + IndexedDB)
   */
  async clearAllCaches() {
    this.clearMemoryCache();
    await indexedDBCache.clear();
    console.log('🗑️ All caches cleared');
  }

  /**
   * Get comprehensive cache stats
   */
  async getCacheStats() {
    const dbStats = await indexedDBCache.getStats();
    return {
      memory: {
        chunks: this.memoryCache.size,
        metadata: this.metadataCache.size
      },
      indexedDB: {
        entries: dbStats.count,
        totalSize: dbStats.totalSize,
        totalSizeMB: (dbStats.totalSize / 1024 / 1024).toFixed(2),
        oldestCache: dbStats.oldestTimestamp
          ? new Date(dbStats.oldestTimestamp).toLocaleString()
          : 'N/A'
      }
    };
  }

  /**
   * Clean expired cache entries
   */
  async cleanExpiredCache(): Promise<number> {
    return await indexedDBCache.cleanExpired();
  }
}

// Singleton instance
export const dataLoader = new DataLoader();
