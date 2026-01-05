import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
        router.replace("/login");
        return;
      }
      setReady(true);
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

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

      {/* Row 1 */}
      <View style={styles.row}>
        <Pressable
          onPress={() => router.push("/pembelajaran")}
          style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.pressed]}
        >
          <Text style={styles.btnPrimaryText}>Mulai Belajar</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/quiz")}
          style={({ pressed }) => [styles.btn, styles.btnOutline, pressed && styles.pressed]}
        >
          <Text style={styles.btnOutlineText}>Uji Kemampuan</Text>
        </Pressable>
      </View>

      {/* Row 2 */}
      <View style={styles.rowCenter}>
        <Pressable
          onPress={() => router.push("/profile")}
          style={({ pressed }) => [styles.btnWide, styles.btnOutline, pressed && styles.pressed]}
        >
          <Text style={styles.btnOutlineText}>Profil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const BTN_H = 52;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },

  title: {
    fontSize: 28,
    color: "#64b5f6",
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },

  subtitle: {
    color: "#b0bec5",
    fontSize: 16,
    marginBottom: 22,
    textAlign: "center",
    maxWidth: 330,
    lineHeight: 22,
  },

  row: {
    flexDirection: "row",
    gap: 14,
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },

  rowCenter: {
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  btn: {
    width: 155,
    height: BTN_H,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  btnWide: {
    width: 324, // kira-kira 2 tombol atas + gap
    height: BTN_H,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  btnPrimary: {
    backgroundColor: "#64b5f6",
  },

  btnPrimaryText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  btnOutline: {
    borderColor: "#64b5f6",
    borderWidth: 1.6,
    backgroundColor: "transparent",
  },

  btnOutlineText: {
    color: "#64b5f6",
    fontWeight: "800",
    fontSize: 16,
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
