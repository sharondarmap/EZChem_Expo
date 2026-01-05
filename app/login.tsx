// app/login.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getToken, login, logout } from "../src/services/auth";
import { BASE_URL } from "../src/services/api";

function isLikelyJwt(token: string) {
  // JWT biasanya ada 3 bagian dipisah titik
  return token.split(".").length === 3;
}

async function verifyTokenWithBackend(token: string) {
  // hit /auth/me supaya yakin token valid
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await res.text();
  let data: any = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Masuk</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.7 }]}
        disabled={loading}
        onPress={async () => {
          setLoading(true);
          try {
            // 1) login (harusnya hit backend di auth.ts kamu)
            const result = await login(email, password);

            // 2) ambil token dari storage (source of truth)
            const token = await getToken();
            if (!token) throw new Error("Token tidak tersimpan. Login gagal.");

            // 3) kalau token bukan JWT, kemungkinan masih login dummy
            if (!isLikelyJwt(token)) {
              // bersihin biar gak dianggap login palsu
              await logout();
              throw new Error(
                "Token yang tersimpan bukan JWT (masih dummy). Pastikan auth.ts sudah pakai backend /auth/login."
              );
            }

            // 4) verify token ke backend
            await verifyTokenWithBackend(token);

            // 5) kalau lolos semua baru masuk
            router.replace("/welcome");
          } catch (e: any) {
            Alert.alert("Login gagal", String(e?.message || e));
          } finally {
            setLoading(false);
          }
        }}
      >
        <Text style={styles.btnText}>{loading ? "Memproses..." : "Masuk"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#0f172a",
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 12 },
  input: { width: "100%", backgroundColor: "#fff", padding: 10, borderRadius: 6, marginTop: 8 },
  btn: { marginTop: 16, backgroundColor: "#2196F3", paddingVertical: 10, paddingHorizontal: 18, borderRadius: 6 },
  btnText: { color: "#fff", fontWeight: "700" },
});
