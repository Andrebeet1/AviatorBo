module.exports = async (bot, msg, db) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    // Vérifie si l'utilisateur existe déjà
    const result = await db.query('SELECT * FROM users WHERE telegram_id = $1', [userId]);

    if (result.rows.length === 0) {
      // Ajoute l'utilisateur avec un solde initial (ex: 1000)
      await db.query(
        'INSERT INTO users (telegram_id, username, solde) VALUES ($1, $2, $3)',
        [userId, msg.from.username || '', 1000]
      );

      await bot.sendMessage(chatId, `👋 Bienvenue, ${msg.from.first_name} !\n\nTon compte a été créé avec un solde initial de 1000 💰.`);
    } else {
      await bot.sendMessage(chatId, `👋 Re-bienvenue, ${msg.from.first_name} !\n\nTon compte est déjà enregistré.`);
    }

    // Message d'aide
    const helpText = `📋 Voici les commandes disponibles :

/parier <montant> – Parier une somme
/retirer – Retirer vos gains
/solde – Voir votre solde
/historique – Voir ton historique de paris`;

    await bot.sendMessage(chatId, helpText);
  } catch (err) {
    console.error("❌ Erreur dans /start :", err);
    await bot.sendMessage(chatId, `⚠️ Une erreur est survenue. Réessaie plus tard.`);
  }
};
