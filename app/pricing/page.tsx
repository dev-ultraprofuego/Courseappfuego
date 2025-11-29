import { getSiteData } from '@/constants/api';
import type { Metadata } from 'next'
import ClientHomePage from '@/components/ClientHomePage';

// Force dynamic rendering to bypass Vercel's static cache
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Pricing - Content.',
    description: 'Choose the best subscription plan for your needs.',
}

export default async function Pricing() {
    const siteData = await getSiteData();

    return (
        <ClientHomePage siteData={siteData} initialView={{ page: 'pricing' }} />
    );
}