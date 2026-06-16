'use server';

import sql from "@/lib/postgres";
import { put, del } from "@vercel/blob";
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '@/lib/auth-check';

export async function InsertCompanyLogoAction(logo) {
    await requireAdmin();
    try {
        if (!logo) {
            throw new Error("Logo image is required");
        }

        // Generate a unique filename using UUID
        const fileName = `${uuidv4()}.${logo.name.split('.').pop()}`;

        // Convert the file to a ReadableStream
        const stream = logo.stream();

        // Upload the file to Vercel Blob
        const blob = await put(`lp/${fileName}`, logo, {
            access: 'public',
        });

        const imagePath = blob.url;

        // Insert the image path into the database
        const [result] = await sql`
            INSERT INTO lp_company_logos (image_path)
            VALUES (${imagePath})
            RETURNING *;
        `;

        return { success: true, data: result };
    } catch (error) {
        console.error('Error inserting company logo:', error);
        return { success: false, error: error.message };
    }
}
export async function GetCompanyLogosAction() {
    await requireAdmin();
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

export async function DeleteCompanyLogoAction(id) {
    await requireAdmin();
    try {
        if (!id) {
            throw new Error("Company logo ID is required");
        }

        // Get the image path from the database
        const [logo] = await sql`
            SELECT image_path FROM lp_company_logos
            WHERE id = ${id};
        `;

        if (!logo) {
            throw new Error('Logo not found');
        }

        // Delete the image from Vercel Blob
        await del(logo.image_path);

        // Delete the image path from the database
        const result = await sql`
            DELETE FROM lp_company_logos
            WHERE id = ${id}
            RETURNING *;
        `;

        return { success: true, data: result };
    } catch (error) {
        console.error('Error deleting company logo:', error);
        return { success: false, error: error.message };
    }
}