import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudentStore } from '../../store/student.store';
import { FileText, ArrowLeft, Download, GraduationCap, Calendar, BookOpen, AlertCircle, Eye, X } from 'lucide-react'; // Using icons
import { useAuthStore } from '../../store/auth.store';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { AcademicHistoryPDF } from '../../components/students/AcademicHistoryPDF';

const StudentHistoryPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { 
        selectedStudent, 
        academicHistory, 
        isLoading, 
        fetchStudentById,
        fetchStudentHistory 
    } = useStudentStore();
    const { user } = useAuthStore();
    const [clientIp, setClientIp] = useState('Cargando...');
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (id) {
            fetchStudentById(id);
            fetchStudentHistory(id);
        }
        
        // Fetch IP for audit logs
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => setClientIp(data.ip))
            .catch(() => setClientIp('No disponible'));
    }, [id, fetchStudentById, fetchStudentHistory]);

    if (isLoading && !selectedStudent) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004694]"></div>
            </div>
        );
    }

    if (!selectedStudent) {
        return (
            <div className="p-8 text-center text-gray-500">
                <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                <h2 className="text-xl font-bold">Estudiante no encontrado</h2>
                <button onClick={() => navigate('/dashboard/students')} className="mt-4 text-[#004694] hover:underline">
                    Volver a lista de estudiantes
                </button>
            </div>
        );
    }

    // --- Logic for Admission Date and Status ---
    
    // Helper to translate status
    const translateStatus = (status: string) => {
        const map: Record<string, string> = {
            'ACTIVE': 'ACTIVO',
            'INACTIVE': 'INACTIVO',
            'GRADUATED': 'GRADUADO',
            'DROPPED': 'RETIRADO (BAJA)',
            'RETIRADO': 'RETIRADO',
            'ABANDONO': 'ABANDONO',
            'NO_INCORPORADO': 'NO INCORPORADO'
        };
        return map[status] || status;
    };

    // Helper for Status Badge Color
    const getStatusColor = (status: string) => {
        const map: Record<string, string> = {
            'ACTIVE': 'bg-green-100 text-green-700 border-green-200',
            'INACTIVE': 'bg-gray-100 text-gray-700 border-gray-200',
            'GRADUATED': 'bg-blue-100 text-blue-700 border-blue-200',
            'DROPPED': 'bg-red-100 text-red-700 border-red-200',
            'RETIRADO': 'bg-red-100 text-red-700 border-red-200',
            'ABANDONO': 'bg-orange-100 text-orange-700 border-orange-200',
            'NO_INCORPORADO': 'bg-yellow-100 text-yellow-700 border-yellow-200'
        };
        return map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    // Calculate Admission Date (Earliest Enrollment)
    const getAdmissionDate = () => {
        if (!academicHistory || academicHistory.length === 0) return 'Sin inscripciones';
        
        // Find earliest date
        const sortedHistory = [...academicHistory].sort((a, b) => 
            new Date(a.enrollmentDate).getTime() - new Date(b.enrollmentDate).getTime()
        );
        
        return new Date(sortedHistory[0].enrollmentDate).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/dashboard/students')} 
                        className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#004694] hover:border-[#004694] transition-all shadow-sm group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#004694] flex items-center gap-2">
                            <BookOpen className="text-blue-500" />
                            Historial Académico
                        </h1>
                        <p className="text-gray-500 font-medium ml-1">
                            Estudiante: <span className="text-gray-800 font-bold">{selectedStudent.user.firstName} {selectedStudent.user.paternalSurname} {selectedStudent.user.maternalSurname}</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowPreview(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:text-[#004694] transition-all shadow-sm"
                    >
                        <Eye size={20} />
                        Previsualizar
                    </button>
                    {/* Only render PDF Link when not loading to prevent crash */}
                    {(() => {
                        if (!isLoading && selectedStudent) {
                             console.log('Rendering PDF with:', { student: selectedStudent, history: academicHistory });
                        }
                        return null;
                    })()}
                    {!isLoading && selectedStudent && (
                        <PDFDownloadLink
                            document={
                                <AcademicHistoryPDF 
                                    student={selectedStudent} 
                                    history={academicHistory}
                                    userWhoGenerated={user ? `${user.firstName} ${user.paternalSurname}` : 'Usuario Sistema'}
                                    clientIp={clientIp}
                                />
                            }
                            fileName={`${selectedStudent.user.firstName}_${selectedStudent.user.paternalSurname}_${new Date().getFullYear()}.pdf`}
                            className="flex items-center gap-2 px-6 py-3 bg-[#004694] text-white rounded-xl font-bold hover:bg-[#003da5] transition-transform hover:scale-105 shadow-lg shadow-blue-900/20"
                        >
                            {({ loading }) => (
                                <>
                                    <Download size={20} />
                                    {loading ? 'Generando...' : 'Descargar PDF'}
                                </>
                            )}
                        </PDFDownloadLink>
                    )}
                </div>
            </div>

            {/* Student Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
                    <div className={`p-4 rounded-xl ${getStatusColor(selectedStudent.enrollmentStatus).replace('text-', 'bg-opacity-20 ')}`}>
                        <GraduationCap size={32} className={getStatusColor(selectedStudent.enrollmentStatus).split(' ')[1]} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Estado Actual</p>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold inline-block border ${getStatusColor(selectedStudent.enrollmentStatus)}`}>
                            {translateStatus(selectedStudent.enrollmentStatus)}
                        </div>
                    </div>
                </div>
                
                {/* Admission Date Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-4 bg-blue-50 text-[#004694] rounded-xl">
                        <Calendar size={32} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Fecha de Ingreso</p>
                        <p className="text-lg font-bold text-gray-800">
                             {getAdmissionDate()}
                        </p>
                    </div>
                </div>

                {/* Completed Courses Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                        <FileText size={32} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Módulos Aprobados</p>
                        <p className="text-3xl font-bold text-gray-800">
                            {academicHistory.filter(h => h.status === 'Aprobado' || h.status === 'COMPLETED').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Timeline / List */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#004694]">Registro de Actividad Académica</h2>
                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                        Total Registros: {academicHistory.length}
                    </span>
                </div>
                
                {academicHistory.length === 0 ? (
                    <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                        <div className="p-4 bg-gray-50 rounded-full mb-4">
                            <BookOpen size={48} className="text-gray-300" />
                        </div>
                        <p className="text-lg font-medium">No hay registros académicos disponibles.</p>
                        <p className="text-sm mt-2">El estudiante aún no se ha inscrito a ningún curso.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/80 text-left border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-extrabold text-[#004694] uppercase tracking-wider">Gestión / Periodo</th>
                                    <th className="px-6 py-4 text-xs font-extrabold text-[#004694] uppercase tracking-wider">Módulo / Nivel</th>
                                    <th className="px-6 py-4 text-xs font-extrabold text-[#004694] uppercase tracking-wider text-center">Nota Final</th>
                                    <th className="px-6 py-4 text-xs font-extrabold text-[#004694] uppercase tracking-wider text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {academicHistory.map((record) => (
                                    <tr key={record.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-600 font-bold text-xs border border-gray-200">
                                                    <span>{record.year}</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-700">{record.period}</div>
                                                    <div className="text-xs text-gray-400">Inscripción: {new Date(record.enrollmentDate).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800 group-hover:text-[#004694] transition-colors">{record.courseName}</div>
                                            <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">
                                                    {record.levelName}
                                                </span>
                                                <span className="text-gray-300 text-xs">•</span>
                                                <span className="text-xs text-gray-400 font-mono tracking-wide">{record.courseCode}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {record.finalGrade !== null ? (
                                                <div className={`inline-flex flex-col items-center justify-center w-12 h-12 rounded-full border-2 ${
                                                    record.finalGrade >= 51 
                                                        ? 'border-green-100 bg-green-50 text-green-700' 
                                                        : 'border-red-100 bg-red-50 text-red-700'
                                                }`}>
                                                    <span className="text-sm font-bold">{Number(record.finalGrade).toFixed(0)}</span>
                                                    <span className="text-[9px] uppercase font-bold opacity-60">
                                                        {record.finalGrade >= 51 ? 'Apr' : 'Rep'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 italic text-sm">--</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                                                record.status === 'Aprobado' || record.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' :
                                                record.status === 'Cursando' || record.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                'bg-gray-100 text-gray-700 border-gray-200'
                                            }`}>
                                                {record.status === 'ACTIVE' ? 'CURSANDO' : record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {/* PDF Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                <FileText className="text-[#004694]" size={20} />
                                Vista Previa del Historial
                            </h3>
                            <button 
                                onClick={() => setShowPreview(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-100 p-4">
                            <PDFViewer width="100%" height="100%" className="w-full h-full rounded-lg shadow-inner border border-gray-200">
                                <AcademicHistoryPDF 
                                    student={selectedStudent} 
                                    history={academicHistory}
                                    userWhoGenerated={user ? `${user.firstName} ${user.paternalSurname}` : 'Usuario Sistema'}
                                    clientIp={clientIp}
                                />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentHistoryPage;
