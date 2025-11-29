
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Course, Theme, SiteConfig, SearchOverlayProps } from '../types';
import FeatherIcon from './FeatherIcon';

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, theme, courses, config }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Course[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const quickActions = [
        { title: 'Browse all Courses', url: '/category/all', icon: 'grid' },
        { title: 'Explore After Effects', url: '/category/after-effects', icon: 'layers' },
        { 
            title: config.heroCta.action === 'internal' ? 'See Pricing Plans' : 'Join Community', 
            url: config.heroCta.action === 'internal' ? '/pricing' : config.heroCta.externalUrl, 
            icon: config.heroCta.action === 'internal' ? 'dollar-sign' : 'external-link' 
        }
    ];

    useEffect(() => {
        if (isOpen) {
            try {
                const storedHistory = localStorage.getItem('content-search-history');
                setHistory(storedHistory ? JSON.parse(storedHistory) : []);
            } catch (e) {
                setHistory([]);
            }
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen]);

    const handleNavigate = (path: string) => {
        router.push(path);
        onClose();
    }

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            
            const isResultView = query.length > 1;
            const currentList = isResultView ? results : (history.length > 0 ? history : quickActions);
            
            if (!currentList.length) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, currentList.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                const item = currentList[selectedIndex];
                if (isResultView) {
                    const course = item as Course;
                    handleNavigate(`/course/${course.id}`);
                } else if (!isResultView && history.length > 0 && query.length <= 1) {
                     handleSearch(item as string);
                } else if (!isResultView && history.length === 0 && query.length <= 1) {
                     handleNavigate((item as any).url);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, results, history, query, selectedIndex]);

    const handleSearch = (value: string) => {
        setQuery(value);
        if (value.length > 1) {
            const filtered = courses.filter(course =>
                course.title.toLowerCase().includes(value.toLowerCase())
            );
            setResults(filtered);
        } else {
            setResults([]);
        }
        setSelectedIndex(-1);
    };

    const addToHistory = (searchTerm: string) => {
        if (!searchTerm) return;
        try {
            const newHistory = [searchTerm, ...history.filter(item => item !== searchTerm)].slice(0, 5);
            setHistory(newHistory);
            localStorage.setItem('content-search-history', JSON.stringify(newHistory));
        } catch (e) {
            console.error('Failed to save search history');
        }
    };

    const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
        addToHistory(query.trim());
    };

    const themeClasses = {
        iris: {
            glow: "shadow-[0_0_40px_-5px_rgba(93,213,184,0.3)] border-teal-500/30",
            icon: "text-teal-400",
            badge: "bg-teal-500/10 text-teal-400 border-teal-500/20",
            highlight: "text-teal-400 bg-teal-500/10",
            itemActive: "bg-teal-500/10 border-teal-500/20"
        },
        pristine: {
            glow: "shadow-[0_0_40px_-5px_rgba(255,71,87,0.3)] border-[#ff4757]/30",
            icon: "text-[#ff6b81]",
            badge: "bg-[#ff4757]/10 text-[#ff6b81] border-[#ff4757]/20",
            highlight: "text-[#ff6b81] bg-[#ff4757]/10",
            itemActive: "bg-[#ff4757]/10 border-[#ff4757]/20"
        },
        boss: {
            glow: "shadow-[0_0_40px_-5px_rgba(217,38,38,0.3)] border-[#D92626]/30",
            icon: "text-[#F24444]",
            badge: "bg-[#D92626]/10 text-[#F24444] border-[#D92626]/20",
            highlight: "text-[#F24444] bg-[#D92626]/10",
            itemActive: "bg-[#D92626]/10 border-[#D92626]/20"
        }
    }
    const currentTheme = themeClasses[theme];
    
    if (!isOpen) return null;

    return (
        <div onClick={onClose} className="fixed inset-0 z-[100] flex flex-col items-center justify-start sm:justify-center pt-0 sm:pt-32 h-[100dvh] overflow-hidden">
            
            {/* 1. Backdrop with Vignette (Dark edges, clear center) */}
            <div className="absolute inset-0 bg-[#0a0f0e]/95 backdrop-blur-xl transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl px-4 relative z-10 flex flex-col h-full sm:h-auto sm:max-h-[85vh] pt-20 sm:pt-0">
                
                {/* Mobile Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 p-2 text-white/50 hover:text-white bg-white/10 rounded-full sm:hidden z-50 transition-colors"
                >
                    <FeatherIcon name="x-octagon" size={24} />
                </button>

                {/* 2. Spotlight Input */}
                <form onSubmit={handleSubmit} className="relative shrink-0 animate-fadeInUp">
                    <div className={`relative bg-[#0d1110] border rounded-2xl transition-all duration-300 group ${currentTheme.glow}`}>
                        <div className={`absolute left-6 top-1/2 -translate-y-1/2 transition-all duration-300 ${currentTheme.icon} opacity-80 group-focus-within:opacity-100 group-focus-within:scale-110`}>
                            <FeatherIcon name="search" size={28} strokeWidth={2.5} />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Rechercher un cours, un outil, un sujet..."
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full bg-transparent border-none py-6 pl-20 pr-6 text-xl font-bold text-white placeholder-white/20 focus:outline-none focus:ring-0 font-sans"
                            autoComplete="off"
                        />
                        {/* Esc Hint */}
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 hidden sm:block">
                            <kbd className="font-mono text-[10px] font-bold border-b-2 border-white/10 rounded px-2 py-1 bg-[#1A1D1C] text-gray-400">ESC</kbd>
                        </div>
                    </div>
                </form>
                
                {/* 3. Results Container */}
                <div className={`mt-6 flex-1 overflow-y-auto custom-scrollbar min-h-0 pb-10 transition-opacity duration-300 ${query.length <= 1 && history.length === 0 && quickActions.length === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    
                    {/* Search Results */}
                    {query.length > 1 ? (
                        results.length === 0 ? (
                            <div className="text-white/40 text-center p-12 flex flex-col items-center gap-4 animate-fadeIn">
                                <FeatherIcon name="search" size={32} className="opacity-30 stroke-1"/>
                                <span className="text-sm">Aucun résultat trouvé pour "{query}"</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-white/30 uppercase tracking-widest px-2 mb-2 animate-fadeIn">Résultats</div>
                                {results.map((item, i) => (
                                    <button 
                                        key={item.id} 
                                        onClick={() => handleNavigate(`/course/${item.id}`)} 
                                        className={`w-full text-left flex items-center justify-between py-4 px-6 text-white/90 no-underline rounded-xl transition-all duration-200 border border-transparent animate-fadeInUp ${selectedIndex === i ? currentTheme.itemActive : `hover:bg-white/5 hover:border-white/5`}`}
                                        style={{ animationDelay: `${i * 50}ms` }}
                                    >
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div dangerouslySetInnerHTML={{__html: item.title.replace(new RegExp(query, "gi"), (match) => `<strong class="${currentTheme.highlight} px-1 rounded">${match}</strong>`)}} className="truncate font-bold text-lg" />
                                        </div>
                                        <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider whitespace-nowrap border ${currentTheme.badge}`}>
                                            {item.categories[0]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )
                    ) : (
                        // History & Quick Actions
                        <div className="space-y-8 animate-fadeIn" style={{ animationDelay: '100ms' }}>
                             {history.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-2 mb-2">
                                        <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Récents</span>
                                        <button onClick={() => { localStorage.removeItem('content-search-history'); setHistory([]); }} className="text-[10px] text-red-400/50 hover:text-red-400 flex items-center gap-1 transition-colors"><FeatherIcon name="trash-2" size={10}/> Effacer</button>
                                    </div>
                                    {history.map((item, i) => (
                                        <button key={i} onClick={() => handleSearch(item)} className={`w-full text-left flex items-center gap-3 py-4 px-6 text-white/70 hover:text-white no-underline font-medium rounded-xl transition-all duration-200 ${selectedIndex === i ? currentTheme.itemActive : `hover:bg-white/5`}`}>
                                            <FeatherIcon name="clock" size={16} className="opacity-40"/>
                                            <span>{item}</span>
                                        </button>
                                    ))}
                                </div>
                             )}

                            <div className="space-y-2">
                                <div className="px-2 mb-2">
                                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Navigation Rapide</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {quickActions.map((action, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => handleNavigate(action.url)} 
                                            className={`w-full text-left flex items-center gap-4 py-5 px-6 text-white/95 no-underline font-bold rounded-xl border border-white/5 transition-all duration-200 group bg-[#0d1110] ${selectedIndex === i ? currentTheme.itemActive : `hover:bg-white/5 hover:border-white/10`}`}
                                        >
                                             <div className={`p-2 rounded-lg bg-white/5 ${currentTheme.icon} group-hover:scale-110 transition-transform`}>
                                                <FeatherIcon name={action.icon} size={20}/>
                                             </div>
                                             <div className="flex flex-col">
                                                <span className="text-sm font-bold">{action.title}</span>
                                                <span className="text-[10px] text-white/30 font-medium mt-0.5">Raccourci</span>
                                             </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. Footer Visual Shortcuts */}
                <div className="shrink-0 pt-6 pb-2 border-t border-white/5 flex flex-wrap justify-center gap-x-8 gap-y-2 text-[10px] text-white/30 font-medium uppercase tracking-widest animate-fadeIn hidden sm:flex" style={{animationDelay: '200ms'}}>
                    <div className="flex items-center gap-2">
                        <kbd className="h-6 min-w-[24px] px-1.5 flex items-center justify-center rounded bg-[#1A1D1C] border-b-2 border-white/10 font-mono text-white/60 shadow-sm">↵</kbd>
                        <span>Valider</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            <kbd className="h-6 min-w-[24px] flex items-center justify-center rounded bg-[#1A1D1C] border-b-2 border-white/10 font-mono text-white/60 shadow-sm">↑</kbd>
                            <kbd className="h-6 min-w-[24px] flex items-center justify-center rounded bg-[#1A1D1C] border-b-2 border-white/10 font-mono text-white/60 shadow-sm">↓</kbd>
                        </div>
                        <span>Naviguer</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="h-6 px-1.5 flex items-center justify-center rounded bg-[#1A1D1C] border-b-2 border-white/10 font-mono text-white/60 shadow-sm">ESC</kbd>
                        <span>Fermer</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SearchOverlay;
