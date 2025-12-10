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
    { id: 'SPEAKING', label: 'Speaking', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    { id: 'LISTENING', label: 'Listening', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { id: 'READING', label: 'Reading', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { id: 'WRITING', label: 'Writing', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    { id: 'VOCABULARY', label: 'Vocabulary', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { id: 'GRAMMAR', label: 'Grammar', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' }
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
                    className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition border border-slate-700"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                     <h2 className="text-2xl font-bold text-white">
                        {viewMode === 'list' ? 'Registro de Notas' : 'Editando Calificaciones'}
                    </h2>
                     {viewMode === 'edit' && enrollments.find(e => e.student.id === Number(selectedStudentId)) && (
                        <p className="text-gray-400 text-sm">
                            Estudiante: {enrollments.find(e => e.student.id === Number(selectedStudentId))?.student.user.firstName} {enrollments.find(e => e.student.id === Number(selectedStudentId))?.student.user.paternalSurname}
                        </p>
                     )}
                </div>
            </div>

            {/* View Mode: LIST */}
            {viewMode === 'list' && (
                <div className="space-y-6">
                    {/* Course Selector */}
                    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Seleccionar Curso para ver Estudiantes</label>
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
                                            <th className="px-6 py-4 text-center">Progreso</th>
                                            <th className="px-6 py-4 text-center">Promedio Actual</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700 text-sm">
                                        {enrollments.map((enrollment) => {
                                            const hasGrades = enrollment.grades && enrollment.grades.length > 0;
                                            const average = calculateAverage(enrollment.grades);
                                            
                                            return (
                                                <tr key={enrollment.id} className="hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-6 py-4 text-white font-medium">
                                                        {enrollment.student.user.paternalSurname} {enrollment.student.user.maternalSurname}, {enrollment.student.user.firstName}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {hasGrades ? (
                                                            <div className="flex items-center justify-center gap-2 text-emerald-400">
                                                                <CheckCircle size={16} />
                                                                <span>Registrado</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center gap-2 text-gray-500">
                                                                <AlertCircle size={16} />
                                                                <span>Pendiente</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-blue-400">
                                                        {hasGrades ? average : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleStartGrading(enrollment.student.id.toString())}
                                                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-xs font-medium"
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
                        <div className="text-center py-20 bg-slate-800/50 rounded-xl border border-dashed border-slate-600">
                            <Search className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                            <p className="text-gray-400">Seleccione un curso para ver la lista de estudiantes.</p>
                        </div>
                    )}
                </div>
            )}


            {/* View Mode: EDIT (Grading Form) */}
            {viewMode === 'edit' && selectedStudentId && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 border border-slate-700">
                    <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">
                            Evaluación de Competencias
                        </h3>
                        <div className="flex gap-2">
                             <button
                                onClick={() => handleDownloadReport(Number(selectedStudentId))}
                                disabled={generatingPdf}
                                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-slate-600"
                            >
                                <Download size={18} />
                                {generatingPdf ? 'Generando...' : 'Boletín'}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                            >
                            <Save size={18} />
                            {loading ? 'Guardando...' : 'Guardar Notas'}
                            </button>
                        </div>
                    </div>

                    <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {COMPETENCIES.map((comp) => (
                            <div key={comp.id} className="border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors bg-slate-900/40">
                                <div className={`p-3 font-bold text-sm ${comp.color} border-b border-slate-700 flex justify-between items-center`}>
                                    <span>{comp.label}</span>
                                    <span className="text-xs opacity-75">Nota Final: {gradesData[comp.id]?.score ?? 0}</span>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 truncate">Progress Test (50%)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={gradesData[comp.id]?.progressTest ?? ''}
                                                onChange={(e) => handleGradeChange(comp.id, 'progressTest', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-800 text-white text-center font-medium shadow-sm transition-colors"
                                                placeholder="0-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 truncate">Class Perf. (50%)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={gradesData[comp.id]?.classPerformance ?? ''}
                                                onChange={(e) => handleGradeChange(comp.id, 'classPerformance', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-800 text-white text-center font-medium shadow-sm transition-colors"
                                                placeholder="0-100"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-2 border-t border-slate-700">
                                         <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-semibold text-gray-400 uppercase">Final Score</label>
                                            <span className={`text-lg font-bold px-3 py-1 rounded-lg ${
                                                (gradesData[comp.id]?.score ?? 0) >= 51 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                            }`}>
                                                {gradesData[comp.id]?.score ?? 0}
                                            </span>
                                         </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Teacher's Comments</label>
                                        <textarea
                                            rows={2}
                                            value={gradesData[comp.id]?.comments ?? ''}
                                            onChange={(e) => handleGradeChange(comp.id, 'comments', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-800 text-white text-sm placeholder-gray-500 transition-colors"
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
