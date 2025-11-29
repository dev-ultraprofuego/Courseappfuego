
'use client';
import React, { useState, useEffect } from 'react';
import type { Testimonial, Theme, SiteConfig } from '@/types';
import FeatherIcon from '../FeatherIcon';
import { generateReviewTokenAction } from '@/app/actions';

interface TestimonialsEditorProps {
    testimonials: Testimonial[];
    onChange: (testimonials: Testimonial[]) => void;
    theme: Theme;
    t: any;
    inputClass: string;
    textareaClass: string;
    confirmAction?: (title: string, desc: string, action: () => void, isDanger: boolean) => void;
    notify?: (message: string, type: 'success' | 'error' | 'info') => void;
    onRefresh?: () => Promise<void>;
    config?: SiteConfig;
    onLog?: (action: string, details: string) => void;
}

const TestimonialsEditor: React.FC<TestimonialsEditorProps> = ({ testimonials, onChange, theme, t, inputClass, textareaClass, confirmAction, notify, onRefresh, config, onLog }) => {
    const [origin, setOrigin] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);
    
    const handleAdd = () => {
        const newTestimonial: Testimonial = { 
            author: '', 
            text: '', 
            stars: 5, 
            status: 'published',
            source: 'manual', // Mark as manual/admin
            id: Date.now().toString(),
            date: new Date().toISOString() 
        };
        // Add to top
        onChange([newTestimonial, ...testimonials]);
    };
    
    const handleDelete = (e: React.MouseEvent, testimonialToDelete: Testimonial) => {
        e.preventDefault();
        e.stopPropagation();

        const action = () => {
            const updatedList = testimonials.filter((t) => {
                // 1. If both have IDs, compare IDs (New standard)
                if (t.id && testimonialToDelete.id) {
                    return t.id !== testimonialToDelete.id;
                }
                // 2. If one has ID and other doesn't, they are different
                if (!!t.id !== !!testimonialToDelete.id) {
                    return true;
                }
                // 3. If neither has ID (Legacy), compare Content strict equality
                return t.author !== testimonialToDelete.author || t.text !== testimonialToDelete.text;
            });

            onChange(updatedList);
            if (notify) notify("Témoignage supprimé", "error");
        };
        
        if (confirmAction) {
            confirmAction("Supprimer ce témoignage ?", "Cette action est irréversible.", action, true);
        } else if (window.confirm("Supprimer ce témoignage ?")) {
            action();
        }
    };

    const handleValidate = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        // Preserve existing data, just update status
        onChange(testimonials.map((t) => t.id === id ? { ...t, status: 'published' } : t));
        if(notify) notify("Témoignage validé et publié", "success");
    };

    const handleChange = (id: string, field: keyof Testimonial, value: string | number) => {
        onChange(testimonials.map((t) => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleRefresh = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isRefreshing) return;
        setIsRefreshing(true);
        
        try {
            if (onRefresh) {
                await onRefresh();
            } 
            // Removed window.location.reload() to prevent full page refresh
            if(notify) notify("Données actualisées", "success");
        } catch (error) {
            if(notify) notify("Erreur lors de l'actualisation", "error");
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleGenerateReviewLink = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsGenerating(true);
        try {
            const result = await generateReviewTokenAction();
            
            if (result.success && result.token) {
                const link = `${origin}/review/${result.token}`;
                navigator.clipboard.writeText(link);
                if(notify) notify("Lien sécurisé copié !", "info");
                // Log the action with specific phrase
                if(onLog) onLog('LINK_COPY', 'Un nouveau lien|Témoignage > Lien');
            } else {
                if(notify) notify("Erreur génération lien.", "error");
            }
        } catch (e) {
            if(notify) notify("Erreur serveur.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const labelClass = `block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 font-heading`;
    
    const glowColor = theme === 'iris' ? "rgba(45,212,191,0.6)" : (theme === 'pristine' ? "rgba(255,71,87,0.6)" : "rgba(217,38,38,0.6)");

    const renderStarsInput = (currentStars: number, id: string) => {
        return (
            <div className="flex gap-1 h-[42px] items-center px-3 bg-[#050505] border border-white/10 rounded-lg">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleChange(id, 'stars', star)}
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

    // Tri Intelligent : Pending > Manual (Admin) > External (Public)
    const sortedTestimonials = [...testimonials].sort((a, b) => {
        // 1. PENDING always First
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        // If both pending, sort by date newest first
        if (a.status === 'pending' && b.status === 'pending') {
             return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        }
        
        // If both are not pending (Published/Draft)
        // 2. SOURCE PRIORITY: Manual (Admin) before External (Public)
        // undefined source is treated as 'manual' (legacy admin items)
        const sourceA = a.source || 'manual'; 
        const sourceB = b.source || 'manual';

        if (sourceA === 'manual' && sourceB === 'external') return -1;
        if (sourceA === 'external' && sourceB === 'manual') return 1;

        // 3. DATE DESCENDING (Within same source group)
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateB - dateA; 
    });

    const filteredTestimonials = sortedTestimonials.filter(t => 
        t.author.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper to calculate visual index (Ignoring Pending)
    let publishedCounter = 0;
    const testimonialsWithIndex = filteredTestimonials.map(t => {
        // Count anything that is NOT pending as published (handles 'published', undefined, null)
        if (t.status !== 'pending') { 
            publishedCounter++;
            return { ...t, visualIndex: publishedCounter };
        }
        return { ...t, visualIndex: 0 };
    });

    return (
        <div className="max-w-7xl mx-auto pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10 mb-10">
                
                {/* Left Column: Context - NO MARGIN ADDED HERE */}
                <div className="lg:col-span-1 h-fit sticky top-24 flex flex-col gap-4 transition-all duration-300">
                     <div className="p-6 bg-[#0a0d0c] border border-white/5 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                            <FeatherIcon name="heart" size={24} className={theme === 'iris' ? 'text-teal-500' : 'text-red-500'} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 font-heading">{t.testimonials}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            Gérez la preuve sociale de votre site ("Wall of Love"). Ajoutez les retours de vos clients pour bâtir la confiance.
                        </p>
                        
                        <div className="space-y-3">
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
                    </div>

                    {/* External Tool: Generate Link & Refresh - GHOST MODE INDIVIDUAL */}
                    <div className="flex gap-3 items-center group/tools">
                        <button 
                            onClick={handleGenerateReviewLink}
                            disabled={isGenerating}
                            className="w-9 h-9 flex items-center justify-center bg-[#0a0d0c] text-gray-500 hover:text-white border border-white/5 hover:border-white/20 rounded-lg transition-all duration-200 shadow-sm opacity-0 hover:opacity-100"
                        >
                            {isGenerating ? <FeatherIcon name="loader" size={14} className="animate-spin"/> : <FeatherIcon name="link" size={14} />}
                        </button>
                        
                        <button 
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="w-9 h-9 flex items-center justify-center bg-[#0a0d0c] text-gray-500 hover:text-white border border-white/5 hover:border-white/20 rounded-lg transition-all duration-200 shadow-sm opacity-0 hover:opacity-100"
                        >
                            <div className={`${isRefreshing ? 'animate-spin' : ''}`}>
                                <svg 
                                    width="14" 
                                    height="14" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                >
                                    <path d="M23 4v6h-6"></path>
                                    <path d="M1 20v-6h6"></path>
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Right Column: Content List + Floating Search */}
                <div className="lg:col-span-2 relative">
                    
                    {/* Search Bar - Floating Absolute at Top Right - UNTOUCHED WIDTH w-64 */}
                    <div className="absolute -top-[50px] right-0 w-64 z-10">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FeatherIcon name="search" size={12} className="text-gray-600 group-focus-within:text-white transition-colors" />
                            </div>
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Filtrer par nom..." 
                                className="w-full bg-[#050505] border border-white/10 rounded-full py-2 pl-9 pr-4 text-[11px] text-white placeholder-gray-700 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/5 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {testimonialsWithIndex.map((testimonial, index) => (
                            <div 
                                key={testimonial.id || index} 
                                className={`group bg-[#0a0d0c] border p-5 rounded-xl transition-all relative ${testimonial.status === 'pending' ? 'border-yellow-500/50 shadow-[0_0_15px_-3px_rgba(234,179,8,0.15)]' : 'border-white/5 hover:border-white/10'}`}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#111413] border border-white/5 flex items-center justify-center text-xs font-bold text-gray-400 relative">
                                            {testimonial.author.charAt(0) || '?'}
                                        </div>
                                        
                                        {testimonial.status === 'pending' ? (
                                            <div className="flex items-center gap-2" title="">
                                                <div className="relative flex h-2.5 w-2.5">
                                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                                                </div>
                                            </div>
                                        ) : config?.showLogIndicators && testimonial.source === 'external' && testimonial.status === 'published' ? (
                                            <div className="flex items-center gap-2" title="Avis Public Validé">
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-mono text-gray-600">#{testimonial.visualIndex}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {testimonial.status === 'pending' && (
                                            <button 
                                                onClick={(e) => handleValidate(e, testimonial.id!)}
                                                className="p-2 text-gray-600 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                                title="Valider et Publier"
                                            >
                                                <FeatherIcon name="check" size={14}/>
                                            </button>
                                        )}
                                        <button 
                                            onClick={(e) => handleDelete(e, testimonial)} 
                                            className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <FeatherIcon name="trash-2" size={14}/>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <label className="block">
                                        <span className={labelClass}>{t.author}</span>
                                        <input 
                                            type="text" 
                                            value={testimonial.author} 
                                            onChange={e => handleChange(testimonial.id!, 'author', e.target.value)} 
                                            className={inputClass} 
                                            placeholder={t.placeholders.clientName}
                                        />
                                    </label>
                                    <label className="block">
                                        <span className={labelClass}>{t.stars}</span>
                                        {renderStarsInput(testimonial.stars, testimonial.id!)}
                                    </label>
                                </div>
                                
                                <label className="block">
                                    <span className={labelClass}>{t.text}</span>
                                    <textarea 
                                        value={testimonial.text} 
                                        onChange={e => handleChange(testimonial.id!, 'text', e.target.value)} 
                                        className={`${textareaClass} h-24 resize-y`} 
                                        placeholder={t.placeholders.comment}
                                    />
                                </label>
                            </div>
                        ))}
                        
                        {filteredTestimonials.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-xl text-gray-600">
                                <p className="text-sm">Aucun témoignage trouvé.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestimonialsEditor;
