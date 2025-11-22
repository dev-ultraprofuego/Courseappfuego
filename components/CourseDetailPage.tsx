'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Course, Theme, SiteConfig, PillItem, SoftwarePill } from '../types';
import CourseCard from './CourseCard';
import { parseShortcodes } from '../utils/shortcodeParser';

interface CourseDetailPageProps {
    course: Course;
    theme: Theme;
    allCourses: Course[];
    showBuyButton: boolean;
    buyLink?: string;
    buyButtonText?: string;
    config: SiteConfig;
    pills: PillItem[];
}

const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ course, allCourses, theme, showBuyButton, buyLink, buyButtonText, config, pills }) => {
    const recentPosts = allCourses.slice(0, 8);
    const relatedArticles = allCourses.filter(c => c.categories.some(cat => course.categories.includes(cat)) && c.id !== course.id).slice(0, 4);

    const themeClasses = {
        iris: {
            categoryBg: "bg-[rgba(93,213,184,0.1)]",
            categoryText: "text-[#7de8d0]",
            ctaButton: "bg-teal-600 hover:bg-teal-500",
            relatedTitle: "text-[#7de8d0]",
            proseStyles: "prose-blockquote:border-teal-500 prose-blockquote:text-white/80",
        },
        pristine: {
            categoryBg: "bg-[rgba(255,71,87,0.1)]",
            categoryText: "text-[#ff6b81]",
            ctaButton: "bg-[#ff4757] hover:bg-[#ff6b81]",
            relatedTitle: "text-[#ff6b81]",
            proseStyles: "prose-blockquote:border-[#ff4757] prose-blockquote:text-white/80",
        },
        boss: {
            categoryBg: "bg-[rgba(217,38,38,0.1)]",
            categoryText: "text-[#F24444]",
            ctaButton: "bg-[#D92626] hover:bg-[#F24444]",
            relatedTitle: "text-[#F24444]",
            proseStyles: "prose-blockquote:border-[#D92626] prose-blockquote:text-white/80",
        }
    };
    const currentTheme = themeClasses[theme];
    
    // Robust category name formatter
    const formatCategoryName = (key: string): string => {
        const pill = (pills.find(p => 'category' in p && p.category === key) as SoftwarePill | undefined);
        if (pill && pill.name) return pill.name;
        // Fallback for keys not in pills data
        return key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const categoryDisplayNames = course.categories.map(formatCategoryName).join(', ');
    const firstCategoryKey = course.categories[0] || '';
    const firstCategoryName = formatCategoryName(firstCategoryKey);
    
    const processedContent = course.content ? parseShortcodes(course.content) : '';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8">
                    <div className="mb-8">
                        <Image
                            src={course.img}
                            alt={course.title}
                            width={1280}
                            height={720}
                            className="w-full h-auto rounded-xl object-cover"
                            priority
                        />
                    </div>
                    
                    <div className="text-sm text-white/60 mb-4">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span className="mx-2">&rsaquo;</span>
                        <Link href={`/category/${firstCategoryKey}`} className="hover:text-white transition-colors">{firstCategoryName}</Link>
                        <span className="mx-2">&rsaquo;</span>
                        <span className="text-white/80">{course.title}</span>
                    </div>

                    <div className={`inline-block py-1 px-3 text-sm font-bold rounded-md mb-4 ${currentTheme.categoryBg} ${currentTheme.categoryText}`}>
                        {categoryDisplayNames}
                    </div>
                    
                    <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
                    
                    <div className="text-sm text-white/60 mb-8 border-b border-t border-white/10 py-3">
                        <span>Updated {course.date}</span>
                    </div>
                    
                    {processedContent && <div 
                        className={`prose prose-invert prose-p:text-white/70 prose-h1:text-white prose-h6:text-white/80 prose-blockquote:p-4 prose-blockquote:rounded-r-lg ${currentTheme.proseStyles}`}
                        dangerouslySetInnerHTML={{ __html: processedContent }} 
                    />}

                    {showBuyButton && buyLink && (
                        <div className="my-10 text-center">
                            <a 
                                href={buyLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={`inline-block py-4 px-10 text-xl font-bold rounded-lg transition-transform hover:scale-105 shadow-lg ${currentTheme.ctaButton}`}
                            >
                                {buyButtonText || 'Buy Now'}
                            </a>
                        </div>
                    )}

                    <div className="mt-16">
                         <h2 className={`text-3xl font-bold mb-8 text-center ${currentTheme.relatedTitle}`}>Related Articles</h2>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {relatedArticles.map(relatedCourse => {
                                const categoryNames = relatedCourse.categories.map(formatCategoryName);
                                return (
                                    <CourseCard 
                                        key={relatedCourse.id} 
                                        course={relatedCourse} 
                                        theme={theme} 
                                        linkBehavior={'detail'}
                                        linkUrl={`/course/${relatedCourse.id}`}
                                        showBuyButton={true}
                                        buyLink={config.contactLinkUrl}
                                        buyButtonText={config.defaultBuyButtonText}
                                        contextKeywords={categoryNames}
                                    />
                                );
                            })}
                         </div>
                    </div>
                </div>

                <aside className="lg:col-span-4">
                    <div className="sticky top-28">
                        <h2 className="text-2xl font-bold mb-6 text-white/90">Recent Posts</h2>
                        <div className="space-y-6">
                            {recentPosts.map(post => (
                                <Link key={post.id} href={`/course/${post.id}`} className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-24 h-20 relative rounded-md overflow-hidden flex-shrink-0">
                                        <Image
                                            src={post.img}
                                            alt={post.title}
                                            fill
                                            className="object-cover"
                                            sizes="96px"
                                        />
                                    </div>
                                    <div>
                                        <span className={`text-xs font-bold ${theme === 'iris' ? 'text-[#7de8d0]' : theme === 'pristine' ? 'text-[#ff6b81]' : 'text-[#F24444]'}`}>{formatCategoryName(post.categories[0] || '')}</span>
                                        <h3 className="text-sm font-semibold text-white/90 leading-tight group-hover:underline">{post.title}</h3>
                                        <p className="text-xs text-white/50 mt-1">{post.date}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CourseDetailPage;
