import api from './api/axios';
import type { Student } from '../types/student.types';

export interface CandidateStudent {
    id: number;
    student: Student;
    finalGrade: number;
    group: {
        id: number;
        code: string;
        name: string;
    };
}

export const getEnrollments = async () => {
    const response = await api.get('/enrollments');
    return response.data;
};

export const createEnrollment = async (data: any) => {
    const response = await api.post('/enrollments', data);
    return response.data;
};

export const getEnrollmentById = async (id: number) => {
    const response = await api.get(`/enrollments/${id}`);
    return response.data;
};

export const deleteEnrollment = async (id: number) => {
    const response = await api.delete(`/enrollments/${id}`);
    return response.data;
};

export const fetchEnrollmentReport = async (filters: any) => {
    const response = await api.get('/enrollments/report', { params: filters });
    return response.data;
};

export const getApprovedCandidates = async (courseId: number): Promise<CandidateStudent[]> => {
    const response = await api.get<CandidateStudent[]>(`/enrollments/candidates/course/${courseId}`);
    return response.data;
};

export const autoPromoteStudents = async (nextCourseId: number, startDate: string, studentIds: number[]): Promise<any> => {
    console.log('Sending auto-promote payload:', { nextCourseId, startDate, studentIds });
    const response = await api.post('/enrollments/auto-promote', { nextCourseId, startDate, studentIds });
    return response.data;
};
