"use server"

import sql from "@/lib/postgres";

export async function GetProductActionPublic({ search: searchQuery, category, sort, limit = 10, offset = 0 } = {}) {

    try {
        let query = sql`
            SELECT 
                p.id,
                p.name,
                p.description,
                p.stock,
                p.category_id,
                c.name,
                p.price_type,
                f.price,
                (
                    SELECT json_agg(json_build_object('min_quantity', w.min_quantity, 'max_quantity', w.max_quantity, 'price', w.price))
                    FROM wholesale_prices w
                    WHERE w.product_id = p.id
                ) AS wholesale_prices,
                (
                    SELECT json_agg(pi.image_path)
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                ) AS images,
                p.created_at
            FROM 
                products p
            LEFT JOIN 
                fixed_prices f ON p.id = f.product_id AND p.price_type = 'fixed'
            LEFT JOIN 
                categories c ON p.category_id = c.id
        `;

        // Menambahkan WHERE clause jika ada filter
        if (searchQuery && category) {
            query = sql`${query} 
                WHERE (p.name ILIKE ${'%' + searchQuery + '%'} 
                OR p.description ILIKE ${'%' + searchQuery + '%'}) 
                AND c.name ILIKE ${'%' + category + '%'}`;
        } else if (searchQuery) {
            query = sql`${query} 
                WHERE p.name ILIKE ${'%' + searchQuery + '%'} 
                OR p.description ILIKE ${'%' + searchQuery + '%'}`;
        } else if (category) {
            query = sql`${query} 
                WHERE c.name ILIKE ${'%' + category + '%'}`;
        }

        // Menambahkan ORDER BY clause
        if (sort === 'A-Z') {
            query = sql`${query} ORDER BY p.name ASC`;
        } else if (sort === 'Z-A') {
            query = sql`${query} ORDER BY p.name DESC`;
        } else if (sort === 'Newest') {
            query = sql`${query} ORDER BY p.created_at DESC`;
        } else if (sort === 'Oldest') {
            query = sql`${query} ORDER BY p.created_at ASC`;
        }

        // Menambahkan LIMIT dan OFFSET
        query = sql`${query} LIMIT ${limit} OFFSET ${offset}`;

        const products = await query;
        console.log("Query result:", products);
        return products;

    } catch (error) {
        console.error("Error fetching products:", error);
        return { error: "Failed to fetch products", details: error.message };
    }
}
export async function GetProductDetailActionCustomers({ product_id }) {
    try {
        const data = product_id;

        // Query untuk mendapatkan data produk berdasarkan kategori yang sesuai dengan query
        const result = await sql`
            SELECT 
                p.id,
                p.name,
                p.description,
                p.stock,
                p.category_id,
                c.name AS category_name,
                p.created_at,
                p.price_type,
                f.price AS fixed_price,
                (
                    SELECT json_agg(json_build_object('min_quantity', w.min_quantity, 'max_quantity', w.max_quantity, 'price', w.price))
                    FROM wholesale_prices w
                    WHERE w.product_id = p.id
                ) AS wholesale_prices,
                (
                    SELECT json_agg(pi.image_path)
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                ) AS images
            FROM 
                products p
            LEFT JOIN 
                fixed_prices f ON p.id = f.product_id AND p.price_type = 'fixed'
            LEFT JOIN 
                categories c ON p.category_id = c.id
            WHERE 
                p.id = ${data}
        `;

        console.log("Query result:", result);
        return result;
    } catch (error) {
        console.error("Error fetching product detail:", error);
        return { error: "Failed to fetch product detail", details: error.message };
    }
}