"use server";

import sql from "@/lib/postgres";
import { requireAdmin } from "@/lib/auth-check";

export async function GetFaqAction({ category, search } = {}) {
    await requireAdmin();
    try {
        let faqs;
        if (category) {
            // Modify the query to filter by category_id instead of name
            faqs = await sql`
                  SELECT
                      f.id,
                      f.title,
                      f.content,
                      c.id as category_id,
                      c.name,
                      f.created_at
                  FROM faq f
                  LEFT JOIN faq_category c ON f.category_id = c.id
                  WHERE f.category_id = ${category}
                  ORDER BY f.created_at DESC
              `;
        } else if (search) {
            faqs = await sql`
                  SELECT
                      f.id,
                      f.title,
                      f.content,
                      c.id as category_id,
                      c.name,
                      f.created_at
                  FROM faq f
                  LEFT JOIN faq_category c ON f.category_id = c.id
                  WHERE (f.title ILIKE ${"%" + search + "%"} OR f.content ILIKE ${"%" + search + "%"
                } OR c.name ILIKE ${"%" + search + "%"})
                  ORDER BY f.created_at DESC
              `;
        } else {
            faqs = await sql`
                  SELECT
                      f.id,
                      f.title,
                      f.content,
                      c.id as category_id,
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

export async function GetFaqByIdAction(faq_id) {
    await requireAdmin();
    try {

        const [faq] = await sql`
            SELECT
                f.id,
                f.title,
                f.content,
                f.category_id,
                c.name,
                f.created_at
            FROM
                public.faq f
            LEFT JOIN
                public.faq_category c
            ON
                f.category_id = c.id
            WHERE
                f.id = ${faq_id};
        `;
        return faq;
    } catch (error) {
        console.error("Error fetching FAQ for edit:", error);
        return { error: "Failed to fetch FAQ", error };
    }
}

export async function InsertFaqAction(formData) {
    await requireAdmin();
    const title = formData.get('title');
    const content = formData.get('content');
    const category_id = formData.get('category_id');



    try {
        const result = await sql.begin(async (sql) => {
            const [faq] = await sql`
                INSERT INTO faq (
                    title,
                    content,
                    category_id
                ) VALUES (
                    ${title},
                    ${content},
                    ${category_id}
                )
                RETURNING *;
            `;
            return faq;
        });
        return result;
    } catch (error) {
        console.error("Error inserting FAQ:", error);
        return { error: "Failed to insert FAQ", error };
    }
}

export async function DeleteFaqAction(faq_id) {
    await requireAdmin();
    try {



        const result = await sql`delete from faq where id = ${faq_id} returning *`;
        return result;
    } catch (error) {
        console.error("Error deleting FAQ:", error);
        return { error: "Failed to delete FAQ", error };
    }
}

export async function UpdateFaqByIdAction(faq_id, formData) {
    await requireAdmin();
    const title = formData.get('title');
    const content = formData.get('content');
    const category_id = formData.get('category_id');




    if (!title || !content || !category_id) {
        throw new Error("Invalid input: all fields are required");
    }
    if (!faq_id) {
        throw new Error("Invalid input: faq_id is required");

    }

    try {
        const result = await sql.begin(async (sql) => {
            const [updatedFaq] = await sql`
                UPDATE faq 
                SET 
                    title = ${title},
                    content = ${content},
                    category_id = ${category_id}
                WHERE 
                    id = ${faq_id}
                RETURNING *
            `;
            console.log("Updated FAQ:", updatedFaq);
            return updatedFaq;
        });

        if (!result) {
            console.log("No FAQ updated");
            throw new Error("FAQ not found or not updated");
        }

        return result;
    } catch (error) {
        console.error("Error updating FAQ:", error);
        return { error: "Failed to update FAQ", error };
    }
}