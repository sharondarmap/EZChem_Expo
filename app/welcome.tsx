import React, { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { getToken } from "../src/services/auth";

export default function Welcome() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = await getToken();
      if (!mounted) return;

      if (!token) {
        router.replace("/login"); // ✅ wajib login
        return;
      }
      setReady(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>Memeriksa sesi…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selamat Datang di Virtual Learning</Text>
      <Text style={styles.subtitle}>
        Platform pembelajaran kimia secara virtual untuk membantu mahasiswa TPB ITB.
      </Text>

      <View style={styles.buttons}>
        <Link href="/pembelajaran" style={styles.btn}>
          <Text style={styles.btnText}>Mulai Belajar</Text>
        </Link>
        <Link href="/quiz" style={styles.btnOutline}>
          <Text style={styles.btnOutlineText}>Uji Kemampuan</Text>
        </Link>
        <Link href="/profile" style={styles.btnOutline}>
          <Text style={styles.btnOutlineText}>Profil</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a" },
  title: { fontSize: 28, color: "#64b5f6", fontWeight: "800", marginBottom: 12, textAlign: "center" },
  subtitle: { color: "#b0bec5", fontSize: 16, marginBottom: 20, textAlign: "center", maxWidth: 600 },
  buttons: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center" },
  btn: { backgroundColor: "#64b5f6", padding: 12, borderRadius: 12, marginRight: 8 },
  btnText: { color: "#fff", fontWeight: "700" },
  btnOutline: { borderColor: "#64b5f6", borderWidth: 1, padding: 12, borderRadius: 12 },
  btnOutlineText: { color: "#64b5f6", fontWeight: "700" },
});
