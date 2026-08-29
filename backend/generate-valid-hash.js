const bcrypt = require('bcryptjs');

async function generateValidHash() {
    const password = 'admin123';
    const saltRounds = 10;
    
    // Générer un hash valide
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('🔑 Mot de passe:', password);
    console.log('📝 Hash généré:');
    console.log(hash);
    console.log('\n📋 Copiez ce SQL dans PostgreSQL:');
    console.log(`UPDATE utilisateur SET mot_de_passe = '${hash}' WHERE identifiant = 'admin';`);
    console.log('\nOU pour créer un nouvel utilisateur:');
    console.log(`INSERT INTO utilisateur (nom, identifiant, mot_de_passe, role) VALUES ('AdminTest', 'admintest', '${hash}', 'admin');`);
}

generateValidHash();