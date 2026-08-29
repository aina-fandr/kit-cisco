const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'admin123';
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Mot de passe:', password);
    console.log('Hash généré:', hash);
    console.log('\nCopiez ce hash dans la base de données:');
    console.log(`UPDATE utilisateur SET mot_de_passe = '${hash}' WHERE identifiant = 'admin';`);
}

generateHash();