'use server';

import sql from "@/lib/postgres";
import { requireAdmin } from '@/lib/auth-check';


export async function GetExperiencesAction() {
    await requireAdmin();
    try {
        const experiences = await sql`SELECT * FROM lp_experience`;
        return { success: true, data: experiences };
    } catch (error) {
        console.error("Error fetching experiences:", error);
        return { success: false, error: "Failed to fetch experiences" };
    }
}
export async function InsertExperienceAction(number, description) {
    await requireAdmin();
    try {
        if (!number || !description) {
            throw new Error("Number and description are required");
        }
        const result =
            await sql`insert into lp_experience (number, description) values(${number}, ${description}) returning *`;
        return { success: true, data: result };
    } catch (error) {
        console.error("Error inserting experience:", error);
        return { success: false, error: error.message };
    }
}

export async function DeleteExperienceAction(id) {
    await requireAdmin();
    try {
        const result =
            await sql`delete from lp_experience where id = ${id} returning *`;
        if (result.length === 0) {
            return { success: false, message: "Experience not found" };
        }
        return { success: true, data: result };
    } catch (error) {
        console.error("Error deleting experience:", error);
        return { success: false, error: "Failed to delete experience" };
    }
}