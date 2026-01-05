// app/index.tsx
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { isLoggedIn } from "../src/services/auth";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ok = await isLoggedIn();
        if (!mounted) return;
        router.replace(ok ? "/welcome" : "/login");
      } catch {
        router.replace("/login");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Redirecting…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a" },
  title: { color: "#fff", fontSize: 16 },
});
