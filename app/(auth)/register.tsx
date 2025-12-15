// app/(auth)/register.tsx (Sign Up Screen - Professional Compact Design)
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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
  const [generalError, setGeneralError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  // Email validation regex
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Convert Firebase errors to user-friendly messages
  const getErrorMessage = (error: string | undefined): { field: 'email' | 'password' | 'general', message: string } => {
    if (!error) return { field: 'general', message: 'Account creation failed. Please try again.' };
    
    const errorLower = error.toLowerCase();
    
    // Email already in use
    if (errorLower.includes('email-already-in-use') || errorLower.includes('already exists')) {
      return { field: 'email', message: 'This email is already registered. Please sign in or use a different email.' };
    }
    
    // Weak password
    if (errorLower.includes('weak-password')) {
      return { field: 'password', message: 'Password is too weak. Use at least 8 characters with letters, numbers, and symbols.' };
    }
    
    // Invalid email format
    if (errorLower.includes('invalid-email')) {
      return { field: 'email', message: 'Please enter a valid email address.' };
    }
    
    // Network errors
    if (errorLower.includes('network') || errorLower.includes('failed to fetch')) {
      return { field: 'general', message: 'Network error. Please check your connection and try again.' };
    }
    
    // Too many requests
    if (errorLower.includes('too-many-requests')) {
      return { field: 'general', message: 'Too many signup attempts. Please try again later.' };
    }
    
    // Fallback
    return { field: 'general', message: 'Account creation failed. Please try again.' };
  };

  // Password strength check
  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, text: '', color: '' };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    if (strength <= 1) return { level: 1, text: 'Weak', color: '#FF4B4B' };
    if (strength <= 2) return { level: 2, text: 'Fair', color: '#FF9800' };
    if (strength <= 3) return { level: 3, text: 'Good', color: '#FFD700' };
    if (strength <= 4) return { level: 4, text: 'Strong', color: '#4CAF50' };
    return { level: 5, text: 'Very Strong', color: '#2FB46E' };
  };

  // Validate email on change
  const handleEmailChange = (text: string) => {
    setEmail(text);
    setGeneralError('');
    
    if (!attempted) return;
    
    if (text.length === 0) {
      setEmailError('');
    } else if (!isValidEmail(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  // Validate password on change
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setGeneralError('');
    
    if (!attempted) return;
    
    if (text.length === 0) {
      setPasswordError('');
    } else if (text.length < 6) {
      setPasswordError('Password must be at least 6 characters');
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

  // Validate confirm password on change
  const handleConfirmChange = (text: string) => {
    setConfirmPassword(text);
    setGeneralError('');
    
    if (!attempted) return;
    
    if (text.length === 0) {
      setConfirmError('');
    } else if (password !== text) {
      setConfirmError('Passwords do not match');
    } else {
      setConfirmError('');
    }
  };

  const validateInputs = () => {
    let isValid = true;

    // Validate email
    if (!email.trim()) {
      setEmailError('Email address is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmError('');
    }

    return isValid;
  };

  const handleSignUp = async () => {
    setAttempted(true);
    setGeneralError('');
    
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    const result = await register(email, password);
    setLoading(false);
    
    if (result.success) {
      router.replace('/(tabs)');
    } else {
      // Get professional error message
      const { field, message } = getErrorMessage(result.error);
      
      if (field === 'email') {
        setEmailError(message);
      } else if (field === 'password') {
        setPasswordError(message);
      } else {
        setGeneralError(message);
      }
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
            {/* General Error Alert */}
            {generalError ? (
              <View style={[styles.errorAlert, { backgroundColor: '#FF4B4B20', borderColor: '#FF4B4B' }]}>
                <Ionicons name="alert-circle" size={18} color="#FF4B4B" style={{ marginRight: 8 }} />
                <Text style={[styles.errorAlertText, { color: '#FF4B4B' }]}>
                  {generalError}
                </Text>
              </View>
            ) : null}

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
                {password && <Text style={[styles.strengthLabel, { color: getPasswordStrength(password).color }]}>
                  {getPasswordStrength(password).text}
                </Text>}
              </View>
              {passwordError && <Text style={styles.errorLabel}>{passwordError}</Text>}
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
              {password && (
                <View style={styles.strengthIndicator}>
                  {[1, 2, 3, 4, 5].map((index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor: index <= getPasswordStrength(password).level ? getPasswordStrength(password).color : colors.border,
                        }
                      ]} 
                    />
                  ))}
                </View>
              )}
              {!passwordError && <Text style={[styles.hint, { color: colors.textSecondary }]}>Use 8+ characters with mix of letters, numbers, and symbols</Text>}
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
    marginBottom: 16,
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
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  hint: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 6,
    marginLeft: 5,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  errorAlertText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
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
  strengthIndicator: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    marginLeft: 5,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
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
