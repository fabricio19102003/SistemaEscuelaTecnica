import React, { useEffect } from 'react';
import { useTeacherStore } from '../../store/teacher.store';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

const TeacherListPage = () => {
    const { teachers, fetchTeachers, isLoading, deleteTeacher } = useTeacherStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = React.useState('');

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

    const filteredTeachers = teachers.filter(teacher => 
        teacher.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.user.paternalSurname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.documentNumber.includes(searchTerm) ||
        teacher.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Docentes</h1>
                    <p className="text-slate-400 mt-1">Gestión del personal académico</p>
                </div>
                <Link
                    to="/dashboard/teachers/new"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Nuevo Docente
                </Link>
            </div>

            {/* Search Bar */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, documento o especialidad..."
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-700/50 text-slate-400 text-sm bg-slate-900/20">
                                <th className="px-6 py-4 font-medium">Foto</th>
                                <th className="px-6 py-4 font-medium">Nombre Completo</th>
                                <th className="px-6 py-4 font-medium">Especialidad</th>
                                <th className="px-6 py-4 font-medium">Contrato</th>
                                <th className="px-6 py-4 font-medium">Email / Contacto</th>
                                <th className="px-6 py-4 font-medium text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            <AnimatePresence>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-slate-400">
                                            Cargando docentes...
                                        </td>
                                    </tr>
                                ) : filteredTeachers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-slate-400">
                                            No se encontraron docentes registados.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTeachers.map((teacher) => (
                                        <motion.tr
                                            key={teacher.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-slate-700/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                {teacher.user.profileImageUrl ? (
                                                    <img 
                                                        src={teacher.user.profileImageUrl} 
                                                        alt="Perfil" 
                                                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                        <User size={20} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">
                                                    {teacher.user.firstName} {teacher.user.paternalSurname} {teacher.user.maternalSurname}
                                                </div>
                                                <div className="text-sm text-slate-400">
                                                    {teacher.documentType}: {teacher.documentNumber}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">
                                                {teacher.specialization || 'Sin asignar'}
                                            </td>
                                            <td className="px-6 py-4">
                                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    teacher.contractType === 'FULL_TIME' ? 'bg-green-500/10 text-green-400' :
                                                    teacher.contractType === 'PART_TIME' ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                    {teacher.contractType === 'FULL_TIME' ? 'Tiempo Completo' :
                                                     teacher.contractType === 'PART_TIME' ? 'Medio Tiempo' : 'Externo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-400">
                                                <div className="flex flex-col gap-1">
                                                    <span>{teacher.user.email}</span>
                                                    <span>{teacher.user.phone || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => navigate(`/dashboard/teachers/${teacher.id}/edit`)}
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
                                                                    deleteTeacher(String(teacher.id));
                                                                    Swal.fire({
                                                                        title: 'Eliminado!',
                                                                        text: 'El docente ha sido eliminado.',
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
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherListPage;
