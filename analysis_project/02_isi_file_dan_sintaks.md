# Audit Proyek Amatani: 02. Analisis Isi File & Sintaks

Dokumen ini berisi analisis detail mengenai kualitas sintaks, redundansi kode, dan keberadaan berkas usang (*legacy/dead code*) pada proyek **Amatani**. Laporan ini diperbarui dengan menyertakan sisa-sisa teknologi **Supabase** yang wajib dibersihkan sebagai bagian dari prioritas refaktorisasi setelah migrasi ke **PostgreSQL Lokal (pgAdmin)** dan **Vercel Storage/Blob**.

---

## 1. Analisis Kualitas Sintaks Secara Umum

Secara umum, penulisan sintaks di dalam proyek Amatani memiliki beberapa karakteristik berikut:

### A. Penggunaan Fitur Modern JavaScript (ES6+)
*   Hampir seluruh berkas menggunakan JavaScript modern dengan deklarasi variabel `const`/`let`, fungsi asinkronus (`async`/`await`), destructuring objek, serta operator penyebaran (*spread operator*).
*   Penanganan sesi asinkronus Next.js 15 pada fungsi `cookies()` telah diimplementasikan dengan benar menggunakan `await cookies()` (misalnya pada [server.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/lib/_legacy_supabase/server.js)).

### B. Keamanan Kueri SQL (SQL Injection Protection)
*   Integrasi kueri Raw SQL menggunakan driver `postgres` di [lib/postgres.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/lib/postgres.js) telah memanfaatkan *Tagged Template Literals* (`sql\``). 
*   Pola ini secara otomatis melakukan parameterisasi kueri (menggunakan *prepared statements* di tingkat driver), sehingga aplikasi terlindungi dari serangan **SQL Injection** tanpa memerlukan sanitasi input manual tambahan.

---

## 2. Redundansi Kode & Desain Fungsi (Redundancy Issues)

Terdapat redundansi arsitektural yang signifikan antara penulisan **Server Actions (v2)** dan **API Route Handlers (v2)**:

### A. Tanda Tangan Fungsi (Function Signatures) yang Salah
Sebagian besar berkas di dalam [app/actions/v2](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/actions/v2) dideklarasikan sebagai Server Actions (ditandai dengan `'use server'` di baris pertama), namun tanda tangan fungsinya meniru API Route Handler (menerima argumen `req` dan `{ params }`).

Sebagai contoh, perhatikan fungsi `GetProductAction` di [productsActions.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/actions/v2/dashboard/admin/products/productsActions.js):
```javascript
export async function GetProductAction(req, { params }) {
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('search');
    // ...
}
```
*   **Masalah:** Server Action dirancang untuk dipanggil seperti fungsi JavaScript biasa dari sisi client. Karena fungsi di atas memerlukan objek HTTP `Request` (`req`), fungsi ini **tidak dapat dipanggil langsung** dari Client Component.
*   **Akibat:** Pengembang terpaksa membuat Route Handler API terpisah untuk membungkus Server Action tersebut agar bisa dipanggil lewat `fetch` dari Client.

### B. Duplikasi Pemanggilan via API Wrapper
Pola ini menciptakan alur berbelit-belit yang tidak perlu:
1.  Client Component mengirimkan `fetch` HTTP ke API Route (misal: `/api/v2/customer/cart/[user_id]/quantity`).
2.  Route Handler di [route.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/api/v2/customer/cart/[user_id]/quantity/route.js) menerima request, mengekstrak JSON, dan memanggil Server Action `QuantityChangeCartCustomer`.
3.  Server Action mengeksekusi query database.

```text
[Client Component] --(fetch HTTP Request)--> [API Route Handler] --(Call Function)--> [Server Action] --> [Database]
```

**Rekomendasi Refaktorisasi:**
Ubah tanda tangan fungsi Server Action agar menerima parameter JavaScript biasa, sehingga Client Component dapat memanggil fungsi tersebut secara langsung:

*Sebelum Refaktor:*
```javascript
// app/actions/v2/customer/cartActions.js
export async function QuantityChangeCartCustomer({ cart_items_id, quantity, user_id }) { ... }
```

*Setelah Refaktor (Pola Bersih tanpa API Wrapper):*
```javascript
// Panggil langsung di Client Component (app/(public)/(customer)/cart/page.js)
import { QuantityChangeCartCustomer } from '@/app/actions/v2/customer/cartActions';

const updateQuantityInDatabase = async (id, newQuantity) => {
    const res = await QuantityChangeCartCustomer({ cart_items_id: id, quantity: newQuantity, user_id: userId });
    if (!res.success) toast.error("Failed to update quantity");
};
```
Dengan cara ini, seluruh folder `app/api/v2/` dapat dihapus sepenuhnya (kecuali rute otentikasi eksternal), menyederhanakan kode, dan mengurangi overhead jaringan HTTP.

---

## 3. Berkas Usang & Kode Mati (Legacy & Dead Code) - Sisa Supabase

Sebagai bagian dari transisi ke **PostgreSQL Lokal** dan **Vercel Storage**, berikut adalah daftar prioritas sisa kode Supabase yang **wajib dihapus**:

### A. Direktori `lib/_legacy_supabase/` (100% Dead Code)
Direktori ini berisi konfigurasi client Supabase lama yang tidak digunakan lagi:
*   [client.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/lib/_legacy_supabase/client.js): Inisialisasi client publik Supabase.
*   [client_admin.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/lib/_legacy_supabase/client_admin.js): Inisialisasi admin client Supabase.
*   [server.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/lib/_legacy_supabase/server.js): Helper server-side Supabase client.
*   [middleware.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/lib/_legacy_supabase/middleware.js): Middleware otentikasi lama.

### B. Berkas `components/public/customers/GetUser.js` (Dead Code)
Berkas [GetUser.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/components/public/customers/GetUser.js) mengekspor fungsi `GetUserCustomers()` yang menggunakan inisialisasi `@supabase/ssr`. Ini adalah sisa otentikasi lama dan harus dihapus karena data user sekarang didapat dari sesi NextAuth (`auth()`).

### C. Rute Callback OAuth Supabase di `app/(auth)/auth/callback/route.js`
Berkas ini berisi logika penanganan callback OAuth Supabase yang masih mengimpor `@/lib/supabase/server` (yang sudah tidak ada, sehingga memicu eror *Module not found*). File ini harus dihapus sepenuhnya seiring beralihnya sistem login ke NextAuth Credentials.

### D. Hardcoded URL Supabase Storage di Frontend (Potensi Bug Migrasi)
Pada beberapa komponen antarmuka yang merender gambar, terdapat kode fallback yang mengarah secara hardcoded ke Supabase Storage, contohnya:
*   **[products/page.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/%28public%29/products/page.js#L283-L285):**
    ```javascript
    src={imageSrc.startsWith('http') 
        ? imageSrc 
        : `https://xmlmcdfzbwjljhaebzna.supabase.co/storage/v1/object/public/${imageSrc}`}
    ```
*   **[admin/products/page.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/%28dashboard%29/admin/products/page.js#L118):**
    `https://xmlmcdfzbwjljhaebzna.supabase.co/storage/v1/object/public/${product.images[0]}`
*   **[(customer)/cart/page.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/%28public%29/%28customer%29/cart/page.js#L265):**
    `https://xmlmcdfzbwjljhaebzna.supabase.co/storage/v1/object/public/${item.product_images[0]?.image_path}`

*   **Masalah:** Meskipun URL Vercel Blob (yang diawali `http`) lolos dari penambahan prefiks Supabase, sisa kueri URL Supabase ini harus dibersihkan untuk menghindari ketergantungan pada CDN Supabase yang lama.
*   **Rekomendasi Refaktor:** Ubah agar sistem hanya menerima absolute URL dari Vercel Blob. Lakukan migrasi data pada tabel `product_images` agar semua path yang tersimpan sudah berupa URL absolut Vercel Blob, lalu hapus logika pembungkus URL Supabase di frontend.

### E. Direktori `_legacy_api_v1_backup/` (100% Dead Code)
Folder ini berisi salinan kode API v1 yang lama. Harus segera dihapus untuk merapikan repositori.

---

## 4. Potensi Masalah Kueri SQL & Kode Kotor

### A. Potensi Bug Polusi Nilai Null pada Pencarian FAQ
Pada berkas [faqActions.js](file:///d:/PROYEK%20UNIVERSITAS/Amatani/app/actions/v2/dashboard/admin/faq/faqActions.js) baris ke-48, ekspresi `ILIKE ${"%" + category + "%"}` dapat dievaluasi menjadi `ILIKE '%null%'` jika kategori tidak didefinisikan. Hal ini membatasi hasil kueri pencarian teks.

### B. Polusi Komentar Kode (Commented-out Code Blocks)
Banyak berkas aktif (seperti `faqActions.js` dan `productsActions.js`) yang masih menyisakan blok kode lama dalam komentar panjang. Ini mengganggu proses audit dan menurunkan kualitas keterbacaan kode.
