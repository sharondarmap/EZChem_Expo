import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotFound() {
  const router = useRouter();
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Route not found</Text>
      <Text style={styles.desc}>The page you requested doesn't exist in this build.</Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.replace('/welcome')}>
        <Text style={styles.btnText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  desc: { color: '#ddd', marginTop: 8, textAlign: 'center' },
  btn: { marginTop: 16, backgroundColor: '#2196F3', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: '700' },
});
