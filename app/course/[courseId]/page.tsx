import { getSiteData } from '@/constants/api';
import ClientHomePage from '@/components/ClientHomePage';
import type { Metadata, ResolvingMetadata } from 'next'

// Force dynamic rendering to bypass Vercel's static cache
export const dynamic = 'force-dynamic';
 
type Props = {
  params: { courseId: string }
}
 
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = parseInt(params.courseId, 10);
  const siteData = await getSiteData();
  const course = siteData.coursesData.find(c => c.id === id);
 
  if (!course) {
    return {
      title: 'Course Not Found',
    }
  }
 
  return {
    title: `${course.title} - Content.`,
    description: course.description || `Learn about ${course.title}.`,
  }
}

export default async function Course({ params }: { params: { courseId: string } }) {
  const courseId = parseInt(params.courseId, 10);
  const siteData = await getSiteData();
  
  return (
    // Fix: Added showBuyButton to the initialView prop to match the 'View' type definition.
    <ClientHomePage siteData={siteData} initialView={{ page: 'course', courseId, showBuyButton: true }} />
  );
}