import { notFound } from 'next/navigation';
import AdminClientPage from "@/components/AdminClientPage";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel - Content.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page({ params }: { params: { admin_path: string } }) {
    // This is the original, secure implementation.
    // It compares the URL path with the server-side environment variable.
    // If they don't match, it shows a standard 404 page.
    if (params.admin_path !== process.env.ADMIN_SECRET_PATH) {
        notFound();
    }
    
    // If the path is correct, render the client component for the admin panel.
    return <AdminClientPage />;
}