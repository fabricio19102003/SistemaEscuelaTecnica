import { create } from 'zustand';
import { schoolService } from '../services/api/school.service';
import type { School, CreateSchoolDTO, UpdateSchoolDTO } from '../types/school.types';

interface SchoolState {
    schools: School[];
    selectedSchool: School | null;
    isLoading: boolean;
    error: string | null;

    fetchSchools: (search?: string) => Promise<void>;
    fetchSchoolById: (id: number) => Promise<void>;
    createSchool: (data: CreateSchoolDTO) => Promise<void>;
    updateSchool: (id: number, data: UpdateSchoolDTO) => Promise<void>;
    deleteSchool: (id: number) => Promise<void>;
    setSelectedSchool: (school: School | null) => void;
    clearError: () => void;
}

export const useSchoolStore = create<SchoolState>((set) => ({
    schools: [],
    selectedSchool: null,
    isLoading: false,
    error: null,

    fetchSchools: async (search?: string) => {
        set({ isLoading: true, error: null });
        try {
            const schools = await schoolService.getAll(search);
            set({ schools, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error fetching schools', isLoading: false });
        }
    },

    fetchSchoolById: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const school = await schoolService.getById(id);
            set({ selectedSchool: school, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error fetching school', isLoading: false });
        }
    },

    createSchool: async (data: CreateSchoolDTO) => {
        set({ isLoading: true, error: null });
        try {
            const newSchool = await schoolService.create(data);
            set((state) => ({
                schools: [...state.schools, newSchool],
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error creating school', isLoading: false });
            throw error;
        }
    },

    updateSchool: async (id: number, data: UpdateSchoolDTO) => {
        set({ isLoading: true, error: null });
        try {
            const updatedSchool = await schoolService.update(id, data);
            set((state) => ({
                schools: state.schools.map((s) => (s.id === id ? updatedSchool : s)),
                selectedSchool: updatedSchool,
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error updating school', isLoading: false });
            throw error;
        }
    },

    deleteSchool: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await schoolService.delete(id);
            set((state) => ({
                schools: state.schools.filter((s) => s.id !== id),
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error deleting school', isLoading: false });
        }
    },

    setSelectedSchool: (school) => set({ selectedSchool: school }),
    clearError: () => set({ error: null })
}));
