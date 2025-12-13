import { create } from 'zustand';
import studentPortalService from '../services/student-portal.service';
import type { EnrollmentWithDetails, Grade, GradeStats, AcademicHistoryRecord, AttendanceRecord, AttendanceStats } from '../types/portal.types';

interface StudentPortalState {
    // Courses
    myEnrollments: EnrollmentWithDetails[];
    currentEnrollment: EnrollmentWithDetails | null;

    // Grades
    currentGrades: Grade[];
    gradeStats: GradeStats | null;

    // Attendance
    currentAttendance: AttendanceRecord[];
    attendanceStats: AttendanceStats | null;

    // Academic History
    academicHistory: AcademicHistoryRecord[];

    // Loading states
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchMyCourses: () => Promise<void>;
    fetchMyGrades: (enrollmentId: number) => Promise<void>;
    fetchMyAttendance: (enrollmentId: number) => Promise<void>;
    fetchMyAcademicHistory: () => Promise<void>;
    setCurrentEnrollment: (enrollment: EnrollmentWithDetails | null) => void;
    clearError: () => void;
}

export const useStudentPortalStore = create<StudentPortalState>((set) => ({
    // Initial state
    myEnrollments: [],
    currentEnrollment: null,
    currentGrades: [],
    gradeStats: null,
    currentAttendance: [],
    attendanceStats: null,
    academicHistory: [],
    isLoading: false,
    error: null,

    // Actions
    fetchMyCourses: async () => {
        set({ isLoading: true, error: null });
        try {
            const enrollments = await studentPortalService.getMyCourses();
            set({ myEnrollments: enrollments, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Error al cargar los cursos',
                isLoading: false
            });
        }
    },

    fetchMyGrades: async (enrollmentId: number) => {
        set({ isLoading: true, error: null });
        try {
            const data = await studentPortalService.getMyGrades(enrollmentId);
            set({
                currentGrades: data.grades,
                gradeStats: data.stats,
                currentEnrollment: data.enrollment,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Error al cargar las notas',
                isLoading: false
            });
        }
    },

    fetchMyAttendance: async (enrollmentId: number) => {
        set({ isLoading: true, error: null });
        try {
            const data = await studentPortalService.getMyAttendance(enrollmentId);
            set({
                currentAttendance: data.attendances,
                attendanceStats: data.stats,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Error al cargar la asistencia',
                isLoading: false
            });
        }
    },

    fetchMyAcademicHistory: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await studentPortalService.getMyAcademicHistory();
            set({ academicHistory: data.history, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Error al cargar el historial académico',
                isLoading: false
            });
        }
    },

    setCurrentEnrollment: (enrollment) => {
        set({ currentEnrollment: enrollment });
    },

    clearError: () => {
        set({ error: null });
    }
}));
