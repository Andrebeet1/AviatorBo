const db = require('../../config/db'); // Chemin vers ta connexion PostgreSQL

async function handleStart(bot, msg) {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString(); // identifiant unique
  const username = msg.from.username || msg.from.first_name || "Utilisateur";

  try {
    // Recherche de l'utilisateur
    const { rows } = await db.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegramId]
    );

    if (rows.length === 0) {
      // Création automatique du compte lié au Telegram
      await db.query(
        'INSERT INTO users (telegram_id, username, balance, en_jeu, pari, historique) VALUES ($1, $2, $3, false, 0, $4)',
        [telegramId, username, 1000, JSON.stringify([])]
      );

      return bot.sendMessage(chatId, `👤 Ton compte Telegram est maintenant lié !\n🎉 Bienvenue @${username} !\n💰 Solde initial : 1000 F.`);
    } else {
      // Connexion automatique
      const user = rows[0];
      return bot.sendMessage(chatId, `👋 Re-bienvenue @${username} !\n💼 Compte lié à ton Telegram.\n💰 Solde : ${user.balance} F.`);
    }

  } catch (err) {
    console.error('❌ Erreur START :', err.message);
    return bot.sendMessage(chatId, `❌ Une erreur est survenue : ${err.message}`);
  }
}

module.exports = handleStart;
