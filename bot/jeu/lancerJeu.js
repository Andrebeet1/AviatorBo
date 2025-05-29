const db = require('../../config/db'); // ou 'pool' selon ton export

async function lancerJeu(bot, chatId, telegramId, mise) {
  let multiplicateur = 1.00;
  const intervalle = 500;
  const croissance = () => (Math.random() * 0.3 + 0.05);
  let enCours = true;

  const interval = setInterval(async () => {
    multiplicateur += croissance();
    multiplicateur = parseFloat(multiplicateur.toFixed(2));

    const probaCrash = Math.random();
    const crashImminent = probaCrash < 0.05 + multiplicateur / 10;

    if (crashImminent) {
      clearInterval(interval);
      enCours = false;

      try {
        const { rows } = await db.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
        if (rows.length === 0 || !rows[0].en_jeu) return;

        const user = rows[0];
        const perte = user.pari;
        const historique = user.historique || [];
        historique.push({
          date: new Date(),
          pari: perte,
          multi: multiplicateur.toFixed(2),
          gain: 0
        });

        await db.query(
          `UPDATE users 
           SET en_jeu = false, pari = 0, historique = $1 
           WHERE telegram_id = $2`,
          [JSON.stringify(historique), telegramId]
        );

        bot.sendMessage(chatId, `💥 CRASH à x${multiplicateur.toFixed(2)}\n❌ Tu as perdu ta mise.`);
      } catch (err) {
        console.error('Erreur PostgreSQL dans lancerJeu:', err);
        bot.sendMessage(chatId, '❌ Une erreur s’est produite pendant le jeu.');
      }

      // ✅ Relancer automatiquement le jeu après 10 secondes
      setTimeout(() => {
        lancerJeu(bot, chatId, telegramId, mise);
      }, 10000);

      return;
    }

    // ✅ Affiche le multiplicateur en temps réel
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
