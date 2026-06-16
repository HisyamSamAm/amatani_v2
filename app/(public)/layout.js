import Navbar from "@/components/public/customers/Navbar/Navbar";
import { Suspense } from "react";
import { auth } from "@/auth";

import { CartProvider } from "@/components/public/customers/Navbar/CartContext";
import { GetCountCartCustomers } from "@/app/actions/v2/customer/cartActions";

export default async function RootLayout({ children }) {
    const session = await auth();
    const isAuthenticated = !!session;
    const user_id = session?.user?.id;
    
    let initialCartCount = 0

    if (isAuthenticated && user_id) {
        // Lakukan pemanggilan aksi server-side langsung
        const res = await GetCountCartCustomers({ user_id });
        if (res.success) {
            initialCartCount = res.data;
        }
    }
    return (
        <>
            <CartProvider initialCartCount={initialCartCount} initialUserId={user_id}>
                <Navbar isAuthenticated={isAuthenticated} user_id={user_id} />
                <main>{children}</main>
            </CartProvider>
        </>
    );
}
