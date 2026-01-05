// src/services/api.ts
import { getToken } from "./session";

export const BASE_URL = "https://tugas1pawm-production-7a65.up.railway.app";

type FetchOpts = RequestInit & {
  body?: any;
  auth?: boolean; // default true
  parse?: "json" | "text";
};

function joinUrl(base: string, path: string) {
  if (!path) return base;
  if (path.startsWith("http")) return path;
  return base.replace(/\/+$/, "") + (path.startsWith("/") ? path : `/${path}`);
}

export async function fetchAPI(path: string, options: FetchOpts = {}) {
  const { auth = true, parse = "json", body, headers: h, ...rest } = options;

  const headers: Record<string, string> = {
    ...(h as any),
  };

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let finalBody: any = body;

  if (body instanceof URLSearchParams) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    finalBody = body.toString();
  } else if (typeof FormData !== "undefined" && body instanceof FormData) {
    // do not set Content-Type
  } else if (body && typeof body === "object" && typeof finalBody !== "string") {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
    finalBody = JSON.stringify(body);
  }

  const url = joinUrl(BASE_URL, path);
  const res = await fetch(url, { ...rest, headers, body: finalBody });

  const text = await res.text();
  let data: any = text;

  if (parse === "json") {
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `${res.status} ${res.statusText}`;
    const err = new Error(msg);
    // @ts-ignore
    err.status = res.status;
    throw err;
  }

  return data;
}

export const API = {
  fetchJSON: (path: string, opts: FetchOpts = {}) => fetchAPI(path, { ...opts, parse: "json" }),
  fetchText: (path: string, opts: FetchOpts = {}) => fetchAPI(path, { ...opts, parse: "text" }),
};
