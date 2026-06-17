-- =============================================
-- Marketplace Kampus — PostgreSQL Database Schema
-- =============================================

-- Create database (run this separately if needed)
-- CREATE DATABASE marketplace_kampus;

-- Connect to the database
-- \c marketplace_kampus;

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    no_telepon VARCHAR(20),
    role VARCHAR(20) DEFAULT 'mahasiswa' CHECK (role IN ('mahasiswa', 'admin')),
    avatar VARCHAR(255) DEFAULT NULL,
    universitas VARCHAR(200) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    icon VARCHAR(50) DEFAULT 'bi-tag',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 3. PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    harga DECIMAL(12, 2) NOT NULL,
    gambar VARCHAR(255) DEFAULT NULL,
    kategori_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'tersedia' CHECK (status IN ('tersedia', 'terjual', 'dimoderasi')),
    kondisi VARCHAR(20) DEFAULT 'bekas' CHECK (kondisi IN ('baru', 'bekas')),
    lokasi VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_products_kategori ON products(kategori_id);
CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_nama ON products(nama);
CREATE INDEX idx_users_email ON users(email);

-- =============================================
-- SEED DATA — Default Categories
-- =============================================
INSERT INTO categories (nama, deskripsi, icon) VALUES
('Elektronik', 'Laptop, HP, charger, dan perangkat elektronik lainnya', 'bi-laptop'),
('Buku & Alat Tulis', 'Buku kuliah, novel, alat tulis, dan perlengkapan belajar', 'bi-book'),
('Pakaian', 'Baju, celana, jaket, sepatu, dan aksesoris fashion', 'bi-bag'),
('Kos & Furniture', 'Peralatan kos, furniture, kasur, dan perlengkapan kamar', 'bi-house'),
('Olahraga', 'Alat olahraga, sepatu olahraga, dan perlengkapan gym', 'bi-trophy'),
('Kendaraan', 'Sepeda, motor, helm, dan aksesoris kendaraan', 'bi-bicycle'),
('Makanan & Minuman', 'Snack, minuman, dan makanan ringan', 'bi-cup-straw'),
('Lainnya', 'Barang-barang lainnya yang tidak masuk kategori di atas', 'bi-three-dots');

-- Note: The admin user and sample users are inserted by seed.js using correct bcrypt hashes.

