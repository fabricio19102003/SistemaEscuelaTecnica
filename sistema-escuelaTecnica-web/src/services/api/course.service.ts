import api from './axios';
import type { Course, CreateCourseData, UpdateCourseData } from '../../types/course.types';

export const CourseService = {
    getAll: async (): Promise<Course[]> => {
        const response = await api.get('/courses');
        return response.data;
    },

    getById: async (id: number | string): Promise<Course> => {
        const response = await api.get(`/courses/${id}`);
        return response.data;
    },

    create: async (data: CreateCourseData): Promise<Course> => {
        const formData = new FormData();

        // Extract file from data
        const { image, ...jsonData } = data;

        formData.append('data', JSON.stringify(jsonData));
        if (image) {
            formData.append('image', image);
        }

        const response = await api.post('/courses', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    update: async (id: number | string, data: UpdateCourseData): Promise<Course> => {
        const formData = new FormData();

        const { image, ...jsonData } = data;

        formData.append('data', JSON.stringify(jsonData));
        if (image) {
            formData.append('image', image);
        }

        const response = await api.put(`/courses/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    delete: async (id: number | string): Promise<void> => {
        await api.delete(`/courses/${id}`);
    },

    createLevel: async (courseId: number | string, data: any): Promise<any> => {
        const response = await api.post(`/courses/${courseId}/levels`, data);
        return response.data;
    }
};
