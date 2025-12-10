import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseStore } from '../../store/course.store';
import { useGradeStore } from '../../store/grade.store';
import { Download, ArrowLeft, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import { pdf } from '@react-pdf/renderer';
import ReportCardPDF from '../../components/grades/ReportCardPDF';
import axios from '../../services/api/axios';

const GradeReportsPage = () => {
    const navigate = useNavigate();
    const { courses, fetchCourses } = useCourseStore();
    const { enrollments, fetchGradesByCourse } = useGradeStore();
    
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [generatingPdfId, setGeneratingPdfId] = useState<number | null>(null);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    useEffect(() => {
        if (selectedCourseId) {
            fetchGradesByCourse(Number(selectedCourseId));
        }
    }, [selectedCourseId, fetchGradesByCourse]);

    const handleDownloadReport = async (studentId: number) => {
        const enrollment = enrollments.find(e => e.student.id === studentId);
        if (!enrollment) return;

        try {
            setGeneratingPdfId(studentId);
            const { data } = await axios.get(`/grades/report-card/${enrollment.id}`);
            
            const blob = await pdf(<ReportCardPDF data={data} />).toBlob();
            
            const u = enrollment.student.user;
            const fullName = `${u.firstName}_${u.paternalSurname}`.toUpperCase();
            const fileName = `BOLETIN_${fullName}.pdf`;

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('PDF Error:', error);
            Swal.fire('Error', 'No se pudo generar el boletín', 'error');
        } finally {
            setGeneratingPdfId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => navigate('/dashboard/grades')} 
                    className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition border border-slate-700"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-bold text-white">Boletines de Notas</h2>
            </div>

            {/* Course Selector */}
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                <label className="block text-sm font-medium text-gray-300 mb-2">Seleccionar Curso</label>
                <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full md:w-1/2 px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-950 text-white placeholder-gray-400"
                >
                    <option value="">-- Seleccione un Curso --</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Student List Table */}
            {selectedCourseId && (
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/50 text-xs uppercase text-gray-400 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Estudiante</th>
                                    <th className="px-6 py-4 text-center">Estado</th>
                                    <th className="px-6 py-4 text-right">Boletín</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700 text-sm">
                                {enrollments.map((enrollment) => {
                                    const hasGrades = enrollment.grades && enrollment.grades.length > 0;
                                    
                                    return (
                                        <tr key={enrollment.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 text-white font-medium">
                                                {enrollment.student.user.paternalSurname} {enrollment.student.user.maternalSurname}, {enrollment.student.user.firstName}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {hasGrades ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                                                        Con Calificaciones
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400">
                                                        Sin Calificaciones
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDownloadReport(enrollment.student.id)}
                                                    disabled={generatingPdfId === enrollment.student.id}
                                                    className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-xs font-medium border border-gray-600"
                                                >
                                                    {generatingPdfId === enrollment.student.id ? (
                                                        <span className="animate-pulse">Generando...</span>
                                                    ) : (
                                                        <>
                                                            <Download size={14} />
                                                            Descargar
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {enrollments.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                            No hay estudiantes inscritos en este curso.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    </div>
            )}

            {!selectedCourseId && (
                <div className="text-center py-20 bg-slate-800/50 rounded-xl border border-dashed border-slate-600">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-400">Seleccione un curso para descargar los boletines.</p>
                </div>
            )}
        </div>
    );
};

export default GradeReportsPage;
