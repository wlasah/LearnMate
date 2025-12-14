import React, { createContext, useContext, useState, useEffect } from 'react';
const firebaseConfig: any = require('../config/firebase');
import { collection, query, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'achievement';
  read: boolean;
  createdAt: any;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = firebaseConfig.db;
    const auth: any = firebaseConfig.auth;
    const uid = auth?.currentUser?.uid;

    if (!uid) {
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, 'users', uid, 'notifications'));
      const unsub = onSnapshot(q, (snap) => {
        const items: Notification[] = [];
        snap.forEach((d) => {
          items.push({
            id: d.id,
            ...d.data(),
          } as Notification);
        });
        // Sort by createdAt descending
        items.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });
        setNotifications(items);
        setUnreadCount(items.filter((n) => !n.read).length);
        setLoading(false);
      });

      return () => unsub();
    } catch (e) {
      console.error('Notifications listener error', e);
      setLoading(false);
    }
  }, []);

  const markAsRead = async (notificationId: string) => {
    const db = firebaseConfig.db;
    const auth: any = firebaseConfig.auth;
    const uid = auth?.currentUser?.uid;

    if (!uid) return;

    try {
      const docRef = doc(db, 'users', uid, 'notifications', notificationId);
      await updateDoc(docRef, { read: true });
    } catch (e) {
      console.error('Mark as read error', e);
    }
  };

  const markAllAsRead = async () => {
    const db = firebaseConfig.db;
    const auth: any = firebaseConfig.auth;
    const uid = auth?.currentUser?.uid;

    if (!uid) return;

    try {
      for (const notif of notifications.filter((n) => !n.read)) {
        const docRef = doc(db, 'users', uid, 'notifications', notif.id);
        await updateDoc(docRef, { read: true });
      }
    } catch (e) {
      console.error('Mark all as read error', e);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const db = firebaseConfig.db;
    const auth: any = firebaseConfig.auth;
    const uid = auth?.currentUser?.uid;

    if (!uid) return;

    try {
      // For now, we'll just mark it as deleted by removing from local state
      // In production, you might want to delete from Firestore
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (e) {
      console.error('Delete notification error', e);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
