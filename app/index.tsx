// app/index.tsx (Splash Screen - matches your screenshot)
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function SplashScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { width, height } = Dimensions.get('window');
const baseWidth = Math.min(width, 450);

const logoWidth = baseWidth * 0.75;     // bigger
const logoHeight = logoWidth * 0.55;

const titleWidth = baseWidth * 0.55;     // bigger
const titleHeight = titleWidth * 0.32;


  // Auto-navigate after 2 seconds (optional)
  useEffect(() => {
    const timer = setTimeout(() => {
      // You can auto-navigate or let user click button
      // router.push('/(auth)/get-started');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Logo - centered */}
      <View style={styles.logoContainer}>
        <Image
  source={require('../assets/images/LearnMate_logo.png')}
  style={[styles.logoImage, { opacity: isDarkMode ? 1.0 : 1 }]}
/>

<View style={{ position: 'relative' }}>
  <Image
    source={require('../assets/images/title_logo.png')}
    style={[styles.logoTitleImage, { opacity: isDarkMode ? 1.0 : 1, zIndex: 1 }]}
  />
        {isDarkMode && (
          <View style={{ position: 'absolute', zIndex: 2, flexDirection: 'row' }}>
            <Text style={styles.learnText}>Learn</Text>
            <Text style={styles.mateText}>Mate</Text>
          </View>
        )}
</View>

      </View>

      {/* Continue Button - bottom right */}
      <TouchableOpacity 
        style={[styles.continueButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(auth)/get-started')}
      >
        <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    resizeMode: 'contain',
    marginRight: -75,
    marginTop: -90,
    width: 200, 
    height: 600 
  },
  logoTitleImage: {
    resizeMode: 'contain',
    marginRight: 30,
    width: 200,
    height: 250
  },
  titleLogoText: {
    position: 'absolute',
    fontWeight: '500',
    fontSize: 25,
    zIndex: 2,
    top: 80,
    left: 34,
  },
  learnText: {
    fontWeight: '900',
    fontSize: 24,
    color: '#20B2AA',
    top: 83,
    left: 35,
  },
  mateText: {
    fontWeight: '900',
    fontSize: 24,
    color: '#90EE90',
    zIndex: 0,
    top: 83,
    left: 33,
   
  },
  continueButton: {
    position: 'absolute',
    bottom: 48,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#87CEEB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});