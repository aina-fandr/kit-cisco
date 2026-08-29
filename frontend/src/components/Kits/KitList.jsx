import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { kits } from '../../services/api';
import toast from 'react-hot-toast';

const KitList = () => {
    const [kitsList, setKitsList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchKits = async () => {
        try {
            const response = await kits.getAll();
            setKitsList(response.data);
        } catch (error) {
            toast.error('Erreur lors du chargement des kits');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKits();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce kit ?')) return;
        
        try {
            await kits.delete(id);
            toast.success('Kit supprimé avec succès');
            fetchKits();
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

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
                <h2 className="text-2xl font-bold text-gray-800">Kits scolaires</h2>
                <Link
                    to="/kits/nouveau"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                    <span>➕</span> Ajouter un kit
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock disponible</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {kitsList.map((kit) => (
                            <tr key={kit.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 text-sm font-medium text-gray-800">{kit.nom}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{kit.section || '-'}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        kit.quantite_disponible > 0 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {kit.quantite_disponible}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-right">
                                    <Link
                                        to={`/kits/modifier/${kit.id}`}
                                        className="text-blue-600 hover:text-blue-800 mr-3"
                                    >
                                        ✏️
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(kit.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {kitsList.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                    Aucun kit trouvé
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default KitList;