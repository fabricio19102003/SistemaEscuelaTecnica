import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeacherStore } from '../../store/teacher.store';
import { useGradeStore } from '../../store/grade.store';
import { useAuthStore } from '../../store/auth.store';
import { useSystemSettingsStore } from '../../store/system-settings.store';
import { 
    ArrowLeft, 
    Search,
    FileText,
    Loader,
    CheckCircle,
    AlertCircle,
    Edit,
    Save,
    Download,
    Eye,
    X,
    ArrowUpAZ,
    ArrowDownAZ
} from 'lucide-react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import EnrollmentListPDF from '../../components/enrollment/EnrollmentListPDF';
import ReportCardPDF from '../../components/grades/ReportCardPDF';
import OfficialReportPDF from '../../components/grades/OfficialReportPDF';
import Swal from 'sweetalert2';
import axios from '../../services/api/axios';
import { submitGrades } from '../../services/group.service';

interface TeacherCourseDetailPageProps {
    defaultTab?: 'students' | 'grades';
}

const COMPETENCIES = [
    { id: 'SPEAKING', label: 'Speaking', className: 'bg-orange-50 text-orange-700 border-orange-200', dotColor: 'bg-orange-500' },
    { id: 'LISTENING', label: 'Listening', className: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500' },
    { id: 'READING', label: 'Reading', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
    { id: 'WRITING', label: 'Writing', className: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
    { id: 'VOCABULARY', label: 'Vocabulary', className: 'bg-purple-50 text-purple-700 border-purple-200', dotColor: 'bg-purple-500' },
    { id: 'GRAMMAR', label: 'Grammar', className: 'bg-pink-50 text-pink-700 border-pink-200', dotColor: 'bg-pink-500' }
];

const TeacherCourseDetailPage = ({ defaultTab = 'students' }: TeacherCourseDetailPageProps) => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { myCourses, selectedCourseStudents, fetchCourseStudents, fetchMyCourses, isLoading } = useTeacherStore();
    const { fetchGradesByGroup, enrollments: gradeEnrollments, saveGrades, loading: gradesLoading } = useGradeStore();
    const { getSettingValue, fetchSettings } = useSystemSettingsStore();
    
    const isGradesModule = defaultTab === 'grades';

    // Local State
    const [viewMode, setViewMode] = useState<'list' | 'grading'>('list');
    const [sortConfig, setSortConfig] = useState<{ key: 'surname' | 'name' | 'ci'; direction: 'asc' | 'desc' }>({ key: 'surname', direction: 'asc' });

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);
    const [gradesData, setGradesData] = useState<any>({});
    const [generatingPdf, setGeneratingPdf] = useState(false);

    // PDF Modal for Enrollment List
    const [showPdfModal, setShowPdfModal] = useState(false);
    
    // PDF Modal for Report Card preview
    const [showReportPreview, setShowReportPreview] = useState(false);
    const [reportPreviewData, setReportPreviewData] = useState<any>(null);

    // PDF Modal for Official Report Preview (Acta)
    const [showOfficialReportPreview, setShowOfficialReportPreview] = useState(false);
    const [officialReportData, setOfficialReportData] = useState<any>(null);

    const [clientIp, setClientIp] = useState('N/A');

    const courseInfo = myCourses.find(c => c.id === Number(groupId));

    useEffect(() => {
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => setClientIp(data.ip))
            .catch(() => setClientIp('N/A'));
    }, []);

    useEffect(() => {
        if (myCourses.length === 0) {
            fetchMyCourses();
        }

        if (groupId) {
            fetchCourseStudents(Number(groupId));
            if (isGradesModule) {
                fetchGradesByGroup(Number(groupId));
                fetchSettings();
            }
        }
    }, [groupId, isGradesModule, fetchCourseStudents, fetchGradesByGroup, myCourses.length, fetchMyCourses]);

    const handleBack = () => {
        if (viewMode === 'grading') {
            setViewMode('list');
            setSelectedEnrollmentId(null);
            setGradesData({});
        } else {
            if (isGradesModule) {
                navigate('/teacher/grades');
            } else {
                navigate('/teacher/courses');
            }
        }
    };

    const handleStartGrading = (enrollment: any) => {
        setSelectedEnrollmentId(enrollment.id);
        
        const loadedGrades: any = {};
        COMPETENCIES.forEach(comp => {
            const existing = enrollment.grades?.find((g: any) => g.evaluationType === comp.id);
            loadedGrades[comp.id] = {
                progressTest: existing ? (existing.progressTest ?? '') : '',
                classPerformance: existing ? (existing.classPerformance ?? '') : '',
                score: existing ? Number(existing.gradeValue) : 0,
                comments: existing ? existing.comments : ''
            };
        });
        setGradesData(loadedGrades);
        setViewMode('grading');
    };

    const handleGradeChange = (compId: string, field: 'progressTest' | 'classPerformance' | 'comments', value: any) => {
        setGradesData((prev: any) => {
            const currentComp = prev[compId] || { progressTest: '', classPerformance: '', score: 0, comments: '' };
            const newData = { ...currentComp };

            if (field === 'comments') {
                newData.comments = value;
            } else {
                const numValue = value === '' ? '' : value;
                newData[field] = numValue;

                const pt = newData.progressTest === '' ? 0 : Number(newData.progressTest);
                const cp = newData.classPerformance === '' ? 0 : Number(newData.classPerformance);
                
                if (newData.progressTest !== '' || newData.classPerformance !== '') {
                    newData.score = (pt + cp) / 2;
                }
            }
            
            return {
                ...prev,
                [compId]: newData
            };
        });
    };

    const handleSaveGrades = async () => {
        if (!selectedEnrollmentId) return;

        const gradesPayload = Object.keys(gradesData).map(key => ({
            type: key,
            progressTest: gradesData[key].progressTest === '' ? 0 : Number(gradesData[key].progressTest),
            classPerformance: gradesData[key].classPerformance === '' ? 0 : Number(gradesData[key].classPerformance),
            score: Number(gradesData[key].score) || 0,
            comments: gradesData[key].comments || ''
        }));

        try {
            await saveGrades(selectedEnrollmentId, gradesPayload);
            await fetchGradesByGroup(Number(groupId));
            Swal.fire({
                title: 'Guardado',
                text: 'Calificaciones registradas correctamente',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                background: '#1f2937', color: '#fff'
            });
            handleBack(); 
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron guardar las notas',
                icon: 'error',
                background: '#1f2937', color: '#fff'
            });
        }
    };

    const handleDownloadReport = async (enrollmentId: number) => {
        try {
            const enrollment = gradeEnrollments.find(e => e.id === enrollmentId);
            if (!enrollment) return;

            setGeneratingPdf(true);
            const { data } = await axios.get(`/grades/report-card/${enrollmentId}`);
            
            const blob = await pdf(
                <ReportCardPDF 
                    data={data} 
                    period={data.period}
                    courseName={data.courseName}
                    teacherName={data.teacherName}
                    studentName={data.studentName}
                    scheduleTime={data.schedule}
                    nextCourse={data.nextCourse} // Passing the backend-provided value
                    userWhoGenerated={userName} 
                    clientIp={clientIp} 
                />
            ).toBlob();
            
            const u = enrollment.student.user;
            const fullName = `${u.firstName}_${u.paternalSurname}`.toUpperCase();
            
            const rawCourseName = data.group?.level?.course?.name || 'CURSO';
            const courseName = rawCourseName.replace(/\s+/g, '_').toUpperCase();
            
            const year = new Date().getFullYear();
            const fileName = `BOLETIN_${courseName}_${year}_${fullName}.pdf`;

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF Error', error);
            Swal.fire('Error', 'No se pudo generar el boletín', 'error');
        } finally {
            setGeneratingPdf(false);
        }
    };

    const handlePreviewReport = async (enrollmentId: number) => {
        try {
            setGeneratingPdf(true);
            const { data } = await axios.get(`/grades/report-card/${enrollmentId}`);
            setReportPreviewData(data);
            setShowReportPreview(true);
        } catch (error) {
             console.error('PDF Preview Error', error);
            Swal.fire('Error', 'No se pudo cargar la vista previa', 'error');
        } finally {
            setGeneratingPdf(false);
        }
    };

    const handlePreviewOfficialReport = async () => {
        if (!courseInfo) return;
        try {
            setGeneratingPdf(true);
            const { data } = await axios.get(`/grades/report/group/${groupId}`);
            if (!data || !data.enrollments) {
                 throw new Error("Invalid data format received");
            }
            setOfficialReportData(data);
            setShowOfficialReportPreview(true);
        } catch (error) {
            console.error('Error fetching official report data:', error);
            Swal.fire('Error', 'No se pudo cargar la vista previa del acta', 'error');
        } finally {
            setGeneratingPdf(false);
        }
    };

    const handleDownloadOfficialReport = async () => {
         if (!officialReportData || !courseInfo) return;

         try {
            const blob = await pdf(<OfficialReportPDF data={officialReportData} userWhoGenerated={userName} clientIp={clientIp} />).toBlob();
            
            const courseName = courseInfo.level.course.name.replace(/\s+/g, '_').toUpperCase();
            const gestion = new Date().getFullYear(); // Or pull from courseInfo if available
            const fileName = `${courseName}+${gestion}+acta_calificaciones.pdf`;

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            setShowOfficialReportPreview(false); // Close modal after download
            Swal.fire({
                title: 'Descargado',
                text: 'El acta se ha descargado correctamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: '#1f2937', color: '#fff'
            });

         } catch (error) {
             console.error('Error downloading official report:', error);
             Swal.fire('Error', 'No se pudo descargar el acta', 'error');
         }
    };

    const sourceList = isGradesModule ? gradeEnrollments : selectedCourseStudents;
    
    const filteredList = sourceList
        .filter(e => {
            const fullName = `${e.student?.user?.firstName} ${e.student?.user?.paternalSurname}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase()) || 
                   e.student?.registrationCode?.toLowerCase()?.includes(searchTerm.toLowerCase());
        })
        .sort((a, b) => {
            let valA = '';
            let valB = '';

            switch (sortConfig.key) {
                case 'surname':
                    valA = `${a.student.user.paternalSurname} ${a.student.user.maternalSurname || ''}`.trim();
                    valB = `${b.student.user.paternalSurname} ${b.student.user.maternalSurname || ''}`.trim();
                    break;
                case 'name':
                    valA = a.student.user.firstName;
                    valB = b.student.user.firstName;
                    break;
                case 'ci':
                    valA = a.student.documentNumber || '';
                    valB = b.student.documentNumber || '';
                    break;
            }

            return sortConfig.direction === 'asc' 
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        });

    if (!courseInfo && !isLoading && myCourses.length > 0) {
        return (
            <div className="text-center py-12 text-white">
                <h2 className="text-xl font-bold">Curso no encontrado</h2>
                <button onClick={handleBack} className="mt-4 text-blue-400 hover:underline">Volver</button>
            </div>
        );
    }

    const userName = user ? `${user.firstName} ${user.paternalSurname} ${user.maternalSurname || ''}`.trim() : 'Docente';

    const handleFinalizeGrades = async () => {
        const result = await Swal.fire({
            title: '¿Finalizar carga de notas?',
            text: "Una vez finalizado, se notificará a la administración y no podrás realizar más cambios. ¿Estás seguro?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#004694',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, finalizar',
            cancelButtonText: 'Cancelar',
             background: '#1f2937', color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await submitGrades(Number(groupId));
                // Update local state or refetch
                await fetchMyCourses(); 
                Swal.fire({
                    title: 'Finalizado!',
                    text: 'Las notas han sido enviadas correctamente.',
                    icon: 'success',
                     background: '#1f2937', color: '#fff'
                });
            } catch (error) {
                console.error('Error submitting grades:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Hubo un problema al finalizar las notas.',
                    icon: 'error',
                     background: '#1f2937', color: '#fff'
                });
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleBack}
                        className="p-2 text-gray-500 hover:text-[#004694] hover:bg-blue-50/50 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-[#004694] mb-1">
                            {viewMode === 'grading' ? 'Evaluando Estudiante' : (isGradesModule ? 'Registro de Notas' : 'Lista de Estudiantes')}
                        </h1>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="font-medium">Curso:</span>
                            <span className="text-gray-900 font-bold">{courseInfo?.level.course.name || '...'}</span>
                            {courseInfo && (
                                <>
                                    <span className="text-gray-400">|</span>
                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-medium">{courseInfo.level.name}</span>
                                    <span className="text-gray-400">|</span>
                                    <span className="font-mono text-gray-600">{courseInfo.code}</span>
                                    <span className="text-gray-400">|</span>
                                    <span className={`px-2 py-0.5 rounded border font-medium ${
                                        courseInfo.status === 'GRADES_SUBMITTED' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                        courseInfo.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                        'bg-gray-100 text-gray-800 border-gray-200'
                                    }`}>
                                        {courseInfo.status === 'GRADES_SUBMITTED' ? 'Notas Enviadas' : 
                                         courseInfo.status === 'COMPLETED' ? 'Finalizado' : 'En Progreso'}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    {!isGradesModule && viewMode === 'list' && (
                        <button
                            onClick={() => navigate(`/teacher/courses/${groupId}/attendance`)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#004694] hover:bg-[#003da5] text-white rounded-xl shadow-sm transition-all active:scale-95"
                        >
                            <CheckCircle size={18} />
                            <span className="font-bold">Asistencia</span>
                        </button>
                    )}

                    {isGradesModule && viewMode === 'list' && (
                        <>
                             {courseInfo?.status !== 'GRADES_SUBMITTED' && courseInfo?.status !== 'COMPLETED' && (
                                <button
                                    onClick={handleFinalizeGrades}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all active:scale-95"
                                >
                                    <CheckCircle size={18} />
                                    <span className="font-bold">Finalizar Notas</span>
                                </button>
                             )}
                            <button
                                onClick={handlePreviewOfficialReport}
                                disabled={generatingPdf}
                                className="flex items-center gap-2 px-4 py-2 bg-[#BF0811] hover:bg-[#a3070f] text-white rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {generatingPdf ? <Loader className="animate-spin" size={18} /> : <FileText size={18} />}
                                <span className="font-bold">Generar Acta</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {viewMode === 'list' && (
                <div className="space-y-6">
                    <div className="flex flex-col xl:flex-row justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-3 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Buscar estudiante..." 
                                    className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004694] focus:border-transparent transition-all shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            {/* Sorting Controls */}
                            <div className="flex items-center gap-2">
                                <select
                                    value={sortConfig.key}
                                    onChange={(e) => setSortConfig({ ...sortConfig, key: e.target.value as any })}
                                    className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-[#004694] focus:border-[#004694] block p-2.5 shadow-sm outline-none"
                                >
                                    <option value="surname">Apellidos</option>
                                    <option value="name">Nombres</option>
                                    <option value="ci">C.I.</option>
                                </select>
                                <button
                                    onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                                    className="p-2.5 text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-[#004694] shadow-sm transition-colors"
                                    title={sortConfig.direction === 'asc' ? 'Ascendente' : 'Descendente'}
                                >
                                    {sortConfig.direction === 'asc' ? <ArrowDownAZ size={20} /> : <ArrowUpAZ size={20} />}
                                </button>
                            </div>
                        </div>

                        {!isGradesModule && (
                            <button 
                                onClick={() => setShowPdfModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-200 transition-colors shadow-sm whitespace-nowrap"
                            >
                                <FileText size={18} className="text-emerald-600" />
                                <span>Generar Lista PDF</span>
                            </button>
                        )}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        {(isLoading || (isGradesModule && gradesLoading)) ? (
                             <div className="flex justify-center py-12">
                                <Loader className="animate-spin text-[#004694]" size={40} />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#004694] border-b border-[#003da5]">
                                        <tr className="text-white text-sm font-bold uppercase tracking-wider">
                                            <th className="py-4 px-6 rounded-tl-lg">Estudiante</th>
                                            <th className="py-4 px-6">R.E.</th>
                                            {isGradesModule && <th className="py-4 px-6 text-center">Nota</th>}
                                            <th className="py-4 px-6 text-center">{isGradesModule ? 'Estado Notas' : 'Estado Inscripción'}</th>
                                            {isGradesModule && <th className="py-4 px-6 text-right rounded-tr-lg">Acciones</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredList.length === 0 ? (
                                             <tr>
                                                <td colSpan={isGradesModule ? 5 : 3} className="py-12 text-center text-gray-500">
                                                    No se encontraron estudiantes
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredList.map((enrollment: any) => {
                                                const hasGrades = enrollment.grades && enrollment.grades.length > 0;
                                                const gradesCount = enrollment.grades?.length || 0;
                                                const isComplete = gradesCount >= 6; 

                                                return (
                                                    <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors group border-b border-gray-100 last:border-none">
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm border border-gray-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                                                                    {enrollment.student.user.firstName.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="text-gray-900 font-bold">
                                                                        {enrollment.student.user.paternalSurname} {enrollment.student.user.maternalSurname}, {enrollment.student.user.firstName}
                                                                    </div>
                                                                     <div className="text-xs text-gray-500">{enrollment.student.user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-gray-600 font-mono text-sm">
                                                            {enrollment.student.registrationCode}
                                                        </td>
                                                        {isGradesModule && (
                                                            <td className="py-4 px-6 text-center">
                                                                {hasGrades ? (
                                                                    (() => {
                                                                        const total = enrollment.grades.reduce((sum: number, g: any) => sum + Number(g.gradeValue), 0);
                                                                        const avg = total / 6; 
                                                                        return (
                                                                            <span className={`font-bold text-lg ${avg >= 51 ? 'text-[#004694]' : 'text-[#BF0811]'}`}>
                                                                                {avg.toFixed(1)}
                                                                            </span>
                                                                        );
                                                                    })()
                                                                ) : <span className="text-gray-400">-</span>}
                                                            </td>
                                                        )}
                                                        <td className="py-4 px-6 text-center">
                                                            {isGradesModule ? (
                                                                hasGrades ? (
                                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${isComplete ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                                        {isComplete ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                                                        {isComplete ? 'Completo' : 'En Progreso'}
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                                                        Sin Notas
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                    {enrollment.status}
                                                                </span>
                                                            )}
                                                        </td>
                                                        {isGradesModule && (
                                                            <td className="py-4 px-6 text-right">
                                                                 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                     {hasGrades && (
                                                                        <>
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); handlePreviewReport(enrollment.id); }}
                                                                                title="Ver Boletín"
                                                                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 hover:text-blue-700 transition-colors ring-1 ring-transparent hover:ring-blue-200"
                                                                            >
                                                                                <Eye size={18} />
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); handleDownloadReport(enrollment.id); }}
                                                                                title="Descargar Boletín"
                                                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors ring-1 ring-transparent hover:ring-gray-200"
                                                                            >
                                                                                <Download size={18} />
                                                                            </button>
                                                                        </>
                                                                     )}
                                                                    <button
                                                                        onClick={() => {
                                                                            const areGradesOpen = getSettingValue('GRADES_OPEN', 'true') === 'true';
                                                                            if (!areGradesOpen) {
                                                                                Swal.fire({
                                                                                    title: 'Deshabilitado',
                                                                                    text: 'El registro de notas está deshabilitado por administración.',
                                                                                    icon: 'warning',
                                                                                    background: '#1f2937', color: '#fff'
                                                                                });
                                                                                return;
                                                                            }
                                                                            handleStartGrading(enrollment)
                                                                        }}
                                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-bold shadow-sm ${
                                                                            getSettingValue('GRADES_OPEN', 'true') === 'true' 
                                                                                ? 'bg-[#004694] hover:bg-[#003da5] text-white' 
                                                                                : 'bg-gray-300 cursor-not-allowed text-gray-500'
                                                                        }`}
                                                                    >
                                                                        <Edit size={16} />
                                                                        Calificar
                                                                    </button>
                                                                 </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {viewMode === 'grading' && selectedEnrollmentId && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    {(() => {
                        const selectedEnrollment = gradeEnrollments.find(e => e.id === selectedEnrollmentId);
                        if (!selectedEnrollment) return null;
                        const s = selectedEnrollment.student;
                        const isReadOnly = courseInfo?.status === 'GRADES_SUBMITTED' || courseInfo?.status === 'COMPLETED';
                        
                        return (
                            <div className="flex justify-between items-center bg-white border border-gray-200 p-6 rounded-xl mb-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                     <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm flex-shrink-0 bg-gray-50">
                                         {s.user.profileImageUrl ? (
                                             <img 
                                                 src={s.user.profileImageUrl} 
                                                 alt="Estudiante" 
                                                 className="w-full h-full object-cover"
                                             />
                                         ) : (
                                              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-[#004694] text-2xl font-bold">
                                                  {s.user.firstName.charAt(0)}
                                              </div>
                                         )}
                                     </div>
                                    <div>
                                        <h3 className="text-[#004694] font-bold text-2xl mb-1">
                                            {s.user.firstName} {s.user.paternalSurname}
                                        </h3>
                                        <p className="text-gray-500">
                                            {isReadOnly 
                                                ? <span className="text-amber-600 font-bold flex items-center gap-2"><AlertCircle size={16}/> Curso Finalizado - Modo Lectura</span>
                                                : "Ingrese las notas para cada competencia"
                                            }
                                        </p>
                                    </div>
                                </div>
                                {!isReadOnly && (
                                    <button
                                        onClick={handleSaveGrades}
                                        disabled={gradesLoading}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-sm transition-all active:scale-95"
                                    >
                                        {gradesLoading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                                        Guardar Notas
                                    </button>
                                )}
                            </div>
                        );
                    })()}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {COMPETENCIES.map((comp) => (
                            <div key={comp.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className={`px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50`}>
                                    <span className={`font-bold flex items-center gap-2 text-sm px-3 py-1 rounded-full border ${comp.className}`}>
                                        <div className={`w-2 h-2 rounded-full ${comp.dotColor}`}></div>
                                        {comp.label}
                                    </span>
                                    <span className="text-xs bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md border border-gray-100 font-medium">
                                        Nota Final: <strong className={`ml-1 text-lg ${gradesData[comp.id]?.score >= 51 ? 'text-[#004694]' : 'text-[#BF0811]'}`}>
                                            {gradesData[comp.id]?.score?.toFixed(1) ?? 0}
                                        </strong>
                                    </span>
                                </div>
                                <div className="p-5 space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Progress Test</label>
                                            <div className="relative">
                                                <input
                                                    type="number" min="0" max="100"
                                                    disabled={courseInfo?.status === 'GRADES_SUBMITTED' || courseInfo?.status === 'COMPLETED'}
                                                    value={gradesData[comp.id]?.progressTest ?? ''}
                                                    onChange={(e) => handleGradeChange(comp.id, 'progressTest', e.target.value)}
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-center font-bold focus:border-[#004694] focus:ring-1 focus:ring-[#004694] focus:outline-none transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-500"
                                                    placeholder="0"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Class Perf.</label>
                                            <div className="relative">
                                                <input
                                                    type="number" min="0" max="100"
                                                    disabled={courseInfo?.status === 'GRADES_SUBMITTED' || courseInfo?.status === 'COMPLETED'}
                                                    value={gradesData[comp.id]?.classPerformance ?? ''}
                                                    onChange={(e) => handleGradeChange(comp.id, 'classPerformance', e.target.value)}
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-center font-bold focus:border-[#004694] focus:ring-1 focus:ring-[#004694] focus:outline-none transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-500"
                                                    placeholder="0"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Comentarios</label>
                                        <textarea 
                                            rows={2}
                                            disabled={courseInfo?.status === 'GRADES_SUBMITTED' || courseInfo?.status === 'COMPLETED'}
                                            value={gradesData[comp.id]?.comments ?? ''}
                                            onChange={(e) => handleGradeChange(comp.id, 'comments', e.target.value)}
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:border-[#004694] focus:ring-1 focus:ring-[#004694] focus:outline-none placeholder-gray-400 resize-none transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-500"
                                            placeholder="Escriba un comentario..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
             {showPdfModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                                <FileText size={20} className="text-[#004694]" /> Lista de Estudiantes
                            </h3>
                            <button onClick={() => setShowPdfModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-100/50">
                             <PDFViewer width="100%" height="100%" className="w-full h-full">
                                <EnrollmentListPDF 
                                    data={selectedCourseStudents.map(e => ({
                                        ...e,
                                        student: {
                                            ...e.student,
                                            documentNumber: e.student.documentNumber || 'N/A' 
                                        },
                                        enrollmentDate: e.enrollmentDate,
                                        group: {
                                             code: courseInfo?.code,
                                             level: { 
                                                 name: courseInfo?.level.name,
                                                 course: { name: courseInfo?.level.course.name } 
                                             }
                                        }
                                    }))} 
                                    filterInfo={{
                                        year: new Date().getFullYear().toString(),
                                        academicPeriod: '1', 
                                        moduleName: courseInfo?.level.course.name || ''
                                    }}
                                    userWhoGenerated={userName} 
                                    clientIp={"N/A"} 
                                />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}

            {showReportPreview && reportPreviewData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                                <Eye size={20} className="text-[#004694]" /> Vista Previa del Boletín
                            </h3>
                            <button onClick={() => setShowReportPreview(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-100/50">
                             <PDFViewer width="100%" height="100%" className="w-full h-full">
                                <ReportCardPDF 
                                    data={reportPreviewData} 
                                    period={reportPreviewData.period}
                                    courseName={reportPreviewData.courseName}
                                    teacherName={reportPreviewData.teacherName}
                                    studentName={reportPreviewData.studentName}
                                    scheduleTime={reportPreviewData.schedule}
                                    nextCourse={reportPreviewData.nextCourse} 
                                    userWhoGenerated={userName} 
                                    clientIp={clientIp} 
                                />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}

            {showOfficialReportPreview && officialReportData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                                <FileText size={20} className="text-[#004694]" /> Vista Previa: Acta de Calificaciones
                            </h3>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={handleDownloadOfficialReport}
                                    className="px-4 py-2 bg-[#BF0811] hover:bg-[#a3070f] text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-bold shadow-sm"
                                >
                                    <Download size={18} />
                                    Descargar Acta
                                </button>
                                <button onClick={() => setShowOfficialReportPreview(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-gray-100/50">
                             <PDFViewer width="100%" height="100%" className="w-full h-full">
                                <OfficialReportPDF data={officialReportData} userWhoGenerated={userName} clientIp={clientIp} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherCourseDetailPage;
