import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import PostgresAdapter from "@auth/pg-adapter"
import { Pool } from "pg"
import sql from "@/lib/postgres"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PostgresAdapter(pool),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@contoh.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Cari pengguna berdasarkan email
          const users = await sql`SELECT * FROM users WHERE email = ${credentials.email} LIMIT 1`;
          const user = users[0];

          if (!user || !user.password) {
            return null; // Pengguna tidak ditemukan atau tidak memiliki password
          }

          // Verifikasi kecocokan password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null; // Password salah
          }

          // Kembalikan objek pengguna jika valid
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role, // Pastikan role ikut dikembalikan
          };
        } catch (error) {
          console.error("Kesalahan otorisasi:", error);
          return null;
        }
      }
    })
  ]
})
