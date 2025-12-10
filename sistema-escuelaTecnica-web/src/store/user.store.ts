import { create } from 'zustand';
import axios from '../services/api/axios';

export interface Role {
    id: number;
    name: string;
    description?: string;
}

export interface User {
    id: number;
    firstName: string;
    paternalSurname: string;
    maternalSurname?: string;
    username?: string;
    email?: string;
    isActive: boolean;
    lastLoginAt?: string;
    userRoles: {
        role: Role;
    }[];
}

interface UserMetrics {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    rolesDistribution: { role: string; count: number }[];
}

interface UserState {
    users: User[];
    roles: Role[];
    metrics: UserMetrics | null;
    loading: boolean;
    error: string | null;

    fetchUsers: () => Promise<void>;
    fetchUserMetrics: () => Promise<void>;
    fetchRoles: () => Promise<void>;
    createUser: (data: any) => Promise<void>;
    updateUser: (id: number, data: any) => Promise<void>;
    toggleUserStatus: (id: number) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
    users: [],
    roles: [],
    metrics: null,
    loading: false,
    error: null,

    fetchUsers: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get('/users');
            set({ users: response.data, loading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al cargar usuarios',
                loading: false
            });
        }
    },

    fetchUserMetrics: async () => {
        try {
            const response = await axios.get('/users/metrics');
            set({ metrics: response.data });
        } catch (error) {
            console.error('Error fetching metrics', error);
        }
    },

    fetchRoles: async () => {
        try {
            const response = await axios.get('/users/roles');
            set({ roles: response.data });
        } catch (error) {
            console.error('Error fetching roles', error);
        }
    },

    createUser: async (data) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post('/users', data);
            set(state => ({
                users: [response.data, ...state.users],
                loading: false
            }));
            await get().fetchUserMetrics(); // Refresh metrics
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al crear usuario',
                loading: false
            });
            throw error;
        }
    },

    updateUser: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.put(`/users/${id}`, data);
            set(state => ({
                users: state.users.map(u => u.id === id ? response.data : u),
                loading: false
            }));
            await get().fetchUserMetrics(); // Refresh metrics
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al actualizar usuario',
                loading: false
            });
            throw error;
        }
    },

    toggleUserStatus: async (id) => {
        try {
            const response = await axios.patch(`/users/${id}/status`);
            set(state => ({
                users: state.users.map(u => u.id === id ? { ...u, isActive: response.data.isActive } : u)
            }));
            await get().fetchUserMetrics(); // Refresh metrics
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al cambiar estado',
            });
        }
    }
}));
