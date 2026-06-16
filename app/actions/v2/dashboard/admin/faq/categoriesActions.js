'use server';

import sql from "@/lib/postgres";
import { requireAdmin } from "@/lib/auth-check";

// Fetch all FAQ categories
export async function GetCategoriesFaqAction() {
    await requireAdmin();
    try {
        const categories = await sql`SELECT id, name, created_at FROM faq_category;`;
        return categories;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return { error: "Failed to fetch categories" };
    }
}

// Delete an FAQ category by ID
export async function DeleteCategoriesFaqAction(category_id) {
    await requireAdmin();
    try {

        const result = await sql`DELETE FROM faq_category WHERE id = ${category_id} RETURNING *`;
        return result;
    } catch (error) {
        console.error("Error deleting category:", error);
        return { error: "Failed to delete category" };
    }
}

// Insert a new FAQ category by name
export async function InsertCategoriesFaqAction(name) {
    await requireAdmin();
    try {
        console.log('Inserting category:', name);
        const result = await sql`INSERT INTO faq_category (name) VALUES (${name}) RETURNING *`;
        return result;
    } catch (error) {
        console.error("Error inserting category:", error);
        return { error: "Failed to insert category" };
    }
}