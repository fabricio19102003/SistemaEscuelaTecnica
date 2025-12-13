import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuardianPortalStore } from '../../store/guardian-portal.store';
import { useAuthStore } from '../../store/auth.store';
import { Users, BookOpen, TrendingUp, Heart, Loader2, UserCircle, Calendar } from 'lucide-react';

const GuardianPortalPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        myStudents,
        selectedStudent,
        studentEnrollments,
        isLoading,
        error,
        fetchMyStudents,
        selectStudent,
        fetchStudentCourses
    } = useGuardianPortalStore();

    useEffect(() => {
        fetchMyStudents();
    }, [fetchMyStudents]);

    useEffect(() => {
        if (selectedStudent) {
            fetchStudentCourses(selectedStudent.id);
        }
    }, [selectedStudent, fetchStudentCourses]);

    if (isLoading && myStudents.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin text-[#004694]" size={48} />
            </div>
        );
    }

    const handleStudentSelect = (student: typeof myStudents[0]) => {
        selectStudent(student);
    };

    const handleViewCourse = (enrollmentId: number) => {
        if (selectedStudent) {
            navigate(`/guardian/student/${selectedStudent.id}/course/${enrollmentId}`);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#C8102E] to-[#E63946] text-white p-8 rounded-3xl shadow-xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                    <Heart size={40} />
                    ¡Bienvenido, {user?.firstName}!
                </h1>
                <p className="text-red-100 text-lg">
                    Portal del Tutor Legal - Seguimiento Académico de tus Pupilos
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
                    <UserCircle className="text-red-500" size={24} />
                    <p>{error}</p>
                </div>
            )}

            {/* Students Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[#C8102E] flex items-center gap-3">
                        <Users size={28} />
                        Mis Pupilos
                    </h2>
                    <span className="px-4 py-2 bg-red-50 text-[#C8102E] rounded-full font-bold text-sm">
                        {myStudents.length} {myStudents.length === 1 ? 'Pupilo' : 'Pupilos'}
                    </span>
                </div>

                {myStudents.length === 0 ? (
                    <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-200 text-center">
                        <div className="p-4 bg-gray-50 rounded-full mb-4 inline-block">
                            <Users size={48} className="text-gray-300" />
                        </div>
                        <p className="text-lg font-medium text-gray-500">
                            No tienes pupilos asignados
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            Contacta al administrador para más información
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myStudents.map((student) => (
                            <div
                                key={student.id}
                                onClick={() => handleStudentSelect(student)}
                                className={`group bg-white rounded-3xl shadow-md border-2 overflow-hidden cursor-pointer transition-all hover:shadow-2xl hover:scale-105 ${
                                    selectedStudent?.id === student.id
                                        ? 'border-[#C8102E] shadow-xl scale-105'
                                        : 'border-gray-200'
                                }`}
                            >
                                {/* Student Header */}
                                <div className="bg-gradient-to-br from-[#C8102E] to-[#E63946] p-6 text-white">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            {student.user.profileImageUrl ? (
                                                <img
                                                    src={student.user.profileImageUrl}
                                                    alt={student.user.firstName}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <UserCircle size={40} className="text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold">
                                                {student.user.firstName} {student.user.paternalSurname}
                                            </h3>
                                            <p className="text-red-100 text-sm">
                                                R.E. {student.registrationCode}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Student Info */}
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                                                Relación
                                            </p>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {student.relationship}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                                                Estado
                                            </p>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {student.enrollmentStatus}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                                                Cursos Activos
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <BookOpen size={16} className="text-[#C8102E]" />
                                                <span className="text-xl font-bold text-[#C8102E]">
                                                    {student.activeEnrollments}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {student.isPrimary && (
                                        <div className="px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full text-xs font-bold text-yellow-700 text-center">
                                            Tutor Principal
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Student's Courses */}
            {selectedStudent && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-[#004694] flex items-center gap-3">
                            <Calendar size={28} />
                            Cursos de {selectedStudent.user.firstName}
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center p-16">
                            <Loader2 className="animate-spin text-[#004694]" size={48} />
                        </div>
                    ) : studentEnrollments.length === 0 ? (
                        <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-200 text-center">
                            <div className="p-4 bg-gray-50 rounded-full mb-4 inline-block">
                                <BookOpen size={48} className="text-gray-300" />
                            </div>
                            <p className="text-lg font-medium text-gray-500">
                                Este estudiante no tiene cursos activos
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {studentEnrollments.map((enrollment) => (
                                <div
                                    key={enrollment.id}
                                    onClick={() => handleViewCourse(enrollment.id)}
                                    className="group bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all cursor-pointer"
                                >
                                    {/* Course Image */}
                                    <div className="relative h-48 bg-gradient-to-br from-[#004694] to-[#0066CC] overflow-hidden">
                                        {enrollment.group.level.course.imageUrl ? (
                                            <img
                                                src={enrollment.group.level.course.imageUrl}
                                                alt={enrollment.group.level.course.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <BookOpen size={64} className="text-white opacity-50" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#004694]">
                                            {enrollment.status}
                                        </div>
                                    </div>

                                    {/* Course Info */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#004694] transition-colors">
                                            {enrollment.group.level.course.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            {enrollment.group.level.name}
                                        </p>

                                        {/* Teacher Info */}
                                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                                                {enrollment.group.teacher.user.firstName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium">Profesor</p>
                                                <p className="text-sm font-semibold text-gray-700">
                                                    {enrollment.group.teacher.user.firstName}{' '}
                                                    {enrollment.group.teacher.user.paternalSurname}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button className="w-full py-3 bg-gradient-to-r from-[#C8102E] to-[#E63946] text-white rounded-xl font-bold hover:shadow-lg transition-all group-hover:scale-105">
                                            Ver Notas y Asistencia
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Stats Overview for Selected Student */}
            {selectedStudent && studentEnrollments.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-blue-50 rounded-xl">
                                <BookOpen className="text-[#004694]" size={32} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                                    Cursos Activos
                                </p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {studentEnrollments.length}
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
                                    Progreso
                                </p>
                                <p className="text-3xl font-bold text-gray-800">En Curso</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-red-50 rounded-xl">
                                <Heart className="text-[#C8102E]" size={32} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                                    Estado
                                </p>
                                <p className="text-lg font-bold text-gray-800">
                                    {selectedStudent.enrollmentStatus}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuardianPortalPage;
