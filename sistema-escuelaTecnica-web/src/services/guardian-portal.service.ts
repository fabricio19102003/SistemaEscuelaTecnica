import api from './api/axios';
import type { StudentInfo, EnrollmentWithDetails, GradeResponse, AttendanceResponse } from '../types/portal.types';

// Guardian Portal Service
class GuardianPortalService {
    /**
     * Get my assigned students
     */
    async getMyStudents(): Promise<StudentInfo[]> {
        const response = await api.get('/guardian-portal/my-students');
        return response.data.students;
    }

    /**
     * Get courses for a specific student
     */
    async getStudentCourses(studentId: number): Promise<EnrollmentWithDetails[]> {
        const response = await api.get(`/guardian-portal/student-courses/${studentId}`);
        return response.data.enrollments;
    }

    /**
     * Get grades for a specific student's enrollment
     */
    async getStudentGrades(studentId: number, enrollmentId: number): Promise<GradeResponse> {
        const response = await api.get(`/guardian-portal/student-grades/${studentId}/${enrollmentId}`);
        return response.data;
    }

    /**
     * Get attendance for a specific student's enrollment
     */
    async getStudentAttendance(studentId: number, enrollmentId: number): Promise<AttendanceResponse> {
        const response = await api.get(`/guardian-portal/student-attendance/${studentId}/${enrollmentId}`);
        return response.data;
    }
}

export default new GuardianPortalService();
