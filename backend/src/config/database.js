const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Création des tables si elles n'existent pas
const initDatabase = async () => {
    try {
        // Table Utilisateur
        await pool.query(`
            CREATE TABLE IF NOT EXISTS utilisateur (
                id SERIAL PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                identifiant VARCHAR(50) UNIQUE NOT NULL,
                mot_de_passe VARCHAR(255) NOT NULL,
                role VARCHAR(30) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table utilisateur créée');

        // Table Etablissement
        await pool.query(`
            CREATE TABLE IF NOT EXISTS etablissement (
                code VARCHAR(20) PRIMARY KEY,
                nom VARCHAR(200) NOT NULL,
                zap VARCHAR(50),
                cisco VARCHAR(100),
                directeur VARCHAR(100),
                commune VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table etablissement créée');

        // Table Kit
        await pool.query(`
            CREATE TABLE IF NOT EXISTS kit (
                id SERIAL PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                section VARCHAR(50),
                quantite_disponible INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table kit créée');

        // Table Distribution
        await pool.query(`
            CREATE TABLE IF NOT EXISTS distribution (
                id SERIAL PRIMARY KEY,
                date_distrib DATE NOT NULL,
                quantite_distribuee INT NOT NULL,
                etablissement_code VARCHAR(20),
                kit_id INT,
                utilisateur_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (etablissement_code) REFERENCES etablissement(code) ON DELETE CASCADE,
                FOREIGN KEY (kit_id) REFERENCES kit(id) ON DELETE CASCADE,
                FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Table distribution créée');

        // Vérifier si un admin existe déjà
        const result = await pool.query('SELECT * FROM utilisateur WHERE identifiant = $1', ['admin']);
        if (result.rows.length === 0) {
            // Insérer un utilisateur admin par défaut (mot de passe: admin123)
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query(
                'INSERT INTO utilisateur (nom, identifiant, mot_de_passe, role) VALUES ($1, $2, $3, $4)',
                ['Administrateur', 'admin', hashedPassword, 'admin']
            );
            console.log('✅ Utilisateur admin créé (identifiant: admin, mot de passe: admin123)');
        }

        console.log('✅ Base de données PostgreSQL initialisée avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    }
};

initDatabase();

module.exports = pool;