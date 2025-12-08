import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useTeacherStore } from '../../store/teacher.store';
import Swal from 'sweetalert2';
import { ArrowLeft, Save, Upload, User as UserIcon } from 'lucide-react';

const teacherSchema = z.object({
    firstName: z.string().min(1, 'El nombre es requerido'),
    paternalSurname: z.string().min(1, 'El apellido paterno es requerido'),
    maternalSurname: z.string().optional(),
    email: z.string().email('Email inválido'),
    phone: z.string().optional(),
    documentType: z.string().min(1, 'Tipo de documento requerido'),
    documentNumber: z.string().min(1, 'Número de documento requerido'),
    specialization: z.string().min(1, 'Especialidad requerida'),
    hireDate: z.string().min(1, 'Fecha de contratación requerida'),
    contractType: z.enum(['FULL_TIME', 'PART_TIME', 'FREELANCE'], {
        message: 'Tipo de contrato inválido'
    }),
    hourlyRate: z.string().optional(),
});

type TeacherForm = z.infer<typeof teacherSchema>;

const TeacherFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { createTeacher, updateTeacher, fetchTeacherById, selectedTeacher, isLoading } = useTeacherStore();
    const isEditMode = !!id;
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [cvFile, setCvFile] = useState<File | null>(null);

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<TeacherForm>({
        resolver: zodResolver(teacherSchema),
        defaultValues: {
            documentType: 'DNI',
            contractType: 'FULL_TIME'
        }
    });

    useEffect(() => {
        if (isEditMode && id) {
            fetchTeacherById(id);
        }
    }, [isEditMode, id, fetchTeacherById]);

    useEffect(() => {
        if (isEditMode && selectedTeacher) {
            reset({
                firstName: selectedTeacher.user.firstName,
                paternalSurname: selectedTeacher.user.paternalSurname,
                maternalSurname: selectedTeacher.user.maternalSurname || '',
                email: selectedTeacher.user.email,
                phone: selectedTeacher.user.phone || '',
                documentType: selectedTeacher.documentType,
                documentNumber: selectedTeacher.documentNumber,
                specialization: selectedTeacher.specialization || '',
                hireDate: selectedTeacher.hireDate ? new Date(selectedTeacher.hireDate).toISOString().split('T')[0] : '',
                contractType: selectedTeacher.contractType,
                hourlyRate: selectedTeacher.hourlyRate?.toString() || ''
            });
            if (selectedTeacher.user.profileImageUrl) {
                setPhotoPreview(selectedTeacher.user.profileImageUrl);
            }
        }
    }, [isEditMode, selectedTeacher, reset]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCvFile(file);
        }
    };

    const onSubmit = async (data: TeacherForm) => {
        try {
            const payload = {
                ...data,
                // Ensure optional empty strings are sent as undefined or properly handled if needed, 
                // but our backend checks for undefined. 
                // Note: strings from inputs are usually "" if empty. 
                // Zod scheam treats optional strings as keys that might be missing? No, z.string().optional() allows undefined.
            };

            const formData = new FormData();
            formData.append('data', JSON.stringify(payload));
            if (photoFile) {
                formData.append('photo', photoFile);
            }
            if (cvFile) {
                formData.append('cv', cvFile);
            }

            if (isEditMode && id) {
                await updateTeacher(id, formData);
                Swal.fire({
                    title: '¡Actualizado!',
                    text: 'El docente ha sido actualizado correctamente.',
                    icon: 'success',
                    background: '#1f2937',
                    color: '#fff'
                });
            } else {
                await createTeacher(formData);
                Swal.fire({
                    title: '¡Registrado!',
                    text: 'El docente ha sido registrado correctamente.',
                    icon: 'success',
                    background: '#1f2937',
                    color: '#fff'
                });
            }
            navigate('/dashboard/teachers');
        } catch (error: any) {
             Swal.fire({
                title: 'Error',
                text: error.message || 'Hubo un error al guardar el docente.',
                icon: 'error',
                background: '#1f2937',
                color: '#fff'
            });
        }
    };

    if (isLoading && isEditMode && !selectedTeacher) {
        return <div className="text-white text-center mt-10">Cargando datos...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => navigate('/dashboard/teachers')}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {isEditMode ? 'Editar Docente' : 'Nuevo Docente'}
                    </h1>
                    <p className="text-slate-400">Complete la información del personal académico</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Photo Upload Section */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex flex-col items-center gap-4">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-700 border-4 border-slate-600 flex items-center justify-center">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon size={48} className="text-slate-400" />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-500 transition-colors shadow-lg">
                            <Upload size={16} className="text-white" />
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                        </label>
                    </div>
                    <p className="text-sm text-slate-400">Foto de Perfil</p>
                </div>

                {/* Personal Information */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 space-y-4">
                    <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Información Personal</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Nombre *</label>
                            <input
                                {...register('firstName')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Ej. Juan"
                            />
                            {errors.firstName && <span className="text-red-400 text-xs">{errors.firstName.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Apellido Paterno *</label>
                            <input
                                {...register('paternalSurname')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Ej. Pérez"
                            />
                            {errors.paternalSurname && <span className="text-red-400 text-xs">{errors.paternalSurname.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Apellido Materno</label>
                            <input
                                {...register('maternalSurname')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Ej. López"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email *</label>
                            <input
                                {...register('email')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="correo@ejemplo.com"
                            />
                            {errors.email && <span className="text-red-400 text-xs">{errors.email.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Teléfono</label>
                            <input
                                {...register('phone')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Ej. 70012345"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Tipo Documento *</label>
                            <select
                                {...register('documentType')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="DNI">CI / DNI</option>
                                <option value="CE">Carnet Extranjería</option>
                                <option value="PASSPORT">Pasaporte</option>
                                <option value="OTHER">Otro</option>
                            </select>
                            {errors.documentType && <span className="text-red-400 text-xs">{errors.documentType.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Número Documento *</label>
                            <input
                                {...register('documentNumber')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Ej. 1234567"
                            />
                            {errors.documentNumber && <span className="text-red-400 text-xs">{errors.documentNumber.message}</span>}
                        </div>
                    </div>
                </div>

                {/* Professional Information */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 space-y-4">
                    <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Información Profesional</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Especialidad *</label>
                            <input
                                {...register('specialization')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Ej. Matemáticas, Física..."
                            />
                            {errors.specialization && <span className="text-red-400 text-xs">{errors.specialization.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Fecha de Contratación *</label>
                            <input
                                type="date"
                                {...register('hireDate')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            {errors.hireDate && <span className="text-red-400 text-xs">{errors.hireDate.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Tipo de Contrato *</label>
                            <select
                                {...register('contractType')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="FULL_TIME">Tiempo Completo</option>
                                <option value="PART_TIME">Medio Tiempo</option>
                                <option value="FREELANCE">Externo / Por Hora</option>
                            </select>
                            {errors.contractType && <span className="text-red-400 text-xs">{errors.contractType.message}</span>}
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-medium text-slate-300">Tarifa por Hora (Opcional)</label>
                             <input
                                 type="number"
                                 step="0.01"
                                 {...register('hourlyRate')}
                                 className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                 placeholder="0.00"
                             />
                         </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Hoja de Vida (CV)</label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition-colors text-white text-sm">
                                <Upload size={16} />
                                <span>{cvFile ? cvFile.name : 'Subir CV (PDF)'}</span>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="application/pdf"
                                    onChange={handleCvChange}
                                />
                            </label>
                            {selectedTeacher?.cvUrl && !cvFile && (
                                <a 
                                    href={selectedTeacher.cvUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm hover:underline flex items-center gap-1"
                                >
                                    Ver CV Actual
                                </a>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">Formato PDF, máx. 5MB</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/teachers')}
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
                        {isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar Docente' : 'Guardar Docente')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TeacherFormPage;
