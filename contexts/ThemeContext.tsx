// contexts/ThemeContext.tsx - Dark mode management
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    card: string;
    headerBg: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightColors = {
  background: '#FFFFFF',
  surface: '#F6FBFF',
  text: '#2C3E50',
  textSecondary: '#6B7B84',
  border: '#E6EEF6',
  primary: '#2B9AF3',
  success: '#1B9602',
  danger: '#FF4B4B',
  warning: '#FFA500',
  info: '#2B9AF3',
  card: '#FBFCFF',
  headerBg: '#FFFFFF',
};

const darkColors = {
  // Lightened dark palette for improved readability and softer contrast
  background: '#1B1D1E',
  surface: '#232728',
  text: '#ECEFF1',
  textSecondary: '#B7BDC0',
  border: '#31363A',
  primary: '#59A9E6',
  success: '#4CAF50',
  danger: '#FF6B6B',
  warning: '#FFB74D',
  info: '#59A9E6',
  card: '#24292B',
  headerBg: '#181A1B',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme preference from AsyncStorage on app start
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themeMode');
        if (savedTheme) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemePreference();
  }, []);

  const toggleDarkMode = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem('themeMode', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  if (!isLoaded) {
    return null; // or a loading screen
  }

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
