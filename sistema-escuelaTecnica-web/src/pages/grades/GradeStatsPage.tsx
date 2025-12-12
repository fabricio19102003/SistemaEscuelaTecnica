import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseStore } from '../../store/course.store';
import { useGradeStore } from '../../store/grade.store';
import { ArrowLeft, PieChart, BarChart as BarChartIcon, Download, Search, School, AlertTriangle, TrendingDown } from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    Pie,
    Cell,
    PieChart as RechartsPieChart
} from 'recharts';
import { pdf } from '@react-pdf/renderer';
import StatsReportPDF from '../../components/grades/StatsReportPDF';

const COMPETENCIES = [
    { id: 'SPEAKING', label: 'Speaking', color: '#fbbf24' },
    { id: 'LISTENING', label: 'Listening', color: '#60a5fa' },
    { id: 'READING', label: 'Reading', color: '#34d399' },
    { id: 'WRITING', label: 'Writing', color: '#facc15' },
    { id: 'VOCABULARY', label: 'Vocabulary', color: '#a78bfa' },
    { id: 'GRAMMAR', label: 'Grammar', color: '#f472b6' }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const GradeStatsPage = () => {
    const navigate = useNavigate();
    const { courses, fetchCourses } = useCourseStore();
    const { enrollments, fetchGradesByCourse, fetchAllGrades, loading } = useGradeStore();
    
    // "all" = all courses
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [generatingPdf, setGeneratingPdf] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    useEffect(() => {
        if (selectedCourseId === 'all') {
            fetchAllGrades();
        } else if (selectedCourseId) {
            fetchGradesByCourse(Number(selectedCourseId));
        }
    }, [selectedCourseId, fetchGradesByCourse, fetchAllGrades]);

    // Data Aggregation
    const stats = useMemo(() => {
        if (!selectedCourseId || (enrollments.length === 0 && !loading)) return null;

        let totalStudents = enrollments.length;
        let totalScoreSum = 0;
        let passedCount = 0;
        let failedCount = 0;

        // Competency Averages
        const compSums: Record<string, number> = {};
        const compCounts: Record<string, number> = {};
        
        // Student Details & Risk Analysis
        const studentPerformance: { name: string; average: number; status: string; course?: string }[] = [];
        
        enrollments.forEach(enrollment => {
            const grades = enrollment.grades || [];
            if (grades.length === 0) {
                studentPerformance.push({
                    name: `${enrollment.student.user.paternalSurname} ${enrollment.student.user.firstName}`,
                    average: 0,
                    status: 'Sin Notas',
                    course: enrollment.group?.level?.course?.name
                });
                return;
            }

            const studentTotal = grades.reduce((sum, g) => sum + Number(g.gradeValue), 0);
            const studentAvg = studentTotal / grades.length;
            totalScoreSum += studentAvg;

            if (studentAvg >= 51) passedCount++;
            else failedCount++;

            studentPerformance.push({
                name: `${enrollment.student.user.paternalSurname} ${enrollment.student.user.firstName}`,
                average: studentAvg,
                status: studentAvg >= 51 ? 'Aprobado' : 'Reprobado',
                course: enrollment.group?.level?.course?.name
            });

            grades.forEach(g => {
                if (!compSums[g.evaluationType]) {
                    compSums[g.evaluationType] = 0;
                    compCounts[g.evaluationType] = 0;
                }
                compSums[g.evaluationType] += Number(g.gradeValue);
                compCounts[g.evaluationType]++;
            });
        });

        const competencyAverages = COMPETENCIES.map(comp => ({
            name: comp.label,
            average: compCounts[comp.id] ? compSums[comp.id] / compCounts[comp.id] : 0,
            fill: comp.color
        }));

        const statusDistribution = [
            { name: 'Aprobados', value: passedCount },
            { name: 'Reprobados', value: failedCount },
            { name: 'Sin Notas', value: totalStudents - (passedCount + failedCount) }
        ].filter(item => item.value > 0);

        // Risk Analysis (Students with avg < 60 but > 0)
        const atRiskStudents = studentPerformance.filter(s => s.average > 0 && s.average < 60);
        
        // Lowest Performing Students (Bottom 5 with grades)
        const lowestGrades = [...studentPerformance]
            .filter(s => s.average > 0)
            .sort((a, b) => a.average - b.average)
            .slice(0, 5);

        return {
            totalStudents,
            averageScore: totalStudents > 0 && (passedCount + failedCount) > 0 ? totalScoreSum / (passedCount + failedCount) : 0,
            passRate: totalStudents > 0 ? (passedCount / totalStudents) * 100 : 0,
            competencyAverages,
            statusDistribution,
            studentPerformance,
            atRiskCount: atRiskStudents.length,
            lowestGrades
        };
    }, [enrollments, selectedCourseId, loading]);

    const handleExportPDF = async () => {
        if (!stats) return;
        setGeneratingPdf(true);
        try {
            const courseName = selectedCourseId === 'all' ? 'Todos los Cursos' : courses.find(c => c.id === Number(selectedCourseId))?.name || 'Desconocido';
            const pdfData = {
                courseName,
                ...stats,
                competencyAverages: stats.competencyAverages,
                studentPerformance: stats.studentPerformance
            };

            const blob = await pdf(<StatsReportPDF data={pdfData} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ESTADISTICAS_${courseName.replace(/ /g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
        } finally {
            setGeneratingPdf(false);
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
                <div className="flex-1 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-[#004694]">Estadísticas de Calificaciones</h2>
                    {stats && (
                        <button
                            onClick={handleExportPDF}
                            disabled={generatingPdf}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                        >
                            <Download size={18} />
                            {generatingPdf ? 'Exportando...' : 'Exportar PDF'}
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">Seleccionar Curso</label>
                <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full md:w-1/3 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004694] bg-gray-50 text-gray-900 focus:bg-white transition-all outline-none"
                >
                    <option value="">-- Seleccione un Curso --</option>
                    <option value="all">Todos los Cursos (General)</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {loading && (
                <div className="text-center py-20">
                     <p className="text-blue-400 animate-pulse">Cargando datos...</p>
                </div>
            )}

            {!loading && stats ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
                                    <School size={24} />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold">Total Estudiantes</p>
                                    <p className="text-2xl font-black text-gray-900">{stats.totalStudents}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
                                    <BarChartIcon size={24} />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold">Promedio General</p>
                                    <p className="text-2xl font-black text-gray-900">{stats.averageScore.toFixed(1)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-50 rounded-lg text-purple-600 border border-purple-100">
                                    <PieChart size={24} />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold">Tasa Aprobación</p>
                                    <p className="text-2xl font-black text-gray-900">{stats.passRate.toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* New Risk Cards */}
                        <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-2 opacity-5">
                                <AlertTriangle size={60} className="text-red-500" />
                             </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-50 rounded-lg text-red-600 border border-red-100">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold">En Riesgo (&lt;60)</p>
                                    <p className="text-2xl font-black text-gray-900">{stats.atRiskCount}</p>
                                </div>
                            </div>
                        </div>
                         <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-2 opacity-5">
                                <TrendingDown size={60} className="text-orange-500" />
                             </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-50 rounded-lg text-orange-600 border border-orange-100">
                                    <TrendingDown size={24} />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold">Nota Más Baja</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.lowestGrades.length > 0 ? stats.lowestGrades[0].average.toFixed(1) : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Bar Chart: Competencies */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-[#004694] mb-6">Rendimiento por Competencia</h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.competencyAverages}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                        <XAxis dataKey="name" stroke="#6b7280" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#6b7280" domain={[0, 100]} axisLine={false} tickLine={false} />
                                        <Tooltip 
                                            cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}
                                            contentStyle={{ 
                                                backgroundColor: '#fff', 
                                                borderColor: '#e5e7eb', 
                                                color: '#111827',
                                                borderRadius: '0.5rem',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                            itemStyle={{ color: '#000', fontWeight: 'bold' }}
                                        />
                                        <Bar dataKey="average" name="Promedio" radius={[4, 4, 0, 0]}>
                                            {stats.competencyAverages.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pie Chart: Status Distribution */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-[#004694] mb-6">Distribución de Estados</h3>
                            <div className="h-80 w-full flex justify-center items-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={stats.statusDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            paddingAngle={5}
                                            label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {stats.statusDistribution.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#fff', 
                                                borderColor: '#e5e7eb', 
                                                color: '#111827',
                                                borderRadius: '0.5rem',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }} 
                                            itemStyle={{ color: '#000', fontWeight: 'bold' }}
                                        />
                                        <Legend wrapperStyle={{paddingTop: '20px'}} />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Detailed Table */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-lg font-bold text-[#004694]">Detalle de Estudiantes</h3>
                            </div>
                            <div className="overflow-x-auto flex-1 max-h-96">
                                <table className="w-full text-left">
                                    <thead className="bg-[#004694] text-xs uppercase text-white font-bold sticky top-0 backdrop-blur-md">
                                        <tr>
                                            <th className="px-6 py-4">Estudiante</th>
                                            {selectedCourseId === 'all' && <th className="px-6 py-4">Curso</th>}
                                            <th className="px-6 py-4 text-center">Promedio</th>
                                            <th className="px-6 py-4 text-center">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {stats.studentPerformance.map((student, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-gray-900 font-medium">{student.name}</td>
                                                {selectedCourseId === 'all' && (
                                                    <td className="px-6 py-4 text-gray-500 text-xs">{student.course || '-'}</td>
                                                )}
                                                <td className="px-6 py-4 text-center font-bold text-gray-900">
                                                    {student.average > 0 ? student.average.toFixed(1) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                                                        student.status === 'Aprobado' ? 'bg-green-100 text-green-700' :
                                                        student.status === 'Reprobado' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {student.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                         {/* Lowest Grades / At Risk Table */}
                         <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-red-100 bg-red-50">
                                <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                                    <TrendingDown size={20} />
                                    Estudiantes con Menor Rendimiento
                                </h3>
                            </div>
                            <div className="overflow-x-auto flex-1">
                                <table className="w-full text-left">
                                    <thead className="bg-red-100 text-xs uppercase text-red-700 font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Estudiante</th>
                                            <th className="px-6 py-4 text-center">Promedio</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {stats.lowestGrades.length > 0 ? (
                                            stats.lowestGrades.map((student, idx) => (
                                                <tr key={idx} className="hover:bg-red-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-gray-900 font-medium">{student.name}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-red-600">
                                                        {student.average.toFixed(1)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                                                    No hay estudiantes con notas registradas.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            ) : !loading && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
                    <Search className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">Seleccione un curso o "Todos" para ver las estadísticas.</p>
                </div>
            )}
        </div>
    );
};

export default GradeStatsPage;
