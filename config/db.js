// db.js
const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // utile pour Render
  },
});

db.connect()
  .then(() => console.log("✅ Connecté à PostgreSQL via db.js"))
  .catch((err) => console.error("❌ Erreur de connexion PostgreSQL :", err));

module.exports = db;
