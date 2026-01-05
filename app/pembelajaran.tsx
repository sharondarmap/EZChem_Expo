import React from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Linking from "expo-linking";
import { MODULES, Module } from "../src/data/modules";
import { openPdf } from "../src/utils/openPdf";
import { reportLearningProgress } from "../src/services/progress";

export default function Pembelajaran() {
  const report = async (moduleTitle: string, action: string) => {
    try {
      if (!moduleTitle?.trim() || !action?.trim()) return;
      await reportLearningProgress(moduleTitle, action);
      // console.log("✅ learning progress:", moduleTitle, action);
    } catch (e: any) {
      console.warn("⚠️ reportLearningProgress failed:", e?.message ?? e);
    }
  };

  const openUrl = async (url: string, m: Module, action: "simulasi" | "video") => {
    // best-effort report
    void report(m.title, action);

    try {
      const can = await Linking.canOpenURL(url);
      if (!can) {
        Alert.alert("Tidak bisa membuka link", url);
        return;
      }
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert("Gagal membuka link", e?.message ?? "Unknown error");
    }
  };

  const onPressPdf = async (m: Module) => {
    // best-effort report
    void report(m.title, "pdf");

    try {
      await openPdf(m.pdf);
    } catch (e: any) {
      Alert.alert("Gagal membuka PDF", e?.message ?? "Unknown error");
    }
  };

  const renderItem = ({ item, index }: { item: Module; index: number }) => {
    const moduleNumber = index + 1;

    return (
      <View style={styles.card}>
        <Text style={styles.moduleTitle}>
          <Text style={styles.modulePrefix}>Modul {moduleNumber}: </Text>
          {item.title}
        </Text>

        <Text style={styles.subtitle}>{item.description}</Text>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => openUrl(item.simulationUrl, item, "simulasi")}
          >
            <Text style={styles.btnText}>Simulasi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => openUrl(item.videoUrl, item, "video")}
          >
            <Text style={styles.btnText}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => onPressPdf(item)}>
            <Text style={styles.btnOutlineText}>PDF</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerWrap}>
      <Text style={styles.header}>Pembelajaran</Text>
      <Text style={styles.desc}>
        Pilih modul, lalu buka Simulasi / Video / PDF.
      </Text>
    </View>

      <FlatList
        data={MODULES}
        keyExtractor={(m) => m.key}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  moduleTitle: {
    color: "#93c5fd",   
    fontSize: 16,       
    fontWeight: "800",
    lineHeight: 22,
  },

  modulePrefix: {
    color: "#93c5fd",
    fontSize: 16,      
    fontWeight: "800",
    lineHeight: 22,
  },

  screen: { flex: 1, backgroundColor: "#0f172a", padding: 16 },
  headerWrap: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },

  header: {
    color: "#93c5fd",
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 6,
    textAlign: "center",
  },

  desc: {
    color: "#b0bec5",
    fontSize: 14,
    textAlign: "center",
    maxWidth: 420, // biar enak dibaca di tablet
  },


  list: { paddingBottom: 24 },

  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  subtitle: { color: "#b0bec5", marginTop: 6, marginBottom: 10 },

  row: { flexDirection: "row", gap: 10, flexWrap: "wrap" },

  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  btnPrimary: { backgroundColor: "#60a5fa" },
  btnSecondary: { backgroundColor: "#547eb4ff" },
  btnOutline: { borderWidth: 1, borderColor: "#64b5f6" },

  btnText: { color: "#ebe2e2ff", fontWeight: "800" },
  btnOutlineText: { color: "#64b5f6", fontWeight: "800" },
});
