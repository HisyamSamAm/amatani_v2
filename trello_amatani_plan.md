# Trello Master Plan: Proyek Amatani (Ultra Detail)

Berikut adalah struktur pembuatan *Card* Trello yang sangat mendetail, mencakup setiap library (seperti Shadcn), tabel database, hingga fitur spesifik di setiap rute (*routes*) dari kode proyek Amatani Anda. 

Buatlah *Card* berikut di kolom **To Do** Anda.

---

## 🏷️ Pengaturan Labels (Wajib Ada)
*   🔴 `Priority: High` (Harus dikerjakan pertama)
*   🟢 `Frontend / UIUX` (Tampilan, Tailwind, Shadcn)
*   🟠 `Backend / Database` (Supabase, Postgres, SQL)
*   🟣 `Admin Feature` (Modul khusus Admin)
*   🟡 `Customer Feature` (Modul khusus Pelanggan)
*   🔵 `Public Feature` (Landing page, Info)

---

## 📦 KELOMPOK 1: Kebutuhan Inti (General User Requirements)

### Card 1: Setup Core Tech Stack & Backend
*   **Labels:** 🔴 `Priority: High`, 🟠 `Backend / Database`
*   **Description:** Konfigurasi kerangka utama aplikasi (Framework & Server) dan koneksi Database.
*   **Checklist: "Framework & Runtime" (100%)**
    *   [x] Inisialisasi Next.js 15 (App Router)
    *   [x] Konfigurasi React 18 & Node.js environment (`.env`)
*   **Checklist: "Database & ORM / Driver" (0%)**
    *   [ ] Setup *Project* di Supabase
    *   [ ] Install dan konfigurasi `postgres` package (`lib/postgres.js`)
    *   [ ] Setup Supabase Storage (Buckets untuk gambar)
*   **Checklist: "Pembuatan Tabel Database (Raw SQL)" (100%)**
    *   [x] Tabel `products`, `product_images`, `categories`
    *   [x] Tabel `fixed_prices`, `wholesale_prices`
    *   [x] Tabel Dekorasi: `lp_company_logos`, `lp_experience`, `lp_food_categories`, `lp_service`
    *   [x] Tabel Bantuan: `faq`, `faq_category`

### Card 2: Setup UI/UX Library & Components (Shadcn & Form)
*   **Labels:** 🔴 `Priority: High`, 🟢 `Frontend / UIUX`
*   **Description:** Instalasi dan konfigurasi sistem *styling* dan validasi formulir.
*   **Checklist: "Styling & UI Framework"**
    *   [ ] Setup Tailwind CSS & `tailwind-merge` & `clsx`
    *   [ ] Install `lucide-react` (untuk Ikon)
    *   [ ] Install `next-themes` (Dukungan Dark/Light mode)
*   **Checklist: "Shadcn UI Core Components (Radix UI)"**
    *   [ ] Form & Input: Label, Checkbox, Radio Group, Select, Slider, Switch, Input OTP
    *   [ ] Navigation & Layout: Accordion, Tabs, Scroll Area, Resizable Panels, Separator, Aspect Ratio
    *   [ ] Overlay & Feedback: Dialog, Alert Dialog, Popover, Tooltip, Hover Card, Menubar
    *   [ ] Data Display: Avatar, Collapsible, Progress, Toggle Group
*   **Checklist: "Complex UI Plugins"**
    *   [ ] Install `@tanstack/react-table` (Tabel data canggih untuk Admin)
    *   [ ] Install `recharts` (Grafik analitik untuk laporan)
    *   [ ] Install `embla-carousel-react` (Slider / Carousel)
    *   [ ] Install `sonner` & `vaul` (Toast notifikasi & Drawer)
    *   [ ] Install `react-day-picker` & `date-fns` (Pemilihan tanggal)
*   **Checklist: "Form Management"**
    *   [ ] Install `react-hook-form` (State formulir)
    *   [ ] Install `zod` & `@hookform/resolvers` (Validasi tipe data)

---

## 🔐 KELOMPOK 2: Autentikasi (Authentication)

### Card 3: Auth System (Supabase SSR)
*   **Labels:** 🔴 `Priority: High`, 🟠 `Backend / Database`
*   **Description:** Sistem *Login*, *Register*, dan manajemen sesi.
*   **Checklist: "Auth Setup"**
    *   [ ] Setup `@supabase/ssr` (Server-Side Rendering Auth)
    *   [ ] Buat `client_admin.js` (Bypass RLS dengan Service Role Key)
*   **Checklist: "Auth Routes & Actions"**
    *   [ ] UI Halaman Login & Registrasi
    *   [ ] Buat Handler `app/(auth)/auth/callback/route.js` (Pertukaran kode OTP/OAuth)
    *   [ ] Buat Middleware Next.js untuk memproteksi rute `(dashboard)`

---

## 💼 KELOMPOK 3: Fitur Admin (Dashboard)

### Card 4: Modul Manajemen Produk & Kategori
*   **Labels:** 🟣 `Admin Feature`
*   **Checklist: "Tampilan & Aksi"**
    *   [ ] UI Halaman Daftar Produk (`/admin/products`) dengan TanStack Table
    *   [ ] Server Action: CRUD Produk
    *   [ ] Server Action: Upload/Hapus Multi-Gambar ke Supabase Storage (`product_images`)
    *   [ ] Logika harga ganda: Input `fixed_prices` & `wholesale_prices`
    *   [ ] CRUD Kategori Produk

### Card 5: Modul Shop Decoration (CMS Landing Page)
*   **Labels:** 🟣 `Admin Feature`
*   **Checklist: "Kontrol Landing Page"**
    *   [ ] Server Action & UI: Upload/Hapus `lp_company_logos`
    *   [ ] Server Action & UI: Pengaturan Kategori Makanan (`lp_food_categories`)
    *   [ ] Server Action & UI: Daftar Layanan (`lp_service`)
    *   [ ] Server Action & UI: Statistik/Pengalaman (`lp_experience`)

### Card 6: Modul Transaksi & Laporan
*   **Labels:** 🟣 `Admin Feature`, 🟠 `Backend / Database`
*   **Checklist: "Keuangan & Analitik"**
    *   [ ] UI Daftar Pesanan (`/admin/orders`) dan Manajemen Status
    *   [ ] UI Riwayat Transaksi Seluruh Sistem (`/admin/transaction`)
    *   [ ] UI Saldo/Wallet (`/admin/wallet`)
    *   [ ] Halaman Laporan (`/admin/report`) dengan grafik `recharts`
    *   [ ] Halaman Ulasan Pelanggan (`/admin/reviews`)

### Card 7: Modul Bantuan & Pelanggan
*   **Labels:** 🟣 `Admin Feature`
*   **Checklist: "Support"**
    *   [ ] Halaman Daftar Pelanggan terdaftar (`/admin/customers`)
    *   [ ] Server Action & UI: CRUD `faq` & `faq_category`

---

## 🛒 KELOMPOK 4: Fitur Pelanggan (Customer Area)

### Card 8: Interaksi Pelanggan & Keranjang
*   **Labels:** 🟡 `Customer Feature`, 🟢 `Frontend / UIUX`
*   **Checklist: "E-Commerce Flow"**
    *   [ ] Halaman `(customer)/cart` (Kalkulasi harga grosir otomatis jika kuantitas mencukupi)
    *   [ ] Fungsionalitas Checkout (Pembuatan data pesanan)
    *   [ ] Halaman `(customer)/orders` (Melacak status pesanan pelanggan)
    *   [ ] UI Manajemen Dompet (Wallet) Pelanggan

---

## 🌐 KELOMPOK 5: Halaman Publik (Landing Pages)

### Card 9: Tampilan Publik & Informasi
*   **Labels:** 🔵 `Public Feature`, 🟢 `Frontend / UIUX`
*   **Checklist: "UI Rendering"**
    *   [ ] Integrasi *Shop Decoration* ke Landing Page utama (Tarik data dari SQL)
    *   [ ] Render UI Slider menggunakan `embla-carousel-react`
    *   [ ] Halaman Statis/Dinamis: `/tentang-kami` & `/about_us`
    *   [ ] Halaman Kemitraan: `/bekerja-sama`
    *   [ ] Halaman Katalog Publik: `/products` (Pencarian & Filter produk)
    *   [ ] Halaman Bantuan: `/faq` (Render dari database)
