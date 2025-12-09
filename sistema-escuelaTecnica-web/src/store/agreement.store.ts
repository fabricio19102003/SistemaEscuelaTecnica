import { create } from 'zustand';
import {
    getAgreements,
    getAgreementById,
    createAgreement,
    updateAgreement,
    deleteAgreement
} from '../services/api/agreement.service';
import type { Agreement, CreateAgreementData, UpdateAgreementData } from '../types/agreement.types';

interface AgreementState {
    agreements: Agreement[];
    selectedAgreement: Agreement | null;
    isLoading: boolean;
    error: string | null;

    fetchAgreements: (params?: { search?: string; schoolId?: number; isActive?: boolean }) => Promise<void>;
    fetchAgreementById: (id: number) => Promise<void>;
    createAgreement: (data: CreateAgreementData) => Promise<void>;
    updateAgreement: (id: number, data: UpdateAgreementData) => Promise<void>;
    deleteAgreement: (id: number) => Promise<void>;
    setSelectedAgreement: (agreement: Agreement | null) => void;
    clearError: () => void;
}

export const useAgreementStore = create<AgreementState>((set) => ({
    agreements: [],
    selectedAgreement: null,
    isLoading: false,
    error: null,

    fetchAgreements: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const agreements = await getAgreements(params);
            set({ agreements, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error fetching agreements', isLoading: false });
        }
    },

    fetchAgreementById: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const agreement = await getAgreementById(id);
            set({ selectedAgreement: agreement, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error fetching agreement', isLoading: false });
        }
    },

    createAgreement: async (data: CreateAgreementData) => {
        set({ isLoading: true, error: null });
        try {
            const newAgreement = await createAgreement(data);
            set((state) => ({
                agreements: [newAgreement, ...state.agreements],
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error creating agreement', isLoading: false });
            throw error;
        }
    },

    updateAgreement: async (id: number, data: UpdateAgreementData) => {
        set({ isLoading: true, error: null });
        try {
            const updatedAgreement = await updateAgreement(id, data);
            set((state) => ({
                agreements: state.agreements.map((a) => (a.id === id ? updatedAgreement : a)),
                selectedAgreement: updatedAgreement,
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error updating agreement', isLoading: false });
            throw error;
        }
    },

    deleteAgreement: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await deleteAgreement(id);
            set((state) => ({
                agreements: state.agreements.filter((a) => a.id !== id),
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Error deleting agreement', isLoading: false });
        }
    },

    setSelectedAgreement: (agreement) => set({ selectedAgreement: agreement }),
    clearError: () => set({ error: null })
}));
