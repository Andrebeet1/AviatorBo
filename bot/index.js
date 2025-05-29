// index.js
const connectDB = require('./db');
connectDB(); // Connecte MongoDB

const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
require('dotenv').config();

// 📦 Handlers
const handleStart = require('./handlers/start');
const handleParier = require('./handlers/parier');
const handleRetirer = require('./handlers/retirer');
const handleSolde = require('./handlers/solde');
const handleHistorique = require('./handlers/historique');

// 🔐 Configuration
const token = process.env.TELEGRAM_TOKEN;
const mongoURI = process.env.MONGO_URI;

const bot = new TelegramBot(token, { polling: true });

// 🔗 Connexion MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => console.error('❌ Erreur MongoDB :', err));

// 📥 Commandes Telegram
bot.onText(/\/start/, (msg) => handleStart(bot, msg));
bot.onText(/\/parier (\d+)/, (msg, match) => handleParier(bot, msg, match));
bot.onText(/\/retirer/, (msg) => handleRetirer(bot, msg));
bot.onText(/\/solde/, (msg) => handleSolde(bot, msg));
bot.onText(/\/historique/, (msg) => handleHistorique(bot, msg));

// 🎯 Boutons de retrait (callback_query)
bot.on('callback_query', async (query) => {
  const telegramId = query.from.id;
  if (query.data.startsWith('retirer_')) {
    handleRetirer(bot, {
      chat: { id: query.message.chat.id },
      from: { id: telegramId }
    });
  }
});
