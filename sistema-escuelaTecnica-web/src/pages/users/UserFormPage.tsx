import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserStore } from '../../store/user.store';
import { Save, ArrowLeft, User as UserIcon, Lock, Shield, Wand2, Eye, EyeOff } from 'lucide-react';
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

    const [showPassword, setShowPassword] = useState(false);

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

    const generateCredentials = () => {
        if (!formData.firstName || !formData.paternalSurname) {
             Swal.fire({
                title: 'Faltan datos',
                text: 'Por favor ingrese Nombre y Apellido Paterno para generar credenciales personalizadas.',
                icon: 'warning',
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#004694'
            });
            return;
        }

        const randomSuffix = Math.floor(100 + Math.random() * 900);
        const cleanPaternal = formData.paternalSurname.replace(/\s+/g, '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cleanFirstName = formData.firstName.replace(/\s+/g, '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        const generatedUsername = `${cleanFirstName.charAt(0)}${cleanPaternal}${randomSuffix}`;
        const generatedPassword = Math.random().toString(36).slice(-8);

        setFormData(prev => ({
            ...prev,
            username: generatedUsername,
            password: generatedPassword
        }));
        
         Swal.fire({
            title: 'Credenciales Generadas',
            html: `
                <div class="text-left bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p class="mb-2"><strong class="text-blue-900">Usuario:</strong> <span class="font-mono text-lg ml-2">${generatedUsername}</span></p>
                    <p><strong class="text-blue-900">Contraseña:</strong> <span class="font-mono text-lg ml-2">${generatedPassword}</span></p>
                </div>
            `,
            icon: 'success',
            timer: 4000,
            showConfirmButton: false,
            background: '#ffffff',
            color: '#1e293b'
        });
    };

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
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#004694] transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-[#004694]">
                        {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h1>
                    <p className="text-gray-500">
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
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <UserIcon className="text-[#004694]" size={24} />
                        <h3 className="text-xl font-bold text-[#004694]">Información Personal</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Nombre</label>
                             <input 
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={e => setFormData({...formData, firstName: e.target.value})}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                             />
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Apellido Paterno</label>
                             <input 
                                type="text"
                                required
                                value={formData.paternalSurname}
                                onChange={e => setFormData({...formData, paternalSurname: e.target.value})}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                             />
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Apellido Materno</label>
                             <input 
                                type="text"
                                value={formData.maternalSurname}
                                onChange={e => setFormData({...formData, maternalSurname: e.target.value})}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                             />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
                     <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <Lock className="text-purple-600" size={24} />
                            <h3 className="text-xl font-bold text-[#004694]">Credenciales de Acceso</h3>
                        </div>
                        <button
                            type="button"
                            onClick={generateCredentials}
                            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg transition-all duration-200 font-bold text-sm border border-purple-100 hover:border-purple-200 shadow-sm"
                            title="Generar usuario y contraseña automáticamente basado en el nombre"
                        >
                            <Wand2 size={16} />
                            Generar Automáticamente
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de Usuario</label>
                             <input 
                                type="text"
                                required
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                             />
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
                             <input 
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                             />
                        </div>
                        <div className="md:col-span-2 space-y-3">
                             <div className="flex justify-between items-center">
                                 <label className="block text-sm font-bold text-gray-700">
                                    {isEditing ? 'Nueva Contraseña' : 'Contraseña'}
                                 </label>
                                 <button
                                     type="button"
                                     onClick={() => setShowPassword(!showPassword)}
                                     className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                 >
                                     {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                     {showPassword ? 'Ocultar' : 'Mostrar'}
                                 </button>
                             </div>
                             <div className="relative">
                                 <input 
                                    type={showPassword ? "text" : "password"}
                                    required={!isEditing}
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    placeholder={isEditing ? 'Dejar en blanco para mantener la actual' : 'Ingrese contraseña segura'}
                                    className="w-full bg-white border border-gray-300 rounded-lg pl-4 pr-12 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                                 />
                                 <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                     <Lock size={18} />
                                 </div>
                             </div>

                             {/* Generated Password Display Area */}
                             {formData.password && formData.password.length > 0 && (
                                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2 animate-fade-in">
                                     <p className="text-xs text-blue-600 font-bold uppercase mb-1">Contraseña Establecida:</p>
                                     <div className="flex items-center justify-between">
                                         <code className="text-lg font-mono font-bold text-blue-900 tracking-wider">
                                             {formData.password}
                                         </code>
                                         <button 
                                             type="button"
                                             onClick={() => {
                                                 navigator.clipboard.writeText(formData.password);
                                                 const Toast = Swal.mixin({
                                                     toast: true,
                                                     position: 'top-end',
                                                     showConfirmButton: false,
                                                     timer: 2000,
                                                     timerProgressBar: true
                                                 });
                                                 Toast.fire({
                                                     icon: 'success',
                                                     title: 'Contraseña copiada'
                                                 });
                                             }}
                                             className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                                             title="Copiar contraseña"
                                         >
                                             <div className="flex items-center gap-1 text-xs font-bold">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                                COPIAR
                                             </div>
                                         </button>
                                     </div>
                                     <p className="text-xs text-blue-400 mt-2">
                                        ⚠️ Asegúrese de copiar esta contraseña y entregarla al usuario. Por seguridad, no podrá visualizarla nuevamente después de guardar.
                                     </p>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
                     <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                        <Shield className="text-emerald-600" size={28} />
                        <h3 className="text-2xl font-bold text-[#004694]">Roles y Permisos</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {roles.map(role => (
                            <label 
                                key={role.id} 
                                className={`
                                    cursor-pointer p-6 rounded-xl border-2 transition-all duration-200
                                    ${formData.roles.includes(role.id) 
                                        ? 'bg-blue-50 border-blue-500 ring-0' 
                                        : 'bg-white border-gray-200 hover:border-gray-300'}
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                        formData.roles.includes(role.id) 
                                            ? 'bg-blue-600 border-blue-600 text-white' 
                                            : 'border-gray-400 bg-gray-50'
                                    }`}>
                                        {formData.roles.includes(role.id) && <span className="text-sm font-bold">✓</span>}
                                    </div>
                                    <span className={`text-lg font-bold ${formData.roles.includes(role.id) ? 'text-blue-900' : 'text-gray-700'}`}>
                                        {ROLE_TRANSLATIONS[role.name] || role.name}
                                    </span>
                                </div>
                                {role.description && (
                                    <p className="text-gray-500 text-sm mt-2 ml-10">
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
                        className="px-6 py-3 text-gray-500 hover:bg-gray-100 hover:text-[#004694] rounded-lg font-medium transition-colors border border-transparent hover:border-gray-200"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-[#004694] hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-sm transition-all transform hover:scale-[1.02]"
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
