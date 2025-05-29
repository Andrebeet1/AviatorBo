// models/User.js
// models/User.js
const db = require('../db'); // Fichier db.js qui exporte un Pool PostgreSQL
const { v4: uuidv4 } = require('uuid'); // Pour générer des ID uniques dans historique si besoin

// Crée un utilisateur si inexistant
async function findOrCreateUser(telegramId, username) {
  const res = await db.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);

  if (res.rows.length === 0) {
    const balance = 1000;
    const enJeu = false;
    const pari = 0;
    const historique = [];

    await db.query(
      'INSERT INTO users (telegram_id, username, balance, en_jeu, pari, historique) VALUES ($1, $2, $3, $4, $5, $6)',
      [telegramId, username, balance, enJeu, pari, JSON.stringify(historique)]
    );

    return {
      telegram_id: telegramId,
      username,
      balance,
      en_jeu: enJeu,
      pari,
      historique,
    };
  } else {
    return res.rows[0];
  }
}

// Récupère un utilisateur
async function getUser(telegramId) {
  const res = await db.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
  return res.rows[0] || null;
}

// Met à jour le solde et le pari d'un utilisateur
async function updateUser(telegramId, updates) {
  const keys = Object.keys(updates);
  const values = Object.values(updates);
  const setQuery = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');

  return db.query(
    `UPDATE users SET ${setQuery} WHERE telegram_id = $1`,
    [telegramId, ...values]
  );
}

// Ajouter une entrée à l’historique
async function addToHistorique(telegramId, partie) {
  const user = await getUser(telegramId);
  if (!user) return;

  const historique = user.historique || [];
  historique.push({
    ...partie,
    date: new Date().toISOString(),
  });

  await db.query(
    'UPDATE users SET historique = $1 WHERE telegram_id = $2',
    [JSON.stringify(historique), telegramId]
  );
}

module.exports = {
  findOrCreateUser,
  getUser,
  updateUser,
  addToHistorique,
};
