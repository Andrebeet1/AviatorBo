const { Pool } = require('pg');

// Crée une connexion à la base PostgreSQL
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Initialise la table users si elle n'existe pas
async function initDatabase() {
  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      telegram_id TEXT PRIMARY KEY,
      username TEXT,
      balance INTEGER DEFAULT 1000,
      en_jeu BOOLEAN DEFAULT false,
      pari INTEGER DEFAULT 0,
      historique JSONB DEFAULT '[]'
    );
  `;

  try {
    await db.query(createUsersTableQuery);
    console.log('✅ Table "users" prête.');
  } catch (err) {
    console.error('❌ Erreur création table "users" :', err);
  }
}

// Connexion au démarrage
db.connect()
  .then(() => {
    console.log("✅ Connecté à PostgreSQL");
    return initDatabase();
  })
  .catch((err) => console.error("❌ Erreur PostgreSQL :", err));

module.exports = db;
