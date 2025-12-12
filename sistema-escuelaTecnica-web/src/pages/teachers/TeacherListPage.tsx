import React, { useEffect } from 'react';
import { useTeacherStore } from '../../store/teacher.store';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, User, BookOpen } from 'lucide-react';
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

            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004694] via-[#005ba3] to-[#006fd6] p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3 flex items-center gap-3">
                        <BookOpen size={40} className="text-blue-200" />
                        Gestión de Docentes
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl font-medium">
                        Administra el plantel docente, sus asignaciones y credenciales de acceso.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="relative flex-1 max-w-md">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar docentes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004694] focus:border-transparent sm:text-sm transition-all duration-200"
                    />
                </div>
                <button
                    onClick={() => navigate('new')}
                    className="flex items-center gap-2 px-6 py-3 bg-[#004694] hover:bg-[#003da5] text-white font-bold rounded-xl shadow-md transition-all duration-200 transform hover:scale-105"
                >
                    <Plus size={20} />
                    Nuevo Docente
                </button>
            </div>            
            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#003da5] text-white text-sm bg-[#004694]">
                                <th className="px-6 py-4 font-bold uppercase text-xs">Foto</th>
                                <th className="px-6 py-4 font-bold uppercase text-xs">Nombre Completo</th>
                                <th className="px-6 py-4 font-bold uppercase text-xs">Especialidad</th>
                                <th className="px-6 py-4 font-bold uppercase text-xs">Contrato</th>
                                <th className="px-6 py-4 font-bold uppercase text-xs">Email / Contacto</th>
                                <th className="px-6 py-4 font-bold uppercase text-xs text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
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
                                            No se encontraron docentes registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTeachers.map((teacher) => (
                                        <motion.tr
                                            key={teacher.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-gray-50 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                {teacher.user.profileImageUrl ? (
                                                    <img 
                                                        src={teacher.user.profileImageUrl} 
                                                        alt="Perfil" 
                                                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#004694]">
                                                        <User size={20} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">
                                                    {teacher.user.firstName} {teacher.user.paternalSurname} {teacher.user.maternalSurname}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {teacher.documentType}: {teacher.documentNumber}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {teacher.specialization || 'Sin asignar'}
                                            </td>
                                            <td className="px-6 py-4">
                                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    teacher.contractType === 'FULL_TIME' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                    teacher.contractType === 'PART_TIME' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                                    'bg-blue-50 text-blue-700 border border-blue-200'
                                                }`}>
                                                    {teacher.contractType === 'FULL_TIME' ? 'Tiempo Completo' :
                                                     teacher.contractType === 'PART_TIME' ? 'Medio Tiempo' : 'Externo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="flex flex-col gap-1">
                                                    <span>{teacher.user.email}</span>
                                                    <span>{teacher.user.phone || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => navigate(`/dashboard/teachers/${teacher.id}/edit`)}
                                                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
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
                                                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
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
