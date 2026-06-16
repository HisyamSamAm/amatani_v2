'use server';

import sql from '@/lib/postgres';
import { requireAdmin } from '@/lib/auth-check';

/**
 * Mengambil semua item keranjang beserta detail produk dan info pemilik.
 * Digunakan sebagai pengganti tabel orders yang belum ada.
 */
export async function getAllCartOrdersAction() {
    await requireAdmin();
    try {
        const rows = await sql`
            SELECT
                ci.id,
                ci.quantity,
                ci.created_at,
                p.id AS product_id,
                p.name,
                p.stock,
                p.price_type,
                u.id        AS user_id,
                u.name      AS user_name,
                u.email     AS user_email,
                COALESCE(fp.price, 0) AS unit_price
            FROM carts_items ci
            JOIN carts c         ON ci.cart_id   = c.id
            JOIN users u         ON c.user_id    = u.id
            JOIN products p      ON ci.product_id = p.id
            LEFT JOIN fixed_prices fp ON p.id = fp.product_id
            ORDER BY ci.created_at DESC
        `;
        return { success: true, data: rows };
    } catch (error) {
        console.error('Error fetching cart orders:', error);
        return { success: false, error: 'Gagal mengambil data pesanan' };
    }
}

/**
 * Menghapus sebuah item dari keranjang (admin action).
 */
export async function deleteCartItemAction(cartItemId) {
    await requireAdmin();
    try {
        await sql`DELETE FROM carts_items WHERE id = ${cartItemId}`;
        return { success: true };
    } catch (error) {
        console.error('Error deleting cart item:', error);
        return { success: false, error: 'Gagal menghapus item' };
    }
}

/**
 * Statistik ringkas untuk dashboard orders:
 * - Total item di semua keranjang
 * - Total nilai produk di keranjang (berdasarkan fixed_price)
 * - Jumlah pengguna yang punya keranjang aktif
 */
export async function getOrderSummaryAction() {
    await requireAdmin();
    try {
        const [summary] = await sql`
            SELECT
                COUNT(ci.id)         AS total_items,
                COUNT(DISTINCT c.user_id)        AS active_users,
                COALESCE(SUM(ci.quantity * COALESCE(fp.price, 0)), 0) AS total_value
            FROM carts_items ci
            JOIN carts c         ON ci.cart_id    = c.id
            JOIN products p      ON ci.product_id = p.id
            LEFT JOIN fixed_prices fp ON p.id = fp.product_id
        `;
        return { success: true, data: summary };
    } catch (error) {
        console.error('Error fetching order summary:', error);
        return { success: false, error: 'Gagal mengambil ringkasan pesanan' };
    }
}
