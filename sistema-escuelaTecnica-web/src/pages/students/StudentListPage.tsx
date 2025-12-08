import { useEffect, useState } from 'react';
import { useStudentStore } from '../../store/student.store';
import { Plus, Search, Edit2, Trash2, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

const StudentListPage = () => {
    const { students, fetchStudents, isLoading, deleteStudent } = useStudentStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const filteredStudents = students.filter(student => {
        if (!student.user) return false;
        const fullName = `${student.user.firstName} ${student.user.paternalSurname || ''} ${student.user.maternalSurname || ''}`.toLowerCase();
        const email = student.user.email?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower);
    });



    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar estudiantes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-600/50 rounded-xl leading-5 bg-white/5 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 sm:text-sm transition-all duration-200 backdrop-blur-sm"
                    />
                </div>
                <button
                    onClick={() => navigate('new')}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    <Plus size={20} />
                    Nuevo Estudiante
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="bg-black/20 text-xs uppercase font-medium text-gray-400">
                                <tr>
                                    <th className="px-6 py-4">Foto</th>
                                    <th className="px-6 py-4">Nombre Completo</th>
                                    <th className="px-6 py-4">C.I.</th>
                                    <th className="px-6 py-4">Email / Contacto</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                <AnimatePresence>
                                    {filteredStudents.map((student) => (
                                        <motion.tr
                                            key={student.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-white/5 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                {student.user?.profileImageUrl ? (
                                                    <img 
                                                        src={student.user.profileImageUrl} 
                                                        alt="Perfil" 
                                                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                        <GraduationCap size={20} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white">
                                                {student.user?.firstName} {student.user?.paternalSurname} {student.user?.maternalSurname}
                                            </td>
                                            <td className="px-6 py-4">
                                                {student.documentNumber}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm">{student.user.email}</span>
                                                    <span className="text-xs text-gray-500">{student.user.phone || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    student.enrollmentStatus === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                                                    student.enrollmentStatus === 'INACTIVE' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                    {student.enrollmentStatus === 'ACTIVE' ? 'Activo' : 
                                                     student.enrollmentStatus === 'INACTIVE' ? 'Inactivo' : student.enrollmentStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => navigate(`${student.id}/edit`)}
                                                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            Swal.fire({
                                                                title: '¿Está seguro?',
                                                                text: "Esta acción no se puede revertir",
                                                                icon: 'warning',
                                                                showCancelButton: true,
                                                                confirmButtonColor: '#3085d6',
                                                                cancelButtonColor: '#d33',
                                                                confirmButtonText: 'Sí, eliminar',
                                                                cancelButtonText: 'Cancelar',
                                                                background: '#1f2937',
                                                                color: '#fff'
                                                            }).then((result) => {
                                                                if (result.isConfirmed) {
                                                                    deleteStudent(String(student.id));
                                                                    Swal.fire({
                                                                        title: 'Eliminado!',
                                                                        text: 'El estudiante ha sido eliminado.',
                                                                        icon: 'success',
                                                                        background: '#1f2937',
                                                                        color: '#fff'
                                                                    })
                                                                }
                                                            })
                                                        }}
                                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!isLoading && filteredStudents.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-gray-400 text-lg">No se encontraron estudiantes.</p>
                </div>
            )}
        </div>
    );
};

export default StudentListPage;
