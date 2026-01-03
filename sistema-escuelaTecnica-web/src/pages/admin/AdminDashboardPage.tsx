
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TiltCard from '../../components/ui/TiltCard';
import { 
    Users, 
    GraduationCap, 
    BookOpen, 
    School, 
    FileText, 
    LayoutDashboard,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { getGroups, closeGroup } from '../../services/group.service';
import Swal from 'sweetalert2';

const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();

    const [pendingGroups, setPendingGroups] = React.useState<any[]>([]);

    React.useEffect(() => {
        fetchPendingGroups();
    }, []);

    const fetchPendingGroups = async () => {
        try {
            const allGroups = await getGroups();
            const pending = allGroups.filter(g => g.status === 'GRADES_SUBMITTED');
            setPendingGroups(pending);
        } catch (error) {
            console.error('Error fetching groups', error);
        }
    };

    const handleCloseGroup = async (group: any) => {
        const result = await Swal.fire({
            title: '¿Cerrar Curso?',
            text: `Vas a cerrar el curso ${group.name} (${group.code}). Esto cambiará el estado de los estudiantes a COMPLETADO. ¿Deseas continuar?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#004694',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cerrar curso',
            cancelButtonText: 'Cancelar',
            background: '#1f2937', color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await closeGroup(group.id);
                fetchPendingGroups(); // Refresh list
                Swal.fire({
                    title: 'Curso Cerrado',
                    text: 'El curso se ha cerrado correctamente.',
                    icon: 'success',
                    background: '#1f2937', color: '#fff'
                });
            } catch (error) {
                console.error('Error closing group', error);
                Swal.fire('Error', 'No se pudo cerrar el curso', 'error');
            }
        }
    };

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

            {/* Pending Closures Alert Section */}
            {pendingGroups.length > 0 && (
                 <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 animate-in fade-in duration-500">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                            <AlertCircle size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Cursos Listos para Cerrar</h2>
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                            {pendingGroups.length} Pendientes
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingGroups.map((group) => (
                            <div key={group.id} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex flex-col justify-between gap-3">
                                <div>
                                    <h4 className="font-bold text-[#004694]">{group.name}</h4>
                                    <p className="text-sm text-gray-500 font-mono mb-1">{group.code}</p>
                                    <p className="text-sm text-gray-600">Docente: <span className="font-medium">{group.teacher?.user?.firstName || 'Unknown'} {group.teacher?.user?.paternalSurname || ''}</span></p>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleCloseGroup(group); }}
                                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={16} /> Cerrar Curso
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
