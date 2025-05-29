const User = require('../../models/User');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleParier(bot, msg, montant) {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();

  const user = await User.findByTelegramId(telegramId);
  if (!user) {
    return bot.sendMessage(chatId, `❗ Envoie d'abord /start pour t'inscrire.`);
  }

  if (user.en_jeu) {
    return bot.sendMessage(chatId, `🎮 Tu as déjà un jeu en cours. Termine-le avant de recommencer.`);
  }

  if (montant > user.balance) {
    return bot.sendMessage(chatId, `💸 Solde insuffisant pour miser ${montant} F.`);
  }

  let balance = user.balance - montant;
  let pari = montant;
  let enJeu = true;
  let multiplicateur = 1.0;
  let crash = false;

  // Met à jour l’état initial du jeu
  await User.updateGameState(telegramId, {
    balance,
    pari,
    enJeu
  });

  bot.sendMessage(chatId, `🎲 Tu as parié ${montant} F. Le multiplicateur grimpe... 🚀`);

  const retirerButton = {
    reply_markup: {
      inline_keyboard: [[
        { text: "💸 Retirer maintenant", callback_data: "retirer" }
      ]]
    }
  };

  const gameLoop = async () => {
    while (!crash) {
      multiplicateur += Math.random() * 0.3;
      await bot.sendMessage(chatId, `🔥 Multiplicateur : x${multiplicateur.toFixed(2)}`, retirerButton);

      if (Math.random() < 0.15) {
        crash = true;

        // Enregistre le crash
        await User.finishGame(telegramId, {
          gain: 0,
          multi: multiplicateur
        });

        return bot.sendMessage(chatId, `💥 Crash à x${multiplicateur.toFixed(2)} ! Tu as tout perdu.`);
      }

      await sleep(2000);
    }
  };

  await gameLoop();

  // Gestion du bouton "Retirer maintenant"
  bot.once('callback_query', async query => {
    if (query.data === 'retirer' && query.message.chat.id === chatId) {
      const currentUser = await User.findByTelegramId(telegramId);
      if (!currentUser.en_jeu) return;

      const gain = Math.floor(currentUser.pari * multiplicateur);

      // Enregistre le retrait
      await User.finishGame(telegramId, {
        gain,
        multi: multiplicateur
      });

      bot.sendMessage(chatId, `✅ Tu as retiré à x${multiplicateur.toFixed(2)}\n💵 Gain : ${gain} F`);
    }
  });
}

module.exports = handleParier;
