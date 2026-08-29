const pool = require('../config/database');

const Kit = {
    async create(nom, section, quantiteDisponible = 0) {
        const result = await pool.query(
            'INSERT INTO kit (nom, section, quantite_disponible) VALUES ($1, $2, $3) RETURNING id',
            [nom, section, quantiteDisponible]
        );
        return result.rows[0];
    },

    async findAll() {
        const result = await pool.query('SELECT * FROM kit ORDER BY nom');
        return result.rows;
    },

    async findById(id) {
        const result = await pool.query('SELECT * FROM kit WHERE id = $1', [id]);
        return result.rows[0];
    },

    async update(id, data) {
        const { nom, section, quantiteDisponible } = data;
        const result = await pool.query(
            'UPDATE kit SET nom = $1, section = $2, quantite_disponible = $3 WHERE id = $4 RETURNING id',
            [nom, section, quantiteDisponible, id]
        );
        return result.rows[0];
    },

    async updateStock(id, quantite) {
        const result = await pool.query(
            'UPDATE kit SET quantite_disponible = quantite_disponible + $1 WHERE id = $2 RETURNING id',
            [quantite, id]
        );
        return result.rows[0];
    },

    async delete(id) {
        const result = await pool.query('DELETE FROM kit WHERE id = $1 RETURNING id', [id]);
        return result.rows[0];
    }
};

module.exports = Kit;