"use server";

import sql from "@/lib/postgres";

export async function GetFaqActionPublic({ category, search } = {}) {

    try {
        let faqs;
        if (category && search) {
            // Cari FAQ berdasarkan kategori dan kata kunci pencarian
            faqs = await sql`
                SELECT
                    f.id,
                    f.title,
                    f.content,
                    c.id,
                    c.name,
                    f.created_at
                FROM faq f
                LEFT JOIN faq_category c ON f.category_id = c.id
                WHERE c.name ILIKE ${'%' + category + '%'}
                  AND (f.title ILIKE ${'%' + search + '%'} OR f.content ILIKE ${'%' + search + '%'})
                ORDER BY f.created_at DESC
            `;
        } else if (category) {
            // Cari FAQ berdasarkan kategori
            faqs = await sql`
                SELECT
                    f.id,
                    f.title,
                    f.content,
                    c.id,
                    c.name,
                    f.created_at
                FROM faq f
                LEFT JOIN faq_category c ON f.category_id = c.id
                WHERE c.name ILIKE ${'%' + category + '%'}
                ORDER BY f.created_at DESC
            `;
        } else if (search) {
            // Cari FAQ berdasarkan kata kunci pencarian
            faqs = await sql`
                SELECT
                    f.id,
                    f.title,
                    f.content,
                    c.id,
                    c.name,
                    f.created_at
                FROM faq f
                LEFT JOIN faq_category c ON f.category_id = c.id
                WHERE (f.title ILIKE ${'%' + search + '%'} OR f.content ILIKE ${'%' + search + '%'})
                ORDER BY f.created_at DESC
            `;
        } else {
            // Ambil semua FAQ
            faqs = await sql`
                SELECT
                    f.id,
                    f.title,
                    f.content,
                    c.id,
                    c.name,
                    f.created_at
                FROM faq f
                LEFT JOIN faq_category c ON f.category_id = c.id
                ORDER BY f.created_at DESC
            `;
        }
        return faqs;
    } catch (error) {
        console.error("Error fetching FAQs:", error);
        return { error: "Failed to fetch FAQs", error };
    }
}