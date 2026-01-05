// app/login.tsx
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getToken, login, logout, register } from "../src/services/auth";
import { BASE_URL } from "../src/services/api";

type Mode = "login" | "register";

function isLikelyJwt(token: string) {
  return token.split(".").length === 3;
}

async function verifyTokenWithBackend(token: string) {
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

function isEmailValid(email: string) {
  const e = (email || "").trim().toLowerCase();
  return e.includes("@") && e.includes(".");
}

function extractErrMessage(err: any) {
  if (!err) return "Unknown error";

  // normal Error
  if (typeof err?.message === "string" && err.message.trim()) return err.message;

  // kalau err object aneh
  if (typeof err === "string") return err;

  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export default function Login() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // khusus register
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);

  const title = useMemo(() => (mode === "login" ? "Masuk" : "Daftar"), [mode]);
  const primaryText = useMemo(() => (mode === "login" ? "Masuk" : "Buat Akun"), [mode]);

  const onSubmit = async () => {
    if (loading) return;

    const e = email.trim().toLowerCase();
    const p = password;

    if (!e || !p) {
      Alert.alert("Form belum lengkap", "Email dan password harus diisi.");
      return;
    }
    if (!isEmailValid(e)) {
      Alert.alert("Email tidak valid", "Cek kembali format email kamu.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        if (p.length < 6) {
          Alert.alert("Password terlalu pendek", "Password minimal 6 karakter.");
          return;
        }

        await register(e, p, fullName?.trim() || undefined);

        // ✅ pindah ke mode login lewat tombol alert (anti ketabrak rerender)
        Alert.alert(
          "Registrasi berhasil",
          "Akun berhasil dibuat. Silakan login menggunakan email & password kamu.",
          [
            {
              text: "OK",
              onPress: () => {
                setMode("login");
                setPassword("");
              },
            },
          ]
        );

        return;
      }

      // LOGIN
      await login(e, p);

      const token = await getToken();
      if (!token) throw new Error("Token tidak tersimpan. Login gagal.");

      if (!isLikelyJwt(token)) {
        await logout();
        throw new Error(
          "Token yang tersimpan bukan JWT (masih dummy). Pastikan auth.ts sudah pakai backend /auth/login."
        );
      }

      await verifyTokenWithBackend(token);

      router.replace("/welcome");
    } catch (err: any) {
      const msg = extractErrMessage(err);

      // ✅ Bikin deteksi "email sudah ada" lebih luas (karena backend beda2 wording)
      const alreadyTaken = /already|exists|dipakai|terdaftar|registered|duplicate|unique|integrity|409/i.test(msg);

      if (mode === "register" && alreadyTaken) {
        Alert.alert("Email sudah terdaftar", "Silakan login atau gunakan email lain.");
      } else if (mode === "login" && /401|unauthorized|invalid/i.test(msg)) {
        Alert.alert("Login gagal", "Email atau password salah, atau akun belum terdaftar.");
      } else {
        Alert.alert(mode === "login" ? "Login gagal" : "Registrasi gagal", msg);
      }

      // ✅ optional: buat debug biar kamu tau message asli backend
      console.log("[auth error]", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.center}>
      <View style={styles.toggleWrap}>
        <TouchableOpacity
          onPress={() => setMode("login")}
          style={[styles.toggleBtn, mode === "login" && styles.toggleBtnActive]}
          disabled={loading}
        >
          <Text style={[styles.toggleText, mode === "login" && styles.toggleTextActive]}>Masuk</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode("register")}
          style={[styles.toggleBtn, mode === "register" && styles.toggleBtnActive]}
          disabled={loading}
        >
          <Text style={[styles.toggleText, mode === "register" && styles.toggleTextActive]}>Daftar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{title}</Text>

      {mode === "register" && (
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nama lengkap (opsional)"
          placeholderTextColor="#888"
          autoCapitalize="words"
          editable={!loading}
        />
      )}

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.7 }]}
        disabled={loading}
        onPress={onSubmit}
      >
        <Text style={styles.btnText}>{loading ? "Memproses..." : primaryText}</Text>
      </TouchableOpacity>

      {mode === "register" ? (
        <Text style={styles.helper}>
          Setelah registrasi berhasil, kamu tetap perlu{" "}
          <Text
            style={styles.helperStrong}
            onPress={() => setMode("login")}
          >
            login
          </Text>
          .
        </Text>
      ) : (
        <Text style={styles.helper}>
          Belum punya akun?{" "}
          <Text
            style={styles.helperStrong}
            onPress={() => setMode("register")}
          >
            Daftar
          </Text>
          .
        </Text>
      )}

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
  toggleWrap: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    padding: 4,
    width: "100%",
    maxWidth: 420,
    marginBottom: 14,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: "center" },
  toggleBtnActive: {
    backgroundColor: "rgba(100,181,246,0.25)",
    borderWidth: 1,
    borderColor: "rgba(100,181,246,0.45)",
  },
  toggleText: { color: "#b0bec5", fontWeight: "800" },
  toggleTextActive: { color: "#64b5f6" },

  title: { color: "#fff", fontSize: 18, fontWeight: "800", marginBottom: 10 },

  input: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },

  btn: {
    width: "100%",
    maxWidth: 420,
    marginTop: 16,
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "900" },

  helper: { marginTop: 12, color: "#b0bec5", textAlign: "center", maxWidth: 420, lineHeight: 18 },
  helperStrong: { color: "#64b5f6", fontWeight: "900" },
});
