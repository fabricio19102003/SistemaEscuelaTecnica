import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ArrowLeft, Save, Plus, Loader2 } from 'lucide-react';
import { getGroupById, createGroup, updateGroup } from '../../services/api/group.service';
import { CourseService } from '../../services/api/course.service';
import type { Course } from '../../types/course.types';
import { CreateLevelModal } from '../../components/groups/CreateLevelModal';

// Updated Schema: Removed teacher, name, code, classroom, schedules
const groupSchema = z.object({
    courseId: z.string().min(1, 'El curso es requerido'), 
    levelId: z.string().min(1, 'El nivel es requerido'),
    startDate: z.string().min(1, 'Fecha inicio requerida'),
    endDate: z.string().min(1, 'Fecha fin requerida'),
    maxCapacity: z.string().transform(v => Number(v)).refine(n => n > 0, "Debe ser mayor a 0"),
    minCapacity: z.string().transform(v => Number(v)).optional(),
    notes: z.string().optional()
});

type GroupFormInput = z.input<typeof groupSchema>;
type GroupForm = z.output<typeof groupSchema>;

const GroupFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const [isLoading, setIsLoading] = useState(false);
    
    // Resources
    const [courses, setCourses] = useState<Course[]>([]);
    
    // UI State
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [showLevelModal, setShowLevelModal] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<GroupFormInput, any, GroupForm>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            minCapacity: '5',
            maxCapacity: '30'
        }
    });

    const watchCourseId = watch('courseId');

    // Effect: Update selected course when form changes
    useEffect(() => {
        if (watchCourseId) {
            setSelectedCourseId(watchCourseId);
            // Reset level if course changes manually? Maybe not needed if user knows what they are doing.
        }
    }, [watchCourseId]);

    // Effect: Load initial data
    useEffect(() => {
        loadResources();
    }, []);

    // Effect: Load group data if edit mode
    useEffect(() => {
        if (isEditMode && courses.length > 0) {
            loadGroup();
        }
    }, [isEditMode, id, courses]); // Wait for courses to be loaded

    const loadResources = async () => {
        try {
            const coursesData = await CourseService.getAll();
            setCourses(coursesData);
        } catch (error) {
            console.error('Error loading resources:', error);
            Swal.fire('Error', 'No se pudieron cargar los cursos', 'error');
        }
    };

    const loadGroup = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const group = await getGroupById(Number(id));
            
            // Find course ID from level
            const courseId = group.level?.courseId.toString() || '';
            
            reset({
                courseId: courseId,
                levelId: group.levelId.toString(),
                startDate: group.startDate ? new Date(group.startDate).toISOString().split('T')[0] : '',
                endDate: group.endDate ? new Date(group.endDate).toISOString().split('T')[0] : '',
                maxCapacity: group.maxCapacity.toString(),
                minCapacity: group.minCapacity?.toString(),
                notes: group.notes || '',
            });
            setSelectedCourseId(courseId);
        } catch (error) {
            console.error('Error loading group:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar el grupo',
                icon: 'error',
                background: '#1f2937', // Dark theme for error
                color: '#fff'
            });
            navigate('/dashboard/groups');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLevelCreated = async () => {
        // Reload courses to get the new level
        await loadResources();
        // Since we reload courses, the component will re-render. 
        // We might want to auto-select the new level if we could know its ID, but for now simple reload is fine.
    };

    const onSubmit = async (data: GroupForm) => {
        setIsLoading(true);
        try {
            const payload = {
                levelId: Number(data.levelId),
                startDate: data.startDate,
                endDate: data.endDate,
                maxCapacity: Number(data.maxCapacity),
                minCapacity: data.minCapacity ? Number(data.minCapacity) : undefined,
                notes: data.notes
                // Removed manual fields
            };

            if (isEditMode && id) {
                await updateGroup(Number(id), payload);
                Swal.fire({
                    title: '¡Actualizado!',
                    text: 'El grupo ha sido actualizado correctamente.',
                    icon: 'success',
                });
            } else {
                await createGroup(payload);
                Swal.fire({
                    title: '¡Registrado!',
                    text: 'El grupo ha sido registrado correctamente con datos automáticos.',
                    icon: 'success',
                });
            }
            navigate('/dashboard/groups');
        } catch (error: any) {
            console.error('Error saving group:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Error al guardar el grupo',
                icon: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Derived state
    const currentLevels = courses.find(c => c.id.toString() === selectedCourseId)?.levels || [];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => navigate('/dashboard/groups')}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {isEditMode ? 'Editar Grupo' : 'Nuevo Grupo'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {isEditMode ? 'Modificar datos del grupo' : 'Creación simplificada de grupos'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Main Card */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 space-y-8">
                    
                    {/* Section 1: Academic Context */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[#004694] border-b border-slate-200 dark:border-slate-700 pb-2">
                            <h2 className="text-lg font-semibold">Contexto Académico</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Course Select */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Curso Base *</label>
                                <select
                                    {...register('courseId')}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004694] transition-all"
                                >
                                    <option value="">Seleccione un curso...</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                                    ))}
                                </select>
                                {errors.courseId && <span className="text-[#BF0811] text-xs">{errors.courseId.message}</span>}
                                <p className="text-xs text-slate-500">
                                    El docente, aula y horarios se importarán automáticamente de este curso.
                                </p>
                            </div>

                            {/* Level Select */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nivel Académico *</label>
                                <div className="flex gap-2">
                                    <select
                                        {...register('levelId')}
                                        disabled={!selectedCourseId}
                                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004694] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Seleccione un nivel...</option>
                                        {currentLevels.map((level) => (
                                            <option key={level.id} value={level.id}>
                                                {level.name} (Code: {level.code})
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowLevelModal(true)}
                                        disabled={!selectedCourseId}
                                        className="p-2.5 bg-[#004694]/10 text-[#004694] rounded-xl hover:bg-[#004694]/20 transition-colors disabled:opacity-50"
                                        title="Crear Nuevo Nivel"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                {errors.levelId && <span className="text-[#BF0811] text-xs">{errors.levelId.message}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Logistics */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[#BF0811] border-b border-slate-200 dark:border-slate-700 pb-2">
                            <h2 className="text-lg font-semibold">Logística y Plazos</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Inicio de Clases *</label>
                                <input
                                    type="date"
                                    {...register('startDate')}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0811] transition-all"
                                />
                                {errors.startDate && <span className="text-[#BF0811] text-xs">{errors.startDate.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fin de Clases *</label>
                                <input
                                    type="date"
                                    {...register('endDate')}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0811] transition-all"
                                />
                                {errors.endDate && <span className="text-[#BF0811] text-xs">{errors.endDate.message}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Capacidad Máxima *</label>
                                <input
                                    type="number"
                                    {...register('maxCapacity')}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004694] transition-all"
                                />
                                {errors.maxCapacity && <span className="text-[#BF0811] text-xs">{errors.maxCapacity.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Capacidad Mínima</label>
                                <input
                                    type="number"
                                    {...register('minCapacity')}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004694] transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notas Adicionales</label>
                            <textarea
                                {...register('notes')}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004694] transition-all h-24 resize-none"
                                placeholder="Notas internas para administración..."
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/groups')}
                        className="px-6 py-2.5 rounded-xl bg-[#BF0811]/10 text-[#BF0811] hover:bg-[#BF0811]/20 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-xl bg-[#004694] text-white hover:bg-[#003da5] transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar Grupo' : 'Crear Grupo')}
                    </button>
                </div>
            </form>

            {/* Modals */}
            {showLevelModal && selectedCourseId && (
                <CreateLevelModal 
                    courseId={Number(selectedCourseId)}
                    onClose={() => setShowLevelModal(false)}
                    onSuccess={handleLevelCreated}
                />
            )}
        </div>
    );
};

export default GroupFormPage;
