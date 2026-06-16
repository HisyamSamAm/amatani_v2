'use client';

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/shadcnUi/sheet";
import { AlignJustify, ShoppingCart, Globe } from "lucide-react";
import { Button } from "@/components/shadcnUi/button";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useCart } from "./CartContext";
import { signOut } from "next-auth/react";

export default function NavbarSheet({ isLoggedIn, scrolled }) {
    const pathname = usePathname(); // Mendapatkan URL saat ini
    const isRootPath = pathname === "/"; // Menentukan apakah halaman root
    const { cartCount } = useCart(); // Mengambil cartCount dari CartContext

    return (
        <Sheet>
            <SheetTrigger asChild >
                <AlignJustify
                    className={`block md:hidden cursor-pointer ${isRootPath && !scrolled ? "text-white" : "text-gray-950"
                        }`}
                />
            </SheetTrigger>
            <SheetContent side="right" className="w-[90%] max-w-md py-12 bg-white h-full flex flex-col justify-between">
                <div className="pt-4">
                    <SheetTitle className="sr-only">Menu</SheetTitle> {/* Add this line */}
                    {/* Conditional Rendering for Buttons */}
                    <div className="flex flex-col space-y-4">
                        {isLoggedIn ? (
                            <>
                                <Button className="bg-white border border-rose-600 text-gray-900 w-full rounded-md hover:bg-rose-100">
                                    <Link href="/profile" className="flex justify-center items-center py-2">
                                        Profile
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <div className="flex justify-between space-x-4">
                                <Button className="bg-rose-600 text-white w-full rounded-md hover:bg-rose-700">
                                    <Link href="/login">Masuk</Link>
                                </Button>
                                <Button className="bg-rose-600 text-white w-full rounded-md hover:bg-rose-700">
                                    <Link href="/signup">Daftar</Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Shopping Cart */}
                    <Link href="/cart" className="flex items-center mt-6 space-x-2 relative">
                        <div className="relative">
                            <ShoppingCart className="w-6 h-6 text-gray-950" />
                            {isLoggedIn && (
                                <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-rose-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className="text-gray-950">Keranjang</span>
                    </Link>

                    {/* Links */}
                    <div className="mt-6 space-y-4">
                        <Link href="/#" className="block text-gray-950 hover:underline">
                            Tentang Kami
                        </Link>
                        <Link href="/faq" className="block text-gray-950 hover:underline">
                            Pusat Bantuan
                        </Link>
                        <Link href="/bekerja-sama" className="block text-gray-950 hover:underline">
                            Bekerja Sama
                        </Link>
                    </div>

                    {/* Language Option */}
                    <div className="flex items-center mt-6 space-x-2">
                        <Globe className="w-6 h-6 text-gray-950" />
                        <span className="text-gray-950">Bahasa Indonesia</span>
                    </div>
                </div>

                {/* Logout Button */}
                {isLoggedIn && (

                    <Button type="button" className="bg-rose-600 text-white w-full rounded-md hover:bg-rose-700 mt-6" variant='link' onClick={() => signOut({ callbackUrl: '/' })}>
                        Log out
                    </Button>
                )}
            </SheetContent>
        </Sheet>
    );
}