import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  FLASHCARD_DATA,
  FLASHCARD_MODULES,
  FlashcardModuleKey,
  MODULE_NAMES,
} from "../src/data/flashcards";
import { reportFlashcardProgress } from "../src/services/progress";

const { width } = Dimensions.get("window");

// kecilin spam request
function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delay = 500) {
  const t = useRef<any>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  return (...args: Parameters<T>) => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => fnRef.current(...args), delay);
  };
}

export default function FlashcardScreen() {
  const [selectedModule, setSelectedModule] = useState<FlashcardModuleKey | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const rotate = useRef(new Animated.Value(0)).current;

  const cards = useMemo(() => {
    if (!selectedModule) return [];
    return FLASHCARD_DATA[selectedModule] ?? [];
  }, [selectedModule]);

  const current = cards[index];

  const progressPct = cards.length > 0 ? Math.round(((index + 1) / cards.length) * 100) : 0;

  // === helper: kirim progress ke backend ===
  const moduleTitle = selectedModule ? MODULE_NAMES[selectedModule] : "";
  const reportProgressDebounced = useDebouncedCallback(async (mod: string, cur: number, total: number) => {
    try {
      if (!mod || total <= 0) return;
      // backend expects current <= total, current >= 0
      const safeCur = Math.max(0, Math.min(cur, total));
      await reportFlashcardProgress(mod, safeCur, total);
      // kalau mau debug:
      // console.log("✅ reported flashcard:", mod, safeCur, total);
    } catch (e) {
      // jangan bikin crash UI; cukup warn
      console.warn("⚠️ reportFlashcardProgress failed:", (e as any)?.message || e);
    }
  }, 600);

  // Reset saat ganti modul
  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    rotate.setValue(0);
  }, [selectedModule, rotate]);

  // ✅ REPORT: tiap kali masuk modul / pindah index, kirim progress
  useEffect(() => {
    if (!selectedModule) return;
    if (!moduleTitle) return;
    const total = cards.length;
    const cur = total > 0 ? index + 1 : 0;

    // debounce biar klik next/prev cepat gak spam
    reportProgressDebounced(moduleTitle, cur, total);
  }, [selectedModule, moduleTitle, index, cards.length, reportProgressDebounced]);

  // Flip anim
  const flipCard = () => {
    const toValue = flipped ? 0 : 1;
    setFlipped(!flipped);

    Animated.timing(rotate, {
      toValue,
      duration: 550,
      useNativeDriver: true,
    }).start();
  };

  // front: 0 -> 180
  const frontRotateY = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // back: 180 -> 360
  const backRotateY = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const goPrev = () => {
    if (index <= 0) return;
    setIndex((v) => v - 1);
    setFlipped(false);
    rotate.setValue(0);
  };

  const goNext = () => {
    if (index >= cards.length - 1) return;
    setIndex((v) => v + 1);
    setFlipped(false);
    rotate.setValue(0);
  };

  const backToModules = () => {
    // optional: report sekali sebelum keluar (biar pasti kesave)
    if (selectedModule && moduleTitle && cards.length > 0) {
      reportProgressDebounced(moduleTitle, index + 1, cards.length);
    }
    setSelectedModule(null);
  };

  // ============= UI: MODE PILIH MODUL =============
  if (!selectedModule) {
    const numCols = width >= 700 ? 2 : 1;

    return (
      <LinearGradient colors={["#0b1224", "#0f172a", "#0b1020"]} style={styles.bg}>
        <View style={styles.screen}>
          <Text style={styles.header}>Flashcard Kimia</Text>
          <Text style={styles.desc}>Pilih modul. Tiap modul berisi flashcard untuk bantu belajar.</Text>

          <FlatList
            data={FLASHCARD_MODULES}
            key={numCols}
            numColumns={numCols}
            keyExtractor={(m) => m.key}
            columnWrapperStyle={numCols > 1 ? { gap: 12 } : undefined}
            contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setSelectedModule(item.key)}
                style={({ pressed }) => [
                  styles.moduleCard,
                  numCols > 1 ? { flex: 1 } : { width: "100%" },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.moduleTitle}>{item.title}</Text>

                <View style={styles.primaryPill}>
                  <Text style={styles.primaryPillText}>Mulai</Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      </LinearGradient>
    );
  }

  // ============= UI: MODE FLASHCARD =============
  return (
    <LinearGradient colors={["#0b1224", "#0f172a", "#0b1020"]} style={styles.bg}>
      <View style={styles.screen}>
        <View style={styles.headerStack}>
          <Pressable onPress={backToModules} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}>
            <Text style={styles.backBtnText}>Kembali</Text>
          </Pressable>

          <Text style={styles.moduleHeader2} numberOfLines={2}>
            {MODULE_NAMES[selectedModule]}
          </Text>

          <Text style={styles.tapHint}>Tap kartu untuk melihat jawaban</Text>
        </View>

        <Pressable onPress={flipCard} style={{ marginTop: 12 }}>
          <View style={styles.cardWrap}>
            {/* FRONT */}
            <Animated.View
              style={[
                styles.cardFace,
                {
                  transform: [{ perspective: 1200 }, { rotateY: frontRotateY }],
                },
              ]}
            >
              <Text style={styles.cardText}>{current?.question ?? "Belum ada data flashcard untuk modul ini."}</Text>
            </Animated.View>

            {/* BACK */}
            <Animated.View
              style={[
                styles.cardFace,
                styles.cardBack,
                {
                  transform: [{ perspective: 1200 }, { rotateY: backRotateY }],
                },
              ]}
            >
              <Text style={[styles.cardText, styles.cardBackText]}>{current?.answer ?? "—"}</Text>
            </Animated.View>
          </View>
        </Pressable>

        <View style={styles.controls}>
          <Pressable
            onPress={goPrev}
            disabled={index === 0}
            style={({ pressed }) => [
              styles.controlBtn,
              styles.controlBtnSecondary,
              index === 0 && styles.disabledBtn,
              pressed && index !== 0 && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.controlBtnText}>Sebelumnya</Text>
          </Pressable>

          <Text style={styles.counter}>{cards.length === 0 ? "0 / 0" : `${index + 1} / ${cards.length}`}</Text>

          <Pressable
            onPress={goNext}
            disabled={index >= cards.length - 1}
            style={({ pressed }) => [
              styles.controlBtn,
              styles.controlBtnPrimary,
              index >= cards.length - 1 && styles.disabledBtn,
              pressed && index < cards.length - 1 && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.controlBtnTextPrimary}>Selanjutnya</Text>
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>

        <Text style={styles.progressText}>{progressPct}%</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  screen: { flex: 1, padding: 16 },

  header: { color: "#93c5fd", fontSize: 26, fontWeight: "900", marginTop: 6 },
  desc: { color: "#b0bec5", marginTop: 8, marginBottom: 16 },

  moduleCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  moduleTitle: { color: "#93c5fd", fontSize: 16, fontWeight: "800" },
  moduleHint: { color: "#b0bec5", marginTop: 8 },

  primaryPill: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "#60a5fa",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  primaryPillText: { color: "#ebe2e2ff", fontWeight: "900" },

  headerStack: { marginTop: 6, gap: 10 },

  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  backBtnText: { color: "#e5e7eb", fontWeight: "800" },

  moduleHeader2: {
    color: "#93c5fd",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
  },

  tapHint: { color: "#b0bec5" },

  cardWrap: {
    height: 280,
    borderRadius: 18,
    position: "relative",
  },
  cardFace: {
    ...StyleSheet.absoluteFillObject,
    padding: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    backfaceVisibility: "hidden",
  },
  cardBack: { backgroundColor: "rgba(96,165,250,0.14)" },

  cardText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 26,
  },
  cardBackText: { color: "#93c5fd" },

  controls: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  controlBtn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },
  controlBtnPrimary: { backgroundColor: "#60a5fa" },
  controlBtnSecondary: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  controlBtnText: { color: "#e5e7eb", fontWeight: "900" },
  controlBtnTextPrimary: { color: "#0b1020", fontWeight: "900" },
  disabledBtn: { opacity: 0.45 },

  counter: { color: "#93c5fd", fontWeight: "900" },

  progressTrack: {
    marginTop: 16,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#60a5fa" },

  progressText: {
    color: "#b0bec5",
    marginTop: 8,
    textAlign: "right",
    fontWeight: "700",
  },
});
