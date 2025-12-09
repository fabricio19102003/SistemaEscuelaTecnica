import { create } from 'zustand';
import { getGroups, getGroupById } from '../services/group.service';

// Assuming interfaces from services or defining loosely for now
interface GroupState {
    groups: any[];
    selectedGroup: any | null;
    isLoading: boolean;
    fetchGroups: () => Promise<void>;
}

export const useGroupStore = create<GroupState>((set) => ({
    groups: [],
    selectedGroup: null,
    isLoading: false,
    fetchGroups: async () => {
        set({ isLoading: true });
        try {
            const data = await getGroups();
            set({ groups: data, isLoading: false });
        } catch (error) {
            console.error(error);
            set({ isLoading: false });
        }
    }
}));
