require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const TelegramBot = require('node-telegram-bot-api');

// Handlers personnalisés
const handleStart = require('./handlers/start');
const handleParier = require('./handlers/parier');
const handleRetirer = require('./handlers/retirer');
const handleSolde = require('./handlers/solde');
const handleHistorique = require('./handlers/historique');

// Vérifie le token
const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  console.error("❌ TELEGRAM_TOKEN est manquant !");
  process.exit(1);
}

// Initialisation du bot (sans polling)
const bot = new TelegramBot(token);
const app = express();
const port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL;

// Middleware
app.use(express.json());

// Connexion PostgreSQL
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

db.connect()
  .then(() => console.log("✅ Connecté à PostgreSQL"))
  .catch((err) => console.error("❌ Erreur PostgreSQL :", err));

// Configuration du webhook
bot.setWebHook(`${baseUrl}/bot${token}`);
console.log(`🤖 Webhook défini sur ${baseUrl}/bot${token}`);

// Réception des messages depuis Telegram via le webhook
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Commandes Telegram
bot.onText(/\/start/, (msg) => handleStart(bot, msg, db));
bot.onText(/\/parier (\d+)/, (msg, match) => handleParier(bot, msg, match, db));
bot.onText(/\/retirer/, (msg) => handleRetirer(bot, msg, db));
bot.onText(/\/solde/, (msg) => handleSolde(bot, msg, db));
bot.onText(/\/historique/, (msg) => handleHistorique(bot, msg, db));

// Gestion des boutons inline
bot.on('callback_query', async (query) => {
  const telegramId = query.from.id;
  if (query.data.startsWith('retirer_')) {
    handleRetirer(bot, {
      chat: { id: query.message.chat.id },
      from: { id: telegramId }
    }, db);
  }
});

// Démarrage du serveur Express
app.listen(port, () => {
  console.log(`🚀 Serveur Express lancé sur le port ${port}`);
});
