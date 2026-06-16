'use server';

import sql from "@/lib/postgres";
import { put, del } from "@vercel/blob";
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '@/lib/auth-check';

export async function GetServiceAction() {
    await requireAdmin();
    try {
        const services = await sql`SELECT * FROM lp_service`;
        return { success: true, data: services };
    } catch (error) {
        console.error("Error fetching services:", error);
        return { success: false, error: "Failed to fetch services" };
    }
}

export async function InsertServiceAction(serviceName, image) {
    await requireAdmin();
    try {
        if (!serviceName || !image) {
            throw new Error("Service name and image are required");
        }

        // Generate a unique filename using UUID
        const fileName = `${uuidv4()}.${image.name.split('.').pop()}`;

        // Convert the file to a ReadableStream
        const stream = image.stream();

        // Upload the file to Vercel Blob
        const blob = await put(`lp/${fileName}`, image, {
            access: 'public',
        });

        const imagePath = blob.url;

        // Insert the image path and service name into the database
        const [result] = await sql`
            INSERT INTO lp_service (name, image_path)
            VALUES (${serviceName}, ${imagePath})
            RETURNING *;
        `;

        return { success: true, data: result };
    } catch (error) {
        console.error('Error inserting service:', error);
        return { success: false, error: error.message };
    }
}

export async function DeleteServiceAction(id) {
    await requireAdmin();
    try {
        if (!id) {
            throw new Error("Service ID is required");
        }

        // Get the image path from the database
        const [service] = await sql`
            SELECT image_path FROM lp_service
            WHERE id = ${id};
        `;

        if (!service) {
            throw new Error('Service not found');
        }

        // Delete the image from Vercel Blob
        await del(service.image_path);

        // Delete the service from the database
        const result = await sql`
            DELETE FROM lp_service
            WHERE id = ${id}
            RETURNING *;
        `;

        return { success: true, data: result };
    } catch (error) {
        console.error('Error deleting service:', error);
        return { success: false, error: error.message };
    }
}