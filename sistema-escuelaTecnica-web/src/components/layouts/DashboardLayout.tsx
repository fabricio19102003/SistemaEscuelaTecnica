import React from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { LogOut, User, Menu, GraduationCap, Users, BookOpen, LayoutDashboard, School, FileSignature } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../../assets/logo_school.png';

const DashboardLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Panel Principal', icon: LayoutDashboard, exact: true },
        { path: '/dashboard/students', label: 'Estudiantes', icon: GraduationCap, roles: ['ADMIN'] },
        { path: '/dashboard/teachers', label: 'Docentes', icon: Users, roles: ['ADMIN'] },
        { path: '/dashboard/courses', label: 'Cursos', icon: BookOpen, roles: ['ADMIN', 'TEACHER'] },
        // { path: '/dashboard/groups', label: 'Grupos', icon: Layers, roles: ['ADMIN', 'TEACHER'] },
        { path: '/dashboard/schools', label: 'Colegios', icon: School, roles: ['ADMIN'] },

        { path: '/dashboard/agreements', label: 'Convenios', icon: FileSignature, roles: ['ADMIN'] },
        { path: '/dashboard/enrollments', label: 'Matrículas', icon: FileSignature, roles: ['ADMIN', 'TEACHER'] }, // Using FileSignature for now or similar
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-gray-100 flex overflow-hidden relative">
             {/* 3D Animated Background - Shared with Login for consistency */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <motion.div 
                    animate={{ rotate: [0, 360], scale: [1, 1.1, 1], x: [0, 50, 0] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-red-900/10 to-pink-900/10 blur-[100px]" 
                />
                <motion.div 
                    animate={{ rotate: [360, 0], scale: [1, 1.2, 1], x: [0, -30, 0] }}
                    transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-900/10 to-cyan-900/10 blur-[100px]" 
                />
            </div>

            {/* Sidebar */}
            <aside 
                className={`${isSidebarOpen ? 'w-72' : 'w-24'} 
                bg-slate-900/80 backdrop-blur-xl border-r border-white/10 
                flex flex-col transition-all duration-300 ease-in-out z-20 shadow-2xl relative`}
            >
                <div className="p-6 border-b border-white/10 flex items-center justify-between h-20">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 tracking-wide">
                                Escuela Técnica
                            </span>
                        </div>
                    ) : (
                         <img src={logo} alt="Logo" className="w-10 h-10 object-contain mx-auto drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    )}
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors absolute -right-3 top-7 bg-slate-800 border border-white/10 shadow-lg"
                    >
                        <Menu size={16} />
                    </button>
                </div>
                
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        // Check role access
                        if (item.roles && !item.roles.some(r => user?.roles.includes(r))) return null;

                        const isActive = item.exact 
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path);

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                                    ${isActive 
                                        ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)] border border-blue-500/30' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                    }
                                `}
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" 
                                    />
                                )}
                                <item.icon size={22} className={`min-w-[22px] ${isActive ? 'text-blue-400' : 'group-hover:text-gray-300'}`} />
                                <span className={`font-medium whitespace-nowrap transition-all duration-300 ${!isSidebarOpen && 'opacity-0 translate-x-10 hidden'}`}>
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 bg-slate-900/50">
                    <div className={`flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 mb-3 ${!isSidebarOpen && 'justify-center'}`}>
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-lg">
                            <User size={20} className="text-white" />
                        </div>
                        {isSidebarOpen && (
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-gray-200 truncate">{user?.firstName}</p>
                                <p className="text-xs text-blue-400 truncate font-medium">{user?.roles[0]}</p>
                            </div>
                        )}
                    </div>
                     <button 
                        onClick={handleLogout} 
                        className={`w-full flex items-center gap-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 border border-transparent hover:border-red-500/20 ${!isSidebarOpen && 'justify-center'}`}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="font-medium">Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative z-10 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <header className="sticky top-0 z-30 bg-[#0f172a]/80 backdrop-blur-md px-8 py-6 flex items-center justify-between border-b border-white/5">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            {navItems.find(item => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path))?.label || 'Panel de Control'}
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Bienvenido al Sistema de Gestión Académica</p>
                    </div>
                    {/* Add notification/profile/etc here if needed */}
                </header>
                
                <div className="p-8 pb-20">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;

