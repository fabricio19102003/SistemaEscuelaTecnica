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
    Filter,
    Shield,
    GraduationCap,
    Briefcase
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
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchUserMetrics();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.paternalSurname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = selectedRole 
            ? user.userRoles?.some(ur => ur.role.name === selectedRole)
            : true;

        return matchesSearch && matchesRole;
    });

    const ROLE_TRANSLATIONS: Record<string, string> = {
        'ADMIN': 'Administrador',
        'TEACHER': 'Docente',
        'STUDENT': 'Estudiante',
        'GUARDIAN': 'Tutor',
        'LEGAL_GUARDIAN': 'Tutor Legal',
        'legal_guardian': 'Tutor Legal'
    };

    const getRoleBadgeStyle = (roleName: string) => {
        switch(roleName) {
            case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'TEACHER': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'STUDENT': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'GUARDIAN': 
            case 'LEGAL_GUARDIAN':
            case 'legal_guardian': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getRoleIcon = (roleName: string) => {
         switch(roleName) {
            case 'ADMIN': return <Shield size={14} className="mr-1" />;
            case 'TEACHER': return <Briefcase size={14} className="mr-1" />;
            case 'STUDENT': return <GraduationCap size={14} className="mr-1" />;
            case 'GUARDIAN':
            case 'LEGAL_GUARDIAN': return <Users size={14} className="mr-1" />;
            default: return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header */}
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004694] via-[#005ba3] to-[#006fd6] p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3 flex items-center gap-3">
                        <Users size={40} className="text-blue-200" />
                        Gestión de Usuarios
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl font-medium">
                        Administración de cuentas de usuarios, roles del sistema y control de acceso.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TiltCard gradientColor="#3b82f6" className="bg-white border border-gray-200 shadow-sm">
                    <div className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Usuarios</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{metrics?.totalUsers || 0}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full text-[#004694] ring-1 ring-blue-100">
                            <Users size={28} />
                        </div>
                    </div>
                </TiltCard>

                <TiltCard gradientColor="#10b981" className="bg-white border border-gray-200 shadow-sm">
                   <div className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Activos</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{metrics?.activeUsers || 0}</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-full text-emerald-600 ring-1 ring-emerald-100">
                            <UserCheck size={28} />
                        </div>
                    </div>
                </TiltCard>

                <TiltCard gradientColor="#ef4444" className="bg-white border border-gray-200 shadow-sm">
                   <div className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Inactivos</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{metrics?.inactiveUsers || 0}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-full text-red-600 ring-1 ring-red-100">
                            <UserX size={28} />
                        </div>
                    </div>
                </TiltCard>
            </div>

            {/* Actions & Search */}
            {/* Actions & Search */}
            {/* Actions & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex gap-4 w-full md:w-auto flex-1">
                    <div className="relative flex-1 md:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Buscar usuario..." 
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004694] focus:border-transparent sm:text-sm transition-all duration-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <div className="relative w-full md:w-64">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-5 w-5 text-gray-400" />
                        </div>
                         <select
                            className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#004694] focus:border-transparent transition-all appearance-none cursor-pointer"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                         >
                            <option value="">Todos los Roles</option>
                            <option value="ADMIN">Administradores</option>
                            <option value="TEACHER">Docentes</option>
                            <option value="STUDENT">Estudiantes</option>
                            <option value="LEGAL_GUARDIAN">Tutores</option>
                         </select>
                    </div>
                </div>
                
                <button 
                    onClick={() => navigate('/dashboard/users/new')}
                    className="flex items-center gap-2 px-6 py-3 bg-[#004694] hover:bg-[#003da5] text-white font-bold rounded-xl shadow-md transition-all transform hover:scale-105 whitespace-nowrap"
                >
                    <Plus size={20} />
                    Nuevo Usuario
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#004694] border-b border-[#003da5]">
                                <th className="p-4 text-white font-bold text-sm uppercase">Usuario</th>
                                <th className="p-4 text-white font-bold text-sm uppercase">Roles</th>
                                <th className="p-4 text-white font-bold text-sm uppercase">Estado</th>
                                <th className="p-4 text-white font-bold text-sm uppercase">Último Acceso</th>
                                <th className="p-4 text-white font-bold text-sm uppercase text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
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
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#004694] font-bold">
                                                    {user.firstName.charAt(0)}{user.paternalSurname.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{user.firstName} {user.paternalSurname}</p>
                                                    <p className="text-sm text-gray-500">{user.email || user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {user.userRoles?.map(ur => (
                                                    <span key={ur.role.id} className={`flex items-center px-3 py-1 rounded-lg text-xs font-bold border shadow-sm ${getRoleBadgeStyle(ur.role.name)}`}>
                                                        {getRoleIcon(ur.role.name)}
                                                        {ROLE_TRANSLATIONS[ur.role.name] || ur.role.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.isActive 
                                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                                : 'bg-red-50 text-red-700 border border-red-200'
                                            }`}>
                                                {user.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            {user.lastLoginAt ? (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 font-medium">
                                                        {new Date(user.lastLoginAt).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(user.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm italic">Nunca</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => navigate(`/dashboard/users/${user.id}/edit`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
