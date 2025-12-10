import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserStore } from '../../store/user.store';
import { Save, ArrowLeft, User as UserIcon, Lock, Shield } from 'lucide-react';
import Swal from 'sweetalert2';


const UserFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;

    const ROLE_TRANSLATIONS: Record<string, string> = {
        'ADMIN': 'Administrador',
        'TEACHER': 'Docente',
        'STUDENT': 'Estudiante',
        'GUARDIAN': 'Tutor',
        'LEGAL_GUARDIAN': 'Tutor Legal',
        'legal_guardian': 'Tutor Legal'
    };

    const { 
        users, 
        roles, 
        loading, 
        error, 
        fetchUsers, 
        fetchRoles, 
        createUser, 
        updateUser 
    } = useUserStore();

    const [formData, setFormData] = useState({
        firstName: '',
        paternalSurname: '',
        maternalSurname: '',
        username: '',
        email: '',
        password: '',
        roles: [] as number[],
        isActive: true
    });

    useEffect(() => {
        fetchRoles();
        if (isEditing) {
            // Ensure users are loaded to find the one to edit
            if (users.length === 0) {
                fetchUsers();
            }
        }
    }, [isEditing, fetchRoles, fetchUsers]);

    useEffect(() => {
        if (isEditing && users.length > 0) {
            const user = users.find(u => u.id === Number(id));
            if (user) {
                setFormData({
                    firstName: user.firstName,
                    paternalSurname: user.paternalSurname,
                    maternalSurname: user.maternalSurname || '',
                    username: user.username || '',
                    email: user.email || '',
                    password: '', // Don't populate password
                    roles: user.userRoles.map(ur => ur.role.id),
                    isActive: user.isActive
                });
            }
        }
    }, [isEditing, users, id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateUser(Number(id), formData);
                await Swal.fire({
                    title: '¡Actualizado!',
                    text: 'El usuario ha sido actualizado correctamente.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#1e293b',
                    color: '#fff'
                });
            } else {
                await createUser(formData);
                await Swal.fire({
                    title: '¡Creado!',
                    text: 'El usuario ha sido creado correctamente.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#1e293b',
                    color: '#fff'
                });
            }
            navigate('/dashboard/users');
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al guardar el usuario.',
                icon: 'error',
                background: '#1e293b',
                color: '#fff'
            });
        }
    };

    const handleRoleToggle = (roleId: number) => {
        setFormData(prev => {
            const currentRoles = prev.roles;
            if (currentRoles.includes(roleId)) {
                return { ...prev, roles: currentRoles.filter(id => id !== roleId) };
            } else {
                return { ...prev, roles: [...currentRoles, roleId] };
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate('/dashboard/users')}
                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h1>
                    <p className="text-gray-400">
                        {isEditing ? 'Modificar datos y roles del usuario.' : 'Registrar un nuevo usuario en el sistema.'}
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700/50 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
                        <UserIcon className="text-blue-400" size={24} />
                        <h3 className="text-xl font-semibold text-white">Información Personal</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                             <label className="block text-sm font-medium text-gray-400 mb-2">Nombre</label>
                             <input 
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={e => setFormData({...formData, firstName: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 transition-all"
                             />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-400 mb-2">Apellido Paterno</label>
                             <input 
                                type="text"
                                required
                                value={formData.paternalSurname}
                                onChange={e => setFormData({...formData, paternalSurname: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 transition-all"
                             />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-400 mb-2">Apellido Materno</label>
                             <input 
                                type="text"
                                value={formData.maternalSurname}
                                onChange={e => setFormData({...formData, maternalSurname: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 transition-all"
                             />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700/50 shadow-xl backdrop-blur-sm">
                     <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
                        <Lock className="text-purple-400" size={24} />
                        <h3 className="text-xl font-semibold text-white">Credenciales de Acceso</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <label className="block text-sm font-medium text-gray-400 mb-2">Nombre de Usuario</label>
                             <input 
                                type="text"
                                required
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 transition-all"
                             />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-400 mb-2">Correo Electrónico</label>
                             <input 
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 transition-all"
                             />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-400 mb-2">
                                {isEditing ? 'Nueva Contraseña (dejar en blanco para mantener)' : 'Contraseña'}
                             </label>
                             <input 
                                type="password"
                                required={!isEditing}
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 transition-all"
                             />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700/50 shadow-xl backdrop-blur-sm">
                     <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-700">
                        <Shield className="text-emerald-400" size={28} />
                        <h3 className="text-2xl font-semibold text-white">Roles y Permisos</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {roles.map(role => (
                            <label 
                                key={role.id} 
                                className={`
                                    cursor-pointer p-6 rounded-xl border-2 transition-all duration-200
                                    ${formData.roles.includes(role.id) 
                                        ? 'bg-blue-600/20 border-blue-500 ring-0' 
                                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                        formData.roles.includes(role.id) 
                                            ? 'bg-blue-500 border-blue-500 text-white' 
                                            : 'border-gray-500'
                                    }`}>
                                        {formData.roles.includes(role.id) && <span className="text-sm font-bold">✓</span>}
                                    </div>
                                    <span className={`text-lg font-medium ${formData.roles.includes(role.id) ? 'text-white' : 'text-gray-300'}`}>
                                        {ROLE_TRANSLATIONS[role.name] || role.name}
                                    </span>
                                </div>
                                {role.description && (
                                    <p className="text-gray-400 text-sm mt-2 ml-10">
                                        {role.description}
                                    </p>
                                )}
                                <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={formData.roles.includes(role.id)}
                                    onChange={() => handleRoleToggle(role.id)} 
                                />
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button 
                        type="button"
                        onClick={() => navigate('/dashboard/users')}
                        className="px-6 py-3 text-gray-400 hover:text-white font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02]"
                    >
                        <Save size={20} />
                        {loading ? 'Guardando...' : 'Guardar Usuario'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserFormPage;
