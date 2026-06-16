# Audit Proyek Amatani: 05. Status Clean Code Terkini

Setelah menyelesaikan refaktorisasi pada **Tahap 1 hingga Tahap 4** yang difokuskan pada modul *Admin Dashboard*, berikut adalah hasil pemindaian dan analisis terbaru terhadap keseluruhan proyek Amatani untuk menentukan apakah proyek ini sudah sepenuhnya mencapai standar *Clean Code*.

---

## 🚨 Kesimpulan Utama: BELUM SEPENUHNYA CLEAN CODE

Meskipun modul *Admin Dashboard* sudah jauh lebih rapi, terstruktur, dan telah dimigrasikan sepenuhnya ke *Server Actions* tanpa *API wrapper*, **sektor Publik (Public) dan Pelanggan (Customer)** pada proyek ini masih memiliki banyak "hutang teknis" (Technical Debt) dan sisa-sisa pola arsitektur lama.

Berikut adalah rincian masalah yang masih ditemukan:

### 1. Masih Terdapat Redundansi Route API Wrapper
Pemindaian menunjukkan bahwa folder `app/api/v2` belum sepenuhnya bersih. Masih terdapat puluhan file *Route Handlers* yang berfungsi ganda sebagai perantara (wrapper) menuju fungsi eksekusi SQL.
*   **Lokasi yang belum dibersihkan:**
    *   `app/api/v2/public/` (Menangani fetch data Landing Page, FAQ, dan Produk untuk halaman publik).
    *   `app/api/v2/customer/` (Menangani logika Keranjang Belanja / Cart pelanggan).

### 2. Penggunaan `fetch()` yang Masih Tersebar di Client Components
Sejalan dengan belum dihapusnya API Wrapper di atas, komponen-komponen antarmuka yang ada di sisi publik masih mengandalkan pola tradisional `useEffect` + `fetch(...)` untuk mengambil data, alih-alih memanggil *Server Actions* secara langsung.
*   **Beberapa file dengan pemanggilan `fetch` aktif:**
    *   `components/public/customers/product/product_detail/ProductsDetail.js`
    *   `components/public/customers/HomeBuah.js`
    *   `components/public/customers/faq/Faq_accordion.js`
    *   `app/(public)/(customer)/cart/page.js`
    *   ...serta lebih dari 10 komponen publik lainnya.

### 3. Polusi Kode Debugging (`console.log`)
Terdapat puluhan baris `console.log` (terutama yang diawali dengan ikon roket `🚀 ~ ...`) yang masih tertinggal di dalam basis kode, baik di dalam file *Client Components* maupun di dalam file *Server Actions*.
*   Meninggalkan fungsi log debugging di lingkungan produksi sangat tidak disarankan karena akan mengotori *output* server (di *hosting* seperti Vercel) dan dapat membocorkan struktur data internal pada *browser console* klien.

### 4. Kurangnya Standardisasi Eksekusi Keranjang (Cart)
Keranjang belanja (`cartActions.js`) saat ini masih mencampur pola pengembalian JSON via route API dan logika yang cukup kompleks di dalam komponen. Integrasi langsung via Server Actions beserta status *loading* menggunakan `useTransition` perlu diterapkan agar interaksi keranjang terasa instan dan tidak rentan gagal.

---

## 🛠️ Rekomendasi Roadmap Tahap 5 (Finalisasi Clean Code)

Untuk membuat proyek ini **100% Clean Code**, kita perlu melanjutkan dengan **Tahap 5** yang mencakup langkah-langkah berikut:

1.  **Migrasi Server Actions Publik & Customer:**
    Memperbarui tanda tangan fungsi di `app/actions/v2/public/` dan `app/actions/v2/customer/` agar tidak lagi menerima objek `req`, melainkan menerima argumen JavaScript standar (seperti `product_id`, `user_id`, dsb).
2.  **Refaktor Client Components Publik:**
    Menghapus semua pemanggilan `fetch('/api/v2/...')` di folder `app/(public)` dan `components/public`, lalu menggantinya dengan *direct function calls* ke *Server Actions*.
3.  **Penghapusan Total Folder `app/api/v2`:**
    Setelah semua komponen menggunakan *Server Actions*, folder `public` dan `customer` di dalam `app/api/v2/` dapat dihapus seluruhnya.
4.  **Pembersihan Skrip (Sanitation):**
    Menghapus seluruh `console.log` yang tidak perlu untuk *error handling*, serta membuang sisa-sisa blok kode yang dikomentari (*dead code*).
