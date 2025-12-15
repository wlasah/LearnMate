// app/(auth)/login.tsx (Sign In Screen - Professional Compact Design)
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  // Email validation regex
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Convert Firebase errors to user-friendly messages
  const getErrorMessage = (error: string | undefined): { field: 'email' | 'password' | 'general', message: string } => {
    if (!error) return { field: 'general', message: 'Sign in failed. Please try again.' };
    
    const errorLower = error.toLowerCase();
    
    // Invalid credentials (wrong password)
    if (errorLower.includes('invalid-credential') || errorLower.includes('wrong-password')) {
      return { field: 'general', message: 'Incorrect email or password. Please try again.' };
    }
    
    // User not found
    if (errorLower.includes('user-not-found')) {
      return { field: 'general', message: 'No account found with this email. Would you like to sign up instead?' };
    }
    
    // Invalid email format
    if (errorLower.includes('invalid-email')) {
      return { field: 'email', message: 'Please enter a valid email address.' };
    }
    
    // Too many requests
    if (errorLower.includes('too-many-requests')) {
      return { field: 'general', message: 'Too many login attempts. Please try again in a few minutes.' };
    }
    
    // Network errors
    if (errorLower.includes('network') || errorLower.includes('failed to fetch')) {
      return { field: 'general', message: 'Network error. Please check your connection and try again.' };
    }
    
    // User disabled
    if (errorLower.includes('user-disabled')) {
      return { field: 'general', message: 'This account has been disabled. Please contact support.' };
    }
    
    // Fallback - clean up Firebase error message
    return { field: 'general', message: 'Sign in failed. Please check your credentials and try again.' };
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

    return isValid;
  };

  const handleLogin = async () => {
    setAttempted(true);
    setGeneralError('');
    
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    const result = await login(email, password);
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
              style={[styles.logoImage, { opacity: isDarkMode ? 1.2 : 1 }]}
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
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue learning</Text>
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
              <View style={styles.passwordHeader}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
                <TouchableOpacity onPress={() => router.push('/notes' as any)} disabled={loading}>
                  <Text style={[styles.forgotLink, { color: colors.primary }]}>Forgot?</Text>
                </TouchableOpacity>
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
            </View>

            {/* Sign In Button */}
            <TouchableOpacity 
              style={[styles.signInButton, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.signInButtonText}>Signing in...</Text>
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={[styles.signUpText, { color: colors.textSecondary }]}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)} disabled={loading}>
                <Text style={[styles.signUpLink, { color: colors.primary }]}>Sign up</Text>
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
    marginLeft: -100,
  },
  learnText: {
    fontWeight: '900',
    fontSize:24,
    color: '#90EE90',
    top: 47,
    left: -4.2,
    letterSpacing: -0.3,
  },
  mateText: {
    fontWeight: '900',
    fontSize: 22,
    color: '#20B2AA',
    top: 50,
    left: -4,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: -10,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: -10,
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorAlertText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  inputWrapper: {
    marginBottom: 10,
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
    marginBottom: 4,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  signInButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpText: {
    fontSize: 13,
    fontWeight: '500',
  },
  signUpLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
