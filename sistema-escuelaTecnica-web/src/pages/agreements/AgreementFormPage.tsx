import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useAgreementStore } from '../../store/agreement.store';
import { ArrowLeft, Save, FileSignature, Calendar, Percent, Building2, Search, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DiscountType } from '../../types/agreement.types';
import { useSchoolStore } from '../../store/school.store';

const agreementSchema = z.object({
    name: z.string().min(3, 'El nombre del convenio es requerido'),
    discountType: z.nativeEnum(DiscountType),
    discountValue: z.coerce.number().min(0.01, 'El valor del descuento debe ser mayor a 0'),
    startDate: z.string().min(1, 'La fecha de inicio es requerida'),
    endDate: z.string().optional().nullable(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
    schoolIds: z.array(z.number()).optional()
});

type AgreementForm = z.infer<typeof agreementSchema>;

const AgreementFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { createAgreement, updateAgreement, fetchAgreementById, selectedAgreement, isLoading: isAgreementLoading } = useAgreementStore();
    const { schools, fetchSchools, isLoading: isSchoolsLoading } = useSchoolStore();
    const [searchTerm, setSearchTerm] = useState('');
    
    const isEditMode = !!id;

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting }, reset, watch } = useForm({
        resolver: zodResolver(agreementSchema),
        defaultValues: {
            isActive: true,
            discountType: DiscountType.PERCENTAGE
        }
    });

    const selectedDiscountType = watch('discountType');

    useEffect(() => {
        fetchSchools();
        if (isEditMode && id) {
            fetchAgreementById(Number(id));
        }
    }, [id, isEditMode, fetchAgreementById, fetchSchools]);

    useEffect(() => {
        if (isEditMode && selectedAgreement) {
            reset({
                name: selectedAgreement.name,
                discountType: selectedAgreement.discountType,
                discountValue: Number(selectedAgreement.discountValue),
                startDate: new Date(selectedAgreement.startDate).toISOString().split('T')[0],
                endDate: selectedAgreement.endDate ? new Date(selectedAgreement.endDate).toISOString().split('T')[0] : '',
                notes: selectedAgreement.notes || '',
                isActive: selectedAgreement.isActive,
                schoolIds: selectedAgreement.schools?.map(s => s.id) || []
            });
        }
    }, [selectedAgreement, isEditMode, reset]);

    const onSubmit: SubmitHandler<AgreementForm> = async (data) => {
        try {
            const submissionData: any = { ...data };
            if (!submissionData.endDate) submissionData.endDate = null;

            if (isEditMode && id) {
                await updateAgreement(Number(id), submissionData);
                await Swal.fire({
                    title: '¡Actualizado!',
                    text: 'El convenio se ha actualizado correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#3085d6',
                    background: '#1f2937', 
                    color: '#fff'
                });
            } else {
                await createAgreement(submissionData);
                await Swal.fire({
                    title: '¡Creado!',
                    text: 'El convenio se ha creado correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#3085d6',
                    background: '#1f2937',
                    color: '#fff'
                });
            }
            navigate('/dashboard/agreements');
        } catch (error) {
            console.error('Error saving agreement:', error);
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al guardar el convenio.',
                icon: 'error',
                confirmButtonColor: '#d33',
                background: '#1f2937',
                color: '#fff'
            });
        }
    };

    if (isAgreementLoading && isEditMode) {
        return <div className="text-white text-center p-10">Cargando...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/dashboard/agreements')} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div>
                     <h1 className="text-3xl font-bold text-white tracking-tight">
                        {isEditMode ? 'Editar Convenio' : 'Nuevo Convenio'}
                    </h1>
                    <p className="text-gray-400">Establecer acuerdos y descuentos con colegios</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><FileSignature size={24} /></div>
                        <h2 className="text-xl font-semibold text-white">Detalles del Convenio</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <label className="text-sm font-medium text-gray-300">Nombre del Convenio *</label>
                            <input 
                                type="text"
                                {...register('name')}
                                className="glass-input w-full"
                                placeholder="Ej: Convenio 2024 - Red de Colegios"
                                onInput={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    target.value = target.value.toUpperCase();
                                }}
                            />
                            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
                        </div>

                         <div className="space-y-2 col-span-2 md:col-span-1">
                             <div className="flex justify-between">
                                  <label className="text-sm font-medium text-gray-300">Tipo de Descuento *</label>
                                  <label className="text-sm font-medium text-gray-300">Activo</label>
                             </div>
                             <div className="flex gap-4">
                                <select {...register('discountType')} className="glass-input w-full flex-1 [&>option]:text-black">
                                    <option value={DiscountType.PERCENTAGE}>Porcentaje (%)</option>
                                    <option value={DiscountType.FIXED_AMOUNT}>Monto Fijo (Bs)</option>
                                </select>
                                
                                {isEditMode && (
                                    <div className="flex items-center h-[50px]">
                                        <input type="checkbox" {...register('isActive')} className="w-6 h-6 rounded bg-white/5 border-white/10 focus:ring-offset-0 focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                )}
                             </div>
                        </div>

                        <div className="space-y-2">
                             <label className="text-sm font-medium text-gray-300">Valor del Descuento *</label>
                             <div className="relative">
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    {...register('discountValue')} 
                                    className="glass-input w-full pr-16" 
                                    placeholder="0.00" 
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold pointer-events-none">
                                    {selectedDiscountType === DiscountType.PERCENTAGE ? <Percent size={18} /> : 'Bs'}
                                </div>
                             </div>
                            {errors.discountValue && <p className="text-red-400 text-xs">{errors.discountValue.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Notas Adicionales</label>
                             <textarea 
                                {...register('notes')} 
                                className="glass-input w-full h-[50px] resize-none" 
                                placeholder="Observaciones..." 
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.value = target.value.toUpperCase();
                                }}
                             />
                        </div>
                    </div>
                </section>

                <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                     <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                        <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><Calendar size={24} /></div>
                        <h2 className="text-xl font-semibold text-white">Vigencia del Convenio</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Fecha de Inicio *</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    {...register('startDate')} 
                                    className="glass-input w-full [color-scheme:dark] cursor-pointer" 
                                />
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                            {errors.startDate && <p className="text-red-400 text-xs">{errors.startDate.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Fecha de Finalización (Opcional)</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    {...register('endDate')} 
                                    className="glass-input w-full [color-scheme:dark] cursor-pointer" 
                                />
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                            <p className="text-xs text-gray-500">Dejar en blanco si es indefinido</p>
                        </div>
                    </div>
                </section>

                <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                        <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400"><Building2 size={24} /></div>
                        <h2 className="text-xl font-semibold text-white">Colegios Adscritos</h2>
                        <div className="ml-auto flex items-center bg-white/5 rounded-lg px-3 py-1.5 border border-white/10">
                            <Search size={16} className="text-gray-400 mr-2" />
                            <input 
                                type="text"
                                placeholder="Buscar colegio..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                                className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-48"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {schools
                            .filter(school => school.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(school => {
                                const currentSchoolIds = watch('schoolIds') || [];
                                const isSelected = currentSchoolIds.includes(school.id);
                                return (
                                    <div 
                                        key={school.id}
                                        onClick={() => {
                                            const current = watch('schoolIds') || [];
                                            const exists = current.includes(school.id);
                                            const newVal = exists ? current.filter((id: number) => id !== school.id) : [...current, school.id];
                                            setValue('schoolIds', newVal, { shouldDirty: true, shouldValidate: true });
                                        }}
                                        className={`relative group cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                                            isSelected 
                                            ? 'bg-blue-500/20 border-blue-500/50' 
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className={`font-medium ${isSelected ? 'text-blue-200' : 'text-gray-200'}`}>{school.name}</h3>
                                                <p className="text-sm text-gray-500 mt-1">{school.code}</p>
                                                {school.directorName && <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">Director: {school.directorName}</p>}
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                                                isSelected 
                                                ? 'bg-blue-500 border-blue-500 text-white' 
                                                : 'border-gray-600 text-transparent group-hover:border-gray-500'
                                            }`}>
                                                <Check size={14} />
                                            </div>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            value={school.id} 
                                            {...register('schoolIds')}
                                            className="hidden" 
                                        />
                                    </div>
                                );
                            })}
                            {schools.length === 0 && (
                                <p className="col-span-full text-center text-gray-500 py-8">No hay colegios registrados</p>
                            )}
                    </div>
                </section>

                <div className="flex justify-end pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/agreements')}
                        className="mr-4 px-6 py-3 rounded-xl text-gray-300 hover:bg-white/10 transition-colors font-medium border border-transparent hover:border-white/10"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={20} />
                        {isSubmitting ? 'Guardando...' : 'Guardar Convenio'}
                    </button>
                </div>
            </form>
             <style>{`
                .glass-input {
                    display: block;
                    padding: 0.75rem 1rem;
                    background-color: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.75rem;
                    color: white;
                    outline: none;
                    transition: all 0.2s;
                }
                .glass-input:focus {
                    background-color: rgba(255, 255, 255, 0.1);
                    border-color: rgba(59, 130, 246, 0.5);
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                }
                .glass-input::placeholder {
                    color: rgba(156, 163, 175, 0.8);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
};

export default AgreementFormPage;
