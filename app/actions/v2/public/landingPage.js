"use server"

import sql from "@/lib/postgres";

export async function GetCategoriesActionPublic() {
    try {
        const categories = await sql`SELECT * FROM categories`;
        return { success: true, data: categories };
    } catch (error) {
        console.error("Error fetching categories:", error);
        return { success: false, error: "Failed to fetch categories" };
    }
}
export async function GetExperiencesActionPublic() {
    try {
        const experiences = await sql`SELECT * FROM lp_experience`;
        return { success: true, data: experiences };
    } catch (error) {
        console.error("Error fetching experiences:", error);
        return { success: false, error: "Failed to fetch experiences" };
    }
}
export async function GetCompanyLogosActionPublic() {
    try {
        const result = await sql`
            SELECT * FROM lp_company_logos;
        `;
        return { success: true, data: result };
    } catch (error) {
        console.error('Error getting company logos:', error);
        return { success: false, error: error.message };
    }
}




export async function GetAllProductPublic() {

    try {
        const result = await sql`
            SELECT 
                c.id,
                c.name,
                (
                    SELECT json_agg(
                        json_build_object(
                            'product_id', p.id,
                            'name', p.name,
                            'description', p.description,
                            'stock', p.stock,
                            'created_at', p.created_at,
                            'price_type', p.price_type,
                            'fixed_price', f.price,
                            'wholesale_prices', (
                                SELECT json_agg(
                                    json_build_object(
                                        'min_quantity', w.min_quantity,
                                        'max_quantity', w.max_quantity,
                                        'price', w.price
                                    )
                                )
                                FROM wholesale_prices w
                                WHERE w.product_id = p.id
                            ),
                            'images', (
                                SELECT json_agg(pi.image_path)
                                FROM product_images pi
                                WHERE pi.product_id = p.id
                            )
                        )
                    )
                    FROM products p
                    LEFT JOIN fixed_prices f ON p.id = f.product_id AND p.price_type = 'fixed'
                    WHERE p.category_id = c.id
                ) AS products
            FROM categories c
            ORDER BY c.id
        `;
        // console.log("🚀 ~ GetAllProductPublic ~ result:", result)
        return { success: true, data: result };
    } catch (error) {
        console.error("Database connection failed:", error);
        return { success: false, error: "Failed to fetch all products", details: error.message };
    }
}
export async function GetKategoriPanganActionPublic() {
    try {
        const result = await sql`
            SELECT 
                lfc.id,
                lfc.image_path,
                c.id,
                c.name
            FROM lp_food_categories lfc
            JOIN categories c ON lfc.category_id = c.id;
        `;
        // console.log("🚀 ~ GetKategoriPanganActionPublic ~ result:", result);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error getting categories:', error);
        return { success: false, error: "Failed to fetch categories", details: error.message };
    }
}
export async function GetServiceActionPublic() {
    try {
        const result = await sql`
            SELECT * FROM lp_service;
        `;
        // console.log("🚀 ~ GetServiceActionPublic ~ result:", result);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error getting service:', error);
        return { success: false, error: "Failed to fetch services", details: error.message };
    }
}