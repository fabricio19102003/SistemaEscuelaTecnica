import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentPortalStore } from '../../store/student-portal.store';
import { useAuthStore } from '../../store/auth.store';
import { BookOpen, TrendingUp, Calendar, Award, Loader2 } from 'lucide-react';

const StudentPortalPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { 
        myEnrollments, 
        isLoading, 
        error, 
        fetchMyCourses 
    } = useStudentPortalStore();

   useEffect(() => {
        fetchMyCourses();
    }, [fetchMyCourses]);

    if (isLoading && myEnrollments.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin text-[#004694]" size={48} />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#004694] to-[#0066CC] text-white p-8 rounded-3xl shadow-xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                    <BookOpen size={40} />
                    ¡Bienvenido, {user?.firstName}!
                </h1>
                <p className="text-blue-100 text-lg">
                    Portal del Estudiante - Gestiona tu aprendizaje
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
                    <Award className="text-red-500" size={24} />
                    <p>{error}</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-50 rounded-xl">
                            <BookOpen className="text-[#004694]" size={32} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Cursos Activos</p>
                            <p className="text-3xl font-bold text-gray-800">{myEnrollments.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-green-50 rounded-xl">
                            <TrendingUp className="text-green-600" size={32} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Progreso</p>
                            <p className="text-3xl font-bold text-gray-800">En Curso</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-purple-50 rounded-xl">
                            <Award className="text-purple-600" size={32} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Mi Estado</p>
                            <p className="text-lg font-bold text-gray-800">Estudiante Activo</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Courses Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[#004694] flex items-center gap-3">
                        <Calendar size={28} />
                        Mis Cursos
                    </h2>
                </div>

                {myEnrollments.length === 0 ? (
                    <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-200 text-center">
                        <div className="p-4 bg-gray-50 rounded-full mb-4 inline-block">
                            <BookOpen size={48} className="text-gray-300" />
                        </div>
                        <p className="text-lg font-medium text-gray-500">No tienes cursos activos en este momento</p>
                        <p className="text-sm text-gray-400 mt-2">Contacta al administrador para inscribirte en un curso</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myEnrollments.map((enrollment) => (
                            <div
                                key={enrollment.id}
                                onClick={() => navigate(`/student/course/${enrollment.id}`)}
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
                                                {enrollment.group.teacher.user.firstName} {enrollment.group.teacher.user.paternalSurname}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button className="w-full py-3 bg-gradient-to-r from-[#004694] to-[#0066CC] text-white rounded-xl font-bold hover:shadow-lg transition-all group-hover:scale-105">
                                        Ver Detalles y Notas
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentPortalPage;
