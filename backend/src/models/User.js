const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
    async create(nom, identifiant, motDePasse, role = 'admin') {
        const hashedPassword = await bcrypt.hash(motDePasse, 10);
        const result = await pool.query(
            'INSERT INTO utilisateur (nom, identifiant, mot_de_passe, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [nom, identifiant, hashedPassword, role]
        );
        return result.rows[0];
    },

    async findById(id) {
        const result = await pool.query(
            'SELECT id, nom, identifiant, role, created_at FROM utilisateur WHERE id = $1',
            [id]
        );
        return result.rows[0];
    },

    async findByIdentifiant(identifiant) {
        const result = await pool.query(
            'SELECT * FROM utilisateur WHERE identifiant = $1',
            [identifiant]
        );
        return result.rows[0];
    },

    async comparePassword(motDePasse, hashedPassword) {
        return await bcrypt.compare(motDePasse, hashedPassword);
    }
};

module.exports = User;