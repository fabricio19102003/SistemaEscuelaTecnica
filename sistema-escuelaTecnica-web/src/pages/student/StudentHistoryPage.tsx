import { useEffect, useState } from 'react';
import api from '../../services/api/axios';
import { FileText, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

interface HistoryItem {
    id: number;
    enrollmentDate: string;
    year: number;
    period: string;
    courseName: string;
    courseCode: string;
    levelName: string;
    finalGrade: number | null;
    status: string;
    certificateUrl: string | null;
}

const StudentHistoryPage = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/students/me/history');
                setHistory(response.data);
            } catch (err) {
                console.error(err);
                setError('No se pudo cargar el historial académico.');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando historial...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Aprobado':
                return <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold"><CheckCircle size={12}/> Aprobado</span>;
            case 'Reprobado':
                return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold"><XCircle size={12}/> Reprobado</span>;
            case 'Cursando':
                return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold"><Clock size={12}/> Cursando</span>;
            default:
                return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-[#004694] mb-2 flex items-center gap-2">
                    <FileText className="text-[#004694]" />
                    Cursos Finalizados
                </h2>
                <p className="text-gray-500 text-sm">
                    Lista de cursos que has completado satisfactoriamente.
                </p>
            </div>

            {history.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <img src="/placeholder-empty.png" alt="Empty" className="w-24 h-24 mx-auto opacity-20 mb-4" />
                    <p className="text-gray-400 font-medium">No tienes cursos finalizados registrados.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#004694] text-white text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4">Periodo</th>
                                    <th className="px-6 py-4">Curso / Nivel</th>
                                    <th className="px-6 py-4 text-center">Nota Final</th>
                                    <th className="px-6 py-4 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {history.map((item) => (
                                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{item.period}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <Calendar size={10} /> {item.year}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-[#004694]">{item.courseName}</div>
                                            <div className="text-xs text-gray-500">{item.levelName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.finalGrade !== null ? (
                                                <span className={`font-bold text-lg ${item.finalGrade >= 51 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {item.finalGrade.toFixed(1)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">--</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(item.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentHistoryPage;
