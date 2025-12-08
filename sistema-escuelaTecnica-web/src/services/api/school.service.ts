import api from './axios';
import type { School, CreateSchoolDTO, UpdateSchoolDTO } from '../../types/school.types';

export const schoolService = {
    getAll: async (search?: string): Promise<School[]> => {
        const params = search ? { search } : {};
        const response = await api.get('/schools', { params });
        return response.data;
    },

    getById: async (id: number): Promise<School> => {
        const response = await api.get(`/schools/${id}`);
        return response.data;
    },

    create: async (data: CreateSchoolDTO): Promise<School> => {
        const response = await api.post('/schools', data);
        return response.data;
    },

    update: async (id: number, data: UpdateSchoolDTO): Promise<School> => {
        const response = await api.put(`/schools/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/schools/${id}`);
    }
};
