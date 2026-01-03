import React, { useEffect } from 'react';
import { useSystemSettingsStore } from '../../store/system-settings.store';
import { Settings, Save, AlertTriangle } from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
    const { settings, isLoading, error, fetchSettings, updateSetting, getSettingValue } = useSystemSettingsStore();

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleToggleGrades = async () => {
        const currentValue = getSettingValue('GRADES_OPEN', 'true');
        const newValue = currentValue === 'true' ? 'false' : 'true';
        try {
            await updateSetting('GRADES_OPEN', newValue);
            // Optional: Show success toast
        } catch (err) {
            // Optional: Show error toast
        }
    };

    const areGradesOpen = getSettingValue('GRADES_OPEN', 'true') === 'true';

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
                <Settings className="w-8 h-8 mr-3 text-blue-600" />
                Configuración del Sistema
            </h1>

            {/* Configuración Académica */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-6">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center">
                    <h2 className="text-lg font-semibold text-blue-800">Académico</h2>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-md font-medium text-gray-900">Registro de Notas</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Habilitar o deshabilitar el ingreso de calificaciones por parte de los docentes.
                            </p>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={handleToggleGrades}
                                disabled={isLoading}
                                className={`
                                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                                    ${areGradesOpen ? 'bg-green-500' : 'bg-gray-200'}
                                `}
                                role="switch"
                                aria-checked={areGradesOpen}
                            >
                                <span
                                    className={`
                                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                        ${areGradesOpen ? 'translate-x-5' : 'translate-x-0'}
                                    `}
                                />
                            </button>
                            <span className={`ml-3 text-sm font-medium ${areGradesOpen ? 'text-green-600' : 'text-gray-500'}`}>
                                {areGradesOpen ? 'HABILITADO' : 'DESHABILITADO'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-md font-medium text-gray-900">Periodo Académico Actual</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Calculado automáticamente según la fecha actual.
                            </p>
                        </div>
                        <div className="flex items-center">
                             <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {getSettingValue('CURRENT_PERIOD', 'Calculando...')}
                             </span>
                        </div>
                    </div>
                    </div>
                </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <div>
                        <p className="text-sm text-red-700 font-medium">Error</p>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSettingsPage;
