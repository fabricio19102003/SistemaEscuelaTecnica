import { useState, useEffect } from 'react';
import { useNotificationStore } from '../../store/notification.store';
import { useCourseStore } from '../../store/course.store';
import { X, Send, Users, User, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface AdminNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedRecipients?: number[]; // IDs
    recipientLabel?: string; // e.g., "Top 5 Mejores Promedios"
}

export const AdminNotificationModal = ({ isOpen, onClose, preSelectedRecipients, recipientLabel }: AdminNotificationModalProps) => {
    const { broadcastNotification, sendBulkNotifications } = useNotificationStore();
    
    // Type: 'BROADCAST' | 'SPECIFIC'
    const [sendType, setSendType] = useState<'BROADCAST' | 'SPECIFIC'>(preSelectedRecipients ? 'SPECIFIC' : 'BROADCAST');
    const [targetRole, setTargetRole] = useState('STUDENT');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (preSelectedRecipients) {
            setSendType('SPECIFIC');
            // If checking "Risk" or "Top", maybe preset a title
            if (recipientLabel?.includes('Riesgo')) {
                 setTitle('Aviso de Rendimiento Académico');
                 setMessage('Estimado estudiante, hemos notado que su rendimiento académico requiere atención. Por favor...');
            } else if (recipientLabel?.includes('Mejores')) {
                 setTitle('Felicitaciones por su Desempeño');
                 setMessage('¡Felicidades! Usted se encuentra entre los mejores promedios de su clase...');
            } else {
                 setTitle('');
                 setMessage('');
            }
        } else {
            setSendType('BROADCAST');
            setTitle('');
            setMessage('');
        }
    }, [preSelectedRecipients, recipientLabel, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        try {
            if (sendType === 'BROADCAST') {
                await broadcastNotification(targetRole, title, message, 'INFO');
                Swal.fire('Enviado', `Notificación enviada a todos los ${targetRole === 'TEACHER' ? 'Docentes' : 'Estudiantes'}`, 'success');
            } else if (sendType === 'SPECIFIC' && preSelectedRecipients) {
                await sendBulkNotifications(preSelectedRecipients, title, message, 'INFO');
                Swal.fire('Enviado', `Notificación enviada a ${recipientLabel || 'destinatarios seleccionados'}`, 'success');
            }
            onClose();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo enviar la notificación', 'error');
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Send size={20} className="text-blue-400" />
                        Nueva Notificación
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    {/* Recipient Info */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Destinatarios</label>
                        {preSelectedRecipients ? (
                            <div className="bg-blue-50 border border-blue-100 text-blue-800 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
                                <Users size={16} />
                                {recipientLabel || `${preSelectedRecipients.length} Usuarios Seleccionados`}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${targetRole === 'STUDENT' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'hover:bg-gray-50 border-gray-200'}`}>
                                    <input type="radio" name="role" value="STUDENT" checked={targetRole === 'STUDENT'} onChange={(e) => setTargetRole(e.target.value)} className="sr-only" />
                                    <User size={24} />
                                    <span className="font-bold text-sm">Estudiantes</span>
                                </label>
                                <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${targetRole === 'TEACHER' ? 'bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500' : 'hover:bg-gray-50 border-gray-200'}`}>
                                    <input type="radio" name="role" value="TEACHER" checked={targetRole === 'TEACHER'} onChange={(e) => setTargetRole(e.target.value)} className="sr-only" />
                                    <Users size={24} />
                                    <span className="font-bold text-sm">Docentes</span>
                                </label>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
                        <input 
                            type="text" 
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Recordatorio de Cierre de Notas"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Mensaje</label>
                        <textarea 
                            required
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escriba su mensaje aquí..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                        />
                    </div>
                </form>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        type="button"
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isSending || !title || !message}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSending ? 'Enviando...' : (
                            <>
                                <Send size={18} /> Enviar Mensaje
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
