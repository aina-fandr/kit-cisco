import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { etablissements } from '../../services/api';
import { CISCO_DEFAUT, COMMUNES, ZAP_OPTIONS, COMMUNE_ZAP_MAPPING } from '../../constants';
import toast from 'react-hot-toast';

const EtablissementForm = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        nom: '',
        zap: '',
        cisco: CISCO_DEFAUT,
        directeur: '',
        commune: ''
    });

    const isEditMode = !!code;

    useEffect(() => {
        if (isEditMode) {
            const fetchEtablissement = async () => {
                try {
                    const response = await etablissements.getOne(code);
                    setFormData(response.data);
                } catch (error) {
                    toast.error('Erreur lors du chargement');
                    navigate('/etablissements');
                }
            };
            fetchEtablissement();
        }
    }, [code, isEditMode, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Si la commune change, mettre à jour automatiquement le ZAP
        if (name === 'commune') {
            const zapInfo = COMMUNE_ZAP_MAPPING[value];
            setFormData({
                ...formData,
                commune: value,
                zap: zapInfo ? zapInfo.value : ''
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditMode) {
                await etablissements.update(code, formData);
                toast.success('Établissement mis à jour');
            } else {
                await etablissements.create(formData);
                toast.success('Établissement créé');
            }
            navigate('/etablissements');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    // Obtenir le label du ZAP sélectionné
    const getZapLabel = (zapValue) => {
        const zap = ZAP_OPTIONS.find(z => z.value === zapValue);
        return zap ? zap.label : zapValue;
    };

    return (
        <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isEditMode ? 'Modifier l\'établissement' : 'Ajouter un établissement'}
            </h2>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Code *</label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            disabled={isEditMode}
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition ${isEditMode ? 'bg-gray-100' : ''}`}
                            required
                            placeholder="ex: EP001"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Nom *</label>
                        <input
                            type="text"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            required
                            placeholder="Nom de l'école"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Commune *</label>
                        <select
                            name="commune"
                            value={formData.commune}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            required
                        >
                            <option value="">Sélectionner une commune</option>
                            {COMMUNES.map((commune) => (
                                <option key={commune} value={commune}>{commune}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Le ZAP sera automatiquement attribué</p>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">ZAP</label>
                        <input
                            type="text"
                            value={getZapLabel(formData.zap)}
                            disabled
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 cursor-not-allowed"
                        />
                        <p className="text-xs text-blue-600 mt-1">
                            {formData.zap ? `✅ ${getZapLabel(formData.zap)}` : '🔸 Sélectionnez une commune'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">CISCO</label>
                        <input
                            type="text"
                            name="cisco"
                            value={formData.cisco}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50"
                            placeholder="CISCO Midongy Atsimo"
                            readOnly
                        />
                        <p className="text-xs text-blue-600 mt-1">✅ {CISCO_DEFAUT}</p>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Directeur</label>
                        <input
                            type="text"
                            name="directeur"
                            value={formData.directeur}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="Nom du directeur"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/etablissements')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EtablissementForm;