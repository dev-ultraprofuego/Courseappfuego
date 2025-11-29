
// Fix: Import React to fix JSX syntax errors.
import React from 'react';
import type { Theme } from '../types';

interface FooterProps {
    theme: Theme;
}

const Footer: React.FC<FooterProps> = ({ theme }) => {
    
    const themeClasses = {
        iris: "border-[rgba(93,213,184,0.12)]",
        pristine: "border-[rgba(255,71,87,0.12)]",
        boss: "border-[rgba(217,38,38,0.12)]"
    };

    return (
        <footer className={`py-6 md:py-10 px-5 text-center border-t mt-16 ${themeClasses[theme]}`}>
            <a href="#" className="no-underline text-3xl font-black mb-2.5 inline-flex items-baseline">
                <span className="admin-fire-effect">Content.</span>
            </a>
            <p className="text-white/50 text-sm">
                © {new Date().getFullYear()} Content. All rights reserved.
            </p>
        </footer>
    );
}

export default Footer;
