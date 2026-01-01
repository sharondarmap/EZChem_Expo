import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getUser } from '../src/services/auth';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    async function load() {
      const u = await getUser();
      if (!mounted) return;
      setUser(u);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.text}>{user ? JSON.stringify(user) : 'Tidak ada user'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  text: { color: '#ddd', marginTop: 8 },
});
