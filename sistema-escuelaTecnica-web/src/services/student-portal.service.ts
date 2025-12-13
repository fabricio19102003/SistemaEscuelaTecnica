import api from './api/axios';
import type { EnrollmentWithDetails, GradeResponse, AcademicHistoryRecord, AttendanceResponse } from '../types/portal.types';

// Student Portal Service
class StudentPortalService {
    /**
     * Get my active courses
     */
    async getMyCourses(): Promise<EnrollmentWithDetails[]> {
        const response = await api.get('/student-portal/my-courses');
        return response.data.enrollments;
    }

    /**
     * Get my grades for a specific enrollment
     */
    async getMyGrades(enrollmentId: number): Promise<GradeResponse> {
        const response = await api.get(`/student-portal/my-grades/${enrollmentId}`);
        return response.data;
    }

    /**
     * Get my academic history
     */
    async getMyAcademicHistory(): Promise<{ history: AcademicHistoryRecord[] }> {
        const response = await api.get('/student-portal/my-academic-history');
        return response.data;
    }

    /**
     * Get my attendance for a specific enrollment
     */
    async getMyAttendance(enrollmentId: number): Promise<AttendanceResponse> {
        const response = await api.get(`/student-portal/my-attendance/${enrollmentId}`);
        return response.data;
    }
}

export default new StudentPortalService();
