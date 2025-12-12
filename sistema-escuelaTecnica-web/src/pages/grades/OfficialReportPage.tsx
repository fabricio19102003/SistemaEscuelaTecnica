import React, { useEffect, useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { useGradeStore } from '../../store/grade.store';
import OfficialReportPDF from '../../components/grades/OfficialReportPDF';
import { useGroupStore } from '../../store/group.store';
import { useAuthStore } from '../../store/auth.store'; // Import Auth Store
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OfficialReportPage: React.FC = () => {
    const navigate = useNavigate();
    const { fetchGroupReport, reportData, loading: reportLoading } = useGradeStore();
    const { groups, fetchGroups } = useGroupStore();
    const { user } = useAuthStore(); // Get user

    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    const [clientIp, setClientIp] = useState('Cargando...');

    useEffect(() => {
        fetchGroups();
        // Fetch IP
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => setClientIp(data.ip))
            .catch(() => setClientIp('No disponible'));
    }, [fetchGroups]);

    const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const groupId = Number(e.target.value);
        if (groupId) {
            setSelectedGroupId(groupId);
            fetchGroupReport(groupId);
        } else {
            setSelectedGroupId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 min-h-screen flex flex-col">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                     <button 
                        onClick={() => navigate('/dashboard/grades')}
                        className="text-gray-500 hover:text-[#004694] mb-2 text-sm transition-colors flex items-center gap-1 font-medium"
                    >
                        ← Volver al Panel
                    </button>
                    <h1 className="text-3xl font-bold text-[#004694]">Acta de Calificaciones</h1>
                    <p className="text-gray-500">Generación de actas oficiales.</p>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">
                            Seleccionar Grupo
                        </label>
                        <div className="relative">
                            <select
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#004694] focus:border-transparent transition-all appearance-none outline-none"
                                onChange={handleGroupChange}
                                value={selectedGroupId || ''}
                            >
                                <option value="">-- Seleccionar Grupo --</option>
                                {groups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.name} - {group.level?.course?.name} ({group.code})
                                    </option>
                                ))}
                            </select>
                             <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg relative">
                {reportLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004694]"></div>
                    </div>
                ) : null}

                {reportData && selectedGroupId ? (
                    <PDFViewer width="100%" height="100%" className="min-h-[800px] w-full border-none">
                        <OfficialReportPDF 
                            data={reportData} 
                            userWhoGenerated={user ? `${user.firstName} ${user.paternalSurname}` : 'Usuario Sistema'}
                            clientIp={clientIp}
                        />
                    </PDFViewer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[600px] text-center p-8 bg-gray-50/50">
                        <div className="p-4 bg-white rounded-full mb-4 shadow-sm ring-1 ring-gray-200">
                            <Search size={48} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Selecciona un grupo para comenzar</h3>
                        <p className="text-gray-500 max-w-md">
                            Elige un grupo de la lista superior para generar y visualizar el acta de calificaciones oficial.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfficialReportPage;
