import type { SupportedStorage } from '@supabase/supabase-js';

/** Wraps AsyncStorage so corrupt or unreadable session data does not crash auth. */
export function createNativeAuthStorage(
  storage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  }
): SupportedStorage {
  return {
    getItem: async (key) => {
      try {
        return await storage.getItem(key);
      } catch (err) {
        console.warn('Auth storage read failed:', err);
        return null;
      }
    },
    setItem: async (key, value) => {
      try {
        await storage.setItem(key, value);
      } catch (err) {
        console.warn('Auth storage write failed:', err);
      }
    },
    removeItem: async (key) => {
      try {
        await storage.removeItem(key);
      } catch (err) {
        console.warn('Auth storage remove failed:', err);
      }
    },
  };
}
