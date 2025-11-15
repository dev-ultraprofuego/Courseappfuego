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
            line: "to-[rgba(255,71,87,0.12)]",
            cardBorder: "border-[rgba(255,71,87,0.12)]",
            authorText: "text-[#ff6b81]"
        },
        pristine: {
            line: "to-[rgba(255,71,87,0.12)]",
            cardBorder: "border-[rgba(255,71,87,0.12)]",
            authorText: "text-[#ff6b81]"
        }
    }
    const currentTheme = themeClasses[theme];

    return (
        <section className="py-20 overflow-hidden">
            <div className="mb-8 px-4">
                <div className="flex items-center justify-center gap-5 mb-2">
                    <div className={`h-px flex-1 max-w-xs bg-gradient-to-r from-transparent ${currentTheme.line}`}></div>
                    <h2 className="font-['Poppins',_sans_serif] text-[20px] font-semibold leading-[30px] text-white text-center whitespace-nowrap">Wall of Love</h2>
                    <div className={`h-px flex-1 max-w-xs bg-gradient-to-l from-transparent ${currentTheme.line}`}></div>
                </div>
                <div className="flex items-center justify-center gap-5">
                    <div className={`h-px flex-1 max-w-xs bg-gradient-to-r from-transparent ${currentTheme.line}`}></div>
                    <span className="font-['Poppins',_sans_serif] text-white/[0.75] text-[15px] font-bold leading-[23px] text-center whitespace-nowrap">Here's what our members are saying</span>
                    <div className={`h-px flex-1 max-w-xs bg-gradient-to-l from-transparent ${currentTheme.line}`}></div>
                </div>
            </div>
            <div className="wall-container grid gap-6 max-w-[1400px] mx-auto px-5 max-h-[900px] overflow-hidden relative" style={{ gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))` }}>
                {columns.map((col, colIndex) => (
                    <div 
                        key={colIndex} 
                        className="wall-column"
                        style={{
                            '--duration': `${col.length * 7}s`,
                            '--direction': colIndex % 2 === 0 ? 'normal' : 'reverse',
                        } as React.CSSProperties}
                    >
                        {[...col, ...col].map((testimonial, tIndex) => (
                            <div key={`${testimonial.author}-${tIndex}`} className={`bg-[rgba(13,22,20,0.6)] rounded-[20px] border p-6 mb-6 flex-shrink-0 ${currentTheme.cardBorder}`}>
                                <div className="mb-2 text-lg" style={{ color: '#f39c12', letterSpacing: '1px' }}>
                                    {'★'.repeat(testimonial.stars || 5)}{'☆'.repeat(5 - (testimonial.stars || 5))}
                                </div>
                                <p className="text-white/70 text-sm leading-relaxed m-0">{testimonial.text}</p>
                                <span className={`block mt-4 font-bold ${currentTheme.authorText}`}>{testimonial.author}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default WallofLove;