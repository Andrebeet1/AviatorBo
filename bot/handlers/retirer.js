const User = require('../../models/User');

async function handleRetirer(bot, msg) {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;

  try {
    const user = await User.findOne({ telegramId });
    if (!user) {
      return bot.sendMessage(chatId, `❗ Envoie /start pour t’inscrire.`);
    }

    if (!user.enJeu || user.pari <= 0) {
      return bot.sendMessage(chatId, `⛔ Tu n'as pas de pari en cours.`);
    }

    const multiplicateur = +(1.5 + Math.random()).toFixed(2);
    const gain = Math.floor(user.pari * multiplicateur);

    user.enJeu = false;
    user.balance += gain;
    user.historique.push({
      date: new Date(),
      pari: user.pari,
      multi: multiplicateur,
      gain
    });

    user.pari = 0;
    await user.save();

    bot.sendMessage(chatId, `✅ Retrait réussi à x${multiplicateur}\n💰 Tu gagnes ${gain} F.`);
  } catch (error) {
    console.error(`[retirer.js] Erreur pour l’utilisateur ${telegramId}:`, error);
    bot.sendMessage(chatId, `❌ Erreur lors du retrait.`);
  }
}

module.exports = handleRetirer;

