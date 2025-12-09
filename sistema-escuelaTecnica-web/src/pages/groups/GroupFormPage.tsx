import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ArrowLeft, Save, Plus, Trash } from 'lucide-react';
import { getGroupById, createGroup, updateGroup } from '../../services/api/group.service';
import { CourseService } from '../../services/api/course.service';
import { teacherService } from '../../services/api/teacher.service';
import { ScheduleTemplateService } from '../../services/api/schedule-template.service';
import type { Teacher } from '../../types/teacher.types';
import type { Course } from '../../types/course.types';


const groupSchema = z.object({
    courseId: z.string().min(1, 'El curso es requerido'), // Intermediate helper
    levelId: z.string().min(1, 'El nivel es requerido'),
    teacherId: z.string().min(1, 'El docente es requerido'),
    name: z.string().min(1, 'El nombre es requerido'),
    code: z.string().min(1, 'El código es requerido'),
    startDate: z.string().min(1, 'Fecha inicio requerida'),
    endDate: z.string().min(1, 'Fecha fin requerida'),
    maxCapacity: z.string().transform(v => Number(v)).refine(n => n > 0, "Debe ser mayor a 0"),
    minCapacity: z.string().transform(v => Number(v)).optional(),
    classroom: z.string().optional(),
    notes: z.string().optional(),
    schedules: z.array(z.object({
        dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
        startTime: z.string().min(1, 'Hora inicio requerida'),
        endTime: z.string().min(1, 'Hora fin requerida')
    })).default([])
});

type GroupFormInput = z.input<typeof groupSchema>;
type GroupForm = z.output<typeof groupSchema>;

const DAYS_OF_WEEK = [
    { value: 'MONDAY', label: 'Lunes' },
    { value: 'TUESDAY', label: 'Martes' },
    { value: 'WEDNESDAY', label: 'Miércoles' },
    { value: 'THURSDAY', label: 'Jueves' },
    { value: 'FRIDAY', label: 'Viernes' },
    { value: 'SATURDAY', label: 'Sábado' },
    { value: 'SUNDAY', label: 'Domingo' }
];

const GroupFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const [isLoading, setIsLoading] = useState(false);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');

    const { register, control, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<GroupFormInput, any, GroupForm>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            schedules: [],
            minCapacity: '5',
            maxCapacity: '30'
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "schedules"
    });

    const watchCourseId = watch('courseId');

    useEffect(() => {
        if (watchCourseId) {
            setSelectedCourseId(watchCourseId);
        }
    }, [watchCourseId]);

    useEffect(() => {
        loadResources();
        if (isEditMode) {
            loadGroup();
        }
    }, [isEditMode, id]);

    const loadResources = async () => {
        try {
            const [teachersData, coursesData] = await Promise.all([
                teacherService.getAll(),
                CourseService.getAll()
            ]);
            setTeachers(teachersData);
            setCourses(coursesData);
        } catch (error) {
            console.error('Error loading resources:', error);
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
                teacherId: group.teacherId.toString(),
                name: group.name,
                code: group.code,
                startDate: group.startDate ? new Date(group.startDate).toISOString().split('T')[0] : '',
                endDate: group.endDate ? new Date(group.endDate).toISOString().split('T')[0] : '',
                maxCapacity: group.maxCapacity.toString(),
                minCapacity: group.minCapacity?.toString(),
                classroom: group.classroom || '',
                notes: group.notes || '',
                schedules: group.schedules?.map((s: any) => ({
                    dayOfWeek: s.dayOfWeek,
                    startTime: s.startTime ? (s.startTime.includes('T') ? s.startTime.substring(11, 16) : s.startTime.substring(0, 5)) : '',
                    endTime: s.endTime ? (s.endTime.includes('T') ? s.endTime.substring(11, 16) : s.endTime.substring(0, 5)) : ''
                })) || []
            });
            setSelectedCourseId(courseId);
        } catch (error) {
            console.error('Error loading group:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar el grupo',
                icon: 'error',
                background: '#1f2937',
                color: '#fff'
            });
            navigate('/dashboard/groups');
        } finally {
            setIsLoading(false);
        }
    };

    const loadTemplate = async () => {
        try {
            const templates = await ScheduleTemplateService.getAll();
            if (templates.length === 0) {
                Swal.fire('Info', 'No hay plantillas guardadas', 'info');
                return;
            }

            const { value: templateId } = await Swal.fire({
                title: 'Seleccionar Plantilla',
                input: 'select',
                inputOptions: templates.reduce((acc, t) => ({ ...acc, [t.id]: t.name }), {}),
                inputPlaceholder: 'Selecciona una plantilla',
                showCancelButton: true
            });

            if (templateId) {
                const template = templates.find(t => t.id === Number(templateId));
                if (template) {
                    setValue('schedules', template.items.map(item => ({
                        dayOfWeek: item.dayOfWeek as any,
                        startTime: item.startTime.substring(11, 16),
                        endTime: item.endTime.substring(11, 16)
                    })));
                }
            }
        } catch (error) {
            Swal.fire('Error', 'Error al cargar plantillas', 'error');
        }
    };

    const onSubmit = async (data: GroupForm) => {
        setIsLoading(true);
        try {
            const payload = {
                levelId: Number(data.levelId),
                teacherId: Number(data.teacherId),
                name: data.name,
                code: data.code,
                startDate: data.startDate,
                endDate: data.endDate,
                maxCapacity: Number(data.maxCapacity),
                minCapacity: data.minCapacity ? Number(data.minCapacity) : undefined,
                classroom: data.classroom,
                notes: data.notes,
                schedules: data.schedules
            };

            if (isEditMode && id) {
                await updateGroup(Number(id), payload);
                Swal.fire({
                    title: '¡Actualizado!',
                    text: 'El grupo ha sido actualizado correctamente.',
                    icon: 'success',
                    background: '#1f2937',
                    color: '#fff'
                });
            } else {
                await createGroup(payload);
                Swal.fire({
                    title: '¡Registrado!',
                    text: 'El grupo ha sido registrado correctamente.',
                    icon: 'success',
                    background: '#1f2937',
                    color: '#fff'
                });
            }
            navigate('/dashboard/groups');
        } catch (error: any) {
            console.error('Error saving group:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Error al guardar el grupo',
                icon: 'error',
                background: '#1f2937',
                color: '#fff'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Derived state
    const currentLevels = courses.find(c => c.id.toString() === selectedCourseId)?.levels || [];

    if (isLoading && isEditMode) {
        return <div className="text-white text-center mt-10">Cargando datos...</div>;
    }

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
                    <h1 className="text-2xl font-bold text-white">
                        {isEditMode ? 'Editar Grupo' : 'Nuevo Grupo'}
                    </h1>
                    <p className="text-slate-400">Información del grupo académico</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Academic Info */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 space-y-4">
                    <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Información Académica</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Curso *</label>
                            <select
                                {...register('courseId')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="">Seleccione un curso</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>{course.name}</option>
                                ))}
                            </select>
                            {errors.courseId && <span className="text-red-400 text-xs">{errors.courseId.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Nivel *</label>
                            <select
                                {...register('levelId')}
                                disabled={!selectedCourseId}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                            >
                                <option value="">Seleccione un nivel</option>
                                {currentLevels.map((level) => (
                                    <option key={level.id} value={level.id}>
                                        {level.name} (Code: {level.code})
                                    </option>
                                ))}
                            </select>
                            {errors.levelId && <span className="text-red-400 text-xs">{errors.levelId.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Nombre del Grupo *</label>
                            <input
                                {...register('name')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Ej. G-2024-I"
                            />
                            {errors.name && <span className="text-red-400 text-xs">{errors.name.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Código *</label>
                            <input
                                {...register('code')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Ej. GRP001"
                            />
                            {errors.code && <span className="text-red-400 text-xs">{errors.code.message}</span>}
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 space-y-4">
                    <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Detalles y Logística</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Docente *</label>
                            <select
                                {...register('teacherId')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="">Seleccione un docente</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.user.firstName} {teacher.user.paternalSurname}
                                    </option>
                                ))}
                            </select>
                            {errors.teacherId && <span className="text-red-400 text-xs">{errors.teacherId.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Aula (Opcional)</label>
                            <input
                                {...register('classroom')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Ej. Lab 1"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Inicio de Clases *</label>
                            <input
                                type="date"
                                {...register('startDate')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            {errors.startDate && <span className="text-red-400 text-xs">{errors.startDate.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Fin de Clases *</label>
                            <input
                                type="date"
                                {...register('endDate')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            {errors.endDate && <span className="text-red-400 text-xs">{errors.endDate.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Capacidad Máxima *</label>
                            <input
                                type="number"
                                {...register('maxCapacity')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            {errors.maxCapacity && <span className="text-red-400 text-xs">{errors.maxCapacity.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Capacidad Mínima</label>
                            <input
                                type="number"
                                {...register('minCapacity')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                    </div>
                </div>

                {/* Schedule Builder */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                        <h2 className="text-lg font-semibold text-white">Horarios</h2>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={loadTemplate}
                                className="text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                Cargar Plantilla
                            </button>
                            <button
                                type="button"
                                onClick={() => append({ dayOfWeek: 'MONDAY' as any, startTime: '', endTime: '' })}
                                className="text-sm bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg hover:bg-blue-600/30 transition-colors flex items-center gap-1"
                            >
                                <Plus size={16} /> Agregar Horario
                            </button>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400">Día</label>
                                    <select
                                        {...register(`schedules.${index}.dayOfWeek`)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-white"
                                    >
                                        {DAYS_OF_WEEK.map(day => (
                                            <option key={day.value} value={day.value}>{day.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400">Inicio</label>
                                    <input
                                        type="time"
                                        {...register(`schedules.${index}.startTime`)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400">Fin</label>
                                    <input
                                        type="time"
                                        {...register(`schedules.${index}.endTime`)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-white"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors self-center"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>
                        ))}
                        {fields.length === 0 && (
                            <p className="text-center text-slate-500 text-sm py-4">No hay horarios definidos.</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/groups')}
                        className="px-6 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors flex items-center gap-2"
                        disabled={isLoading}
                    >
                        <Save size={20} />
                        {isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar Grupo' : 'Guardar Grupo')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GroupFormPage;
