import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role; // Dapat bernilai 'admin', 'customer', atau undefined

    // console.log('Middleware NextAuth berjalan untuk rute:', nextUrl.pathname);
    // console.log('Status Login:', isLoggedIn, '| Role:', userRole);

    // Rute Auth (Login & Register) - Sesuai ACL SB001
    if (nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/signup')) {
        if (isLoggedIn) {
            console.log('Pengguna sudah login. Mengarahkan ke dashboard');
            return NextResponse.redirect(new URL(userRole === 'admin' ? '/admin' : '/', nextUrl));
        }
        return null; // Izinkan akses
    }

    // Rute Admin
    if (nextUrl.pathname.startsWith('/admin')) {
        if (!isLoggedIn) {
            console.log('Pengguna belum login. Mengarahkan ke /login');
            return NextResponse.redirect(new URL('/login', nextUrl));
        }
        if (userRole !== 'admin') {
            console.log('Pengguna bukan admin. Mengarahkan ke /');
            return NextResponse.redirect(new URL('/', nextUrl));
        }
        return null; // Izinkan akses
    }

    // Rute Customer (Keranjang, Profil, Pesanan)
    if (nextUrl.pathname.startsWith('/profile') || nextUrl.pathname.startsWith('/orders') || nextUrl.pathname.startsWith('/cart')) {
        if (!isLoggedIn) {
            console.log('Pengguna belum login. Mengarahkan ke /login');
            return NextResponse.redirect(new URL('/login', nextUrl));
        }
        if (userRole === 'admin') {
            console.log('Admin tidak boleh masuk ke rute customer. Mengarahkan ke /admin');
            return NextResponse.redirect(new URL('/admin', nextUrl));
        }
        return null; // Izinkan akses
    }

    // Rute Guest (Halaman Utama / Landing Page)
    if (nextUrl.pathname === '/') {
        if (isLoggedIn && userRole === 'admin') {
            console.log('Admin berada di halaman utama. Mengarahkan ke /admin');
            return NextResponse.redirect(new URL('/admin', nextUrl));
        }
        return null; // Izinkan akses (Guest dan Customer boleh masuk)
    }

    return null; // Izinkan rute lainnya
});

export const config = {
    matcher: [
        '/admin/:path*',
        '/profile/:path*',
        '/orders/:path*',
        '/cart',
        '/login',
        '/signup',
        '/',
    ],
};