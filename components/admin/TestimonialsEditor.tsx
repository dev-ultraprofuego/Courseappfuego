
import React from 'react';
import type { Testimonial, Theme } from '@/types';
import FeatherIcon from '../FeatherIcon';

interface TestimonialsEditorProps {
    testimonials: Testimonial[];
    onChange: (testimonials: Testimonial[]) => void;
    theme: Theme;
    t: any;
    inputClass: string;
    textareaClass: string;
    confirmAction?: (title: string, desc: string, action: () => void, isDanger: boolean) => void;
}

const TestimonialsEditor: React.FC<TestimonialsEditorProps> = ({ testimonials, onChange, theme, t, inputClass, textareaClass, confirmAction }) => {
    
    const handleAdd = () => {
        const newTestimonial: Testimonial = { author: '', text: '', stars: 5 };
        onChange([newTestimonial, ...testimonials]);
    };
    
    const handleDelete = (index: number) => {
        const action = () => onChange(testimonials.filter((_, i) => i !== index));
        
        if (confirmAction) {
            confirmAction("Supprimer ce témoignage ?", "Cette action est irréversible.", action, true);
        } else if (window.confirm("Supprimer ce témoignage ?")) {
            action();
        }
    };

    const handleChange = (index: number, field: keyof Testimonial, value: string | number) => {
        onChange(testimonials.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const labelClass = `block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 font-heading`;
    
    // Theme-specific glow color
    const glowColor = theme === 'iris' ? "rgba(45,212,191,0.6)" : (theme === 'pristine' ? "rgba(255,71,87,0.6)" : "rgba(217,38,38,0.6)");

    const renderStarsInput = (currentStars: number, index: number) => {
        return (
            <div className="flex gap-1 h-[42px] items-center px-3 bg-[#050505] border border-white/10 rounded-lg">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleChange(index, 'stars', star)}
                        className={`focus:outline-none transition-transform hover:scale-110 ${star <= currentStars ? 'text-yellow-400' : 'text-gray-700 hover:text-yellow-500/50'}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </button>
                ))}
            </div>
        );
    };

    const themeButtonClass = theme === 'iris' ? 'bg-teal-600 hover:bg-teal-500' : 'bg-[#D92626] hover:bg-[#F24444]';

    return (
        <div className="max-w-7xl mx-auto pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10 mb-10">
                {/* Left Column: Context */}
                <div className="lg:col-span-1 p-6 bg-[#0a0d0c] border border-white/5 rounded-xl h-fit sticky top-24">
                     <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                        <FeatherIcon name="heart" size={24} className={theme === 'iris' ? 'text-teal-500' : 'text-red-500'} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 font-heading">{t.testimonials}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6">
                        Gérez la preuve sociale de votre site ("Wall of Love"). Ajoutez les retours de vos clients pour bâtir la confiance.
                    </p>
                    <button 
                        onClick={handleAdd} 
                        className="group relative flex items-center justify-center gap-2 bg-gradient-to-b from-[#161a19] to-[#0a0d0c] text-white font-bold py-2.5 px-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-[#131615] hover:border-white/20 font-heading text-xs uppercase tracking-wide w-full"
                        style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.4)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 20px ${glowColor}` }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.4)' }}
                    >
                        <FeatherIcon name="plus-circle" size={16} />
                        {t.addTestimonial}
                    </button>
                </div>

                {/* Right Column: Content List */}
                <div className="lg:col-span-2 space-y-4">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="group bg-[#0a0d0c] border border-white/5 p-5 rounded-xl hover:border-white/10 transition-all relative">
                            {/* Header with Delete */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#111413] border border-white/5 flex items-center justify-center text-xs font-bold text-gray-400">
                                        {testimonial.author.charAt(0) || '?'}
                                    </div>
                                    <span className="text-xs font-mono text-gray-600">#{index + 1}</span>
                                </div>
                                <button 
                                    onClick={() => handleDelete(index)} 
                                    className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <FeatherIcon name="trash-2" size={14}/>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <label className="block">
                                    <span className={labelClass}>{t.author}</span>
                                    <input 
                                        type="text" 
                                        value={testimonial.author} 
                                        onChange={e => handleChange(index, 'author', e.target.value)} 
                                        className={inputClass} 
                                        placeholder={t.placeholders.clientName}
                                    />
                                </label>
                                <label className="block">
                                    <span className={labelClass}>{t.stars}</span>
                                    {renderStarsInput(testimonial.stars, index)}
                                </label>
                            </div>
                            
                            <label className="block">
                                <span className={labelClass}>{t.text}</span>
                                <textarea 
                                    value={testimonial.text} 
                                    onChange={e => handleChange(index, 'text', e.target.value)} 
                                    className={`${textareaClass} h-24 resize-y`} 
                                    placeholder={t.placeholders.comment}
                                />
                            </label>
                        </div>
                    ))}
                    
                    {testimonials.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-xl text-gray-600">
                            <p className="text-sm">Aucun témoignage pour le moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestimonialsEditor;