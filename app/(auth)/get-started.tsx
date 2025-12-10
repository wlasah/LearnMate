import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function GetStarted() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get Started</Text>
      <Text style={styles.subtitle}>Welcome to LearnMate — get started by signing in or registering.</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/login' as any)}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#4A90E2', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
