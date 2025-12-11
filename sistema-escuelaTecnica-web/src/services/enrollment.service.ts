import api from './api/axios';

export const getEnrollments = async () => {
    const response = await api.get('/enrollments');
    return response.data;
};

export const getEnrollmentById = async (id: number) => {
    const response = await api.get(`/enrollments/${id}`);
    return response.data;
};

export const createEnrollment = async (data: any) => {
    const response = await api.post('/enrollments', data);
    return response.data;
};

export const deleteEnrollment = async (id: number) => {
    const response = await api.delete(`/enrollments/${id}`);
    return response.data;
};

export const getEnrollmentReport = async (filters: { courseId?: number, year?: string, academicPeriod?: string }) => {
    const response = await api.get('/enrollments/report', { params: filters });
    return response.data;
};
