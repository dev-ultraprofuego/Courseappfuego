
// Fix: Import React to fix JSX syntax errors.
import React, { useState, useEffect, useRef } from 'react';
import type { PricingPageProps, PricingTier, Theme } from '../types';
import WallofLove from './WallofLove';
import { testimonials as defaultTestimonials } from '../constants/data';

const PricingPage: React.FC<PricingPageProps> = ({ theme, tiers }) => {
    const [activeSection, setActiveSection] = useState<'fr' | 'us'>(tiers[0]?.id || 'fr');
    const switchRef = useRef<HTMLDivElement>(null);
    const pillRef = useRef<HTMLDivElement>(null);

    const activeTier = tiers.find(t => t.id === activeSection);

    const movePill = (targetButton: HTMLElement) => {
        if (!targetButton || !pillRef.current || !switchRef.current) return;
        const targetRect = targetButton.getBoundingClientRect();
        const switchRect = switchRef.current.getBoundingClientRect();

        const translateX = targetRect.left - switchRect.left;
        const translateY = targetRect.top - switchRect.top;

        pillRef.current.style.width = `${targetButton.offsetWidth}px`;
        pillRef.current.style.height = `${targetButton.offsetHeight}px`;
        pillRef.current.style.transform = `translate(${translateX}px, ${translateY}px) translateZ(0)`;
    };

    useEffect(() => {
        const initialButton = switchRef.current?.querySelector(`[data-section="${activeSection}"]`) as HTMLElement;
        if (initialButton) {
            setTimeout(() => movePill(initialButton), 150);
        }
    }, [activeSection, tiers]);

    useEffect(() => {
        const handleResize = () => {
            const activeButton = switchRef.current?.querySelector('.active') as HTMLElement;
            if (activeButton) {
                movePill(activeButton);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeSection]);


    const handleToggle = (sectionId: 'fr' | 'us') => {
        setActiveSection(sectionId);
    };

    const getCardStyles = (theme: Theme) => {
        switch (theme) {
            case 'iris':
                return {
                    '--mint': '#66a68e', '--mint-light': '#74b49b', '--check': '#28c76f',
                    '--cta-border': 'rgba(116,180,155,0.35)', '--popular-border': 'rgba(116,180,155,0.18)',
                } as React.CSSProperties;
            case 'pristine':
                return {
                    '--mint': '#ff4757', '--mint-light': '#ff6b81', '--check': '#ff6b81',
                    '--cta-border': 'rgba(255,71,87,0.35)', '--popular-border': 'rgba(255,71,87,0.18)',
                } as React.CSSProperties;
            case 'boss':
                 return {
                    '--mint': '#D92626', '--mint-light': '#F24444', '--check': '#F24444',
                    '--cta-border': 'rgba(217,38,38,0.35)', '--popular-border': 'rgba(217,38,38,0.18)',
                } as React.CSSProperties;
        }
    };
    
    const cardStyles = getCardStyles(theme);


    return (
        <div className={`bg-gradient-to-b from-[#0f1513] to-[#070707] text-white font-['Poppins',_sans_serif] py-12 ${theme}`}>
            <style>{pricingStyles}</style>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center my-10">
                    <div ref={switchRef} className="relative bg-[rgba(15,20,19,0.6)] border border-white/10 rounded-full p-1 gap-1 md:p-1.5 md:gap-2 inline-flex backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.4)] flex-wrap justify-center">
                        <div ref={pillRef} className="active-pill absolute top-0 left-0 rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"></div>
                        {tiers.map(tier => (
                             <button key={tier.id} className={`toggle-option py-2 px-4 text-xs md:py-3 md:px-6 md:text-base rounded-full font-semibold cursor-pointer transition-colors duration-400 border-none bg-transparent flex items-center gap-2.5 relative z-10 ${activeSection === tier.id ? 'text-white active' : 'text-white/60 hover:text-white/90'}`} data-section={tier.id} onClick={() => handleToggle(tier.id)}>
                              <span>{tier.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="subtitle-row flex items-center justify-center gap-5 my-3.5">
                    <div className="line h-0.5 flex-1 max-w-lg bg-white/10 rounded-full"></div>
                    <div className="subtitle text-xl font-semibold px-3">Choose your Subscription</div>
                    <div className="line h-0.5 flex-1 max-w-lg bg-white/10 rounded-full"></div>
                </div>
                <div className="trusted flex items-center justify-center gap-4 mb-7 text-sm text-white/75">
                    <span>Trusted by 10,000+ Subscribers</span>
                </div>


                <main>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7" style={cardStyles}>
                       {activeTier && activeTier.plans.map(plan => (
                             <section key={plan.id} className={`card bg-gradient-to-b from-white/5 to-black/20 rounded-[20px] border border-white/10 p-9 flex flex-col justify-between relative overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2 ${plan.isPopular ? 'popular z-10' : ''}`}>
                                 {plan.isPopular && <div className="absolute top-5 -right-9 w-36 text-center bg-[var(--mint)] text-white font-extrabold text-[13px] tracking-wider py-[7px] rotate-45 shadow-md">POPULAR</div>}
                                 <div>
                                  <h2 className="text-2xl font-extrabold mb-2.5">{plan.name}</h2>
                                  <div className="text-white/40 text-[15px] mb-4">{plan.duration}</div>
                                  <div className="my-5">
                                    <div className="font-['Montserrat',_sans_serif] font-black text-7xl leading-none" style={{color: 'var(--mint-light)'}}>{plan.price}<sup className="text-3xl align-baseline ml-1.5">$</sup></div>
                                    <div className="text-base font-bold mt-1.5" style={{color: 'var(--mint-light)'}}>{plan.priceDetails}</div>
                                  </div>
                                  <ul className="feature-list text-white/60 text-base leading-loose space-y-2.5 list-none p-0">
                                    {plan.features.map((feature, i) => <li key={i} className="relative pl-6">{feature}</li>)}
                                  </ul>
                                </div>
                                <div className="mt-4 flex flex-col items-center gap-3">
                                  <a className={`cta py-3.5 px-12 rounded-2xl border-2 bg-transparent text-white font-extrabold text-lg no-underline transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${plan.isPopular ? 'animate-pulse-glow' : ''}`} href={plan.ctaUrl} target="_blank" rel="noopener noreferrer" style={{borderColor: 'var(--cta-border)'}}>{plan.ctaText}</a>
                                  <div className="text-sm text-white/40">{plan.finePrint}</div>
                                </div>
                            </section>
                       ))}
                    </div>
                </main>
            </div>

            <div className="mt-24">
                <WallofLove theme={theme} testimonials={defaultTestimonials} />
            </div>

        </div>
    );
};

const pricingStyles = `
    .feature-list li::before {
        content: '✓';
        position: absolute;
        left: 0;
        color: var(--check);
        font-weight: 800;
    }
    .iris .feature-list li::before {
         text-shadow: 0 0 6px rgba(40,199,111,0.5);
    }
    .pristine .feature-list li::before, .boss .feature-list li::before {
         text-shadow: 0 0 6px rgba(255,107,129,0.5);
    }
    @keyframes pulse-glow-iris {
        0% { box-shadow: 0 10px 36px rgba(116,180,155,0.16); }
        50% { box-shadow: 0 10px 36px rgba(116,180,155,0.16), 0 0 15px rgba(116, 180, 155, 0.5); }
        100% { box-shadow: 0 10px 36px rgba(116,180,155,0.16); }
    }
    @keyframes pulse-glow-pristine {
        0% { box-shadow: 0 10px 36px rgba(255,71,87,0.16); }
        50% { box-shadow: 0 10px 36px rgba(255,71,87,0.16), 0 0 15px rgba(255,71,87,0.5); }
        100% { box-shadow: 0 10px 36px rgba(255,71,87,0.16); }
    }
     @keyframes pulse-glow-boss {
        0% { box-shadow: 0 10px 36px rgba(217,38,38,0.16); }
        50% { box-shadow: 0 10px 36px rgba(217,38,38,0.16), 0 0 15px rgba(217,38,38,0.5); }
        100% { box-shadow: 0 10px 36px rgba(217,38,38,0.16); }
    }
    .iris .animate-pulse-glow { animation: pulse-glow-iris 3s infinite ease-in-out; }
    .pristine .animate-pulse-glow { animation: pulse-glow-pristine 3s infinite ease-in-out; }
    .boss .animate-pulse-glow { animation: pulse-glow-boss 3s infinite ease-in-out; }

    .iris .active-pill {
         background: linear-gradient(135deg, #74b49b, #66a68e);
         box-shadow: 0 4px 12px rgba(116,180,155,0.3);
    }
     .pristine .active-pill {
         background: linear-gradient(135deg, #ff6b81, #ff4757);
         box-shadow: 0 4px 12px rgba(255,71,87,0.3);
    }
    .boss .active-pill {
        background: linear-gradient(135deg, #F24444, #D92626);
        box-shadow: 0 4px 12px rgba(217,38,38,0.3);
    }
    .pristine .card.popular {
        background-image: linear-gradient(to bottom, rgba(45,22,30,0.55), rgba(0,0,0,0.4));
    }
    .boss .card.popular {
        background-image: linear-gradient(to bottom, rgba(45,22,30,0.55), rgba(0,0,0,0.4));
    }
    .iris .card.popular {
         background-image: linear-gradient(to bottom, rgba(22,45,39,0.55), rgba(0,0,0,0.4));
    }
`;

export default PricingPage;
