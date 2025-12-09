import { useEffect, useState } from 'react';
import { useAgreementStore } from '../../store/agreement.store';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Calendar, Percent, Building } from 'lucide-react';

const AgreementListPage = () => {
    const { agreements, fetchAgreements, deleteAgreement, isLoading } = useAgreementStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAgreements();
    }, [fetchAgreements]);

    const filteredAgreements = agreements.filter(agreement => 
        agreement.agreementCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
        agreement.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de desactivar este convenio?')) {
            await deleteAgreement(id);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Convenios</h1>
                    <p className="text-gray-400 mt-1">Administra los convenios y descuentos con colegios</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/agreements/new')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105"
                >
                    <Plus size={20} />
                    Nuevo Convenio
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
               <input 
                    type="text" 
                    placeholder="Buscar convenio por nombre o código..." 
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>

            {isLoading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Cargando convenios...</p>
                </div>
            ) : filteredAgreements.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                    <p className="text-gray-400 text-lg">No se encontraron convenios registrados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAgreements.map((agreement) => (
                        <div key={agreement.id} className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-2 ${agreement.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                        {agreement.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                    <h3 className="text-xl font-bold text-white leading-tight">{agreement.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">Código: {agreement.agreementCode}</p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => navigate(`/dashboard/agreements/${agreement.id}`)}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-blue-300 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(agreement.id)}
                                        className="p-2 bg-white/10 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-400 mt-4 border-t border-white/5 pt-4">
                                <div className="flex items-center gap-2">
                                    <Percent size={16} className="text-emerald-400" />
                                    <span className="font-semibold text-emerald-100">
                                        {agreement.discountType === 'PERCENTAGE' ? `${agreement.discountValue} % Descuento` : `${agreement.discountValue} Bs. Descuento Fijo`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-500" />
                                    <span>Inicio: {formatDate(agreement.startDate)}</span>
                                </div>
                                {agreement.endDate && (
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-500" />
                                        <span>Fin: {formatDate(agreement.endDate)}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Building size={16} className="text-gray-500" />
                                    <span className="truncate">{agreement._count?.schools || 0} Colegios Vinculados</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AgreementListPage;
