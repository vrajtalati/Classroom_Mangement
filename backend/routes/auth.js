const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('Email or password is wrong');

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).send('Invalid password');

  const token = jwt.sign({ _id: user._id, role: user.role }, 'secretKey');
  res.header('Authorization', 'Bearer ' + token).send({ token });
});

// Principal account is created on app start
(async () => {
  const principalExists = await User.findOne({ email: 'principal@classroom.com' });
  if (!principalExists) {
    const hashedPassword = await bcrypt.hash('Admin', 10);
    const principal = new User({
      name: 'Principal',
      email: 'principal@classroom.com',
      password: hashedPassword,
      role: 'principal',
    });
    await principal.save();
    console.log('Principal account created');
  }
})();

module.exports = router;
