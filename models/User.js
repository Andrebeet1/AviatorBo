// models/User.js
const mongoose = require('mongoose');

const partieSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  pari: Number,
  multi: String,
  gain: Number
});

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: String,
  balance: { type: Number, default: 1000 }, // Solde initial
  enJeu: { type: Boolean, default: false }, // Est en train de jouer ?
  pari: { type: Number, default: 0 },       // Montant en jeu
  historique: [partieSchema]               // Historique des parties
});

module.exports = mongoose.model('User', userSchema);
