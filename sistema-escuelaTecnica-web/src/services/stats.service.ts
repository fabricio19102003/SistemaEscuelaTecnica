import axios from './api/axios';

export interface RevenueByCourse {
    id: number;
    name: string;
    totalRevenue: number;
    totalStudents: number;
}

export const getRevenueByCourse = async (): Promise<RevenueByCourse[]> => {
    const response = await axios.get('/stats/financial/revenue-by-course');
    return response.data;
};
