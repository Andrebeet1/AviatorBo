// handlers/start.js

const User = require('../models/User');

async function handleStart(bot, msg) {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  const username = msg.from.username || msg.from.first_name;

  try {
    let user = await User.findOne({ telegramId });

    if (!user) {
      user = new User({
        telegramId,
        username,
        balance: 1000,
        enJeu: false,
        pari: 0,
        historique: []
      });
      await user.save();
      bot.sendMessage(chatId, `🎉 Bienvenue @${username} !\nTon compte a été créé avec 💰 1000 F.`);
    } else {
      bot.sendMessage(chatId, `👋 Bon retour @${username} !\n💰 Ton solde : ${user.balance} F.`);
    }
  } catch (err) {
    console.error('Erreur START:', err);
    bot.sendMessage(chatId, '❌ Une erreur est survenue. Essaie à nouveau.');
  }
}

module.exports = handleStart;
