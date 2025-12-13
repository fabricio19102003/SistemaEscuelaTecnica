import { create } from 'zustand';
import axios from '../services/api/axios';

export interface Notification {
    id: number;
    userId: number;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'RISK_ALERT' | 'TOP_PERFORMANCE';
    isRead: boolean;
    createdAt: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;

    fetchNotifications: () => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;

    // Admin Actions
    sendNotification: (userId: number, title: string, message: string, type?: string) => Promise<void>;
    broadcastNotification: (role: string, title: string, message: string, type?: string) => Promise<void>;
    sendBulkNotifications: (userIds: number[], title: string, message: string, type?: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    fetchNotifications: async () => {
        set({ loading: true });
        try {
            const response = await axios.get('/notifications');
            set({
                notifications: response.data.notifications,
                unreadCount: response.data.unreadCount
            });
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            set({ loading: false });
        }
    },

    markAsRead: async (id: number) => {
        try {
            await axios.patch(`/notifications/${id}/read`);
            // Optimistic update
            set(state => {
                const updated = state.notifications.map(n =>
                    n.id === id ? { ...n, isRead: true } : n
                );
                return {
                    notifications: updated,
                    unreadCount: Math.max(0, state.unreadCount - 1)
                };
            });
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    },

    markAllAsRead: async () => {
        try {
            await axios.patch('/notifications/read-all');
            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                unreadCount: 0
            }));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    },

    sendNotification: async (userId, title, message, type = 'INFO') => {
        await axios.post('/notifications/send', { userId, title, message, type });
    },

    broadcastNotification: async (role, title, message, type = 'INFO') => {
        await axios.post('/notifications/broadcast', { roleName: role, title, message, type });
    },

    sendBulkNotifications: async (userIds, title, message, type = 'INFO') => {
        await axios.post('/notifications/send-bulk', { userIds, title, message, type });
    }
}));
