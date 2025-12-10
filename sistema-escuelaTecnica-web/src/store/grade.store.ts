import { create } from 'zustand';
import axios from '../services/api/axios';

interface Grade {
    id: number;
    enrollmentId: number;
    evaluationType: string;
    gradeValue: number;
    progressTest?: number;
    classPerformance?: number;
    comments: string;
}

interface Enrollment {
    id: number;
    student: {
        id: number;
        user: {
            firstName: string;
            paternalSurname: string;
            maternalSurname: string;
        }
    };
    group?: {
        id: number;
        level?: {
            id: number;
            course?: {
                id: number;
                name: string;
            }
        }
    };
    grades: Grade[];
}

interface GradeState {
    enrollments: Enrollment[];
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

    fetchGradesByGroup: async (groupId: number) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`/grades/group/${groupId}`);
            set({ enrollments: response.data, loading: false });
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
            const response = await axios.get(`/grades/course/${courseId}`);
            set({ enrollments: response.data, loading: false });
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
            const response = await axios.get('/grades/stats/all');
            set({ enrollments: response.data, loading: false });
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
            await axios.post('/grades/save', { enrollmentId, grades });
            set({ loading: false });
            // Optionally refresh or update local state
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al guardar calificaciones',
                loading: false
            });
            throw error;
        }
    },

    reportData: null,
    fetchGroupReport: async (groupId: number) => {
        set({ loading: true, error: null, reportData: null });
        try {
            const response = await axios.get(`/grades/report/group/${groupId}`);
            set({ reportData: response.data, loading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al cargar reporte',
                loading: false
            });
        }
    }
}));
