import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    // replace root with welcome so root path is always matched
    const t = setTimeout(() => router.replace('/welcome'), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Redirecting…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 16 },
});
