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
            titleHover: "group-hover:text-[#F24444]",
            buyButtonBg: "bg-[#D92626] hover:bg-[#F24444]",
        }
    }
    const currentTheme = themeClasses[theme];

    const href = linkBehavior === 'detail' ? `/course/${course.id}` : linkUrl;
    
    const isSinglePurchase = subSection === 'Single Purchase';

    const renderTextContent = () => {
        const items: string[] = [];
        if (subSection) items.push(subSection);
        if (contextKeywords && contextKeywords.length > 0) items.push(...contextKeywords);
        
        const formatItemText = (item: string) => {
            const lower = item.toLowerCase();
            if (lower === 'premium') return 'PREMIUM';
            if (lower === 'single purchase') return item; // Keep original casing
            return item.charAt(0).toUpperCase() + item.slice(1);
        };
        
        return (
            <>
                {items.length > 0 && (
                    <div
                        className={`flex items-center flex-wrap gap-x-3 font-['Inter_Tight',_sans_serif] font-medium text-white mb-2 text-[13px] ${isSinglePurchase ? 'justify-center capitalize' : ''}`}
                        style={isSinglePurchase ? { lineHeight: '14.5667px', letterSpacing: '-0.39px' } : {}}
                    >
                        {items.map((item, index) => (
                           <div key={index} className="inline-flex items-center gap-x-1.5">
                                <span className="font-bold text-3xl leading-none relative" style={{ top: '-4px' }}>•</span>
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
                <div className="relative overflow-hidden rounded-xl aspect-[630/513]">
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
            {showBuyButton && buyLink && (
                <div className="mt-4 text-center">
                    <a href={buyLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg text-sm font-bold text-white transition-all duration-300 transform-gpu opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 ${currentTheme.buyButtonBg}`}>
                        <FeatherIcon name="shopping-cart" size={16} />
                        {buyButtonText || 'Buy Now'}
                    </a>
                </div>
            )}
        </div>
    );
};

export default CourseCard;