import axios from './api/axios';
import type { Group, CreateGroupData, UpdateGroupData } from '../types/group.types';

const API_URL = '/groups';

export const getGroups = async (): Promise<Group[]> => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getGroupById = async (id: number): Promise<Group> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createGroup = async (data: CreateGroupData): Promise<Group> => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

export const updateGroup = async (id: number, data: UpdateGroupData): Promise<Group> => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteGroup = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
};
