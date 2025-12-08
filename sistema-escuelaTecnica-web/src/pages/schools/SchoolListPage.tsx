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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Colegios</h1>
                    <p className="text-gray-400 mt-1">Administra los colegios registrados en el sistema</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/schools/new')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105"
                >
                    <Plus size={20} />
                    Nuevo Colegio
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
               <input 
                    type="text" 
                    placeholder="Buscar colegio por nombre o código..." 
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>

            {isLoading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Cargando colegios...</p>
                </div>
            ) : filteredSchools.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                    <p className="text-gray-400 text-lg">No se encontraron colegios registrados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSchools.map((school) => (
                        <div key={school.id} className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full mb-2">
                                        SIE: {school.sieCode || 'N/A'}
                                    </span>
                                    <h3 className="text-xl font-bold text-white leading-tight">{school.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">ID: {school.code}</p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => navigate(`/dashboard/schools/${school.id}`)}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-blue-300 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(school.id)}
                                        className="p-2 bg-white/10 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <User size={16} className="text-gray-500" />
                                    <span className="truncate">{school.directorName || 'Sin Director Asignado'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-gray-500" />
                                    <span className="truncate">{school.address || 'Sin dirección'}</span>
                                </div>
                                {school.directorPhone && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Cel:</span>
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
