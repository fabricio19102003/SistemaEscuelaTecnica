import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save } from 'lucide-react';
import { CourseService } from '../../services/api/course.service';
import Swal from 'sweetalert2';

const levelSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    code: z.string().min(1, 'El código es requerido'),
    orderIndex: z.coerce.number(),
    durationWeeks: z.coerce.number(),
    totalHours: z.coerce.number(),
    basePrice: z.coerce.number(),
    description: z.string().optional(),
    objectives: z.string().optional(),
    requirements: z.string().optional()
});

type LevelForm = z.infer<typeof levelSchema>;

interface Props {
    courseId: number;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateLevelModal = ({ courseId, onClose, onSuccess }: Props) => {
    const [isLoading, setIsLoading] = useState(false);
    
    const { register, handleSubmit, formState: { errors } } = useForm<LevelForm>({
        resolver: zodResolver(levelSchema) as Resolver<LevelForm>,
        defaultValues: {
            orderIndex: 0,
            durationWeeks: 16,
            totalHours: 64,
            basePrice: 0
        }
    });

    const onSubmit = async (data: LevelForm) => {
        setIsLoading(true);
        try {
            await CourseService.createLevel(courseId, data);
            Swal.fire({
                title: 'Nivel Creado',
                text: 'El nivel se ha agregado correctamente al curso.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                background: '#1f2937',
                color: '#fff'
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            Swal.fire('Error', 'No se pudo crear el nivel', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">Crear Nuevo Nivel</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 custom-scrollbar">
                    <form id="level-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Nombre *</label>
                                <input {...register('name')} className="form-input-dark" placeholder="Ej. Nivel 1" />
                                {errors.name && <span className="text-red-400 text-xs">{errors.name.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Código *</label>
                                <input {...register('code')} className="form-input-dark" placeholder="Ej. L1" />
                                {errors.code && <span className="text-red-400 text-xs">{errors.code.message}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Orden</label>
                                <input type="number" {...register('orderIndex')} className="form-input-dark" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Semanas</label>
                                <input type="number" {...register('durationWeeks')} className="form-input-dark" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Horas Totales</label>
                                <input type="number" {...register('totalHours')} className="form-input-dark" />
                            </div>
                        </div>

                        <div className="space-y-2">
                             <label className="text-sm font-medium text-slate-300">Precio Base (Bs)</label>
                             <input type="number" step="0.01" {...register('basePrice')} className="form-input-dark" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Descripción</label>
                            <textarea {...register('description')} className="form-input-dark min-h-[80px]" />
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-700 bg-slate-800/50 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors">
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        form="level-form"
                        disabled={isLoading}
                        className="px-6 py-2 rounded-xl bg-[#004694] text-white hover:bg-[#003da5] transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
                    >
                        <Save size={18} />
                        {isLoading ? 'Guardando...' : 'Guardar Nivel'}
                    </button>
                </div>
            </div>
            <style>{`
                .form-input-dark {
                    width: 100%;
                    background-color: rgb(15 23 42 / 0.5); /* slate-900/50 */
                    border: 1px solid rgb(51 65 85); /* slate-700 */
                    border-radius: 0.5rem; /* rounded-lg */
                    padding: 0.5rem 1rem;
                    color: white;
                    outline: none;
                    transition: all 0.2s;
                }
                .form-input-dark:focus {
                    border-color: #004694; /* Custom Blue */
                    box-shadow: 0 0 0 1px #004694;
                }
            `}</style>
        </div>
    );
};
