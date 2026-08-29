const Etablissement = require('../models/Etablissement');

const etablissementController = {
    async create(req, res) {
        try {
            const { code, nom, zap, cisco, directeur, commune } = req.body;
            
            const existing = await Etablissement.findByCode(code);
            if (existing) {
                return res.status(400).json({ error: 'Cet établissement existe déjà.' });
            }

            await Etablissement.create(code, nom, zap, cisco, directeur, commune);
            res.status(201).json({ message: 'Établissement créé avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    },

    async findAll(req, res) {
        try {
            const etablissements = await Etablissement.findAll();
            res.json(etablissements);
        } catch (error) {
            console.error('Erreur lors de la récupération:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    },

    async findOne(req, res) {
        try {
            const { code } = req.params;
            const etablissement = await Etablissement.findByCode(code);
            if (!etablissement) {
                return res.status(404).json({ error: 'Établissement non trouvé.' });
            }
            res.json(etablissement);
        } catch (error) {
            console.error('Erreur lors de la récupération:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    },

    async update(req, res) {
        try {
            const { code } = req.params;
            const updated = await Etablissement.update(code, req.body);
            if (updated.affectedRows === 0) {
                return res.status(404).json({ error: 'Établissement non trouvé.' });
            }
            res.json({ message: 'Établissement mis à jour avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    },

    async delete(req, res) {
        try {
            const { code } = req.params;
            const deleted = await Etablissement.delete(code);
            if (deleted.affectedRows === 0) {
                return res.status(404).json({ error: 'Établissement non trouvé.' });
            }
            res.json({ message: 'Établissement supprimé avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    }
};

module.exports = etablissementController;