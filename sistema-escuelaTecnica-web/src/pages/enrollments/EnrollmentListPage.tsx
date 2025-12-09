import { useEffect, useState } from 'react';
import { useEnrollmentStore } from '../../store/enrollment.store';
import { Plus, Search, FileText, Trash2, X, Download, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { PDFViewer } from '@react-pdf/renderer';
import EnrollmentPDF from '../../components/enrollment/EnrollmentPDF';

const EnrollmentListPage = () => {
    const { enrollments, fetchEnrollments, fetchEnrollmentById, selectedEnrollment, deleteEnrollment, isLoading } = useEnrollmentStore();
    const navigate = useNavigate();
    
    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('');
    
    // State for PDF Modal
    const [showPdfModal, setShowPdfModal] = useState(false);

    useEffect(() => {
        fetchEnrollments();
    }, [fetchEnrollments]);

    const filteredEnrollments = enrollments.filter(enrollment => {
        const studentName = `${enrollment.student?.user?.firstName} ${enrollment.student?.user?.paternalSurname}`.toLowerCase();
        const courseName = enrollment.group?.level?.course?.name?.toLowerCase() || '';
        const groupCode = enrollment.group?.code?.toLowerCase() || '';
        const matchesSearch = studentName.includes(searchTerm.toLowerCase()) || 
                              courseName.includes(searchTerm.toLowerCase()) ||
                              groupCode.includes(searchTerm.toLowerCase());

        // Period filter logic (assuming period is part of group code or date)
        // Group Code format usually GRP-YEAR-...
        // enrollment.enrollmentDate also exists.
        // Let's match Year for now if 'selectedPeriod' is a year, or simple includes check.
        const matchesPeriod = selectedPeriod ? (
            enrollment.group?.code?.includes(selectedPeriod) || 
            new Date(enrollment.enrollmentDate).getFullYear().toString() === selectedPeriod
        ) : true;

        return matchesSearch && matchesPeriod;
    });

    const handleViewPdf = async (id: number) => {
        await fetchEnrollmentById(id);
        setShowPdfModal(true);
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción. Se eliminará la matrícula permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1f2937', 
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await deleteEnrollment(id);
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'La matrícula ha sido eliminada.',
                    icon: 'success',
                    background: '#1f2937', 
                    color: '#fff'
                });
            } catch (error: any) {
                Swal.fire({
                    title: 'Error',
                    text: error.message || 'No se pudo eliminar la matrícula',
                    icon: 'error',
                    background: '#1f2937', 
                    color: '#fff'
                });
            }
        }
    };

    return (
        <div className="space-y-6">
             {/* PDF Modal */}
             {showPdfModal && selectedEnrollment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-900 text-white rounded-t-xl">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Download size={20} /> Vista Previa de Matrícula
                            </h3>
                            <button onClick={() => setShowPdfModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-100 overflow-hidden">
                            <PDFViewer width="100%" height="100%" className="w-full h-full">
                                {/* Credentials not available for existing enrollments usually, unless we stored them unencrypted (BAD) or reset them. 
                                    We pass undefined or empty object for credentials. */}
                                <EnrollmentPDF data={selectedEnrollment} credentials={{ username: selectedEnrollment.student?.user?.email }} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Matrículas</h1>
                    <p className="text-gray-400">Gestión de inscripciones y generación de comprobantes</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/enrollments/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-200 transform hover:scale-[1.02]"
                >
                    <Plus size={20} />
                    <span>Nueva Matrícula</span>
                </button>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                 <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Buscar por estudiante, curso o código..." 
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full md:w-64">
                         <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                         <input
                            type="text"
                            placeholder="Filtrar por periodo (ej. 2025)"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                         />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-4 px-4 text-gray-400 font-medium">Estudiante</th>
                                <th className="text-left py-4 px-4 text-gray-400 font-medium">Grupo/Curso</th>
                                <th className="text-left py-4 px-4 text-gray-400 font-medium">Fecha</th>
                                <th className="text-left py-4 px-4 text-gray-400 font-medium">Estado</th>
                                <th className="text-left py-4 px-4 text-gray-400 font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Cargando...</td></tr>
                            ) : filteredEnrollments.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No hay matrículas registradas o no coinciden con la búsqueda</td></tr>
                            ) : (
                                filteredEnrollments.map((enrollment: any) => (
                                    <tr key={enrollment.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="text-white font-medium">
                                                {enrollment.student?.user?.firstName} {enrollment.student?.user?.paternalSurname}
                                            </div>
                                            <div className="text-xs text-gray-500">{enrollment.student?.registrationCode}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-gray-300">
                                                {enrollment.group?.level?.course?.name} ({enrollment.group?.level?.name})
                                            </div>
                                            <div className="text-xs text-gray-500">{enrollment.group?.code}</div>
                                        </td>
                                        <td className="py-4 px-4 text-gray-300">
                                            {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                                        </td>
                                         <td className="py-4 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                enrollment.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {enrollment.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleViewPdf(enrollment.id)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors" 
                                                    title="Ver PDF"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(enrollment.id)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors" 
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EnrollmentListPage;
