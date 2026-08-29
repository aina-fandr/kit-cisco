const pool = require('../config/database');

const Etablissement = {
    async create(code, nom, zap, cisco, directeur, commune) {
        const result = await pool.query(
            'INSERT INTO etablissement (code, nom, zap, cisco, directeur, commune) VALUES ($1, $2, $3, $4, $5, $6) RETURNING code',
            [code, nom, zap, cisco, directeur, commune]
        );
        return result.rows[0];
    },

    async findAll() {
        const result = await pool.query('SELECT * FROM etablissement ORDER BY nom');
        return result.rows;
    },

    async findByCode(code) {
        const result = await pool.query('SELECT * FROM etablissement WHERE code = $1', [code]);
        return result.rows[0];
    },

    async update(code, data) {
        const { nom, zap, cisco, directeur, commune } = data;
        const result = await pool.query(
            'UPDATE etablissement SET nom = $1, zap = $2, cisco = $3, directeur = $4, commune = $5 WHERE code = $6 RETURNING code',
            [nom, zap, cisco, directeur, commune, code]
        );
        return result.rows[0];
    },

    async delete(code) {
        const result = await pool.query('DELETE FROM etablissement WHERE code = $1 RETURNING code', [code]);
        return result.rows[0];
    }
};

module.exports = Etablissement;