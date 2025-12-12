import { create } from 'zustand';
import { getGroupAttendance, saveGroupAttendance, getAttendanceStats, type AttendanceUpdatePayload } from '../services/attendance.service';
import type { AttendanceRecord } from '../types/attendance.types';

interface AttendanceState {
    attendanceList: AttendanceRecord[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchAttendance: (groupId: number, date: string) => Promise<void>;
    saveAttendance: (data: AttendanceUpdatePayload) => Promise<void>;
    updateLocalStatus: (enrollmentId: number, status: any, notes?: string, arrivalTime?: string) => void;
    clearAttendance: () => void;
    fetchStats: (groupId: number, startDate: string, endDate: string) => Promise<any>;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
    attendanceList: [],
    isLoading: false,
    error: null,

    fetchAttendance: async (groupId: number, date: string) => {
        set({ isLoading: true, error: null });
        try {
            const data = await getGroupAttendance(groupId, date);
            set({ attendanceList: data, isLoading: false });
        } catch (error: any) {
            console.error(error);
            set({ isLoading: false, error: error.message || 'Error fetching attendance' });
        }
    },

    saveAttendance: async (data: AttendanceUpdatePayload) => {
        set({ isLoading: true, error: null });
        try {
            await saveGroupAttendance(data);
            // Optionally re-fetch or just set loading false
            set({ isLoading: false });
        } catch (error: any) {
            console.error(error);
            set({ isLoading: false, error: error.message || 'Error saving attendance' });
            throw error; // Re-throw to handle in UI
        }
    },

    updateLocalStatus: (enrollmentId, status, notes, arrivalTime) => {
        const { attendanceList } = get();
        const updatedList = attendanceList.map((item) =>
            item.enrollmentId === enrollmentId
                ? { ...item, status, notes: notes ?? item.notes, arrivalTime: arrivalTime ?? item.arrivalTime }
                : item
        );
        set({ attendanceList: updatedList });
    },

    clearAttendance: () => set({ attendanceList: [], error: null }),

    fetchStats: async (groupId: number, startDate: string, endDate: string) => {
        // Can optionally store stats in state if needed, or just return them
        // For reporting, usually we just want the data. 
        // But if we want to show it in UI... let's just return it for now as the component might handle PDF generation directly.
        // Or better, let's keep it consistent and use the service directly in component if not sharing state?
        // Actually, store is good for "isLoading" state management.
        set({ isLoading: true, error: null });
        try {
            const data = await getAttendanceStats(groupId, startDate, endDate);
            set({ isLoading: false });
            return data;
        } catch (error: any) {
            console.error(error);
            set({ isLoading: false, error: error.message || 'Error fetching stats' });
            throw error;
        }
    }
}));
