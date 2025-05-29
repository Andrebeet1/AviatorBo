const User = require('../../models/User');

function formatDate(date) {
  return new Date(date).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

async function handleHistorique(bot, msg) {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString(); // Convertir en string pour PostgreSQL

  try {
    const user = await User.findByTelegramId(telegramId);

    if (!user) {
      return bot.sendMessage(chatId, `❗ Envoie d'abord /start pour t'inscrire.`);
    }

    const historique = await User.getHistorique(telegramId);

    if (historique.length === 0) {
      return bot.sendMessage(chatId, `📭 Aucun historique trouvé.`);
    }

    const dernieresParties = historique.slice(-5).reverse();
    let message = `📊 Dernières parties :\n\n`;

    dernieresParties.forEach((partie, index) => {
      message += `🎰 Partie ${index + 1}:\n`;
      message += `• Pari : ${partie.pari} F\n`;
      message += `• Multiplicateur : x${partie.multi}\n`;
      message += `• Gain : ${partie.gain} F\n`;
      message += `• 📅 ${formatDate(partie.date)}\n\n`;
    });

    bot.sendMessage(chatId, message);
  } catch (err) {
    console.error('Erreur historique.js :', err);
    bot.sendMessage(chatId, `❌ Erreur lors de la récupération de l'historique.`);
  }
}

module.exports = handleHistorique;
