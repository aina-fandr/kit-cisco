import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { distributions } from '../../services/api';
import { getZapLabel } from '../../constants';
import toast from 'react-hot-toast';

const DistributionList = () => {
    const [distributionsList, setDistributionsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchDistributions = async () => {
        try {
            const response = await distributions.getAll();
            console.log('📦 Données reçues:', response.data); // Débogage
            setDistributionsList(response.data);
        } catch (error) {
            toast.error('Erreur lors du chargement des distributions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDistributions();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette distribution ?')) return;
        
        try {
            await distributions.delete(id);
            toast.success('Distribution supprimée avec succès');
            fetchDistributions();
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    // Fonction pour imprimer une distribution individuelle
    const handlePrintOne = (dist) => {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Distribution - ${dist.etablissement_nom}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; }
                    .container { max-width: 700px; margin: 0 auto; border: 1px solid #ddd; border-radius: 12px; padding: 40px; }
                    .header { text-align: center; border-bottom: 3px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { color: #1e3a8a; font-size: 24px; margin: 0; }
                    .header .subtitle { color: #666; font-size: 14px; margin-top: 5px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 30px; margin-bottom: 30px; }
                    .info-item .label { font-size: 11px; text-transform: uppercase; color: #888; font-weight: 600; }
                    .info-item .value { font-size: 16px; font-weight: 600; color: #1e293b; margin-top: 2px; }
                    .info-item .value.highlight { color: #2563eb; }
                    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
                    .badge { background: #2563eb; color: white; padding: 2px 12px; border-radius: 12px; font-size: 12px; display: inline-block; }
                    .print-date { text-align: right; font-size: 12px; color: #999; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📋 CISCO Midongy Atsimo</h1>
                        <p class="subtitle">Distribution de kits scolaires</p>
                    </div>
                    
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">Établissement</span>
                            <span class="value">${dist.etablissement_nom || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">ZAP</span>
                            <span class="value highlight">${getZapLabel(dist.zap)}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Kit distribué</span>
                            <span class="value">${dist.kit_nom || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Quantité</span>
                            <span class="value highlight">${dist.quantite_distribuee}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Date de distribution</span>
                            <span class="value">${new Date(dist.date_distrib).toLocaleDateString('fr-FR', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Distributeur</span>
                            <span class="value">${dist.utilisateur_nom || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">CISCO</span>
                            <span class="value">Midongy Atsimo</span>
                        </div>
                        <div class="info-item">
                            <span class="label">N° de distribution</span>
                            <span class="value">#${dist.id}</span>
                        </div>
                    </div>
                    
                    <div class="print-date">
                        Imprimé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
                    </div>
                    
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} CISCO Midongy Atsimo - Tous droits réservés</p>
                    </div>
                </div>
                <script>
                    window.onload = function() { window.print(); }
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Fonction pour imprimer toutes les distributions
    const handlePrintAll = () => {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        const dataToPrint = searchTerm ? filteredDistributions : distributionsList;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Liste des Distributions - CISCO Midongy Atsimo</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; }
                    h1 { color: #1e3a8a; text-align: center; margin-bottom: 5px; font-size: 24px; }
                    .subtitle { text-align: center; color: #666; margin-bottom: 30px; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                    th { background-color: #1e3a8a; color: white; padding: 8px 10px; text-align: left; }
                    td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; }
                    tr:nth-child(even) { background-color: #f9fafb; }
                    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                    .date { color: #666; font-size: 12px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 11px; border-top: 1px solid #ddd; padding-top: 20px; }
                    .badge { background: #2563eb; color: white; padding: 1px 10px; border-radius: 10px; font-size: 10px; display: inline-block; }
                    .qty { font-weight: 700; color: #2563eb; }
                    .total-row { background: #f0f4ff !important; font-weight: 600; }
                    .zap-cell { font-size: 11px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>📋 CISCO Midongy Atsimo</h1>
                        <p class="subtitle">Liste des distributions de kits scolaires</p>
                    </div>
                    <div class="date">
                        <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
                        <p style="margin-top:5px;">Total: ${dataToPrint.length} distribution(s)</p>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th style="width:40px;">N°</th>
                            <th style="width:25%;">Établissement</th>
                            <th style="width:20%;">ZAP</th>
                            <th style="width:18%;">Kit</th>
                            <th style="width:50px;">Qté</th>
                            <th style="width:15%;">Date</th>
                            <th style="width:15%;">Distributeur</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dataToPrint.map((dist, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${dist.etablissement_nom || '-'}</td>
                                <td class="zap-cell"><span class="badge">${getZapLabel(dist.zap)}</span></td>
                                <td>${dist.kit_nom || '-'}</td>
                                <td class="qty">${dist.quantite_distribuee}</td>
                                <td>${new Date(dist.date_distrib).toLocaleDateString('fr-FR')}</td>
                                <td>${dist.utilisateur_nom || '-'}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="3" style="text-align:right; padding-right:20px;">
                                <strong>TOTAL:</strong>
                            </td>
                            <td colspan="4">
                                ${dataToPrint.length} distribution(s) - 
                                <strong>${dataToPrint.reduce((sum, d) => sum + d.quantite_distribuee, 0)}</strong> kits distribués
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>© ${new Date().getFullYear()} CISCO Midongy Atsimo - Tous droits réservés</p>
                </div>
                
                <script>
                    window.onload = function() { window.print(); }
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Filtrer les distributions
    const filteredDistributions = distributionsList.filter(dist =>
        (dist.etablissement_nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dist.kit_nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((dist.zap || '') && getZapLabel(dist.zap).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dist.utilisateur_nom || '').toLowerCase().includes(searchTerm.toLowerCase())
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
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Distributions</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Total: <span className="font-semibold text-blue-600">{distributionsList.length}</span> distribution(s)
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link
                        to="/distributions/nouveau"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                        <span>➕</span> Nouvelle distribution
                    </Link>
                    <button
                        onClick={handlePrintAll}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                        <span>🖨️</span> Imprimer tout
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-3 border-b border-gray-100 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="🔍 Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                    </div>
                    {searchTerm && (
                        <span className="text-xs text-gray-500">
                            {filteredDistributions.length} résultat(s)
                        </span>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-[40px]">N°</th>
                                <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Établissement</th>
                                <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">ZAP</th>
                                <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Kit</th>
                                <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-[50px]">Qté</th>
                                <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Distributeur</th>
                                <th className="px-3 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider w-[120px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredDistributions.map((dist, index) => (
                                <tr key={dist.id} className="hover:bg-gray-50 transition">
                                    <td className="px-3 py-2 text-xs text-gray-500 text-center">{index + 1}</td>
                                    <td className="px-3 py-2 text-xs font-medium text-gray-800 max-w-[150px] truncate">
                                        {dist.etablissement_nom || '-'}
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-semibold whitespace-nowrap">
                                            {getZapLabel(dist.zap)}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-600 max-w-[120px] truncate">
                                        {dist.kit_nom || '-'}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-center">
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold">
                                            {dist.quantite_distribuee}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                                        {new Date(dist.date_distrib).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-600 max-w-[100px] truncate">
                                        {dist.utilisateur_nom || '-'}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => handlePrintOne(dist)}
                                                className="text-green-600 hover:text-green-800 transition-colors p-1 text-sm"
                                                title="Imprimer cette distribution"
                                            >
                                                🖨️
                                            </button>
                                            <Link
                                                to={`/distributions/modifier/${dist.id}`}
                                                className="text-blue-600 hover:text-blue-800 transition-colors p-1 text-sm"
                                                title="Modifier"
                                            >
                                                ✏️
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(dist.id)}
                                                className="text-red-600 hover:text-red-800 transition-colors p-1 text-sm"
                                                title="Supprimer"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredDistributions.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-3 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl">📭</span>
                                            <p className="text-sm">Aucune distribution enregistrée</p>
                                            <Link 
                                                to="/distributions/nouveau"
                                                className="text-blue-600 hover:underline text-xs"
                                            >
                                                Créer la première distribution
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredDistributions.length > 0 && (
                    <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 flex flex-wrap justify-between items-center text-xs">
                        <span className="text-gray-600">
                            Total: <strong className="text-blue-600">{filteredDistributions.length}</strong> distribution(s)
                        </span>
                        <span className="text-gray-600">
                            Kits: <strong className="text-green-600">
                                {filteredDistributions.reduce((sum, d) => sum + d.quantite_distribuee, 0)}
                            </strong>
                        </span>
                        {distributionsList.length !== filteredDistributions.length && (
                            <span className="text-gray-400 text-[10px]">
                                Filtré sur {distributionsList.length}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DistributionList;