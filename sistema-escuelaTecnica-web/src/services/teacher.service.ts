import axios from './api/axios';
import type { Teacher } from '../types/teacher.types';

export interface TeacherAssignment {
    id: number;
    name: string;
    code: string;
    level: {
        name: string;
        course: {
            name: string;
        };
    };
    currentEnrolled: number;
    startDate: string;
    endDate: string;
    status: string;
}

export interface TeacherStudent {
    id: number;
    status: string;
    enrollmentDate: string;
    student: {
        id: number;
        registrationCode: string;
        documentNumber: string;
        user: {
            firstName: string;
            paternalSurname: string;
            maternalSurname: string | null;
            email: string | null;
            phone: string | null;
            profileImageUrl: string | null;
        };
    };
}

export const getTeachers = async () => {
    const response = await axios.get<Teacher[]>('/teachers');
    return response.data;
};

export const getTeacherById = async (id: string | number) => {
    const response = await axios.get<Teacher>(`/teachers/${id}`);
    return response.data;
};

export const createTeacher = async (data: FormData) => {
    const response = await axios.post<Teacher>('/teachers', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateTeacher = async (id: string | number, data: FormData) => {
    const response = await axios.patch<Teacher>(`/teachers/${id}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteTeacher = async (id: string | number) => {
    const response = await axios.delete(`/teachers/${id}`);
    return response.data;
};

export const getMyCourses = async () => {
    const response = await axios.get<TeacherAssignment[]>('/teachers/assignments/my-courses');
    return response.data;
};

export const getMyCourseStudents = async (groupId: number) => {
    const response = await axios.get<TeacherStudent[]>(`/teachers/assignments/${groupId}/students`);
    return response.data;
};
