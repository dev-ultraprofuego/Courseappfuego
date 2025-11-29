
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CourseCard from './CourseCard';
import type { Course, CourseContextLink, PillItem, SoftwarePill, SiteConfig, Theme } from '../types';

interface CourseCarouselProps {
    section: {
        id: string;
        title: string;
        link: { type: 'section' | 'external'; value: string; };
        courses: CourseContextLink[];
    };
    allCourses: Course[];
    pills: PillItem[];
    theme: Theme;
    config: SiteConfig;
}

const CourseCarousel: React.FC<CourseCarouselProps> = ({ section, allCourses, pills, theme, config }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [slidesPerView, setSlidesPerView] = useState(4);
    
    // Robust category name formatter
    const formatCategoryName = (key: string): string => {
        const pill = (pills.find(p => 'category' in p && p.category === key) as SoftwarePill | undefined);
        if (pill && pill.name) return pill.name;
        // Fallback for keys not in pills data
        return key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const sectionCourses = section.courses
        .map((contextLink: CourseContextLink) => {
            const courseData = allCourses.find(c => c.id === contextLink.courseId);
            if (!courseData) return null;
            
            const linkBehavior = contextLink.linkBehavior;
            const linkUrl = contextLink.overrideExternalLink || courseData.externalLink || '#';
            const showBuyButton = contextLink.showBuyButton;
            const buyLink = contextLink.overrideBuyLink || config.contactLinkUrl;
            const buyButtonText = contextLink.overrideBuyButtonText || config.defaultBuyButtonText;
            const subSection = contextLink.subSection;
            // Use the formatter to get correct display names
            const contextKeywordNames = contextLink.contextKeywords?.map(formatCategoryName) || [];

            return {
                ...courseData,
                resolvedProps: {
                    linkBehavior,
                    linkUrl,
                    showBuyButton,
                    buyLink,
                    buyButtonText,
                    subSection,
                    contextKeywords: contextKeywordNames
                }
            };
        })
        .filter((c): c is Course & { resolvedProps: any } => c !== null);


    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) setSlidesPerView(1);
            else if (width < 768) setSlidesPerView(2);
            else if (width < 1024) setSlidesPerView(3);
            else setSlidesPerView(4);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const totalPages = Math.ceil(sectionCourses.length / slidesPerView);
    const handlePrev = () => setCurrentPage(prev => Math.max(0, prev - 1));
    const handleNext = () => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));

    const isPrevDisabled = currentPage === 0;
    const isNextDisabled = currentPage >= totalPages - 1;

    const themeClasses = {
        iris: {
            titleBg: "bg-gradient-to-r from-[rgba(93,213,184,0.18)] to-[rgba(125,232,208,0.13)]",
            titleBorder: "border-[rgba(93,213,184,0.18)]",
            // Navigation Buttons
            navBorder: "border-[rgba(93,213,184,0.12)]",
            navText: "text-[#7de8d0]",
            navBgLeft: "bg-[rgba(93,213,184,0.05)]",
            navBgRight: "bg-[rgba(93,213,184,0.15)]", // Darker/Stronger for right
            navHover: "hover:bg-[rgba(93,213,184,0.25)]",
            // Pagination Dots (Madbax Style: White/Gray)
            dotActive: "bg-white scale-125",
            dotInactive: "bg-white/20 hover:bg-white/40",
        },
        pristine: {
            titleBg: "bg-gradient-to-r from-[rgba(255,71,87,0.18)] to-[rgba(255,107,129,0.13)]",
            titleBorder: "border-[rgba(255,71,87,0.18)]",
            // Navigation Buttons
            navBorder: "border-[rgba(255,71,87,0.12)]",
            navText: "text-[#ff6b81]",
            navBgLeft: "bg-[rgba(255,71,87,0.05)]",
            navBgRight: "bg-[rgba(255,71,87,0.15)]", // Darker/Stronger for right
            navHover: "hover:bg-[rgba(255,71,87,0.25)]",
            // Pagination Dots (Theme Colored)
            dotActive: "bg-[#ff4757] scale-125",
            dotInactive: "bg-[#ff4757]/20 hover:bg-[#ff4757]/40",
        },
        boss: {
            titleBg: "bg-gradient-to-r from-[rgba(217,38,38,0.18)] to-[rgba(242,68,68,0.13)]",
            titleBorder: "border-[rgba(217,38,38,0.18)]",
            // Navigation Buttons
            navBorder: "border-[rgba(217,38,38,0.12)]",
            navText: "text-[#F24444]",
            navBgLeft: "bg-[rgba(217,38,38,0.05)]",
            navBgRight: "bg-[rgba(217,38,38,0.15)]", // Darker/Stronger for right
            navHover: "hover:bg-[rgba(217,38,38,0.25)]",
            // Pagination Dots (Theme Colored)
            dotActive: "bg-[#D92626] scale-125",
            dotInactive: "bg-[#D92626]/20 hover:bg-[#D92626]/40",
        }
    }
    
    const currentTheme = themeClasses[theme];
    const disabledClasses = "opacity-50 cursor-not-allowed";

    const renderTitle = () => {
        // Logic for Mobile Title Override
        let mobileTitle = section.title;
        if (section.id === 'design_us') mobileTitle = 'DESIGN & COURS US';
        if (section.id === 'graphic_design') mobileTitle = 'GRAPHIC & UI UX';

        const titleContent = (
             <span className="inline-flex items-center gap-2.5">
                {/* Desktop: Full Title */}
                <span className="hidden md:inline">{section.title}</span>
                {/* Mobile: Short Title */}
                <span className="md:hidden">{mobileTitle}</span>
                
                {section.link && section.link.value && (
                    <svg className="w-5 h-5 stroke-current stroke-2 fill-none transition-transform duration-300" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                )}
            </span>
        );
        
        const className = `relative inline-flex justify-center items-center gap-2.5 py-4 px-10 min-w-[220px] text-white/95 font-['Inter',_sans_serif] font-bold text-[19px] leading-[28.5px] [text-shadow:0_1px_2px_rgba(0,0,0,0.25)] rounded-2xl border-2 shadow-[0_4px_20px_rgba(0,0,0,0.4)] cursor-pointer no-underline transition-all duration-300 hover:scale-105 disabled:cursor-default disabled:opacity-70 ${currentTheme.titleBg} ${currentTheme.titleBorder}`;

        if (!section.link || !section.link.value) {
            return <div className={className}>{titleContent}</div>;
        }

        if (section.link.type === 'section') {
            return <Link href={`/section/${section.id}`} className={className}>{titleContent}</Link>;
        }
        
        return <a href={section.link.value} target="_blank" rel="noopener noreferrer" className={className}>{titleContent}</a>;
    };

    if (sectionCourses.length === 0) return null;

    return (
        <section className="py-10 px-5 text-center">
            <div className="mb-10">
                {renderTitle()}
            </div>
            <div className="relative max-w-[1250px] mx-auto">
                <div className="overflow-hidden relative">
                    <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentPage * 100}%)` }}>
                        {Array.from({ length: totalPages }).map((_, pageIndex) => (
                            <div key={pageIndex} className="grid gap-5 w-full flex-shrink-0 px-0.5" style={{gridTemplateColumns: `repeat(${slidesPerView}, 1fr)`}}>
                                {sectionCourses.slice(pageIndex * slidesPerView, (pageIndex + 1) * slidesPerView).map(course => (
                                    <CourseCard 
                                      key={course.id} 
                                      course={course} 
                                      theme={theme} 
                                      {...course.resolvedProps}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Pagination & Navigation Container */}
                <div className="flex flex-col justify-center items-center gap-4 mt-8">
                    
                    {/* Dots */}
                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <button 
                                key={index} 
                                onClick={() => setCurrentPage(index)} 
                                className={`rounded-full cursor-pointer border-none p-0 transition-all duration-300 w-2 h-2 ${currentPage === index ? currentTheme.dotActive : currentTheme.dotInactive}`}
                            ></button>
                        ))}
                    </div>

                    {/* Arrows (30x30px, Gap 3px) */}
                    <div className="flex items-center gap-[3px]">
                        <button 
                            onClick={handlePrev}
                            disabled={isPrevDisabled}
                            aria-label="Previous"
                            className={`border w-[30px] h-[30px] rounded-[8px] cursor-pointer flex items-center justify-center transition-all duration-300 ${currentTheme.navBgLeft} ${currentTheme.navBorder} ${currentTheme.navText} ${isPrevDisabled ? disabledClasses : currentTheme.navHover}`}
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <button 
                            onClick={handleNext}
                            disabled={isNextDisabled}
                            aria-label="Next"
                            className={`border w-[30px] h-[30px] rounded-[8px] cursor-pointer flex items-center justify-center transition-all duration-300 ${currentTheme.navBgRight} ${currentTheme.navBorder} ${currentTheme.navText} ${isNextDisabled ? disabledClasses : currentTheme.navHover}`}
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CourseCarousel;
