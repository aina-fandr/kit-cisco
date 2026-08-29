import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { kits } from '../../services/api';
import toast from 'react-hot-toast';

const KitForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nom: '',
        section: '',
        quantiteDisponible: 0
    });

    const isEditMode = !!id;

    useEffect(() => {
        if (isEditMode) {
            const fetchKit = async () => {
                try {
                    const response = await kits.getOne(id);
                    setFormData({
                        nom: response.data.nom,
                        section: response.data.section || '',
                        quantiteDisponible: response.data.quantite_disponible
                    });
                } catch (error) {
                    toast.error('Erreur lors du chargement');
                    navigate('/kits');
                }
            };
            fetchKit();
        }
    }, [id, isEditMode, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'quantiteDisponible' ? parseInt(value) : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditMode) {
                await kits.update(id, formData);
                toast.success('Kit mis à jour');
            } else {
                await kits.create(formData);
                toast.success('Kit créé');
            }
            navigate('/kits');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isEditMode ? 'Modifier le kit' : 'Ajouter un kit'}
            </h2>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Nom du kit *</label>
                        <input
                            type="text"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Section</label>
                        <input
                            type="text"
                            name="section"
                            value={formData.section}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="Ex: Primaire, Secondaire..."
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Quantité disponible</label>
                        <input
                            type="number"
                            name="quantiteDisponible"
                            value={formData.quantiteDisponible}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                        onClick={() => navigate('/kits')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};

export default KitForm;