
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
import FeatherIcon from './FeatherIcon';

interface ClientHomePageProps {
  siteData: SiteData;
  // Fix: Use the correct 'View' type for initialView.
  initialView?: View;
}

const MaintenanceScreen: React.FC<{ theme: Theme; message?: string }> = ({ theme, message }) => {
    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center px-4 font-sans relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
             <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 bg-[#111413] border border-white/5 shadow-2xl animate-pulse`}>
                <FeatherIcon name="loader" size={40} className={theme === 'iris' ? 'text-teal-500' : 'text-red-500'} />
             </div>
             <h1 className="text-5xl font-black text-white mb-3 tracking-tight font-heading">Maintenance</h1>
             <h2 className="text-2xl font-bold text-white/80 mb-6 font-heading tracking-wide uppercase">Coming Soon</h2>
             <p className="text-gray-500 text-lg max-w-md leading-relaxed">
                {message || "Nous mettons à jour la plateforme pour vous offrir une meilleure expérience. Nous serons de retour très vite."}
             </p>
             <div className="mt-10 flex gap-2 text-xs font-bold text-gray-600 uppercase tracking-widest font-heading">
                <span>Content.</span>
                <span>•</span>
                <span>System Upgrade</span>
             </div>
        </div>
    )
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

  // --- SYSTEM & SEO INJECTION ---
  useEffect(() => {
      if (siteData.config) {
          // 1. Update Title
          if (siteData.config.seoTitle) {
              document.title = siteData.config.seoTitle;
          }
          
          // 2. Update Favicon
          if (siteData.config.favicon) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = siteData.config.favicon;
          }

          // 3. Inject Header Scripts
          if (siteData.config.headerScripts) {
              const scriptRange = document.createRange();
              const scripts = scriptRange.createContextualFragment(siteData.config.headerScripts);
              document.head.appendChild(scripts);
          }
          
           // 4. Inject Body Scripts
          if (siteData.config.bodyScripts) {
              const scriptRange = document.createRange();
              const scripts = scriptRange.createContextualFragment(siteData.config.bodyScripts);
              document.body.appendChild(scripts);
          }
      }
  }, [siteData.config]);

  // --- VIEW TRACKING (ANONYMOUS) ---
  useEffect(() => {
      // Check if user is admin (avoid tracking admin views)
      const isAdmin = sessionStorage.getItem('isAdminAuthenticated');
      if (!isAdmin) {
          fetch('/api/track-view', { method: 'POST' }).catch(e => console.error("Tracking error", e));
      }
  }, []);


  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    try {
        localStorage.setItem('content-theme', newTheme);
    } catch(e) {}
  };

  // Check Maintenance Mode
  if (siteData.config.maintenanceMode) {
      return <MaintenanceScreen theme={theme} message={siteData.config.maintenanceMessage} />;
  }

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
            return <CourseDetailPage course={course} allCourses={siteData.coursesData} theme={theme} showBuyButton={true} buyLink={siteData.config.contactLinkUrl} buyButtonText={siteData.config.defaultBuyButtonText} config={siteData.config} pills={siteData.softwarePillsData} />;
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
