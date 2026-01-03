import AsyncStorage from "@react-native-async-storage/async-storage"

const BASE_URL = "https://tugas1pawm-production-7a65.up.railway.app"

async function getToken() {
  return AsyncStorage.getItem("token")
}

async function fetchJSON(
  path: string,
  options: RequestInit & { body?: any } = {}
) {
  const token = await getToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(BASE_URL + path, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }

  return res.json()
}

export const API = {
  fetchJSON,
}
