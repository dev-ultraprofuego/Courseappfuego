'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import CourseCard from './CourseCard';
import type { Course, PillItem, SoftwarePill, CourseContextLink, SiteConfig, Theme, CategoryPageProps } from '../types';

const COURSES_PER_PAGE = 12;

const CategoryPage: React.FC<CategoryPageProps> = ({ category, allCourses, pills, categoryCourseLinks, theme, config }) => {
    const [displayedCourses, setDisplayedCourses] = useState<(Course & { resolvedProps: any })[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const observer = useRef<IntersectionObserver | null>(null);

    const allFilteredCourseLinks: CourseContextLink[] = useMemo(() => {
        if (category === 'all') {
            return allCourses.map(c => ({ courseId: c.id, linkBehavior: 'detail', showBuyButton: true }));
        }
        return categoryCourseLinks[category] || [];
    }, [category, categoryCourseLinks, allCourses]);

    const allFilteredCourses = useMemo(() => {
        return allFilteredCourseLinks
            .map(link => {
                const courseData = allCourses.find(c => c.id === link.courseId);
                if (!courseData) return null;

                const linkBehavior = link.linkBehavior;
                const linkUrl = link.overrideExternalLink || courseData.externalLink || (linkBehavior === 'detail' ? `/course/${courseData.id}` : '#');
                const showBuyButton = link.showBuyButton;
                const buyLink = link.overrideBuyLink || config.contactLinkUrl;
                const buyButtonText = link.overrideBuyButtonText || config.defaultBuyButtonText;

                return {
                    ...courseData,
                    resolvedProps: {
                        linkBehavior,
                        linkUrl,
                        showBuyButton,
                        buyLink,
                        buyButtonText,
                    }
                };
            })
            .filter((c): c is Course & { resolvedProps: any } => c !== null);
    }, [allFilteredCourseLinks, allCourses, config]);


    useEffect(() => {
        setDisplayedCourses(allFilteredCourses.slice(0, COURSES_PER_PAGE));
        setPage(1);
        setHasMore(allFilteredCourses.length > COURSES_PER_PAGE);
    }, [allFilteredCourses]);

    const loadMoreCourses = useCallback(() => {
        if (loading || !hasMore) return;
        setLoading(true);
        setTimeout(() => {
            const nextPage = page + 1;
            const newCourses = allFilteredCourses.slice(0, nextPage * COURSES_PER_PAGE);
            setDisplayedCourses(newCourses);
            setPage(nextPage);
            if (newCourses.length >= allFilteredCourses.length) {
                setHasMore(false);
            }
            setLoading(false);
        }, 500);
    }, [loading, hasMore, page, allFilteredCourses]);
    
    const lastCourseElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreCourses();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMoreCourses]);

    const categoryInfo = pills.find(p => 'category' in p && p.category === category) as SoftwarePill | undefined;
    const categoryName = categoryInfo ? categoryInfo.name : category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const articleCount = allFilteredCourses.length;

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
            <div className="text-sm text-white/60 mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span className="mx-2">&rsaquo;</span>
                <span>{categoryName}</span>
            </div>

            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                <h1 className="text-4xl sm:text-5xl font-bold text-white/95">{categoryName}</h1>
                <div className="text-right">
                    <span className="text-4xl font-bold text-white/95">{articleCount}</span>
                    <span className="block text-sm text-white/60">Articles</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {/* Fix: Replaced malformed/incomplete .map() body with a proper implementation that returns JSX and handles the infinite scroll ref. */}
                {displayedCourses.map((course, index) => {
                     const isLastElement = index === displayedCourses.length - 1;
                     return (
                        <div key={`${course.id}-${index}`} ref={isLastElement ? lastCourseElementRef : null}>
                            <CourseCard
                                course={course}
                                theme={theme}
                                {...course.resolvedProps}
                            />
                        </div>
                     );
                })}
            </div>
        </div>
    );
};

// Fix: Add missing default export.
export default CategoryPage;