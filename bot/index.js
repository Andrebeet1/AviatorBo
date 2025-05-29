require('dotenv').config();
const { Pool } = require('pg');
const TelegramBot = require('node-telegram-bot-api');

// Handlers personnalisés
const handleStart = require('./handlers/start');
const handleParier = require('./handlers/parier');
const handleRetirer = require('./handlers/retirer');
const handleSolde = require('./handlers/solde');
const handleHistorique = require('./handlers/historique');

// Vérifie si le token est présent
const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  console.error("❌ TELEGRAM_TOKEN est manquant ! Ajoutez-le aux variables d'environnement.");
  process.exit(1); // Arrête le bot
}

// Initialisation du bot
const bot = new TelegramBot(token, { polling: true });
console.log("🤖 Bot Telegram lancé avec polling...");

// Connexion PostgreSQL
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

db.connect()
  .then(() => console.log("✅ Connecté à PostgreSQL"))
  .catch((err) => console.error("❌ Erreur PostgreSQL :", err));

// Gestion des commandes
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
