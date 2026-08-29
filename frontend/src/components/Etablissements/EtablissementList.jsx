import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { etablissements } from '../../services/api';
import { getZapLabel } from '../../constants';
import toast from 'react-hot-toast';

const EtablissementList = () => {
    const [etablissementsList, setEtablissementsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchEtablissements = async () => {
        try {
            const response = await etablissements.getAll();
            setEtablissementsList(response.data);
        } catch (error) {
            toast.error('Erreur lors du chargement des établissements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEtablissements();
    }, []);

    const handleDelete = async (code) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet établissement ?')) return;
        
        try {
            await etablissements.delete(code);
            toast.success('Établissement supprimé avec succès');
            fetchEtablissements();
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const filteredEtablissements = etablissementsList.filter(etab =>
        etab.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        etab.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (etab.zap && getZapLabel(etab.zap).toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Établissements scolaires</h2>
                <Link
                    to="/etablissements/nouveau"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                    <span>➕</span> Ajouter un établissement
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100">
                    <input
                        type="text"
                        placeholder="🔍 Rechercher par code, nom ou ZAP..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-80 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ZAP</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CISCO</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Directeur</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredEtablissements.map((etab) => (
                                <tr key={etab.code} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                                            {etab.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                                        {etab.nom}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {etab.zap ? (
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                {getZapLabel(etab.zap)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {etab.cisco ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                {etab.cisco}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {etab.directeur || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right">
                                        <Link
                                            to={`/etablissements/modifier/${etab.code}`}
                                            className="text-blue-600 hover:text-blue-800 mr-3 transition-colors"
                                            title="Modifier"
                                        >
                                            ✏️
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(etab.code)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                            title="Supprimer"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredEtablissements.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-4xl">🏫</span>
                                            <p>Aucun établissement trouvé</p>
                                            <Link 
                                                to="/etablissements/nouveau"
                                                className="text-blue-600 hover:underline text-sm mt-2"
                                            >
                                                Ajouter un établissement
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pied de tableau avec statistiques */}
                {filteredEtablissements.length > 0 && (
                    <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                            Total: <strong className="text-blue-600">{filteredEtablissements.length}</strong> établissement(s)
                        </span>
                        <span className="text-sm text-gray-500">
                            {etablissementsList.length !== filteredEtablissements.length && 
                                `(Filtré sur ${etablissementsList.length} au total)`
                            }
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EtablissementList;