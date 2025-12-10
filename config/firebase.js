// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3dgHSn4A8llfvHCkh4INL5RUfqUX_ixk",
  authDomain: "learnmate-6fe29.firebaseapp.com",
  projectId: "learnmate-6fe29",
  // Use the default storage bucket hostname (usually PROJECT_ID.appspot.com)
  storageBucket: "learnmate-6fe29.appspot.com",
  messagingSenderId: "1074802551136",
  appId: "1:1074802551136:web:5c3443dbe96d4f0bef1605",
  measurementId: "G-MN383ZEN71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only when running in a browser environment
let analytics;
try {
  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (e) {
  // ignore analytics initialization errors in non-browser environments
}

// Initialize Auth with React Native persistence when running in React Native
let auth;
try {
  if (typeof document === 'undefined') {
    // React Native environment (no document) — initialize with AsyncStorage persistence
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } else {
    // Web environment
    auth = getAuth(app);
  }
} catch (e) {
  // Fallback to getAuth if initializeAuth fails for any reason
  auth = getAuth(app);
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export { auth, analytics };