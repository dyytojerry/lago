import localforage from 'localforage';

const memoryStorage = new Map();

localforage.defineDriver({
  _driver: 'memoryDriver',
  _initStorage: () => {},
  getItem: async (key: string) => {
    return memoryStorage.get(key);
  },
  setItem: async (key: string, value: any) => {
    memoryStorage.set(key, value);
    return value;
  },
  removeItem: async (key: string) => {
    memoryStorage.delete(key);
  },
  clear: async () => {
    memoryStorage.clear();
  },
  length: async () => {
    return memoryStorage.size;
  },
  key: async (index: number) => {
    return Array.from(memoryStorage.keys())[index];
  },
  keys: async () => {
    return Array.from(memoryStorage.keys());
  },
  iterate: async (iterator: (value: any, key: string, iterationNumber: number) => any) => {
    let result = null;
    memoryStorage.forEach(async (value, key) => {
      result = await iterator(value, key, memoryStorage.size);
    });
    return result
  },
});

// 配置 localforage
localforage.config({
  driver: typeof window === 'undefined' ?  'memoryDriver': localforage.INDEXEDDB, // 优先使用 IndexedDB
  name: 'PiggyBank',
  version: 1.0,
  storeName: 'piggybank_storage',
  description: 'PiggyBank application storage'
});

// 存储前缀
const STORAGE_PREFIX = 'piggybank_';

/**
 * 带前缀的存储工具类
 */
class StorageManager {
  private prefix: string;

  constructor(prefix: string = STORAGE_PREFIX) {
    this.prefix = prefix;
  }

  /**
   * 生成带前缀的键名
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * 设置存储项
   */
  async setItem<T>(key: string, value: T): Promise<T> {
    try {
      const prefixedKey = this.getKey(key);
      return await localforage.setItem(prefixedKey, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
      throw error;
    }
  }

  /**
   * 获取存储项
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const prefixedKey = this.getKey(key);
      return await localforage.getItem<T>(prefixedKey);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  /**
   * 删除存储项
   */
  async removeItem(key: string): Promise<void> {
    try {
      const prefixedKey = this.getKey(key);
      await localforage.removeItem(prefixedKey);
    } catch (error) {
      console.error('Storage removeItem error:', error);
      throw error;
    }
  }

  /**
   * 清空所有存储项
   */
  async clear(): Promise<void> {
    try {
      await localforage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      throw error;
    }
  }

  /**
   * 获取存储项数量
   */
  async length(): Promise<number> {
    try {
      return await localforage.length();
    } catch (error) {
      console.error('Storage length error:', error);
      return 0;
    }
  }

  /**
   * 获取所有键名
   */
  async keys(): Promise<string[]> {
    try {
      const allKeys = await localforage.keys();
      // 过滤出带前缀的键名，并移除前缀
      return allKeys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.substring(this.prefix.length));
    } catch (error) {
      console.error('Storage keys error:', error);
      return [];
    }
  }

  /**
   * 检查键是否存在
   */
  async hasItem(key: string): Promise<boolean> {
    try {
      const prefixedKey = this.getKey(key);
      const value = await localforage.getItem(prefixedKey);
      return value !== null;
    } catch (error) {
      console.error('Storage hasItem error:', error);
      return false;
    }
  }

  /**
   * 批量设置存储项
   */
  async setItems(items: Record<string, any>): Promise<void> {
    try {
      const promises = Object.entries(items).map(([key, value]) => 
        this.setItem(key, value)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Storage setItems error:', error);
      throw error;
    }
  }

  /**
   * 批量获取存储项
   */
  async getItems<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const result: Record<string, T | null> = {};
      const promises = keys.map(async (key) => {
        const value = await this.getItem<T>(key);
        result[key] = value;
      });
      await Promise.all(promises);
      return result;
    } catch (error) {
      console.error('Storage getItems error:', error);
      return {};
    }
  }
}

// 创建默认的存储管理器实例
export const storage = new StorageManager();

// 导出类，允许创建自定义前缀的实例
export { StorageManager };

// 导出 localforage 实例，供高级用法使用
export { localforage };

// 兼容性：提供类似 localStorage 的同步接口（不推荐使用）
export const localStorageCompat = {
  setItem: (key: string, value: string) => {
    storage.setItem(key, value).catch(console.error);
  },
  getItem: (key: string): string | null => {
    // 注意：这是异步操作，但为了兼容性提供同步接口
    // 实际使用中建议使用 storage.getItem
    let result: string | null = null;
    storage.getItem<string>(key).then(value => {
      result = value;
    }).catch(console.error);
    return result;
  },
  removeItem: (key: string) => {
    storage.removeItem(key).catch(console.error);
  },
  clear: () => {
    storage.clear().catch(console.error);
  }
};

