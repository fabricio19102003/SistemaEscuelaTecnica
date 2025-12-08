import { create } from 'zustand';
import { studentService } from '../services/api/student.service';
import type { Student, CreateStudentDTO, UpdateStudentDTO } from '../types/student.types';

interface StudentState {
    students: Student[];
    selectedStudent: Student | null;
    isLoading: boolean;
    error: string | null;

    fetchStudents: () => Promise<void>;
    fetchStudentById: (id: string) => Promise<void>;
    createStudent: (data: CreateStudentDTO | FormData) => Promise<void>;
    updateStudent: (id: string, data: UpdateStudentDTO | FormData) => Promise<void>;
    deleteStudent: (id: string) => Promise<void>;
    clearError: () => void;
    setSelectedStudent: (student: Student | null) => void;
}

export const useStudentStore = create<StudentState>((set) => ({
    students: [],
    selectedStudent: null,
    isLoading: false,
    error: null,

    fetchStudents: async () => {
        set({ isLoading: true, error: null });
        try {
            const students = await studentService.getAll();
            set({ students, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error fetching students', isLoading: false });
        }
    },

    fetchStudentById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const student = await studentService.getById(id);
            set({ selectedStudent: student, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error fetching student', isLoading: false });
        }
    },

    createStudent: async (data: CreateStudentDTO | FormData) => {
        set({ isLoading: true, error: null });
        try {
            const newStudent = await studentService.create(data);
            set((state) => ({
                students: [...state.students, newStudent],
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error creating student', isLoading: false });
            throw error;
        }
    },

    updateStudent: async (id: string, data: UpdateStudentDTO | FormData) => {
        set({ isLoading: true, error: null });
        try {
            const updatedStudent = await studentService.update(id, data);
            set((state) => ({
                students: state.students.map((s) => (String(s.id) === id ? updatedStudent : s)),
                selectedStudent: updatedStudent,
                isLoading: false,
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error updating student', isLoading: false });
            throw error;
        }
    },

    deleteStudent: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await studentService.delete(id);
            set((state) => ({
                students: state.students.filter((s) => String(s.id) !== id),
                isLoading: false,
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error deleting student', isLoading: false });
        }
    },

    clearError: () => set({ error: null }),
    setSelectedStudent: (student) => set({ selectedStudent: student }),
}));
