import { create } from 'zustand';
import { teacherService } from '../services/api/teacher.service';
import type { Teacher } from '../types/teacher.types';

interface TeacherState {
    teachers: Teacher[];
    selectedTeacher: Teacher | null;
    isLoading: boolean;
    error: string | null;

    fetchTeachers: () => Promise<void>;
    fetchTeacherById: (id: string) => Promise<void>;
    createTeacher: (data: FormData) => Promise<void>;
    updateTeacher: (id: string, data: FormData) => Promise<void>;
    deleteTeacher: (id: string) => Promise<void>;
    clearError: () => void;
    setSelectedTeacher: (teacher: Teacher | null) => void;
}

export const useTeacherStore = create<TeacherState>((set) => ({
    teachers: [],
    selectedTeacher: null,
    isLoading: false,
    error: null,

    fetchTeachers: async () => {
        set({ isLoading: true, error: null });
        try {
            const teachers = await teacherService.getAll();
            set({ teachers, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error fetching teachers', isLoading: false });
        }
    },

    fetchTeacherById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const teacher = await teacherService.getById(id);
            set({ selectedTeacher: teacher, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error fetching teacher', isLoading: false });
        }
    },

    createTeacher: async (data: FormData) => {
        set({ isLoading: true, error: null });
        try {
            const newTeacher = await teacherService.create(data);
            set((state) => ({
                teachers: [newTeacher, ...state.teachers],
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error creating teacher', isLoading: false });
            throw error;
        }
    },

    updateTeacher: async (id: string, data: FormData) => {
        set({ isLoading: true, error: null });
        try {
            const updatedTeacher = await teacherService.update(id, data);
            set((state) => ({
                teachers: state.teachers.map((t) => (String(t.id) === id ? updatedTeacher : t)),
                selectedTeacher: updatedTeacher,
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error updating teacher', isLoading: false });
            throw error;
        }
    },

    deleteTeacher: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await teacherService.delete(id);
            set((state) => ({
                teachers: state.teachers.filter((t) => String(t.id) !== id),
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error deleting teacher', isLoading: false });
        }
    },

    clearError: () => set({ error: null }),
    setSelectedTeacher: (teacher) => set({ selectedTeacher: teacher }),
}));
