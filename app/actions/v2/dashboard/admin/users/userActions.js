'use server'

import sql from '@/lib/postgres';
import { revalidatePath } from 'next/cache';
import bcryptjs from 'bcryptjs';
import { requireAdmin } from '@/lib/auth-check';

export async function getAllUsers() {
    await requireAdmin();
    try {
        const users = await sql`
            SELECT id, name, email, role, "emailVerified", image 
            FROM users 
            ORDER BY name ASC
        `;
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Gagal mengambil data pelanggan');
    }
}

export async function deleteUserAction(userId) {
    await requireAdmin();
    try {
        await sql`DELETE FROM users WHERE id = ${userId}`;
        revalidatePath('/admin/customers');
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        throw new Error('Gagal menghapus pelanggan');
    }
}

export async function updateUserAction(userId, name, email, role) {
    await requireAdmin();
    try {
        if (!userId || !name || !email || !role) {
            throw new Error('Semua field wajib diisi');
        }

        // Cek apakah email sudah dipakai user lain
        const existing = await sql`
            SELECT id FROM users WHERE email = ${email} AND id != ${userId}
        `;
        if (existing.length > 0) {
            return { success: false, error: 'Email sudah digunakan oleh pengguna lain' };
        }

        const [updated] = await sql`
            UPDATE users
            SET name = ${name}, email = ${email}, role = ${role}
            WHERE id = ${userId}
            RETURNING id, name, email, role
        `;

        revalidatePath('/admin/customers');
        return { success: true, data: updated };
    } catch (error) {
        console.error('Error updating user:', error);
        return { success: false, error: error.message || 'Gagal memperbarui pengguna' };
    }
}

export async function resetUserPasswordAction(userId, newPassword) {
    await requireAdmin();
    try {
        if (!userId || !newPassword || newPassword.length < 6) {
            return { success: false, error: 'Password minimal 6 karakter' };
        }
        const hashed = await bcryptjs.hash(newPassword, 10);
        await sql`UPDATE users SET password = ${hashed} WHERE id = ${userId}`;
        revalidatePath('/admin/customers');
        return { success: true };
    } catch (error) {
        console.error('Error resetting password:', error);
        return { success: false, error: 'Gagal mereset password' };
    }
}

export async function getDashboardStatsAction() {
    await requireAdmin();
    try {
        const [totalUsersResult] = await sql`SELECT COUNT(*) AS count FROM users`;
        const [totalProductsResult] = await sql`SELECT COUNT(*) AS count FROM products`;
        const [totalCartsResult] = await sql`SELECT COUNT(*) AS count FROM carts_items`;
        const [totalStockResult] = await sql`SELECT COALESCE(SUM(stock), 0) AS total FROM products`;

        return {
            success: true,
            data: {
                totalUsers: parseInt(totalUsersResult.count),
                totalProducts: parseInt(totalProductsResult.count),
                totalCartItems: parseInt(totalCartsResult.count),
                totalStock: parseInt(totalStockResult.total),
            }
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { success: false, error: 'Gagal mengambil statistik dashboard' };
    }
}

export async function getRecentUsersAction() {
    await requireAdmin();
    try {
        const users = await sql`
            SELECT id, name, email, role, "emailVerified"
            FROM users
            ORDER BY "emailVerified" DESC NULLS LAST, name ASC
            LIMIT 5
        `;
        return { success: true, data: users };
    } catch (error) {
        console.error('Error fetching recent users:', error);
        return { success: false, error: 'Gagal mengambil data pengguna terbaru' };
    }
}
