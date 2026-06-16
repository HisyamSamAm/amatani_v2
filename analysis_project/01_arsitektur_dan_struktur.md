# Audit Proyek Amatani: 01. Analisis Arsitektur & Struktur

Dokumen ini berisi analisis mendalam mengenai arsitektur, struktur proyek, pola desain (*design patterns*), serta alur hubungan antar-folder pada proyek **Amatani**. Analisis ini diperbarui untuk merefleksikan status migrasi dari layanan cloud Supabase ke **PostgreSQL Lokal (via pgAdmin)** dan **Vercel Storage/Blob**.

---

## 1. Arsitektur Utama & Pola Desain (Architectural & Design Patterns)

Proyek **Amatani** dibangun sebagai aplikasi web **Monolitik Full-Stack** menggunakan ekosistem **Next.js 15 (App Router)** dan **React 18**. Platform ini bertindak sebagai e-commerce pangan/peternakan yang memadukan rendering server (*Server-Side Rendering*) dengan performa tinggi.

Berikut adalah pola-pola desain utama yang diterapkan dalam proyek ini:

### A. Pola Pembagian Rute (Route Groups)
Aplikasi memanfaatkan fitur *Route Groups* (`(...)`) pada Next.js untuk mengelompokkan halaman berdasarkan hak akses dan tata letak (*layout*) tanpa memengaruhi struktur URL publik:
*   **`(auth)`**: Mengelompokkan modul autentikasi (login, signup, auth callback).
*   **`(dashboard)`**: Mengelompokkan panel kontrol administrasi khusus admin (`/admin`).
*   **`(public)`**: Mengelompokkan halaman yang dapat diakses oleh publik (landing page, katalog produk, FAQ) dan di dalamnya terdapat sub-grup **`(customer)`** untuk rute khusus pelanggan terautentikasi (keranjang belanja `/cart` dan daftar pesanan `/orders`).

### B. Pola Kontroler/Layanan Terisolasi (Server Actions v2)
Logika bisnis dan manipulasi database diisolasi secara terstruktur pada direktori [app/actions/v2](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/actions/v2).
*   Menggunakan instruksi `'use server'` untuk mendefinisikan fungsi yang dieksekusi secara eksklusif di sisi server.
*   Interaksi database menggunakan koneksi **PostgreSQL Lokal** langsung via driver `postgres` di [lib/postgres.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/lib/postgres.js) dengan kueri Raw SQL.
*   Pola ini bertindak sebagai *Service/Controller Layer* yang memisahkan logika query database dari komponen UI.

### C. Pola Hibrida: REST API & Server Actions Wrapper
Dalam direktori [app/api/v2](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/api/v2), proyek ini menggunakan pola pembungkus (*wrapper*). Rute API (*Route Handlers*) seperti [app/api/v2/(dashboard)/admin/products/route.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/api/v2/(dashboard)/admin/products/route.js) bertindak sebagai jembatan yang memanggil fungsi Server Actions dari `app/actions/v2`.
*   *Kelebihan:* Logika database tetap tunggal (DRY - *Don't Repeat Yourself*).
*   *Penggunaan:* Memungkinkan pemanggilan data baik melalui client-side `fetch` (melalui REST API endpoint) maupun pemanggilan Server Actions langsung dari server-rendered components.

### D. Pola Autentikasi & Otorisasi Terpusat (NextAuth.js v5)
Proyek ini mengadopsi **NextAuth.js v5 (Beta 31)** yang dikonfigurasi melalui:
*   [auth.config.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/auth.config.js): Mendefinisikan rute sign-in, strategi JWT, serta callback untuk menyisipkan `id` dan `role` pengguna ke dalam sesi token.
*   [auth.ts](file:///d:/PROYEK%20UNIVERSITAS/Amatani/auth.ts): Menginisialisasi `PostgresAdapter` dengan pool koneksi `pg` untuk mengelola sesi secara lokal, serta mendefinisikan `CredentialsProvider` dengan verifikasi password menggunakan `bcryptjs` langsung terhadap **tabel user manual di PostgreSQL Lokal**.
*   [middleware.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/middleware.js): Mengimplementasikan **Role-Based Access Control (RBAC)** di tingkat edge router untuk membatasi akses:
    *   `/admin/:path*` hanya untuk pengguna dengan `role === 'admin'`.
    *   `/cart`, `/orders/:path*`, `/profile/:path*` hanya untuk pengguna terautentikasi (non-admin).
    *   `/` (landing page) secara otomatis mengarahkan admin yang telah login ke `/admin`.

---

## 2. Struktur Folder & Modul

Berikut adalah visualisasi pohon struktur direktori proyek **Amatani** dengan keterangan status migrasi (**[BARU]** untuk PostgreSQL Lokal & Vercel Blob, dan **[LAMA / ELIMINASI]** untuk berkas sisa Supabase):

```text
Amatani/
├── .next/                                # Hasil kompilasi build Next.js
├── __tests__/                            # Berkas pengujian unit & integrasi (Jest)
├── _legacy_api_v1_backup/                # [LAMA / ELIMINASI] Backup kode v1 yang menggunakan Supabase Auth/Storage
├── analysis_project/                     # Laporan & berkas analisis audit
│   ├── 01_arsitektur_dan_struktur.md     # Dokumen ini (Analisis Arsitektur)
│   ├── 02_isi_file_dan_sintaks.md
│   ├── 03_teknologi_dan_fitur.md
│   └── 04_database_dan_tabel.md
├── app/                                  # Folder Utama Next.js App Router
│   ├── (auth)/                           # Route Group Autentikasi
│   │   ├── auth/callback/                # [LAMA / ELIMINASI] Callback OAuth/OTP Supabase (Harus dihapus)
│   │   ├── login/                        # [BARU] Halaman Login NextAuth Credentials
│   │   └── signup/                       # [BARU] Halaman Registrasi (Insert langsung ke PostgreSQL Lokal)
│   ├── (dashboard)/                      # Route Group Dashboard Admin
│   │   └── admin/                        # Panel Admin (/admin) beserta sub-fiturnya
│   ├── (public)/                         # Route Group Halaman Publik & Customer
│   │   ├── (customer)/                   # Rute khusus Customer terautentikasi (/cart, /orders)
│   │   ├── about_us/                     # Halaman Tentang Kami
│   │   ├── bekerja-sama/                 # Halaman Kemitraan
│   │   ├── faq/                          # Halaman FAQ Publik
│   │   ├── products/                     # Halaman Katalog Produk Publik
│   │   ├── tentang-kami/                 # Halaman Informasi
│   │   ├── layout.js                     # Layout publik (dengan Navbar & CartProvider)
│   │   └── page.js                       # Landing Page utama (/)
│   ├── actions/                          # Next.js Server Actions
│   │   └── v2/                           # Logika bisnis versi 2 (Aktif)
│   │       ├── auth/                     # [BARU] Registrasi/Autentikasi (Validasi manual tabel user lokal)
│   │       ├── customer/                 # Aksi Keranjang (Cart) Customer
│   │       ├── dashboard/                # [BARU] Aksi Admin (FAQ, Products dengan Vercel Blob, dll.)
│   │       └── public/                   # Aksi Landing Page & Produk Publik
│   ├── api/                              # Route Handlers (API Endpoints)
│   │   ├── auth/[...nextauth]/           # [BARU] Endpoint NextAuth.js
│   │   └── v2/                           # REST API Endpoints v2 (Wrapper Server Actions)
│   ├── fonts/                            # Aset Font Lokal
│   ├── globals.css                       # Style global Tailwind & Shadcn
│   ├── layout.js                         # Root layout aplikasi
│   ├── error.js                          # Penanganan error global
│   └── not-found.js                      # Penanganan halaman tidak ditemukan
├── components/                           # Komponen React (Reusable)
│   ├── auth/                             # Komponen terkait otorisasi (OauthLogin - [LAMA / ELIMINASI] jika memakai Supabase)
│   ├── dashboard/                        # Komponen khusus panel admin (Charts, Sidebars, Dialogs)
│   ├── public/                           # Komponen Halaman Publik & Customer (Navbar, Carousel, dsb.)
│   └── shadcnUi/                         # Komponen Dasar / Primitif Shadcn (Button, Dialog, Input, dll.)
├── hooks/                                # Custom React Hooks (use-toast, use-mobile)
├── lib/                                  # Utilitas & Library Config
│   ├── _legacy_supabase/                 # [LAMA / ELIMINASI] Folder inisialisasi Supabase Client & Middleware lama
│   ├── postgres.js                       # [BARU] Inisialisasi Postgres Client (Koneksi ke PostgreSQL Lokal / pgAdmin)
│   └── utils.js                          # Fungsi helper utilitas (Tailwind merge helper)
├── public/                               # Aset statis (Gambar, Ikon, Ilustrasi)
├── auth.config.js                        # [BARU] Konfigurasi NextAuth Shared Callbacks
├── auth.ts                               # [BARU] Inisialisasi NextAuth (Postgres Adapter + Credentials lokal)
├── middleware.js                         # Router Guard / Security Middleware
├── next.config.mjs                       # Konfigurasi Next.js (termasuk Vercel Blob domains)
├── package.json                          # Dependensi & script proyek
├── tailwind.config.js                    # Konfigurasi Tailwind CSS
└── components.json                       # Konfigurasi alias Shadcn UI
```

### Detail Penjelasan Hubungan Folder & Migrasi:

1.  **Sektor Database & Koneksi (PostgreSQL Lokal)**:
    *   Koneksi terpusat dikonfigurasi melalui [postgres.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/lib/postgres.js) yang mengambil `DATABASE_URL` dari berkas `.env` lokal (mengarah ke server PostgreSQL lokal, dikelola melalui pgAdmin).
    *   Folder [lib/_legacy_supabase](file:///d:/PROYEK%20UNIVERSITAS/Amatani/lib/_legacy_supabase) adalah **sisa kode lama** yang sebelumnya digunakan untuk inisialisasi Supabase SDK dan harus **dihapus sepenuhnya**.
2.  **Sektor Autentikasi (NextAuth & User Table Manual)**:
    *   Autentikasi baru dikelola di berkas root [auth.ts](file:///d:/PROYEK%20UNIVERSITAS/Amatani/auth.ts) dan [auth.config.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/auth.config.js). NextAuth menggunakan `PostgresAdapter` untuk menghubungkan sesi ke PostgreSQL lokal.
    *   Folder `app/(auth)/auth/callback/` dan komponen `components/public/customers/GetUser.js` yang memanfaatkan Supabase SSR Auth merupakan **dead code** dan **harus dieliminasi**.
3.  **Sektor Penyimpanan Media (Vercel Blob)**:
    *   Fitur penyimpanan gambar (misalnya pada penambahan produk baru) dialihkan dari Supabase Storage ke **Vercel Blob Storage** menggunakan pustaka `@vercel/blob` di dalam folder server actions [app/actions/v2/dashboard/admin/products/productsActions.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/actions/v2/dashboard/admin/products/productsActions.js).

---

## 3. Alur Hubungan & Navigasi Antar-Folder (Data & Control Flow)

Berikut adalah diagram alur bagaimana data dan kontrol mengalir di dalam aplikasi Amatani yang telah dimigrasi ketika terjadi sebuah aksi pengguna:

```mermaid
graph TD
    %% Nodes
    Client[Client Browser / Component] -->|1. Request / Interaksi| Middleware[middleware.js]
    
    subgraph Security Layer (NextAuth)
        Middleware -->|2. Validasi Sesi & Role| AuthJS[auth.ts / auth.config.js]
    end
    
    AuthJS -->|3. Diizinkan| RouteGroup{Route Groups}
    
    subgraph Next.js App Router
        RouteGroup -->|Admin| Dashboard[app/dashboard/admin]
        RouteGroup -->|Customer/Public| Public[app/public]
    end

    Dashboard -->|Pilihan A: Direct Action| ServerAction[app/actions/v2]
    Dashboard -->|Pilihan B: Fetch API| ApiV2[app/api/v2]
    Public -->|Pilihan A: Direct Action| ServerAction
    Public -->|Pilihan B: Fetch API| ApiV2

    ApiV2 -->|Wrap/Panggil| ServerAction
    
    subgraph Data & Storage Layer
        ServerAction -->|Query SQL| PostgresDB[(PostgreSQL Lokal via lib/postgres.js)]
        ServerAction -->|Upload/Delete Aset| BlobStorage[Vercel Blob Storage]
    end

    PostgresDB -->|Return Data| ServerAction
    BlobStorage -->|Aset URL| ServerAction
    ServerAction -->|Result| Client
```

### Penjelasan Alur Proses Utama:

1.  **Alur Navigasi & Keamanan (Router Guard)**:
    [middleware.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/middleware.js) bertindak sebagai gerbang keamanan. Middleware memanggil NextAuth untuk memverifikasi token sesi dan hak akses (`role`) yang diambil dari database PostgreSQL lokal. Jika tidak sah, pengguna diredireksi ke `/login` atau halaman utama.
2.  **Alur Pengambilan & Mutasi Data (Read & Write Flow)**:
    Setiap interaksi data pada halaman web (seperti menambahkan produk baru oleh Admin) diproses oleh Server Actions di `app/actions/v2`.
    *   File gambar dikirim ke storage menggunakan modul `@vercel/blob` (`put`).
    *   Tautan URL Vercel Blob yang dihasilkan bersama detail data produk disimpan ke database PostgreSQL lokal dalam satu transaksi `sql.begin(...)`.

---

## 4. Temuan Audit Awal & Rekomendasi Arsitektural

Berdasarkan analisis migrasi dan struktur kode di atas, berikut adalah catatan penting yang harus diperhatikan:

> [!IMPORTANT]
> **Pembersihan Kode Sisa Supabase (Urgent Cleanups):**
> *   Folder `lib/_legacy_supabase/` dan file-file di dalamnya (`client.js`, `server.js`, `client_admin.js`, `middleware.js`) harus segera dihapus agar tidak membingungkan pengembang.
> *   Berkas `app/(auth)/auth/callback/route.js` yang masih mengimpor `@/lib/supabase/server` harus dihapus karena sudah tidak relevan dengan otentikasi NextAuth Credentials.
> *   Hapus file `components/public/customers/GetUser.js` karena memicu instansiasi client Supabase lama.

> [!WARNING]
> **Konfigurasi Environment Variable:**
> *   Pastikan kredensial Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) telah dihilangkan dari file `.env` produksi.
> *   Kredensial database lokal (`DATABASE_URL`) dan Vercel Storage (`BLOB_READ_WRITE_TOKEN`) harus dipastikan terpasang dengan benar di lokal maupun lingkungan *deployment*.

> [!TIP]
> **Optimasi Server Actions:**
> Singkirkan perantara API Wrapper di `app/api/v2` secara bertahap dan ubah agar komponen Client memanggil Server Action secara langsung. Hal ini menyelaraskan arsitektur ke arah Next.js 15 native data fetching.
