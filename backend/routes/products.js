const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// GET /api/products — List all available products (with search & filter)
router.get('/', async (req, res) => {
  try {
    const { search, kategori, universitas, sort, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    let query = `
      SELECT p.*, c.nama as kategori_nama, u.nama as penjual_nama, u.no_telepon as penjual_telepon, u.universitas as penjual_universitas
      FROM products p
      LEFT JOIN categories c ON p.kategori_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.status = 'tersedia'
    `;
    let countQuery = `SELECT COUNT(*) FROM products p LEFT JOIN users u ON p.user_id = u.id WHERE p.status = 'tersedia'`;
    const params = [];
    const countParams = [];
    let paramIndex = 1;
    let countParamIndex = 1;

    // Search by name
    if (search) {
      query += ` AND (LOWER(p.nama) LIKE LOWER($${paramIndex}) OR LOWER(p.deskripsi) LIKE LOWER($${paramIndex}))`;
      countQuery += ` AND (LOWER(p.nama) LIKE LOWER($${countParamIndex}) OR LOWER(p.deskripsi) LIKE LOWER($${countParamIndex}))`;
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
      paramIndex++;
      countParamIndex++;
    }

    // Filter by category
    if (kategori) {
      query += ` AND p.kategori_id = $${paramIndex}`;
      countQuery += ` AND p.kategori_id = $${countParamIndex}`;
      params.push(kategori);
      countParams.push(kategori);
      paramIndex++;
      countParamIndex++;
    }

    // Filter by university
    if (universitas) {
      query += ` AND u.universitas = $${paramIndex}`;
      countQuery += ` AND u.universitas = $${countParamIndex}`;
      params.push(universitas);
      countParams.push(universitas);
      paramIndex++;
      countParamIndex++;
    }

    // Sort
    switch (sort) {
      case 'harga_asc':
        query += ' ORDER BY p.harga ASC';
        break;
      case 'harga_desc':
        query += ' ORDER BY p.harga DESC';
        break;
      case 'terlama':
        query += ' ORDER BY p.created_at ASC';
        break;
      default:
        query += ' ORDER BY p.created_at DESC';
    }

    // Pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const [productsResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);

    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      products: productsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/products/my — Get current user's products
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.nama as kategori_nama
       FROM products p
       LEFT JOIN categories c ON p.kategori_id = c.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json({ products: result.rows });
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/products/:id — Get product detail
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.nama as kategori_nama, c.icon as kategori_icon,
              u.nama as penjual_nama, u.email as penjual_email, u.no_telepon as penjual_telepon, u.avatar as penjual_avatar, u.universitas as penjual_universitas
       FROM products p
       LEFT JOIN categories c ON p.kategori_id = c.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }

    // Get related products (same category, exclude current)
    const product = result.rows[0];
    const relatedResult = await pool.query(
      `SELECT p.*, c.nama as kategori_nama, u.nama as penjual_nama, u.universitas as penjual_universitas
       FROM products p
       LEFT JOIN categories c ON p.kategori_id = c.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.kategori_id = $1 AND p.id != $2 AND p.status = 'tersedia'
       LIMIT 4`,
      [product.kategori_id, product.id]
    );

    res.json({
      product,
      relatedProducts: relatedResult.rows
    });
  } catch (error) {
    console.error('Get product detail error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// POST /api/products — Create product
router.post('/', authenticateToken, upload.single('gambar'), async (req, res) => {
  try {
    const { nama, deskripsi, harga, kategori_id, kondisi, lokasi } = req.body;
    const gambar = req.file ? req.file.filename : null;

    if (!nama || !harga) {
      return res.status(400).json({ message: 'Nama dan harga produk wajib diisi.' });
    }

    const result = await pool.query(
      `INSERT INTO products (nama, deskripsi, harga, gambar, kategori_id, user_id, kondisi, lokasi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [nama, deskripsi || null, harga, gambar, kategori_id || null, req.user.id, kondisi || 'bekas', lokasi || null]
    );

    res.status(201).json({
      message: 'Produk berhasil ditambahkan!',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// PUT /api/products/:id — Update product
router.put('/:id', authenticateToken, upload.single('gambar'), async (req, res) => {
  try {
    // Check ownership or admin
    const checkResult = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }

    const product = checkResult.rows[0];
    if (product.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk mengubah produk ini.' });
    }

    const { nama, deskripsi, harga, kategori_id, kondisi, lokasi, status } = req.body;
    const gambar = req.file ? req.file.filename : product.gambar;

    const result = await pool.query(
      `UPDATE products SET nama = $1, deskripsi = $2, harga = $3, gambar = $4, kategori_id = $5, 
       kondisi = $6, lokasi = $7, status = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [
        nama || product.nama,
        deskripsi !== undefined ? deskripsi : product.deskripsi,
        harga || product.harga,
        gambar,
        kategori_id !== undefined ? kategori_id : product.kategori_id,
        kondisi || product.kondisi,
        lokasi !== undefined ? lokasi : product.lokasi,
        status || product.status,
        req.params.id
      ]
    );

    res.json({
      message: 'Produk berhasil diperbarui!',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// DELETE /api/products/:id — Delete product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const checkResult = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }

    const product = checkResult.rows[0];
    if (product.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk menghapus produk ini.' });
    }

    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);

    res.json({ message: 'Produk berhasil dihapus.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
