import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useSchoolStore } from '../../store/school.store';
import { ArrowLeft, Save, School as SchoolIcon } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schoolSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    sieCode: z.string().length(8, 'El Código SIE debe tener exactamente 8 dígitos').regex(/^\d+$/, 'Solo se permiten números'),
    directorName: z.string().min(3, 'El nombre del director es requerido'),
    directorPhone: z.string().min(6, 'El teléfono del director es requerido'),
    levels: z.array(z.string()).min(1, 'Debe seleccionar al menos un nivel'),
    address: z.string().min(5, 'La dirección es requerida (Barrio, calle, número)'),
    
    // Optional / Less critical
    district: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type SchoolForm = z.infer<typeof schoolSchema>;

const ALL_LEVELS = [
    'Inicial',
    'Primaria',
    'Secundaria',
    'EPA (Educación Permanente de Adultos)',
    'ESA (Educación Secundaria de Adultos)',
    'ETA (Educación Técnica de Adultos)',
    'Multigrado',
    'Cursos largos - Cortos',
    'Modalidad de atención directa',
    'Modalidad de atención indirecta'
];

const SchoolFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { createSchool, updateSchool, fetchSchoolById, selectedSchool, isLoading } = useSchoolStore();
    
    const isEditMode = !!id;

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm<SchoolForm>({
        resolver: zodResolver(schoolSchema),
        defaultValues: {
            levels: []
        }
    });

    const selectedLevels = watch('levels') || [];

    useEffect(() => {
        if (isEditMode && id) {
            fetchSchoolById(Number(id));
        }
    }, [id, isEditMode, fetchSchoolById]);

    useEffect(() => {
        if (isEditMode && selectedSchool) {
            reset({
                name: selectedSchool.name,
                sieCode: selectedSchool.sieCode || '',
                directorName: selectedSchool.directorName || '',
                directorPhone: selectedSchool.directorPhone || '',
                levels: selectedSchool.levels || [],
                address: selectedSchool.address || '',
                district: selectedSchool.district || '',
                city: selectedSchool.city || '',
                phone: selectedSchool.phone || '',
                email: selectedSchool.email || '',
            });
        }
    }, [selectedSchool, isEditMode, reset]);

    const onSubmit: SubmitHandler<SchoolForm> = async (data) => {
        try {
            if (isEditMode && id) {
                await updateSchool(Number(id), data);
            } else {
                await createSchool(data);
            }
            navigate('/dashboard/schools');
        } catch (error) {
            console.error('Error saving school:', error);
        }
    };

    const handleLevelToggle = (level: string) => {
        const currentLevels = selectedLevels;
        if (currentLevels.includes(level)) {
            setValue('levels', currentLevels.filter(l => l !== level));
        } else {
            setValue('levels', [...currentLevels, level]);
        }
    };

    if (isLoading && isEditMode && !selectedSchool) {
        return <div className="text-white text-center p-10">Cargando...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/dashboard/schools')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div>
                     <h1 className="text-3xl font-bold text-[#004694] tracking-tight">
                        {isEditMode ? 'Editar Colegio' : 'Registrar Nuevo Colegio'}
                    </h1>
                    <p className="text-gray-500">Complete la información de la Unidad Educativa</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100"><SchoolIcon size={24} /></div>
                        <h2 className="text-xl font-bold text-[#004694]">Datos de la Unidad Educativa</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-bold text-gray-700">Nombre de la Unidad Educativa *</label>
                            <input {...register('name')} className="glass-input w-full" placeholder="Ej. Colegio Nacional Tecnológico" />
                            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                             <label className="text-sm font-bold text-gray-700">Código SIE * (8 dígitos)</label>
                            <input {...register('sieCode')} className="glass-input w-full" placeholder="80900001" maxLength={8} />
                            {errors.sieCode && <p className="text-red-400 text-xs">{errors.sieCode.message}</p>}
                        </div>

                        <div className="space-y-2">
                             <label className="text-sm font-bold text-gray-700">Dirección o Barrio *</label>
                            <input {...register('address')} className="glass-input w-full" placeholder="Barrio Las Palmas, Av. Principal #123" />
                            {errors.address && <p className="text-red-400 text-xs">{errors.address.message}</p>}
                        </div>

                        <div className="space-y-2">
                             <label className="text-sm font-bold text-gray-700">Distrito / Zona (Opcional)</label>
                            <input {...register('district')} className="glass-input w-full" placeholder="Distrito 12" />
                        </div>

                        <div className="space-y-2">
                             <label className="text-sm font-bold text-gray-700">Ciudad (Opcional)</label>
                            <input {...register('city')} className="glass-input w-full" placeholder="Santa Cruz de la Sierra" />
                        </div>
                    </div>
                </section>

                <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600 border border-green-100"><SchoolIcon size={24} /></div>
                        <h2 className="text-xl font-bold text-[#004694]">Datos del Director/a</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                             <label className="text-sm font-bold text-gray-700">Nombre Completo del Director/a *</label>
                            <input {...register('directorName')} className="glass-input w-full" placeholder="Lic. Juan Pérez" />
                            {errors.directorName && <p className="text-red-400 text-xs">{errors.directorName.message}</p>}
                        </div>
                         <div className="space-y-2">
                             <label className="text-sm font-bold text-gray-700">Teléfono Celular *</label>
                            <input {...register('directorPhone')} className="glass-input w-full" placeholder="70000000" />
                            {errors.directorPhone && <p className="text-red-400 text-xs">{errors.directorPhone.message}</p>}
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-bold text-gray-700">Teléfono Fijo (Opcional)</label>
                            <input {...register('phone')} className="glass-input w-full" placeholder="3-3333333" />
                        </div>
                         <div className="space-y-2">
                             <label className="text-sm font-bold text-gray-700">Email Institucional (Opcional)</label>
                            <input {...register('email')} className="glass-input w-full" type="email" placeholder="contacto@colegio.edu.bo" />
                             {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                        </div>
                    </div>
                </section>

                <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100"><SchoolIcon size={24} /></div>
                        <h2 className="text-xl font-bold text-[#004694]">Niveles de Escolaridad *</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ALL_LEVELS.map((level) => (
                            <label key={level} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer border border-gray-200 hover:border-gray-300 transition-all">
                                <input 
                                    type="checkbox" 
                                    value={level} 
                                    checked={selectedLevels.includes(level)}
                                    onChange={() => handleLevelToggle(level)}
                                    className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white"
                                />
                                <span className="text-sm text-gray-700 font-medium">{level}</span>
                            </label>
                        ))}
                    </div>
                     {errors.levels && <p className="text-red-400 text-xs mt-2">{errors.levels.message}</p>}
                </section>

                <div className="flex justify-end pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/schools')}
                        className="mr-4 px-6 py-3 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors font-medium border border-transparent hover:border-gray-200"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={20} />
                        {isSubmitting ? 'Guardando...' : 'Guardar Unidad Educativa'}
                    </button>
                </div>
            </form>
             <style>{`
                .glass-input {
                    display: block;
                    padding: 0.75rem 1rem;
                    background-color: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.75rem;
                    color: #111827;
                    outline: none;
                    transition: all 0.2s;
                }
                .glass-input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                }
                .glass-input::placeholder {
                    color: #9ca3af;
                }
            `}</style>
        </div>
    );
};

export default SchoolFormPage;
