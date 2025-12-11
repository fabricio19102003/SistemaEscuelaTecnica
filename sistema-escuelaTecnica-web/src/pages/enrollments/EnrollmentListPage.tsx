import { useEffect, useState } from 'react';
import { useEnrollmentStore } from '../../store/enrollment.store';
import { useCourseStore } from '../../store/course.store';
import { useAuthStore } from '../../store/auth.store';
import { Plus, Search, FileText, Trash2, X, Download, Filter, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { PDFViewer } from '@react-pdf/renderer';
import EnrollmentPDF from '../../components/enrollment/EnrollmentPDF';
import EnrollmentListPDF from '../../components/enrollment/EnrollmentListPDF';

const EnrollmentListPage = () => {
    const { enrollments, fetchEnrollments, fetchEnrollmentById, selectedEnrollment, deleteEnrollment, isLoading, fetchEnrollmentReport } = useEnrollmentStore();
    const { courses, fetchCourses } = useCourseStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [selectedAcademicPeriod, setSelectedAcademicPeriod] = useState<string>(''); // '1', '2', or ''
    const [selectedCourseId, setSelectedCourseId] = useState<string>(''); // Default empty for ALL

    // State for PDF Modal
    const [showPdfModal, setShowPdfModal] = useState(false);
    
    // State for Report Modal
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [clientIp, setClientIp] = useState('Cargando...');

    useEffect(() => {
        fetchEnrollments();
        fetchCourses();
        // Fetch IP on mount or when needed
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => setClientIp(data.ip))
            .catch(() => setClientIp('No disponible'));
    }, [fetchEnrollments, fetchCourses]);

    const filteredEnrollments = enrollments.filter(enrollment => {
        const studentName = `${enrollment.student?.user?.firstName} ${enrollment.student?.user?.paternalSurname}`.toLowerCase();
        const courseName = enrollment.group?.level?.course?.name?.toLowerCase() || '';
        const groupCode = enrollment.group?.code?.toLowerCase() || '';
        const matchesSearch = studentName.includes(searchTerm.toLowerCase()) || 
                              courseName.includes(searchTerm.toLowerCase()) ||
                              groupCode.includes(searchTerm.toLowerCase());

        const enrollmentDate = new Date(enrollment.enrollmentDate);
        const enrollmentYear = enrollmentDate.getFullYear().toString();
        const enrollmentMonth = enrollmentDate.getMonth(); // 0-11

        const matchesYear = selectedYear ? enrollmentYear === selectedYear : true;
        
        const matchesAcademicPeriod = selectedAcademicPeriod ? (
            selectedAcademicPeriod === '1' ? enrollmentMonth < 6 : enrollmentMonth >= 6
        ) : true;

        const matchesCourse = selectedCourseId ? (
            enrollment.group?.level?.courseId === Number(selectedCourseId)
        ) : true;

        return matchesSearch && matchesYear && matchesAcademicPeriod && matchesCourse;
    });

    const handleViewPdf = async (id: number) => {
        await fetchEnrollmentById(id);
        setShowPdfModal(true);
    };

    const handleExportReport = async () => {
        setIsGeneratingReport(true);
        try {
            const data = await fetchEnrollmentReport({
                year: selectedYear,
                academicPeriod: selectedAcademicPeriod,
                courseId: selectedCourseId ? Number(selectedCourseId) : undefined
            });
            setReportData(data);
            setShowReportModal(true);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo generar el reporte',
                icon: 'error',
                background: '#1f2937', 
                color: '#fff'
            });
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción. Se eliminará la matrícula permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1f2937', 
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await deleteEnrollment(id);
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'La matrícula ha sido eliminada.',
                    icon: 'success',
                    background: '#1f2937', 
                    color: '#fff'
                });
            } catch (error: any) {
                Swal.fire({
                    title: 'Error',
                    text: error.message || 'No se pudo eliminar la matrícula',
                    icon: 'error',
                    background: '#1f2937', 
                    color: '#fff'
                });
            }
        }
    };

    const getCourseName = () => {
        if (!selectedCourseId) return 'TODOS LOS MÓDULOS';
        const course = courses.find(c => c.id === Number(selectedCourseId));
        return course ? course.name : 'MÓDULO DESCONOCIDO';
    };

    const userWhoGenerated = user ? `${user.firstName} ${user.paternalSurname} ${user.maternalSurname || ''}`.trim() : 'Usuario del Sistema';
    


    return (
        <div className="space-y-6">
             {/* Report Modal */}
             {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-900 text-white rounded-t-xl">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FileSpreadsheet size={20} /> Reporte de Estudiantes Matriculados
                            </h3>
                            <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-100 overflow-hidden">
                            <PDFViewer width="100%" height="100%" className="w-full h-full">
                                <EnrollmentListPDF 
                                    data={reportData} 
                                    filterInfo={{
                                        year: selectedYear,
                                        academicPeriod: selectedAcademicPeriod,
                                        moduleName: getCourseName()
                                    }}
                                    userWhoGenerated={userWhoGenerated}
                                    clientIp={clientIp}
                                />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}

             {/* Individual PDF Modal */}
             {showPdfModal && selectedEnrollment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-900 text-white rounded-t-xl">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Download size={20} /> Vista Previa de Matrícula
                            </h3>
                            <button onClick={() => setShowPdfModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-100 overflow-hidden">
                            <PDFViewer width="100%" height="100%" className="w-full h-full">
                                <EnrollmentPDF 
                                    data={selectedEnrollment} 
                                    credentials={{ username: selectedEnrollment.student?.user?.username }} 
                                    userWhoGenerated={userWhoGenerated}
                                    clientIp={clientIp}
                                />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Matrículas</h1>
                    <p className="text-gray-400">Gestión de inscripciones y generación de comprobantes</p>
                </div>
                <div className="flex gap-2">
                     <button
                        onClick={handleExportReport}
                        disabled={isGeneratingReport}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-lg shadow-green-900/20 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
                    >
                        {isGeneratingReport ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <FileSpreadsheet size={20} />
                        )}
                        <span>Exportar Lista</span>
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/enrollments/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-200 transform hover:scale-[1.02]"
                    >
                        <Plus size={20} />
                        <span>Nueva Matrícula</span>
                    </button>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                 <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Buscar por estudiante, curso o código..." 
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full md:w-32">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                           type="number"
                           placeholder="Gestión"
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                           value={selectedYear}
                           onChange={(e) => setSelectedYear(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full md:w-48">
                         <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                         <select
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                            value={selectedAcademicPeriod}
                            onChange={(e) => setSelectedAcademicPeriod(e.target.value)}
                         >
                            <option value="" className="text-gray-900">Todos los Periodos</option>
                            <option value="1" className="text-gray-900">Periodo 1</option>
                            <option value="2" className="text-gray-900">Periodo 2</option>
                         </select>
                    </div>
                     <div className="relative w-full md:w-64">
                         <select
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-3 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                         >
                            <option value="" className="text-gray-900">Todos los Módulos</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id} className="text-gray-900">
                                    {course.name}
                                </option>
                            ))}
                         </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-4 px-4 text-gray-400 font-medium">Estudiante</th>
                                <th className="text-left py-4 px-4 text-gray-400 font-medium">Grupo/Curso</th>
                                <th className="text-left py-4 px-4 text-gray-400 font-medium">Fecha</th>
                                <th className="text-left py-4 px-4 text-gray-400 font-medium">Estado</th>
                                <th className="text-left py-4 px-4 text-gray-400 font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Cargando...</td></tr>
                            ) : filteredEnrollments.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No hay matrículas registradas o no coinciden con la búsqueda</td></tr>
                            ) : (
                                filteredEnrollments.map((enrollment: any) => (
                                    <tr key={enrollment.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="text-white font-medium">
                                                {enrollment.student?.user?.firstName} {enrollment.student?.user?.paternalSurname}
                                            </div>
                                            <div className="text-xs text-gray-500">{enrollment.student?.registrationCode}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-gray-300">
                                                {enrollment.group?.level?.course?.name} ({enrollment.group?.level?.name})
                                            </div>
                                            <div className="text-xs text-gray-500">{enrollment.group?.code}</div>
                                        </td>
                                        <td className="py-4 px-4 text-gray-300">
                                            {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                                        </td>
                                         <td className="py-4 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                enrollment.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {enrollment.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleViewPdf(enrollment.id)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors" 
                                                    title="Ver PDF"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(enrollment.id)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors" 
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EnrollmentListPage;
