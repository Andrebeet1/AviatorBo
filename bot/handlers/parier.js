// handlers/parier.js

const User = require('../models/User');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleParier(bot, msg, montant) {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;

  const user = await User.findOne({ telegramId });
  if (!user) {
    return bot.sendMessage(chatId, `❗ Envoie d'abord /start pour t'inscrire.`);
  }

  if (user.enJeu) {
    return bot.sendMessage(chatId, `🎮 Tu as déjà un jeu en cours. Termine-le avant de recommencer.`);
  }

  if (montant > user.balance) {
    return bot.sendMessage(chatId, `💸 Solde insuffisant pour miser ${montant} F.`);
  }

  user.balance -= montant;
  user.pari = montant;
  user.enJeu = true;
  await user.save();

  bot.sendMessage(chatId, `🎲 Tu as parié ${montant} F. Le multiplicateur grimpe... 🚀`);

  let multiplicateur = 1.0;
  let crash = false;

  // Crée un bouton inline
  const retirerButton = {
    reply_markup: {
      inline_keyboard: [[
        { text: "💸 Retirer maintenant", callback_data: "retirer" }
      ]]
    }
  };

  const gameLoop = async () => {
    while (!crash && user.enJeu) {
      multiplicateur += Math.random() * 0.3;
      await bot.sendMessage(chatId, `🔥 Multiplicateur : x${multiplicateur.toFixed(2)}`, retirerButton);

      if (Math.random() < 0.15) {
        crash = true;
        user.enJeu = false;
        user.historique.push({
          date: new Date(),
          pari: user.pari,
          multi: multiplicateur,
          gain: 0
        });
        user.pari = 0;
        await user.save();
        return bot.sendMessage(chatId, `💥 Crash à x${multiplicateur.toFixed(2)} ! Tu as tout perdu.`);
      }

      await sleep(2000);
    }
  };

  await gameLoop();

  // Gestion du bouton "Retirer maintenant"
  bot.once('callback_query', async query => {
    if (query.data === 'retirer' && query.message.chat.id === chatId) {
      if (!user.enJeu) return;

      user.enJeu = false;
      const gain = Math.floor(user.pari * multiplicateur);
      user.balance += gain;
      user.historique.push({
        date: new Date(),
        pari: user.pari,
        multi: multiplicateur,
        gain
      });
      user.pari = 0;
      await user.save();

      bot.sendMessage(chatId, `✅ Tu as retiré à x${multiplicateur.toFixed(2)}\n💵 Gain : ${gain} F`);
    }
  });
}

module.exports = handleParier;
