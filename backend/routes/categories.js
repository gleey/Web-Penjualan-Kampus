const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// GET /api/categories — List all categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, COUNT(p.id) as jumlah_produk
       FROM categories c
       LEFT JOIN products p ON c.id = p.kategori_id AND p.status = 'tersedia'
       GROUP BY c.id
       ORDER BY c.nama ASC`
    );
    res.json({ categories: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/categories/:id — Get single category
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
    }
    res.json({ category: result.rows[0] });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
