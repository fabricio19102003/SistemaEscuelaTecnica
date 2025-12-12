
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TiltCard from '../../components/ui/TiltCard';
import { 
    Users, 
    GraduationCap, 
    BookOpen, 
    School, 
    FileText, 
    LayoutDashboard 
} from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004694] via-[#005ba3] to-[#006fd6] p-10 text-white shadow-xl">
                <div className="relative z-10 flex flex-col gap-4">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-2">
                        <LayoutDashboard size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                            Panel Principal
                        </h1>
                        <p className="text-blue-100 text-2xl font-light">
                            Bienvenido al Sistema de Gestión Académica
                        </p>
                    </div>
                </div>
                
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent to-black/5 opacity-50"></div>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Students Module */}
                <div onClick={() => navigate('/dashboard/students')} className="cursor-pointer group">
                    <TiltCard gradientColor="#3b82f6" className="h-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
                        <div className="p-6 flex flex-col justify-between h-full space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <GraduationCap size={28} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Estudiantes</h3>
                                <p className="text-gray-500 text-sm">Gestionar inscripciones y datos académicos.</p>
                            </div>
                        </div>
                    </TiltCard>
                </div>

                {/* Teachers Module */}
                <div onClick={() => navigate('/dashboard/teachers')} className="cursor-pointer group">
                    <TiltCard gradientColor="#10b981" className="h-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
                        <div className="p-6 flex flex-col justify-between h-full space-y-4">
                             <div className="flex items-start justify-between">
                                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                    <BookOpen size={28} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Docentes</h3>
                                <p className="text-gray-500 text-sm">Administrar personal docente y asignaciones.</p>
                            </div>
                        </div>
                    </TiltCard>
                </div>

                {/* Users Module */}
                <div onClick={() => navigate('/dashboard/users')} className="cursor-pointer group">
                    <TiltCard gradientColor="#8b5cf6" className="h-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
                        <div className="p-6 flex flex-col justify-between h-full space-y-4">
                             <div className="flex items-start justify-between">
                                <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                    <Users size={28} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Usuarios</h3>
                                <p className="text-gray-500 text-sm">Control de acceso y roles del sistema.</p>
                            </div>
                        </div>
                    </TiltCard>
                </div>

                 {/* Schools Module */}
                 <div onClick={() => navigate('/dashboard/schools')} className="cursor-pointer group">
                    <TiltCard gradientColor="#f59e0b" className="h-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
                        <div className="p-6 flex flex-col justify-between h-full space-y-4">
                             <div className="flex items-start justify-between">
                                <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                                    <School size={28} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Colegios y Convenios</h3>
                                <p className="text-gray-500 text-sm">Gestionar instituciones y acuerdos.</p>
                            </div>
                        </div>
                    </TiltCard>
                </div>

                 {/* Grades Module */}
                 <div onClick={() => navigate('/dashboard/grades')} className="cursor-pointer group">
                    <TiltCard gradientColor="#ef4444" className="h-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
                        <div className="p-6 flex flex-col justify-between h-full space-y-4">
                             <div className="flex items-start justify-between">
                                <div className="p-3 bg-red-50 rounded-xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                                    <FileText size={28} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Notas y Reportes</h3>
                                <p className="text-gray-500 text-sm">Registros académicos y reportes oficiales.</p>
                            </div>
                        </div>
                    </TiltCard>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboardPage;
