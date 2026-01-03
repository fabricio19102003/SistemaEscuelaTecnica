import React, { useEffect } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

import { useNotificationStore } from '../store/notification.store';
import { LogOut, User, Menu, LayoutDashboard, Bell, FileText } from 'lucide-react';
import { NotificationBell } from '../components/layout/NotificationBell';
import logo from '../assets/logo_school.png';
import Swal from 'sweetalert2';

const StudentLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const location = useLocation();

    const { unreadCount, fetchNotifications } = useNotificationStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/student/portal', label: 'Panel Principal', icon: LayoutDashboard, exact: true },
        { path: '/student/notifications', label: 'Notificaciones', icon: Bell, exact: true, badge: unreadCount },
        { path: '/student/history', label: 'Cursos Finalizados', icon: FileText, exact: true },
    ];

    useEffect(() => {
        const checkNotifications = async () => {
            await fetchNotifications();
        };
        checkNotifications();
    }, []);

    useEffect(() => {
        if (unreadCount > 0) {
            const hasSeenAlert = sessionStorage.getItem('hasSeenStudentNotificationAlert');
            if (!hasSeenAlert) {
                Swal.fire({
                    title: '¡Tienes notificaciones nuevas!',
                    text: `Tienes ${unreadCount} mensaje(s) sin leer.`,
                    icon: 'info',
                    confirmButtonText: 'Ver Notificaciones',
                    showCancelButton: true,
                    cancelButtonText: 'Más tarde',
                    confirmButtonColor: '#004694'
                }).then((result) => {
                    sessionStorage.setItem('hasSeenStudentNotificationAlert', 'true');
                    if (result.isConfirmed) {
                        navigate('/student/notifications');
                    }
                });
            }
        }
    }, [unreadCount]);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <aside 
                className={`${isSidebarOpen ? 'w-72' : 'w-24'} 
                bg-[#004694] border-r border-[#003da5] 
                flex flex-col transition-all duration-300 ease-in-out z-20 shadow-xl relative`}
            >
                <div className="p-6 border-b border-white/10 flex items-center justify-between h-20">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-1.5 rounded-lg shadow-sm">
                                <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                            </div>
                            <span className="font-bold text-lg text-white tracking-wide">
                                Portal Estudiante
                            </span>
                        </div>
                    ) : (
                         <div className="bg-white p-1.5 rounded-lg shadow-sm mx-auto">
                            <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                         </div>
                    )}
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                        className="p-1.5 hover:bg-white/10 rounded-lg text-blue-100 hover:text-white transition-colors absolute -right-3 top-7 bg-[#003da5] border border-white/10 shadow-md"
                    >
                        <Menu size={16} />
                    </button>
                </div>
                
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent">
                    {navItems.map((item) => {
                        const isActive = item.exact 
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path);

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive: _isActive }) => `
                                    flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative overflow-hidden font-medium
                                    ${isActive 
                                        ? 'bg-[#0066CC] text-white shadow-md border border-white/10' 
                                        : 'text-blue-100 hover:text-white hover:bg-white/10'
                                    }
                                `}
                            >
                                <item.icon size={22} className={`min-w-[22px] ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                                <span className={`whitespace-nowrap transition-all duration-300 ${!isSidebarOpen && 'opacity-0 translate-x-10 hidden'}`}>
                                    {item.label}
                                </span>
                                {item.badge && item.badge > 0 && (
                                    <span className={`
                                        absolute right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full transition-all duration-300
                                        ${!isSidebarOpen && 'scale-0'}
                                    `}>
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 bg-[#003da5]/50">
                    <div className={`flex items-center gap-3 p-3 rounded-xl bg-[#000000]/20 border border-white/5 mb-3 ${!isSidebarOpen && 'justify-center'}`}>
                        <div className="bg-white p-1.5 rounded-lg shadow-sm">
                            <User size={20} className="text-[#004694]" />
                        </div>
                        {isSidebarOpen && (
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">{user?.firstName}</p>
                                <p className="text-xs text-blue-200 truncate font-medium">Estudiante</p>
                            </div>
                        )}
                    </div>
                     <button 
                        onClick={handleLogout} 
                        className={`w-full flex items-center gap-3 p-3 text-white hover:bg-red-600/80 rounded-xl transition-all duration-200 ${!isSidebarOpen && 'justify-center'}`}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="font-bold">Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative z-10 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-gray-200 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-[#004694] tracking-tight">
                            {navItems.find(item => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path))?.label || 'Portal Estudiante'}
                        </h1>
                        <p className="text-gray-500 text-sm">Bienvenido a tu Espacio Académico</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                         <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 overflow-hidden flex items-center justify-center text-[#004694] font-bold">
                            {user?.firstName?.charAt(0)}{user?.paternalSurname?.charAt(0)}
                        </div>
                    </div>
                </header>
                
                <div className="p-8 pb-20">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;
