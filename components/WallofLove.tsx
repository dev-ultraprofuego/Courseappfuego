
'use client';
// Fix: Import React to fix JSX syntax errors.
import React, { useState, useEffect } from 'react';
import type { WallofLoveProps } from '../types';
import type { Testimonial } from '../types';

function debounce(func: () => void, wait: number) {
    let timeout: number;
    return () => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => func(), wait);
    };
}

const WallofLove: React.FC<WallofLoveProps> = ({ theme, testimonials }) => {
    const [columnsCount, setColumnsCount] = useState(3);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 860) setColumnsCount(3);
            else if (window.innerWidth > 600) setColumnsCount(2);
            else setColumnsCount(1);
        };
        handleResize();
        const debouncedResize = debounce(handleResize, 150);
        window.addEventListener('resize', debouncedResize);
        return () => window.removeEventListener('resize', debouncedResize);
    }, []);

    if (!testimonials || testimonials.length === 0) {
        return null;
    }

    const columns: Testimonial[][] = Array.from({ length: columnsCount }, () => []);
    testimonials.forEach((testimonial, index) => {
        columns[index % columnsCount].push(testimonial);
    });

    const themeClasses = {
        iris: {
            // Forced Red Style for Iris as requested
            line: "to-[rgba(255,71,87,0.12)]",
            cardBorder: "border-[rgba(255,71,87,0.12)]",
            authorText: "text-[#ff6b81]",
        },
        pristine: {
            line: "to-[rgba(255,71,87,0.12)]",
            cardBorder: "border-[rgba(255,71,87,0.12)]",
            authorText: "text-[#ff6b81]",
        },
        boss: {
            line: "to-[rgba(217,38,38,0.12)]",
            cardBorder: "border-[rgba(217,38,38,0.12)]",
            authorText: "text-[#F24444]",
        }
    }
    const currentTheme = themeClasses[theme];

    return (
        <section className="py-20 overflow-hidden">
            <div className="mb-12 px-4">
                <div className="flex items-center justify-center gap-5 mb-3">
                    <div className={`h-px flex-1 max-w-xs bg-gradient-to-r from-transparent ${currentTheme.line}`}></div>
                    <h2 className="font-['Inter_Tight',_sans_serif] text-2xl font-bold text-white text-center whitespace-nowrap tracking-tight">Wall of Love</h2>
                    <div className={`h-px flex-1 max-w-xs bg-gradient-to-l from-transparent ${currentTheme.line}`}></div>
                </div>
                <div className="text-center">
                    <span className="font-['Inter',_sans_serif] text-white/60 text-sm font-medium">Ce que nos membres disent de nous</span>
                </div>
            </div>
            
            <div className="wall-container grid gap-6 max-w-[1400px] mx-auto px-5 max-h-[800px] overflow-hidden relative mask-image-gradient" style={{ gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))` }}>
                {columns.map((col, colIndex) => (
                    <div 
                        key={colIndex} 
                        className="wall-column"
                        style={{
                            '--duration': `${Math.max(col.length * 10, 20)}s`,
                            '--direction': colIndex % 2 === 0 ? 'normal' : 'reverse',
                        } as React.CSSProperties}
                    >
                        {[...col, ...col].map((testimonial, tIndex) => (
                            <div key={`${testimonial.author}-${tIndex}`} className={`bg-[#0a0d0c] rounded-2xl border p-6 mb-6 flex-shrink-0 backdrop-blur-sm transition-colors hover:border-white/20 ${currentTheme.cardBorder}`}>
                                <div className="mb-4 flex gap-1" style={{ color: '#f39c12' }}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < (testimonial.stars || 5) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                        </svg>
                                    ))}
                                </div>
                                
                                <p className="text-gray-300 text-[15px] leading-relaxed m-0 mb-6 font-medium">"{testimonial.text}"</p>
                                
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <div className={`font-bold text-sm ${currentTheme.authorText}`}>
                                        {testimonial.author}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default WallofLove;
