const pool = require('../config/database');

const Distribution = {
    async create(dateDistrib, quantiteDistribuee, etablissementCode, kitId, utilisateurId) {
        const result = await pool.query(
            `INSERT INTO distribution 
             (date_distrib, quantite_distribuee, etablissement_code, kit_id, utilisateur_id) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [dateDistrib, quantiteDistribuee, etablissementCode, kitId, utilisateurId]
        );
        return result.rows[0];
    },

    async findAll() {
        const result = await pool.query(`
            SELECT 
                d.id,
                d.date_distrib,
                d.quantite_distribuee,
                d.etablissement_code,
                d.kit_id,
                d.utilisateur_id,
                d.created_at,
                e.nom as etablissement_nom,
                e.zap as zap,
                e.cisco as cisco,
                e.commune as commune,
                k.nom as kit_nom,
                u.nom as utilisateur_nom
            FROM distribution d
            LEFT JOIN etablissement e ON d.etablissement_code = e.code
            LEFT JOIN kit k ON d.kit_id = k.id
            LEFT JOIN utilisateur u ON d.utilisateur_id = u.id
            ORDER BY d.date_distrib DESC
        `);
        return result.rows;
    },

    async findById(id) {
        const result = await pool.query(`
            SELECT 
                d.id,
                d.date_distrib,
                d.quantite_distribuee,
                d.etablissement_code,
                d.kit_id,
                d.utilisateur_id,
                d.created_at,
                e.nom as etablissement_nom,
                e.zap as zap,
                e.cisco as cisco,
                e.commune as commune,
                k.nom as kit_nom,
                u.nom as utilisateur_nom
            FROM distribution d
            LEFT JOIN etablissement e ON d.etablissement_code = e.code
            LEFT JOIN kit k ON d.kit_id = k.id
            LEFT JOIN utilisateur u ON d.utilisateur_id = u.id
            WHERE d.id = $1
        `, [id]);
        return result.rows[0];
    },

    async findByEtablissement(code) {
        const result = await pool.query(`
            SELECT 
                d.id,
                d.date_distrib,
                d.quantite_distribuee,
                d.etablissement_code,
                d.kit_id,
                d.utilisateur_id,
                d.created_at,
                e.nom as etablissement_nom,
                e.zap as zap,
                k.nom as kit_nom
            FROM distribution d
            LEFT JOIN etablissement e ON d.etablissement_code = e.code
            LEFT JOIN kit k ON d.kit_id = k.id
            WHERE d.etablissement_code = $1
            ORDER BY d.date_distrib DESC
        `, [code]);
        return result.rows;
    },

    async update(id, data) {
        const { dateDistrib, quantiteDistribuee, etablissementCode, kitId } = data;
        const result = await pool.query(
            `UPDATE distribution 
             SET date_distrib = $1, quantite_distribuee = $2, etablissement_code = $3, kit_id = $4
             WHERE id = $5 RETURNING id`,
            [dateDistrib, quantiteDistribuee, etablissementCode, kitId, id]
        );
        return result.rows[0];
    },

    async delete(id) {
        const result = await pool.query('DELETE FROM distribution WHERE id = $1 RETURNING id', [id]);
        return result.rows[0];
    },

    async getStats() {
        const totalDistributions = await pool.query('SELECT COUNT(*) as total FROM distribution');
        const totalKits = await pool.query('SELECT COALESCE(SUM(quantite_distribuee), 0) as total FROM distribution');
        const totalEtablissements = await pool.query('SELECT COUNT(DISTINCT etablissement_code) as total FROM distribution');
        
        return {
            totalDistributions: parseInt(totalDistributions.rows[0].total),
            totalKitsDistribues: parseInt(totalKits.rows[0].total),
            totalEtablissements: parseInt(totalEtablissements.rows[0].total)
        };
    }
};

module.exports = Distribution;