import { create } from 'zustand';
import { getSettings, updateSetting } from '../services/system-settings.service';


interface SystemSettingsState {
    settings: Record<string, string>;
    isLoading: boolean;
    error: string | null;
    fetchSettings: () => Promise<void>;
    updateSetting: (key: string, value: string) => Promise<void>;
    getSettingValue: (key: string, defaultValue?: string) => string;
}

export const useSystemSettingsStore = create<SystemSettingsState>((set, get) => ({
    settings: {}, // Map for O(1) access
    isLoading: false,
    error: null,

    fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await getSettings();
            const settingsMap: Record<string, string> = {};
            data.forEach(s => {
                settingsMap[s.key] = s.value;
            });
            set({ settings: settingsMap, isLoading: false });
        } catch (error) {
            console.error(error);
            set({ error: 'Error al cargar configuraciones', isLoading: false });
        }
    },

    updateSetting: async (key, value) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await updateSetting(key, value);
            set(state => ({
                settings: {
                    ...state.settings,
                    [updated.key]: updated.value
                },
                isLoading: false
            }));
        } catch (error) {
            console.error(error);
            set({ error: 'Error al actualizar configuración', isLoading: false });
            throw error;
        }
    },

    getSettingValue: (key, defaultValue = 'true') => {
        const { settings } = get();
        return settings[key] ?? defaultValue;
    }
}));
