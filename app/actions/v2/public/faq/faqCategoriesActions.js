"use server";

import sql from "@/lib/postgres";

export async function GetCategoriesFaqActionPublic() {

    try {
        const categories = await sql`SELECT id, name, created_at FROM faq_category;`;
        return categories;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return { error: "Failed to fetch categories", error };
    }
}