import axios from './api/axios';
import type { AttendanceStatus, AttendanceRecord } from '../types/attendance.types';

export interface AttendanceUpdatePayload {
    groupId: number;
    date: string;
    records: {
        enrollmentId: number;
        status: AttendanceStatus;
        notes?: string;
        arrivalTime?: string;
    }[];
}

export const getGroupAttendance = async (groupId: number, date: string) => {
    const response = await axios.get<AttendanceRecord[]>(`/attendance/${groupId}/date`, {
        params: { date }
    });
    return response.data;
};

export const saveGroupAttendance = async (data: AttendanceUpdatePayload) => {
    const response = await axios.post('/attendance/batch', data);
    return response.data;
};

export const getAttendanceStats = async (groupId: number, startDate: string, endDate: string) => {
    const response = await axios.get(`/attendance/${groupId}/stats`, {
        params: { startDate, endDate }
    });
    return response.data;
};
