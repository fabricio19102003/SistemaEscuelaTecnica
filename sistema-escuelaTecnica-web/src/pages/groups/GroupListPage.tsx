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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Gestión de Grupos</h1>
                    <p className="text-slate-400">Administra los grupos académicos y sus horarios</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/groups/new')}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Nuevo Grupo
                </button>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="text-center text-slate-400 py-8">Cargando grupos...</div>
            ) : (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="p-4 text-slate-300 font-medium">Grupo</th>
                                <th className="p-4 text-slate-300 font-medium">Curso / Nivel</th>
                                <th className="p-4 text-slate-300 font-medium">Docente</th>
                                <th className="p-4 text-slate-300 font-medium">Horario</th>
                                <th className="p-4 text-slate-300 font-medium">Estado</th>
                                <th className="p-4 text-slate-300 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredGroups.map((group) => (
                                <tr key={group.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                                                <Users className="text-slate-400" size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{group.name}</p>
                                                <span className="bg-slate-700/50 px-2 py-0.5 rounded text-xs font-mono text-slate-300">
                                                    {group.code}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300">
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium">
                                                {group.level?.course?.name || 'Curso desconocido'}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {group.level?.name || 'Nivel desconocido'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300">
                                        {group.teacher?.user ? (
                                            <span>
                                                {group.teacher.user.firstName} {group.teacher.user.paternalSurname}
                                            </span>
                                        ) : (
                                            <span className="text-slate-500 italic">Sin asignar</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-slate-400" />
                                            <span className="text-sm">{formatSchedule(group.schedules || [])}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold
                                            ${group.status === 'OPEN' ? 'bg-green-500/10 text-green-500' :
                                              group.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                                              group.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-500' :
                                              'bg-slate-500/10 text-slate-500'}`}>
                                            {group.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/dashboard/groups/${group.id}`)}
                                                className="p-2 hover:bg-slate-700 rounded-lg text-blue-400 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(group.id)}
                                                className="p-2 hover:bg-slate-700 rounded-lg text-red-400 transition-colors"
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
                                    <td colSpan={6} className="p-8 text-center text-slate-400">
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
