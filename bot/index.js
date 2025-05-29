bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  await bot.answerCallbackQuery(query.id);

  if (data === 'solde') {
    const user = await getUser(userId);
    return bot.sendMessage(chatId, `💰 Ton solde est de : ${user.balance} F.`);
  }

  if (data === 'parier_200') {
    const user = await getUser(userId);
    if (user.balance < 200) {
      return bot.sendMessage(chatId, "❌ Tu n'as pas assez pour parier 200 F.");
    }

    await updateUser(user.telegram_id, { balance: user.balance - 200 });
    return bot.sendMessage(chatId, "🎰 Tu as parié 200 F. Bonne chance !");
  }

  if (data === 'retirer') {
    const user = await getUser(userId);
    if (user.balance === 0) {
      return bot.sendMessage(chatId, "💸 Tu n’as rien à retirer.");
    }

    await updateUser(user.telegram_id, { balance: 0 });
    return bot.sendMessage(chatId, `🏧 Tu as retiré ${user.balance} F. Solde : 0 F.`);
  }

  if (data === 'historique') {
    const user = await getUser(userId);
    if (!user.historique || user.historique.length === 0) {
      return bot.sendMessage(chatId, "📜 Ton historique est vide.");
    }

    const texte = user.historique.map((item, i) => `#${i + 1} - ${item.date} : ${item.description || 'Partie'}`).join('\n');
    return bot.sendMessage(chatId, `🧾 Historique :\n${texte}`);
  }
});
