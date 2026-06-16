"use server";

import sql from "@/lib/postgres";
import { auth } from "@/auth";

/**
 * @description Menghitung total produk unik di dalam keranjang berdasarkan user_id.
 * @param {Object} { user_id } - Objek yang berisi user_id.
 * @returns {Promise<{success: boolean, data?: number, error?: any}>} Objek yang berisi status keberhasilan, jumlah produk unik jika berhasil, atau pesan error jika gagal.
 */
export async function GetCountCartCustomers({ user_id }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };
        user_id = session.user.id;
        // Query untuk menghitung total produk unik di dalam keranjang berdasarkan user_id
        const result = await sql`
            SELECT
                COUNT(DISTINCT ci.id) AS total_products
            FROM carts c
            LEFT JOIN carts_items ci ON ci.cart_id = c.id
            WHERE c.user_id = ${user_id}
            LIMIT 1;
        `;

        // Jika tidak ada keranjang, kembalikan 0
        if (result.length === 0) {
            return {
                success: true,
                data: 0
            };
        }

        // Ambil total_products dari baris pertama
        return {
            success: true,
            data: result[0].total_products
        };
    } catch (error) {
        console.error("Error GetCountCartCustomers:", error);
        return {
            success: false,
            error: "Failed to get cart count",
            details: error.message
        };
    }
}


/**
 * @description Mengambil data keranjang berdasarkan user_id.
 * @param {Object} { user_id } - Objek yang berisi user_id.
 * @returns {Promise<{success: boolean, data?: any, error?: any}>} Objek yang berisi status keberhasilan, data keranjang jika berhasil, atau pesan error jika gagal.
 */
export async function GetCartActionCustomers({ user_id }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };
        user_id = session.user.id;

        const result = await sql`
            SELECT
                c.id,
                c.user_id,
                c.created_at,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', ci.id,
                            'product_id', ci.product_id,
                            'quantity', ci.quantity,
                            'item_created_at', ci.created_at,
                            'name', p.name,
                            'stock', p.stock,
                            'price_type', p.price_type,
                            'fixed_price',
                                (
                                    SELECT fp.price
                                    FROM fixed_prices fp
                                    WHERE fp.product_id = p.id
                                    LIMIT 1
                                ),
                            'wholesale_prices',
                                (
                                    SELECT JSON_AGG(
                                        JSON_BUILD_OBJECT(
                                            'id', wp.id,
                                            'min_quantity', wp.min_quantity,
                                            'max_quantity', wp.max_quantity,
                                            'price', wp.price
                                        )
                                    )
                                    FROM wholesale_prices wp
                                    WHERE wp.product_id = p.id
                                ),
                            'product_images',
                                (
                                    SELECT JSON_AGG(
                                        JSON_BUILD_OBJECT(
                                            'id', pi.id,
                                            'image_path', pi.image_path
                                        )
                                    )
                                    FROM product_images pi
                                    WHERE pi.product_id = p.id
                                )
                        )
                    ) FILTER (WHERE ci.id IS NOT NULL),
                    '[]'
                ) AS items
            FROM carts c
            LEFT JOIN carts_items ci ON ci.cart_id = c.id
            LEFT JOIN products p ON p.id = ci.product_id
            WHERE c.user_id = ${user_id}
            GROUP BY c.id, c.user_id, c.created_at
            LIMIT 1;
        `;

        if (result.length === 0) {
            return { success: true, data: null };
        }

        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error GetCartActionCustomers:", error);
        return { success: false, error: "Failed to get cart", details: error.message };
    }
}

/**
 * @description Menghapus item dari keranjang berdasarkan id dan user_id.
 * @param {Object} { id, user_id } - Objek yang berisi id dan user_id.
 * @returns {Promise<{success: boolean, message?: string, error?: any}>} Objek yang berisi status keberhasilan, pesan jika berhasil, atau pesan error jika gagal.
 */
export async function DeleteCartItemCustomer({ id, user_id }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };
        user_id = session.user.id;
        const result = await sql`
            DELETE FROM carts_items
            WHERE id = ${id}
            AND cart_id IN (SELECT id FROM carts WHERE user_id = ${user_id})
            RETURNING *;
        `;

        if (result.length === 0) {
            return { success: false, message: "Item not found or not authorized to delete" };
        }

        return { success: true, message: "Item deleted successfully" };
    } catch (error) {
        console.error("Error DeleteCartItemCustomer:", error);
        return { success: false, error: "Failed to delete cart item", details: error.message };
    }
}

/**
 * @description Mengubah kuantitas item di dalam keranjang berdasarkan id, quantity, dan user_id.
 * @param {Object} { id, quantity, user_id } - Objek yang berisi id, quantity, dan user_id.
 * @returns {Promise<{success: boolean, message?: string, data?: any, error?: any}>} Objek yang berisi status keberhasilan, pesan jika berhasil, data item yang diubah jika berhasil, atau pesan error jika gagal.
 */
export async function QuantityChangeCartCustomer({ id, quantity, user_id }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };
        user_id = session.user.id;
        const result = await sql`
            UPDATE carts_items
            SET quantity = ${quantity}
            WHERE id = ${id}
            AND cart_id IN (SELECT id FROM carts WHERE user_id = ${user_id})
            RETURNING *;
        `;

        if (result.length === 0) {
            return { success: false, message: "Item not found or not authorized to update" };
        }

        return { success: true, message: "Quantity updated successfully", data: result[0] };
    } catch (error) {
        console.error("Error QuantityChangeCartCustomer:", error);
        return { success: false, error: "Failed to update quantity", details: error.message };
    }
}

export async function AddToCartCustomers({ product_id, quantity, user_id }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };
        user_id = session.user.id;

        // Check if cart exists for user
        let cart = await sql`
            SELECT id 
            FROM carts 
            WHERE user_id = ${user_id}
            LIMIT 1;
        `;

        // If no cart exists, create new cart
        if (cart.length === 0) {
            cart = await sql`
                INSERT INTO carts (user_id)
                VALUES (${user_id})
                RETURNING id;
            `;
        }

        // Check if product_id already exists in carts_items
        let cartItem = await sql`
            SELECT * 
            FROM carts_items 
            WHERE cart_id = ${cart[0].id} 
            AND product_id = ${product_id}
            LIMIT 1;
        `;

        if (cartItem.length > 0) {
            // Update quantity if product_id exists
            cartItem = await sql`
                UPDATE carts_items
                SET quantity = quantity + ${quantity}
                WHERE cart_id = ${cart[0].id}
                AND product_id = ${product_id}
                RETURNING *;
            `;
        } else {
            // Insert new product_id and quantity if not exists
            cartItem = await sql`
                INSERT INTO carts_items (
                    cart_id,
                    product_id,
                    quantity
                )
                VALUES (
                    ${cart[0].id},
                    ${product_id},
                    ${quantity}
                )
                RETURNING *;
            `;
        }



        return {
            success: true,
            data: {
                user_id,
                ...cartItem[0]
            }
        };
    } catch (error) {

        return { success: false, error: error.message };
    }
}
