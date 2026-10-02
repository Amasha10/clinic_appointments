const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function createToken(userId) {
  return jwt.sign({}, process.env.JWT_SECRET, { subject: userId.toString(), expiresIn: '7d' });
}

exports.register = async (request, response) => {
  const { name, email, password } = request.body;
  if (!name?.trim() || !email?.trim() || !password) {
    return response.status(400).json({ message: 'Name, email, and password are required.' });
  }
  if (password.length < 8 || password.length > 100) {
    return response.status(400).json({ message: 'Password must be 8 to 100 characters.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return response.status(400).json({ message: 'Enter a valid email address.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash });
  return response.status(201).json({
    token: createToken(user._id),
    user: { id: user._id, name: user.name, email: user.email },
  });
};

exports.login = async (request, response) => {
  const { email, password } = request.body;
  if (!email?.trim() || !password) {
    return response.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return response.status(401).json({ message: 'Email or password is incorrect.' });
  }

  return response.json({
    token: createToken(user._id),
    user: { id: user._id, name: user.name, email: user.email },
  });
};