// src/services/auth.ts
import { API } from "./api";
import {
  getToken as _getToken,
  getUser as _getUser,
  setToken,
  setUser,
  clearSession,
  onAuthStateChanged,
  User,
} from "./session";

type TokenResp = {
  access_token: string;
  token_type?: string;
  user?: any;
};

export async function getToken() {
  return _getToken();
}

export async function getUser(): Promise<User> {
  return _getUser();
}

export async function isLoggedIn(): Promise<boolean> {
  const t = await _getToken();
  return !!t;
}

// ✅ REAL LOGIN (OAuth2PasswordRequestForm)
export async function login(email: string, password: string) {
  if (!email || !password) throw new Error("Email dan password harus diisi.");

  const body = new URLSearchParams();
  body.append("username", email.trim().toLowerCase());
  body.append("password", password);

  const data = (await API.fetchJSON("/auth/login", {
    method: "POST",
    auth: false,
    body,
  })) as TokenResp;

  if (!data?.access_token) throw new Error("Login gagal: token tidak ditemukan.");

  await setToken(data.access_token);

  // ambil user dari response (kalau ada), kalau gak ada → hit /auth/me
  if (data.user) {
    await setUser(data.user);
  } else {
    try {
      const me = await API.fetchJSON("/auth/me", { method: "GET", auth: true });
      await setUser(me);
    } catch {
      await setUser({ email });
    }
  }

  return data;
}

// ✅ REGISTER sesuai backend kamu (FormData via urlencoded juga bisa)
export async function register(email: string, password: string, fullName?: string) {
  if (!email || !password) throw new Error("Email dan password harus diisi.");
  if (String(password).length < 6) throw new Error("Password minimal 6 karakter.");

  // backend kamu: /auth/register menerima Form(...) jadi urlencoded aman
  const body = new URLSearchParams();
  body.append("email", email.trim().toLowerCase());
  body.append("password", password);
  if (fullName?.trim()) body.append("full_name", fullName.trim());

  return API.fetchJSON("/auth/register", {
    method: "POST",
    auth: false,
    body,
  });
}

export async function logout() {
  await clearSession();
}

export { onAuthStateChanged };

export default {
  getToken,
  getUser,
  isLoggedIn,
  login,
  register,
  logout,
  onAuthStateChanged,
};
