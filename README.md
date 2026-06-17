# 🎓 KampusMarket — Marketplace Kampus

Platform jual beli barang antar mahasiswa. Memungkinkan mahasiswa untuk menjual dan membeli barang bekas atau baru di lingkungan kampus.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react)
![Tech Stack](https://img.shields.io/badge/Express.js-4-green?logo=express)
![Tech Stack](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Tech Stack](https://img.shields.io/badge/Bootstrap-5-purple?logo=bootstrap)

---

## 📋 Fitur

### 👨‍🎓 Mahasiswa
- ✅ Registrasi dan login
- ✅ Melihat daftar produk yang dijual
- ✅ Menambahkan, mengubah, dan menghapus produk miliknya
- ✅ Melihat detail produk
- ✅ Mencari produk berdasarkan nama atau kategori
- ✅ Menghubungi penjual via WhatsApp/telepon

### 🔑 Admin
- ✅ Login sebagai admin
- ✅ Mengelola data mahasiswa (CRUD)
- ✅ Mengelola seluruh data produk (CRUD + moderasi)
- ✅ Dashboard ringkasan (jumlah user, produk, kategori)

---

## 🛠️ Tech Stack

| Layer     | Teknologi                           |
|-----------|-------------------------------------|
| Frontend  | React.js 18 + Vite                  |
| Styling   | Bootstrap 5 + Bootstrap Icons       |
| Backend   | Node.js + Express.js                |
| Database  | PostgreSQL                          |
| Auth      | JWT (JSON Web Token) + bcrypt       |
| Upload    | Cloudinary                          |

---

## 📁 Struktur Folder

```
Project Framework/
├── backend/
│   ├── config/
│   │   └── db.js                 # Koneksi PostgreSQL
│   ├── middleware/
│   │   ├── auth.js               # JWT middleware
│   │   └── upload.js             # Multer config
│   ├── migrations/
│   │   └── add_universitas.js    # Migrasi kolom universitas ke tabel users
│   ├── routes/
│   │   ├── auth.js               # Auth endpoints
│   │   ├── products.js           # Product CRUD
│   │   ├── categories.js         # Category endpoints
│   │   ├── admin.js              # Admin endpoints
│   │   └── universities.js       # Pencarian universitas (PDDikti API)
│   ├── uploads/                  # Uploaded images
│   ├── database.sql              # SQL schema
│   ├── seed.js                   # Database seeder
│   ├── server.js                 # Express server
│   ├── .env                      # Environment config
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── context/              # Auth context
│   │   ├── pages/                # Page components
│   │   │   ├── admin/            # Admin pages
│   │   │   └── ...               # User pages
│   │   ├── services/             # API service
│   │   ├── App.jsx               # Main app
│   │   ├── App.css               # Styles
│   │   └── main.jsx              # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Instalasi & Menjalankan

### Prasyarat
- **Node.js** (v18 atau lebih baru) — [Download](https://nodejs.org/)
- **PostgreSQL** (v14 atau lebih baru) — [Download](https://www.postgresql.org/download/)
- **npm** (sudah termasuk dalam Node.js)

### Langkah 1: Clone / Siapkan Proyek

Pastikan Anda sudah memiliki folder proyek ini.

### Langkah 2: Setup Database PostgreSQL

1. Buka terminal / pgAdmin dan buat database baru:

```sql
CREATE DATABASE marketplace_kampus;
```

2. (Opsional) Jalankan script SQL secara manual:

```bash
psql -U postgres -d marketplace_kampus -f backend/database.sql
```

3. Atau langsung gunakan seeder (akan otomatis membuat tabel):

```bash
cd backend
npm run seed
```

4. Jalankan migrasi jika database sudah pernah di-seed sebelumnya dan ingin memperbarui struktur tabel:

```bash
cd backend
npm run migrate
```

### Langkah 3: Konfigurasi Environment

Edit file `backend/.env` sesuai konfigurasi PostgreSQL Anda:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=marketplace_kampus
JWT_SECRET=your_secret_key
PORT=5000
```

### Langkah 4: Jalankan Backend

```bash
cd backend
npm install
npm run seed    # Seed database (buat tabel + data contoh)
npm run dev     # Atau: npm start
```

Backend berjalan di: `http://localhost:5000`

### Langkah 5: Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di: `http://localhost:5173`

---

## 🔑 Akun Demo

| Role      | Email                  | Password     |
|-----------|------------------------|--------------|
| Admin     | admin@kampus.ac.id     | admin123     |
| Mahasiswa | budi@student.ac.id     | password123  |
| Mahasiswa | siti@student.ac.id     | password123  |
| Mahasiswa | ahmad@student.ac.id    | password123  |

---

## 📡 REST API Endpoints

### Auth
| Method | Endpoint            | Deskripsi              | Akses     |
|--------|---------------------|------------------------|-----------|
| POST   | `/api/auth/register`| Registrasi mahasiswa   | Public    |
| POST   | `/api/auth/login`   | Login                  | Public    |
| GET    | `/api/auth/me`      | Data user saat ini     | Auth      |

### Products
| Method | Endpoint              | Deskripsi                                    | Akses          |
|--------|-----------------------|----------------------------------------------|----------------|
| GET    | `/api/products`       | Daftar produk + search/filter/universitas     | Public         |
| GET    | `/api/products/my`    | Produk milik user                            | Auth           |
| GET    | `/api/products/:id`   | Detail produk                                | Public         |
| POST   | `/api/products`       | Tambah produk                                | Auth           |
| PUT    | `/api/products/:id`   | Edit produk                                  | Owner/Admin    |
| DELETE | `/api/products/:id`   | Hapus produk                                 | Owner/Admin    |

### Categories
| Method | Endpoint              | Deskripsi              | Akses     |
|--------|-----------------------|------------------------|-----------|
| GET    | `/api/categories`     | Daftar kategori        | Public    |

### Universities
| Method | Endpoint                    | Deskripsi                                   | Akses     |
|--------|-----------------------------|---------------------------------------------|-----------|
| GET    | `/api/universities/search/:keyword` | Mencari universitas via PDDikti API | Public    |


### Admin
| Method | Endpoint                        | Deskripsi              | Akses     |
|--------|---------------------------------|------------------------|-----------|
| GET    | `/api/admin/dashboard`          | Dashboard statistik    | Admin     |
| GET    | `/api/admin/users`              | Daftar semua user      | Admin     |
| PUT    | `/api/admin/users/:id`          | Edit user              | Admin     |
| DELETE | `/api/admin/users/:id`          | Hapus user             | Admin     |
| GET    | `/api/admin/products`           | Semua produk           | Admin     |
| PUT    | `/api/admin/products/:id/moderate` | Moderasi produk     | Admin     |
| DELETE | `/api/admin/products/:id`       | Hapus produk           | Admin     |

---

## 🗄️ Database Schema

### Tabel: `users`
| Kolom      | Tipe         | Keterangan                    |
|------------|--------------|-------------------------------|
| id         | SERIAL PK    | Auto increment                |
| nama       | VARCHAR(100) | Nama lengkap                  |
| email      | VARCHAR(100) | Email (UNIQUE)                |
| password   | VARCHAR(255) | Hash bcrypt                   |
| no_telepon | VARCHAR(20)  | Nomor telepon                 |
| role       | VARCHAR(20)  | 'mahasiswa' atau 'admin'      |
| universitas| VARCHAR(200) | Asal universitas (nullable)   |
| created_at | TIMESTAMP    | Tanggal registrasi            |

### Tabel: `categories`
| Kolom      | Tipe         | Keterangan                    |
|------------|--------------|-------------------------------|
| id         | SERIAL PK    | Auto increment                |
| nama       | VARCHAR(100) | Nama kategori                 |
| deskripsi  | TEXT         | Deskripsi kategori            |
| icon       | VARCHAR(50)  | Bootstrap icon class          |

### Tabel: `products`
| Kolom       | Tipe          | Keterangan                   |
|-------------|---------------|------------------------------|
| id          | SERIAL PK     | Auto increment               |
| nama        | VARCHAR(200)  | Nama produk                  |
| deskripsi   | TEXT          | Deskripsi produk             |
| harga       | DECIMAL(12,2) | Harga dalam Rupiah           |
| gambar      | VARCHAR(255)  | Nama file gambar             |
| kategori_id | INTEGER FK    | Referensi ke categories      |
| user_id     | INTEGER FK    | Referensi ke users           |
| status      | VARCHAR(20)   | tersedia/terjual/dimoderasi  |
| kondisi     | VARCHAR(20)   | baru/bekas                   |
| lokasi      | VARCHAR(100)  | Lokasi di kampus             |

### Relasi
- `products.kategori_id` → `categories.id` (Many-to-One)
- `products.user_id` → `users.id` (Many-to-One, CASCADE delete)

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik.
