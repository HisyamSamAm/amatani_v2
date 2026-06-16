'use server';

import sql from '@/lib/postgres';
import bcrypt from 'bcryptjs';

export async function registerUser(formData) {
    try {
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');

        if (!name || !email || !password) {
            return { error: 'Semua kolom wajib diisi!' };
        }

        if (password.length < 6) {
            return { error: 'Password harus minimal 6 karakter!' };
        }

        // Cek apakah email sudah terdaftar
        const existingUsers = await sql`
            SELECT id FROM users WHERE email = ${email} LIMIT 1
        `;

        if (existingUsers.length > 0) {
            return { error: 'Email sudah terdaftar! Silakan gunakan email lain.' };
        }

        // Hash password menggunakan bcryptjs
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Masukkan user baru ke database (default role: 'customer')
        await sql`
            INSERT INTO users (name, email, password, role)
            VALUES (${name}, ${email}, ${hashedPassword}, 'customer')
        `;

        return { success: true };
    } catch (error) {
        console.error('Kesalahan saat mendaftar:', error);
        return { error: 'Terjadi kesalahan pada server. Silakan coba lagi.' };
    }
}
