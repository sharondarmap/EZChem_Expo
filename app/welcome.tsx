import React from 'react';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function Welcome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selamat Datang di Virtual Learning</Text>
      <Text style={styles.subtitle}>
        Platform pembelajaran kimia secara virtual untuk membantu mahasiswa TPB ITB.
      </Text>

      <View style={styles.buttons}>
        <Link href="/pembelajaran" style={styles.btn}><Text style={styles.btnText}>Mulai Belajar</Text></Link>
        <Link href="/quiz" style={styles.btnOutline}><Text style={styles.btnOutlineText}>Uji Kemampuan</Text></Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, justifyContent:'center', alignItems:'center', backgroundColor:'#0f172a' },
  title: { fontSize:28, color:'#64b5f6', fontWeight:'800', marginBottom:12, textAlign:'center' },
  subtitle: { color:'#b0bec5', fontSize:16, marginBottom:20, textAlign:'center', maxWidth:600 },
  buttons: { flexDirection:'row', gap:12 },
  btn: { backgroundColor:'#64b5f6', padding:12, borderRadius:12, marginRight:8 },
  btnText: { color:'#fff', fontWeight:'700' },
  btnOutline: { borderColor:'#64b5f6', borderWidth:1, padding:12, borderRadius:12 },
  btnOutlineText: { color:'#64b5f6', fontWeight:'700' }
});
