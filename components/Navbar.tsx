import { useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors as themeColors } from '../src/constants/theme';
import { getUser, isLoggedIn, logout, onAuthStateChanged } from '../src/services/auth';

export default function Navbar() {
  const router = useRouter();
  const segments = useSegments();
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const logged = await isLoggedIn();
      if (!mounted) return;
      if (logged) {
        const u = await getUser();
        setUserEmail(u?.email || 'User');
      } else setUserEmail(null);
    }
    load();
    const unsub = onAuthStateChanged(load);
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const current = segments && segments.length > 0 ? segments[0] : 'welcome';

  const links = [
    { key: 'welcome', label: 'Beranda', href: '/welcome' },
    { key: 'pembelajaran', label: 'Pembelajaran', href: '/pembelajaran' },
    { key: 'periodic-table', label: 'Tabel Periodik', href: '/periodic-table' },
    { key: 'flashcard', label: 'Flashcard', href: '/flashcard' },
    { key: 'quiz', label: 'Kuis', href: '/quiz' },
    { key: 'games', label: 'Games', href: '/games' },
    { key: 'profile', label: 'Profile', href: '/profile' },
  ];

  return (
    <View style={styles.navbar}>
      <View style={styles.container}>
        <Text style={styles.logo}>Virtual Learning</Text>

        <TouchableOpacity style={styles.toggle} onPress={() => setOpen((s) => !s)}>
          <Text style={styles.toggleText}>☰</Text>
        </TouchableOpacity>

        <View style={[styles.menu, open ? styles.menuOpen : null]}>
          {links.map((l) => {
            const active = current === l.key;
            return (
              <TouchableOpacity
                key={l.key}
                onPress={() => {
                  setOpen(false);
                  // `expo-router` has strict path types; cast to any for dynamic links
                  router.push(l.href as any);
                }}
                style={[
                  styles.link,
                  active ? styles.linkActive : null,
                  open ? styles.linkMobile : null,
                ]}
              >
                <Text style={[styles.linkText, active ? styles.linkTextActive : null]}>{l.label}</Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.authSlot}>
            {userEmail ? (
              <>
                <TouchableOpacity onPress={() => router.push('/(tabs)/profile' as any)} style={styles.link}>
                  <Text style={styles.linkText}>{userEmail.split('@')[0]}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    await logout();
                    router.push('/login' as any);
                  }}
                  style={[styles.logoutBtn]}
                >
                  <Text style={styles.logoutText}>Keluar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={() => router.push('/login' as any)} style={styles.link}>
                <Text style={styles.linkText}>Masuk</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    width: '100%',
    backgroundColor: 'rgba(26,26,46,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    zIndex: 1000,
  },
  container: {
    // full-width container for mobile and web
    width: '100%',
    alignSelf: 'stretch',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    color: themeColors.light.tint,
    fontSize: 18,
    fontWeight: '700',
  },
  toggle: {
    // show hamburger on native platforms; hidden on web by default
    display: Platform.OS === 'web' ? 'none' as any : 'flex',
    padding: 8,
  },
  menuOpen: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(26,26,46,0.98)',
    padding: 12,
    flexDirection: 'column',
    alignItems: 'flex-start',
    zIndex: 2000,
  },
  linkMobile: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginLeft: 0,
    borderRadius: 6,
  },
  toggleText: {
    color: '#e3f2fd',
    fontSize: 20,
  },
  menu: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  link: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  linkText: {
    color: '#fff',
    fontSize: 14,
  },
  linkActive: {
    backgroundColor: 'rgba(100,181,246,0.2)',
  },
  linkTextActive: {
    color: themeColors.light.tint,
  },
  authSlot: {
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutBtn: {
    backgroundColor: '#f44336',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
});