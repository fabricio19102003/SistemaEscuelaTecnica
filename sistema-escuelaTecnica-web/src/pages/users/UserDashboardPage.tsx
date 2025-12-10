import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/user.store';
import TiltCard from '../../components/ui/TiltCard';
import Swal from 'sweetalert2';
import { 
    Users, 
    UserCheck, 
    UserX, 
    Search,
    Plus,
    Edit2,
    Power,
} from 'lucide-react';

const UserDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { 
        users, 
        metrics, 
        loading, 
        fetchUsers, 
        fetchUserMetrics, 
        toggleUserStatus 
    } = useUserStore();

    const handleToggleStatus = async (user: any) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas ${user.isActive ? 'desactivar' : 'activar'} al usuario ${user.firstName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: user.isActive ? '#ef4444' : '#10b981',
            cancelButtonColor: '#64748b',
            confirmButtonText: user.isActive ? 'Sí, desactivar' : 'Sí, activar',
            cancelButtonText: 'Cancelar',
            background: '#1e293b',
            color: '#fff'
        });

        if (result.isConfirmed) {
            await toggleUserStatus(user.id);
            Swal.fire({
                title: user.isActive ? '¡Desactivado!' : '¡Activado!',
                text: `El usuario ha sido ${user.isActive ? 'desactivado' : 'activado'}.`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                background: '#1e293b',
                color: '#fff'
            });
        }
    };

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchUserMetrics();
    }, []);

    const filteredUsers = users.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.paternalSurname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const ROLE_TRANSLATIONS: Record<string, string> = {
        'ADMIN': 'Administrador',
        'TEACHER': 'Docente',
        'STUDENT': 'Estudiante',
        'GUARDIAN': 'Tutor',
        'LEGAL_GUARDIAN': 'Tutor Legal',
        'legal_guardian': 'Tutor Legal'
    };

    const getRoleBadgeColor = (roleName: string) => {
        switch(roleName) {
            case 'ADMIN': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            case 'TEACHER': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'STUDENT': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div>
                 <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    Gestión de Usuarios
                </h1>
                <p className="text-gray-400 mt-2 text-lg">Administración de cuentas y roles del sistema.</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TiltCard gradientColor="#3b82f6" className="bg-slate-800/80">
                    <div className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Total Usuarios</p>
                            <p className="text-3xl font-black text-white mt-1">{metrics?.totalUsers || 0}</p>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-full text-blue-400 ring-1 ring-blue-500/20">
                            <Users size={28} />
                        </div>
                    </div>
                </TiltCard>

                <TiltCard gradientColor="#10b981" className="bg-slate-800/80">
                   <div className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Activos</p>
                            <p className="text-3xl font-black text-white mt-1">{metrics?.activeUsers || 0}</p>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400 ring-1 ring-emerald-500/20">
                            <UserCheck size={28} />
                        </div>
                    </div>
                </TiltCard>

                <TiltCard gradientColor="#ef4444" className="bg-slate-800/80">
                   <div className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Inactivos</p>
                            <p className="text-3xl font-black text-white mt-1">{metrics?.inactiveUsers || 0}</p>
                        </div>
                         <div className="p-3 bg-red-500/10 rounded-full text-red-400 ring-1 ring-red-500/20">
                            <UserX size={28} />
                        </div>
                    </div>
                </TiltCard>
            </div>

            {/* Actions & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar usuario..." 
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => navigate('/dashboard/users/new')}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-blue-500/25"
                >
                    <Plus size={18} />
                    Nuevo Usuario
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900/50 border-b border-slate-700">
                                <th className="p-4 text-gray-400 font-semibold text-sm">Usuario</th>
                                <th className="p-4 text-gray-400 font-semibold text-sm">Roles</th>
                                <th className="p-4 text-gray-400 font-semibold text-sm">Estado</th>
                                <th className="p-4 text-gray-400 font-semibold text-sm">Último Acceso</th>
                                <th className="p-4 text-gray-400 font-semibold text-sm text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">Cargando usuarios...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No se encontraron usuarios</td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-blue-400 font-bold">
                                                    {user.firstName.charAt(0)}{user.paternalSurname.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{user.firstName} {user.paternalSurname}</p>
                                                    <p className="text-sm text-gray-400">{user.email || user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {user.userRoles?.map(ur => (
                                                    <span key={ur.role.id} className={`px-2 py-0.5 rounded text-xs border ${getRoleBadgeColor(ur.role.name)}`}>
                                                        {ROLE_TRANSLATIONS[ur.role.name] || ur.role.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.isActive 
                                                ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/20' 
                                                : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                                            }`}>
                                                {user.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Nunca'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => navigate(`/dashboard/users/${user.id}/edit`)}
                                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        user.isActive 
                                                        ? 'text-red-400 hover:bg-red-500/10' 
                                                        : 'text-green-400 hover:bg-green-500/10'
                                                    }`}
                                                    title={user.isActive ? 'Desactivar' : 'Activar'}
                                                >
                                                    <Power size={18} />
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

export default UserDashboardPage;
