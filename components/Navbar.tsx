import { useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
      </View>

      {open && (
        <View style={styles.dropdownMenu}>
          {links.map((l) => {
            const active = current === l.key;
            return (
              <TouchableOpacity
                key={l.key}
                onPress={() => {
                  setOpen(false);
                  router.push(l.href as any);
                }}
                style={[
                  styles.dropdownLink,
                  active ? styles.dropdownLinkActive : null,
                ]}
              >
                <Text style={[styles.dropdownLinkText, active ? styles.dropdownLinkTextActive : null]}>{l.label}</Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.dropdownDivider} />

          <View style={styles.authSlot}>
            {userEmail ? (
              <>
                <TouchableOpacity onPress={() => router.push('/profile' as any)} style={styles.dropdownLink}>
                  <Text style={styles.dropdownLinkText}>{userEmail.split('@')[0]}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    await logout();
                    setOpen(false);
                    router.push('/login' as any);
                  }}
                  style={styles.dropdownLogoutBtn}
                >
                  <Text style={styles.dropdownLogoutText}>Keluar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={() => router.push('/login' as any)} style={styles.dropdownLink}>
                <Text style={styles.dropdownLinkText}>Masuk</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
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
    padding: 8,
  },
  toggleText: {
    color: '#e3f2fd',
    fontSize: 24,
  },

  // Dropdown menu styles
  dropdownMenu: {
    position: 'absolute',
    top: 56,
    right: 0,
    left: 0,
    backgroundColor: 'rgba(26,26,46,0.98)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    zIndex: 999,
  },
  dropdownLink: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dropdownLinkActive: {
    backgroundColor: 'rgba(100,181,246,0.15)',
  },
  dropdownLinkText: {
    color: '#e3f2fd',
    fontSize: 15,
  },
  dropdownLinkTextActive: {
    color: themeColors.light.tint,
    fontWeight: '600',
  },

  dropdownDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 8,
  },

  authSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  dropdownLogoutBtn: {
    backgroundColor: '#f44336',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  dropdownLogoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});