
'use client';
import React, { useRef } from 'react';
import Link from 'next/link';
import type { Theme, SiteConfig } from '../types';

interface HeroProps {
    theme: Theme;
    config: SiteConfig;
}


const Hero: React.FC<HeroProps> = ({ theme, config }) => {
    const heroRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLButtonElement>(null);

     const themeClasses = {
        iris: {
            // Forced Red Style for Iris as requested
            badgeBg: "bg-gradient-to-b from-[rgba(255,71,87,0.08)] to-[rgba(255,71,87,0.03)]",
            badgeText: "text-[#ff6b81]",
            badgeBorder: "border-[rgba(255,71,87,0.12)]",
            badgeShadow: "shadow-[0_0_15px_rgba(255,71,87,0.3)]",
            titleGradient: "from-white/95 via-[#ff4757]/70 to-[#ff6b81]/50",
            ctaBg: "bg-gradient-to-r from-[rgba(255,71,87,0.18)] to-[rgba(255,107,129,0.13)]",
            ctaBorder: "border-[rgba(255,71,87,0.18)]",
            burstBg: '#ff4757',
            burstShadow: '0 0 12px #ff4757',
            checkBg: '#ff4757',
        },
        pristine: {
            badgeBg: "bg-gradient-to-b from-[rgba(255,71,87,0.08)] to-[rgba(255,71,87,0.03)]",
            badgeText: "text-[#ff6b81]",
            badgeBorder: "border-[rgba(255,71,87,0.12)]",
            badgeShadow: "shadow-[0_0_15px_rgba(255,71,87,0.3)]",
            titleGradient: "from-white/95 via-[#ff4757]/70 to-[#ff6b81]/50",
            ctaBg: "bg-gradient-to-r from-[rgba(255,71,87,0.18)] to-[rgba(255,107,129,0.13)]",
            ctaBorder: "border-[rgba(255,71,87,0.18)]",
            burstBg: '#ff4757',
            burstShadow: '0 0 12px #ff4757',
            checkBg: '#ff4757',
        },
        boss: {
            badgeBg: "bg-gradient-to-b from-[rgba(217,38,38,0.15)] to-[rgba(217,38,38,0.05)]",
            badgeText: "text-[#F24444]",
            badgeBorder: "border-[rgba(217,38,38,0.25)]",
            badgeShadow: "shadow-[0_0_20px_rgba(217,38,38,0.4)]",
            titleGradient: "from-white/95 via-[#D92626]/80 to-[#F24444]/60",
            ctaBg: "bg-gradient-to-r from-[rgba(217,38,38,0.3)] to-[rgba(242,68,68,0.2)]",
            ctaBorder: "border-[rgba(217,38,38,0.4)]",
            burstBg: '#D92626',
            burstShadow: '0 0 15px #D92626',
            checkBg: '#D92626',
        }
    };

    const currentTheme = themeClasses[theme];

    // Shared burst logic
    const createBursts = (sourceElement?: HTMLElement) => {
        if (!heroRef.current) return;
        
        let sourceRect: DOMRect | undefined;
        
        // Always use the passed element if available (Robust Fix for Desktop & Mobile)
        if (sourceElement) {
            sourceRect = sourceElement.getBoundingClientRect();
        } else if (ctaRef.current) {
            sourceRect = ctaRef.current.getBoundingClientRect();
        }

        if (!sourceRect) return;

        const host = heroRef.current;
        const hostRect = host.getBoundingClientRect();

        for (let i = 0; i < 12; i++) {
            const burst = document.createElement('div');
            const size = 4 + Math.random() * 5;
            Object.assign(burst.style, {
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                background: currentTheme.burstBg,
                boxShadow: currentTheme.burstShadow,
                left: `${sourceRect.left + sourceRect.width / 2 - hostRect.left}px`,
                top: `${sourceRect.top + sourceRect.height / 2 - hostRect.top}px`,
                transform: 'translate(-50%, -50%) scale(1)',
                opacity: '1',
                pointerEvents: 'none',
                zIndex: '10',
                transition: 'transform 0.7s cubic-bezier(0.2,0.8,0.7,1), opacity 0.7s ease-out'
            });

            const angle = Math.random() * Math.PI * 2;
            const distance = 60 + Math.random() * 80;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;

            host.appendChild(burst);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    burst.style.transform = `translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px)) scale(0)`;
                    burst.style.opacity = '0';
                });
            });
            setTimeout(() => burst.remove(), 800);
        }
    };

    const CtaButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => (
        <button 
            ref={ref}
            {...props}
            className={`animate-fadeInUp inline-flex items-center justify-center gap-3 no-underline text-white mt-2 rounded-2xl py-4 px-10 text-[clamp(1.5rem,3vw,2.2rem)] font-bold border-2 shadow-[0_4px_20px_rgba(0,0,0,0.4)] cursor-pointer transition-transform hover:scale-105 ${currentTheme.ctaBg} ${currentTheme.ctaBorder} w-full sm:w-auto`}
            style={{ animationDelay: '0.3s' }}
            onClick={(e) => {
                // FIX: Pass currentTarget to ensure burst works even after navigation back
                createBursts(e.currentTarget);
                if (props.onClick) props.onClick(e);
            }}
        >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill={currentTheme.checkBg}></circle><path d="M12.5 16.5L15.5 19.5L20 15" stroke="#0a0f0e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            <span>{config.heroCta.ctaText}</span>
        </button>
    ));
    CtaButton.displayName = "CtaButton";


    return (
        <div ref={heroRef} className="relative">
            {/* --- MOBILE VIEW (Madbax Style Refined) --- */}
            <div className="md:hidden flex flex-col items-center pt-10 pb-12 px-4 w-full">
                
                {/* 1. Badge */}
                <div 
                    className={`small-pill animate-fadeInUp border ${currentTheme.badgeBg} ${currentTheme.badgeText} ${currentTheme.badgeBorder} ${currentTheme.badgeShadow}`}
                    style={{ animationDelay: '0.1s' }}
                >
                    {config.heroBadgeText}
                </div>

                {/* 2. Title */}
                <h1 
                    className={`animate-fadeInUp text-center text-transparent bg-clip-text bg-gradient-to-b ${currentTheme.titleGradient} font-['SF_Pro_Display',-apple-system,sans-serif] mb-6`}
                    style={{
                        fontSize: '28px',
                        lineHeight: '1.08',
                        letterSpacing: '-1px',
                        fontWeight: 800,
                        animationDelay: '0.2s'
                    }}
                >
                    Tous Les Cours Dont Vous<br/>
                    Avez Besoin en Un Seul<br/>
                    Endroit
                </h1>

                {/* 3. Button (Compact width + Padding px-10) */}
                <a 
                    href={config.heroCta.action === 'internal' ? '/pricing' : config.heroCta.externalUrl} 
                    className="mb-4 relative group animate-fadeInUp inline-block w-auto"
                    style={{ animationDelay: '0.3s' }}
                    onClick={(e) => {
                        createBursts(e.currentTarget);
                    }}
                >
                    <div className={`h-[59px] rounded-2xl flex items-center justify-center gap-3 border-2 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-transform duration-100 active:scale-[0.96] px-10 ${currentTheme.ctaBg} ${currentTheme.ctaBorder}`}>
                        <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center shadow-sm flex-shrink-0" style={{ backgroundColor: currentTheme.checkBg }}>
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span className="text-[17px] font-bold text-white whitespace-nowrap">Get all Courses</span>
                    </div>
                </a>

                {/* 4. Subtext (Strict 3 Lines) */}
                <p 
                    className="animate-fadeInUp text-[#a1a1aa] text-center font-['SF_Pro_Display',-apple-system,sans-serif] px-1"
                    style={{
                        fontSize: '13px', 
                        lineHeight: '1.45',
                        fontWeight: 700,
                        animationDelay: '0.4s'
                    }}
                >
                    Accès aux cours d'Ecommerce,<br/>
                    smma, copywriting, saas, UX/UI des meilleurs<br/>
                    formateurs et créateurs
                </p>
            </div>

            {/* --- DESKTOP VIEW (Original - RESTORED) --- */}
            <div className="hidden md:block text-center py-16 px-5 relative overflow-hidden">
                <div
                    className={`animate-fadeInUp inline-block mb-4 py-2.5 px-4 rounded-full font-bold text-sm border ${currentTheme.badgeBg} ${currentTheme.badgeText} ${currentTheme.badgeBorder} ${currentTheme.badgeShadow}`}
                    style={{ animationDelay: '0.1s' }}
                >
                    {config.heroBadgeText}
                </div>
                <h1 
                    className={`animate-fadeInUp font-bold text-[clamp(2.6rem,7vw,4.2rem)] leading-tight -tracking-wider bg-gradient-to-b bg-clip-text text-transparent mb-5 ${currentTheme.titleGradient}`}
                    style={{ animationDelay: '0.2s' }}
                >
                    Tous les Cours Dont Vous Avez Besoin
                    <br />
                    En Un Seul Endroit
                </h1>

                {config.heroCta.action === 'internal' ? (
                    <Link href="/pricing" passHref legacyBehavior>
                        <CtaButton ref={ctaRef} />
                    </Link>
                ) : (
                    <a href={config.heroCta.externalUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <CtaButton ref={ctaRef} />
                    </a>
                )}

                <p 
                    className="animate-fadeInUp mt-5 text-white/[0.65] text-[20px] leading-[30px] font-bold max-w-3xl mx-auto"
                    style={{ animationDelay: '0.4s', fontFamily: '"SF Pro Display", -apple-system, sans-serif' }}
                >
                    Accès aux cours d'Ecommerce, smma, copywriting,<br />
                    saas, UX/UI des meilleurs formateurs et créateurs
                </p>
            </div>
        </div>
    );
};

export default Hero;
