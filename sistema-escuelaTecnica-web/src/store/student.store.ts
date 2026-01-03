import { create } from 'zustand';
import { studentService } from '../services/api/student.service';
import type { Student, CreateStudentDTO, UpdateStudentDTO, AcademicHistoryRecord } from '../types/student.types';

interface StudentState {
    students: Student[];
    selectedStudent: Student | null;
    academicHistory: AcademicHistoryRecord[];
    isLoading: boolean;
    error: string | null;

    fetchStudents: () => Promise<void>;
    fetchStudentById: (id: string) => Promise<void>;
    fetchStudentHistory: (id: string) => Promise<void>;
    createStudent: (data: CreateStudentDTO | FormData) => Promise<void>;
    updateStudent: (id: string, data: UpdateStudentDTO | FormData) => Promise<void>;
    deleteStudent: (id: string) => Promise<void>;
    clearError: () => void;
    eligibleStudents: Student[];
    fetchEligibleStudents: (courseId: number) => Promise<void>;
}

export const useStudentStore = create<StudentState>((set) => ({
    students: [],
    selectedStudent: null,
    academicHistory: [],
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
        set({ isLoading: true, error: null, selectedStudent: null }); // Clear previous student
        try {
            const student = await studentService.getById(id);
            set({ selectedStudent: student, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error fetching student', isLoading: false });
        }
    },

    fetchStudentHistory: async (id: string) => {
        set({ isLoading: true, error: null, academicHistory: [] }); // Clear previous history
        try {
            const history = await studentService.getHistory(id);
            set({ academicHistory: history, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error fetching student history', isLoading: false });
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
    setSelectedStudent: (student: Student | null) => set({ selectedStudent: student }),

    eligibleStudents: [],
    fetchEligibleStudents: async (courseId: number) => {
        set({ isLoading: true, error: null, eligibleStudents: [] });
        try {
            const students = await studentService.getEligible(courseId);
            set({ eligibleStudents: students, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error fetching eligible students', isLoading: false });
        }
    }
}));
