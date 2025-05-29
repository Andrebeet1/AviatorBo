// webhook.js
const express = require('express');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// === Importe les commandes (comme ton fichier start.js) ===
require('./handlers/start')(bot);  // <-- Assure-toi que ce chemin est correct

// === Route Webhook propre ===
bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/webhook`);
app.use(bot.webhookCallback('/webhook'));

// === Lancement du serveur ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur Express lancé sur le port ${PORT}`);
});
