// web/routes/classement.js
const express = require('express');
const router = express.Router();
const User = require('../../models/User');

router.get('/classement', async (req, res) => {
  try {
    const topUsers = await User.find().sort({ balance: -1 }).limit(10);

    res.render('classement', { users: topUsers });
  } catch (err) {
    console.error('Erreur classement :', err);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;
