import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { distributions, etablissements, kits } from '../../services/api';
import { getZapLabel } from '../../constants';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalKits: 0,
        totalDistributions: 0,
        totalKitsDistribues: 0,
        totalEtablissements: 0
    });
    const [recentDistributions, setRecentDistributions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState({
        labels: [],
        values: []
    });
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, kitsRes, etabsRes, distRes] = await Promise.all([
                    distributions.getStats(),
                    kits.getAll(),
                    etablissements.getAll(),
                    distributions.getAll()
                ]);

                // Statistiques
                setStats({
                    totalKits: kitsRes.data.length || 0,
                    totalDistributions: statsRes.data.totalDistributions || 0,
                    totalKitsDistribues: statsRes.data.totalKitsDistribues || 0,
                    totalEtablissements: etabsRes.data.length || 0
                });

                // Dernières distributions (5 dernières)
                const sortedDist = distRes.data.sort((a, b) => 
                    new Date(b.date_distrib) - new Date(a.date_distrib)
                );
                setRecentDistributions(sortedDist.slice(0, 5));

                // Données pour le graphique (distributions par date)
                const groupedData = {};
                distRes.data.forEach(dist => {
                    const date = new Date(dist.date_distrib).toLocaleDateString('fr-FR', { 
                        day: '2-digit', 
                        month: 'short' 
                    });
                    groupedData[date] = (groupedData[date] || 0) + dist.quantite_distribuee;
                });

                const sortedDates = Object.keys(groupedData).sort((a, b) => {
                    const [dayA, monthA] = a.split(' ');
                    const [dayB, monthB] = b.split(' ');
                    const months = { 'janv': 0, 'févr': 1, 'mars': 2, 'avr': 3, 'mai': 4, 'juin': 5, 
                                   'juil': 6, 'août': 7, 'sept': 8, 'oct': 9, 'nov': 10, 'déc': 11 };
                    return months[monthA] - months[monthB] || dayA - dayB;
                });

                setChartData({
                    labels: sortedDates.length > 0 ? sortedDates : ['Aucune donnée'],
                    values: sortedDates.length > 0 ? sortedDates.map(d => groupedData[d]) : [0]
                });

            } catch (error) {
                console.error('Erreur:', error);
                toast.error('Erreur lors du chargement des données');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Initialiser le graphique
    useEffect(() => {
        if (!loading && chartRef.current && chartData.labels.length > 0) {
            // Nettoyer l'ancien graphique
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            try {
                // Vérifier si Chart.js est déjà chargé
                if (typeof window.Chart === 'undefined') {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                    script.async = true;
                    document.head.appendChild(script);
                    
                    script.onload = () => {
                        createChart();
                    };
                } else {
                    createChart();
                }
            } catch (error) {
                console.error('Erreur lors du chargement du graphique:', error);
            }
        }

        function createChart() {
            const ctx = chartRef.current.getContext('2d');
            
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.02)');

            chartInstance.current = new window.Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Kits distribués',
                        data: chartData.values,
                        borderColor: '#3b82f6',
                        backgroundColor: gradient,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 20,
                                font: {
                                    size: 12,
                                    weight: '600'
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.parsed.y} kit(s) distribués`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#f3f4f6'
                            },
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        }
                    }
                }
            });
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        };
    }, [loading, chartData]);

    const statCards = [
        { 
            title: 'Total Kits', 
            value: stats.totalKits, 
            icon: '📦', 
            color: 'bg-blue-500'
        },
        { 
            title: 'Distributions', 
            value: stats.totalDistributions, 
            icon: '📋', 
            color: 'bg-green-500'
        },
        { 
            title: 'Kits Distribués', 
            value: stats.totalKitsDistribues, 
            icon: '🎒', 
            color: 'bg-purple-500'
        },
        { 
            title: 'Établissements', 
            value: stats.totalEtablissements, 
            icon: '🏫', 
            color: 'bg-orange-500'
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Section des compteurs (Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, index) => (
                    <div 
                        key={index} 
                        className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                                    {card.title}
                                </p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                            </div>
                            <div className={`w-11 h-11 ${card.color} rounded-xl flex items-center justify-center text-xl text-white`}>
                                {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Graphique + Historique récent */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Graphique - 2/3 de la largeur */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                        📊 Évolution des distributions
                    </h3>
                    <div className="h-[280px] relative">
                        <canvas ref={chartRef} id="dashboardChart"></canvas>
                    </div>
                    {chartData.labels.length === 1 && chartData.labels[0] === 'Aucune donnée' && (
                        <div className="text-center text-gray-400 text-sm mt-2">
                            Aucune distribution enregistrée
                        </div>
                    )}
                </div>

                {/* Historique récent - 1/3 de la largeur */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                        🕐 Distributions récentes
                    </h3>
                    {recentDistributions.length > 0 ? (
                        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                            {recentDistributions.map((dist, index) => (
                                <div 
                                    key={dist.id} 
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-blue-500"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {dist.etablissement_nom || 'Établissement inconnu'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-gray-500">
                                                {dist.kit_nom || '-'}
                                            </span>
                                            <span className="text-xs text-gray-300">•</span>
                                            <span className="text-xs font-semibold text-blue-600">
                                                {dist.quantite_distribuee} kit(s)
                                            </span>
                                            {dist.zap && (
                                                <>
                                                    <span className="text-xs text-gray-300">•</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                                        {getZapLabel(dist.zap)}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right ml-2 flex-shrink-0">
                                        <p className="text-xs text-gray-400">
                                            {new Date(dist.date_distrib).toLocaleDateString('fr-FR', { 
                                                day: '2-digit', 
                                                month: 'short' 
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
                            <span className="text-4xl mb-2">📭</span>
                            <p className="text-sm">Aucune distribution récente</p>
                            <Link 
                                to="/distributions/nouveau"
                                className="text-blue-600 hover:underline text-xs mt-2"
                            >
                                Créer une distribution
                            </Link>
                        </div>
                    )}
                    
                    {recentDistributions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <Link 
                                to="/distributions"
                                className="text-xs text-blue-600 hover:underline flex items-center justify-center gap-1"
                            >
                                Voir toutes les distributions →
                            </Link>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Dashboard;