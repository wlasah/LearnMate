// app/(auth)/register.tsx (Sign Up Screen - Professional Compact Design)
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  // Email validation regex
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate email on change (only if user attempted submit)
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (!attempted) return; // Don't show errors until user attempts submit
    
    if (text.length === 0) {
      setEmailError('');
    } else if (!isValidEmail(text)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  // Validate password on change (only if user attempted submit)
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (!attempted) return; // Don't show errors until user attempts submit
    
    if (text.length === 0) {
      setPasswordError('');
    } else if (text.length < 6) {
      setPasswordError('At least 6 characters');
    } else {
      setPasswordError('');
    }
    // Check if it matches confirm password
    if (confirmPassword && text !== confirmPassword) {
      setConfirmError('Passwords do not match');
    } else if (confirmPassword) {
      setConfirmError('');
    }
  };

  // Validate confirm password on change (only if user attempted submit)
  const handleConfirmChange = (text: string) => {
    setConfirmPassword(text);
    if (!attempted) return; // Don't show errors until user attempts submit
    
    if (text.length === 0) {
      setConfirmError('');
    } else if (password !== text) {
      setConfirmError('Passwords do not match');
    } else {
      setConfirmError('');
    }
  };

  const handleSignUp = async () => {
    setAttempted(true);
    
    // Validate email
    if (!email) {
      setEmailError('Email is required');
      Alert.alert('Validation Error', 'Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Invalid email format');
      Alert.alert('Invalid Email', 'Please enter a valid email (e.g., user@example.com)');
      return;
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      Alert.alert('Validation Error', 'Please enter a password');
      return;
    }

    if (password.length < 6) {
      setPasswordError('At least 6 characters');
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmError('Please confirm your password');
      Alert.alert('Validation Error', 'Please confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      Alert.alert('Password Mismatch', 'Your passwords do not match');
      return;
    }

    setLoading(true);
    const result = await register(email, password);
    setLoading(false);
    if (result.success) {
      Alert.alert('Success', 'Account created successfully!');
      router.replace('/(tabs)');
    } else {
      setEmailError('');
      setPasswordError('');
      setConfirmError('');
      setAttempted(false);
      Alert.alert('Sign Up Failed', result.error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo Section (use PNGs like splash) */}
          <View style={styles.logoSection}>
            <Image
              source={require('../../assets/images/LearnMate_logo.png')}
              style={[styles.logoImage, { opacity: isDarkMode ? 1.0 : 1 }]}
            />
            <View style={{ position: 'relative' }}>
              <Image
                source={require('../../assets/images/title_logo.png')}
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

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Start your learning journey</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
                {emailError ? <Text style={styles.errorLabel}>{emailError}</Text> : null}
              </View>
              <View style={[
                styles.inputContainer, 
                { 
                  backgroundColor: colors.surface, 
                  borderColor: emailError ? '#FF4B4B' : colors.border,
                  borderWidth: emailError ? 2 : 1,
                }
              ]}>
                <Ionicons name="mail" size={18} color={emailError ? '#FF4B4B' : colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={handleEmailChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  placeholderTextColor={colors.textSecondary}
                />
                {email && !emailError && (
                  <Ionicons name="checkmark-circle" size={18} color="#2FB46E" />
                )}
                {emailError && (
                  <Ionicons name="close-circle" size={18} color="#FF4B4B" />
                )}
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
                {passwordError ? <Text style={styles.errorLabel}>{passwordError}</Text> : null}
              </View>
              <View style={[
                styles.inputContainer, 
                { 
                  backgroundColor: colors.surface, 
                  borderColor: passwordError ? '#FF4B4B' : colors.border,
                  borderWidth: passwordError ? 2 : 1,
                }
              ]}>
                <Ionicons name="lock-closed" size={18} color={passwordError ? '#FF4B4B' : colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={loading}>
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={18} 
                    color={passwordError ? '#FF4B4B' : colors.primary}
                  />
                </TouchableOpacity>
              </View>
              {!passwordError && <Text style={[styles.hint, { color: colors.textSecondary }]}>At least 6 characters</Text>}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Confirm Password</Text>
                {confirmError ? <Text style={styles.errorLabel}>{confirmError}</Text> : null}
              </View>
              <View style={[
                styles.inputContainer, 
                { 
                  backgroundColor: colors.surface, 
                  borderColor: confirmError ? '#FF4B4B' : colors.border,
                  borderWidth: confirmError ? 2 : 1,
                }
              ]}>
                <Ionicons name="lock-closed" size={18} color={confirmError ? '#FF4B4B' : colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={handleConfirmChange}
                  secureTextEntry={!showConfirm}
                  editable={!loading}
                  placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} disabled={loading}>
                  <Ionicons 
                    name={showConfirm ? "eye-off" : "eye"} 
                    size={18} 
                    color={confirmError ? '#FF4B4B' : colors.primary}
                  />
                </TouchableOpacity>
              </View>
              {password && confirmPassword && !confirmError && (
                <Text style={[styles.hint, { color: '#2FB46E' }]}>✓ Passwords match</Text>
              )}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity 
              style={[styles.signUpButton, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]} 
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.signUpButtonText}>Creating account...</Text>
              ) : (
                <Text style={styles.signUpButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={[styles.signInText, { color: colors.textSecondary }]}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)} disabled={loading}>
                <Text style={[styles.signInLink, { color: colors.primary }]}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoImage: {
    resizeMode: 'contain',
    width: 350,
    height: 185,    
    marginRight: -130,
    marginTop: -110,
    marginBottom: -27,
  },
  logoTitleImage: {
    resizeMode: 'contain',
    width: 300,
    height: 170,
    marginRight: 50,
    marginLeft: -90,
  },
  titleLogoText: {
    position: 'absolute',
    fontWeight: '900',
    fontSize: 18,
    zIndex: 0,
    top: 45,
    left: 0,
  },
  learnText: {
    fontWeight: '900',
    fontSize: 24,
    color: '#90EE90',
    top: 47,
    left: 5.6,
    letterSpacing: -0.6,
  },
  mateText: {
    fontWeight: '900',
    fontSize: 24,
    color: '#20B2AA',
    top: 47,
    left: 5,
  },
  header: {
    marginBottom: 15,
  
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: -40,
  },
  subtitle: {
    fontSize: 12,

    fontWeight: '500',
    marginTop: -10,
    marginBottom: 35, 
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 3,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 0,
  },
  errorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF4B4B',
  },
  hint: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6FBFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E6EEF6',
    height: 40,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
  },
  signUpButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signInText: {
    fontSize: 13,
    fontWeight: '500',
  },
  signInLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
