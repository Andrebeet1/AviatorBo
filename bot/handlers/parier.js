const User = require('../../models/User');

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

    // Mise en jeu
    const newBalance = user.balance - montant;
    await User.updateUser(telegramId, {
      en_jeu: true,
      pari: montant,
      balance: newBalance
    });

    // Simuler un multiplicateur aléatoire
    const multi = Math.random() < 0.5 ? 0 : (Math.random() * 3 + 1).toFixed(2); // x0 ou x1-4
    const gain = Math.round(montant * multi);

    const message = multi > 0
      ? `🎉 Tu as gagné !\n\n💸 Pari : ${montant} F\n📈 Multiplicateur : x${multi}\n🏆 Gain : ${gain} F`
      : `😢 Tu as perdu !\n\n💸 Pari : ${montant} F\n📉 Multiplicateur : x0\n🏚️ Gain : 0 F`;

    // Mise à jour du solde et de l'historique
    await User.updateUser(telegramId, {
      balance: newBalance + gain,
      en_jeu: false,
      pari: 0
    });

    await User.addToHistorique(telegramId, {
      pari: montant,
      multi,
      gain
    });

    return bot.sendMessage(chatId, message);

  } catch (err) {
    console.error('Erreur handleParier.js :', err);
    return bot.sendMessage(chatId, `❌ Erreur lors du traitement du pari.`);
  }
}

module.exports = handleParier;
