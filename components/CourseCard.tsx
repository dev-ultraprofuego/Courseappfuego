
// Fix: Import React to fix JSX syntax errors.
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Course, Theme } from '../types';
import FeatherIcon from './FeatherIcon';

interface CourseCardProps {
    course: Course;
    theme: Theme;
    linkBehavior: 'detail' | 'external';
    linkUrl: string;
    showBuyButton: boolean;
    buyLink?: string;
    buyButtonText?: string;
    subSection?: string;
    contextKeywords?: string[];
}

const CourseCard: React.FC<CourseCardProps> = ({ course, theme, linkBehavior, linkUrl, showBuyButton, buyLink, buyButtonText, subSection, contextKeywords }) => {
    
    const themeClasses = {
        iris: {
            titleHover: "group-hover:text-[#7de8d0]",
            buyButtonBg: "bg-teal-600 hover:bg-teal-500",
        },
        pristine: {
            titleHover: "group-hover:text-[#ff6b81]",
            buyButtonBg: "bg-[#ff4757] hover:bg-[#ff6b81]",
        },
        boss: {
            titleHover: "group-hover:text-[#F24444]",
            buyButtonBg: "bg-[#D92626] hover:bg-[#F24444]",
        }
    }
    const currentTheme = themeClasses[theme];

    const href = linkBehavior === 'detail' ? `/course/${course.id}` : linkUrl;
    
    const isSinglePurchase = subSection === 'Single Purchase';

    const renderTextContent = () => {
        const items: string[] = [];
        // The parent components now pass pre-formatted names, so we just add them.
        if (subSection) items.push(subSection);
        if (contextKeywords && contextKeywords.length > 0) items.push(...contextKeywords);
        
        // This function now only needs to handle special casing not related to category names.
        const formatItemText = (item: string) => {
            if (item.toLowerCase() === 'premium') return 'PREMIUM';
            // Trust the casing for pre-formatted keywords from parent components.
            return item;
        };
        
        return (
            <>
                {items.length > 0 && (
                    <div
                        className={`flex items-center flex-wrap gap-x-3 font-['Inter_Tight',_sans_serif] font-medium text-white mb-2 text-[13px] ${isSinglePurchase ? 'justify-center capitalize' : ''}`}
                        style={isSinglePurchase ? { lineHeight: '14.5667px', letterSpacing: '-0.39px' } : {}}
                    >
                        {items.map((item, index) => (
                           <div key={index} className="inline-flex items-center gap-x-2">
                                <span className="w-2 h-2 rounded-full bg-white block"></span>
                                <span>
                                    {formatItemText(item)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
                <h3 className={`font-['Inter',_sans_serif] text-lg font-bold text-white/95 mt-1 mb-2 flex-grow min-h-[3.5rem] ${items.length === 0 ? '!mt-0' : ''}`}>
                    <span className={`line-clamp-2 transition-colors duration-300 ${currentTheme.titleHover} group-hover:underline`}>{course.title}</span>
                </h3>
            </>
        );
    };

    return (
        <div className="group flex flex-col h-full text-white">
            <Link 
                href={href}
                target={linkBehavior === 'external' ? '_blank' : '_self'}
                rel={linkBehavior === 'external' ? 'noopener noreferrer' : ''}
                className="cursor-pointer flex flex-col flex-grow"
            >
                <div className="relative overflow-hidden rounded-xl aspect-[1.66]">
                    <Image 
                        src={course.img} 
                        alt={course.title} 
                        fill
                        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                </div>

                <div className={`pt-4 flex flex-col flex-grow ${isSinglePurchase ? 'items-center text-center' : ''}`}>
                    {renderTextContent()}
                    <div className="font-['Poppins',_sans_serif] text-sm text-white/60 mt-auto">
                        {course.date}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default CourseCard;
