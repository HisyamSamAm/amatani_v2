'use server';

import sql from "@/lib/postgres";
import { put, del } from "@vercel/blob";
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '@/lib/auth-check';

export async function GetFoodCategoriesAction() {
    await requireAdmin();
    try {
        const result = await sql`
            SELECT lp_food_categories.*, categories.name
            FROM lp_food_categories
            JOIN categories ON lp_food_categories.id = categories.id;
        `;
        return { success: true, data: result };
    } catch (error) {
        console.error('Error getting food categories:', error);
        return { success: false, error: error.message };
    }
}
export async function InsertFoodCategoriesAction(category_id, category_image) {
    await requireAdmin();
    try {
        if (!category_id || !category_image) {
            throw new Error("Category ID and category image are required");
        }

        // Generate a unique filename using UUID
        const fileName = `${uuidv4()}.${category_image.name.split('.').pop()}`;

        // Convert the file to a ReadableStream
        const stream = category_image.stream();

        // Upload the file to Vercel Blob
        const blob = await put(`lp/${fileName}`, category_image, {
            access: 'public',
        });

        const imagePath = blob.url;

        // Insert the image path and category id into the database
        const [result] = await sql`
            INSERT INTO lp_food_categories (category_id, image_path)
            VALUES (${category_id}, ${imagePath})
            RETURNING *;
        `;

        return { success: true, data: result };
    } catch (error) {
        console.error('Error inserting food category:', error);
        return { success: false, error: error.message };
    }
}
export async function DeleteFoodCategoriesAction(fc_id) {
    await requireAdmin();
    try {
        if (!fc_id) {
            throw new Error("Food category ID is required");
        }

        // Get the image path from the database
        const [category] = await sql`
            SELECT image_path FROM lp_food_categories
            WHERE id = ${fc_id};
        `;

        if (!category) {
            throw new Error('Food category not found');
        }

        // Delete the image from Vercel Blob
        await del(category.image_path);

        // Delete the image path from the database
        const result = await sql`
            DELETE FROM lp_food_categories
            WHERE id = ${fc_id}
            RETURNING *;
        `;

        return { success: true, data: result };
    } catch (error) {
        console.error('Error deleting food category:', error);
        return { success: false, error: error.message };
    }
}