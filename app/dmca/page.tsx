import { getSiteData } from '@/constants/api';
import ClientHomePage from '@/components/ClientHomePage';
import type { Metadata } from 'next';

// Force dynamic rendering to bypass Vercel's static cache
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'DMCA Policy - Content.',
  description: 'DMCA Policy for Content.',
};

export default async function DmcaPage() {
  const siteData = await getSiteData();

  return <ClientHomePage siteData={siteData} initialView={{ page: 'dmca' }} />;
}