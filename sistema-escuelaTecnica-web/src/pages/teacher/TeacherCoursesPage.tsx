import { useEffect } from 'react';
import { useTeacherStore } from '../../store/teacher.store';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Users, ArrowRight, Loader } from 'lucide-react';

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
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                    {basePath.includes('grades') ? 'Registro de Notas' : 'Mis Cursos'}
                </h1>
                <p className="text-gray-400">
                    {basePath.includes('grades') 
                        ? 'Selecciona un curso para gestionar calificaciones' 
                        : 'Gestiona tus clases y estudiantes asignados'}
                </p>
            </div>

            {myCourses.length === 0 ? (
                <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
                    <BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-white font-bold text-xl mb-2">No tienes cursos asignados</h3>
                    <p className="text-gray-400">Contacta con administración si crees que es un error.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCourses.map((group) => (
                        <div 
                            key={group.id}
                            className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
                            onClick={() => navigate(`${basePath}/${group.id}`)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    <BookOpen size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                    group.status === 'IN_PROGRESS' || group.status === 'OPEN'
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                        : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                }`}>
                                    {group.status === 'OPEN' ? 'ABIERTO' : group.status === 'IN_PROGRESS' ? 'EN CURSO' : group.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                                {group.level.course.name}
                            </h3>
                            <p className="text-blue-300 text-sm font-medium mb-4">{group.level.name}</p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-gray-400 text-sm">
                                    <Calendar size={16} className="mr-2 text-gray-500" />
                                    <span>Inicio: {new Date(group.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-gray-400 text-sm">
                                    <Users size={16} className="mr-2 text-gray-500" />
                                    <span>{group.currentEnrolled} Estudiantes inscritos</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/10 group-hover:border-white/20">
                                <span className="text-sm text-gray-500 font-mono">{group.code}</span>
                                <div className="flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
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
