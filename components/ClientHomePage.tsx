'use client';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import BackToTopButton from './BackToTopButton';
import SearchOverlay from './SearchOverlay';
import HomePage from './HomePage';
import CategoryPage from './CategoryPage';
import CourseDetailPage from './CourseDetailPage';
import PricingPage from './PricingPage';
import SectionPage from './SectionPage';
import DmcaPageComponent from './DmcaPageComponent';
import { notFound } from 'next/navigation';
import type { SiteData, Theme, View } from '../types';

interface ClientHomePageProps {
  siteData: SiteData;
  // Fix: Use the correct 'View' type for initialView.
  initialView?: View;
}

const ClientHomePage: React.FC<ClientHomePageProps> = ({ siteData, initialView }) => {
  const [theme, setTheme] = useState<Theme>('iris');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
        const savedTheme = localStorage.getItem('content-theme') as Theme | null;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    } catch (e) {}
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    try {
        localStorage.setItem('content-theme', newTheme);
    } catch(e) {}
  };

  const renderCurrentView = () => {
    let view: View | null = null;
    
    if (initialView) {
        view = initialView;
    } else if (pathname === '/') {
        view = { page: 'home' };
    }
    
    // Fix: Removed onNavigate prop from HomePage call as it's no longer needed.
    if (!view) return <HomePage data={siteData} theme={theme} />;

    switch (view.page) {
        case 'home':
            // Fix: Removed onNavigate prop from HomePage call as it's no longer needed.
            return <HomePage data={siteData} theme={theme} />;
        case 'category':
            // Fix: Removed onNavigate prop from CategoryPage call as it's no longer needed.
            return <CategoryPage category={view.category} allCourses={siteData.coursesData} pills={siteData.softwarePillsData} categoryCourseLinks={siteData.categoryCourseLinks} theme={theme} config={siteData.config} />;
        case 'course':
            const course = siteData.coursesData.find(c => c.id === view.courseId);
            if (!course) {
                notFound();
                return null;
            }
            // Fix: Removed onNavigate prop from CourseDetailPage call as it's no longer needed.
            return <CourseDetailPage course={course} allCourses={siteData.coursesData} theme={theme} showBuyButton={true} buyLink={siteData.config.contactLinkUrl} buyButtonText={siteData.config.defaultBuyButtonText} config={siteData.config} />;
        case 'pricing':
            return <PricingPage theme={theme} tiers={siteData.pricingTiers} />;
        case 'section':
             // Fix: Removed onNavigate prop from SectionPage call as it's no longer needed.
             return <SectionPage sectionId={view.sectionId} allCourses={siteData.coursesData} homepageSections={siteData.homepageSections} theme={theme} config={siteData.config} />;
        case 'dmca':
             return <DmcaPageComponent theme={theme} config={siteData.config} />;
        default:
            // Fix: Removed onNavigate prop from HomePage call as it's no longer needed.
            return <HomePage data={siteData} theme={theme} />;
    }
  };

  return (
    <div className={`theme-${theme} font-sans`}>
      <Header
        onSearchOpen={() => setIsSearchOpen(true)}
        theme={theme}
        setTheme={handleSetTheme}
        config={siteData.config}
      />
      <main>
        {renderCurrentView()}
      </main>
      <Footer theme={theme} />
      <BackToTopButton theme={theme} />
      {/* Fix: Removed onNavigate prop from SearchOverlay call as it's no longer needed. */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        theme={theme}
        courses={siteData.coursesData}
        config={siteData.config}
      />
    </div>
  );
};

export default ClientHomePage;