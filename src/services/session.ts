// src/services/session.ts
// ✅ storage + token/user helpers, NO import from api/auth (anti require-cycle)

let _storage: any = null;
let _inMemoryMap: Map<string, string> | null = null;

function getStorage() {
  if (_storage) return _storage;

  // If running in Expo Go, avoid requiring native AsyncStorage because it may not be available
  try {
    const Constants = require("expo-constants");
    if (Constants?.appOwnership === "expo") {
      if (!_inMemoryMap) _inMemoryMap = new Map();
      _storage = {
        getItem: async (k: string) => (_inMemoryMap!.has(k) ? _inMemoryMap!.get(k)! : null),
        setItem: async (k: string, v: string) => void _inMemoryMap!.set(k, v),
        removeItem: async (k: string) => void _inMemoryMap!.delete(k),
      };
      console.warn(
        "[session] Expo Go detected; using in-memory storage. Install + rebuild @react-native-async-storage/async-storage for persistence."
      );
      return _storage;
    }
  } catch {}

  // Try AsyncStorage
  try {
    const AsyncStorage = require("@react-native-async-storage/async-storage");
    if (AsyncStorage) {
      let nativeHealthy = true;
      _storage = {
        getItem: async (k: string) => {
          if (!nativeHealthy) return _inMemoryMap?.get(k) ?? null;
          try {
            return await AsyncStorage.getItem(k);
          } catch (e) {
            nativeHealthy = false;
            console.warn("[session] AsyncStorage.getItem failed; fallback to memory:", (e as any)?.message || e);
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
            console.warn("[session] AsyncStorage.setItem failed; fallback to memory:", (e as any)?.message || e);
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
            console.warn("[session] AsyncStorage.removeItem failed; fallback to memory:", (e as any)?.message || e);
            _inMemoryMap?.delete(k);
          }
        },
      };
      return _storage;
    }
  } catch {}

  // Try SecureStore
  try {
    const SecureStore = require("expo-secure-store");
    if (SecureStore) {
      _storage = {
        getItem: async (k: string) => {
          try {
            return await SecureStore.getItemAsync(k);
          } catch (e) {
            console.warn("[session] SecureStore.getItemAsync failed:", (e as any)?.message || e);
            return null;
          }
        },
        setItem: async (k: string, v: string) => {
          try {
            await SecureStore.setItemAsync(k, v);
          } catch (e) {
            console.warn("[session] SecureStore.setItemAsync failed:", (e as any)?.message || e);
          }
        },
        removeItem: async (k: string) => {
          try {
            await SecureStore.deleteItemAsync(k);
          } catch (e) {
            console.warn("[session] SecureStore.deleteItemAsync failed:", (e as any)?.message || e);
          }
        },
      };
      console.warn("[session] Using expo-secure-store.");
      return _storage;
    }
  } catch {}

  // Final fallback: in-memory
  if (!_inMemoryMap) _inMemoryMap = new Map();
  _storage = {
    getItem: async (k: string) => (_inMemoryMap!.has(k) ? _inMemoryMap!.get(k)! : null),
    setItem: async (k: string, v: string) => void _inMemoryMap!.set(k, v),
    removeItem: async (k: string) => void _inMemoryMap!.delete(k),
  };
  console.warn("[session] No persistent storage available — using in-memory fallback.");
  return _storage;
}

export const TOKEN_KEY = "EZChem:token";
export const USER_KEY = "EZChem:user";

export type User = { id?: string | number; email?: string; name?: string; full_name?: string; created_at?: string } | null;

let _listener: (() => void) | null = null;

export function onAuthStateChanged(cb: () => void) {
  _listener = cb;
  return () => {
    if (_listener === cb) _listener = null;
  };
}

export async function getToken() {
  return getStorage().getItem(TOKEN_KEY);
}

export async function setToken(token: string) {
  await getStorage().setItem(TOKEN_KEY, token);
  _listener?.();
}

export async function clearToken() {
  await getStorage().removeItem(TOKEN_KEY);
  _listener?.();
}

export async function getUser(): Promise<User> {
  const raw = await getStorage().getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setUser(user: any) {
  await getStorage().setItem(USER_KEY, JSON.stringify(user));
  _listener?.();
}

export async function clearUser() {
  await getStorage().removeItem(USER_KEY);
  _listener?.();
}

export async function clearSession() {
  await clearToken();
  await clearUser();
  _listener?.();
}
