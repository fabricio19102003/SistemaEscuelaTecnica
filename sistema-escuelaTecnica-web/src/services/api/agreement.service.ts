import axios from './axios';
import type { Agreement, CreateAgreementData, UpdateAgreementData } from '../../types/agreement.types';

const API_URL = '/agreements';

export const getAgreements = async (params?: { search?: string; schoolId?: number; isActive?: boolean }): Promise<Agreement[]> => {
    const response = await axios.get(API_URL, { params });
    return response.data;
};

export const getAgreementById = async (id: number): Promise<Agreement> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createAgreement = async (data: CreateAgreementData): Promise<Agreement> => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

export const updateAgreement = async (id: number, data: UpdateAgreementData): Promise<Agreement> => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteAgreement = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
};
