const bcrypt = require('bcryptjs');
const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Read and execute SQL schema
    const sqlPath = path.join(__dirname, 'database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (err) {
        // Ignore errors for existing tables/data
        if (!err.message.includes('already exists') && !err.message.includes('duplicate key')) {
          console.warn('⚠️  Warning:', err.message);
        }
      }
    }

    console.log('✅ Tables created successfully');

    // Check if admin exists
    const adminCheck = await pool.query("SELECT id FROM users WHERE email = 'admin@kampus.ac.id'");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    if (adminCheck.rows.length === 0) {
      // Create admin user with hashed password
      await pool.query(
        "INSERT INTO users (nama, email, password, no_telepon, role) VALUES ($1, $2, $3, $4, $5)",
        ['Administrator', 'admin@kampus.ac.id', hashedPassword, '081234567890', 'admin']
      );
      console.log('✅ Admin account created (admin@kampus.ac.id / admin123)');
    } else {
      // Update password to ensure it is correct
      await pool.query(
        "UPDATE users SET password = $1 WHERE email = 'admin@kampus.ac.id'",
        [hashedPassword]
      );
      console.log('ℹ️  Admin account already exists, password updated to admin123');
    }

    // Create sample mahasiswa accounts
    const sampleUsers = [
      { nama: 'Budi Santoso', email: 'budi@student.ac.id', phone: '081111111111' },
      { nama: 'Siti Rahayu', email: 'siti@student.ac.id', phone: '082222222222' },
      { nama: 'Ahmad Fauzi', email: 'ahmad@student.ac.id', phone: '083333333333' },
    ];

    const defaultPass = await bcrypt.hash('password123', salt);

    for (const user of sampleUsers) {
      const check = await pool.query('SELECT id FROM users WHERE email = $1', [user.email]);
      if (check.rows.length === 0) {
        await pool.query(
          'INSERT INTO users (nama, email, password, no_telepon, role) VALUES ($1, $2, $3, $4, $5)',
          [user.nama, user.email, defaultPass, user.phone, 'mahasiswa']
        );
      } else {
        await pool.query(
          'UPDATE users SET password = $1 WHERE email = $2',
          [defaultPass, user.email]
        );
      }
    }
    console.log('✅ Sample mahasiswa accounts created/updated');

    // Create sample products
    const budiId = (await pool.query("SELECT id FROM users WHERE email = 'budi@student.ac.id'")).rows[0]?.id;
    const sitiId = (await pool.query("SELECT id FROM users WHERE email = 'siti@student.ac.id'")).rows[0]?.id;
    const ahmadId = (await pool.query("SELECT id FROM users WHERE email = 'ahmad@student.ac.id'")).rows[0]?.id;

    if (budiId && sitiId && ahmadId) {
      const productCheck = await pool.query('SELECT COUNT(*) FROM products');
      if (parseInt(productCheck.rows[0].count) === 0) {
        const sampleProducts = [
          { nama: 'Laptop ASUS VivoBook 14', deskripsi: 'Laptop ASUS VivoBook 14 inch, RAM 8GB, SSD 256GB. Kondisi mulus, baru dipakai 1 tahun. Cocok untuk kuliah dan coding.', harga: 5500000, kategori: 1, user: budiId, kondisi: 'bekas', lokasi: 'Gedung A' },
          { nama: 'Buku Algoritma dan Struktur Data', deskripsi: 'Buku Algoritma dan Struktur Data karangan Rinaldi Munir. Edisi terbaru, kondisi seperti baru.', harga: 85000, kategori: 2, user: sitiId, kondisi: 'bekas', lokasi: 'Perpustakaan' },
          { nama: 'Jaket Hoodie Unisex', deskripsi: 'Jaket hoodie warna hitam, ukuran L. Bahan fleece tebal dan nyaman. Baru dipakai 2 kali.', harga: 120000, kategori: 3, user: ahmadId, kondisi: 'bekas', lokasi: 'Kantin' },
          { nama: 'Kalkulator Scientific Casio fx-991ID', deskripsi: 'Kalkulator scientific Casio fx-991ID Plus. Masih berfungsi dengan baik, cocok untuk mata kuliah matematika.', harga: 150000, kategori: 2, user: budiId, kondisi: 'bekas', lokasi: 'Gedung B' },
          { nama: 'Meja Belajar Lipat', deskripsi: 'Meja belajar lipat portable, ukuran 60x40cm. Cocok untuk anak kos, bisa dilipat hemat tempat.', harga: 95000, kategori: 4, user: sitiId, kondisi: 'bekas', lokasi: 'Kos Putri' },
          { nama: 'Raket Badminton Yonex', deskripsi: 'Raket badminton Yonex Nanoray 7. Sudah include tas dan grip baru. Cocok untuk pemula.', harga: 200000, kategori: 5, user: ahmadId, kondisi: 'bekas', lokasi: 'GOR Kampus' },
          { nama: 'Charger Laptop Lenovo Original', deskripsi: 'Charger laptop Lenovo 65W original. Kompatibel dengan ThinkPad dan IdeaPad series.', harga: 175000, kategori: 1, user: budiId, kondisi: 'baru', lokasi: 'Gedung A' },
          { nama: 'Novel "Laskar Pelangi"', deskripsi: 'Novel Laskar Pelangi karya Andrea Hirata. Cetakan ke-5, kondisi baik.', harga: 35000, kategori: 2, user: sitiId, kondisi: 'bekas', lokasi: 'Perpustakaan' },
        ];

        for (const product of sampleProducts) {
          await pool.query(
            'INSERT INTO products (nama, deskripsi, harga, kategori_id, user_id, kondisi, lokasi) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [product.nama, product.deskripsi, product.harga, product.kategori, product.user, product.kondisi, product.lokasi]
          );
        }
        console.log('✅ Sample products created');
      } else {
        console.log('ℹ️  Products already exist, skipping');
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📧 Admin login: admin@kampus.ac.id / admin123');
    console.log('📧 Sample user: budi@student.ac.id / password123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
