import api from './axios';

export interface Classroom {
    id: number;
    name: string;
    capacity: number;
    location?: string;
    description?: string;
    isActive: boolean;
}

export const classroomService = {
    getAll: async (): Promise<Classroom[]> => {
        const response = await api.get('/classrooms');
        return response.data;
    },

    create: async (data: Omit<Classroom, 'id' | 'isActive'>): Promise<Classroom> => {
        const response = await api.post('/classrooms', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Classroom>): Promise<Classroom> => {
        const response = await api.put(`/classrooms/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/classrooms/${id}`);
    }
};
