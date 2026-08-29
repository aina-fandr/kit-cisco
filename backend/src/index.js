const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const etablissementRoutes = require('./routes/etablissementRoutes');
const kitRoutes = require('./routes/kitRoutes');
const distributionRoutes = require('./routes/distributionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/etablissements', etablissementRoutes);
app.use('/api/kits', kitRoutes);
app.use('/api/distributions', distributionRoutes);

// Route de test
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API de gestion des kits scolaires en fonctionnement' });
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`🔒 API sécurisée avec JWT`);
});