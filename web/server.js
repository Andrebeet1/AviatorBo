// web/server.js
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ Web connecté à MongoDB'))
  .catch(err => console.error('❌ MongoDB Web :', err));

// Config EJS + Routes
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', require('./routes/classement'));

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`🌐 Serveur web actif sur http://localhost:${PORT}/classement`);
});
