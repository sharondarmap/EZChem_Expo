// app/periodic-table-game.tsx
import { ELEMENTS } from "@/src/data/elements";
import { reportGameProgress } from "@/src/services/progress";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface EmptySlot {
  row: number;
  col: number;
  correctAn: number;
  element: (typeof ELEMENTS)[0];
}

type TableLayout = ((typeof ELEMENTS)[0] | null)[][];

type FeedbackType = "info" | "success" | "error";

export default function PeriodicTableGame() {
  const router = useRouter();

  const [tableLayout, setTableLayout] = useState<TableLayout | null>(null);
  const [emptySlots, setEmptySlots] = useState<EmptySlot[]>([]);
  const [draggableElements, setDraggableElements] = useState<(typeof ELEMENTS)[0][]>([]);
  const [placedElements, setPlacedElements] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("info");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [gameComplete, setGameComplete] = useState(false);

  // ✅ popup completion
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // ✅ guard supaya report completion cuma sekali per “run”
  const [reportedCompletion, setReportedCompletion] = useState(false);

  // ===== Feedback animation (untuk correct/incorrect) =====
  const shakeX = useRef(new Animated.Value(0)).current; // error shake
  const pop = useRef(new Animated.Value(0)).current; // success pop

  const runShake = () => {
    shakeX.setValue(0);
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const runPop = () => {
    pop.stopAnimation();
    pop.setValue(0);
    Animated.sequence([
      Animated.timing(pop, { toValue: 1, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(pop, { toValue: 0, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    if (!feedback) return;

    if (feedbackType === "error") runShake();
    if (feedbackType === "success") runPop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackType, feedback]);

  useEffect(() => {
    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeGame = () => {
    setPlacedElements({});
    setFeedback("");
    setFeedbackType("info");
    setGameComplete(false);
    setSelectedSlot(null);
    setReportedCompletion(false);
    setShowCompleteModal(false);

    // Create 2D layout (7 periods x 18 groups)
    const layout: (typeof ELEMENTS[0] | null)[][] = Array(7)
      .fill(null)
      .map(() => Array(18).fill(null));

    // Place elements in the layout
    ELEMENTS.forEach((el) => {
      let col = el.group - 1;
      const row = el.period - 1;

      if (el.an === 2) {
        col = 17; // Helium in group 18
      } else if (el.period > 2 && el.group <= 2) {
        // Keep groups 1-2 on left
      } else if (el.period > 2 && el.group >= 13) {
        col = el.group - 1;
      }

      if (row < 7 && col < 18) {
        layout[row][col] = el;
      }
    });

    // Select 5 random elements to hide
    const elementsToHide: typeof ELEMENTS = [];
    const availableToHide = ELEMENTS.filter((el) => el.an !== 1 && el.an !== 2);

    while (elementsToHide.length < 5 && availableToHide.length > 0) {
      const idx = Math.floor(Math.random() * availableToHide.length);
      elementsToHide.push(...availableToHide.splice(idx, 1));
    }

    // Create empty slots in layout
    const slots: EmptySlot[] = [];
    elementsToHide.forEach((el) => {
      const row = el.period - 1;
      let col = el.group - 1;

      if (el.an === 2) {
        col = 17;
      } else if (el.period > 2 && el.group >= 13) {
        col = el.group - 1;
      }

      if (row < 7 && col < 18) {
        layout[row][col] = null;
        slots.push({ row, col, correctAn: el.an, element: el });
      }
    });

    setEmptySlots(slots);
    setDraggableElements(elementsToHide.sort(() => Math.random() - 0.5));
    setTableLayout(layout);
  };

  const maybeReportCompletion = async () => {
    if (reportedCompletion) return;

    try {
      setReportedCompletion(true);
      await reportGameProgress("periodic-table", "completed", 1);
    } catch {
      setReportedCompletion(false);
    }
  };

  const handleDropElement = (an: number, slotKey: string) => {
    const slot = emptySlots.find((s) => `${s.row}-${s.col}` === slotKey);
    if (!slot) return;

    if (an === slot.correctAn) {
      const newPlaced = { ...placedElements, [slotKey]: an };
      setPlacedElements(newPlaced);

      setFeedback("✓ Correct!");
      setFeedbackType("success");
      setSelectedSlot(null);

      // Check if all slots are filled
      if (Object.keys(newPlaced).length === emptySlots.length) {
        setGameComplete(true);
        setShowCompleteModal(true);
        void maybeReportCompletion();

        // optional: bersihin feedback biar ga tabrakan sama popup
        setTimeout(() => {
          setFeedback("");
          setFeedbackType("info");
        }, 400);
        return;
      }
    } else {
      setFeedback("✗ Incorrect. Try again!");
      setFeedbackType("error");
    }

    setTimeout(() => {
      setFeedback("");
      setFeedbackType("info");
    }, 1500);
  };

  const handleSelectSlot = (slotKey: string) => {
    if (!placedElements[slotKey]) {
      setSelectedSlot(selectedSlot === slotKey ? null : slotKey);
    }
  };

  const handlePlaceElement = (an: number) => {
    if (selectedSlot) {
      handleDropElement(an, selectedSlot);
    }
  };

  const cellSize = 56;

  const remainingElements = useMemo(() => {
    const placed = new Set(Object.values(placedElements));
    return draggableElements.filter((el) => !placed.has(el.an));
  }, [draggableElements, placedElements]);

  // feedback animated style
  const shakeTranslate = shakeX.interpolate({
    inputRange: [-1, 1],
    outputRange: [-8, 8],
  });

  const popScale = pop.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  return (
    <View style={styles.container}>
      {/* ✅ Completion Popup */}
      <Modal
        visible={showCompleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCompleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              onPress={() => setShowCompleteModal(false)}
              style={styles.modalClose}
              accessibilityLabel="Close"
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>🎉 You completed the periodic table!</Text>
            <Text style={styles.modalSub}>
              {reportedCompletion ? "✅ Progress tersimpan." : "Menyimpan progress..."}
            </Text>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Periodic Table</Text>
            <Text style={styles.subtitle}>Drag & Drop</Text>
          </View>
        </View>

        {/* Feedback (colored + shake/pop) */}
        {feedback ? (
          <Animated.View
            style={[
              styles.feedbackBox,
              feedbackType === "success" && styles.feedbackSuccess,
              feedbackType === "error" && styles.feedbackError,
              {
                transform: [
                  { translateX: feedbackType === "error" ? shakeTranslate : 0 },
                  { scale: feedbackType === "success" ? popScale : 1 },
                ],
              },
            ]}
          >
            <Text
              style={[
                styles.feedbackText,
                feedbackType === "success" && styles.feedbackTextSuccess,
                feedbackType === "error" && styles.feedbackTextError,
              ]}
            >
              {feedback}
            </Text>
          </Animated.View>
        ) : null}

        {/* Grid Card */}
        <View style={styles.gridCard}>
          <Text style={styles.gridTitle}>Fill in the Periodic Table</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator style={styles.horizontalScroll}>
            <View style={styles.gridContainer}>
              {Array(7)
                .fill(null)
                .map((_, r) => (
                  <View key={`row-${r}`} style={styles.row}>
                    {Array(18)
                      .fill(null)
                      .map((_, c) => {
                        const slotKey = `${r}-${c}`;
                        const element = tableLayout?.[r]?.[c];
                        const slot = emptySlots.find((s) => s.row === r && s.col === c);
                        const isPlaced = placedElements[slotKey];
                        const isSelected = selectedSlot === slotKey;

                        // Empty slot (clickable position)
                        if (slot) {
                          return (
                            <TouchableOpacity
                              key={slotKey}
                              onPress={() => handleSelectSlot(slotKey)}
                              style={[
                                styles.cell,
                                styles.emptyCell,
                                isPlaced ? styles.cellFilled : null,
                                isSelected && !isPlaced ? styles.cellSelected : null,
                                { width: cellSize, height: cellSize },
                              ]}
                            >
                              {isPlaced ? (
                                <>
                                  <Text style={styles.cellSymbol}>{slot.element.symbol}</Text>
                                  <Text style={styles.cellName}>{slot.element.an}</Text>
                                </>
                              ) : (
                                <Text style={styles.cellPlaceholder}>?</Text>
                              )}
                            </TouchableOpacity>
                          );
                        }

                        // Filled element
                        if (element) {
                          return (
                            <View
                              key={slotKey}
                              style={[styles.cell, styles.filledCell, { width: cellSize, height: cellSize }]}
                            >
                              <Text style={styles.cellSymbol}>{element.symbol}</Text>
                              <Text style={styles.cellName}>{element.an}</Text>
                            </View>
                          );
                        }

                        // Empty space (gap)
                        return <View key={slotKey} style={[styles.cell, { width: cellSize, height: cellSize }]} />;
                      })}
                  </View>
                ))}
            </View>
          </ScrollView>

          {selectedSlot && (
            <Text style={styles.selectionHint}>✓ Slot selected. Tap an element below to place it.</Text>
          )}

          {/* (optional) hint non-popup */}
          {gameComplete ? (
            <Text style={styles.selectionHint}>🏁 Selesai! Kamu bisa klik New Game kapan saja.</Text>
          ) : null}
        </View>

        {/* Draggable Elements */}
        <View style={styles.dragCard}>
          <Text style={styles.dragTitle}>Elements to Place</Text>
          <Text style={styles.dragSubtitle}>
            {selectedSlot ? "Tap an element to place it" : "Tap a cell first, then tap an element"}
          </Text>

          <View style={styles.dragGrid}>
            {remainingElements.map((el) => (
              <TouchableOpacity
                key={el.an}
                style={[styles.dragElement, !selectedSlot && styles.dragElementDisabled]}
                onPress={() => handlePlaceElement(el.an)}
                disabled={!selectedSlot}
              >
                <Text style={styles.dragSymbol}>{el.symbol}</Text>
                <Text style={styles.dragName}>{el.an}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity style={styles.resetButton} onPress={initializeGame}>
          <Text style={styles.resetButtonText}>New Game</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f1419" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  backButton: { color: "#64b5f6", fontSize: 16, fontWeight: "600", marginTop: 4 },
  headerTitle: { flex: 1 },
  title: { color: "#64b5f6", fontSize: 24, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: "#b0bec5", fontSize: 14 },

  // ===== Completion modal =====
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(15, 20, 25, 0.98)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.35)",
    padding: 16,
  },
  modalClose: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: { color: "#e3f2fd", fontWeight: "900", fontSize: 14 },
  modalTitle: {
    color: "#FFE082",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 6,
  },
  modalSub: {
    color: "#b0bec5",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "700",
  },
  modalHint: {
    color: "#b0bec5",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 18,
  },
  modalHintStrong: { color: "#64b5f6", fontWeight: "900" },

  // ===== Feedback (untuk correct/incorrect) =====
  feedbackBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackText: { color: "#e3f2fd", fontSize: 14, fontWeight: "700", textAlign: "center" },

  feedbackSuccess: {
    backgroundColor: "rgba(76, 175, 80, 0.16)",
    borderColor: "rgba(76, 175, 80, 0.45)",
  },
  feedbackTextSuccess: { color: "#7CFF8A" },

  feedbackError: {
    backgroundColor: "rgba(244, 67, 54, 0.16)",
    borderColor: "rgba(244, 67, 54, 0.45)",
  },
  feedbackTextError: { color: "#FF8A80" },

  gridCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 16,
    padding: 16,
  },
  gridTitle: { color: "#64b5f6", fontSize: 16, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  horizontalScroll: { marginBottom: 12 },
  gridContainer: { gap: 2 },
  row: { flexDirection: "row", gap: 2 },

  cell: {
    backgroundColor: "rgba(100, 181, 246, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(100, 181, 246, 0.25)",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCell: {
    borderStyle: "dashed",
    borderColor: "rgba(100, 181, 246, 0.45)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  filledCell: {
    backgroundColor: "rgba(100, 181, 246, 0.22)",
    borderColor: "rgba(100, 181, 246, 0.4)",
    borderStyle: "solid",
  },
  cellFilled: {
    backgroundColor: "rgba(100, 181, 246, 0.22)",
    borderColor: "rgba(100, 181, 246, 0.4)",
    borderStyle: "solid",
  },
  cellSymbol: { color: "#e6f2ff", fontSize: 12, fontWeight: "700" },
  cellName: { color: "#cfd8dc", fontSize: 9 },
  cellPlaceholder: { color: "rgba(100, 181, 246, 0.5)", fontSize: 16, fontWeight: "700" },
  cellSelected: { backgroundColor: "rgba(100, 181, 246, 0.35)", borderColor: "#64b5f6", borderWidth: 2 },

  selectionHint: {
    color: "#b0bec5",
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 12,
    textAlign: "center",
  },

  dragCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 16,
    padding: 16,
  },
  dragTitle: { color: "#64b5f6", fontSize: 16, fontWeight: "700", marginBottom: 4, textAlign: "center" },
  dragSubtitle: { color: "#b0bec5", fontSize: 12, marginBottom: 12, textAlign: "center" },

  dragGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  dragElement: {
    width: 70,
    height: 70,
    backgroundColor: "#42a5f5",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  dragElementDisabled: { opacity: 0.4 },
  dragSymbol: { color: "#fff", fontSize: 16, fontWeight: "700" },
  dragName: { color: "#fff", fontSize: 11, fontWeight: "600" },

  resetButton: {
    marginHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#42a5f5",
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
