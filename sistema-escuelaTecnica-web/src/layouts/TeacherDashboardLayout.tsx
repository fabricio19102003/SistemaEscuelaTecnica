import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { 
    LogOut, 
    BookOpen,
    UserCircle,
    Menu,
    X,
    LayoutDashboard
} from 'lucide-react';
import { useState } from 'react';

const TeacherDashboardLayout = () => {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-72 bg-[#004694] border-r border-white/10 flex flex-col
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shadow-lg">
                            <BookOpen className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg tracking-tight">Portal Docente</h1>
                            <p className="text-blue-200 text-xs font-medium">Escuela Técnica</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                             {user?.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                             ) : (
                                <UserCircle className="text-blue-200" size={24} />
                             )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{user?.firstName}</p>
                            <p className="text-blue-200 text-xs truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button
                        onClick={() => {
                            navigate('/teacher/courses');
                            setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                            isActive('/teacher/courses')
                                ? 'bg-[#BF0811] text-white shadow-lg'
                                : 'text-blue-100 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <LayoutDashboard size={20} className={isActive('/teacher/courses') ? 'text-white' : 'text-blue-200 group-hover:text-white transition-colors'} />
                        <span className="font-medium">Mis Cursos</span>
                    </button>

                    <button
                        onClick={() => {
                            navigate('/teacher/grades');
                            setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                            isActive('/teacher/grades')
                                ? 'bg-[#BF0811] text-white shadow-lg'
                                : 'text-blue-100 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <BookOpen size={20} className={isActive('/teacher/grades') ? 'text-white' : 'text-blue-200 group-hover:text-white transition-colors'} />
                        <span className="font-medium">Registro de Notas</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-200 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-200"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <span className="text-[#004694] font-bold">Portal Docente</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherDashboardLayout;
