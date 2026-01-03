import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ArrowLeft, Save, Upload, Book, Plus, Trash } from 'lucide-react';
import { CourseService } from '../../services/api/course.service';
import { teacherService } from '../../services/api/teacher.service';
import { classroomService, type Classroom } from '../../services/api/classroom.service';
import { ScheduleTemplateService } from '../../services/api/schedule-template.service';
import ClassroomModal from '../../components/modals/ClassroomModal';
import { MultiSelect } from '../../components/ui/MultiSelect';
import type { Teacher } from '../../types/teacher.types';

const courseSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    // code: z.string().min(1, 'El código es requerido'), // Auto-generated
    description: z.string().optional(),
    durationWeeks: z.string().optional(),
    basePrice: z.string().optional(),
    teacherId: z.string().optional(),
    previousCourseId: z.string().optional(),
    classroomIds: z.array(z.number()).optional(),
    schedules: z.array(z.object({
        dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
        startTime: z.string().min(1, 'Hora inicio requerida'),
        endTime: z.string().min(1, 'Hora fin requerida')
    })).optional()
});

type CourseSimpleForm = z.infer<typeof courseSchema>;

const DAYS_OF_WEEK = [
    { value: 'MONDAY', label: 'Lunes' },
    { value: 'TUESDAY', label: 'Martes' },
    { value: 'WEDNESDAY', label: 'Miércoles' },
    { value: 'THURSDAY', label: 'Jueves' },
    { value: 'FRIDAY', label: 'Viernes' },
    { value: 'SATURDAY', label: 'Sábado' },
    { value: 'SUNDAY', label: 'Domingo' }
];

const CourseFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [courses, setCourses] = useState<any[]>([]); // For prerequisite list
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isClassroomModalOpen, setIsClassroomModalOpen] = useState(false);

    const { register, control, handleSubmit, setValue, getValues, watch, formState: { errors }, reset } = useForm<CourseSimpleForm>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            schedules: []
        }
    });
    
    // Watch for changes to force re-render
    const watchedClassroomIds = watch('classroomIds');

    const { fields, append, remove } = useFieldArray({
        control,
        name: "schedules"
    });

    useEffect(() => {
        loadResources();
        if (isEditMode) {
            loadCourse();
        }
    }, [isEditMode, id]);

    const loadResources = async () => {
        try {
            const [teachersData, classroomsData, coursesData] = await Promise.all([
                teacherService.getAll(),
                classroomService.getAll(),
                CourseService.getAll()
            ]);
            setTeachers(teachersData);
            setClassrooms(classroomsData);
            setCourses(coursesData);
        } catch (error) {
            console.error('Error loading resources:', error);
        }
    };

    const loadCourse = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const course = await CourseService.getById(id);
            reset({
                name: course.name,
                description: course.description || '',
                durationWeeks: course.durationWeeks?.toString() || '',
                basePrice: course.basePrice ? course.basePrice.toString() : '',
                teacherId: course.teacherId?.toString() || '',
                previousCourseId: course.previousCourseId?.toString() || '',
                classroomIds: course.classrooms?.map((c: any) => c.id) || [],
                schedules: course.schedules?.map((s: any) => ({
                    dayOfWeek: s.dayOfWeek,
                    startTime: s.startTime ? (typeof s.startTime === 'string' && s.startTime.length > 5 ? s.startTime.substring(11, 16) : s.startTime.substring(0, 5)) : '', // Try to extract HH:mm safely
                    endTime: s.endTime ? (typeof s.endTime === 'string' && s.endTime.length > 5 ? s.endTime.substring(11, 16) : s.endTime.substring(0, 5)) : ''
                })) || []
            });
            if (course.imageUrl) {
                setImagePreview(course.imageUrl);
            }
        } catch (error) {
            console.error('Error loading course:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar el curso',
                icon: 'error',
                background: '#1f2937',
                color: '#fff'
            });
            navigate('/dashboard/courses');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClassroomCreated = (newClassroom: Classroom) => {
        setClassrooms(prev => [...prev, newClassroom]);
        setValue('classroomIds', [...(getValues('classroomIds') || []), newClassroom.id]);
    };

    const saveAsTemplate = async () => {
        const schedules = getValues('schedules');

        if (!schedules || schedules.length === 0) {
            Swal.fire({ title: 'Error', text: 'No hay horarios para guardar', icon: 'warning' });
            return;
        }

        // Validate that all schedules have required fields
        const validSchedules = schedules.filter(s => s.dayOfWeek && s.startTime && s.endTime);

        if (validSchedules.length !== schedules.length) {
             Swal.fire({ title: 'Atención', text: 'Se omitirán los horarios incompletos. ¿Deseas continuar?', icon: 'warning', showCancelButton: true }).then(async (result) => {
                if (result.isConfirmed) {
                     await processSaveTemplate(validSchedules);
                }
             });
             return;
        }

        await processSaveTemplate(validSchedules);
    };

    const processSaveTemplate = async (schedules: any[]) => {
        const { value: name } = await Swal.fire({
            title: 'Guardar Plantilla',
            input: 'text',
            inputLabel: 'Nombre de la plantilla',
            inputPlaceholder: 'Ej. Lunes y Miércoles Mañana',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) return 'Debes escribir un nombre';
            }
        });

        if (name) {
            try {
                await ScheduleTemplateService.create({ name, items: schedules });
                Swal.fire('Guardado', 'La plantilla se ha guardado correctamente', 'success');
            } catch (error: any) {
                console.error("Error saving template:", error);
                const msg = error.response?.data?.message || 'No se pudo guardar la plantilla';
                Swal.fire('Error', msg, 'error');
            }
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
                        startTime: item.startTime.substring(11, 16), // "1970-01-01T08:00:00.000Z" -> "08:00"
                        endTime: item.endTime.substring(11, 16)
                    })));
                }
            }
        } catch (error) {
            Swal.fire('Error', 'Error al cargar plantillas', 'error');
        }
    };

    const onSubmit = async (data: CourseSimpleForm) => {
        setIsLoading(true);
        try {
            const payload = {
                name: data.name,
                description: data.description,
                durationWeeks: data.durationWeeks ? Number(data.durationWeeks) : undefined,
                basePrice: data.basePrice ? Number(data.basePrice) : undefined,
                teacherId: data.teacherId ? Number(data.teacherId) : undefined,
                previousCourseId: data.previousCourseId ? Number(data.previousCourseId) : undefined,
                classroomIds: data.classroomIds,
                schedules: data.schedules,
                image: imageFile || undefined
            };

            if (isEditMode && id) {
                await CourseService.update(id, payload);
                Swal.fire({
                    title: '¡Actualizado!',
                    text: 'El curso ha sido actualizado correctamente.',
                    icon: 'success',
                    background: '#1f2937',
                    color: '#fff'
                });
            } else {
                await CourseService.create(payload);
                Swal.fire({
                    title: '¡Registrado!',
                    text: 'El curso ha sido registrado correctamente.',
                    icon: 'success',
                    background: '#1f2937',
                    color: '#fff'
                });
            }
            navigate('/dashboard/courses');
        } catch (error: any) {
            console.error('Error saving course:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Error al guardar el curso',
                icon: 'error',
                background: '#1f2937',
                color: '#fff'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && isEditMode) {
        return <div className="text-white text-center mt-10">Cargando datos...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => navigate('/dashboard/courses')}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-[#004694]">
                        {isEditMode ? 'Editar Curso' : 'Nuevo Curso'}
                    </h1>
                    <p className="text-gray-500">Información del programa académico</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Image Upload Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center gap-4">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Book size={48} className="text-gray-400" />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-500 transition-colors shadow-lg">
                            <Upload size={16} className="text-white" />
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>
                    <p className="text-sm text-gray-500">Imagen del Curso</p>
                </div>

                {/* Course Information */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold text-[#004694] border-b border-gray-100 pb-2">Detalles Generales</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Nombre del Curso *</label>
                            <input
                                {...register('name')}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                placeholder="Ej. Robótica Básica"
                                onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()}
                            />
                            {errors.name && <span className="text-red-400 text-xs">{errors.name.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Duración (Semanas)</label>
                            <input
                                type="number"
                                {...register('durationWeeks')}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Precio Base del Curso (Bs)</label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('basePrice')}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ej. 450.00"
                            />
                        </div>

                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Descripción</label>
                        <textarea
                            {...register('description')}
                            rows={4}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none uppercase"
                            placeholder="Descripción detallada del curso..."
                            onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()}
                        />
                    </div>
                </div>

                {/* Assignments */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold text-[#004694] border-b border-gray-100 pb-2">Asignaciones</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Docente Responsable</label>
                            <select
                                {...register('teacherId')}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Seleccione un docente</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.user.firstName} {teacher.user.paternalSurname} {teacher.user.maternalSurname || ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Curso Prerequisito (Opcional)</label>
                            <select
                                {...register('previousCourseId')}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Ninguno (Primer Nivel)</option>
                                {courses
                                    .filter(c => c.id !== (id ? Number(id) : -1)) // Exclude self
                                    .map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.code ? `(${c.code})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Aulas / Laboratorios</label>
                            <div className="flex gap-2">
                                <MultiSelect
                                    options={classrooms.map(c => ({ value: c.id, label: `${c.name} (Cap: ${c.capacity})` }))}
                                    value={watchedClassroomIds || []}
                                    onChange={(val) => setValue('classroomIds', val as number[])}
                                    placeholder="Seleccione aulas..."
                                    className="w-full"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsClassroomModalOpen(true)}
                                    className="p-2 bg-[#004694] hover:bg-blue-700 text-white rounded-lg transition-colors flex-shrink-0"
                                    title="Crear nueva aula"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Schedule Builder */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <h2 className="text-lg font-bold text-[#004694]">Horarios</h2>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={loadTemplate}
                                className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                            >
                                Cargar Plantilla
                            </button>
                            <button
                                type="button"
                                onClick={saveAsTemplate}
                                className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                            >
                                Guadar como Plantilla
                            </button>
                            <button
                                type="button"
                                onClick={() => append({ dayOfWeek: 'MONDAY' as any, startTime: '', endTime: '' })}
                                className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 border border-blue-100"
                            >
                                <Plus size={16} /> Agregar Horario
                            </button>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 font-bold">Día</label>
                                    <select
                                        {...register(`schedules.${index}.dayOfWeek`)}
                                        className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900"
                                    >
                                        {DAYS_OF_WEEK.map(day => (
                                            <option key={day.value} value={day.value}>{day.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 font-bold">Inicio</label>
                                    <input
                                        type="time"
                                        {...register(`schedules.${index}.startTime`)}
                                        className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 font-bold">Fin</label>
                                    <input
                                        type="time"
                                        {...register(`schedules.${index}.endTime`)}
                                        className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors self-center"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>
                        ))}
                        {fields.length === 0 && (
                            <p className="text-center text-gray-500 text-sm py-4">No hay horarios definidos.</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/courses')}
                        className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 rounded-lg bg-[#004694] text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
                        disabled={isLoading}
                    >
                        <Save size={20} />
                        {isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar Curso' : 'Guardar Curso')}
                    </button>
                </div>
            </form>
            
            <ClassroomModal 
                isOpen={isClassroomModalOpen}
                onClose={() => setIsClassroomModalOpen(false)}
                onSuccess={handleClassroomCreated}
            />
        </div>
    );
};

export default CourseFormPage;
