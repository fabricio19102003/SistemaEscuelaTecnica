import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash, Search, Book } from 'lucide-react';
import type { Course } from '../../types/course.types';
import { CourseService } from '../../services/api/course.service';
import Swal from 'sweetalert2';

const CourseListPage = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const data = await CourseService.getAll();
            setCourses(data);
        } catch (error) {
            console.error('Error loading courses:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los cursos',
                icon: 'error',
                background: '#1f2937',
                color: '#fff'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1f2937',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await CourseService.delete(id);
                await loadCourses();
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El curso ha sido eliminado.',
                    icon: 'success',
                    background: '#1f2937',
                    color: '#fff'
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar el curso',
                    icon: 'error',
                    background: '#1f2937',
                    color: '#fff'
                });
            }
        }
    };

    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004694] via-[#005ba3] to-[#006fd6] p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3 flex items-center gap-3">
                        <Book size={40} className="text-blue-200" />
                        Gestión de Cursos
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl font-medium">
                        Administra los cursos, programas académicos y su asignación de docentes.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="relative flex-1 max-w-md">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004694] focus:border-transparent sm:text-sm transition-all duration-200"
                    />
                </div>
                <button
                    onClick={() => navigate('/dashboard/courses/new')}
                    className="flex items-center gap-2 px-6 py-3 bg-[#004694] hover:bg-[#003da5] text-white font-bold rounded-xl shadow-md transition-all transform hover:scale-105"
                >
                    <Plus size={20} />
                    Nuevo Curso
                </button>
            </div>

            {isLoading ? (
                <div className="text-center text-gray-500 py-8">Cargando cursos...</div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-[#004694] border-b border-[#003da5]">
                            <tr>
                                <th className="p-4 text-white font-bold uppercase text-xs">Curso</th>
                                <th className="p-4 text-white font-bold uppercase text-xs">Código</th>
                                <th className="p-4 text-white font-bold uppercase text-xs">Docente</th>
                                <th className="p-4 text-white font-bold uppercase text-xs">Aulas</th>
                                <th className="p-4 text-white font-bold uppercase text-xs">Duración</th>
                                <th className="p-4 text-white font-bold uppercase text-xs text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCourses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center overflow-hidden border border-blue-100">
                                                {course.imageUrl ? (
                                                    <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Book className="text-[#004694]" size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{course.name}</p>
                                                <p className="text-sm text-gray-500 line-clamp-1">{course.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono border border-gray-200 text-gray-700">
                                            {course.code}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {course.teacher?.user ? (
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 font-medium">
                                                    {course.teacher.user.firstName} {course.teacher.user.paternalSurname}
                                                </span>
                                                {course.teacher.user.maternalSurname && (
                                                    <span className="text-xs text-gray-500">
                                                        {course.teacher.user.maternalSurname}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">Sin asignar</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        <div className="flex flex-wrap gap-1">
                                            {course.classrooms && course.classrooms.length > 0 ? (
                                                course.classrooms.map((c: any) => (
                                                    <span key={c.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                                                        {c.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">Sin aulas</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {course.durationWeeks ? `${course.durationWeeks} semanas` : '-'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCourses.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No se encontraron cursos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CourseListPage;
