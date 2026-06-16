# Audit Proyek Amatani: 04. Analisis Database & Tabel

Dokumen ini membedah skema database yang digunakan dalam proyek **Amatani** (Kitapanen), memetakan struktur tabel, merinci kolom beserta tipe datanya, menggambarkan relasi entitas, serta mendokumentasikan skema tabel user manual yang baru dibuat untuk sistem login pasca-migrasi dari Supabase ke **PostgreSQL Lokal (pgAdmin)**.

---

## 1. Spesifikasi Database & Driver Koneksi Lokal

*   **Mesin Database:** **PostgreSQL Lokal** (Dikelola menggunakan pgAdmin atau CLI PostgreSQL lokal).
*   **Driver & Koneksi:**
    1.  **Postgres.js (`postgres`):** Digunakan untuk query Raw SQL di semua Server Actions v2. Koneksi dibuat di [postgres.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/lib/postgres.js) menggunakan variabel `DATABASE_URL` lokal (format: `postgresql://username:password@localhost:5432/dbname`).
    2.  **pg (`pg`):** Digunakan oleh adapter otentikasi `@auth/pg-adapter` dalam [auth.ts](file:///d:/PROYEK%20UNIVERSITAS/Amatani/auth.ts) untuk mengelola pool koneksi bagi sesi NextAuth.

---

## 2. Diagram Relasi Entitas (Entity-Relationship Diagram)

Berikut adalah diagram relasi antartabel di dalam database PostgreSQL Lokal Amatani:

```mermaid
erDiagram
    users {
        uuid id PK
        varchar name
        varchar email UK
        varchar password
        varchar role
    }
    categories {
        integer id PK
        varchar name
    }
    products {
        uuid id PK
        varchar name
        text description
        integer stock
        integer category_id FK
        varchar price_type
        timestamp created_at
    }
    fixed_prices {
        uuid product_id FK
        integer price
    }
    wholesale_prices {
        uuid id PK
        uuid product_id FK
        integer min_quantity
        integer max_quantity
        integer price
    }
    product_images {
        uuid id PK
        uuid product_id FK
        varchar image_path
    }
    carts {
        uuid id PK
        uuid user_id FK
        timestamp created_at
    }
    carts_items {
        uuid id PK
        uuid cart_id FK
        uuid product_id FK
        integer quantity
        timestamp created_at
    }
    faq_category {
        uuid id PK
        varchar name
        timestamp created_at
    }
    faq {
        uuid id PK
        varchar title
        text content
        uuid category_id FK
        timestamp created_at
    }
    lp_food_categories {
        uuid food_id PK
        integer category_id FK
        varchar image_path
    }
    lp_experience {
        uuid id PK
        varchar number
        text description
    }
    lp_company_logos {
        uuid id PK
        varchar image_path
    }
    lp_service {
        uuid id PK
        varchar name
        varchar image_path
    }

    users ||--o{ carts : "memiliki"
    categories ||--o{ products : "mengelompokkan"
    products ||--o| fixed_prices : "memiliki_harga_retail"
    products ||--o{ wholesale_prices : "memiliki_harga_grosir"
    products ||--o{ product_images : "memiliki_gambar"
    carts ||--o{ carts_items : "berisi"
    products ||--o{ carts_items : "dimasukkan_ke"
    faq_category ||--o{ faq : "mengelompokkan"
    categories ||--o{ lp_food_categories : "mengelompokkan"
```

---

## 3. Kamus Data & Penjelasan Struktur Tabel

### A. Tabel Otentikasi & Pengguna (User Management) - Skema Baru
Sistem otentikasi baru menggunakan tabel `users` manual yang diintegrasikan langsung dengan **NextAuth.js Credentials Provider**.

#### 1. Tabel `users` (Tabel User Manual)
Tabel ini menampung data akun pengguna yang mendaftar atau dikelola oleh administrator secara lokal.
*   `id` (UUID, Primary Key): Pengidentifikasi unik pengguna. Diisi secara otomatis menggunakan UUID (misal default `gen_random_uuid()` di Postgres).
*   `name` (VARCHAR): Nama lengkap pengguna.
*   `email` (VARCHAR, Unique): Alamat email pengguna. Bertindak sebagai *unique constraint* untuk mencegah registrasi email ganda dan digunakan untuk login.
*   `password` (VARCHAR): Hash password pengguna (di-hash menggunakan `bcryptjs` sebelum disimpan).
*   `role` (VARCHAR): Peran pengguna dalam sistem, bernilai `'admin'` (untuk akses dasbor `/admin`) atau `'customer'` (untuk pelanggan ritel/grosir).

#### 2. Tabel Pendukung NextAuth (`pg-adapter` schema)
Karena NextAuth dihubungkan ke PostgreSQL lokal via `@auth/pg-adapter`, database secara otomatis akan membentuk tabel-tabel berikut untuk kebutuhan manajemen sesi login:
*   `accounts`: Menyimpan data provider jika kelak menggunakan OAuth (seperti Google/Github).
*   `sessions`: Menyimpan token sesi pengguna aktif (`sessionToken`, `userId`, `expires`).
*   `verification_tokens`: Digunakan untuk fitur verifikasi email atau pengiriman OTP.

---

### B. Sektor Katalog & Produk (E-Commerce Catalog)
Sektor ini menyimpan produk, kategori, harga, dan gambar.

#### 1. Tabel `categories`
*   `category_id` (INTEGER, Primary Key): ID kategori produk.
*   `name` (VARCHAR): Nama kategori (contoh: Sayur, Buah, Pangan).

#### 2. Tabel `products`
*   `product_id` (UUID, Primary Key): ID unik produk.
*   `name` (VARCHAR): Nama produk hasil tani.
*   `description` (TEXT): Deskripsi produk.
*   `stock` (INTEGER): Ketersediaan stok produk di gudang.
*   `category_id` (INTEGER, Foreign Key -> `categories.category_id`): Relasi kategori.
*   `price_type` (VARCHAR): Pilihan tipe harga, bernilai `'fixed'` (harga tunggal) atau `'wholesale'` (harga grosir bertingkat).
*   `created_at` (TIMESTAMP): Tanggal produk ditambahkan.

#### 3. Tabel `fixed_prices`
Tabel ini mencatat harga retail tunggal. Hanya terisi jika produk memiliki `price_type = 'fixed'`.
*   `product_id` (UUID, Foreign Key -> `products.product_id`): Relasi produk.
*   `price` (INTEGER/NUMERIC): Nominal harga per unit.

#### 4. Tabel `wholesale_prices`
Tabel ini mencatat harga grosir bertingkat untuk produk dengan `price_type = 'wholesale'`.
*   `wholesale_prices_id` (UUID, Primary Key): ID harga grosir.
*   `product_id` (UUID, Foreign Key -> `products.product_id`): Relasi produk.
*   `min_quantity` (INTEGER): Batas minimum pembelian untuk mendapatkan harga ini.
*   `max_quantity` (INTEGER): Batas maksimum pembelian.
*   `price` (INTEGER/NUMERIC): Nominal harga grosir per unit pada kuantitas tersebut.

#### 5. Tabel `product_images`
*   `images_id` (UUID, Primary Key): ID unik gambar.
*   `product_id` (UUID, Foreign Key -> `products.product_id`): Relasi produk.
*   `image_path` (VARCHAR): URL gambar produk (berupa tautan absolut **Vercel Blob Storage**).

---

### C. Sektor Keranjang Belanja (Shopping Cart)
Menangani penyimpanan sementara item belanja pelanggan sebelum proses checkout.

#### 1. Tabel `carts`
*   `carts_id` (UUID, Primary Key): ID unik keranjang belanja.
*   `user_id` (UUID, Foreign Key -> `users.id`): Pemilik keranjang belanja.
*   `created_at` (TIMESTAMP): Tanggal pembuatan keranjang.

#### 2. Tabel `carts_items`
*   `cart_items_id` (UUID, Primary Key): ID unik baris item keranjang.
*   `cart_id` (UUID, Foreign Key -> `carts.carts_id`): Relasi ke keranjang induk.
*   `product_id` (UUID, Foreign Key -> `products.product_id`): Produk yang dimasukkan.
*   `quantity` (INTEGER): Jumlah produk yang dipesan.
*   `created_at` (TIMESTAMP): Tanggal item dimasukkan ke keranjang.

---

### D. Sektor Pusat Bantuan (FAQ System)
Mengelola konten FAQ yang dapat dibaca pelanggan di halaman depan.

#### 1. Tabel `faq_category`
*   `category_id` (UUID, Primary Key): ID kategori FAQ.
*   `name` (VARCHAR): Nama kategori (contoh: Pembayaran, Pengiriman).
*   `created_at` (TIMESTAMP): Tanggal pembuatan kategori.

#### 2. Tabel `faq`
*   `faq_id` (UUID, Primary Key): ID unik FAQ.
*   `title` (VARCHAR): Judul pertanyaan FAQ.
*   `content` (TEXT): Jawaban dari pertanyaan FAQ.
*   `category_id` (UUID, Foreign Key -> `faq_category.category_id`): Relasi kategori FAQ.
*   `created_at` (TIMESTAMP): Tanggal pembuatan FAQ.

---

### E. Sektor Landing Page & Dekorasi Toko (Shop Customization)
Menyimpan konten dinamis untuk elemen landing page.

#### 1. Tabel `lp_experience`
*   `experience_id` (UUID, Primary Key): ID statistik.
*   `number` (VARCHAR): Angka statistik (contoh: `"10+"`, `"100%"`).
*   `description` (TEXT): Keterangan statistik (contoh: `"Mitra Tani"`, `"Bahan Segar"`).

#### 2. Tabel `lp_company_logos`
*   `cp_id` (UUID, Primary Key): ID logo mitra bisnis.
*   `image_path` (VARCHAR): URL gambar logo mitra bisnis.

#### 3. Tabel `lp_service`
*   `service_id` (UUID, Primary Key): ID layanan.
*   `name` (VARCHAR): Judul layanan landing page.
*   `image_path` (VARCHAR): URL ikon/gambar layanan.

#### 4. Tabel `lp_food_categories`
*   `food_category_id` (UUID, Primary Key): ID pangan.
*   `category_id` (INTEGER, Foreign Key -> `categories.category_id`): Menghubungkan visual landing page ke kategori katalog produk.
*   `image_path` (VARCHAR): URL gambar kategori pangan.

---

## 4. Rekomendasi Pembersihan Sisa Skema Supabase (Database Cleanups)

Karena database telah dipindahkan ke PostgreSQL Lokal (di luar platform Supabase), maka:
*   **Skema Supabase Internal (`auth`, `storage`, `realtime`):** Pada database PostgreSQL lokal, skema `auth` bawaan Supabase (seperti tabel `auth.users`, `auth.identities`, dsb.) **tidak diperlukan lagi**. PostgreSQL lokal hanya memerlukan skema `public` yang berisi tabel-tabel di atas beserta tabel pendukung NextAuth.
*   **Pembersihan Data Lama (`product_images.image_path`):** Jika database lokal hasil migrasi masih memiliki baris data produk lama dengan `image_path` yang bernilai path relatif Supabase (misal: `products/gambar1.png`), data ini harus diperbarui (*update query*) menjadi URL absolut Vercel Blob agar tidak memicu kerusakan tampilan gambar di sisi frontend.
