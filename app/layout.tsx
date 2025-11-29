// Fix: Import React to make the 'React' namespace available.
import React from 'react';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content. - Course Hub",
  description: "A modern and visually appealing web application showcasing over 100 courses for digital creatives. The platform features course carousels, a testimonial section, a frequently asked questions area, and a powerful search functionality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-['Inter',_sans_serif] text-white min-h-screen relative bg-[#0a0f0e]`}>
        {children}
      </body>
    </html>
  );
}
