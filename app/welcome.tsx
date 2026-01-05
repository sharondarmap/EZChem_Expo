import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getToken } from "../src/services/auth";

export default function Welcome() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const featureCards = useMemo(
    () => [
      {
        icon: "flask-outline" as const,
        title: "Tabel Periodik Interaktif",
        description: "Jelajahi unsur-unsur kimia dengan informasi lengkap dan interaktif.",
        route: "/periodic-table",
        cta: "Mulai Eksplorasi",
      },
      {
        icon: "book-outline" as const,
        title: "Flashcard Pembelajaran",
        description: "Pelajari konsep kimia dengan kartu pembelajaran yang mudah dipahami.",
        route: "/flashcard",
        cta: "Mulai Belajar",
      },
      {
        icon: "game-controller-outline" as const,
        title: "Bermain Sambil Belajar",
        description: "Asah keterampilan kimia Anda melalui permainan interaktif yang menyenangkan.",
        route: "/games",
        cta: "Mulai Bermain",
      },
    ],
    [],
  );

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
      <LinearGradient colors={["#0b1220", "#0f172a", "#0b1325"]} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingBox}>
            <Text style={styles.subtitle}>Memeriksa sesi...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0b1220", "#0f172a", "#0b1325"]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Selamat Datang di Virtual Learning</Text>
            <Text style={styles.heroSubtitle}>
              Platform pembelajaran kimia secara virtual untuk membantu mahasiswa TPB ITB
              memahami konsep-konsep kimia dengan mudah dan menyenangkan.
            </Text>

            <View style={styles.heroActions}>
              <Pressable
                onPress={() => router.push("/pembelajaran")}
                style={({ pressed }) => [styles.ctaPrimary, pressed && styles.pressed]}
              >
                <Text style={styles.ctaPrimaryText}>Mulai Belajar</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/quiz")}
                style={({ pressed }) => [styles.ctaSecondary, pressed && styles.pressed]}
              >
                <Text style={styles.ctaSecondaryText}>Uji Kemampuan</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fitur Pembelajaran</Text>
          </View>

          <View style={styles.cardGrid}>
            {featureCards.map((card) => (
              <Pressable
                key={card.title}
                onPress={() => router.push(card.route)}
                style={({ pressed }) => [styles.featureCard, pressed && styles.cardPressed]}
              >
                <View style={styles.iconWrap}>
                  <Ionicons name={card.icon} size={32} color="#64b5f6" />
                </View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDescription}>{card.description}</Text>
                <View style={styles.cardButton}>
                  <Text style={styles.cardButtonText}>{card.cta}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 Chemistry Virtual Learning. II3140 Web and Mobile Application Development.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
    gap: 24,
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  heroTitle: {
    fontSize: 32,
    color: "#64b5f6",
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 40,
  },
  heroSubtitle: {
    color: "#c3d1de",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
    maxWidth: 720,
  },
  heroActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  ctaPrimary: {
    backgroundColor: "#64b5f6",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 150,
    alignItems: "center",
  },
  ctaPrimaryText: {
    color: "#0b1220",
    fontWeight: "800",
    fontSize: 16,
  },
  ctaSecondary: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    minWidth: 150,
    alignItems: "center",
  },
  ctaSecondaryText: {
    color: "#e3f2fd",
    fontWeight: "800",
    fontSize: 16,
  },
  hero: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  sectionHeader: {
    gap: 4,
    alignItems: "center",
  },
  sectionTitle: {
    color: "#64b5f6",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  cardGrid: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  featureCard: {
    width: 300,
    backgroundColor: "rgba(5,15,35,0.6)",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 8,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(100,181,246,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: "#e3f2fd",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 22,
  },
  cardDescription: {
    color: "#b0bec5",
    fontSize: 14,
    lineHeight: 20,
  },
  cardButton: {
    marginTop: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(100,181,246,0.6)",
    backgroundColor: "rgba(100,181,246,0.1)",
  },
  cardButtonText: {
    color: "#64b5f6",
    fontWeight: "700",
    fontSize: 14,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  footer: {
    marginTop: 8,
    alignItems: "center",
  },
  footerText: {
    color: "#9fb3c8",
    fontSize: 12,
    textAlign: "center",
  },
});
