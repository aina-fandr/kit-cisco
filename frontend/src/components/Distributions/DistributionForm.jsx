import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { distributions, etablissements, kits } from '../../services/api';
import { 
    COMMUNES, 
    ZAP_OPTIONS, 
    COMMUNE_ZAP_MAPPING,
    getZapLabel,
    getZapByCommune
} from '../../constants';
import toast from 'react-hot-toast';

const DistributionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [etablissementsList, setEtablissementsList] = useState([]);
    const [kitsList, setKitsList] = useState([]);
    const [filteredEtablissements, setFilteredEtablissements] = useState([]);
    
    const [formData, setFormData] = useState({
        etablissementCode: '',
        kitId: '',
        quantiteDistribuee: 1,
        dateDistrib: new Date().toISOString().split('T')[0],
        commune: '',
        zap: ''
    });

    const isEditMode = !!id;

    // Charger les données initiales
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [etabRes, kitsRes] = await Promise.all([
                    etablissements.getAll(),
                    kits.getAll()
                ]);
                setEtablissementsList(etabRes.data);
                setKitsList(kitsRes.data);
                setFilteredEtablissements(etabRes.data);
            } catch (error) {
                toast.error('Erreur lors du chargement des données');
            }
        };
        fetchData();
    }, []);

    // Charger les données en mode édition
    useEffect(() => {
        if (isEditMode && etablissementsList.length > 0) {
            const fetchDistribution = async () => {
                try {
                    const response = await distributions.getOne(id);
                    const dist = response.data;
                    
                    const etab = etablissementsList.find(e => e.code === dist.etablissement_code);
                    
                    setFormData({
                        etablissementCode: dist.etablissement_code,
                        kitId: dist.kit_id,
                        quantiteDistribuee: dist.quantite_distribuee,
                        dateDistrib: dist.date_distrib.split('T')[0],
                        commune: etab?.commune || '',
                        zap: etab?.zap || ''
                    });
                } catch (error) {
                    toast.error('Erreur lors du chargement');
                    navigate('/distributions');
                }
            };
            fetchDistribution();
        }
    }, [id, isEditMode, navigate, etablissementsList]);

    // Filtrer les établissements par commune et ZAP
    useEffect(() => {
        let etabs = etablissementsList;
        
        if (formData.commune) {
            etabs = etabs.filter(e => e.commune === formData.commune);
        }
        
        if (formData.zap) {
            etabs = etabs.filter(e => e.zap === formData.zap);
        }
        
        setFilteredEtablissements(etabs);
    }, [formData.commune, formData.zap, etablissementsList]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Si la commune change, mettre à jour automatiquement le ZAP
        if (name === 'commune') {
            const zapInfo = getZapByCommune(value);
            setFormData(prev => ({
                ...prev,
                commune: value,
                zap: zapInfo ? zapInfo.value : '',
                etablissementCode: '' // Réinitialiser l'établissement
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditMode) {
                await distributions.update(id, {
                    etablissementCode: formData.etablissementCode,
                    kitId: formData.kitId,
                    quantiteDistribuee: formData.quantiteDistribuee,
                    dateDistrib: formData.dateDistrib
                });
                toast.success('Distribution mise à jour');
            } else {
                await distributions.create({
                    etablissementCode: formData.etablissementCode,
                    kitId: formData.kitId,
                    quantiteDistribuee: formData.quantiteDistribuee,
                    dateDistrib: formData.dateDistrib
                });
                toast.success('Distribution enregistrée');
            }
            navigate('/distributions');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    const selectedEtab = etablissementsList.find(e => e.code === formData.etablissementCode);

    return (
        <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isEditMode ? 'Modifier la distribution' : 'Nouvelle distribution'}
            </h2>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="space-y-4">
                    {/* Étape 1: Sélection de la Commune */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            <span className="text-blue-600 font-bold">1.</span> Commune *
                        </label>
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
                    </div>

                    {/* Étape 2: ZAP (automatique) */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            <span className="text-blue-600 font-bold">2.</span> ZAP *
                        </label>
                        {formData.commune ? (
                            <div className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 text-blue-700 font-medium">
                                {getZapLabel(formData.zap) || 'Chargement...'}
                            </div>
                        ) : (
                            <div className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500">
                                Sélectionnez d'abord une commune
                            </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                            {formData.commune 
                                ? `ZAP automatiquement attribué pour ${formData.commune}` 
                                : 'Sélectionnez une commune pour voir le ZAP'}
                        </p>
                    </div>

                    {/* Étape 3: Sélection de l'Établissement */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            <span className="text-blue-600 font-bold">3.</span> Établissement *
                        </label>
                        <select
                            name="etablissementCode"
                            value={formData.etablissementCode}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            required
                            disabled={!formData.commune}
                        >
                            <option value="">
                                {!formData.commune 
                                    ? 'Sélectionnez d\'abord une commune'
                                    : 'Sélectionner un établissement'}
                            </option>
                            {filteredEtablissements.map((etab) => (
                                <option key={etab.code} value={etab.code}>
                                    {etab.nom} ({etab.code})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-400 mt-1">
                            {filteredEtablissements.length > 0 
                                ? `${filteredEtablissements.length} établissement(s) disponible(s)` 
                                : 'Aucun établissement trouvé pour cette commune'}
                        </p>
                    </div>

                    {/* Résumé de la sélection */}
                    {selectedEtab && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <p className="text-sm font-semibold text-blue-800 mb-2">✅ Établissement sélectionné</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-500">Nom:</span>
                                    <span className="ml-2 font-medium">{selectedEtab.nom}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Code:</span>
                                    <span className="ml-2 font-medium">{selectedEtab.code}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">ZAP:</span>
                                    <span className="ml-2 font-medium text-blue-600">
                                        {getZapLabel(selectedEtab.zap)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Commune:</span>
                                    <span className="ml-2 font-medium">{selectedEtab.commune || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Directeur:</span>
                                    <span className="ml-2 font-medium">{selectedEtab.directeur || '-'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sélection du Kit */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            <span className="text-blue-600 font-bold">4.</span> Kit *
                        </label>
                        <select
                            name="kitId"
                            value={formData.kitId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            required
                        >
                            <option value="">Sélectionner un kit</option>
                            {kitsList.map((kit) => (
                                <option key={kit.id} value={kit.id}>
                                    {kit.nom} (Stock: {kit.quantite_disponible})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Quantité */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            <span className="text-blue-600 font-bold">5.</span> Quantité *
                        </label>
                        <input
                            type="number"
                            name="quantiteDistribuee"
                            value={formData.quantiteDistribuee}
                            onChange={handleChange}
                            min="1"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            required
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            <span className="text-blue-600 font-bold">6.</span> Date de distribution *
                        </label>
                        <input
                            type="date"
                            name="dateDistrib"
                            value={formData.dateDistrib}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            required
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
                        onClick={() => navigate('/distributions')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DistributionForm;