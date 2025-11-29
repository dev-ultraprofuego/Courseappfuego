'use server';

import { createClient } from '@supabase/supabase-js';
import { unstable_noStore as noStore } from 'next/cache';
import type { SiteData, Testimonial, ReviewToken } from '@/types';

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

export async function deleteMediaFileAction(fileUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabaseAdmin = getSupabaseAdminClient();
        
        // Extract path from URL
        // Format: .../storage/v1/object/public/course-images/filename.jpg
        const urlObj = new URL(fileUrl);
        const pathParts = urlObj.pathname.split('/course-images/');
        
        if (pathParts.length < 2) {
             return { success: false, error: "Format d'URL invalide" };
        }
        
        const filePath = pathParts[1]; // This should be the path inside the bucket

        const { error } = await supabaseAdmin.storage
            .from('course-images')
            .remove([filePath]);

        if (error) {
            console.error("Supabase storage delete error:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("Exception in deleteMediaFileAction:", error);
        return { success: false, error: "Erreur lors de la suppression du fichier physique." };
    }
}

/* 
   ==========================================================================
   REVIEW TOKEN SYSTEM (SQL MIGRATION)
   
   Uses dedicated 'review_tokens' table to prevent Race Conditions on the JSON blob.
   ==========================================================================
*/

export async function generateReviewTokenAction(): Promise<{ success: boolean; token?: string; error?: string }> {
    noStore(); // Opt out of caching
    console.log("SERVER: Starting Review Token Generation (SQL Table Mode)...");
    
    try {
        const supabaseAdmin = getSupabaseAdminClient();
        
        // 1. Generate New Token
        const tokenPart1 = Math.random().toString(36).substring(2, 15);
        const tokenPart2 = Math.random().toString(36).substring(2, 15);
        const newTokenString = tokenPart1 + tokenPart2;
        
        // 2. Insert into dedicated SQL table 'review_tokens'
        const { error: insertError } = await supabaseAdmin
            .from('review_tokens')
            .insert({ 
                token: newTokenString,
                used: false
            });

        if (insertError) {
            console.error("SERVER ERROR: SQL Insert failed for token:", insertError);
            return { success: false, error: "Erreur DB (Table manquante ?): " + insertError.message };
        }

        console.log("SERVER SUCCESS: Token generated in SQL Table:", newTokenString);
        return { success: true, token: newTokenString };

    } catch (error) {
        console.error("SERVER EXCEPTION: generateReviewTokenAction:", error);
        return { success: false, error: "Erreur lors de la génération du lien." };
    }
}

export async function validateReviewTokenAction(token: string): Promise<{ valid: boolean }> {
    noStore(); // Opt out of caching
    const sanitizedToken = token.trim();
    console.log(`[DEBUG] Validating token (SQL): '${sanitizedToken}'`);

    try {
        const supabaseAdmin = getSupabaseAdminClient();
        
        // Check directly in the SQL table
        const { data, error } = await supabaseAdmin
            .from('review_tokens')
            .select('token, used')
            .eq('token', sanitizedToken)
            .single();

        if (error || !data) {
            console.log("[DEBUG] Token not found in SQL table or error:", error?.message);
            return { valid: false };
        }

        if (data.used) {
             console.log("[DEBUG] Token exists but is marked USED.");
             return { valid: false };
        }

        console.log("[DEBUG] Token is VALID and UNUSED.");
        return { valid: true };
    } catch (error) {
        console.error("[DEBUG] Exception validating token:", error);
        return { valid: false };
    }
}

export async function submitTestimonialAction(testimonial: Testimonial, token: string): Promise<{ success: boolean; error?: string }> {
    noStore(); // Opt out of caching
    try {
        const supabaseAdmin = getSupabaseAdminClient();
        
        // 1. Verify Token in SQL Table (Security Check)
        const { data: tokenData, error: tokenError } = await supabaseAdmin
            .from('review_tokens')
            .select('used')
            .eq('token', token)
            .single();

        if (tokenError || !tokenData) {
            return { success: false, error: "Lien invalide ou introuvable." };
        }

        if (tokenData.used) {
            return { success: false, error: "Ce lien a déjà été utilisé." };
        }

        // 2. Add Testimonial to site_data (JSON Storage for content)
        // Note: We still fetch the full JSON to append content, but the TOKEN logic is now safe.
        const { data: fetched, error: fetchError } = await supabaseAdmin
            .from('site_data')
            .select('data')
            .eq('id', SITE_DATA_DOC_ID)
            .single();

        if (fetchError || !fetched) {
            return { success: false, error: "Impossible de récupérer les données du site." };
        }

        const currentData = fetched.data as SiteData;
        
        const newTestimonial: Testimonial = { 
            ...testimonial, 
            status: 'pending',
            source: 'external',
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            date: new Date().toISOString()
        };
        
        const existingTestimonials = currentData.testimonials || [];
        const updatedTestimonials = [newTestimonial, ...existingTestimonials];

        // Add Log
        const newLog = {
            id: Date.now().toString(),
            action: 'TESTIMONIAL_SUBMIT',
            details: `${testimonial.author}|Témoignage > Avis (Public)`,
            timestamp: new Date().toISOString(),
            user: 'Public User'
        };
        const existingLogs = currentData.auditLogs || [];
        const updatedLogs = [newLog, ...existingLogs].slice(0, 200);

        // Save Content Data
        const { error: updateError } = await supabaseAdmin
            .from('site_data')
            .update({ 
                data: { 
                    ...currentData, 
                    testimonials: updatedTestimonials,
                    auditLogs: updatedLogs
                } 
            })
            .eq('id', SITE_DATA_DOC_ID);

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        // 3. Mark Token as USED in SQL Table (Consume the token)
        const { error: consumeError } = await supabaseAdmin
            .from('review_tokens')
            .update({ used: true })
            .eq('token', token);
            
        if (consumeError) {
            console.error("Failed to mark token as used:", consumeError);
            // We don't fail the user request here because the testimonial was saved successfully.
        }

        return { success: true };

    } catch (error) {
        console.error("Exception in submitTestimonialAction:", error);
        return { success: false, error: "Erreur serveur lors de la soumission." };
    }
}

export async function getPublicSystemConfigAction(): Promise<{ showTypingAnimation: boolean }> {
    noStore(); // Opt out of caching
    try {
        const supabaseAdmin = getSupabaseAdminClient();
        const { data: fetched } = await supabaseAdmin
            .from('site_data')
            .select('data')
            .eq('id', SITE_DATA_DOC_ID)
            .single();

        if (fetched && fetched.data && fetched.data.config) {
            return {
                showTypingAnimation: !!fetched.data.config.showTypingAnimation
            };
        }
        return { showTypingAnimation: false };
    } catch (e) {
        return { showTypingAnimation: false };
    }
}