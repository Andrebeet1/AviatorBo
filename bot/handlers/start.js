const pool = require('../db');

async function handleStart(bot, msg) {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString(); // Converti en string
  const username = msg.from.username || msg.from.first_name || "Utilisateur";

  try {
    // Vérifie si l'utilisateur existe
    const { rows } = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);

    if (rows.length === 0) {
      // Création d'un nouvel utilisateur avec solde initial et historique vide
      await pool.query(
        'INSERT INTO users (telegram_id, username, balance, en_jeu, pari, historique) VALUES ($1, $2, $3, false, 0, $4)',
        [telegramId, username, 1000, JSON.stringify([])]
      );

      return bot.sendMessage(chatId, `🎉 Bienvenue @${username} !\nTon compte a été créé avec 💰 1000 F.`);
    } else {
      const user = rows[0];
      return bot.sendMessage(chatId, `👋 Bon retour @${username} !\n💰 Ton solde : ${user.balance} F.`);
    }
  } catch (err) {
    console.error('Erreur START:', err);
    bot.sendMessage(chatId, '❌ Une erreur est survenue. Essaie à nouveau.');
  }
}

module.exports = handleStart;
