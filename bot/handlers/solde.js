// handlers/solde.js

const User = require('../../models/User');


async function handleSolde(bot, msg) {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;

  try {
    const user = await User.findOne({ telegramId });

    if (!user) {
      return bot.sendMessage(chatId, `❗ Tu n'es pas encore inscrit. Envoie /start pour commencer.`);
    }

    bot.sendMessage(chatId, `💰 Ton solde actuel est de : ${user.balance} F.`);
  } catch (err) {
    console.error('Erreur dans solde.js :', err);
    bot.sendMessage(chatId, `❌ Erreur lors de la récupération du solde.`);
  }
}

module.exports = handleSolde;
