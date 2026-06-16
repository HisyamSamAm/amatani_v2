'use client'
import { createContext, useContext, useState } from 'react'
import { GetCountCartCustomers } from '@/app/actions/v2/customer/cartActions'

const CartContext = createContext()

export function CartProvider({ children, initialCartCount = 0, initialUserId = null }) {
    const [cartCount, setCartCount] = useState(initialCartCount)
    const [userId, setUserId] = useState(initialUserId)

    async function fetchCartCount(uid) {
        try {
            const res = await GetCountCartCustomers({ user_id: uid });
            if (!res.success) {
                throw new Error(res?.error || 'Failed to fetch cart count');
            }
            setCartCount(res.data || 0);
        } catch (error) {
            console.error('Error fetchCartCount:', error);
        }
    }

    return (
        <CartContext.Provider
            value={{
                userId,
                setUserId,
                cartCount,
                setCartCount,
                fetchCartCount,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    return useContext(CartContext)
}