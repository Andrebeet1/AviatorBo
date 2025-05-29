// web/server.js
const express = require('express');
const path = require('path');
const db = require('../config/db');
 // Connexion PostgreSQL
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration du moteur de templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Dossier public pour les fichiers CSS/JS/images
app.use(express.static(path.join(__dirname, 'public')));

// Route principale : Classement des joueurs
app.get('/classement', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT username, solde, total_paris 
      FROM joueurs 
      ORDER BY solde DESC 
      LIMIT 20
    `);
    const joueurs = result.rows;
    res.render('classement', { joueurs });
  } catch (err) {
    console.error('❌ Erreur PostgreSQL :', err);
    res.status(500).send('Erreur serveur');
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🌐 Serveur web actif sur http://localhost:${PORT}/classement`);
});
