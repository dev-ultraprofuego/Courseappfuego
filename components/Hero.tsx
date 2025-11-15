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
            badgeBg: "bg-gradient-to-b from-[rgba(217,38,38,0.08)] to-[rgba(217,38,38,0.03)]",
            badgeText: "text-[#F24444]",
            badgeBorder: "border-[rgba(217,38,38,0.12)]",
            badgeShadow: "shadow-[0_0_15px_rgba(217,38,38,0.3)]",
            titleGradient: "from-white/95 via-[#D92626]/70 to-[#F24444]/50",
            ctaBg: "bg-gradient-to-r from-[rgba(217,38,38,0.18)] to-[rgba(242,68,68,0.13)]",
            ctaBorder: "border-[rgba(217,38,38,0.18)]",
            burstBg: '#D92626',
            burstShadow: '0 0 12px #D92626',
            checkBg: '#D92626',
        }
    };
    const currentTheme = themeClasses[theme];

    const createBursts = (count = 12) => {
        if (!heroRef.current || !ctaRef.current) return;
        const host = heroRef.current;
        const sourceRect = ctaRef.current.getBoundingClientRect();
        const hostRect = host.getBoundingClientRect();

        for (let i = 0; i < count; i++) {
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
                createBursts();
                if (props.onClick) props.onClick(e);
            }}
        >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill={currentTheme.checkBg}></circle><path d="M12.5 16.5L15.5 19.5L20 15" stroke="#0a0f0e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            <span>{config.heroCta.ctaText}</span>
        </button>
    ));
    CtaButton.displayName = "CtaButton";


    return (
        <div ref={heroRef} className="text-center py-16 px-5 relative overflow-hidden">
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
    );
};

export default Hero;