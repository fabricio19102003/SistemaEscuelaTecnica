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
import AutoPromotionModal from '../../components/enrollment/AutoPromotionModal';

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
    const [showAutoPromoteModal, setShowAutoPromoteModal] = useState(false);

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
            {showAutoPromoteModal && (
                <AutoPromotionModal 
                    onClose={() => setShowAutoPromoteModal(false)}
                    onSuccess={() => {
                        fetchEnrollments();
                        Swal.fire({
                            title: 'Proceso Finalizado',
                            text: 'La promoción automática ha concluido.',
                            icon: 'success'
                        });
                    }}
                />
            )}
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

            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004694] via-[#005ba3] to-[#006fd6] p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3 flex items-center gap-3">
                        <FileText size={40} className="text-blue-200" />
                        Gestión de Matrículas
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl font-medium">
                        Administra las inscripciones, genera reportes y gestiona los comprobantes de matrícula.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
            </div>

            {/* Toolbar & Filters */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Filtros y Acciones</h2>
                    <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                         <button
                            onClick={handleExportReport}
                            disabled={isGeneratingReport}
                            className="flex-1 lg:flex-none justify-center items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-md transition-all disabled:opacity-50"
                        >
                            {isGeneratingReport ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <FileSpreadsheet size={20} />
                            )}
                            <span>Exportar Lista</span>
                        </button>

                        <button
                            onClick={() => setShowAutoPromoteModal(true)}
                            className="flex-1 lg:flex-none justify-center flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-md transition-all"
                        >
                            <div className="w-5 h-5 flex items-center justify-center border-2 border-white rounded-full">
                                <span className="text-[10px] font-bold">A</span>
                            </div>
                            <span>Promoción Auto.</span>
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/enrollments/new')}
                            className="flex-1 lg:flex-none justify-center flex items-center gap-2 px-4 py-2.5 bg-[#004694] hover:bg-[#003da5] text-white rounded-xl shadow-md transition-all"
                        >
                            <Plus size={20} />
                            <span>Nueva Matrícula</span>
                        </button>
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Buscar..." 
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004694] focus:border-transparent transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                           type="number"
                           placeholder="Gestión"
                           className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004694] focus:border-transparent transition-all"
                           value={selectedYear}
                           onChange={(e) => setSelectedYear(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-5 w-5 text-gray-400" />
                        </div>
                         <select
                            className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#004694] focus:border-transparent transition-all appearance-none"
                            value={selectedAcademicPeriod}
                            onChange={(e) => setSelectedAcademicPeriod(e.target.value)}
                         >
                            <option value="">Todos los Periodos</option>
                            <option value="1">Periodo 1</option>
                            <option value="2">Periodo 2</option>
                         </select>
                    </div>
                     <div className="relative">
                         <select
                            className="block w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#004694] focus:border-transparent transition-all appearance-none"
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                         >
                            <option value="">Todos los Módulos</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                         </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-[#004694] border-b border-[#003da5]">
                                <th className="text-left py-4 px-4 text-white font-bold">Estudiante</th>
                                <th className="text-left py-4 px-4 text-white font-bold">Grupo/Curso</th>
                                <th className="text-left py-4 px-4 text-white font-bold">Fecha</th>
                                <th className="text-left py-4 px-4 text-white font-bold">Estado</th>
                                <th className="text-left py-4 px-4 text-white font-bold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Cargando...</td></tr>
                            ) : filteredEnrollments.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No hay matrículas registradas o no coinciden con la búsqueda</td></tr>
                            ) : (
                                filteredEnrollments.map((enrollment: any) => (
                                    <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="text-gray-900 font-bold">
                                                {enrollment.student?.user?.firstName} {enrollment.student?.user?.paternalSurname}
                                            </div>
                                            <div className="text-xs text-gray-500">{enrollment.student?.registrationCode}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-gray-600">
                                                {enrollment.group?.level?.course?.name} ({enrollment.group?.level?.name})
                                            </div>
                                            <div className="text-xs text-gray-500">{enrollment.group?.code}</div>
                                        </td>
                                        <td className="py-4 px-4 text-gray-600">
                                            {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                                        </td>
                                         <td className="py-4 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                enrollment.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
                                            }`}>
                                                {enrollment.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleViewPdf(enrollment.id)}
                                                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" 
                                                    title="Ver PDF"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(enrollment.id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors" 
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
