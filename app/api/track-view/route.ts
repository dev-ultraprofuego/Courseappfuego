
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const SITE_DATA_DOC_ID = 'main';

        // 1. Fetch current stats
        const { data: fetched, error: fetchError } = await supabase
            .from('site_data')
            .select('data')
            .eq('id', SITE_DATA_DOC_ID)
            .single();

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        const siteData = fetched.data;
        const currentStats = siteData.stats || { totalViews: 0, dailyViews: {} };
        const today = new Date().toISOString().split('T')[0];

        // 2. Increment
        const newTotal = (currentStats.totalViews || 0) + 1;
        const todayCount = (currentStats.dailyViews?.[today] || 0) + 1;

        const newStats = {
            totalViews: newTotal,
            dailyViews: {
                ...currentStats.dailyViews,
                [today]: todayCount
            }
        };

        // Limit dailyViews object size (keep last 30 days) if needed, but for now let's just update
        const updatedData = {
            ...siteData,
            stats: newStats
        };

        // 3. Save back
        const { error: updateError } = await supabase
            .from('site_data')
            .update({ data: updatedData })
            .eq('id', SITE_DATA_DOC_ID);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
