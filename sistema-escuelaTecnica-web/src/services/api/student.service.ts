import api from './axios';

import type { CreateStudentDTO, Student, UpdateStudentDTO } from '../../types/student.types';

export const studentService = {
    getAll: async (): Promise<Student[]> => {
        const response = await api.get('/students');
        return response.data;
    },
    getById: async (id: string): Promise<Student> => {
        const response = await api.get(`/students/${id}`);
        return response.data;
    },
    create: async (data: CreateStudentDTO | FormData): Promise<Student> => {
        // Let Axios handle the Content-Type header for FormData (it needs the boundary)
        const response = await api.post('/students', data);
        return response.data;
    },
    update: async (id: string, data: UpdateStudentDTO | FormData): Promise<Student> => {
        const response = await api.put(`/students/${id}`, data);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/students/${id}`);
    }
};
