# Access Control List (ACL) - User Acceptance Test

**Nama Aplikasi**: Amatani 
**Test Type**: User Acceptance Test 
**Level**: E2E UI Acceptance Test
**Auth / Role**: Admin, Merchant (Customer), Guest
**URL**: *Isi URL*
**Person in Charge**: Hisyam
**Test Phase**: All/modul

### 1. Otentikasi (SB001)

| Role | ACL | Expected Result (if checked) | Expected Result (if unchecked) | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Guest | Registrasi | User dapat mengakses halaman daftar dan membuat akun merchant baru | User akan dialihkan kembali jika sudah terautentikasi (login) | Tested | Di isi oleh QA |
| Guest | Login | User dapat login dan dialihkan ke dashboard | Pesan error muncul jika kredensial salah | Tested | - |
| Guest | Logout | User dapat logout, cookie terhapus, dialihkan ke login | Tombol logout tidak muncul jika belum login | Tested | - |

### 2. Dasbor Induk (AQ002)

| Role | ACL | Expected Result (if checked) | Expected Result (if unchecked) | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Merchant | Dashboard Merchant | User dapat melihat navigasi dan menu dasbor | Menu dasbor hilang dari navigasi, dan otomatis dialihkan ke login | Tested | Di isi oleh QA |
| Admin | Dashboard Admin | Admin dapat melihat navigasi global platform | Menu admin hilang dan akses link langsung dialihkan ke unauthorized | Tested | - |

### 3. Manajemen Entitas & Konten (PR003)

| Role | ACL | Expected Result (if checked) | Expected Result (if unchecked) | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Admin | Kelola Produk (`/admin/products`) | Admin dapat melihat, tambah, edit, hapus produk | Jika bukan admin (Guest/Customer) akan ditolak/dialihkan | Untested | - |
| Admin | Kelola CMS (`/admin/shop_decoration`) | Admin dapat mengubah logo, service, kategori dll | Akses ditolak dan dialihkan ke login atau homepage | Untested | - |
| Admin | Kelola Bantuan (`/admin/faq`) | Admin dapat mengatur FAQ aplikasi | Akses ditolak dan dialihkan ke login atau homepage | Untested | - |
| Admin | Kelola Ulasan (`/admin/reviews`) | Admin dapat moderasi ulasan pelanggan | Akses ditolak | Untested | - |
| Admin | Daftar Pelanggan (`/admin/customers`) | Admin dapat melihat seluruh daftar user/customer | Akses ditolak | Untested | - |

### 4. Manajemen Keuangan & Operasional (TR004)

| Role | ACL | Expected Result (if checked) | Expected Result (if unchecked) | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Admin | Kelola Pesanan (`/admin/orders`) | Admin dapat melihat dan mengubah status pesanan | Jika bukan admin akan ditolak/dialihkan | Untested | - |
| Admin | Riwayat Transaksi (`/admin/transaction`) | Admin dapat memantau seluruh transaksi masuk/keluar | Akses ditolak | Untested | - |
| Admin | Saldo Platform (`/admin/wallet`) | Admin dapat melihat wallet global platform | Akses ditolak | Untested | - |
| Admin | Laporan (`/admin/report`) | Admin dapat melihat grafik dan laporan analitik | Akses ditolak | Untested | - |

### 5. E-Commerce Flow (CT005)

| Role | ACL | Expected Result (if checked) | Expected Result (if unchecked) | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Merchant | Keranjang Belanja (`/cart`) | Customer dapat melihat, menambah, memodifikasi item | Guest dialihkan ke login. Admin dipaksa ke dashboard admin | Untested | - |
| Merchant | Pesanan Saya (`/orders`) | Customer dapat melihat histori pesanannya sendiri | Guest dialihkan ke login. Admin dilarang melihat riwayat customer spesifik | Untested | - |
| Merchant | Profil Pengguna (`/profile`) | Customer dapat mengedit info alamat & profil | Guest dialihkan ke login. Admin dilarang akses | Untested | - |

### 6. Halaman Publik (PB006)

| Role | ACL | Expected Result (if checked) | Expected Result (if unchecked) | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Guest | Landing Page (`/`) | User dapat membaca informasi company dan CTA | Admin akan otomatis diarahkan ke dashboard admin (`/admin`) | Untested | - |
| Guest | Katalog Produk (`/products`) | User bisa mencari dan melihat detail produk publik | Admin dapat melihatnya juga (atau di redirect) | Untested | - |
| Guest | Info Perusahaan (`/tentang-kami`) | User dapat membaca detail perusahaan | Admin dapat melihatnya juga | Untested | - |
| Guest | Kemitraan (`/bekerja-sama`) | User dapat mengisi form kemitraan (jika ada) | Admin dapat melihatnya juga | Untested | - |

---
*Catatan: Sesuai struktur aplikasi Amatani, "Merchant" di sini bisa merujuk pada "Customer" yang memiliki akses ke dashboard khusus di rute `(dashboard)/(customer)`.*
