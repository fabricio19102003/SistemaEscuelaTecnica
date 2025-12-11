import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeacherStore } from '../../store/teacher.store';
import { useGradeStore } from '../../store/grade.store';
import { useAuthStore } from '../../store/auth.store';
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
    X
} from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import EnrollmentListPDF from '../../components/enrollment/EnrollmentListPDF';
import Swal from 'sweetalert2';
import axios from '../../services/api/axios';
import { pdf } from '@react-pdf/renderer';
import ReportCardPDF from '../../components/grades/ReportCardPDF';

interface TeacherCourseDetailPageProps {
    defaultTab?: 'students' | 'grades';
}

const COMPETENCIES = [
    { id: 'SPEAKING', label: 'Speaking', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    { id: 'LISTENING', label: 'Listening', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { id: 'READING', label: 'Reading', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { id: 'WRITING', label: 'Writing', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    { id: 'VOCABULARY', label: 'Vocabulary', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { id: 'GRAMMAR', label: 'Grammar', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' }
];

const TeacherCourseDetailPage = ({ defaultTab = 'students' }: TeacherCourseDetailPageProps) => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { myCourses, selectedCourseStudents, fetchCourseStudents, isLoading } = useTeacherStore();
    const { fetchGradesByGroup, enrollments: gradeEnrollments, saveGrades, loading: gradesLoading } = useGradeStore();
    
    const isGradesModule = defaultTab === 'grades';

    // Local State
    const [viewMode, setViewMode] = useState<'list' | 'grading'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);
    const [gradesData, setGradesData] = useState<any>({});
    const [generatingPdf, setGeneratingPdf] = useState(false);

    // PDF Modal
    const [showPdfModal, setShowPdfModal] = useState(false);

    const [clientIp, setClientIp] = useState('N/A');

    const courseInfo = myCourses.find(c => c.id === Number(groupId));

    useEffect(() => {
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => setClientIp(data.ip))
            .catch(() => setClientIp('N/A'));
    }, []);

    useEffect(() => {
        if (groupId) {
            fetchCourseStudents(Number(groupId));
            if (isGradesModule) {
                fetchGradesByGroup(Number(groupId));
            }
        }
    }, [groupId, isGradesModule, fetchCourseStudents, fetchGradesByGroup]);

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
                // Allow empty string for better UX while typing
                const numValue = value === '' ? '' : value;
                newData[field] = numValue;

                // Calculate score only if both are numbers
                const pt = newData.progressTest === '' ? 0 : Number(newData.progressTest);
                const cp = newData.classPerformance === '' ? 0 : Number(newData.classPerformance);
                
                // If the user hasn't typed anything yet, don't show a calculated score of 0, keep it as previous or 0
                newData.score = (pt + cp) / 2;
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
            
            // Pass user name and IP to PDF
            const blob = await pdf(<ReportCardPDF data={data} userWhoGenerated={userName} clientIp={clientIp} />).toBlob();
            
            const u = enrollment.student.user;
            const fullName = `${u.firstName}_${u.paternalSurname}`.toUpperCase();
            
            // Use data from the report response which has the full relation
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

    const sourceList = isGradesModule ? gradeEnrollments : selectedCourseStudents;
    
    const filteredList = sourceList.filter(e => {
        const fullName = `${e.student?.user?.firstName} ${e.student?.user?.paternalSurname}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || 
               e.student?.registrationCode?.toLowerCase()?.includes(searchTerm.toLowerCase());
    });

    if (!courseInfo && !isLoading && myCourses.length > 0) {
        return (
            <div className="text-center py-12 text-white">
                <h2 className="text-xl font-bold">Curso no encontrado</h2>
                <button onClick={handleBack} className="mt-4 text-blue-400 hover:underline">Volver</button>
            </div>
        );
    }

    // Format user name strings for PDF
    const userName = user ? `${user.firstName} ${user.paternalSurname} ${user.maternalSurname || ''}`.trim() : 'Docente';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleBack}
                    className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">
                        {viewMode === 'grading' ? 'Evaluando Estudiante' : (isGradesModule ? 'Registro de Notas' : 'Lista de Estudiantes')}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="text-gray-500">Curso:</span>
                        <span className="text-white font-medium">{courseInfo?.level.course.name || '...'}</span>
                        {courseInfo && (
                            <>
                                <span>|</span>
                                <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">{courseInfo.level.name}</span>
                                <span>|</span>
                                <span className="font-mono">{courseInfo.code}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {viewMode === 'list' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Buscar estudiante..." 
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {!isGradesModule && (
                            <button 
                                onClick={() => setShowPdfModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors"
                            >
                                <FileText size={18} className="text-green-400" />
                                <span>Generar Lista PDF</span>
                            </button>
                        )}
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        {(isLoading || (isGradesModule && gradesLoading)) ? (
                             <div className="flex justify-center py-12">
                                <Loader className="animate-spin text-blue-500" size={40} />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-black/20 border-b border-white/10">
                                        <tr className="text-gray-400 text-sm font-medium">
                                            <th className="py-4 px-6">Estudiante</th>
                                            <th className="py-4 px-6">R.E.</th>
                                            {isGradesModule && <th className="py-4 px-6 text-center">Nota</th>}
                                            <th className="py-4 px-6 text-center">{isGradesModule ? 'Estado Notas' : 'Estado Inscripción'}</th>
                                            {isGradesModule && <th className="py-4 px-6 text-right">Acciones</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredList.length === 0 ? (
                                             <tr>
                                                <td colSpan={isGradesModule ? 5 : 3} className="py-8 text-center text-gray-500">
                                                    No se encontraron estudiantes
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredList.map((enrollment: any) => {
                                                const hasGrades = enrollment.grades && enrollment.grades.length > 0;
                                                const gradesCount = enrollment.grades?.length || 0;
                                                const isComplete = gradesCount >= 6; 

                                                return (
                                                    <tr key={enrollment.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs border border-blue-500/30">
                                                                    {enrollment.student.user.firstName.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="text-white font-medium">
                                                                        {enrollment.student.user.paternalSurname} {enrollment.student.user.maternalSurname}, {enrollment.student.user.firstName}
                                                                    </div>
                                                                     <div className="text-xs text-gray-500">{enrollment.student.user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-gray-400 font-mono text-sm">
                                                            {enrollment.student.registrationCode}
                                                        </td>
                                                        {isGradesModule && (
                                                            <td className="py-4 px-6 text-center text-white font-bold">
                                                                {hasGrades ? (
                                                                    (() => {
                                                                        const total = enrollment.grades.reduce((sum: number, g: any) => sum + Number(g.gradeValue), 0);
                                                                        const avg = total / 6; // Provided there are 6 competencies
                                                                        // Or divide by gradesCount if dynamic, but usually fixed 6
                                                                        return avg.toFixed(1);
                                                                    })()
                                                                ) : '-'}
                                                            </td>
                                                        )}
                                                        <td className="py-4 px-6 text-center">
                                                            {isGradesModule ? (
                                                                hasGrades ? (
                                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${isComplete ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                                                        {isComplete ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                                                        {isComplete ? 'Completo' : 'En Progreso'}
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                                                                        Sin Notas
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                                    {enrollment.status}
                                                                </span>
                                                            )}
                                                        </td>
                                                        {isGradesModule && (
                                                            <td className="py-4 px-6 text-right">
                                                                 <div className="flex justify-end gap-2">
                                                                     {hasGrades && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleDownloadReport(enrollment.id); }}
                                                                            title="Descargar Boletín"
                                                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                                        >
                                                                            <Download size={18} />
                                                                        </button>
                                                                     )}
                                                                     <button
                                                                        onClick={() => handleStartGrading(enrollment)}
                                                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
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
                    <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl mb-6">
                        <div>
                            <h3 className="text-white font-bold text-lg">
                                {gradeEnrollments.find(e => e.id === selectedEnrollmentId)?.student.user.firstName} {gradeEnrollments.find(e => e.id === selectedEnrollmentId)?.student.user.paternalSurname}
                            </h3>
                            <p className="text-gray-400 text-sm">Ingrese las notas para cada competencia</p>
                        </div>
                        <button
                            onClick={handleSaveGrades}
                            disabled={gradesLoading}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                        >
                            {gradesLoading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                            Guardar Notas
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {COMPETENCIES.map((comp) => (
                            <div key={comp.id} className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
                                <div className={`px-4 py-3 border-b border-white/10 flex justify-between items-center ${comp.color}`}>
                                    <span className="font-bold">{comp.label}</span>
                                    <span className="text-xs bg-black/20 px-2 py-1 rounded">
                                        Nota Final: <strong className="text-white">{gradesData[comp.id]?.score?.toFixed(1) ?? 0}</strong>
                                    </span>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Progress Test (50%)</label>
                                            <input
                                                type="number" min="0" max="100"
                                                value={gradesData[comp.id]?.progressTest ?? ''}
                                                onChange={(e) => handleGradeChange(comp.id, 'progressTest', e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-center focus:border-blue-500 focus:outline-none"
                                                placeholder="0-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Class Perf. (50%)</label>
                                            <input
                                                type="number" min="0" max="100"
                                                value={gradesData[comp.id]?.classPerformance ?? ''}
                                                onChange={(e) => handleGradeChange(comp.id, 'classPerformance', e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-center focus:border-blue-500 focus:outline-none"
                                                placeholder="0-100"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <textarea 
                                            rows={2}
                                            value={gradesData[comp.id]?.comments ?? ''}
                                            onChange={(e) => handleGradeChange(comp.id, 'comments', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none placeholder-gray-600"
                                            placeholder="Comentarios del docente..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
             {showPdfModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-900 text-white rounded-t-xl">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FileText size={20} /> Lista de Estudiantes
                            </h3>
                            <button onClick={() => setShowPdfModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-100 overflow-hidden">
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
        </div>
    );
};

export default TeacherCourseDetailPage;
