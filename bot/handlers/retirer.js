const User = require('../../models/User');

async function handleRetirer(bot, msg) {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();

  try {
    const user = await User.findByTelegramId(telegramId);
    if (!user) {
      return bot.sendMessage(chatId, `❗ Envoie /start pour t’inscrire.`);
    }

    if (!user.en_jeu || user.pari <= 0) {
      return bot.sendMessage(chatId, `⛔ Tu n'as pas de pari en cours.`);
    }

    const multiplicateur = +(1.5 + Math.random()).toFixed(2);
    const gain = Math.floor(user.pari * multiplicateur);

    await User.finishGame(telegramId, {
      gain,
      multi: multiplicateur
    });

    bot.sendMessage(chatId, `✅ Retrait réussi à x${multiplicateur}\n💰 Tu gagnes ${gain} F.`);
  } catch (error) {
    console.error(`[retirer.js] Erreur pour l’utilisateur ${telegramId}:`, error);
    bot.sendMessage(chatId, `❌ Erreur lors du retrait.`);
  }
}

module.exports = handleRetirer;
