'use server'

import sql from "@/lib/postgres";
import { requireAdmin } from "@/lib/auth-check";



// http://localhost:3000/api/dashboard/products/categories
export async function GetCategoriesAction() {
    await requireAdmin();
    try {
        const categories = await sql`SELECT * FROM categories`;
        return { success: true, data: categories };
    } catch (error) {
        console.error("Error fetching categories:", error);
        return { success: false, error: "Failed to fetch categories" };
    }
}

// http://localhost:3000/api/dashboard/products/categories/delete/(id_categories)
export async function DeleteCategoryAction(category_id) {
    await requireAdmin();
    try {
        const result = await sql`delete from categories where id = ${category_id} returning *`;
        if (result.length === 0) {
            return { success: false, message: "Category not found" };
        }
        return { success: true, data: result };
    } catch (error) {
        console.error("Error deleting category:", error);
        return { success: false, error: "Failed to delete category" };
    }
}


// http://localhost:3000/api/dashboard/products/categories/insert
// form = name: sayuran
export async function InsertCategoryAction(name) {
    await requireAdmin();
    try {
        if (!name) {
            throw new Error("Category name is required");
        }
        const result = await sql`insert into categories (name) values(${name}) returning *`;
        return { success: true, data: result };
    } catch (error) {
        console.error("Error inserting category:", error);
        return { success: false, error: error.message };
    }
}