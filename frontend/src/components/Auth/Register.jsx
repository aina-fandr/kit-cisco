import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../services/api';
import { USER_ROLES } from '../../constants';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        nom: '',
        identifiant: '',
        motDePasse: '',
        confirmPassword: '',
        role: 'admin'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.motDePasse !== formData.confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);

        try {
            await auth.register({
                nom: formData.nom,
                identifiant: formData.identifiant,
                motDePasse: formData.motDePasse,
                role: formData.role
            });
            toast.success('Compte créé avec succès !');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📚</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Créer un compte</h1>
                    <p className="text-gray-600 mt-2">Inscrivez-vous pour accéder à l'application</p>
                    <p className="text-xs text-gray-400 mt-1">CISCO Midongy Atsimo</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Nom complet *</label>
                        <input
                            type="text"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="Votre nom complet"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Identifiant *</label>
                        <input
                            type="text"
                            name="identifiant"
                            value={formData.identifiant}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="Choisissez un identifiant unique"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Rôle</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        >
                            {USER_ROLES.map((role) => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Mot de passe *</label>
                        <input
                            type="password"
                            name="motDePasse"
                            value={formData.motDePasse}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="Minimum 6 caractères"
                            required
                            minLength="6"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">Confirmer le mot de passe *</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="Confirmez votre mot de passe"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Création...' : 'Créer le compte'}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;