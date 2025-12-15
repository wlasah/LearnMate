import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';

export default function NotificationsPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#2FB46E';
      case 'warning':
        return '#FFA500';
      case 'achievement':
        return '#9C27B0';
      default:
        return '#2B9AF3';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'achievement':
        return 'star';
      default:
        return 'information-circle';
    }
  };

  const handleNotificationPress = (notif: any) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    if (notif.actionUrl) {
      router.push(notif.actionUrl as any);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>

        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={[styles.markAllButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.markAllText, { color: colors.primary }]}>Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>


      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={60} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notifications</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              You're all caught up! Check back later for updates.
            </Text>
          </View>
        ) : (
          notifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[
                styles.notificationCard,
                !notif.read && styles.notificationCardUnread,
                { backgroundColor: !notif.read ? colors.surface : colors.card, borderColor: colors.border },
              ]}
              onPress={() => handleNotificationPress(notif)}
            >
              {/* Icon */}
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: getNotificationColor(notif.type) + '20' },
                ]}
              >
                <Ionicons
                  name={getNotificationIcon(notif.type) as any}
                  size={24}
                  color={getNotificationColor(notif.type)}
                />
              </View>

              {/* Content */}
              <View style={styles.notificationContent}>
                <Text style={[styles.notificationTitle, { color: colors.text }]}>{notif.title}</Text>
                <Text style={[styles.notificationMessage, { color: colors.textSecondary }]} numberOfLines={2}>
                  {notif.message}
                </Text>
                <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                  {formatTime(notif.createdAt)}
                </Text>
              </View>

              {/* Unread Indicator / Delete */}
              <View style={styles.notificationActions}>
                {!notif.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                <TouchableOpacity
                  onPress={() => deleteNotification(notif.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatTime(timestamp: any): string {
  if (!timestamp) return 'Just now';

  const date = timestamp.toDate?.() || new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  notificationCardUnread: {
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11,
    marginTop: 6,
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
});
