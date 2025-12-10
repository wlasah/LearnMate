// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as firebaseConfig from '../config/firebase';
import type { Auth as FirebaseAuth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// `config/firebase.js` exports `auth` from JS so TS may treat it as `any`.
// Use a local `firebaseAuth` typed variable for proper typings in this file.
const firebaseAuth = (firebaseConfig as any).auth as FirebaseAuth;
const firebaseDb = (firebaseConfig as any).db as Firestore;

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const uid = result.user.uid;
      
      // Save user profile to Firestore
      await setDoc(doc(firebaseDb, 'users', uid), {
        uid,
        email,
        createdAt: serverTimestamp(),
      });
      
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const logout = async () => {
    try {
      await signOut(firebaseAuth);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
