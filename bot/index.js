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
const baseUrl = process.env.BASE_URL;
if (!token || !baseUrl) {
  console.error("❌ TELEGRAM_TOKEN ou BASE_URL manquant !");
  process.exit(1);
}

const bot = new TelegramBot(token);
const app = express();
const port = process.env.PORT || 3000;

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

// Webhook Telegram
const webhookUrl = `${baseUrl.replace(/\/$/, '')}/bot${token}`;
bot.setWebHook(webhookUrl);
console.log(`🤖 Webhook défini sur ${webhookUrl}`);

// Réception des messages depuis Telegram
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Route GET pour Render
app.get('/', (req, res) => {
  res.send('🤖 Bot Telegram avec Express et PostgreSQL est actif !');
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

// Démarrage du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur Express lancé sur le port ${port}`);
});
