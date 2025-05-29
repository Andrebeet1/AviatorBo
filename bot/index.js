require('dotenv').config();
const { Pool } = require('pg');
const TelegramBot = require('node-telegram-bot-api');

// Handlers personnalisés PostgreSQL
const handleStart = require('./handlers_pg/start');
const handleParier = require('./handlers_pg/parier');
const handleRetirer = require('./handlers_pg/retirer');
const handleSolde = require('./handlers_pg/solde');
const handleHistorique = require('./handlers_pg/historique');

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Connexion PostgreSQL
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect()
  .then(() => console.log("✅ Connecté à PostgreSQL"))
  .catch((err) => console.error("❌ Erreur PostgreSQL :", err));

// Injection de la base de données dans les handlers
bot.onText(/\/start/, (msg) => handleStart(bot, msg, db));
bot.onText(/\/parier (\d+)/, (msg, match) => handleParier(bot, msg, match, db));
bot.onText(/\/retirer/, (msg) => handleRetirer(bot, msg, db));
bot.onText(/\/solde/, (msg) => handleSolde(bot, msg, db));
bot.onText(/\/historique/, (msg) => handleHistorique(bot, msg, db));

bot.on('callback_query', async (query) => {
  const telegramId = query.from.id;
  if (query.data.startsWith('retirer_')) {
    handleRetirer(bot, {
      chat: { id: query.message.chat.id },
      from: { id: telegramId }
    }, db);
  }
});

