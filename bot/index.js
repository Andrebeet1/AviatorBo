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

// Vérifie les variables d'environnement
const token = process.env.TELEGRAM_TOKEN;
const baseUrl = process.env.BASE_URL;
const port = process.env.PORT || 3000;

if (!token || !baseUrl) {
  console.error("❌ TELEGRAM_TOKEN ou BASE_URL manquant dans .env !");
  process.exit(1);
}

// Initialise Telegram Bot sans polling
const bot = new TelegramBot(token);

// Initialise Express
const app = express();
app.use(express.json());

// Connexion à PostgreSQL
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

db.connect()
  .then(() => console.log("✅ Connecté à PostgreSQL"))
  .catch((err) => {
    console.error("❌ Erreur de connexion PostgreSQL :", err);
    process.exit(1);
  });

// Configure le webhook Telegram
const webhookUrl = `${baseUrl.replace(/\/$/, '')}/bot${token}`;
bot.setWebHook(webhookUrl);
console.log(`🤖 Webhook Telegram défini : ${webhookUrl}`);

// Route GET simple (utile pour test Render)
app.get('/', (req, res) => {
  res.send('🤖 Bot Telegram avec Express et PostgreSQL est actif !');
});

// Route POST du webhook Telegram
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

// Boutons inline
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
