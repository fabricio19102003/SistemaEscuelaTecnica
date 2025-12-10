import React, { useEffect, useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { useGradeStore } from '../../store/grade.store';
import OfficialReportPDF from '../../components/grades/OfficialReportPDF';
import { useGroupStore } from '../../store/group.store';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OfficialReportPage: React.FC = () => {
    const navigate = useNavigate();
    const { fetchGroupReport, reportData, loading: reportLoading } = useGradeStore();
    const { groups, fetchGroups } = useGroupStore(); // Ensure this store exists and has fetchGroups, assuming based on GradeEntryPage usage

    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

    useEffect(() => {
        fetchGroups();
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
                        className="text-gray-400 hover:text-white mb-2 text-sm transition-colors flex items-center gap-1"
                    >
                        ← Volver al Panel
                    </button>
                    <h1 className="text-3xl font-bold text-white">Acta de Calificaciones</h1>
                    <p className="text-gray-400">Generación de actas oficiales.</p>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                         <label className="block text-sm font-medium text-gray-400 mb-2">
                            Seleccionar Grupo
                        </label>
                        <div className="relative">
                            <select
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
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
                             <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl relative">
                {reportLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                ) : null}

                {reportData && selectedGroupId ? (
                    <PDFViewer width="100%" height="100%" className="min-h-[800px] w-full border-none">
                        <OfficialReportPDF data={reportData} />
                    </PDFViewer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[600px] text-center p-8 bg-slate-900/30">
                        <div className="p-4 bg-slate-800 rounded-full mb-4 ring-1 ring-white/10">
                            <Search size={48} className="text-gray-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Selecciona un grupo para comenzar</h3>
                        <p className="text-gray-400 max-w-md">
                            Elige un grupo de la lista superior para generar y visualizar el acta de calificaciones oficial.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfficialReportPage;
