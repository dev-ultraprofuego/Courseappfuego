'use server';

import { createClient } from '@supabase/supabase-js';
import type { SiteData } from '@/types';

const SITE_DATA_DOC_ID = 'main';

// Helper function to initialize the Supabase admin client
const getSupabaseAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase server credentials are not configured.');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
};


export async function updateSiteDataAction(newData: SiteData): Promise<{ success: boolean; error?: string }> {
    try {
        const supabaseAdmin = getSupabaseAdminClient();
        const { error } = await supabaseAdmin
            .from('site_data')
            .upsert({ id: SITE_DATA_DOC_ID, data: newData });

        if (error) {
            console.error("Supabase server-side upsert error:", error.message);
            return { success: false, error: error.message };
        }

        return { success: true };

    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred.';
        console.error("Failed to save to Supabase via server action:", errorMessage);
        return { success: false, error: errorMessage };
    }
}

export async function uploadCourseImageAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const supabaseAdmin = getSupabaseAdminClient();
        const file = formData.get('file') as File;

        if (!file) {
            return { success: false, error: 'No file provided.' };
        }

        const filePath = `course-images/${Date.now()}-${file.name.replace(/\s/g, '_')}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from('course-images')
            .upload(filePath, file);

        if (uploadError) {
            console.error("Supabase upload error:", uploadError.message);
            return { success: false, error: uploadError.message };
        }

        const { data } = supabaseAdmin.storage
            .from('course-images')
            .getPublicUrl(filePath);

        if (!data.publicUrl) {
            return { success: false, error: 'Could not get public URL for the uploaded file.' };
        }

        return { success: true, url: data.publicUrl };

    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred during upload.';
        console.error("Upload server action error:", errorMessage);
        return { success: false, error: errorMessage };
    }
}