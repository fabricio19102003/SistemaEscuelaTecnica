import { create } from 'zustand';
import {
    getMyCourses,
    getMyCourseStudents,
    getTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    type TeacherAssignment,
    type TeacherStudent
} from '../services/teacher.service';
import type { Teacher } from '../types/teacher.types';

interface TeacherState {
    teachers: Teacher[];
    selectedTeacher: Teacher | null;
    myCourses: TeacherAssignment[];
    selectedCourseStudents: TeacherStudent[];
    isLoading: boolean;
    error: string | null;

    fetchTeachers: () => Promise<void>;
    fetchTeacherById: (id: string | number) => Promise<void>;
    createTeacher: (data: FormData) => Promise<void>;
    updateTeacher: (id: string | number, data: FormData) => Promise<void>;
    fetchMyCourses: () => Promise<void>;
    fetchCourseStudents: (groupId: number) => Promise<void>;
    deleteTeacher: (id: string | number) => Promise<void>;
    clearSelectedCourse: () => void;
}

export const useTeacherStore = create<TeacherState>((set) => ({
    teachers: [],
    selectedTeacher: null,
    myCourses: [],
    selectedCourseStudents: [],
    isLoading: false,
    error: null,

    fetchTeachers: async () => {
        set({ isLoading: true, error: null });
        try {
            const teachers = await getTeachers();
            set({ teachers: teachers || [], isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al cargar docentes',
                isLoading: false,
                teachers: []
            });
        }
    },

    fetchTeacherById: async (id: string | number) => {
        set({ isLoading: true, error: null, selectedTeacher: null });
        try {
            const teacher = await getTeacherById(id);
            set({ selectedTeacher: teacher, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al cargar el docente',
                isLoading: false
            });
        }
    },

    createTeacher: async (data: FormData) => {
        set({ isLoading: true, error: null });
        try {
            await createTeacher(data);
            set({ isLoading: false });
            // Optionally refetch teachers list if needed, or handle in component
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al crear docente',
                isLoading: false
            });
            throw error; // Re-throw to handle success/error in component
        }
    },

    updateTeacher: async (id: string | number, data: FormData) => {
        set({ isLoading: true, error: null });
        try {
            await updateTeacher(id, data);
            set({ isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al actualizar docente',
                isLoading: false
            });
            throw error;
        }
    },

    fetchMyCourses: async () => {
        set({ isLoading: true, error: null });
        try {
            const courses = await getMyCourses();
            set({ myCourses: courses, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al cargar mis cursos',
                isLoading: false
            });
        }
    },

    fetchCourseStudents: async (groupId: number) => {
        set({ isLoading: true, error: null, selectedCourseStudents: [] });
        try {
            const students = await getMyCourseStudents(groupId);
            set({ selectedCourseStudents: students, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al cargar estudiantes del curso',
                isLoading: false
            });
        }
    },

    deleteTeacher: async (id: string | number) => {
        set({ isLoading: true, error: null });
        try {
            await deleteTeacher(id);
            set(state => ({
                teachers: state.teachers.filter(t => t.id !== Number(id)), // Ensure id comparison works if string/number mismatch
                isLoading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Error al eliminar docente',
                isLoading: false
            });
        }
    },

    clearSelectedCourse: () => set({ selectedCourseStudents: [] })
}));
