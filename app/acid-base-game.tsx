import { ACIDS, BASES, REACTIONS } from '@/src/data/acids-bases';
import { API } from '@/src/services/api';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const phColors = {
  acid: '#f08080',
  neutral: '#90ee90',
  base: '#87cefa',
};

export default function AcidBaseGame() {
  const router = useRouter();
  const [selectedAcid, setSelectedAcid] = useState<string>('');
  const [selectedBase, setSelectedBase] = useState<string>('');
  const [liquidHeightAnim] = useState(new Animated.Value(80));
  const [resultLiquidAnim, setResultLiquidAnim] = useState(new Animated.Value(0));
  const [resultColor, setResultColor] = useState('#ccc');
  const [resultInfo, setResultInfo] = useState('Mix an acid and a base to see the reaction!');
  const [resultEquation, setResultEquation] = useState('');
  const [resultPH, setResultPH] = useState<number | null>(null);
  const [isMixed, setIsMixed] = useState(false);

  const handleMix = async () => {
    if (!selectedAcid || !selectedBase) {
      setResultInfo('Please select both an acid and a base.');
      return;
    }

    const key = `${selectedAcid}_${selectedBase}`;
    const reaction = REACTIONS[key as keyof typeof REACTIONS];

    if (!reaction) {
      setResultInfo('Combination not supported or no simple neutralization reaction. Please choose another pair.');
      setIsMixed(false);
      return;
    }

    // Animate the result beaker fill
    setIsMixed(false);
    setResultLiquidAnim(new Animated.Value(0));

    setTimeout(() => {
      Animated.timing(resultLiquidAnim, {
        toValue: 100,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      setResultColor(reaction.color);
      setResultInfo(reaction.description);
      setResultEquation(reaction.equation);
      setResultPH(reaction.ph);
      setIsMixed(true);

      // Track game progress
      API.fetchJSON('/progress/game', {
        method: 'POST',
        body: JSON.stringify({
          game: 'acid-base-mixer',
          metric: 'reaction_completed',
          value: 1,
        }),
      }).catch(() => {});
    }, 400);
  };

  const handleReset = () => {
    setSelectedAcid('');
    setSelectedBase('');
    setResultColor('#ccc');
    setResultInfo('Mix an acid and a base to see the reaction!');
    setResultEquation('');
    setResultPH(null);
    setIsMixed(false);
    setResultLiquidAnim(new Animated.Value(0));
  };

  const acid = ACIDS.find((a) => a.id === selectedAcid);
  const base = BASES.find((b) => b.id === selectedBase);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Acid-Base Mixer</Text>
            <Text style={styles.subtitle}>Mix acids and bases to see reactions</Text>
          </View>
        </View>

        {/* Input Card */}
        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Acid</Text>
              <View style={styles.selectWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {ACIDS.map((a) => (
                    <TouchableOpacity
                      key={a.id}
                      style={[
                        styles.selectOption,
                        selectedAcid === a.id && styles.selectOptionActive,
                      ]}
                      onPress={() => setSelectedAcid(a.id)}
                    >
                      <Text
                        style={[
                          styles.selectOptionText,
                          selectedAcid === a.id && styles.selectOptionTextActive,
                        ]}
                      >
                        {a.formula}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Base</Text>
              <View style={styles.selectWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {BASES.map((b) => (
                    <TouchableOpacity
                      key={b.id}
                      style={[
                        styles.selectOption,
                        selectedBase === b.id && styles.selectOptionActive,
                      ]}
                      onPress={() => setSelectedBase(b.id)}
                    >
                      <Text
                        style={[
                          styles.selectOptionText,
                          selectedBase === b.id && styles.selectOptionTextActive,
                        ]}
                      >
                        {b.formula}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.mixButton} onPress={handleMix}>
              <Text style={styles.buttonText}>Mix</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Beakers Card */}
        <View style={styles.beakersCard}>
          {/* Acid Beaker */}
          <View style={styles.beakerSection}>
            {acid && <Text style={styles.beakerLabel}>{acid.formula}</Text>}
            <View style={[styles.beaker, { borderColor: phColors.acid }]}>
              <View style={[styles.liquid, { backgroundColor: phColors.acid, height: '80%' }]} />
            </View>
          </View>

          {/* Plus Sign */}
          <Text style={styles.arrow}>+</Text>

          {/* Base Beaker */}
          <View style={styles.beakerSection}>
            {base && <Text style={styles.beakerLabel}>{base.formula}</Text>}
            <View style={[styles.beaker, { borderColor: phColors.base }]}>
              <View style={[styles.liquid, { backgroundColor: phColors.base, height: '80%' }]} />
            </View>
          </View>

          {/* Arrow */}
          <Text style={styles.arrow}>→</Text>

          {/* Result Beaker */}
          <View style={styles.beakerSection}>
            <Text style={styles.beakerLabel}>Result</Text>
            <View style={[styles.beaker, { borderColor: resultColor }]}>
              <Animated.View
                style={[
                  styles.liquid,
                  {
                    backgroundColor: resultColor,
                    height: resultLiquidAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '80%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Result Info Card */}
        {isMixed && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Reaction Result</Text>
            <Text style={styles.resultDescription}>{resultInfo}</Text>
            {resultEquation && (
              <View style={styles.equationBox}>
                <Text style={styles.equationText}>{resultEquation}</Text>
              </View>
            )}
            {resultPH !== null && (
              <View style={styles.phBox}>
                <Text style={styles.phLabel}>pH: </Text>
                <Text style={styles.phValue}>{resultPH}</Text>
              </View>
            )}
          </View>
        )}
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
  inputCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 16,
  },
  inputRow: {
    marginBottom: 16,
    gap: 12,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: '#e3f2fd',
    fontSize: 14,
    fontWeight: '700',
  },
  selectWrapper: {
    maxHeight: 50,
  },
  selectOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
  },
  selectOptionActive: {
    backgroundColor: 'rgba(100, 181, 246, 0.3)',
    borderColor: 'rgba(100, 181, 246, 0.6)',
  },
  selectOptionText: {
    color: '#e3f2fd',
    fontSize: 13,
    fontWeight: '500',
  },
  selectOptionTextActive: {
    color: '#64b5f6',
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mixButton: {
    flex: 1,
    backgroundColor: '#42a5f5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  beakersCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 16,
  },
  beakerSection: {
    alignItems: 'center',
  },
  beakerLabel: {
    color: '#e3f2fd',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  beaker: {
    width: 70,
    height: 100,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  liquid: {
    width: '100%',
  },
  arrow: {
    color: '#64b5f6',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  resultCard: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 16,
  },
  resultTitle: {
    color: '#64b5f6',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  resultDescription: {
    color: '#e3f2fd',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  equationBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  equationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  phBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  phLabel: {
    color: '#b0bec5',
    fontSize: 13,
    fontWeight: '600',
  },
  phValue: {
    backgroundColor: 'rgba(100, 181, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(100, 181, 246, 0.4)',
    color: '#64b5f6',
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
});
