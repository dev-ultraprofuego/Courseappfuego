'use client';
// Fix: Import React to fix JSX syntax errors.
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Course, Theme, SiteConfig, SearchOverlayProps } from '../types';

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, theme, courses, config }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Course[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

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
            const currentList = isResultView ? results : history;
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
                } else {
                    handleSearch(item as string);
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
            title: "from-[#7de8d0] to-[#5dd5b8]",
            closeButtonBg: "bg-[rgba(93,213,184,0.06)]",
            closeButtonBorder: "border-[rgba(93,213,184,0.12)]",
            closeButtonText: "text-[#7de8d0]",
            searchBorder: "border-[rgba(93,213,184,0.12)]",
            searchIcon: "text-[#7de8d0]",
            searchButton: "bg-gradient-to-r from-[#7de8d0] to-[#5dd5b8]",
            resultsBorder: "border-[rgba(93,213,184,0.12)]",
            resultHover: "hover:bg-[rgba(93,213,184,0.06)]",
            resultActive: "bg-[rgba(93,213,184,0.12)]",
            highlightText: "text-[#7de8d0]",
            highlightBg: "bg-[rgba(93,213,184,0.15)]",
            categoryBg: "bg-[rgba(93,213,184,0.1)]",
            categoryText: "text-[#7de8d0]",
        },
        pristine: {
            title: "from-[#F24444] to-[#D92626]",
            closeButtonBg: "bg-[rgba(217,38,38,0.06)]",
            closeButtonBorder: "border-[rgba(217,38,38,0.12)]",
            closeButtonText: "text-[#F24444]",
            searchBorder: "border-[rgba(217,38,38,0.12)]",
            searchIcon: "text-[#F24444]",
            searchButton: "bg-gradient-to-r from-[#F24444] to-[#D92626]",
            resultsBorder: "border-[rgba(217,38,38,0.12)]",
            resultHover: "hover:bg-[rgba(217,38,38,0.06)]",
            resultActive: "bg-[rgba(217,38,38,0.12)]",
            highlightText: "text-[#F24444]",
            highlightBg: "bg-[rgba(217,38,38,0.15)]",
            categoryBg: "bg-[rgba(217,38,38,0.1)]",
            categoryText: "text-[#F24444]",
        }
    }
    const currentTheme = themeClasses[theme];
    
    if (!isOpen) return null;

    return (
        <div onClick={onClose} className="fixed inset-0 bg-[rgba(10,15,14,0.98)] backdrop-blur-md z-50 flex items-start justify-center pt-20 sm:pt-32 overflow-y-auto">
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl px-4 sm:px-8">
                <button onClick={onClose} className={`fixed top-8 right-8 border rounded-full w-12 h-12 flex items-center justify-center cursor-pointer text-3xl ${currentTheme.closeButtonBg} ${currentTheme.closeButtonBorder} ${currentTheme.closeButtonText}`}>&times;</button>
                <div className="text-center mb-12">
                    <h2 className={`text-4xl sm:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2 ${currentTheme.title}`}>Search Content.</h2>
                    <p className="text-base text-white/70 font-medium">Find courses, tutorials, and creative resources</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={`relative bg-[rgba(13,22,20,0.6)] border-2 rounded-2xl py-5 pr-[4.5rem] pl-14 shadow-[0_4px_20px_rgba(0,0,0,0.3)] ${currentTheme.searchBorder}`}>
                        <div className={`absolute left-5 top-1/2 -translate-y-1/2 ${currentTheme.searchIcon}`}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search courses..."
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full text-xl font-semibold text-white/95 bg-transparent border-none outline-none placeholder:text-white/40"
                        />
                         {query && (
                            <button type="submit" className={`absolute right-4 top-1/2 -translate-y-1/2 border-none text-white cursor-pointer py-3 px-6 rounded-xl font-bold text-sm ${currentTheme.searchButton}`}>Search</button>
                        )}
                    </div>
                </form>
                {(query.length > 1 || history.length > 0) && (
                    <div className={`max-h-[50vh] overflow-y-auto bg-[rgba(13,22,20,0.6)] rounded-2xl mt-4 border p-2 ${currentTheme.resultsBorder}`}>
                        {query.length > 1 ? (
                            results.length === 0 ? (
                                <div className="text-white/50 text-center p-4">No results found.</div>
                            ) : (
                                results.map((item, i) => (
                                    <button key={item.id} onClick={() => handleNavigate(`/course/${item.id}`)} className={`w-full text-left block py-4 px-5 text-white/95 no-underline font-semibold rounded-xl mb-1 transition-all duration-250 ${selectedIndex === i ? currentTheme.resultActive : currentTheme.resultHover}`}>
                                        <div dangerouslySetInnerHTML={{__html: item.title.replace(new RegExp(query, "gi"), (match) => `<strong class="${currentTheme.highlightText} ${currentTheme.highlightBg} px-1 rounded">${match}</strong>`)}} />
                                        <div className="text-xs text-white/50 mt-1"><span className={`py-1 px-2 rounded-md text-xs font-bold inline-block ${currentTheme.categoryBg} ${currentTheme.categoryText}`}>{item.categories[0]}</span></div>
                                    </button>
                                ))
                            )
                        ) : history.length > 0 ? (
                            history.map((item, i) => (
                                <button key={i} onClick={() => handleSearch(item)} className={`w-full text-left block py-4 px-5 text-white/95 no-underline font-semibold rounded-xl mb-1 transition-all duration-250 ${selectedIndex === i ? currentTheme.resultActive : currentTheme.resultHover}`}>
                                    <div>{item}</div>
                                    <div className="text-xs text-white/50 mt-1"><span className={`py-1 px-2 rounded-md text-xs font-bold inline-block ${currentTheme.categoryBg} ${currentTheme.categoryText}`}>Recent</span></div>
                                </button>
                            ))
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchOverlay;