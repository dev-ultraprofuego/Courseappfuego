'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import CourseCard from './CourseCard';
import type { Course, SiteConfig, HomepageSection, Theme } from '../types';

interface SectionPageProps {
    sectionId: string;
    allCourses: Course[];
    homepageSections: HomepageSection[];
    theme: Theme;
    config: SiteConfig;
}

const SectionPage: React.FC<SectionPageProps> = ({ sectionId, allCourses, homepageSections, theme, config }) => {
    
    const section = useMemo(() => homepageSections.find(s => s.id === sectionId), [sectionId, homepageSections]);

    const sectionCourses = useMemo(() => {
        if (!section) return [];

        return section.courses
            .map(link => {
                const courseData = allCourses.find(c => c.id === link.courseId);
                if (!courseData) return null;

                const linkBehavior = link.linkBehavior;
                const linkUrl = link.overrideExternalLink || courseData.externalLink || '';
                const showBuyButton = link.showBuyButton;
                const buyLink = link.overrideBuyLink || config.contactLinkUrl;
                const buyButtonText = link.overrideBuyButtonText || config.defaultBuyButtonText;
                const subSection = link.subSection;
                const contextKeywords = link.contextKeywords;

                return {
                    ...courseData,
                    resolvedProps: {
                        linkBehavior,
                        linkUrl,
                        showBuyButton,
                        buyLink,
                        buyButtonText,
                        subSection,
                        contextKeywords
                    }
                };
            })
            .filter((c): c is Course & { resolvedProps: any } => c !== null);
    }, [section, allCourses, config]);

    if (!section) {
       return <div className="text-center py-20">Section not found.</div>;
    }
    
    const articleCount = sectionCourses.length;

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
            <div className="text-sm text-white/60 mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span className="mx-2">&rsaquo;</span>
                <span>{section.title}</span>
            </div>

            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                <h1 className="text-4xl sm:text-5xl font-bold text-white/95">{section.title}</h1>
                <div className="text-right">
                    <span className="text-4xl font-bold text-white/95">{articleCount}</span>
                    <span className="block text-sm text-white/60">Articles</span>
                </div>
            </div>

            {sectionCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {sectionCourses.map(course => (
                        <div key={course.id}>
                             <CourseCard 
                                course={course} 
                                theme={theme} 
                                {...course.resolvedProps} 
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-white/50 mt-12">Cette section ne contient aucun cours.</div>
            )}
        </div>
    );
};

export default SectionPage;
