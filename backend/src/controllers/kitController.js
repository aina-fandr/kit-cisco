const Kit = require('../models/Kit');

const kitController = {
    async create(req, res) {
        try {
            const { nom, section, quantiteDisponible } = req.body;
            await Kit.create(nom, section, quantiteDisponible || 0);
            res.status(201).json({ message: 'Kit créé avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    },

    async findAll(req, res) {
        try {
            const kits = await Kit.findAll();
            res.json(kits);
        } catch (error) {
            console.error('Erreur lors de la récupération:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    },

    async findOne(req, res) {
        try {
            const { id } = req.params;
            const kit = await Kit.findById(id);
            if (!kit) {
                return res.status(404).json({ error: 'Kit non trouvé.' });
            }
            res.json(kit);
        } catch (error) {
            console.error('Erreur lors de la récupération:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const updated = await Kit.update(id, req.body);
            if (updated.affectedRows === 0) {
                return res.status(404).json({ error: 'Kit non trouvé.' });
            }
            res.json({ message: 'Kit mis à jour avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await Kit.delete(id);
            if (deleted.affectedRows === 0) {
                return res.status(404).json({ error: 'Kit non trouvé.' });
            }
            res.json({ message: 'Kit supprimé avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    }
};

module.exports = kitController;