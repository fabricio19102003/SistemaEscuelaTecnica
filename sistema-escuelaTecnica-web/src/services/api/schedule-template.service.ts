import api from './axios';

export interface ScheduleTemplateItem {
    id: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
}

export interface ScheduleTemplate {
    id: number;
    name: string;
    description?: string;
    items: ScheduleTemplateItem[];
}

export interface CreateScheduleTemplateData {
    name: string;
    description?: string;
    items: {
        dayOfWeek: string;
        startTime: string;
        endTime: string;
    }[];
}

export const ScheduleTemplateService = {
    getAll: async (): Promise<ScheduleTemplate[]> => {
        const response = await api.get('/schedule-templates');
        return response.data;
    },

    create: async (data: CreateScheduleTemplateData): Promise<ScheduleTemplate> => {
        const response = await api.post('/schedule-templates', data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/schedule-templates/${id}`);
    }
};
