import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseStore } from '../../store/course.store';
import { useGradeStore } from '../../store/grade.store';
import { Download, ArrowLeft, FileText, Eye } from 'lucide-react';
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
    const [previewingPdfId, setPreviewingPdfId] = useState<number | null>(null);

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
            
            const blob = await pdf(
                <ReportCardPDF 
                    data={data} 
                    period={data.period}
                    courseName={data.courseName}
                    teacherName={data.teacherName}
                    studentName={data.studentName}
                    scheduleTime={data.schedule}
                    nextCourse={data.nextCourse}
                    userWhoGenerated="ADMINISTRACION" // Default or fetch real user
                    clientIp="N/A"
                />
            ).toBlob();
            
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

    const handlePreviewReport = async (studentId: number) => {
        const enrollment = enrollments.find(e => e.student.id === studentId);
        if (!enrollment) return;

        try {
            setPreviewingPdfId(studentId);
            const { data } = await axios.get(`/grades/report-card/${enrollment.id}`);
            
            const blob = await pdf(
                <ReportCardPDF 
                    data={data} 
                    period={data.period}
                    courseName={data.courseName}
                    teacherName={data.teacherName}
                    studentName={data.studentName}
                    scheduleTime={data.schedule}
                    nextCourse={data.nextCourse}
                    userWhoGenerated="ADMINISTRACION"
                    clientIp="N/A"
                />
            ).toBlob();
            
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            
            // Cleanup
            setTimeout(() => URL.revokeObjectURL(url), 60000);

        } catch (error) {
            console.error('PDF Preview Error:', error);
            Swal.fire('Error', 'No se pudo previsualizar el boletín', 'error');
        } finally {
            setPreviewingPdfId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => navigate('/dashboard/grades')} 
                    className="p-2 bg-white text-gray-500 rounded-lg hover:bg-gray-50 transition border border-gray-200 hover:text-[#004694]"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-bold text-[#004694]">Boletines de Notas</h2>
            </div>

            {/* Course Selector */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">Seleccionar Curso</label>
                <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full md:w-1/2 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004694] bg-gray-50 text-gray-900 focus:bg-white transition-all outline-none"
                >
                    <option value="">-- Seleccione un Curso --</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Student List Table */}
            {selectedCourseId && (
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#004694] text-xs uppercase text-white font-bold">
                                <tr>
                                    <th className="px-6 py-4">Estudiante</th>
                                    <th className="px-6 py-4 text-center">Estado</th>
                                    <th className="px-6 py-4 text-right">Boletín</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {enrollments.map((enrollment) => {
                                    const hasGrades = enrollment.grades && enrollment.grades.length > 0;
                                    
                                    return (
                                        <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-900 font-medium">
                                                {enrollment.student.user.paternalSurname} {enrollment.student.user.maternalSurname}, {enrollment.student.user.firstName}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {hasGrades ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                                        Con Calificaciones
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-100">
                                                        Sin Calificaciones
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <button
                                                    onClick={() => handlePreviewReport(enrollment.student.id)}
                                                    disabled={previewingPdfId === enrollment.student.id}
                                                    className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg transition-colors text-xs font-bold shadow-sm disabled:opacity-50 border border-gray-200"
                                                    title="Previsualizar"
                                                >
                                                    {previewingPdfId === enrollment.student.id ? (
                                                        <span className="animate-pulse">...</span>
                                                    ) : (
                                                        <>
                                                            <Eye size={14} />
                                                            Ver
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadReport(enrollment.student.id)}
                                                    disabled={generatingPdfId === enrollment.student.id}
                                                    className="inline-flex items-center gap-2 bg-[#004694] hover:bg-[#003da5] text-white px-3 py-2 rounded-lg transition-colors text-xs font-bold shadow-sm disabled:opacity-50"
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
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">Seleccione un curso para descargar los boletines.</p>
                </div>
            )}
        </div>
    );
};

export default GradeReportsPage;
