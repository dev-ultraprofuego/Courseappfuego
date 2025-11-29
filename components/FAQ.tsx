
// Fix: Import React to fix JSX syntax errors.
import React, { useState } from 'react';
import type { FAQProps } from '../types';

const FAQ: React.FC<FAQProps> = ({ theme, faqItems }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const themeClasses = {
        iris: {
            // Forced Red Style for Iris as requested to match Hero/WallOfLove
            title: "text-[#ff6b81]",
            border: "border-[rgba(255,71,87,0.12)]",
            borderActive: "border-[#ff6b81]",
            icon: "text-[#ff6b81]",
        },
        pristine: {
            title: "text-[#ff6b81]",
            border: "border-[rgba(255,71,87,0.12)]",
            borderActive: "border-[#ff6b81]",
            icon: "text-[#ff6b81]",
        },
        boss: {
            title: "text-[#F24444]",
            border: "border-[rgba(217,38,38,0.12)]",
            borderActive: "border-[#F24444]",
            icon: "text-[#F24444]",
        }
    };
    
    const currentTheme = themeClasses[theme];

    return (
        <section className="max-w-3xl mx-auto my-16 px-5">
            <h2 className={`text-center text-4xl font-bold mb-10 ${currentTheme.title}`}>Frequently Asked Questions</h2>
            {faqItems.map((faq, index) => (
                <div 
                    key={index} 
                    className={`border rounded-lg mb-4 bg-white/5 overflow-hidden transition-all duration-300 ${openIndex === index ? currentTheme.borderActive : currentTheme.border}`}
                >
                    <button 
                        onClick={() => setOpenIndex(openIndex === index ? null : index)} 
                        className="bg-none border-none w-full text-left p-5 text-lg font-semibold text-white/95 cursor-pointer flex justify-between items-center"
                    >
                        <span className="flex-1">{faq.q}</span>
                        <svg 
                            className={`transition-transform duration-300 flex-shrink-0 ml-4 ${currentTheme.icon} ${openIndex === index ? 'rotate-180' : 'rotate-0'}`} 
                            width="20" height="20" fill="currentColor" viewBox="0 0 16 16"
                        >
                            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                        </svg>
                    </button>
                    <div className={`transition-all duration-400 ease-in-out ${openIndex === index ? 'max-h-48' : 'max-h-0'}`}>
                        <div className="px-5 pb-5 text-white/70">{faq.a}</div>
                    </div>
                </div>
            ))}
        </section>
    );
};

export default FAQ;
