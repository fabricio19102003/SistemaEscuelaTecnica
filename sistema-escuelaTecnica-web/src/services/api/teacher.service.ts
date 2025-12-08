import api from './axios';
import type { Teacher } from '../../types/teacher.types';

export const teacherService = {
    getAll: async (): Promise<Teacher[]> => {
        const response = await api.get('/teachers');
        return response.data;
    },

    getById: async (id: string): Promise<Teacher> => {
        const response = await api.get(`/teachers/${id}`);
        return response.data;
    },

    create: async (data: FormData): Promise<Teacher> => {
        const response = await api.post('/teachers', data, {
            headers: {
                // Axios sets Content-Type to multipart/form-data automatically with FormData
            }
        });
        return response.data;
    },

    update: async (id: string, data: FormData): Promise<Teacher> => {
        const response = await api.put(`/teachers/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/teachers/${id}`);
    }
};
