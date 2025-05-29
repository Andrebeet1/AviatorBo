// models/User.js
const db = require('../db'); // Connexion PostgreSQL (Pool)
const { v4: uuidv4 } = require('uuid'); // Pour des IDs uniques si nécessaire

// Crée ou récupère un utilisateur
async function findOrCreateUser(telegramId, username) {
  const { rows } = await db.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);

  if (rows.length === 0) {
    const balance = 1000;
    const enJeu = false;
    const pari = 0;
    const historique = [];

    await db.query(
      `INSERT INTO users (telegram_id, username, balance, en_jeu, pari, historique)
       VALUES ($1, $2, $3, $4, $5, $6)`,
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
  }

  return rows[0];
}

// Récupère un utilisateur
async function getUser(telegramId) {
  const { rows } = await db.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
  return rows[0] || null;
}

// Met à jour les champs d'un utilisateur
async function updateUser(telegramId, updates) {
  const keys = Object.keys(updates);
  const values = Object.values(updates);

  const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');

  return db.query(
    `UPDATE users SET ${setClause} WHERE telegram_id = $1`,
    [telegramId, ...values]
  );
}

// Ajoute une entrée dans l'historique
async function addToHistorique(telegramId, partie) {
  const user = await getUser(telegramId);
  if (!user) return;

  const historique = user.historique || [];
  historique.push({
    ...partie,
    date: new Date().toISOString(), // Horodatage automatique
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
