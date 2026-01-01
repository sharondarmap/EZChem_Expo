// Safe storage wrapper: try to require native AsyncStorage, otherwise fall back to in-memory storage
let _storage: any = null;
let _inMemoryMap: Map<string, string> | null = null;

function getStorage() {
  if (_storage) return _storage;

  // If running in Expo Go, avoid requiring native AsyncStorage because it may not be available
  try {
    const Constants = require('expo-constants');
    if (Constants?.appOwnership === 'expo') {
      if (!_inMemoryMap) _inMemoryMap = new Map();
      _storage = {
        getItem: async (k: string) => {
          const v = _inMemoryMap!.get(k);
          return v === undefined ? null : v;
        },
        setItem: async (k: string, v: string) => {
          _inMemoryMap!.set(k, v);
        },
        removeItem: async (k: string) => {
          _inMemoryMap!.delete(k);
        },
      };
      console.warn('[auth] Running in Expo Go; using in-memory storage because native AsyncStorage is unavailable. Install and rebuild `@react-native-async-storage/async-storage` for persistent storage.');
      return _storage;
    }
  } catch (e) {
    // ignore errors loading expo-constants
  }

  try {
    // Try to load AsyncStorage and use a defensive wrapper that falls back if native calls fail.
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    if (AsyncStorage) {
      let nativeHealthy = true;
      _storage = {
        getItem: async (k: string) => {
          if (!nativeHealthy) return _inMemoryMap?.get(k) ?? null;
          try {
            const v = await AsyncStorage.getItem(k);
            return v;
          } catch (e) {
            nativeHealthy = false;
            console.warn('[auth] AsyncStorage operation failed; switching to in-memory fallback:', (e as any)?.message || e);
            if (!_inMemoryMap) _inMemoryMap = new Map();
            return _inMemoryMap.get(k) ?? null;
          }
        },
        setItem: async (k: string, v: string) => {
          if (!nativeHealthy) {
            if (!_inMemoryMap) _inMemoryMap = new Map();
            _inMemoryMap.set(k, v);
            return;
          }
          try {
            await AsyncStorage.setItem(k, v);
          } catch (e) {
            nativeHealthy = false;
            console.warn('[auth] AsyncStorage.setItem failed; switching to in-memory fallback:', (e as any)?.message || e);
            if (!_inMemoryMap) _inMemoryMap = new Map();
            _inMemoryMap.set(k, v);
          }
        },
        removeItem: async (k: string) => {
          if (!nativeHealthy) {
            _inMemoryMap?.delete(k);
            return;
          }
          try {
            await AsyncStorage.removeItem(k);
          } catch (e) {
            nativeHealthy = false;
            console.warn('[auth] AsyncStorage.removeItem failed; switching to in-memory fallback:', (e as any)?.message || e);
            _inMemoryMap?.delete(k);
          }
        },
      };
      return _storage;
    }
  } catch (e: any) {
    console.warn('[auth] Failed to load @react-native-async-storage/async-storage:', e?.message || e);
  }

  // Try to use expo-secure-store for persistent storage (works in Expo Go and managed builds)
  try {
    const SecureStore = require('expo-secure-store');
    if (SecureStore) {
      _storage = {
        getItem: async (k: string) => {
          try {
            return await SecureStore.getItemAsync(k);
          } catch (e) {
            console.warn('[auth] SecureStore.getItemAsync failed:', (e as any)?.message || e);
            return null;
          }
        },
        setItem: async (k: string, v: string) => {
          try {
            await SecureStore.setItemAsync(k, v);
          } catch (e) {
            console.warn('[auth] SecureStore.setItemAsync failed:', (e as any)?.message || e);
          }
        },
        removeItem: async (k: string) => {
          try {
            await SecureStore.deleteItemAsync(k);
          } catch (e) {
            console.warn('[auth] SecureStore.deleteItemAsync failed:', (e as any)?.message || e);
          }
        },
      };
      console.warn('[auth] Using expo-secure-store for persistent storage.');
      return _storage;
    }
  } catch (e: any) {
    console.warn('[auth] Failed to load expo-secure-store:', e?.message || e);
  }

  // fallback in-memory storage when no persistent storage is available
  if (!_inMemoryMap) _inMemoryMap = new Map();
  _storage = {
    getItem: async (k: string) => {
      const v = _inMemoryMap!.get(k);
      return v === undefined ? null : v;
    },
    setItem: async (k: string, v: string) => {
      _inMemoryMap!.set(k, v);
    },
    removeItem: async (k: string) => {
      _inMemoryMap!.delete(k);
    },
  };
  console.warn('[auth] No persistent storage available — using in-memory fallback. Install and rebuild `@react-native-async-storage/async-storage` for persistent storage.');
  return _storage;
}

const TOKEN_KEY = 'EZChem:token';
const USER_KEY = 'EZChem:user';

type User = { id?: string; email?: string; name?: string } | null;

let _listener: (() => void) | null = null;

export async function getToken(): Promise<string | null> {
  const s = getStorage();
  return s.getItem(TOKEN_KEY);
}

export async function getUser(): Promise<User> {
  const s = getStorage();
  const raw = await s.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export async function isLoggedIn(): Promise<boolean> {
  const t = await getToken();
  return !!t;
}

export async function login(email: string, password: string) {
  // Minimal placeholder login - replace with real API call
  const fakeToken = 'fake-token-' + Date.now();
  const user = { email, name: email.split('@')[0] };
  const s = getStorage();
  await s.setItem(TOKEN_KEY, fakeToken);
  await s.setItem(USER_KEY, JSON.stringify(user));
  _listener?.();
  return { token: fakeToken, user };
}

export async function register(email: string, password: string) {
  // Minimal placeholder register
  return login(email, password);
}

export async function logout() {
  const s = getStorage();
  await s.removeItem(TOKEN_KEY);
  await s.removeItem(USER_KEY);
  _listener?.();
}

export function onAuthStateChanged(cb: () => void) {
  _listener = cb;
  return () => {
    if (_listener === cb) _listener = null;
  };
}

export default {
  getToken,
  getUser,
  isLoggedIn,
  login,
  register,
  logout,
  onAuthStateChanged,
};
