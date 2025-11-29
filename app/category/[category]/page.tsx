import { getSiteData } from '@/constants/api';
import ClientHomePage from '@/components/ClientHomePage';
import type { Metadata, ResolvingMetadata } from 'next'

// Force dynamic rendering to bypass Vercel's static cache
export const dynamic = 'force-dynamic';
 
type Props = {
  params: { category: string }
}
 
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const categoryKey = params.category
  const siteData = await getSiteData();
  const categoryInfo = siteData.softwarePillsData.find(p => 'category' in p && p.category === categoryKey);
  const categoryName = categoryInfo && 'name' in categoryInfo ? categoryInfo.name : categoryKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
 
  return {
    title: `${categoryName} Courses - Content.`,
    description: `Browse all courses in the ${categoryName} category.`,
  }
}

export default async function Category({ params }: { params: { category: string } }) {
  const { category } = params;
  const siteData = await getSiteData();

  // We wrap the page in ClientHomePage to provide theme context, search, etc.
  return (
    <ClientHomePage siteData={siteData} initialView={{ page: 'category', category }} />
  );
}