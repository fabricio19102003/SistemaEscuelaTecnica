import { create } from 'zustand';

import { createEnrollment, getEnrollments, getEnrollmentById, deleteEnrollment } from '../services/enrollment.service';

interface EnrollmentState {
    enrollments: any[];
    selectedEnrollment: any | null;
    isLoading: boolean;
    error: string | null;
    fetchEnrollments: () => Promise<void>;
    fetchEnrollmentById: (id: number) => Promise<void>;
    createEnrollment: (data: any) => Promise<any>;
    deleteEnrollment: (id: number) => Promise<void>;
}

export const useEnrollmentStore = create<EnrollmentState>((set) => ({
    enrollments: [],
    selectedEnrollment: null,
    isLoading: false,
    error: null,
    fetchEnrollments: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await getEnrollments();
            set({ enrollments: data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },
    fetchEnrollmentById: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const data = await getEnrollmentById(id);
            set({ selectedEnrollment: data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },
    createEnrollment: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
            const result = await createEnrollment(data);
            set((state) => ({
                enrollments: [result, ...state.enrollments],
                isLoading: false
            }));
            return result;
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },
    deleteEnrollment: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await deleteEnrollment(id);
            set((state) => ({
                enrollments: state.enrollments.filter(e => e.id !== id),
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    }
}));
