import { create } from 'zustand';
import guardianPortalService from '../services/guardian-portal.service';
import type { StudentInfo, EnrollmentWithDetails, Grade, GradeStats, AttendanceRecord, AttendanceStats } from '../types/portal.types';

interface GuardianPortalState {
    // Students
    myStudents: StudentInfo[];
    selectedStudent: StudentInfo | null;

    // Student's courses
    studentEnrollments: EnrollmentWithDetails[];
    currentEnrollment: EnrollmentWithDetails | null;

    // Student's grades
    studentGrades: Grade[];
    gradeStats: GradeStats | null;

    // Student's attendance
    studentAttendance: AttendanceRecord[];
    attendanceStats: AttendanceStats | null;

    // Loading states
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchMyStudents: () => Promise<void>;
    selectStudent: (student: StudentInfo | null) => void;
    fetchStudentCourses: (studentId: number) => Promise<void>;
    fetchStudentGrades: (studentId: number, enrollmentId: number) => Promise<void>;
    fetchStudentAttendance: (studentId: number, enrollmentId: number) => Promise<void>;
    setCurrentEnrollment: (enrollment: EnrollmentWithDetails | null) => void;
    clearError: () => void;
}

export const useGuardianPortalStore = create<GuardianPortalState>((set) => ({
    //Initial state
    myStudents: [],
    selectedStudent: null,
    studentEnrollments: [],
    currentEnrollment: null,
    studentGrades: [],
    gradeStats: null,
    studentAttendance: [],
    attendanceStats: null,
    isLoading: false,
    error: null,

    // Actions
    fetchMyStudents: async () => {
        set({ isLoading: true, error: null });
        try {
            const students = await guardianPortalService.getMyStudents();
            set({ myStudents: students, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Error al cargar los estudiantes',
                isLoading: false
            });
        }
    },

    selectStudent: (student) => {
        set({
            selectedStudent: student,
            studentEnrollments: [],
            studentGrades: [],
            gradeStats: null,
            currentEnrollment: null
        });
    },

    fetchStudentCourses: async (studentId: number) => {
        set({ isLoading: true, error: null });
        try {
            const enrollments = await guardianPortalService.getStudentCourses(studentId);
            set({ studentEnrollments: enrollments, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Error al cargar los cursos',
                isLoading: false
            });
        }
    },

    fetchStudentGrades: async (studentId: number, enrollmentId: number) => {
        set({ isLoading: true, error: null });
        try {
            const data = await guardianPortalService.getStudentGrades(studentId, enrollmentId);
            set({
                studentGrades: data.grades,
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

    fetchStudentAttendance: async (studentId: number, enrollmentId: number) => {
        set({ isLoading: true, error: null });
        try {
            const data = await guardianPortalService.getStudentAttendance(studentId, enrollmentId);
            set({
                studentAttendance: data.attendances,
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

    setCurrentEnrollment: (enrollment) => {
        set({ currentEnrollment: enrollment });
    },

    clearError: () => {
        set({ error: null });
    }
}));
