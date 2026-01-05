import { Slot, useSegments } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navbar from '../components/Navbar';

export default function Layout() {
  const segments = useSegments();
  const currentRoute = segments[0];

  // Hide navbar only on auth pages (login and register)
  const hideNavbar = currentRoute === 'login' || currentRoute === 'register';

  return (
    <SafeAreaView style={styles.root}>
      {!hideNavbar && <Navbar />}
      <View style={styles.container}>
        <Slot />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b1020' },
  container: { flex: 1 },
});
