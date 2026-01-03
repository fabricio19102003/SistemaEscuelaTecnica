import api from './api/axios';
import type { SystemSetting } from '../types/system-settings.types';

export const getSettings = async (): Promise<SystemSetting[]> => {
    const response = await api.get('/settings');
    return response.data;
};

export const updateSetting = async (key: string, value: string): Promise<SystemSetting> => {
    const response = await api.put(`/settings/${key}`, { value });
    return response.data;
};
