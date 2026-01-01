import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Quiz() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Kuis (placeholder)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
