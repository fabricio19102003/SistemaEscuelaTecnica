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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Gestión de Cursos</h1>
                    <p className="text-slate-400">Administra los cursos y programas académicos</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/courses/new')}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Nuevo Curso
                </button>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="text-center text-slate-400 py-8">Cargando cursos...</div>
            ) : (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="p-4 text-slate-300 font-medium">Curso</th>
                                <th className="p-4 text-slate-300 font-medium">Código</th>
                                <th className="p-4 text-slate-300 font-medium">Edades</th>
                                <th className="p-4 text-slate-300 font-medium">Duración</th>
                                <th className="p-4 text-slate-300 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredCourses.map((course) => (
                                <tr key={course.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden">
                                                {course.imageUrl ? (
                                                    <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Book className="text-slate-400" size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{course.name}</p>
                                                <p className="text-sm text-slate-400 line-clamp-1">{course.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300">
                                        <span className="bg-slate-700/50 px-2 py-1 rounded text-xs font-mono">
                                            {course.code}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-300">
                                        {course.minAge} - {course.maxAge} años
                                    </td>
                                    <td className="p-4 text-slate-300">
                                        {course.durationMonths ? `${course.durationMonths} meses` : '-'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                                                className="p-2 hover:bg-slate-700 rounded-lg text-blue-400 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                className="p-2 hover:bg-slate-700 rounded-lg text-red-400 transition-colors"
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
                                    <td colSpan={5} className="p-8 text-center text-slate-400">
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
