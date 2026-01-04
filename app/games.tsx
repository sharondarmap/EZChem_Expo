import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Games() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pembelajaran Games</Text>
          <Text style={styles.subtitle}>
            Play interactive games to strengthen chemistry concepts.
          </Text>
        </View>

        {/* Games Grid */}
        <View style={styles.gamesGrid}>
          {/* Periodic Table Game */}
          <View style={styles.gameCard}>
            <View style={styles.gameCardHeader}>
              <Text style={styles.gameCardTitle1}>Game 1</Text>
              <Text style={styles.gameCardTitle2}>Periodic Table</Text>
              <Text style={styles.gameCardTitle3}>Drag & Drop</Text>
              <Text style={styles.gameCardDescription}>
                Complete the periodic table by dragging elements to their correct positions.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.gameButton}
              onPress={() => router.push('/periodic-table-game')}
            >
              <Text style={styles.gameButtonText}>Start Game</Text>
            </TouchableOpacity>
          </View>

          {/* Acid-Base Game */}
          <View style={styles.gameCard}>
            <View style={styles.gameCardHeader}>
              <Text style={styles.gameCardTitle1}>Game 2</Text>
              <Text style={styles.gameCardTitle2}>Acid-Base</Text>
              <Text style={styles.gameCardTitle3}>Mixer</Text>
              <Text style={styles.gameCardDescription}>
                Mix acids and bases to see neutralization reactions and chemical equations.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.gameButton}
              onPress={() => router.push('/acid-base-game')}
            >
              <Text style={styles.gameButtonText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    color: '#64b5f6',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#b0bec5',
    fontSize: 14,
    textAlign: 'center',
  },
  gamesGrid: {
    paddingHorizontal: 16,
    gap: 20,
  },
  gameCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  gameCardHeader: {
    gap: 8,
  },
  gameCardTitle1: {
    color: '#64b5f6',
    fontSize: 13,
    fontWeight: '600',
  },
  gameCardTitle2: {
    color: '#64b5f6',
    fontSize: 18,
    fontWeight: '700',
  },
  gameCardTitle3: {
    color: '#64b5f6',
    fontSize: 16,
    fontWeight: '700',
  },
  gameCardDescription: {
    color: '#b0bec5',
    fontSize: 14,
    lineHeight: 20,
  },
  gameButton: {
    backgroundColor: '#42a5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  gameButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
