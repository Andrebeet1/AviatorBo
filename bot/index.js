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

// Initialise Telegram Bot
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
const webhookUrl = `${baseUrl.replace(/\/$/, '')}/webhook`;
bot.setWebHook(webhookUrl);
console.log(`🤖 Webhook Telegram défini : ${webhookUrl}`);

// Routes Express
app.get('/', (req, res) => {
  res.send('🤖 Bot Telegram actif !');
});

app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// === Bot command handlers ===
bot.onText(/\/start/, (msg) => handleStart(bot, msg, db));
bot.onText(/\/parier (\d+)/, (msg, match) => handleParier(bot, msg, match, db));
bot.onText(/\/retirer/, (msg) => handleRetirer(bot, msg, db));
bot.onText(/\/solde/, (msg) => handleSolde(bot, msg, db));
bot.onText(/\/historique/, (msg) => handleHistorique(bot, msg, db));

// === Callback buttons ===
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  await bot.answerCallbackQuery(query.id);

  // ⚠️ Tu peux router les actions vers les bons handlers ici si nécessaire
  if (data === 'solde') {
    handleSolde(bot, { chat: { id: chatId }, from: { id: userId } }, db);
  } else if (data === 'parier') {
    handleParier(bot, { chat: { id: chatId }, from: { id: userId } }, ['200'], db);
  } else if (data === 'retirer') {
    handleRetirer(bot, { chat: { id: chatId }, from: { id: userId } }, db);
  } else if (data === 'historique') {
    handleHistorique(bot, { chat: { id: chatId }, from: { id: userId } }, db);
  }
});

// Démarrer le serveur Express
app.listen(port, () => {
  console.log(`🚀 Serveur Express lancé sur le port ${port}`);
});
