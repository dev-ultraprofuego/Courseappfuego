
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { navData } from '../constants/data';
// Fix: Removed NavigationProps as it is a deprecated type.
import type { NavDropdown, NavLink } from '../types';
import FeatherIcon from './FeatherIcon';
import type { Theme, SiteConfig } from '../types';

interface HeaderProps {
    onSearchOpen: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    config: SiteConfig;
}

const Header: React.FC<HeaderProps> = ({ onSearchOpen, theme, setTheme, config }) => {
    const [scrolled, setScrolled] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('[data-dropdown]')) {
                setOpenDropdown(null);
            }
        };
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }, [isMenuOpen]);
    
    const handleSearchClick = () => {
        onSearchOpen();
        setIsMenuOpen(false);
    }

    const handleDropdownToggle = (name: string) => {
        setOpenDropdown(current => (current === name ? null : name));
    };

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        setOpenDropdown(null);
    }
    
    const handleLinkClick = () => {
        setOpenDropdown(null);
        setIsMenuOpen(false);
    };
    
    const getLinkHref = (link: NavLink): string => {
        if (link.sectionId) {
            return `/section/${link.sectionId}`;
        }
        if (link.categoryKey) {
            return `/category/${link.categoryKey}`;
        }
        return link.href === '#' ? '/' : link.href;
    }

    const themeClasses = {
        iris: {
            border: "border-[rgba(93,213,184,0.12)]",
            text: "text-[#7de8d0]",
            bgHover: "hover:bg-[rgba(93,213,184,0.06)]",
            bgActive: "bg-[rgba(93,213,184,0.1)]",
            bgMobile: "bg-[rgba(93,213,184,0.06)]",
            telegram: "text-[#7de8d0]",
        },
        pristine: {
            border: "border-[rgba(255,71,87,0.12)]",
            text: "text-[#ff6b81]",
            bgHover: "hover:bg-[rgba(255,71,87,0.06)]",
            bgActive: "bg-[rgba(255,71,87,0.1)]",
            bgMobile: "bg-[rgba(255,71,87,0.06)]",
            telegram: "text-[#ff6b81]",
        },
        boss: {
            border: "border-[rgba(217,38,38,0.12)]",
            text: "text-[#F24444]",
            bgHover: "hover:bg-[rgba(217,38,38,0.06)]",
            bgActive: "bg-[rgba(217,38,38,0.1)]",
            bgMobile: "bg-[rgba(217,38,38,0.06)]",
            telegram: "text-[#F24444]",
        }
    };

    const currentTheme = themeClasses[theme];

    const renderDropdown = (data: NavDropdown, name: string) => (
        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2.5 bg-[rgba(13,22,20,0.95)] backdrop-blur-xl rounded-xl p-2 min-w-[220px] shadow-[0_8px_30px_rgba(0,0,0,0.3)] border ${currentTheme.border} z-50 grid gap-1 ${data.columns === 3 ? 'grid-cols-3 min-w-[660px]' : data.columns === 2 ? 'grid-cols-2 min-w-[440px]' : 'grid-cols-1'}`}>
            {name === 'theme' ? (
                [
                    { title: config.themeNameIris, key: 'iris' as Theme, icon: 'droplet' },
                    { title: config.themeNamePristine, key: 'pristine' as Theme, icon: 'droplet' },
                    { title: config.themeNameBoss, key: 'boss' as Theme, icon: 'droplet' }
                ].map((link) => (
                    <button key={link.key} onClick={() => handleThemeChange(link.key)} className={`w-full flex items-center gap-3 py-3 px-4 text-white/90 bg-transparent border-none ${currentTheme.bgHover} no-underline rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer`}>
                        <FeatherIcon name={link.icon} size={20} className={link.key === theme ? currentTheme.text : ''} />
                        {link.title}
                    </button>
                ))
            ) : (
                data.links.map((link) => (
                    <Link key={link.title} href={getLinkHref(link)} onClick={handleLinkClick} className={`w-full flex items-center gap-3 py-3 px-4 text-white/90 bg-transparent border-none ${currentTheme.bgHover} no-underline rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer text-left`}>
                        {link.iconType === 'img' ? (
                            <img src={link.icon} alt={link.title} className="w-5 h-5 object-contain" />
                        ) : link.iconType === 'text' ? (
                            <span className="w-5 h-5 flex items-center justify-center font-bold text-base">{link.icon}</span>
                        ) : (
                            <FeatherIcon name={link.icon} size={20} />
                        )}
                        {link.title}
                    </Link>
                ))
            )}
        </div>
    );

    const renderMobileDropdown = (data: NavDropdown, name: string) => {
        const isOpen = openDropdown === name;
        // Fix: Use large max-height instead of fixed 500px to allow full scrolling within parent
        return (
            <div className="mb-2">
                <button onClick={() => setOpenDropdown(isOpen ? null : name)} className="w-full flex items-center justify-between p-4 text-white/90 bg-transparent border-none font-semibold text-base rounded-lg cursor-pointer text-left">
                    <span>{data.title}</span>
                    <span className={`w-2 h-2 border-l-2 border-b-2 border-current transition-transform duration-300 ${isOpen ? 'rotate-135' : '-rotate-45 -mt-1'}`} />
                </button>
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${currentTheme.bgMobile} rounded-lg mt-2 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {name === 'theme' ? (
                        [
                            { title: config.themeNameIris, key: 'iris' as Theme, icon: 'droplet' },
                            { title: config.themeNamePristine, key: 'pristine' as Theme, icon: 'droplet' },
                            { title: config.themeNameBoss, key: 'boss' as Theme, icon: 'droplet' }
                        ].map((link) => (
                            <button key={link.key} onClick={() => handleThemeChange(link.key)} className={`w-full flex items-center gap-3 py-3 px-8 text-white/90 bg-transparent border-none no-underline text-sm font-semibold cursor-pointer`}>
                                <FeatherIcon name={link.icon} size={18} className={link.key === theme ? currentTheme.text : ''} />
                                {link.title}
                            </button>
                        ))
                    ) : (
                        data.links.map((link) => (
                            <Link key={link.title} href={getLinkHref(link)} onClick={handleLinkClick} className={`w-full flex items-center gap-3 py-3 px-8 text-white/90 bg-transparent border-none no-underline text-sm font-semibold cursor-pointer text-left`}>
                                {link.iconType === 'img' ? (
                                    <img src={link.icon} alt={link.title} className="w-[18px] h-[18px] object-contain" />
                                ) : link.iconType === 'text' ? (
                                    <span className="w-5 h-5 flex items-center justify-center font-bold">{link.icon}</span>
                                ) : (
                                    <FeatherIcon name={link.icon} size={18} />
                                )}
                                {link.title}
                            </Link>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const premiumLinkHref = navData.premium.sectionId ? `/section/${navData.premium.sectionId}` : (navData.premium.categoryKey ? `/category/${navData.premium.categoryKey}` : '/');

    const isExternalDmca = config.dmcaLinkUrl.startsWith('http');
    const dmcaButtonClasses = `py-2.5 px-6 ${currentTheme.bgActive} ${currentTheme.text} border ${currentTheme.border} rounded-lg font-bold text-sm no-underline ml-2 hover:bg-opacity-20 transition-colors`;

    return (
        <>
            {config.showCommunityLink && config.communityLinkUrl && (
                 <div className={`bg-[#0d1614] border-b ${currentTheme.border} py-2.5 text-center`}>
                    <a href={config.communityLinkUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center ${currentTheme.telegram} no-underline text-sm font-semibold`}>
                        <span>{config.communityLinkText}</span>
                        <svg className="w-4 h-4 ml-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.02C14.25 17.07 13.81 16.64 13.25 16.27C12.37 15.69 11.87 15.33 11.02 14.77C10.03 14.12 10.67 13.76 11.24 13.18C11.39 13.03 13.95 10.7 14 10.49C14.0069 10.4582 14.006 10.4252 13.9973 10.3938C13.9886 10.3624 13.9724 10.3337 13.95 10.31C13.89 10.26 13.81 10.28 13.74 10.29C13.65 10.31 12.25 11.24 9.52 13.08C9.12 13.35 8.76 13.49 8.44 13.48C8.08 13.47 7.4 13.28 6.89 13.11C6.26 12.91 5.77 12.8 5.81 12.45C5.83 12.27 6.08 12.09 6.55 11.9C9.47 10.63 11.41 9.79 12.38 9.39C15.16 8.23 15.73 8.03 16.11 8.03C16.19 8.03 16.38 8.05 16.5 8.15C16.6 8.23 16.63 8.34 16.64 8.42C16.63 8.48 16.65 8.66 16.64 8.8Z" />
                        </svg>
                    </a>
                </div>
            )}
           
            <header className={`bg-[#0d1614] border-b ${currentTheme.border} sticky top-0 z-40 transition-shadow duration-300 ${scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.3)]' : ''}`}>
                <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex items-center justify-between h-20">
                    <Link href="/" className="no-underline bg-transparent border-none cursor-pointer p-0 inline-flex items-center">
                        {config.logoUrl ? (
                            <img src={config.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
                        ) : (
                            <span className="text-4xl font-black admin-fire-effect">Content.</span>
                        )}
                    </Link>
                    
                    <nav className="hidden lg:flex items-center gap-2">
                        <Link href={premiumLinkHref} className={`py-3 px-4 text-white/90 no-underline font-semibold text-sm leading-[22px] rounded-lg ${currentTheme.bgHover}`}>{navData.premium.title}</Link>
                        
                        <div data-dropdown className="relative">
                            <button onClick={() => handleDropdownToggle('courses')} className={`flex items-center gap-1.5 py-3 px-4 text-white/90 bg-transparent border-none font-semibold text-sm leading-[22px] rounded-lg cursor-pointer ${currentTheme.bgHover}`}>
                                {navData.courses.title}
                                <span className={`w-2 h-2 border-l-2 border-b-2 border-current transition-transform duration-300 ${openDropdown === 'courses' ? 'rotate-135' : '-rotate-45 -mt-1'}`} />
                            </button>
                            {openDropdown === 'courses' && renderDropdown(navData.courses, 'courses')}
                        </div>
                        
                        <div data-dropdown className="relative">
                            <button onClick={() => handleDropdownToggle('platforms')} className={`flex items-center gap-1.5 py-3 px-4 text-white/90 bg-transparent border-none font-semibold text-sm leading-[22px] rounded-lg cursor-pointer ${currentTheme.bgHover}`}>
                                {navData.platforms.title}
                                <span className={`w-2 h-2 border-l-2 border-b-2 border-current transition-transform duration-300 ${openDropdown === 'platforms' ? 'rotate-135' : '-rotate-45 -mt-1'}`} />
                            </button>
                            {openDropdown === 'platforms' && renderDropdown(navData.platforms, 'platforms')}
                        </div>

                        <div data-dropdown className="relative">
                            <button onClick={() => handleDropdownToggle('design')} className={`flex items-center gap-1.5 py-3 px-4 text-white/90 bg-transparent border-none font-semibold text-sm leading-[22px] rounded-lg cursor-pointer ${currentTheme.bgHover}`}>
                                {navData.design.title}
                                <span className={`w-2 h-2 border-l-2 border-b-2 border-current transition-transform duration-300 ${openDropdown === 'design' ? 'rotate-135' : '-rotate-45 -mt-1'}`} />
                            </button>
                            {openDropdown === 'design' && renderDropdown(navData.design, 'design')}
                        </div>
                        
                        <div data-dropdown className="relative">
                            <button onClick={() => handleDropdownToggle('video')} className={`flex items-center gap-1.5 py-3 px-4 text-white/90 bg-transparent border-none font-semibold text-sm leading-[22px] rounded-lg cursor-pointer ${currentTheme.bgHover}`}>
                                {navData.video.title}
                                <span className={`w-2 h-2 border-l-2 border-b-2 border-current transition-transform duration-300 ${openDropdown === 'video' ? 'rotate-135' : '-rotate-45 -mt-1'}`} />
                            </button>
                            {openDropdown === 'video' && renderDropdown(navData.video, 'video')}
                        </div>

                        <div data-dropdown className="relative">
                            <button onClick={() => handleDropdownToggle('theme')} className={`flex items-center gap-1.5 py-3 px-4 text-white/90 bg-transparent border-none font-semibold text-sm leading-[22px] rounded-lg cursor-pointer ${currentTheme.bgHover}`}>
                                {navData.theme.title}
                                <span className={`w-2 h-2 border-l-2 border-b-2 border-current transition-transform duration-300 ${openDropdown === 'theme' ? 'rotate-135' : '-rotate-45 -mt-1'}`} />
                            </button>
                            {openDropdown === 'theme' && renderDropdown(navData.theme, 'theme')}
                        </div>
                        
                        {isExternalDmca ? (
                            <a href={config.dmcaLinkUrl} target="_blank" rel="noopener noreferrer" className={dmcaButtonClasses}>{config.dmcaLinkText}</a>
                        ) : (
                            <Link href={config.dmcaLinkUrl} className={dmcaButtonClasses}>{config.dmcaLinkText}</Link>
                        )}
                        
                        <button onClick={onSearchOpen} className={`${currentTheme.bgActive} border ${currentTheme.border} p-3 rounded-lg ${currentTheme.text} cursor-pointer flex items-center justify-center hover:bg-opacity-20 transition-colors`}>
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </button>
                    </nav>
                    
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`lg:hidden flex flex-col gap-[5px] ${currentTheme.bgMobile} border ${currentTheme.border} p-2.5 rounded-lg cursor-pointer z-[60] relative`}>
                        <span className={`w-6 h-0.5 ${isMenuOpen ? 'bg-white' : (theme === 'iris' ? 'bg-[#7de8d0]' : theme === 'pristine' ? 'bg-[#ff6b81]' : 'bg-[#D92626]')} rounded-sm transition-all duration-300 ${isMenuOpen ? `rotate-45 translate-y-[7px]` : ''}`}></span>
                        <span className={`w-6 h-0.5 ${isMenuOpen ? 'bg-white' : (theme === 'iris' ? 'bg-[#7de8d0]' : theme === 'pristine' ? 'bg-[#ff6b81]' : 'bg-[#D92626]')} rounded-sm transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`w-6 h-0.5 ${isMenuOpen ? 'bg-white' : (theme === 'iris' ? 'bg-[#7de8d0]' : theme === 'pristine' ? 'bg-[#ff6b81]' : 'bg-[#D92626]')} rounded-sm transition-all duration-300 ${isMenuOpen ? `-rotate-45 -translate-y-[7px]` : ''}`}></span>
                    </button>
                </div>
            </header>
            
            {/* Mobile Menu Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Menu - RIGHT Side Drawer (Madbax Style - 300px) */}
            <div className={`fixed top-0 right-0 w-[300px] h-full bg-[#0d1614] z-50 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] lg:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Mobile Menu Content Container with Scroll */}
                {/* FIX: Added pb-40 to ensure content isn't cut off at bottom */}
                <div className="p-6 h-full overflow-y-auto pb-40 custom-scrollbar">
                    
                    {/* Explicit Close Button inside Drawer */}
                    <div className="flex justify-end mb-4">
                         <button 
                            onClick={() => setIsMenuOpen(false)} 
                            className={`p-2 rounded-full border ${currentTheme.border} ${currentTheme.text} hover:bg-white/5 transition-colors`}
                        >
                            <FeatherIcon name="x-octagon" size={24} />
                        </button>
                    </div>

                    {/* Search (Top) */}
                    <button onClick={handleSearchClick} className="block w-full text-left p-4 text-white/90 bg-transparent border-none font-semibold text-base rounded-lg mb-2">Search</button>
                    
                    {/* Premium */}
                    <Link href={premiumLinkHref} onClick={handleLinkClick} className="block w-full text-left p-4 text-white/90 bg-transparent border-none font-semibold text-base rounded-lg mb-2">{navData.premium.title}</Link>
                    
                    {/* Courses */}
                    {renderMobileDropdown(navData.courses, 'courses')}
                    
                    {/* Platforms Removed from Mobile */}
                    <div className="hidden lg:block">
                        {renderMobileDropdown(navData.platforms, 'platforms')}
                    </div>
                    
                    {/* Design */}
                    {renderMobileDropdown(navData.design, 'design')}
                    
                    {/* Video */}
                    {renderMobileDropdown(navData.video, 'video')}

                    {/* Theme (Bottom) */}
                    {renderMobileDropdown(navData.theme, 'theme')}

                    {/* DMCA Button (Mobile Only) */}
                    <div className="mt-4 pt-4 border-t border-white/5">
                        {isExternalDmca ? (
                            <a href={config.dmcaLinkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-4 px-6 border border-white/10 rounded-xl text-white/60 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all font-bold text-xs uppercase tracking-widest no-underline text-center">
                                {config.dmcaLinkText}
                            </a>
                        ) : (
                            <Link href={config.dmcaLinkUrl} onClick={handleLinkClick} className="flex items-center justify-center w-full py-4 px-6 border border-white/10 rounded-xl text-white/60 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all font-bold text-xs uppercase tracking-widest no-underline text-center">
                                {config.dmcaLinkText}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
