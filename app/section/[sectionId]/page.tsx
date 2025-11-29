import { getSiteData } from '@/constants/api';
import ClientHomePage from '@/components/ClientHomePage';
import type { Metadata, ResolvingMetadata } from 'next'

// Force dynamic rendering to bypass Vercel's static cache
export const dynamic = 'force-dynamic';
 
type Props = {
  params: { sectionId: string }
}
 
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const sectionId = params.sectionId;
  const siteData = await getSiteData();
  const section = siteData.homepageSections.find(s => s.id === sectionId);
 
  if (!section) {
    return {
      title: 'Section Not Found',
    }
  }
 
  return {
    title: `${section.title} - Content.`,
    description: `Browse all courses in the ${section.title} collection.`,
  }
}

export default async function Section({ params }: { params: { sectionId: string } }) {
  const { sectionId } = params;
  const siteData = await getSiteData();
  
  return (
    <ClientHomePage siteData={siteData} initialView={{ page: 'section', sectionId }} />
  );
}