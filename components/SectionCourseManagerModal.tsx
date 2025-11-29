
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Course, HomepageSection, Theme, SectionCourseManagerModalProps, ReorderPayload, CourseContextLink, SoftwarePill } from '../types';
import FeatherIcon from './FeatherIcon';

interface ExtendedSectionCourseManagerModalProps extends SectionCourseManagerModalProps {
    t: any;
    onLog?: (action: string, details: string) => void;
}

const SectionCourseManagerModal: React.FC<ExtendedSectionCourseManagerModalProps> = ({ isOpen, onClose, section, allCourses, allCategories, onSave, onEditCourse, theme, t, onLog }) => {
    const [coursesInSection, setCoursesInSection] = useState<CourseContextLink[]>([]);
    const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [bulkUrl, setBulkUrl] = useState('');
    const [autoAdd, setAutoAdd] = useState(section.autoAdd || false);
    const [autoAddTag, setAutoAddTag] = useState(section.autoAddTag || '');
    const [isClosing, setIsClosing] = useState(false);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // Keep track of original list for diffing
    const [originalCoursesList, setOriginalCoursesList] = useState<CourseContextLink[]>([]);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            setCoursesInSection(section.courses);
            setOriginalCoursesList(section.courses); // Store original for comparison
            setAutoAdd(section.autoAdd || false);
            setAutoAddTag(section.autoAddTag || '');
            
            const courseIdsInSection = new Set(section.courses.map(c => c.courseId));
            const coursesNotInsection = allCourses.filter(c => !courseIdsInSection.has(c.id));
            setAvailableCourses(coursesNotInsection);
            setSearchTerm('');
            setBulkUrl('');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, section, allCourses]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const handleAddCourse = (courseId: number) => {
        const courseToAdd = availableCourses.find(c => c.id === courseId);
        if (courseToAdd) {
            setCoursesInSection(prev => [{ courseId, linkBehavior: 'detail', showBuyButton: false, contextKeywords: [] }, ...prev]);
            setAvailableCourses(prev => prev.filter(c => c.id !== courseId));
        }
    };
    
    const handleRemoveCourse = (courseId: number) => {
        const courseToRemove = allCourses.find(c => c.id === courseId);
        if (courseToRemove) {
            setAvailableCourses(prev => [courseToRemove, ...prev].sort((a,b) => a.title.localeCompare(b.title)));
            setCoursesInSection(prev => prev.filter(c => c.courseId !== courseId));
        }
    };
    
    const handleDragStart = (index: number) => {
        dragItem.current = index;
    };

    const handleDragEnter = (index: number) => {
        dragOverItem.current = index;
        if (dragItem.current !== null && dragItem.current !== index) {
            const newOrderedCourses = [...coursesInSection];
            const draggedItem = newOrderedCourses[dragItem.current];
            newOrderedCourses.splice(dragItem.current, 1);
            newOrderedCourses.splice(index, 0, draggedItem);
            dragItem.current = index;
            setCoursesInSection(newOrderedCourses);
        }
    };

    const handleDragEnd = () => {
        dragItem.current = null;
        dragOverItem.current = null;
    };
    
    const handleContextChange = (courseId: number, field: keyof CourseContextLink, value: any) => {
        setCoursesInSection(prev => prev.map(c => c.courseId === courseId ? { ...c, [field]: value } : c));
    };
    
    const handleBulkApply = () => {
        if (!bulkUrl) return;
        setCoursesInSection(prev => prev.map(c => ({
            ...c,
            linkBehavior: 'external',
            overrideExternalLink: bulkUrl
        })));
    };

    const handleSave = () => {
        if (onLog) {
            // 1. Auto-Add Log
            if (autoAdd !== section.autoAdd) {
                 const status = autoAdd ? 'activé' : 'désactivé';
                 onLog('AUTO_ADD_UPDATE', `L'auto-ajout a été ${status} pour la section '${section.title}'|Vitrine Accueil > Gestion`);
            }

            // 2. Content Diffs (Added/Removed/Reordered)
            const originalIds = originalCoursesList.map(c => c.courseId);
            const newIds = coursesInSection.map(c => c.courseId);

            // Detect Adds
            const addedIds = newIds.filter(id => !originalIds.includes(id));
            addedIds.forEach(id => {
                const course = allCourses.find(c => c.id === id);
                if (course) {
                    // Format: [CourseName]|[SectionName]
                    onLog('SECTION_ITEM_ADD', `${course.title}|${section.title}`);
                }
            });

            // Detect Removes
            const removedIds = originalIds.filter(id => !newIds.includes(id));
            removedIds.forEach(id => {
                const course = allCourses.find(c => c.id === id);
                if (course) {
                    onLog('SECTION_ITEM_REMOVE', `${course.title}|${section.title}`);
                }
            });

            // Detect Reorder (Only if no adds/removes to avoid spamming logs)
            if (addedIds.length === 0 && removedIds.length === 0) {
                const isReordered = JSON.stringify(originalIds) !== JSON.stringify(newIds);
                if (isReordered) {
                    onLog('SECTION_REORDER', `L'ordre des cours|${section.title}`);
                }
            }
        }

        onSave({
            ...section,
            courses: coursesInSection,
            autoAdd: autoAdd,
            autoAddTag: autoAddTag
        });
        handleClose();
    };

    const filteredAvailableCourses = useMemo(() => {
        return availableCourses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [availableCourses, searchTerm]);

    if (!isOpen) return null;
    
    const themeClasses = {
        iris: { 
            accent: 'text-teal-400', 
            border: 'border-teal-500/20', 
            bgHighlight: 'bg-teal-500/10',
            toggleActive: 'bg-teal-600',
            focusRing: 'focus:ring-teal-500/50',
            focusBorder: 'focus:border-teal-500',
            glowColor: "rgba(45,212,191,0.6)"
        },
        pristine: { 
            accent: 'text-rose-400', 
            border: 'border-rose-500/20', 
            bgHighlight: 'bg-rose-500/10',
            toggleActive: 'bg-[#ff4757]',
            focusRing: 'focus:ring-rose-500/50',
            focusBorder: 'focus:border-rose-500',
            glowColor: "rgba(255,71,87,0.6)"
        },
        boss: { 
            accent: 'text-red-500', 
            border: 'border-red-500/20', 
            bgHighlight: 'bg-red-500/10',
            toggleActive: 'bg-[#D92626]',
            focusRing: 'focus:ring-red-500/50',
            focusBorder: 'focus:border-red-500',
            glowColor: "rgba(217,38,38,0.6)"
        }
    }
    const currentTheme = themeClasses[theme];

    // Ghost Inputs
    const inputStyle = `w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none transition-all duration-200 shadow-inner ${currentTheme.focusBorder} focus:ring-1 ${currentTheme.focusRing}`;
    const selectStyle = `w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none cursor-pointer transition-all duration-200 shadow-inner ${currentTheme.focusBorder} focus:ring-1 ${currentTheme.focusRing}`;

    return (
        <div className="fixed inset-0 z-[60] overflow-hidden flex justify-end">
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} 
                onClick={handleClose}
            />

            {/* Slide-Over Panel (100% Width) */}
            <div className={`relative w-full bg-[#0a0d0c] border-l border-white/5 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col h-full ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}>
                
                {/* 1. Header (Sticky) */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0d0c]/80 backdrop-blur-md z-20 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={handleClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors group" title="Retour">
                            <FeatherIcon name="arrow-left" size={24} className="group-hover:-translate-x-1 transition-transform duration-200" />
                        </button>
                        <div className="h-8 w-px bg-white/10 mx-2"></div>
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${currentTheme.border} bg-white/5`}>
                            <FeatherIcon name="layout" size={18} className={currentTheme.accent} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight">{t.manager.sectionTitle} "{section.title}"</h2>
                            <p className="text-xs text-gray-500">{t.manager.manageDisplay}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                         {/* Automation Toggle */}
                         <div className="hidden sm:flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            <div className="flex flex-col items-end mr-1">
                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider leading-none mb-0.5">{t.manager.autoAdd}</span>
                                <div className="flex items-center gap-1">
                                    {autoAdd ? (
                                        <input 
                                            type="text" 
                                            value={autoAddTag} 
                                            onChange={(e) => setAutoAddTag(e.target.value)} 
                                            placeholder="tag..."
                                            className="bg-transparent border-b border-gray-600 text-[9px] text-white w-16 focus:outline-none focus:border-white p-0 h-3"
                                        />
                                    ) : (
                                        <span className="text-[9px] text-gray-600 italic leading-none">Off</span>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={() => setAutoAdd(!autoAdd)}
                                className={`relative w-9 h-5 rounded-full transition-colors duration-300 focus:outline-none ${autoAdd ? currentTheme.toggleActive : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${autoAdd ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        <div className="h-6 w-px bg-white/10 mx-1"></div>
                        
                        <button 
                            onClick={handleSave} 
                            className="group relative flex items-center gap-2 bg-gradient-to-b from-[#161a19] to-[#0a0d0c] text-white font-bold py-2 px-5 rounded-lg border border-white/10 transition-all duration-300 hover:bg-[#131615] hover:border-white/20 font-heading text-xs uppercase tracking-wide"
                            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.4)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 20px ${currentTheme.glowColor}` }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.4)' }}
                        >
                            {t.manager.save}
                        </button>
                    </div>
                </div>
                
                {/* 2. Main Content */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    
                    {/* LEFT COLUMN: Active Courses */}
                    <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 bg-[#0a0d0c]">
                        {/* Column Header (Symmetrical) */}
                        <div className="h-16 px-6 border-b border-white/5 bg-[#0a0d0c] sticky top-0 z-10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-300">{t.manager.activeList}</h3>
                                <span className={`flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold ${currentTheme.bgHighlight} ${currentTheme.accent} ring-1 ring-inset ${currentTheme.border}`}>
                                    {coursesInSection.length}
                                </span>
                            </div>
                             <div className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    placeholder={t.manager.applyGlobalLink} 
                                    value={bulkUrl} 
                                    onChange={e => setBulkUrl(e.target.value)} 
                                    className="w-48 bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-[10px] text-white placeholder-gray-600 focus:border-gray-500 outline-none transition-all" 
                                />
                                <button onClick={handleBulkApply} className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1.5 rounded-md transition-colors">
                                    {t.manager.apply}
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-[#0a0d0c]">
                             {coursesInSection.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-700">
                                    <FeatherIcon name="layout" size={48} className="mb-4 opacity-20"/>
                                    <p className="text-sm">{t.manager.dragDrop}</p>
                                </div>
                             )}
                             {coursesInSection.map((link, index) => {
                                 const course = allCourses.find(c => c.id === link.courseId);
                                 if (!course) return null;
                                 return (
                                    <DraggableListItem 
                                        key={link.courseId} 
                                        index={index} 
                                        course={course} 
                                        linkConfig={link}
                                        allCategories={allCategories}
                                        onDragStart={handleDragStart}
                                        onDragEnter={handleDragEnter}
                                        onDragEnd={handleDragEnd}
                                        onAction={handleRemoveCourse} 
                                        onContextChange={handleContextChange}
                                        onEditCourse={onEditCourse}
                                        actionIcon="minus-circle" 
                                        theme={theme}
                                        inputStyle={inputStyle}
                                        selectStyle={selectStyle}
                                        t={t}
                                    />
                                 )
                            })}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Available Library */}
                    <div className="flex-1 flex flex-col bg-[#0a0d0c]">
                        {/* Column Header (Symmetrical - Search is now the main element) */}
                        <div className="h-16 px-6 border-b border-white/5 bg-[#0a0d0c] sticky top-0 z-10 flex items-center gap-4">
                            <div className="relative group flex-1">
                                <FeatherIcon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors"/>
                                <input 
                                    type="text" 
                                    placeholder={t.manager.search} 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    className={`w-full pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/5 transition-all`} 
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-[#0a0d0c]">
                            {filteredAvailableCourses.map(course => (
                                <ListItem key={course.id} course={course} onAction={handleAddCourse} actionIcon="plus-circle" />
                            ))}
                             {filteredAvailableCourses.length === 0 && (
                                <div className="text-center py-12 text-gray-600 text-sm">
                                    <p className="mb-2">{t.manager.noResults}</p>
                                    {/* Fix: Pass null instead of empty object to properly trigger new course creation */}
                                    <button onClick={() => onEditCourse(null)} className="text-blue-400 hover:underline text-xs">{t.manager.createCourse}</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ListItem: React.FC<{course: Course, onAction: (id: number) => void, actionIcon: string}> = ({ course, onAction, actionIcon }) => (
    <div className="flex items-center gap-3 p-2 bg-[#111413] hover:bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all group">
        <img src={course.img} alt={course.title} className="w-10 h-10 object-cover rounded-md bg-gray-900 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
        <div className="flex-grow min-w-0">
            <div className="text-xs font-medium text-gray-300 group-hover:text-white leading-tight mb-1 line-clamp-1 transition-colors">{course.title}</div>
            <div className="flex flex-wrap gap-1">
                {course.categories.slice(0, 2).map(cat => (
                    <span key={cat} className="text-[9px] px-1.5 py-0.5 bg-[#0a0d0c] rounded text-gray-500 border border-white/10">{cat}</span>
                ))}
            </div>
        </div>
        <button onClick={() => onAction(course.id)} className="p-2 text-gray-600 hover:text-green-400 hover:bg-green-400/10 rounded-md transition-all">
            <FeatherIcon name={actionIcon} size={16} />
        </button>
    </div>
);

const DraggableListItem: React.FC<{index: number, course: Course, linkConfig: CourseContextLink, allCategories: SoftwarePill[], onDragStart: (index: number) => void, onDragEnter: (index: number) => void, onDragEnd: () => void, onAction: (id: number) => void, onContextChange: (courseId: number, field: keyof CourseContextLink, value: any) => void, onEditCourse: (course: Course) => void, actionIcon: string, theme: Theme, inputStyle: string, selectStyle: string, t: any}> = ({ index, course, linkConfig, allCategories, onDragStart, onDragEnter, onDragEnd, onAction, onContextChange, onEditCourse, actionIcon, theme, inputStyle, selectStyle, t }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // Click Outside to close logic
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);
    
    const handleKeywordChange = (keyword: string) => {
        const currentKeywords = linkConfig.contextKeywords || [];
        const newKeywords = currentKeywords.includes(keyword)
            ? currentKeywords.filter(k => k !== keyword)
            : [...currentKeywords, keyword];
        onContextChange(course.id, 'contextKeywords', newKeywords);
    };

    return (
         <div 
            ref={ref} 
            draggable 
            onDragStart={() => onDragStart(index)}
            onDragEnter={() => onDragEnter(index)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={onDragEnd}
            className={`relative group bg-[#111413] hover:bg-white/5 rounded-xl border border-white/5 hover:border-white/10 shadow-sm transition-all ${isExpanded ? 'ring-1 ring-gray-700 z-10' : ''}`}
        >
            
            {/* Main Row */}
            <div className="flex items-center p-2 pl-0">
                 {/* Drag Handle */}
                <div className="w-8 flex items-center justify-center cursor-move text-gray-700 hover:text-gray-400 self-stretch border-r border-transparent group-hover:border-white/5 transition-colors">
                    <FeatherIcon name="more-vertical" size={14} />
                </div>

                {/* Image */}
                 <div className="ml-2 mr-3 relative w-10 h-10 flex-shrink-0">
                     <img src={course.img} alt="" className="w-full h-full object-cover rounded-md" />
                     {linkConfig.showBuyButton && (
                         <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-[#131615]" title="Achat activé"></div>
                     )}
                 </div>

                {/* Info */}
                <div className="flex-grow min-w-0 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="text-xs font-medium text-gray-200 leading-tight truncate select-none">{course.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                         {linkConfig.subSection && <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 rounded border border-blue-500/20 truncate max-w-[80px]">{linkConfig.subSection}</span>}
                         <span className="text-[9px] text-gray-600">{linkConfig.linkBehavior === 'external' ? 'Ext.' : 'Détail'}</span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1 pr-2">
                    <button onClick={() => setIsExpanded(!isExpanded)} className={`p-1.5 rounded-md transition-colors ${isExpanded ? 'text-white bg-gray-700' : 'text-gray-600 hover:text-gray-300 hover:bg-white/10'}`}>
                        <FeatherIcon name="settings" size={12} />
                    </button>
                     <button onClick={() => onEditCourse(course)} className="p-1.5 text-gray-600 hover:text-blue-400 hover:bg-blue-900/20 rounded-md transition-colors">
                        <FeatherIcon name="edit-2" size={12} />
                    </button>
                    <button onClick={() => onAction(course.id)} className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-900/20 rounded-md transition-colors">
                        <FeatherIcon name={actionIcon} size={12} />
                    </button>
                </div>
            </div>

            {/* Expanded Config Panel */}
            {isExpanded && (
                <div className="px-3 pb-3 pt-0 mt-1 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-3 pt-3">
                        {/* Behavior */}
                        <div>
                            <label className="block text-[9px] text-gray-500 uppercase font-bold mb-1">{t.manager.actionClick}</label>
                             <select value={linkConfig.linkBehavior} onChange={e => onContextChange(course.id, 'linkBehavior', e.target.value)} className={selectStyle}>
                                <option value="detail">{t.manager.openPage}</option>
                                <option value="external">{t.manager.redirect}</option>
                            </select>
                        </div>

                        {/* Label / Sub-Section */}
                         <div>
                            <label className="block text-[9px] text-gray-500 uppercase font-bold mb-1">{t.manager.label}</label>
                            <input 
                                type="text" 
                                placeholder="ex: Premium, Best Seller" 
                                value={linkConfig.subSection || ''} 
                                onChange={e => onContextChange(course.id, 'subSection', e.target.value)} 
                                className={inputStyle} 
                            />
                        </div>

                        {/* Buy Option */}
                        <div className="flex items-center gap-2 col-span-2 py-1">
                            <div className="relative flex items-start">
                                <div className="flex h-5 items-center">
                                    <input 
                                        id={`buy-${course.id}`} 
                                        type="checkbox" 
                                        checked={linkConfig.showBuyButton} 
                                        onChange={e => onContextChange(course.id, 'showBuyButton', e.target.checked)} 
                                        className="h-3.5 w-3.5 rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-600 focus:ring-offset-gray-900" 
                                    />
                                </div>
                                <div className="ml-2 text-xs">
                                    <label htmlFor={`buy-${course.id}`} className="font-medium text-gray-300 select-none cursor-pointer">{t.manager.buyButton}</label>
                                </div>
                            </div>
                        </div>

                        {/* External URL Override */}
                        {linkConfig.linkBehavior === 'external' && (
                            <div className="col-span-2">
                                 <label className="block text-[9px] text-gray-500 uppercase font-bold mb-1">{t.manager.redirectUrl}</label>
                                <input type="text" placeholder="https://..." value={linkConfig.overrideExternalLink || ''} onChange={e => onContextChange(course.id, 'overrideExternalLink', e.target.value)} className={inputStyle} />
                            </div>
                        )}
                        
                         {/* Buy URL Override */}
                        {linkConfig.showBuyButton && (
                            <div className="col-span-2 grid grid-cols-3 gap-2">
                                 <div className="col-span-2">
                                    <label className="block text-[9px] text-gray-500 uppercase font-bold mb-1">{t.manager.buyLink}</label>
                                    <input type="text" placeholder="Défaut (Config)" value={linkConfig.overrideBuyLink || ''} onChange={e => onContextChange(course.id, 'overrideBuyLink', e.target.value)} className={inputStyle} />
                                 </div>
                                 <div className="col-span-1">
                                     <label className="block text-[9px] text-gray-500 uppercase font-bold mb-1">{t.manager.buttonText}</label>
                                     <input type="text" placeholder="Défaut" value={linkConfig.overrideBuyButtonText || ''} onChange={e => onContextChange(course.id, 'overrideBuyButtonText', e.target.value)} className={inputStyle} />
                                 </div>
                            </div>
                        )}
                    </div>

                    {/* Tags / Context Keywords */}
                    <div className="mt-3 pt-3 border-t border-white/5">
                         <label className="block text-[9px] text-gray-500 uppercase font-bold mb-2">{t.manager.contextTags}</label>
                        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto custom-scrollbar">
                            {allCategories.map(cat => (
                                <button
                                    key={cat.category}
                                    type="button"
                                    onClick={() => handleKeywordChange(cat.category)}
                                    className={`px-2 py-1 rounded text-[10px] border transition-colors ${ (linkConfig.contextKeywords || []).includes(cat.category) ? `${theme === 'iris' ? 'bg-teal-900/30 border-teal-500/50 text-teal-300' : 'bg-red-900/30 border-red-500/50 text-red-300'}` : 'bg-[#1A1D1C] border-white/10 text-gray-500 hover:border-gray-600 hover:text-gray-300'}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionCourseManagerModal;
