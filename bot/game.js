// bot/game.js

const User = require('../models/User');

function lancerJeu(bot, chatId, telegramId, mise) {
  let multiplicateur = 1.00;
  const intervalle = 500; // 0.5 seconde
  const croissance = () => (Math.random() * 0.3 + 0.05); // croissance aléatoire

  let enCours = true;

  const interval = setInterval(async () => {
    multiplicateur += croissance();
    multiplicateur = parseFloat(multiplicateur.toFixed(2));

    // On simule un crash entre x1.5 et x5
    const probaCrash = Math.random();
    const crashImminent = probaCrash < 0.05 + multiplicateur / 10;

    if (crashImminent) {
      clearInterval(interval);
      enCours = false;

      const user = await User.findOne({ telegramId });
      if (!user || !user.enJeu) return;

      const perte = user.pari;
      user.historique.push({
        date: new Date(),
        pari: perte,
        multi: multiplicateur.toFixed(2),
        gain: 0
      });
      user.enJeu = false;
      user.pari = 0;
      await user.save();

      bot.sendMessage(chatId, `💥 CRASH à x${multiplicateur.toFixed(2)}\n❌ Tu as perdu ta mise.`);
      return;
    }

    // Mise à jour du message de jeu
    bot.sendMessage(chatId, `📈 Multiplicateur : x${multiplicateur.toFixed(2)}`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '💸 Retirer maintenant', callback_data: `retirer_${telegramId}` }]
        ]
      }
    });

  }, intervalle);
}

module.exports = lancerJeu;
