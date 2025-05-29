const { Markup } = require('telegraf');
const { findOrCreateUser, getUser, updateUser } = require('../../models/User');

module.exports = (bot) => {
  // Commande /start
  bot.command('start', async (ctx) => {
    const user = await findOrCreateUser(ctx.from.id, ctx.from.username);

    const message = `
👤 Ton compte Telegram est maintenant lié !
🎉 Bienvenue @${ctx.from.username} !
💰 Solde initial : ${user.balance} F.

🧾 Voici ce que tu peux faire :
👇 Choisis une option ci-dessous :
`;

    await ctx.reply(message, Markup.inlineKeyboard([
      [Markup.button.callback('💰 Voir mon solde', 'solde')],
      [Markup.button.callback('🎲 Parier 200 F', 'parier')],
      [Markup.button.callback('🏧 Retirer mes gains', 'retirer')],
      [Markup.button.callback('📜 Mon historique', 'historique')]
    ]));
  });

  // Action : voir le solde
  bot.action('solde', async (ctx) => {
    await ctx.answerCbQuery();
    const user = await getUser(ctx.from.id);
    if (user) {
      await ctx.reply(`💰 Ton solde actuel est de : ${user.balance} F.`);
    } else {
      await ctx.reply("❌ Utilisateur non trouvé.");
    }
  });

  // Action : parier 200 F
  bot.action('parier', async (ctx) => {
    await ctx.answerCbQuery();
    const user = await getUser(ctx.from.id);

    if (user.balance < 200) {
      return ctx.reply("❌ Tu n'as pas assez pour parier 200 F.");
    }

    await updateUser(user.telegram_id, { balance: user.balance - 200 });
    ctx.reply("🎰 Tu as parié 200 F. Bonne chance !");
  });

  // Action : retirer
  bot.action('retirer', async (ctx) => {
    await ctx.answerCbQuery();
    const user = await getUser(ctx.from.id);

    if (user.balance === 0) {
      return ctx.reply("💸 Tu n’as rien à retirer.");
    }

    await updateUser(user.telegram_id, { balance: 0 });
    ctx.reply(`🏧 Tu as retiré ${user.balance} F. Ton solde est maintenant à 0 F.`);
  });

  // Action : historique
  bot.action('historique', async (ctx) => {
    await ctx.answerCbQuery();
    const user = await getUser(ctx.from.id);

    if (!user.historique || user.historique.length === 0) {
      return ctx.reply("📜 Ton historique est vide.");
    }

    const historiqueText = user.historique.map((partie, i) =>
      `#${i + 1} - ${partie.date} : ${partie.description || "Partie enregistrée"}`
    ).join('\n');

    ctx.reply("🧾 Ton historique :\n" + historiqueText);
  });
};
