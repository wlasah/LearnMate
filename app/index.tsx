// app/index.tsx (Splash Screen - matches your Figma)
import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen() {
  const router = useRouter();

  // Auto-navigate after 2 seconds (optional)
  useEffect(() => {
    const timer = setTimeout(() => {
      // You can auto-navigate or let user click button
      // router.push('/(auth)/get-started');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo - Replace with your actual logo */}
      <View style={styles.logoContainer}>
        <Ionicons name="book" size={80} color="#4A90E2" />
        <Text style={styles.logoText}>LearnMate</Text>
      </View>

      {/* Continue Button */}
      <TouchableOpacity 
        style={styles.continueButton}
        onPress={() => router.push('/(auth)/get-started' as any)}
      >
        <Ionicons name="arrow-forward" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 100,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    letterSpacing: 1,
  },
  continueButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});