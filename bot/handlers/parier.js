const User = require('../../models/User');
const lancerJeu = require('../jeu/lancerJeu');

async function handleParier(bot, msg) {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();
  const text = msg.text.trim();

  const parts = text.split(' ');
  if (parts.length !== 2 || isNaN(parts[1])) {
    return bot.sendMessage(chatId, '❗ Utilise : /parier <montant>\nEx: /parier 200');
  }

  const montant = parseInt(parts[1]);

  try {
    const user = await User.getUser(telegramId);

    if (!user) {
      return bot.sendMessage(chatId, `❗ Envoie d'abord /start pour t'inscrire.`);
    }

    if (user.en_jeu) {
      return bot.sendMessage(chatId, `⚠️ Tu as déjà un pari en cours.`);
    }

    if (montant <= 0 || montant > user.balance) {
      return bot.sendMessage(chatId, `💸 Montant invalide ou solde insuffisant.`);
    }

    const newBalance = user.balance - montant;
    await User.updateUser(telegramId, {
      en_jeu: true,
      pari: montant,
      balance: newBalance
    });

    bot.sendMessage(chatId, `🎮 Jeu lancé avec une mise de ${montant} F.\n📈 Le multiplicateur commence à x1.00...\nAppuie sur "💸 Retirer maintenant" avant le crash !`);

    lancerJeu(bot, chatId, telegramId, montant);

  } catch (err) {
    console.error('Erreur handleParier.js :', err);
    return bot.sendMessage(chatId, `❌ Erreur lors du traitement du pari.`);
  }
}

module.exports = handleParier;
