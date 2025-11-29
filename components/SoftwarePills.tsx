
'use client';
// Fix: Import React to fix JSX syntax errors.
import React from 'react';
import Link from 'next/link';
import FeatherIcon from './FeatherIcon';
// Fix: Removed NavigationProps as it is deprecated.
import type { PillItem, SoftwarePill, Separator, Course, Theme, CourseContextLink } from '../types';

// Fix: Removed NavigationProps as it is deprecated.
interface SoftwarePillsProps {
    theme: Theme;
    pills: PillItem[];
    courses: Course[];
    categoryCourseLinks?: Record<string, CourseContextLink[]>;
}


// Fix: Removed onNavigate prop as it is no longer used.
const SoftwarePills: React.FC<SoftwarePillsProps> = ({ theme, pills, courses, categoryCourseLinks }) => {

    const themeClasses = {
        iris: {
            // Forced Red Style for Iris as requested
            pill: "bg-gradient-to-b from-[rgba(255,71,87,0.06)] to-[rgba(255,71,87,0.02)] border-[rgba(255,71,87,0.12)]",
            iconBg: "bg-gradient-to-br from-[rgba(255,71,87,0.1)] to-[rgba(255,71,87,0.05)] border-[rgba(255,71,87,0.15)]",
            countText: "text-[#ff6b81]",
            separator: "to-[rgba(255,71,87,0.12)]",
        },
        pristine: {
            pill: "bg-gradient-to-b from-[rgba(255,71,87,0.06)] to-[rgba(255,71,87,0.02)] border-[rgba(255,71,87,0.12)]",
            iconBg: "bg-gradient-to-br from-[rgba(255,71,87,0.1)] to-[rgba(255,71,87,0.05)] border-[rgba(255,71,87,0.15)]",
            countText: "text-[#ff6b81]",
            separator: "to-[rgba(255,71,87,0.12)]",
        },
        boss: {
            pill: "bg-gradient-to-b from-[rgba(217,38,38,0.06)] to-[rgba(217,38,38,0.02)] border-[rgba(217,38,38,0.12)]",
            iconBg: "bg-gradient-to-br from-[rgba(217,38,38,0.1)] to-[rgba(217,38,38,0.05)] border-[rgba(217,38,38,0.15)]",
            countText: "text-[#F24444]",
            separator: "to-[rgba(217,38,38,0.12)]",
        }
    };
    const currentTheme = themeClasses[theme];

    const getPillHref = (pill: SoftwarePill): string => {
        switch (pill.linkType) {
            case 'external':
                return pill.externalUrl || '#';
            case 'course':
                return pill.courseId ? `/course/${pill.courseId}` : '#';
            case 'category':
            default:
                return `/category/${pill.category}`;
        }
    };

    const separatorIndex = pills.findIndex(p => 'type' in p && p.type === 'separator');
    
    const businessPills = (separatorIndex !== -1 ? pills.slice(0, separatorIndex) : pills).filter((p): p is SoftwarePill => 'category' in p);
    const separator = separatorIndex !== -1 ? pills[separatorIndex] as Separator : null;
    const designPills = (separatorIndex !== -1 ? pills.slice(separatorIndex + 1) : []).filter((p): p is SoftwarePill => 'category' in p);

    const designRow1 = designPills.slice(0, 6);
    const designRow2 = designPills.slice(6);

    const renderPillButton = (pill: SoftwarePill, i: number, totalOffset: number = 0) => {
        let categoryCourseCount = 0;
        
        if (categoryCourseLinks && categoryCourseLinks[pill.category]) {
             // Count exactly what is configured for display in this category
             categoryCourseCount = categoryCourseLinks[pill.category].length;
        } else if (pill.category === 'all') {
             // 'all' typically shows everything, unless manual override exists above
             categoryCourseCount = courses.length;
        } else {
             // Fallback: if manual list is missing/undefined but not 'all', assume 0 if we want strict manual counting.
             categoryCourseCount = 0;
        }

        const countText = `${categoryCourseCount} ${categoryCourseCount > 1 ? 'Articles' : 'Article'}`;

        const pillContent = (
            <>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.3)] border text-white ${currentTheme.iconBg}`}>
                    {pill.iconType === 'img' ? (
                        <img src={pill.icon} alt={pill.name} className="w-7 h-7 block object-contain" loading="lazy" />
                    ) : pill.iconType === 'text' ? (
                        <span className="text-lg font-black tracking-tighter leading-none">{pill.icon}</span>
                    ) : (
                        <FeatherIcon name={pill.icon} size={28} className="text-white" />
                    )}
                </div>
                <div>
                    <div className={`font-['Inter',_sans_serif] font-bold text-white ${pill.name === 'Ecommerce' ? 'text-lg' : 'text-base'}`}>{pill.name}</div>
                    <div className={`text-sm font-semibold ${currentTheme.countText}`}>{countText}</div>
                </div>
            </>
        );

        return (
            <Link 
                key={pill.category + i} 
                href={getPillHref(pill)}
                target={pill.linkType === 'external' ? '_blank' : '_self'}
                rel={pill.linkType === 'external' ? 'noopener noreferrer' : ''}
                className={`animate-fadeInUp inline-flex items-center gap-3.5 py-4 px-7 border rounded-full cursor-pointer transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.4)] no-underline hover:-translate-y-1 hover:scale-105 w-full max-w-xs sm:w-auto sm:max-w-none justify-start ${currentTheme.pill}`}
                style={{ animationDelay: `${(i + totalOffset) * 50}ms` }}
            >
               {pillContent}
            </Link>
        );
    };

    return (
        <div className="hidden md:block py-10 px-4">
            {/* Business Pills */}
            <div className="flex flex-wrap justify-center gap-4 max-w-7xl mx-auto">
                {businessPills.map((pill, i) => renderPillButton(pill, i))}
            </div>

            {/* Separator */}
            {separator && (
                <div className="w-full flex items-center justify-center gap-4 my-6 animate-fadeInUp" style={{ animationDelay: `${businessPills.length * 50}ms` }}>
                    <div className={`h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent ${currentTheme.separator}`}></div>
                    <span className="text-sm font-bold text-white/60 tracking-wider uppercase whitespace-nowrap">
                        {separator.text}
                    </span>
                    <div className={`h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent ${currentTheme.separator}`}></div>
                </div>
            )}
            
            {/* Design Pills Row 1 */}
            {designRow1.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 max-w-7xl mx-auto">
                    {designRow1.map((pill, i) => renderPillButton(pill, i, businessPills.length + 1))}
                </div>
            )}

            {/* Design Pills Row 2 */}
            {designRow2.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 max-w-7xl mx-auto mt-4">
                    {designRow2.map((pill, i) => renderPillButton(pill, i, businessPills.length + 1 + designRow1.length))}
                </div>
            )}
        </div>
    );
};

export default SoftwarePills;