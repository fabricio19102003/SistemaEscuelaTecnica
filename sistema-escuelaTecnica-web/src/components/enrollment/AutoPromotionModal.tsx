import { useState, useEffect } from 'react';
import { X, CheckCircle, Loader, UserCheck } from 'lucide-react';
import { useCourseStore } from '../../store/course.store';
import { autoPromoteStudents, getApprovedCandidates, type CandidateStudent } from '../../services/enrollment.service';
import Swal from 'sweetalert2';

interface AutoPromotionModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AutoPromotionModal = ({ onClose, onSuccess }: AutoPromotionModalProps) => {
    const { courses, fetchCourses } = useCourseStore();
    
    // Steps: 1. Select Module, 2. View/Select Candidates, 3. Select Target
    const [selectedCourseId, setSelectedCourseId] = useState('');
    
    // Candidate Selection State
    const [candidates, setCandidates] = useState<CandidateStudent[]>([]);
    const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
    const [selectedCandidateIds, setSelectedCandidateIds] = useState<number[]>([]);

    // Target Config State
    const [targetCourseId, setTargetCourseId] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // Default today
    const [isPromoting, setIsPromoting] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourseId) {
            loadCandidates(Number(selectedCourseId));
        } else {
            setCandidates([]);
            setSelectedCandidateIds([]);
        }
    }, [selectedCourseId]);

    const loadCandidates = async (courseId: number) => {
        setIsLoadingCandidates(true);
        try {
            const data = await getApprovedCandidates(courseId);
            setCandidates(data);
            // Auto-select all by default
            setSelectedCandidateIds(data.map(c => c.student.id));
        } catch (error) {
            console.error('Error loading candidates', error);
            Swal.fire('Error', 'No se pudieron cargar los estudiantes aprobados', 'error');
        } finally {
            setIsLoadingCandidates(false);
        }
    };

    const toggleCandidate = (studentId: number) => {
        setSelectedCandidateIds(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handlePromote = async () => {
        if (!targetCourseId || !startDate || selectedCandidateIds.length === 0) return;

        setIsPromoting(true);
        try {
            const result = await autoPromoteStudents(Number(targetCourseId), startDate, selectedCandidateIds);
            
            await Swal.fire({
                title: '¡Promoción Exitosa!',
                text: `Se creó el grupo "${result.newGroup?.code}" y se matricularon ${result.promoted} estudiantes.`,
                icon: 'success',
                confirmButtonColor: '#004694'
            });
            onSuccess();
            onClose();
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo crear el grupo o realizar la matrícula.',
                icon: 'error'
            });
        } finally {
            setIsPromoting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-[#004694] p-5 flex justify-between items-center text-white">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <UserCheck size={24} /> Promoción Automática por Módulo
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Column 1: Filter */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-700 border-b pb-2">1. Seleccionar Módulo Origen</h4>
                            <select 
                                className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#004694]"
                                value={selectedCourseId}
                                onChange={e => setSelectedCourseId(e.target.value)}
                            >
                                <option value="">Seleccione un curso...</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <p className="text-xs text-gray-500">
                                Se buscarán todos los estudiantes aprobados (Nota {'>='} 51) de este curso.
                            </p>
                        </div>

                        {/* Column 2: Candidates List */}
                        <div className="space-y-4 md:col-span-2 flex flex-col h-full">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h4 className="font-bold text-gray-700">2. Estudiantes Aprobados ({selectedCandidateIds.length}/{candidates.length})</h4>
                                {candidates.length > 0 && (
                                    <button 
                                        onClick={() => setSelectedCandidateIds(selectedCandidateIds.length === candidates.length ? [] : candidates.map(c => c.student.id))}
                                        className="text-xs text-[#004694] font-bold hover:underline"
                                    >
                                        {selectedCandidateIds.length === candidates.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex-1 bg-gray-50 border rounded-xl overflow-hidden min-h-[200px] relative">
                                {isLoadingCandidates && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                                        <Loader className="animate-spin text-[#004694]" />
                                    </div>
                                )}
                                
                                {candidates.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-sm p-4 text-center">
                                        {selectedCourseId ? 'No hay estudiantes aprobados pendientes.' : 'Seleccione un curso para ver candidatos.'}
                                    </div>
                                ) : (
                                    <div className="overflow-y-auto max-h-[300px]">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-100 text-gray-600 font-bold sticky top-0">
                                                <tr>
                                                    <th className="p-3 w-10">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={candidates.length > 0 && selectedCandidateIds.length === candidates.length}
                                                            onChange={() => setSelectedCandidateIds(selectedCandidateIds.length === candidates.length ? [] : candidates.map(c => c.student.id))}
                                                            className="rounded border-gray-300 text-[#004694] focus:ring-[#004694]"
                                                        />
                                                    </th>
                                                    <th className="p-3">Estudiante</th>
                                                    <th className="p-3">Nota Final</th>
                                                    <th className="p-3">Grupo Origen</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {candidates.map(candidate => (
                                                    <tr key={candidate.id} className="hover:bg-blue-50 transition-colors">
                                                        <td className="p-3">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={selectedCandidateIds.includes(candidate.student.id)}
                                                                onChange={() => toggleCandidate(candidate.student.id)}
                                                                className="rounded border-gray-300 text-[#004694] focus:ring-[#004694]"
                                                            />
                                                        </td>
                                                        <td className="p-3 font-medium text-gray-800">
                                                            {candidate.student.user.paternalSurname} {candidate.student.user.maternalSurname} {candidate.student.user.firstName}
                                                        </td>
                                                        <td className="p-3 font-bold text-green-600">
                                                            {candidate.finalGrade} / 100
                                                        </td>
                                                        <td className="p-3 text-xs text-gray-500">
                                                            {candidate.group.code}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Target Configuration */}
                    <div className="border-t pt-6 mt-6">
                        <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                             <span className="bg-gray-200 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                             Configuración del Nuevo Grupo (Destino)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Módulo / Curso Destino</label>
                                <select 
                                    className="w-full p-2.5 border rounded-xl text-sm bg-blue-50/50 font-medium text-blue-900 focus:ring-2 focus:ring-[#004694]"
                                    value={targetCourseId}
                                    onChange={e => setTargetCourseId(e.target.value)}
                                >
                                    <option value="">Seleccione el siguiente nivel...</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha de Inicio del Grupo</label>
                                <input 
                                    type="date"
                                    className="w-full p-2.5 border rounded-xl text-sm font-medium"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                            <button 
                                onClick={handlePromote}
                                disabled={!targetCourseId || !startDate || selectedCandidateIds.length === 0 || isPromoting}
                                className="px-6 py-2.5 bg-[#004694] text-white font-bold rounded-xl shadow-lg hover:bg-[#003da5] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full md:w-auto justify-center"
                            >
                                {isPromoting ? <Loader className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                                Crear Grupo y Matricular
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AutoPromotionModal;
