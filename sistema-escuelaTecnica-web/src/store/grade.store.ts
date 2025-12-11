import { create } from 'zustand';
import {
    getGradesByGroup,
    getGradesByCourse,
    getAllGradesStats,
    saveGrades,
    getGroupReport,
    type EnrollmentWithGrades
} from '../services/grade.service';

interface GradeState {
    enrollments: EnrollmentWithGrades[];
    loading: boolean;
    error: string | null;
    reportData: any | null;
    fetchGradesByGroup: (groupId: number) => Promise<void>;
    fetchGradesByCourse: (courseId: number) => Promise<void>;
    fetchAllGrades: () => Promise<void>;
    saveGrades: (enrollmentId: number, grades: any[]) => Promise<void>;
    fetchGroupReport: (groupId: number) => Promise<void>;
}

export const useGradeStore = create<GradeState>((set) => ({
    enrollments: [],
    loading: false,
    error: null,
    reportData: null,

    fetchGradesByGroup: async (groupId: number) => {
        set({ loading: true, error: null });
        try {
            const enrollments = await getGradesByGroup(groupId);
            set({ enrollments, loading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al cargar calificaciones',
                loading: false
            });
        }
    },

    fetchGradesByCourse: async (courseId: number) => {
        set({ loading: true, error: null });
        try {
            const enrollments = await getGradesByCourse(courseId);
            set({ enrollments, loading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al cargar calificaciones del curso',
                loading: false
            });
        }
    },

    fetchAllGrades: async () => {
        set({ loading: true, error: null });
        try {
            const enrollments = await getAllGradesStats();
            set({ enrollments, loading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al cargar todas las calificaciones',
                loading: false
            });
        }
    },

    saveGrades: async (enrollmentId: number, grades: any[]) => {
        set({ loading: true, error: null });
        try {
            await saveGrades(enrollmentId, grades);
            set({ loading: false });
            // Optionally refresh or update local state - dependent on UI needs
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al guardar calificaciones',
                loading: false
            });
            throw error;
        }
    },

    fetchGroupReport: async (groupId: number) => {
        set({ loading: true, error: null, reportData: null });
        try {
            const reportData = await getGroupReport(groupId);
            set({ reportData, loading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al cargar reporte',
                loading: false
            });
        }
    }
}));
