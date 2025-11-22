// Fix: Import React to fix JSX syntax errors.
import React, { useState, useEffect } from 'react';
import type { Theme } from '../types';

interface BackToTopButtonProps {
    theme: Theme;
}

const BackToTopButton: React.FC<BackToTopButtonProps> = ({ theme }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => setIsVisible(window.pageYOffset > 300);
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const themeClasses = {
        iris: "bg-[#7de8d0]",
        pristine: "bg-[#ff4757]",
        boss: "bg-[#D92626]"
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 text-[#0a0f0e] w-12 h-12 rounded-full flex items-center justify-center cursor-pointer z-50 border-none transition-all duration-300 ${themeClasses[theme]} ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
        >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 19V5M5 12l7-7 7 7"></path>
            </svg>
        </button>
    );
};

export default BackToTopButton;
