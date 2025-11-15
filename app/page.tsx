import { getSiteData } from '@/constants/api';
import ClientHomePage from '@/components/ClientHomePage';
import type { Metadata } from 'next';

// Force dynamic rendering to bypass Vercel's static cache
export const dynamic = 'force-dynamic';

// This metadata can be dynamic if needed
export const metadata: Metadata = {
  title: 'Content. - All The Courses You Need',
  description: 'Access courses in Ecommerce, SMMA, Copywriting, SaaS, UX/UI from top instructors and creators in one place.',
};

export default async function Home() {
  const siteData = await getSiteData();

  return <ClientHomePage siteData={siteData} />;
}