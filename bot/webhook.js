const express = require('express');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const app = express();

// ➤ Route de Webhook (ne jamais inclure le token dans l'URL publique)
app.use(bot.webhookCallback('/webhook'));

// ➤ Définition du webhook vers Render
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.WEBHOOK_DOMAIN;

bot.telegram.setWebhook(`${DOMAIN}/webhook`)
  .then(() => console.log(`✅ Webhook défini sur ${DOMAIN}/webhook`))
  .catch((err) => console.error('❌ Erreur webhook:', err));

// ➤ Commandes du bot
bot.start((ctx) => ctx.reply('Bienvenue dans le bot Aviator ✈️'));
bot.help((ctx) => ctx.reply('Voici comment je peux vous aider...'));

// ➤ Démarrage du serveur Express
app.listen(PORT, () => {
  console.log(`🚀 Serveur Express lancé sur le port ${PORT}`);
});
