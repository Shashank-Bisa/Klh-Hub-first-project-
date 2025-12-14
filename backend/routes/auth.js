const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Helper to enforce KLH email domain
// Validate KLH email using regular expression (allow common local-part characters)
function isKlhEmail(email) {
  if (typeof email !== 'string') return false;
  const re = /^[A-Za-z0-9._%+-]+@klh\.edu\.in$/i;
  return re.test(email.trim());
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!isKlhEmail(email)) {
      return res.status(400).json({ message: 'Please register using your klh.edu.in email address' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email: normalizedEmail, password: hashedPassword, role: role });
    await user.save();

    if (!process.env.JWT_SECRET) console.warn('⚠️ JWT_SECRET is not set. Using default secret for development.');
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isKlhEmail(email)) {
      return res.status(400).json({ message: 'Please login using your klh.edu.in email address' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) console.warn('⚠️ JWT_SECRET is not set. Using default secret for development.');
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });

    res.status(200).json({ message: 'Login successful', token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
