# Audit Proyek Amatani: 03. Analisis Teknologi & Fitur

Dokumen ini memetakan seluruh ekosistem teknologi (*tech stack*) yang digunakan dalam proyek **Amatani** (Kitapanen), memisahkan teknologi aktif dari sisa teknologi Supabase yang sudah usang, serta memperbarui rincian fungsionalitas fitur pasca-migrasi.

---

## 1. Daftar Stack Teknologi & Library (Active vs Legacy)

Berikut adalah pembagian teknologi proyek setelah migrasi ke infrastruktur lokal & Vercel Storage:

### A. Teknologi Aktif (Active Tech Stack)
*   **Core Framework & Runtime:**
    *   **Next.js (v15.0.3):** Menggunakan fitur *App Router* untuk rendering halaman statis dan dinamis.
    *   **React & React DOM (v18.3.1):** Sebagai pustaka antarmuka pengguna dasar.
    *   **Bun / npm:** Manajer paket untuk eksekusi dependensi.
*   **Database & Koneksi Lokal:**
    *   **PostgreSQL Lokal (via pgAdmin):** Berperan sebagai database utama aplikasi yang berjalan di localhost.
    *   **Postgres.js (v3.4.5):** Driver PostgreSQL untuk eksekusi Raw SQL Queries langsung di dalam Server Actions v2.
*   **Sistem Autentikasi Baru:**
    *   **Tabel Pengguna Manual:** Login dan pendaftaran langsung mengakses tabel `users` yang dikelola secara manual di database PostgreSQL lokal.
    *   **NextAuth.js (v5.0.0-beta.31):** Auth.js v5 untuk otentikasi sesi berbasis *Credentials Provider*.
    *   **@auth/pg-adapter (v1.11.2) & pg (v8.20.0):** Adapter NextAuth untuk persistensi sesi langsung ke database PostgreSQL lokal.
    *   **Bcryptjs (v3.0.3):** Digunakan untuk melakukan *hashing* password pengguna sebelum disimpan ke database.
*   **Penyimpanan Media Baru:**
    *   **Vercel Storage / Vercel Blob (v2.3.3):** Digunakan sebagai penyimpanan gambar produk secara cloud, menggantikan Supabase Storage.
*   **UI, Desain, & Styling:**
    *   **Tailwind CSS (v3.4.1):** Utility-first CSS framework.
    *   **Radix UI & Shadcn UI:** Menggunakan komponen-komponen dasar yang dihias dengan Shadcn UI.
    *   **Lucide React (v0.456.0):** Pustaka ikon vektor.
    *   **Sonner (v1.7.0):** Pustaka untuk notifikasi mengambang.
    *   **Embla Carousel React (v8.3.1):** Digunakan untuk slider horizontal (seperti carousel logo mitra).
    *   **Vaul (v1.1.1):** Drawer component untuk tampilan slide-out bawah.
    *   **React Table / TanStack Table (v8.20.6):** Pustaka untuk manajemen tabel data dinamis.
    *   **Recharts (v2.13.3):** Pustaka pembuat grafik visual (untuk dasbor).
*   **Manajemen Formulir & Validasi:**
    *   **React Hook Form (v7.53.2):** Untuk manajemen status input formulir.
    *   **Zod (v3.23.8) & @hookform/resolvers (v3.9.1):** Untuk validasi skema input sebelum dikirim ke database.
*   **Pengujian (Testing):**
    *   **Jest (v29.7.0) & Testing Library (v16.1.0):** Framework pengujian unit dan komponen React.

### B. Teknologi Usang (Legacy Stack - Akan Dihapus)
Teknologi berikut ini adalah sisa implementasi sebelumnya yang **tidak boleh digunakan lagi** dan dependensinya harus segera dibersihkan dari `package.json`:
*   **Supabase Client SDK (`@supabase/supabase-js` v2.47.9):** Sebelumnya digunakan untuk mutasi data database.
*   **Supabase SSR Helper (`@supabase/ssr` v0.5.2):** Sebelumnya digunakan untuk otentikasi sesi Supabase Auth.
*   **Supabase Auth & Supabase Storage:** Telah sepenuhnya digantikan oleh NextAuth (Credentials Lokal) dan Vercel Blob.

---

## 2. Bedah Status Kesiapan Fitur (Feature Checklist)

Berikut adalah status pengerjaan fitur-fitur di dalam proyek Amatani setelah migrasi:

### A. Fitur Selesai (Completed & Ready)
1.  **Landing Page Publik:**
    *   Carousel logo mitra bisnis (diambil dari tabel `lp_company_logos`).
    *   Statistik pencapaian (`lp_experience`).
    *   Highlight produk per kategori utama.
2.  **Sistem Login & Registrasi Baru (Tabel Manual + NextAuth):**
    *   Pendaftaran akun pelanggan baru (Server Action registrasi + Bcrypt hashing langsung ke tabel `users` di PostgreSQL lokal).
    *   Otentikasi Login via NextAuth Credentials dengan pengecekan email dan pencocokan hash password manual.
    *   Middleware guard untuk membatasi akses URL berdasarkan *role* (`admin` vs `customer`).
3.  **Katalog Produk Publik:**
    *   Pencarian produk dan pengurutan (*sorting* berdasarkan alfabet dan tanggal pembuatan).
    *   Halaman detail produk dinamis (menampilkan detail stok, harga, harga grosir, dan gambar).
4.  **Keranjang Belanja Pelanggan (Cart):**
    *   Menambahkan item ke keranjang (`AddToCartCustomers`).
    *   Menghapus item dari keranjang (`DeleteCartItemCustomer`).
    *   Mengubah kuantitas item dengan *debounce sync* ke database PostgreSQL lokal ([cart/page.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/%28public%29/%28customer%29/cart/page.js)).
    *   Kalkulasi otomatis harga grosir bertingkat secara real-time dan ringkasan penghematan (*Wholesale Savings*).
5.  **Pusat Bantuan / FAQ Publik:**
    *   Menampilkan daftar FAQ berdasarkan kategori menggunakan akordion Radix UI.
6.  **Manajemen FAQ (Dashboard Admin):**
    *   CRUD Kategori FAQ (tabel `faq_category`).
    *   CRUD FAQ (tabel `faq`).
7.  **Manajemen Produk (Dashboard Admin):**
    *   Tambah/Edit/Hapus Produk (tabel `products`).
    *   Pengunggahan gambar produk ke **Vercel Blob Storage** ([productsActions.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/actions/v2/dashboard/admin/products/productsActions.js)).
    *   Pengaturan harga grosir bertingkat per produk (tabel `wholesale_prices`).

### B. Fitur Setengah Jadi (In Progress)
1.  **Dekorasi Toko / Landing Page Manager (Dashboard Admin):**
    *   *Status:* **Setengah Jadi** ([shop_decoration/page.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/%28dashboard%29/admin/shop_decoration/page.js)).
    *   *Kekurangan:* Komponen `KategoriPangan` dan `MediaSocial` masih dinonaktifkan (dikomentari dalam kode UI).
2.  **Manajemen Pelanggan (Dashboard Admin):**
    *   *Status:* **Setengah Jadi** ([customers/page.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/%28dashboard%29/admin/customers/page.js)).
    *   *Kekurangan:* Tombol/fitur pengeditan data pelanggan (`handleEditUser`) masih berupa fungsi kosong tanpa aksi.

### C. Fitur Kosong / Belum Dibuat (Placeholder/Stubbed)
Halaman-halaman berikut ini belum memiliki fungsionalitas dan hanya menampilkan layar "Dalam Pengembangan" (*under construction*):
1.  **Home Dashboard Admin ([admin/page.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/%28dashboard%29/admin/page.js))**
2.  **Manajemen Pesanan Admin ([admin/orders/page.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/%28dashboard%29/admin/orders/page.js))**
3.  **Laporan Keuangan Dasbor ([admin/report/page.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/%28dashboard%29/admin/report/page.js))**
4.  **Penilaian Pelanggan Dasbor ([admin/reviews/page.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/%28dashboard%29/admin/reviews/page.js))**
5.  **Dompet Amatani ([admin/wallet/page.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/%28dashboard%29/admin/wallet/page.js))**
6.  **Transaksi Dasbor ([admin/transaction/page.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/%28dashboard%29/admin/transaction/page.js))** (0 byte)
7.  **Riwayat Pesanan Pelanggan ([(customer)/orders/page.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/%28public%29/%28customer%29/orders/page.js))** (Hanya merender `<h1> Order </h1>`)
