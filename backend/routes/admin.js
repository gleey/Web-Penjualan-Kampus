const express = require('express');
const pool = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken, isAdmin);

// GET /api/admin/dashboard — Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [usersCount, productsCount, categoriesCount, recentProducts, recentUsers] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'mahasiswa'"),
      pool.query('SELECT COUNT(*) FROM products'),
      pool.query('SELECT COUNT(*) FROM categories'),
      pool.query(`
        SELECT p.*, u.nama as penjual_nama, c.nama as kategori_nama
        FROM products p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN categories c ON p.kategori_id = c.id
        ORDER BY p.created_at DESC LIMIT 5
      `),
      pool.query(`
        SELECT id, nama, email, role, created_at 
        FROM users ORDER BY created_at DESC LIMIT 5
      `)
    ]);

    // Products by status
    const productsByStatus = await pool.query(`
      SELECT status, COUNT(*) as count FROM products GROUP BY status
    `);

    // Products by category
    const productsByCategory = await pool.query(`
      SELECT c.nama, COUNT(p.id) as count
      FROM categories c
      LEFT JOIN products p ON c.id = p.kategori_id
      GROUP BY c.id, c.nama
      ORDER BY count DESC
    `);

    res.json({
      stats: {
        totalMahasiswa: parseInt(usersCount.rows[0].count),
        totalProduk: parseInt(productsCount.rows[0].count),
        totalKategori: parseInt(categoriesCount.rows[0].count)
      },
      productsByStatus: productsByStatus.rows,
      productsByCategory: productsByCategory.rows,
      recentProducts: recentProducts.rows,
      recentUsers: recentUsers.rows
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/admin/users — List all users
router.get('/users', async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = 'SELECT id, nama, email, no_telepon, role, created_at FROM users WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (LOWER(nama) LIKE LOWER($${paramIndex}) OR LOWER(email) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (role) {
      query += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// PUT /api/admin/users/:id — Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { nama, email, no_telepon, role } = req.body;

    const checkResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    const user = checkResult.rows[0];
    const result = await pool.query(
      `UPDATE users SET nama = $1, email = $2, no_telepon = $3, role = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING id, nama, email, no_telepon, role, created_at`,
      [
        nama || user.nama,
        email || user.email,
        no_telepon !== undefined ? no_telepon : user.no_telepon,
        role || user.role,
        req.params.id
      ]
    );

    res.json({ message: 'User berhasil diperbarui.', user: result.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Email sudah digunakan oleh user lain.' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// DELETE /api/admin/users/:id — Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    // Prevent deleting own admin account
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Anda tidak bisa menghapus akun Anda sendiri.' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    res.json({ message: 'User berhasil dihapus.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/admin/products — List ALL products (including non-available)
router.get('/products', async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = `
      SELECT p.*, c.nama as kategori_nama, u.nama as penjual_nama
      FROM products p
      LEFT JOIN categories c ON p.kategori_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (LOWER(p.nama) LIKE LOWER($${paramIndex}) OR LOWER(u.nama) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      query += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ products: result.rows });
  } catch (error) {
    console.error('Admin get products error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// PUT /api/admin/products/:id/moderate — Moderate product status
router.put('/products/:id/moderate', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['tersedia', 'terjual', 'dimoderasi'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid.' });
    }

    const result = await pool.query(
      'UPDATE products SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }

    res.json({ message: 'Status produk berhasil diperbarui.', product: result.rows[0] });
  } catch (error) {
    console.error('Moderate product error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// DELETE /api/admin/products/:id — Delete any product
router.delete('/products/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }
    res.json({ message: 'Produk berhasil dihapus.' });
  } catch (error) {
    console.error('Admin delete product error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
