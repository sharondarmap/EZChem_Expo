import { ELEMENTS } from '@/src/data/elements';
import { API } from '@/src/services/api';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface EmptySlot {
  row: number;
  col: number;
  correctAn: number;
  element: (typeof ELEMENTS)[0];
}

type TableLayout = ((typeof ELEMENTS)[0] | null)[][];

export default function PeriodicTableGame() {
  const router = useRouter();
  const [tableLayout, setTableLayout] = useState<TableLayout | null>(null);
  const [emptySlots, setEmptySlots] = useState<EmptySlot[]>([]);
  const [draggableElements, setDraggableElements] = useState<(typeof ELEMENTS)[0][]>([]);
  const [placedElements, setPlacedElements] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    setPlacedElements({});
    setFeedback('');
    setGameComplete(false);
    setSelectedSlot(null);

    // Create 2D layout (7 periods x 18 groups)
    const tableLayout: (typeof ELEMENTS[0] | null)[][] = Array(7)
      .fill(null)
      .map(() => Array(18).fill(null));

    // Place elements in the layout
    ELEMENTS.forEach((el) => {
      let col = el.group - 1;
      let row = el.period - 1;

      if (el.an === 2) {
        col = 17; // Helium in group 18
      } else if (el.period > 2 && el.group <= 2) {
        // Keep groups 1-2 on left
      } else if (el.period > 2 && el.group >= 13) {
        col = el.group - 1;
      }

      if (row < 7 && col < 18) {
        tableLayout[row][col] = el;
      }
    });

    // Select 5 random elements to hide
    const elementsToHide: typeof ELEMENTS = [];
    const availableToHide = ELEMENTS.filter((el) => el.an !== 1 && el.an !== 2);

    while (elementsToHide.length < 5 && availableToHide.length > 0) {
      const idx = Math.floor(Math.random() * availableToHide.length);
      elementsToHide.push(...availableToHide.splice(idx, 1));
    }

    // Create empty slots in tableLayout
    const slots: EmptySlot[] = [];
    elementsToHide.forEach((el) => {
      let row = el.period - 1;
      let col = el.group - 1;

      if (el.an === 2) {
        col = 17;
      } else if (el.period > 2 && el.group >= 13) {
        col = el.group - 1;
      }

      if (row < 7 && col < 18) {
        tableLayout[row][col] = null;
        slots.push({ row, col, correctAn: el.an, element: el });
      }
    });

    setEmptySlots(slots);
    setDraggableElements(elementsToHide.sort(() => Math.random() - 0.5));
    // Store tableLayout in state for rendering
    setTableLayout(tableLayout);
  };

  const handleDropElement = (an: number, slotKey: string) => {
    const slot = emptySlots.find((s) => `${s.row}-${s.col}` === slotKey);
    if (!slot) return;

    if (an === slot.correctAn) {
      setPlacedElements({ ...placedElements, [slotKey]: an });
      setFeedback('✓ Correct!');
      setSelectedSlot(null);
      
      // Check if all slots are filled
      const newPlaced = { ...placedElements, [slotKey]: an };
      if (Object.keys(newPlaced).length === emptySlots.length) {
        setGameComplete(true);
        setFeedback('🎉 You completed the periodic table!');
        
        // Track progress
        API.fetchJSON('/progress/game', {
          method: 'POST',
          body: JSON.stringify({
            game: 'periodic-table-drag-drop',
            metric: 'game_completed',
            value: 1,
          }),
        }).catch(() => {});
      }
    } else {
      setFeedback('✗ Incorrect. Try again!');
    }

    setTimeout(() => {
      setFeedback('');
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

  return (
    <View style={styles.container}>
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

        {/* Feedback */}
        {feedback ? (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        ) : null}

        {/* Grid Card */}
        <View style={styles.gridCard}>
          <Text style={styles.gridTitle}>Fill in the Periodic Table</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            style={styles.horizontalScroll}
          >
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

                        // Empty slot (draggable position)
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
                                  <Text style={styles.cellSymbol}>
                                    {slot.element.symbol}
                                  </Text>
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
                              style={[
                                styles.cell,
                                styles.filledCell,
                                { width: cellSize, height: cellSize },
                              ]}
                            >
                              <Text style={styles.cellSymbol}>{element.symbol}</Text>
                              <Text style={styles.cellName}>{element.an}</Text>
                            </View>
                          );
                        }

                        // Empty space (gap)
                        return (
                          <View
                            key={slotKey}
                            style={[styles.cell, { width: cellSize, height: cellSize }]}
                          />
                        );
                      })}
                  </View>
                ))}
            </View>
          </ScrollView>
          {selectedSlot && (
            <Text style={styles.selectionHint}>
              ✓ Slot selected. Tap an element below to place it.
            </Text>
          )}
        </View>

        {/* Draggable Elements */}
        <View style={styles.dragCard}>
          <Text style={styles.dragTitle}>Elements to Place</Text>
          <Text style={styles.dragSubtitle}>
            {selectedSlot ? 'Tap an element to place it' : 'Tap a cell first, then tap an element'}
          </Text>
          <View style={styles.dragGrid}>
            {draggableElements
              .filter(
                (el) => !Object.values(placedElements).includes(el.an)
              )
              .map((el) => (
                <TouchableOpacity
                  key={el.an}
                  style={[
                    styles.dragElement,
                    !selectedSlot && styles.dragElementDisabled,
                  ]}
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
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  backButton: {
    color: '#64b5f6',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    color: '#64b5f6',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#b0bec5',
    fontSize: 14,
  },
  feedbackBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(100, 181, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(100, 181, 246, 0.3)',
    borderRadius: 8,
  },
  feedbackText: {
    color: '#64b5f6',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  gridCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 16,
  },
  gridTitle: {
    color: '#64b5f6',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  horizontalScroll: {
    marginBottom: 12,
  },
  gridContainer: {
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 2,
  },
  cell: {
    backgroundColor: 'rgba(100, 181, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(100, 181, 246, 0.25)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCell: {
    borderStyle: 'dashed',
    borderColor: 'rgba(100, 181, 246, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  filledCell: {
    backgroundColor: 'rgba(100, 181, 246, 0.22)',
    borderColor: 'rgba(100, 181, 246, 0.4)',
    borderStyle: 'solid',
  },
  cellFilled: {
    backgroundColor: 'rgba(100, 181, 246, 0.22)',
    borderColor: 'rgba(100, 181, 246, 0.4)',
    borderStyle: 'solid',
  },
  cellSymbol: {
    color: '#e6f2ff',
    fontSize: 12,
    fontWeight: '700',
  },
  cellName: {
    color: '#cfd8dc',
    fontSize: 9,
  },
  cellPlaceholder: {
    color: 'rgba(100, 181, 246, 0.5)',
    fontSize: 16,
    fontWeight: '700',
  },
  cellSelected: {
    backgroundColor: 'rgba(100, 181, 246, 0.35)',
    borderColor: '#64b5f6',
    borderWidth: 2,
  },
  selectionHint: {
    color: '#b0bec5',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },
  dragCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 16,
  },
  dragTitle: {
    color: '#64b5f6',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  dragSubtitle: {
    color: '#b0bec5',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  dragGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  dragElement: {
    width: 70,
    height: 70,
    backgroundColor: '#42a5f5',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragElementDisabled: {
    opacity: 0.4,
  },
  dragSymbol: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dragName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  resetButton: {
    marginHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#42a5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});