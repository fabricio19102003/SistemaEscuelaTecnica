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
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004694] via-[#005ba3] to-[#006fd6] p-8 text-white shadow-xl mb-8">
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3 flex items-center gap-3">
                        <Building size={40} className="text-blue-200" />
                        Gestión de Convenios
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl font-medium">
                        Administra los convenios comerciales y descuentos aplicables a los colegios vinculados.
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
                        placeholder="Buscar convenio por nombre o código..." 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004694] transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
                <button
                    onClick={() => navigate('/dashboard/agreements/new')}
                    className="flex items-center gap-2 px-6 py-3 bg-[#004694] hover:bg-[#003da5] text-white font-bold rounded-xl shadow-md transition-all transform hover:scale-105"
                >
                    <Plus size={20} />
                    Nuevo Convenio
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Cargando convenios...</p>
                </div>
            ) : filteredAgreements.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 border-dashed shadow-sm">
                    <p className="text-gray-500 text-lg">No se encontraron convenios registrados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAgreements.map((agreement) => (
                        <div key={agreement.id} className="group bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-2 border ${agreement.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                        {agreement.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{agreement.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">Código: {agreement.agreementCode}</p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => navigate(`/dashboard/agreements/${agreement.id}`)}
                                        className="p-2 bg-gray-100 hover:bg-white border border-gray-200 rounded-lg text-blue-600 transition-colors shadow-sm"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(agreement.id)}
                                        className="p-2 bg-gray-100 hover:bg-red-50 border border-gray-200 rounded-lg text-red-500 hover:text-red-700 transition-colors shadow-sm"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-500 mt-4 border-t border-gray-100 pt-4">
                                <div className="flex items-center gap-2">
                                    <Percent size={16} className="text-emerald-600" />
                                    <span className="font-bold text-gray-800">
                                        {agreement.discountType === 'PERCENTAGE' ? `${agreement.discountValue} % Descuento` : `${agreement.discountValue} Bs. Descuento Fijo`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span>Inicio: {formatDate(agreement.startDate)}</span>
                                </div>
                                {agreement.endDate && (
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-400" />
                                        <span>Fin: {formatDate(agreement.endDate)}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Building size={16} className="text-gray-400" />
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
