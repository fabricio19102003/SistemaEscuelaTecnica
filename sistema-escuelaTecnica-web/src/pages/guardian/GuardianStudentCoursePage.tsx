import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGuardianPortalStore } from '../../store/guardian-portal.store';
import {
    ArrowLeft,
    BookOpen,
    TrendingUp,
    Calendar,
    Award,
    Clock,
    Loader2,
    CheckCircle,
    XCircle,
    AlertCircle,
    BarChart3,
    UserCircle
} from 'lucide-react';

const GuardianStudentCoursePage = () => {
    const { studentId, enrollmentId } = useParams<{ studentId: string; enrollmentId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'grades' | 'attendance'>('grades');

    const {
        selectedStudent,
        currentEnrollment,
        studentGrades,
        gradeStats,
        studentAttendance,
        attendanceStats,
        isLoading,
        error,
        fetchStudentGrades,
        fetchStudentAttendance
    } = useGuardianPortalStore();

    useEffect(() => {
        if (studentId && enrollmentId) {
            const sId = parseInt(studentId);
            const eId = parseInt(enrollmentId);
            fetchStudentGrades(sId, eId);
            fetchStudentAttendance(sId, eId);
        }
    }, [studentId, enrollmentId, fetchStudentGrades, fetchStudentAttendance]);

    if (isLoading && !currentEnrollment) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin text-[#C8102E]" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 md:p-10 max-w-7xl mx-auto">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                </div>
                <button
                    onClick={() => navigate('/guardian/portal')}
                    className="mt-4 px-6 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#A00D24]"
                >
                    Volver al Portal
                </button>
            </div>
        );
    }

    if (!currentEnrollment) {
        return (
            <div className="p-6 md:p-10 max-w-7xl mx-auto">
                <p>No se encontró la información del curso.</p>
            </div>
        );
    }

    const getAttendanceIcon = (status: string) => {
        switch (status) {
            case 'PRESENT':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'LATE':
                return <Clock className="text-yellow-500" size={20} />;
            case 'ABSENT':
                return <XCircle className="text-red-500" size={20} />;
            case 'EXCUSED':
                return <AlertCircle className="text-blue-500" size={20} />;
            default:
                return null;
        }
    };

    const getAttendanceLabel = (status: string) => {
        const labels: Record<string, string> = {
            PRESENT: 'Presente',
            LATE: 'Tarde',
            ABSENT: 'Ausente',
            EXCUSED: 'Justificado'
        };
        return labels[status] || status;
    };

    const getAttendanceBgColor = (status: string) => {
        const colors: Record<string, string> = {
            PRESENT: 'bg-green-50 border-green-200',
            LATE: 'bg-yellow-50 border-yellow-200',
            ABSENT: 'bg-red-50 border-red-200',
            EXCUSED: 'bg-blue-50 border-blue-200'
        };
        return colors[status] || 'bg-gray-50 border-gray-200';
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header with Back Button */}
            <div>
                <button
                    onClick={() => navigate('/guardian/portal')}
                    className="flex items-center gap-2 text-[#C8102E] hover:text-[#A00D24] mb-4 font-semibold transition-colors"
                >
                    <ArrowLeft size={20} />
                    Volver al Portal
                </button>

                <div className="bg-gradient-to-r from-[#C8102E] to-[#E63946] text-white p-8 rounded-3xl shadow-xl">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                                <BookOpen size={40} />
                                {currentEnrollment.group.level.course.name}
                            </h1>
                            <p className="text-red-100 text-lg mb-4">
                                {currentEnrollment.group.level.name} - {currentEnrollment.group.name}
                            </p>

                            {selectedStudent && (
                                <div className="flex items-center gap-3 mt-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                        {selectedStudent.user.profileImageUrl ? (
                                            <img
                                                src={selectedStudent.user.profileImageUrl}
                                                alt={selectedStudent.user.firstName}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <UserCircle size={32} className="text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-red-200 font-medium">Pupilo</p>
                                        <p className="text-white font-bold text-lg">
                                            {selectedStudent.user.firstName}{' '}
                                            {selectedStudent.user.paternalSurname}
                                        </p>
                                        <p className="text-red-100 text-xs">
                                            R.E. {selectedStudent.registrationCode}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                                    {currentEnrollment.group.teacher.user.firstName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs text-red-200 font-medium">Profesor</p>
                                    <p className="text-white font-semibold">
                                        {currentEnrollment.group.teacher.user.firstName}{' '}
                                        {currentEnrollment.group.teacher.user.paternalSurname}
                                    </p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/20">
                                <p className="text-xs text-red-200 font-medium">Estado</p>
                                <p className="text-white font-bold">{currentEnrollment.status}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-md p-2 flex gap-2">
                <button
                    onClick={() => setActiveTab('grades')}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'grades'
                            ? 'bg-gradient-to-r from-[#C8102E] to-[#E63946] text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <Award size={20} />
                    Notas
                </button>
                <button
                    onClick={() => setActiveTab('attendance')}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'attendance'
                            ? 'bg-gradient-to-r from-[#C8102E] to-[#E63946] text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <Calendar size={20} />
                    Asistencia
                </button>
            </div>

            {/* Grades Tab */}
            {activeTab === 'grades' && (
                <div className="space-y-6">
                    {/* Grade Stats */}
                    {gradeStats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-blue-50 rounded-xl">
                                        <BarChart3 className="text-[#004694]" size={32} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                                            Promedio
                                        </p>
                                        <p className="text-3xl font-bold text-gray-800">
                                            {gradeStats.averageGrade.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-purple-50 rounded-xl">
                                        <Award className="text-purple-600" size={32} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                                            Evaluaciones
                                        </p>
                                        <p className="text-3xl font-bold text-gray-800">
                                            {gradeStats.totalEvaluations}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-green-50 rounded-xl">
                                        <TrendingUp className="text-green-600" size={32} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                                            Aprobadas
                                        </p>
                                        <p className="text-3xl font-bold text-gray-800">
                                            {gradeStats.passedEvaluations}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Grades List */}
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                        <div className="bg-gradient-to-r from-[#C8102E] to-[#E63946] text-white p-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Award size={24} />
                                Historial de Evaluaciones
                            </h2>
                        </div>

                        {studentGrades.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="p-4 bg-gray-50 rounded-full mb-4 inline-block">
                                    <Award size={48} className="text-gray-300" />
                                </div>
                                <p className="text-lg font-medium text-gray-500">
                                    No hay evaluaciones registradas aún
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {studentGrades.map((grade) => (
                                    <div
                                        key={grade.id}
                                        className="p-6 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-800 mb-1">
                                                    {grade.evaluationName}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {new Date(grade.evaluationDate).toLocaleDateString('es-ES')}
                                                    </span>
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                                                        {grade.evaluationType}
                                                    </span>
                                                    <span className="text-xs">Peso: {grade.weight}%</span>
                                                </div>
                                                {grade.comments && (
                                                    <p className="mt-2 text-sm text-gray-600 italic">
                                                        "{grade.comments}"
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right ml-4">
                                                <div
                                                    className={`text-3xl font-bold ${
                                                        grade.gradeValue >= 51
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }`}
                                                >
                                                    {grade.gradeValue}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    / {grade.maxGrade}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
                <div className="space-y-6">
                    {/* Attendance Stats */}
                    {attendanceStats && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                                <div className="text-center">
                                    <div className="p-3 bg-blue-50 rounded-xl inline-block mb-2">
                                        <Calendar className="text-[#004694]" size={24} />
                                    </div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                                        Total Días
                                    </p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {attendanceStats.totalDays}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-md border border-green-100">
                                <div className="text-center">
                                    <div className="p-3 bg-green-50 rounded-xl inline-block mb-2">
                                        <CheckCircle className="text-green-600" size={24} />
                                    </div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                                        Presentes
                                    </p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {attendanceStats.presentDays}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-md border border-yellow-100">
                                <div className="text-center">
                                    <div className="p-3 bg-yellow-50 rounded-xl inline-block mb-2">
                                        <Clock className="text-yellow-600" size={24} />
                                    </div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                                        Tardanzas
                                    </p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {attendanceStats.lateDays}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-md border border-red-100">
                                <div className="text-center">
                                    <div className="p-3 bg-red-50 rounded-xl inline-block mb-2">
                                        <XCircle className="text-red-600" size={24} />
                                    </div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                                        Faltas
                                    </p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {attendanceStats.absentDays}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-md border border-purple-100">
                                <div className="text-center">
                                    <div className="p-3 bg-purple-50 rounded-xl inline-block mb-2">
                                        <BarChart3 className="text-purple-600" size={24} />
                                    </div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                                        % Asistencia
                                    </p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {attendanceStats.attendancePercentage.toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Attendance List */}
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                        <div className="bg-gradient-to-r from-[#C8102E] to-[#E63946] text-white p-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Calendar size={24} />
                                Registro de Asistencia
                            </h2>
                        </div>

                        {studentAttendance.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="p-4 bg-gray-50 rounded-full mb-4 inline-block">
                                    <Calendar size={48} className="text-gray-300" />
                                </div>
                                <p className="text-lg font-medium text-gray-500">
                                    No hay registros de asistencia aún
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {studentAttendance.map((attendance) => (
                                    <div
                                        key={attendance.id}
                                        className={`p-6 border-l-4 ${getAttendanceBgColor(attendance.status)}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {getAttendanceIcon(attendance.status)}
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800">
                                                        {new Date(attendance.attendanceDate).toLocaleDateString('es-ES', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </h3>
                                                    {attendance.arrivalTime && (
                                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                            <Clock size={14} />
                                                            Hora de llegada:{' '}
                                                            {new Date(attendance.arrivalTime).toLocaleTimeString('es-ES', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    )}
                                                    {attendance.notes && (
                                                        <p className="text-sm text-gray-600 mt-2 italic">
                                                            Nota: {attendance.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="px-4 py-2 rounded-full font-bold text-sm">
                                                    {getAttendanceLabel(attendance.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuardianStudentCoursePage;
