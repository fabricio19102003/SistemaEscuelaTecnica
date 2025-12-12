import { useEffect } from 'react';
import { useTeacherStore } from '../../store/teacher.store';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Users, ArrowRight, Loader, GraduationCap } from 'lucide-react';

interface TeacherCoursesPageProps {
    basePath?: string;
}

const TeacherCoursesPage = ({ basePath = '/teacher/courses' }: TeacherCoursesPageProps) => {
    const { myCourses, fetchMyCourses, isLoading, error } = useTeacherStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyCourses();
    }, [fetchMyCourses]);

    if (isLoading && myCourses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
                <Loader className="animate-spin mb-4 text-blue-500" size={40} />
                <p>Cargando cursos asignados...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-lg mx-auto">
                    <h3 className="text-red-400 font-bold text-lg mb-2">Error al cargar cursos</h3>
                    <p className="text-gray-400">{error}</p>
                    <button 
                        onClick={() => fetchMyCourses()}
                        className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004694] via-[#005ba3] to-[#006fd6] p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3 flex items-center gap-3">
                        {basePath.includes('grades') ? (
                            <>
                                <GraduationCap size={40} className="text-blue-200" />
                                Registro de Notas
                            </>
                        ) : (
                            <>
                                <BookOpen size={40} className="text-blue-200" />
                                Mis Cursos
                            </>
                        )}
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl font-medium">
                        {basePath.includes('grades') 
                            ? 'Selecciona un curso de la lista para gestionar las calificaciones y el rendimiento académico de tus estudiantes.' 
                            : 'Gestiona tus clases, revisa el listado de estudiantes y accede a las herramientas del docente.'}
                    </p>
                </div>
                
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
            </div>

            {myCourses.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-gray-900 font-bold text-xl mb-2">No tienes cursos asignados</h3>
                    <p className="text-gray-500">Contacta con administración si crees que es un error.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCourses.map((group) => (
                        <div 
                            key={group.id}
                            className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#004694]/30 transition-all duration-300 cursor-pointer shadow-sm"
                            onClick={() => navigate(`${basePath}/${group.id}`)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-[#004694] rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    <BookOpen size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                    group.status === 'IN_PROGRESS' || group.status === 'OPEN'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                        : 'bg-gray-100 text-gray-600 border-gray-200'
                                }`}>
                                    {group.status === 'OPEN' ? 'ABIERTO' : group.status === 'IN_PROGRESS' ? 'EN CURSO' : group.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#004694] transition-colors">
                                {group.level.course.name}
                            </h3>
                            <p className="text-[#BF0811] text-sm font-bold mb-4">{group.level.name}</p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-gray-500 text-sm">
                                    <Calendar size={16} className="mr-2 text-gray-400" />
                                    <span>Inicio: {new Date(group.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-gray-500 text-sm">
                                    <Users size={16} className="mr-2 text-gray-400" />
                                    <span>{group.currentEnrolled} Estudiantes inscritos</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-gray-200">
                                <span className="text-sm text-gray-400 font-mono">{group.code}</span>
                                <div className="flex items-center text-[#004694] text-sm font-bold group-hover:translate-x-1 transition-transform">
                                    Ver Curso <ArrowRight size={16} className="ml-1" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeacherCoursesPage;
