import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { login } from '../src/services/auth';

export default function Login() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password');
  const router = useRouter();

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Masuk (placeholder)</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#888" />
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#888" secureTextEntry />
      <TouchableOpacity
        style={styles.btn}
        onPress={async () => {
          await login(email, password);
          router.push('/welcome');
        }}
      >
        <Text style={styles.btnText}>Masuk (demo)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { width: '100%', backgroundColor: '#fff', padding: 10, borderRadius: 6, marginTop: 8 },
  btn: { marginTop: 16, backgroundColor: '#2196F3', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: '700' },
});
