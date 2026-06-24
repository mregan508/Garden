import type { SupportedStorage } from '@supabase/supabase-js';

const memoryStore = new Map<string, string>();

export const memoryAuthStorage: SupportedStorage = {
  getItem: (key) => memoryStore.get(key) ?? null,
  setItem: (key, value) => {
    memoryStore.set(key, value);
  },
  removeItem: (key) => {
    memoryStore.delete(key);
  },
};

export function createBrowserAuthStorage(staySignedIn: boolean): SupportedStorage | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const store = staySignedIn ? window.localStorage : window.sessionStorage;
  return {
    getItem: (key) => store.getItem(key),
    setItem: (key, value) => {
      store.setItem(key, value);
    },
    removeItem: (key) => {
      store.removeItem(key);
    },
  };
}
