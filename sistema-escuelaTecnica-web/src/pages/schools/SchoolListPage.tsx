import { useEffect, useState } from 'react';
import { useSchoolStore } from '../../store/school.store';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, MapPin, User } from 'lucide-react';

const SchoolListPage = () => {
    const { schools, fetchSchools, deleteSchool, isLoading } = useSchoolStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSchools();
    }, [fetchSchools]);

    const filteredSchools = schools.filter(school => 
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (school.sieCode && school.sieCode.includes(searchTerm)) ||
        (school.code && school.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de eliminar este colegio?')) {
            await deleteSchool(id);
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004694] via-[#005ba3] to-[#006fd6] p-8 text-white shadow-xl mb-8">
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3 flex items-center gap-3">
                        <MapPin size={40} className="text-blue-200" />
                        Gestión de Colegios
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl font-medium">
                        Administra los colegios de origen registrados en el sistema para convenios y estadísticas.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-8">
                <div className="relative flex-1 max-w-md">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                   <input 
                        type="text" 
                        placeholder="Buscar colegio por nombre o código..." 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004694] transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
                <button
                    onClick={() => navigate('/dashboard/schools/new')}
                    className="flex items-center gap-2 px-6 py-3 bg-[#004694] hover:bg-[#003da5] text-white font-bold rounded-xl shadow-md transition-all transform hover:scale-105"
                >
                    <Plus size={20} />
                    Nuevo Colegio
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Cargando colegios...</p>
                </div>
            ) : filteredSchools.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 border-dashed shadow-sm">
                    <p className="text-gray-500 text-lg">No se encontraron colegios registrados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSchools.map((school) => (
                        <div key={school.id} className="group bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-2 border border-blue-100">
                                        SIE: {school.sieCode || 'N/A'}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{school.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">ID: {school.code}</p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => navigate(`/dashboard/schools/${school.id}`)}
                                        className="p-2 bg-gray-100 hover:bg-white border border-gray-200 rounded-lg text-blue-600 transition-colors shadow-sm"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(school.id)}
                                        className="p-2 bg-gray-100 hover:bg-red-50 border border-gray-200 rounded-lg text-red-500 hover:text-red-700 transition-colors shadow-sm"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <User size={16} className="text-gray-400" />
                                    <span className="truncate">{school.directorName || 'Sin Director Asignado'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span className="truncate">{school.address || 'Sin dirección'}</span>
                                </div>
                                {school.directorPhone && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">Cel:</span>
                                        <span>{school.directorPhone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SchoolListPage;
