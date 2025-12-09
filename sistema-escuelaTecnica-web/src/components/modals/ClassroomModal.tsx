import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import { classroomService, type Classroom } from '../../services/api/classroom.service';

const classroomSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    capacity: z.coerce.number().min(1, 'La capacidad es requerida'),
    location: z.string().optional(),
    description: z.string().optional(),
});

type ClassroomForm = z.infer<typeof classroomSchema>;

interface ClassroomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (classroom: Classroom) => void;
}

const ClassroomModal = ({ isOpen, onClose, onSuccess }: ClassroomModalProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(classroomSchema)
    });

    const onSubmit = async (data: ClassroomForm) => {
        setIsLoading(true);
        try {
            const newClassroom = await classroomService.create(data);
            Swal.fire({
                title: '¡Aula Creada!',
                text: 'El aula ha sido registrada correctamente.',
                icon: 'success',
                timer: 1500,
                background: '#1f2937',
                color: '#fff',
                showConfirmButton: false
            });
            onSuccess(newClassroom);
            reset();
            onClose();
        } catch (error: any) {
            console.error('Error creating classroom:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Error al crear el aula',
                icon: 'error',
                background: '#1f2937',
                color: '#fff'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-lg font-bold text-white">Nueva Aula</h2>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Nombre *</label>
                        <input
                            {...register('name')}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 uppercase"
                            placeholder="Ej. Laboratorio 1"
                            autoFocus
                            onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()}
                        />
                        {errors.name && <span className="text-red-400 text-xs">{errors.name.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Capacidad *</label>
                        <input
                            type="number"
                            {...register('capacity')}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="30"
                        />
                        {errors.capacity && <span className="text-red-400 text-xs">{errors.capacity.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Ubicación</label>
                        <input
                            {...register('location')}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 uppercase"
                            placeholder="Ej. Edificio A, 2do Piso"
                            onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Descripción</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none uppercase"
                            placeholder="Detalles adicionales..."
                            onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm hover:bg-slate-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 transition-colors flex items-center gap-2"
                        >
                            <Save size={16} />
                            {isLoading ? 'Guardando...' : 'Guardar Aula'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassroomModal;
