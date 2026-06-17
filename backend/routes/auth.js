const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// POST /api/auth/register — Register new mahasiswa
router.post('/register', async (req, res) => {
  try {
    const { nama, email, password, no_telepon, universitas } = req.body;

    // Validation
    if (!nama || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi.' });
    }

    // Check if email already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (nama, email, password, no_telepon, role, universitas) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nama, email, no_telepon, role, universitas, created_at',
      [nama, email, hashedPassword, no_telepon || null, 'mahasiswa', universitas || null]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, nama: user.nama },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registrasi berhasil!',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        no_telepon: user.no_telepon,
        role: user.role,
        universitas: user.universitas
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// POST /api/auth/login — Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi.' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, nama: user.nama },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        no_telepon: user.no_telepon,
        role: user.role,
        universitas: user.universitas
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/auth/me — Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nama, email, no_telepon, role, avatar, universitas, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
