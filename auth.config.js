export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  providers: [], // Providers akan ditambahkan di auth.ts
  callbacks: {
    async jwt({ token, user }) {
      // Jika login berhasil (objek user tersedia), simpan ID dan role ke dalam token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Tulis ulang role dan ID ke dalam objek session agar bisa diakses di Frontend/Middleware
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  }
};
