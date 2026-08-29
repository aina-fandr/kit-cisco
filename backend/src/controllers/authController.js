const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, identifiant: user.identifiant, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const authController = {
    async register(req, res) {
        try {
            const { nom, identifiant, motDePasse, role } = req.body;

            // Vérifier si l'utilisateur existe déjà
            const existingUser = await User.findByIdentifiant(identifiant);
            if (existingUser) {
                return res.status(400).json({ error: 'Cet identifiant existe déjà.' });
            }

            const result = await User.create(nom, identifiant, motDePasse, role || 'admin');
            res.status(201).json({ 
                message: 'Utilisateur créé avec succès.',
                userId: result.id 
            });
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    },

    async login(req, res) {
        try {
            const { identifiant, motDePasse } = req.body;

            const user = await User.findByIdentifiant(identifiant);
            if (!user) {
                return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect.' });
            }

            const isValid = await User.comparePassword(motDePasse, user.mot_de_passe);
            if (!isValid) {
                return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect.' });
            }

            const token = generateToken(user);
            
            res.json({
                token,
                user: {
                    id: user.id,
                    nom: user.nom,
                    identifiant: user.identifiant,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    }
};

module.exports = authController;