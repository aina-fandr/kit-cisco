import React, { useState, useEffect, useRef } from 'react';
import { distributions, etablissements, kits } from '../../services/api';
import { getZapLabel, COMMUNES } from '../../constants';
import toast from 'react-hot-toast';

const ChatBot = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth - 460, y: window.innerHeight - 600 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [data, setData] = useState({
        distributions: [],
        etablissements: [],
        kits: []
    });
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const chatRef = useRef(null);

    // Charger les données
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [distRes, etabRes, kitsRes] = await Promise.all([
                    distributions.getAll(),
                    etablissements.getAll(),
                    kits.getAll()
                ]);
                console.log('📦 Kits chargés:', kitsRes.data);
                setData({
                    distributions: distRes.data,
                    etablissements: etabRes.data,
                    kits: kitsRes.data
                });
            } catch (error) {
                console.error('Erreur chargement données chat:', error);
            }
        };
        fetchData();
    }, []);

    // Auto-scroll vers le bas
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus sur l'input
    useEffect(() => {
        if (isOpen && !isMinimized) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen, isMinimized]);

    // Messages d'accueil
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: 'welcome',
                    sender: 'bot',
                    text: '👋 Bonjour ! Je suis l\'assistant de CISCO Midongy Atsimo.\n\nJe peux vous aider avec :\n• 📦 Consulter les stocks de kits\n• 📋 Voir les distributions par ZAP/commune\n• 📊 Statistiques sur les kits distribués\n\nPosez-moi une question !'
                }
            ]);
        }
    }, [isOpen]);

    // 🔍 Fonction améliorée pour trouver un kit dans la question
    const findKitInQuestion = (question) => {
        const q = question.toLowerCase().trim();
        
        // Chercher d'abord une correspondance exacte
        for (const kit of data.kits) {
            if (q.includes(kit.nom.toLowerCase())) {
                return kit;
            }
        }
        
        // Chercher par mots-clés
        const keywords = [
            { key: 'primaire', name: 'Primaire' },
            { key: 'secondaire', name: 'Secondaire' },
            { key: 'préscolaire', name: 'Préscolaire' },
            { key: 'prescolaire', name: 'Préscolaire' },
            { key: 'maternelle', name: 'Préscolaire' },
            { key: 'college', name: 'Secondaire' },
            { key: 'lycée', name: 'Secondaire' },
            { key: 'cahier', name: 'Cahiers' },
            { key: 'stylo', name: 'Stylos' },
            { key: 'ardoise', name: 'Ardoises' },
            { key: 'geometrie', name: 'Géométrie' },
            { key: 'géométrie', name: 'Géométrie' }
        ];
        
        for (const kw of keywords) {
            if (q.includes(kw.key)) {
                const found = data.kits.find(k => k.nom.toLowerCase().includes(kw.key) || k.nom === kw.name);
                if (found) return found;
            }
        }
        
        // Chercher par correspondance partielle
        for (const kit of data.kits) {
            const words = kit.nom.toLowerCase().split(' ');
            for (const word of words) {
                if (word.length > 3 && q.includes(word)) {
                    return kit;
                }
            }
        }
        
        return null;
    };

    // 🔍 Fonction améliorée pour trouver un ZAP dans la question
    const findZAPInQuestion = (question) => {
        const q = question.toLowerCase().trim();
        
        // Correspondance exacte
        const zapList = ['zap1', 'zap2', 'zap3', 'zap4', 'zap5', 'zap6', 'zap7'];
        for (const z of zapList) {
            if (q.includes(z)) return z;
        }
        
        // Correspondance par nom complet
        const zapNames = [
            { value: 'ZAP1', names: ['andranolalina'] },
            { value: 'ZAP2', names: ['ankazovelo'] },
            { value: 'ZAP3', names: ['bevaho'] },
            { value: 'ZAP4', names: ['ivondro'] },
            { value: 'ZAP5', names: ['nosifeno'] },
            { value: 'ZAP6', names: ['soakibany'] },
            { value: 'ZAP7', names: ['zara'] }
        ];
        
        for (const z of zapNames) {
            for (const name of z.names) {
                if (q.includes(name)) return z.value;
            }
        }
        
        return null;
    };

    // Traiter la question
    const processQuestion = (question) => {
        const q = question.toLowerCase().trim();
        const words = q.split(' ');
        
        // === DÉTECTION DES TYPES DE QUESTIONS ===
        const isStockQuestion = q.includes('combien') || q.includes('stock') || q.includes('reste') || 
                               q.includes('disponible') || q.includes('quantité') || q.includes('quantite');
        const isDistributionQuestion = q.includes('distribution') || q.includes('distribué') || 
                                       q.includes('obtenu') || q.includes('reçu') || q.includes('attribué') || 
                                       q.includes('attribue') || q.includes('donné') || q.includes('donne');
        const isZAPQuestion = q.includes('zap') || words.some(w => w.startsWith('zap'));
        const isCommuneQuestion = q.includes('commune') || COMMUNES.some(c => q.includes(c.toLowerCase()));
        const isStatQuestion = q.includes('statistique') || q.includes('total') || q.includes('combien de') || 
                               q.includes('nombre') || q.includes('résumé') || q.includes('resume');
        const isMonthQuestion = q.includes('janvier') || q.includes('février') || q.includes('mars') || 
                               q.includes('avril') || q.includes('mai') || q.includes('juin') ||
                               q.includes('juillet') || q.includes('août') || q.includes('septembre') ||
                               q.includes('octobre') || q.includes('novembre') || q.includes('décembre') ||
                               q.includes('mois');
        
        // === QUESTIONS SPÉCIFIQUES (sans mot-clé spécifique) ===
        // "Kits disponibles", "Quels kits", "Liste des kits"
        if (q.includes('kit disponible') || q.includes('quels kits') || q.includes('liste des kits') || 
            (q.includes('kit') && q.includes('disponible')) || q === 'kits disponibles' || q === 'kit disponible') {
            return getAvailableKitsResponse();
        }
        
        // "Distributions", "Toutes les distributions"
        if (q === 'distributions' || q === 'distribution' || q === 'toutes les distributions' || 
            q.includes('toutes les distrib')) {
            return getAllDistributionsResponse();
        }

        // Utiliser les fonctions améliorées
        const foundKit = findKitInQuestion(q);
        const foundZAP = findZAPInQuestion(q);
        const foundCommune = COMMUNES.find(c => q.includes(c.toLowerCase()));

        console.log('🔍 Recherche:', { q, foundKit, foundZAP, foundCommune });

        // === QUESTION SUR LE STOCK D'UN KIT ===
        if (isStockQuestion && foundKit) {
            return getStockResponse(foundKit);
        }

        // === QUESTION SUR UN ZAP SPÉCIFIQUE ===
        if (isZAPQuestion && foundZAP) {
            return getZAPResponse(foundZAP, q);
        }

        // === QUESTION SUR UNE COMMUNE ===
        if (isCommuneQuestion && foundCommune) {
            return getCommuneResponse(foundCommune);
        }

        // === QUESTION SUR LES DISTRIBUTIONS D'UN KIT ===
        if (isDistributionQuestion && foundKit) {
            return getKitDistributionResponse(foundKit, q, isMonthQuestion);
        }

        // === QUESTION SUR LES STATISTIQUES GÉNÉRALES ===
        if (isStatQuestion && !foundKit && !foundZAP && !foundCommune) {
            return getGeneralStatsResponse(q);
        }

        // === QUESTION SUR UN MOIS SPÉCIFIQUE ===
        if (isMonthQuestion) {
            return getMonthResponse(q);
        }

        // === QUESTION SUR TOUTES LES DISTRIBUTIONS D'UN ZAP ===
        if (isZAPQuestion && !foundZAP) {
            return getAllZAPResponse(q);
        }

        // === QUESTION SUR LE TOTAL PAR ZAP ===
        if ((q.includes('total') || q.includes('résumé')) && q.includes('zap')) {
            return getTotalByZAPResponse();
        }

        // === QUESTION SUR LES ÉTABLISSEMENTS ===
        if (q.includes('établissement') || q.includes('école') || q.includes('ep') || 
            q.includes('ceg') || q.includes('lycée') || q.includes('etablissement')) {
            return getEtablissementsResponse(q);
        }

        // === QUESTION SUR LE STOCK GLOBAL ===
        if (q.includes('stock total') || q.includes('total des kits')) {
            return getTotalStockResponse();
        }

        // Réponse par défaut
        return {
            text: `Je n'ai pas bien compris votre question. Voici quelques exemples :\n\n📦 **Stocks** :\n• "Combien reste-t-il de kits Primaire ?"\n• "Kits disponibles"\n\n📋 **Distributions** :\n• "Est-ce que le ZAP Nosifeno a reçu des kits ?"\n• "Combien de kits ont été distribués à Nosifeno ?"\n\n📊 **Statistiques** :\n• "Total des kits distribués"\n• "Distributions du mois de mai"\n\n🏫 **Établissements** :\n• "Établissements de Nosifeno"`,
            type: 'info'
        };
    };

    // === NOUVELLES RÉPONSES ===

    const getTotalStockResponse = () => {
        const totalStock = data.kits.reduce((sum, k) => sum + k.quantite_disponible, 0);
        const details = data.kits.map(k => `• **${k.nom}** : ${k.quantite_disponible} kit(s)`).join('\n');
        
        return {
            text: `📦 **Stock total des kits**\n\n📊 **Total : ${totalStock}** kit(s)\n\n**Détails par kit :**\n${details}`,
            type: 'stock'
        };
    };

    const getAllDistributionsResponse = () => {
        const dists = data.distributions;
        if (dists.length === 0) {
            return { text: '📋 Aucune distribution enregistrée.', type: 'info' };
        }
        
        const total = dists.reduce((sum, d) => sum + d.quantite_distribuee, 0);
        const byZAP = {};
        dists.forEach(d => {
            const key = d.zap || 'Sans ZAP';
            if (!byZAP[key]) byZAP[key] = { count: 0, kits: 0 };
            byZAP[key].count++;
            byZAP[key].kits += d.quantite_distribuee;
        });
        
        let zapSummary = Object.keys(byZAP).map(z => {
            const label = getZapLabel(z);
            return `• ${label}: ${byZAP[z].count} distribution(s) - ${byZAP[z].kits} kit(s)`;
        }).join('\n');
        
        return {
            text: `📋 **Toutes les distributions**\n\n📊 **${dists.length}** distribution(s) au total\n🎒 **${total}** kit(s) distribués\n\n**Par ZAP :**\n${zapSummary}\n\n**Dernières distributions :**\n${dists.slice(0, 3).map(d => `• ${d.etablissement_nom || 'Établissement'}: ${d.quantite_distribuee} ${d.kit_nom || 'kit(s)'} (${new Date(d.date_distrib).toLocaleDateString('fr-FR')})`).join('\n')}`,
            type: 'distribution'
        };
    };

    // === FONCTIONS EXISTANTES AMÉLIORÉES ===

    const getStockResponse = (kit) => {
        const stock = kit.quantite_disponible;
        const totalDistributed = data.distributions
            .filter(d => d.kit_id === kit.id)
            .reduce((sum, d) => sum + d.quantite_distribuee, 0);
        
        return {
            text: `📦 **${kit.nom}**\n\n📊 **Stock disponible :** ${stock} kit(s)\n📋 **Déjà distribués :** ${totalDistributed} kit(s)\n📌 **Section :** ${kit.section || 'Non spécifiée'}\n\n${stock > 0 ? '✅ Stock suffisant' : '⚠️ Stock épuisé - Pensez à réapprovisionner !'}`,
            type: 'stock'
        };
    };

    const getZAPResponse = (zapValue, question) => {
        const zapLabel = getZapLabel(zapValue);
        const etabs = data.etablissements.filter(e => e.zap === zapValue);
        const dists = data.distributions.filter(d => d.zap === zapValue);
        const totalKits = dists.reduce((sum, d) => sum + d.quantite_distribuee, 0);
        
        if (question.includes('reçu') || question.includes('obtenu') || question.includes('distribution')) {
            if (dists.length === 0) {
                return {
                    text: `📋 **${zapLabel}**\n\nAucune distribution enregistrée pour ce ZAP.\n\n🏫 **${etabs.length}** établissement(s) dans ce ZAP`,
                    type: 'info'
                };
            }
            
            const latest = dists.slice(0, 5);
            let details = latest.map(d => 
                `• ${d.etablissement_nom || 'Établissement'}: ${d.quantite_distribuee} ${d.kit_nom || 'kit(s)'} (${new Date(d.date_distrib).toLocaleDateString('fr-FR')})`
            ).join('\n');
            
            return {
                text: `📋 **${zapLabel}**\n\n✅ **${dists.length}** distribution(s) enregistrées\n📦 **${totalKits}** kit(s) distribués\n\n**Dernières distributions :**\n${details}\n\n🏫 **${etabs.length}** établissement(s) dans ce ZAP`,
                type: 'distribution'
            };
        }
        
        return {
            text: `📋 **${zapLabel}**\n\n🏫 **${etabs.length}** établissement(s)\n📦 **${dists.length}** distribution(s)\n🎒 **${totalKits}** kit(s) distribués\n\n**Établissements :**\n${etabs.slice(0, 5).map(e => `• ${e.nom}`).join('\n')}${etabs.length > 5 ? `\n... et ${etabs.length - 5} autre(s)` : ''}`,
            type: 'info'
        };
    };

    const getCommuneResponse = (commune) => {
        const etabs = data.etablissements.filter(e => e.commune === commune);
        const dists = data.distributions.filter(d => d.commune === commune);
        const totalKits = dists.reduce((sum, d) => sum + d.quantite_distribuee, 0);
        const zap = data.etablissements.find(e => e.commune === commune)?.zap;
        const zapLabel = getZapLabel(zap);

        return {
            text: `🏘️ **Commune de ${commune}**\n\n📌 **ZAP :** ${zapLabel}\n🏫 **Établissements :** ${etabs.length}\n📦 **Distributions :** ${dists.length}\n🎒 **Kits distribués :** ${totalKits}\n\n**Établissements :**\n${etabs.slice(0, 5).map(e => `• ${e.nom} ${e.directeur ? `(Dir: ${e.directeur})` : ''}`).join('\n')}${etabs.length > 5 ? `\n... et ${etabs.length - 5} autre(s)` : ''}`,
            type: 'info'
        };
    };

    const getKitDistributionResponse = (kit, question, isMonth) => {
        const dists = data.distributions.filter(d => d.kit_id === kit.id);
        const total = dists.reduce((sum, d) => sum + d.quantite_distribuee, 0);
        
        let response = `📦 **${kit.nom}**\n\n📊 **${dists.length}** distribution(s)\n🎒 **${total}** kit(s) distribués\n📌 **Stock restant :** ${kit.quantite_disponible} kit(s)`;
        
        if (isMonth) {
            const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
            const foundMonth = months.find(m => question.includes(m));
            
            if (foundMonth) {
                const monthIndex = months.indexOf(foundMonth) + 1;
                const monthDists = dists.filter(d => new Date(d.date_distrib).getMonth() + 1 === monthIndex);
                const monthTotal = monthDists.reduce((sum, d) => sum + d.quantite_distribuee, 0);
                
                response += `\n\n📅 **${foundMonth.charAt(0).toUpperCase() + foundMonth.slice(1)} ${new Date().getFullYear()}**\n• ${monthDists.length} distribution(s)\n• ${monthTotal} kit(s) distribués`;
                
                if (monthDists.length > 0) {
                    response += `\n\n**Établissements concernés :**\n${monthDists.slice(0, 5).map(d => `• ${d.etablissement_nom || 'Établissement'} (${d.quantite_distribuee} kit(s))`).join('\n')}`;
                    if (monthDists.length > 5) {
                        response += `\n... et ${monthDists.length - 5} autre(s)`;
                    }
                } else {
                    response += `\n\n❌ Aucune distribution de **${kit.nom}** en ${foundMonth}.`;
                }
            }
        } else {
            const latest = dists.slice(0, 5);
            if (latest.length > 0) {
                response += `\n\n**Dernières distributions :**\n${latest.map(d => `• ${d.etablissement_nom || 'Établissement'}: ${d.quantite_distribuee} kit(s) (${new Date(d.date_distrib).toLocaleDateString('fr-FR')})`).join('\n')}`;
                if (dists.length > 5) {
                    response += `\n... et ${dists.length - 5} autre(s)`;
                }
            } else {
                response += `\n\n❌ Aucune distribution enregistrée pour ce kit.`;
            }
        }
        
        return { text: response, type: 'distribution' };
    };

    const getGeneralStatsResponse = (question) => {
        const totalDists = data.distributions.length;
        const totalKits = data.distributions.reduce((sum, d) => sum + d.quantite_distribuee, 0);
        const totalEtablissements = data.etablissements.length;
        const totalKitsStock = data.kits.reduce((sum, k) => sum + k.quantite_disponible, 0);
        
        return {
            text: `📊 **Statistiques générales**\n\n📋 **Distributions :** ${totalDists}\n🎒 **Kits distribués :** ${totalKits}\n🏫 **Établissements :** ${totalEtablissements}\n📦 **Kits en stock :** ${totalKitsStock}\n\n**Par ZAP :**\n${['ZAP1', 'ZAP2', 'ZAP3', 'ZAP4', 'ZAP5', 'ZAP6', 'ZAP7'].map(z => {
                const count = data.distributions.filter(d => d.zap === z).length;
                const kits = data.distributions.filter(d => d.zap === z).reduce((s, d) => s + d.quantite_distribuee, 0);
                return `• ${getZapLabel(z)}: ${count} distribution(s) - ${kits} kit(s)`;
            }).join('\n')}`,
            type: 'stats'
        };
    };

    const getMonthResponse = (question) => {
        const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        const foundMonth = months.find(m => question.includes(m));
        
        if (!foundMonth) {
            return { text: 'Quel mois souhaitez-vous consulter ?', type: 'info' };
        }
        
        const monthIndex = months.indexOf(foundMonth) + 1;
        const monthDists = data.distributions.filter(d => new Date(d.date_distrib).getMonth() + 1 === monthIndex);
        const total = monthDists.reduce((sum, d) => sum + d.quantite_distribuee, 0);
        
        if (monthDists.length === 0) {
            return {
                text: `📅 **${foundMonth.charAt(0).toUpperCase() + foundMonth.slice(1)} ${new Date().getFullYear()}**\n\n❌ Aucune distribution enregistrée pour ce mois.`,
                type: 'info'
            };
        }
        
        const byZAP = {};
        monthDists.forEach(d => {
            const key = d.zap || 'Sans ZAP';
            if (!byZAP[key]) byZAP[key] = { count: 0, kits: 0 };
            byZAP[key].count++;
            byZAP[key].kits += d.quantite_distribuee;
        });
        
        let zapSummary = Object.keys(byZAP).map(z => {
            const label = getZapLabel(z);
            return `• ${label}: ${byZAP[z].count} distribution(s) - ${byZAP[z].kits} kit(s)`;
        }).join('\n');
        
        return {
            text: `📅 **${foundMonth.charAt(0).toUpperCase() + foundMonth.slice(1)} ${new Date().getFullYear()}**\n\n📋 **${monthDists.length}** distribution(s)\n🎒 **${total}** kit(s) distribués\n\n**Par ZAP :**\n${zapSummary}\n\n**Détails :**\n${monthDists.slice(0, 5).map(d => `• ${d.etablissement_nom || 'Établissement'}: ${d.quantite_distribuee} ${d.kit_nom || 'kit(s)'}`).join('\n')}${monthDists.length > 5 ? `\n... et ${monthDists.length - 5} autre(s)` : ''}`,
            type: 'distribution'
        };
    };

    const getTotalByZAPResponse = () => {
        const zapStats = ['ZAP1', 'ZAP2', 'ZAP3', 'ZAP4', 'ZAP5', 'ZAP6', 'ZAP7'].map(z => {
            const dists = data.distributions.filter(d => d.zap === z);
            const total = dists.reduce((sum, d) => sum + d.quantite_distribuee, 0);
            return { zap: z, label: getZapLabel(z), count: dists.length, total };
        }).filter(z => z.count > 0);
        
        if (zapStats.length === 0) {
            return { text: 'Aucune distribution enregistrée par ZAP.', type: 'info' };
        }
        
        const sorted = zapStats.sort((a, b) => b.total - a.total);
        const totalAll = sorted.reduce((s, z) => s + z.total, 0);
        
        return {
            text: `📊 **Total des kits distribués par ZAP**\n\n${sorted.map(z => `• **${z.label}** : ${z.total} kit(s) (${z.count} distribution(s))`).join('\n')}\n\n📦 **Total général : ${totalAll}** kit(s) distribués`,
            type: 'stats'
        };
    };

    const getAvailableKitsResponse = () => {
        const available = data.kits.filter(k => k.quantite_disponible > 0);
        const empty = data.kits.filter(k => k.quantite_disponible === 0);
        
        if (available.length === 0) {
            return { text: '⚠️ Aucun kit disponible en stock. Veuillez réapprovisionner !', type: 'warning' };
        }
        
        return {
            text: `📦 **Kits disponibles**\n\n${available.map(k => `• **${k.nom}** : ${k.quantite_disponible} kit(s) ${k.section ? `(${k.section})` : ''}`).join('\n')}\n\n${empty.length > 0 ? `\n⚠️ **Kits épuisés :**\n${empty.map(k => `• ${k.nom}`).join('\n')}` : '✅ Tous les kits sont disponibles !'}`,
            type: 'stock'
        };
    };

    const getEtablissementsResponse = (question) => {
        const foundCommune = COMMUNES.find(c => question.includes(c.toLowerCase()));
        const foundZAP = findZAPInQuestion(question);
        
        let etabs = data.etablissements;
        if (foundCommune) {
            etabs = etabs.filter(e => e.commune === foundCommune);
        }
        if (foundZAP) {
            etabs = etabs.filter(e => e.zap === foundZAP);
        }
        
        if (etabs.length === 0) {
            let msg = 'Aucun établissement trouvé';
            if (foundCommune) msg += ` dans la commune de ${foundCommune}`;
            if (foundZAP) msg += ` dans le ${getZapLabel(foundZAP)}`;
            return { text: msg, type: 'info' };
        }
        
        const byZAP = {};
        etabs.forEach(e => {
            const key = e.zap || 'Sans ZAP';
            if (!byZAP[key]) byZAP[key] = [];
            byZAP[key].push(e);
        });
        
        let response = `🏫 **Établissements${foundCommune ? ` de ${foundCommune}` : ''}**\n\nTotal : **${etabs.length}** établissement(s)\n\n`;
        
        Object.keys(byZAP).forEach(zap => {
            response += `**${getZapLabel(zap)}** (${byZAP[zap].length})\n`;
            byZAP[zap].slice(0, 3).forEach(e => {
                response += `• ${e.nom} ${e.directeur ? `- Dir: ${e.directeur}` : ''}\n`;
            });
            if (byZAP[zap].length > 3) {
                response += `... et ${byZAP[zap].length - 3} autre(s)\n`;
            }
            response += '\n';
        });
        
        return { text: response, type: 'info' };
    };

    const getAllZAPResponse = (question) => {
        const zapList = ['ZAP1', 'ZAP2', 'ZAP3', 'ZAP4', 'ZAP5', 'ZAP6', 'ZAP7'];
        let response = '📋 **ZAP disponibles**\n\n';
        
        zapList.forEach(z => {
            const etabs = data.etablissements.filter(e => e.zap === z);
            const dists = data.distributions.filter(d => d.zap === z);
            const total = dists.reduce((sum, d) => sum + d.quantite_distribuee, 0);
            response += `**${getZapLabel(z)}**\n• ${etabs.length} établissement(s)\n• ${dists.length} distribution(s) - ${total} kit(s)\n\n`;
        });
        
        return { text: response, type: 'info' };
    };

    const handleSend = () => {
        if (!input.trim()) return;
        
        const userMessage = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        
        setTimeout(() => {
            const response = processQuestion(input);
            const botMessage = {
                id: Date.now() + 1,
                sender: 'bot',
                text: response.text,
                type: response.type || 'info'
            };
            setMessages(prev => [...prev, botMessage]);
            setLoading(false);
        }, 500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const handleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    // Gestion du drag
    const handleMouseDown = (e) => {
        setIsDragging(true);
        const rect = chatRef.current?.getBoundingClientRect();
        if (rect) {
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                const newX = Math.min(
                    Math.max(0, e.clientX - dragOffset.x),
                    window.innerWidth - 420
                );
                const newY = Math.min(
                    Math.max(0, e.clientY - dragOffset.y),
                    window.innerHeight - 100
                );
                setPosition({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    if (!isOpen) return null;

    return (
        <div 
            ref={chatRef}
            className="fixed z-50 w-[400px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            style={{
                left: `${Math.min(position.x, window.innerWidth - 420)}px`,
                top: `${Math.min(position.y, window.innerHeight - 100)}px`,
                cursor: isDragging ? 'grabbing' : 'default',
                transition: isDragging ? 'none' : 'all 0.1s ease'
            }}
        >
            {/* En-tête - Barre de déplacement */}
            <div 
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 flex justify-between items-center cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <div>
                        <h3 className="font-semibold text-sm">Assistant CISCO</h3>
                        <p className="text-[10px] text-blue-200">En ligne • Glissez pour déplacer</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button 
                        onClick={handleMinimize}
                        className="text-white hover:bg-blue-800 p-1 rounded-lg transition-colors"
                        title="Minimiser"
                    >
                        <span className="text-lg">−</span>
                    </button>
                    <button 
                        onClick={onClose}
                        className="text-white hover:bg-blue-800 p-1 rounded-lg transition-colors"
                        title="Fermer"
                    >
                        <span className="text-lg">✕</span>
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="h-[380px] overflow-y-auto p-4 bg-gray-50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed ${
                                        msg.sender === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-bl-sm border border-gray-200">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Exemples de questions */}
                    <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1.5">
                            {[
                                'Combien reste de kits Primaire ?',
                                'Kits disponibles',
                                'ZAP Nosifeno a reçu des kits ?',
                                'Total des kits distribués',
                                'Distributions du mois de mai'
                            ].map((example) => (
                                <button
                                    key={example}
                                    onClick={() => {
                                        setInput(example);
                                        setTimeout(handleSend, 100);
                                    }}
                                    className="text-[10px] bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded-full transition-colors"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-200 bg-white flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Posez votre question..."
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                            Envoyer
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatBot;