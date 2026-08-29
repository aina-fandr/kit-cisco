const Distribution = require('../models/Distribution');
const Kit = require('../models/Kit');

const distributionController = {
    async create(req, res) {
        try {
            const { dateDistrib, quantiteDistribuee, etablissementCode, kitId } = req.body;
            const utilisateurId = req.user.id;

            // Vérifier la disponibilité du stock
            const kit = await Kit.findById(kitId);
            if (!kit) {
                return res.status(404).json({ error: 'Kit non trouvé.' });
            }

            if (kit.quantite_disponible < quantiteDistribuee) {
                return res.status(400).json({ 
                    error: `Stock insuffisant. Disponible: ${kit.quantite_disponible}` 
                });
            }

            // Créer la distribution
            await Distribution.create(
                dateDistrib, 
                quantiteDistribuee, 
                etablissementCode, 
                kitId, 
                utilisateurId
            );

            // Mettre à jour le stock
            await Kit.updateStock(kitId, -quantiteDistribuee);

            res.status(201).json({ message: 'Distribution enregistrée avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    },

    async findAll(req, res) {
        try {
            const distributions = await Distribution.findAll();
            res.json(distributions);
        } catch (error) {
            console.error('Erreur lors de la récupération:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    },

    async findOne(req, res) {
        try {
            const { id } = req.params;
            const distribution = await Distribution.findById(id);
            if (!distribution) {
                return res.status(404).json({ error: 'Distribution non trouvée.' });
            }
            res.json(distribution);
        } catch (error) {
            console.error('Erreur lors de la récupération:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const updated = await Distribution.update(id, req.body);
            if (updated.affectedRows === 0) {
                return res.status(404).json({ error: 'Distribution non trouvée.' });
            }
            res.json({ message: 'Distribution mise à jour avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            
            const distribution = await Distribution.findById(id);
            if (!distribution) {
                return res.status(404).json({ error: 'Distribution non trouvée.' });
            }

            // Restaurer le stock
            await Kit.updateStock(distribution.kit_id, distribution.quantite_distribuee);
            
            await Distribution.delete(id);
            
            res.json({ message: 'Distribution supprimée avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    },

    async getStats(req, res) {
        try {
            const stats = await Distribution.getStats();
            res.json(stats);
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    }
};

module.exports = distributionController;