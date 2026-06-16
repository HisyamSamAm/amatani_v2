'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart, Globe } from "lucide-react";
import NavbarSheet from "@/components/public/customers/Navbar/Sheet";
import { Button } from "@/components/shadcnUi/button";
import CategoryMenu from "./CategoryMenu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/shadcnUi/hover-card";
import { usePathname } from 'next/navigation';
import Image from "next/image";
import { useCart } from "./CartContext";
import { signOut } from "next-auth/react";

export default function Navbar({ isAuthenticated }) {

    const [scrolled, setScrolled] = useState(false);
    const [isRootPath, setIsRootPath] = useState(false);
    const pathname = usePathname();
    const { userId, cartCount, fetchCartCount } = useCart()
    console.log("🚀 ~ Navbar ~ cartCount:", cartCount)
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > window.innerHeight * 0.1);
        };

        // Set isRootPath based on pathname
        setIsRootPath(pathname === "/");
        // Handle second-level navbar visibility
        if (pathname === '/products') {
            setIsRootPath(false);
        }

        // Add scroll event listener
        window.addEventListener("scroll", handleScroll);
        window.scrollTo(0, 0);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [pathname]);
    useEffect(() => {
        if (isAuthenticated && userId) {
            fetchCartCount(userId)
        }
    }, [isAuthenticated, userId, fetchCartCount])

    // Class untuk teks di navbar
    const textClass = isRootPath && !scrolled ? "text-white" : "text-gray-950";
    // Class untuk background navbar
    const navbarClass = isRootPath
        ? scrolled
            ? "bg-white shadow-md"
            : "bg-transparent"
        : "bg-white shadow-md";

    return (
        <header
            className={`w-full  mx-auto z-50 transition-all duration-300 px-4 md:px-16 ${isRootPath ? "fixed" : "relative"} ${navbarClass}`}
        >
            <div className="max-w-full container mx-auto flex items-center justify-between py-4">
                {/* Logo */}
                <Link href="/">
                    <div className="flex items-center space-x-4">
                        <Image
                            src="/FE/IconAmatani.svg"
                            alt="Logo AMATANI"
                            width={42}
                            height={42}
                        />
                        <span className={`font-bold text-lg ${textClass}`}>
                            AMATANI
                        </span>
                    </div>
                </Link>

                {/* Icon dan Button */}
                <div className="flex items-center space-x-4">
                    {/* Bahasa */}
                    <HoverCard openDelay={0} closeDelay={100}>
                        <HoverCardTrigger asChild>
                            <div className={`hidden md:flex items-center space-x-1 cursor-pointer ${textClass}`}>
                                <Globe className="w-5 h-5" />
                                <span className="text-sm">Bahasa</span>
                            </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="p-2 w-40 bg-white rounded-md shadow-md">
                            <Button className="w-full text-left text-gray-950 bg-white hover:bg-rose-100 hover:outline hover:outline-2 hover:outline-rose-600">
                                Bahasa Indonesia 🇮🇩
                            </Button>
                            <Button className="w-full text-left text-gray-950 mt-4 bg-white hover:bg-rose-100 hover:outline hover:outline-2 hover:outline-rose-600">
                                Bahasa Inggris 🇺🇸
                            </Button>
                        </HoverCardContent>
                    </HoverCard>

                    {/* cart */}
                    <Link href="/cart" className="relative">
                        <ShoppingCart className={`w-5 h-5 ${textClass}`} />
                        {isAuthenticated && (
                            <span className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Auth Buttons */}
                    {isAuthenticated ? (
                        <Button onClick={() => signOut({ callbackUrl: '/' })} className="hidden md:block bg-rose-600 text-white rounded-md hover:bg-rose-700">
                            Logout
                        </Button>
                    ) : (
                        <>
                            <Button className="hidden md:block bg-white text-gray-950 outline-rose-600 hover:bg-gray-200">
                                <Link href="/login">Masuk</Link>
                            </Button>
                            <Button className="hidden md:block bg-rose-600 text-white hover:bg-rose-700">
                                <Link href="/signup">Daftar</Link>
                            </Button>
                        </>
                    )}

                    {/* Sheet Trigger */}
                    <NavbarSheet isLoggedIn={isAuthenticated} scrolled={scrolled} />
                </div>
            </div>

            {/* Tingkatan 2 - Hanya tampil jika di root path */}
            {(isRootPath || (pathname !== '/' && pathname !== '/products')) && (
                <div className="hidden md:flex max-w-full container mx-auto items-center justify-between pb-4 text-sm">
                    <CategoryMenu isRootPath={isRootPath && !scrolled} />
                    <div className="flex items-center space-x-6">
                        <Link className={`hover:underline ${textClass}`} href="/tentang-kami">
                            Tentang Kami
                        </Link>
                        <Link className={`hover:underline ${textClass}`} href="/faq">
                            Pusat Bantuan
                        </Link>
                        <Link className={`hover:underline ${textClass}`} href="/bekerja-sama">
                            Bekerja Sama
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}