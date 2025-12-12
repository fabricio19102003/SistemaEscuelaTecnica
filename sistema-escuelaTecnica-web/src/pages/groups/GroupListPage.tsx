import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash, Search, Users, Calendar, BookOpen } from 'lucide-react';
import type { Group } from '../../types/group.types';
import { getGroups, deleteGroup } from '../../services/api/group.service';
import Swal from 'sweetalert2';

const GroupListPage = () => {
    const navigate = useNavigate();
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            const data = await getGroups();
            setGroups(data);
        } catch (error) {
            console.error('Error loading groups:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los grupos',
                icon: 'error',
                background: '#1f2937',
                color: '#fff'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción cambiará el estado a CANCELADO",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Sí, cancelar grupo',
            cancelButtonText: 'Cancelar',
            background: '#1f2937',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await deleteGroup(id);
                await loadGroups();
                Swal.fire({
                    title: '¡Cancelado!',
                    text: 'El grupo ha sido cancelado.',
                    icon: 'success',
                    background: '#1f2937',
                    color: '#fff'
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo cancelar el grupo',
                    icon: 'error',
                    background: '#1f2937',
                    color: '#fff'
                });
            }
        }
    };

    const formatSchedule = (schedules: any[]) => {
        if (!schedules || schedules.length === 0) return 'Sin horario';
        // Simple summary: "Mon, Wed 10:00 - 12:00"
        return schedules.map(s => s.dayOfWeek.substring(0, 3)).join(', ');
    };

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004694] via-[#005ba3] to-[#006fd6] p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3 flex items-center gap-3">
                        <Users size={40} className="text-blue-200" />
                        Gestión de Grupos
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl font-medium">
                        Administra los grupos académicos, asignación de docentes y horarios de clases.
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
                        placeholder="Buscar por nombre o código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004694] focus:border-transparent sm:text-sm transition-all duration-200"
                    />
                </div>
                <button
                    onClick={() => navigate('/dashboard/groups/new')}
                    className="flex items-center gap-2 px-6 py-3 bg-[#004694] hover:bg-[#003da5] text-white font-bold rounded-xl shadow-md transition-all transform hover:scale-105"
                >
                    <Plus size={20} />
                    Nuevo Grupo
                </button>
            </div>

            {isLoading ? (
                <div className="text-center text-gray-500 py-8">Cargando grupos...</div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-[#004694] border-b border-[#003da5]">
                            <tr>
                                <th className="p-4 text-white font-bold uppercase text-xs">Grupo</th>
                                <th className="p-4 text-white font-bold uppercase text-xs">Curso / Nivel</th>
                                <th className="p-4 text-white font-bold uppercase text-xs">Docente</th>
                                <th className="p-4 text-white font-bold uppercase text-xs">Horario</th>
                                <th className="p-4 text-white font-bold uppercase text-xs">Estado</th>
                                <th className="p-4 text-white font-bold uppercase text-xs text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredGroups.map((group) => (
                                <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                                                <Users className="text-[#004694]" size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{group.name}</p>
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono text-gray-600 border border-gray-200">
                                                    {group.code}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 font-medium">
                                                {group.level?.course?.name || 'Curso desconocido'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {group.level?.name || 'Nivel desconocido'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {group.teacher?.user ? (
                                            <span className="text-gray-900">
                                                {group.teacher.user.firstName} {group.teacher.user.paternalSurname}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic">Sin asignar</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            <span className="text-sm">{formatSchedule(group.schedules || [])}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border
                                            ${group.status === 'OPEN' ? 'bg-green-50 text-green-700 border-green-200' :
                                              group.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                                              group.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                              'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                            {group.status === 'OPEN' ? 'ABIERTO' : 
                                             group.status === 'CANCELLED' ? 'CANCELADO' :
                                             group.status === 'COMPLETED' ? 'COMPLETADO' : group.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/dashboard/groups/${group.id}`)}
                                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(group.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredGroups.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No se encontraron grupos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default GroupListPage;
