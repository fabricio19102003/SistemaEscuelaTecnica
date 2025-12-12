import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseStore } from '../../store/course.store';
import { useGradeStore } from '../../store/grade.store';
import { Save, Search, Download, ArrowLeft, Edit, CheckCircle, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { pdf } from '@react-pdf/renderer';
import ReportCardPDF from '../../components/grades/ReportCardPDF';
import axios from '../../services/api/axios';

const COMPETENCIES = [
    { id: 'SPEAKING', label: 'Speaking', className: 'bg-orange-50 text-orange-700 border-orange-200', dotColor: 'bg-orange-500' },
    { id: 'LISTENING', label: 'Listening', className: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500' },
    { id: 'READING', label: 'Reading', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
    { id: 'WRITING', label: 'Writing', className: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
    { id: 'VOCABULARY', label: 'Vocabulary', className: 'bg-purple-50 text-purple-700 border-purple-200', dotColor: 'bg-purple-500' },
    { id: 'GRAMMAR', label: 'Grammar', className: 'bg-pink-50 text-pink-700 border-pink-200', dotColor: 'bg-pink-500' }
];

const GradeEntryPage = () => {
    const navigate = useNavigate();
    // Stores
    const { courses, fetchCourses } = useCourseStore();
    const { enrollments, fetchGradesByCourse, saveGrades, loading } = useGradeStore();
    
    // Local State
    const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    
    // State structure updated: { [comp]: { progressTest: 0, classPerformance: 0, score: 0, comments: '' } }
    const [gradesData, setGradesData] = useState<any>({}); 
    const [generatingPdf, setGeneratingPdf] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // Fetch students when course changes
    useEffect(() => {
        if (selectedCourseId) {
            fetchGradesByCourse(Number(selectedCourseId));
            // When course changes, we stay in list mode but reset student selection
            setSelectedStudentId(''); 
            setViewMode('list');
        }
    }, [selectedCourseId, fetchGradesByCourse]);

    // Load existing grades when student select changes (and we are in edit mode)
    useEffect(() => {
        if (selectedStudentId && enrollments.length > 0 && viewMode === 'edit') {
            const enrollment = enrollments.find(e => e.student.id === Number(selectedStudentId));
            if (enrollment) {
                const loadedGrades: any = {};
                COMPETENCIES.forEach(comp => {
                    const existing = enrollment.grades.find(g => g.evaluationType === comp.id);
                    loadedGrades[comp.id] = {
                        progressTest: existing ? Number(existing.progressTest ?? 0) : '',
                        classPerformance: existing ? Number(existing.classPerformance ?? 0) : '',
                        score: existing ? Number(existing.gradeValue) : 0,
                        comments: existing ? existing.comments : ''
                    };
                });
                setGradesData(loadedGrades);
            }
        }
    }, [selectedStudentId, enrollments, viewMode]);

    const handleGradeChange = (compId: string, field: 'progressTest' | 'classPerformance' | 'comments', value: any) => {
        setGradesData((prev: any) => {
            const currentComp = prev[compId] || { progressTest: 0, classPerformance: 0, score: 0, comments: '' };
            const newData = { ...currentComp };

            if (field === 'comments') {
                newData.comments = value;
            } else {
                // Update numeric field
                const numValue = value === '' ? '' : Number(value);
                newData[field] = numValue;

                // Auto-calculate Score
                const pt = field === 'progressTest' ? (numValue === '' ? 0 : numValue) : (newData.progressTest === '' ? 0 : newData.progressTest);
                const cp = field === 'classPerformance' ? (numValue === '' ? 0 : numValue) : (newData.classPerformance === '' ? 0 : newData.classPerformance);
                
                newData.score = (Number(pt) + Number(cp)) / 2;
            }
            
            return {
                ...prev,
                [compId]: newData
            };
        });
    };

    const handleSave = async () => {
        if (!selectedCourseId || !selectedStudentId) return;

        const enrollment = enrollments.find(e => e.student.id === Number(selectedStudentId));
        if (!enrollment) return;

        // Transform data for backend
        const gradesPayload = Object.keys(gradesData).map(key => ({
            type: key,
            progressTest: Number(gradesData[key].progressTest) || 0,
            classPerformance: Number(gradesData[key].classPerformance) || 0,
            score: Number(gradesData[key].score) || 0,
            comments: gradesData[key].comments || ''
        }));

        try {
            await saveGrades(enrollment.id, gradesPayload);
            Swal.fire({
                title: 'Guardado',
                text: 'Las calificaciones han sido guardadas.',
                icon: 'success',
                confirmButtonColor: '#3085d6', 
                background: '#1f2937', 
                color: '#fff'
            });
            // Refresh
            fetchGradesByCourse(Number(selectedCourseId));
        } catch (error) {
            Swal.fire('Error', 'No se pudo guardar', 'error');
        }
    };

    const handleDownloadReport = async (studentId: number) => {
        const enrollment = enrollments.find(e => e.student.id === studentId);
        if (!enrollment) return;

        try {
            setGeneratingPdf(true);
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
            setGeneratingPdf(false);
        }
    };

    // Helper to calculate student average (simple visualization)
    const calculateAverage = (grades: any[]) => {
        if (!grades || grades.length === 0) return 0;
        const total = grades.reduce((sum, g) => sum + Number(g.gradeValue), 0);
        return (total / grades.length).toFixed(1);
    };

    const handleStartGrading = (studentId: string) => {
        setSelectedStudentId(studentId);
        setViewMode('edit');
    };

    const handleBack = () => {
        if (viewMode === 'edit') {
            setViewMode('list');
            setSelectedStudentId('');
        } else {
            navigate('/dashboard/grades');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={handleBack} 
                    className="p-2 bg-white text-gray-500 rounded-lg hover:bg-gray-50 transition border border-gray-200 hover:text-[#004694]"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                     <h2 className="text-2xl font-bold text-[#004694]">
                        {viewMode === 'list' ? 'Registro de Notas' : 'Editando Calificaciones'}
                    </h2>
                     {viewMode === 'edit' && enrollments.find(e => e.student.id === Number(selectedStudentId)) && (
                        <p className="text-gray-500 text-sm">
                            Estudiante: <span className="font-bold text-gray-900">{enrollments.find(e => e.student.id === Number(selectedStudentId))?.student.user.firstName} {enrollments.find(e => e.student.id === Number(selectedStudentId))?.student.user.paternalSurname}</span>
                        </p>
                     )}
                </div>
            </div>

            {/* View Mode: LIST */}
            {viewMode === 'list' && (
                <div className="space-y-6">
                    {/* Course Selector */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Seleccionar Curso para ver Estudiantes</label>
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
                                            <th className="px-6 py-4 text-center">Progreso</th>
                                            <th className="px-6 py-4 text-center">Promedio Actual</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {enrollments.map((enrollment) => {
                                            const hasGrades = enrollment.grades && enrollment.grades.length > 0;
                                            const average = calculateAverage(enrollment.grades);
                                            
                                            return (
                                                <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-gray-900 font-medium">
                                                        {enrollment.student.user.paternalSurname} {enrollment.student.user.maternalSurname}, {enrollment.student.user.firstName}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {hasGrades ? (
                                                            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold bg-emerald-50 py-1 px-3 rounded-full inline-flex border border-emerald-100">
                                                                <CheckCircle size={14} />
                                                                <span>Registrado</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center gap-2 text-gray-500 bg-gray-100 py-1 px-3 rounded-full inline-flex border border-gray-200">
                                                                <AlertCircle size={14} />
                                                                <span>Pendiente</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-[#004694]">
                                                        {hasGrades ? average : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleStartGrading(enrollment.student.id.toString())}
                                                            className="inline-flex items-center gap-2 bg-[#004694] hover:bg-[#003da5] text-white px-3 py-2 rounded-lg transition-colors text-xs font-bold shadow-sm"
                                                        >
                                                            <Edit size={14} />
                                                            Calificar
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {enrollments.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
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
                            <Search className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">Seleccione un curso para ver la lista de estudiantes.</p>
                        </div>
                    )}
                </div>
            )}


            {/* View Mode: EDIT (Grading Form) */}
            {viewMode === 'edit' && selectedStudentId && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 border border-gray-200">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-[#004694]">
                            Evaluación de Competencias
                        </h3>
                        <div className="flex gap-2">
                             <button
                                onClick={() => handleDownloadReport(Number(selectedStudentId))}
                                disabled={generatingPdf}
                                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-gray-200 shadow-sm"
                            >
                                <Download size={18} />
                                {generatingPdf ? 'Generando...' : 'Boletín'}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-[#004694] hover:bg-[#003da5] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                            >
                            <Save size={18} />
                            {loading ? 'Guardando...' : 'Guardar Notas'}
                            </button>
                        </div>
                    </div>

                    <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {COMPETENCIES.map((comp) => (
                            <div key={comp.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all bg-white">
                                <div className={`p-3 font-bold text-sm border-b border-gray-100 flex justify-between items-center ${comp.className}`}>
                                     <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${comp.dotColor}`}></div>
                                        <span>{comp.label}</span>
                                    </div>
                                    <span className="text-xs opacity-90 font-mono bg-white/50 px-2 py-0.5 rounded">Nota Final: {gradesData[comp.id]?.score ?? 0}</span>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 truncate">Progress Test (50%)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={gradesData[comp.id]?.progressTest ?? ''}
                                                onChange={(e) => handleGradeChange(comp.id, 'progressTest', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004694] bg-white text-gray-900 text-center font-bold shadow-sm transition-colors outline-none"
                                                placeholder="0-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 truncate">Class Perf. (50%)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={gradesData[comp.id]?.classPerformance ?? ''}
                                                onChange={(e) => handleGradeChange(comp.id, 'classPerformance', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004694] bg-white text-gray-900 text-center font-bold shadow-sm transition-colors outline-none"
                                                placeholder="0-100"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-2 border-t border-gray-100">
                                         <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Final Score</label>
                                            <span className={`text-lg font-bold px-3 py-1 rounded-lg ${
                                                (gradesData[comp.id]?.score ?? 0) >= 51 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                                {gradesData[comp.id]?.score ?? 0}
                                            </span>
                                         </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teacher's Comments</label>
                                        <textarea
                                            rows={2}
                                            value={gradesData[comp.id]?.comments ?? ''}
                                            onChange={(e) => handleGradeChange(comp.id, 'comments', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004694] bg-white text-gray-900 text-sm placeholder-gray-400 transition-colors outline-none resize-none"
                                            placeholder="Write a comment..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GradeEntryPage;
