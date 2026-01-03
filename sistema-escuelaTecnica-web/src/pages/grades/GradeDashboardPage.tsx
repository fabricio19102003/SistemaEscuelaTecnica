import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGradeStore } from '../../store/grade.store';
import { 
    ClipboardCheck, 
    FileText, 
    BarChart2, 
    ChevronRight,
    GraduationCap,
    School,
    Users,
    TrendingUp,
    Award
} from 'lucide-react';
import TiltCard from '../../components/ui/TiltCard';

import { useSystemSettingsStore } from '../../store/system-settings.store';

const GradeDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { fetchAllGrades, enrollments, loading } = useGradeStore();
    const { getSettingValue, fetchSettings } = useSystemSettingsStore();

    useEffect(() => {
        fetchAllGrades();
        fetchSettings();
    }, [fetchAllGrades, fetchSettings]);

    // Calculate Summary Metrics
    const metrics = useMemo(() => {
        if (!enrollments.length) return null;

        const totalStudents = enrollments.length;
        let totalScoreSum = 0;
        let gradeCount = 0;
        
        enrollments.forEach(e => {
            if (e.grades && e.grades.length > 0) {
                e.grades.forEach(g => {
                    totalScoreSum += Number(g.gradeValue);
                    gradeCount++;
                });
            }
        });

        const overallAverage = gradeCount > 0 ? totalScoreSum / gradeCount : 0;

        // Find Top Course
        // Simple aggregation map
        const courseavgs: Record<string, { sum: number, count: number }> = {};
        enrollments.forEach(e => {
            const courseName = e.group?.level?.course?.name;
            if (courseName && e.grades?.length) {
                if (!courseavgs[courseName]) courseavgs[courseName] = { sum: 0, count: 0 };
                courseavgs[courseName].sum += e.grades.reduce((a, b) => a + Number(b.gradeValue), 0);
                courseavgs[courseName].count += e.grades.length;
            }
        });

        let topCourse = '-';
        let maxAvg = -1;
        Object.entries(courseavgs).forEach(([name, data]) => {
            const avg = data.sum / data.count;
            if (avg > maxAvg) {
                maxAvg = avg;
                topCourse = name;
            }
        });

        return {
            totalStudents,
            overallAverage: overallAverage.toFixed(1),
            topCourse
        };
    }, [enrollments]);


    const menuItems = [
        {
            title: 'Registro de Calificaciones',
            description: 'Ingresar notas por curso y estudiante.',
            icon: <ClipboardCheck size={40} className="text-blue-400" />,
            action: () => navigate('/dashboard/grades/entry'),
            color: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
            glow: '#3b82f6'
        },
        {
            title: 'Boletines de Notas',
            description: 'Generar y descargar report cards.',
            icon: <FileText size={40} className="text-purple-400" />,
            action: () => navigate('/dashboard/grades/reports'),
            color: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
            glow: '#a855f7'
        },
        {
            title: 'Acta de Calificaciones',
            description: 'Generar acta oficial del curso.',
            icon: <Award size={40} className="text-orange-400" />,
            action: () => navigate('/dashboard/grades/official-report'),
            color: 'from-orange-500/10 to-orange-500/5 border-orange-500/20',
            glow: '#f97316'
        },
        {
            title: 'Estadísticas',
            description: 'Ver rendimiento general de cursos.',
            icon: <BarChart2 size={40} className="text-emerald-400" />,
            action: () => navigate('/dashboard/grades/stats'),
            color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
            glow: '#10b981'
        }
    ];

    return (

            <div className="max-w-6xl mx-auto p-6 space-y-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-[#004694]">
                        Módulo de Calificaciones
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Administración académica y reportes.</p>
                </div>

                {/* Main Navigation with 3D Tilt */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {menuItems.map((item, index) => (
                        <div key={index} onClick={item.action} className="cursor-pointer">
                            <TiltCard 
                                gradientColor={item.glow}
                                className={`h-full bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all`}
                            >
                                <div className="p-8 h-full flex flex-col justify-between">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`p-4 rounded-2xl shadow-sm ring-1 ring-gray-100 ${item.color.replace('from-', 'bg-').split(' ')[0]}`}>
                                            {item.icon}
                                        </div>
                                        <ChevronRight className="text-gray-400 group-hover:text-[#004694] transition-colors transform group-hover:translate-x-1" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#004694] transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-500 font-medium leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </TiltCard>
                        </div>
                    ))}
                </div>

                {/* Academic Summary Section */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-[#004694] mb-8 flex items-center gap-3">
                        <GraduationCap className="text-[#004694]" size={32} />
                        <span>
                            Resumen Académico en Tiempo Real
                        </span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Metric 1: Active Period */}
                        <TiltCard gradientColor="#f97316" className="bg-white border border-gray-200 shadow-sm">
                            <div className="p-6 flex flex-col items-center text-center gap-4">
                                <div className="p-3 bg-orange-50 rounded-full text-orange-600 ring-1 ring-orange-100">
                                    <School size={28} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Periodo Actual</p>
                                    <p className="text-3xl font-black text-gray-900 mt-1">
                                        {getSettingValue('CURRENT_PERIOD', 'Calculando...')}
                                    </p>
                                </div>
                            </div>
                        </TiltCard>

                        {/* Metric 2: Total Students */}
                        <TiltCard gradientColor="#3b82f6" className="bg-white border border-gray-200 shadow-sm">
                            <div className="p-6 flex flex-col items-center text-center gap-4">
                                <div className="p-3 bg-blue-50 rounded-full text-blue-600 ring-1 ring-blue-100">
                                    <Users size={28} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Estudiantes Activos</p>
                                    <p className="text-3xl font-black text-gray-900 mt-1">
                                        {loading ? '...' : metrics?.totalStudents ?? 0}
                                    </p>
                                </div>
                            </div>
                        </TiltCard>

                        {/* Metric 3: Overall Average */}
                        <TiltCard gradientColor="#10b981" className="bg-white border border-gray-200 shadow-sm">
                            <div className="p-6 flex flex-col items-center text-center gap-4">
                                <div className="p-3 bg-emerald-50 rounded-full text-emerald-600 ring-1 ring-emerald-100">
                                    <TrendingUp size={28} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Promedio Global</p>
                                    <p className="text-3xl font-black text-gray-900 mt-1">
                                         {loading ? '...' : metrics?.overallAverage ?? 0}
                                    </p>
                                </div>
                            </div>
                        </TiltCard>

                        {/* Metric 4: Top Course */}
                        <TiltCard gradientColor="#eab308" className="bg-white border border-gray-200 shadow-sm">
                            <div className="p-6 flex flex-col items-center text-center gap-4">
                                <div className="p-3 bg-yellow-50 rounded-full text-yellow-600 ring-1 ring-yellow-100">
                                    <Award size={28} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Curso Destacado</p>
                                    <p className="text-xl font-black text-gray-900 mt-1 truncate w-full px-2">
                                         {loading ? '...' : metrics?.topCourse ?? '-'}
                                    </p>
                                </div>
                            </div>
                        </TiltCard>
                    </div>
                </div>
            </div>

    );
};

export default GradeDashboardPage;
