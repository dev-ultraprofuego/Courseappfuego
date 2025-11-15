// Fix: Import React to fix JSX syntax errors.
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Course, HomepageSection, Theme, SectionCourseManagerModalProps, ReorderPayload, CourseContextLink, SoftwarePill } from '../types';
import FeatherIcon from './FeatherIcon';

const SectionCourseManagerModal: React.FC<SectionCourseManagerModalProps> = ({ isOpen, onClose, section, allCourses, allCategories, onSave, onEditCourse, theme }) => {
    const [coursesInSection, setCoursesInSection] = useState<CourseContextLink[]>([]);
    const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [bulkUrl, setBulkUrl] = useState('');

    useEffect(() => {
        if (isOpen) {
            setCoursesInSection(section.courses);
            const courseIdsInSection = new Set(section.courses.map(c => c.courseId));
            const coursesNotInsection = allCourses.filter(c => !courseIdsInSection.has(c.id));
            setAvailableCourses(coursesNotInsection);
            setSearchTerm('');
            setBulkUrl('');
        }
    }, [isOpen, section, allCourses]);

    const handleAddCourse = (courseId: number) => {
        const courseToAdd = availableCourses.find(c => c.id === courseId);
        if (courseToAdd) {
            setCoursesInSection(prev => [...prev, { courseId, linkBehavior: 'detail', showBuyButton: false, contextKeywords: [] }]);
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
    
    const handleReorder = ({ dragIndex, hoverIndex }: ReorderPayload) => {
        const draggedItem = coursesInSection[dragIndex];
        const newOrderedCourses = [...coursesInSection];
        newOrderedCourses.splice(dragIndex, 1);
        newOrderedCourses.splice(hoverIndex, 0, draggedItem);
        setCoursesInSection(newOrderedCourses);
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
        onSave(section.id, coursesInSection);
        onClose();
    };

    const filteredAvailableCourses = useMemo(() => {
        return availableCourses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [availableCourses, searchTerm]);

    if (!isOpen) return null;
    
    const themeClasses = {
        iris: { bg: 'bg-gray-900', border: 'border-teal-700/50', button: 'bg-teal-600 hover:bg-teal-500', headerText: 'text-teal-400' },
        pristine: { bg: 'bg-gray-900', border: 'border-red-700/50', button: 'bg-[#D92626] hover:bg-[#F24444]', headerText: 'text-red-400' }
    }
    const currentTheme = themeClasses[theme];

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
            <div className={`w-full max-w-6xl h-[90vh] ${currentTheme.bg} border ${currentTheme.border} rounded-lg shadow-lg flex flex-col`}>
                <header className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className={`text-2xl font-bold ${currentTheme.headerText}`}>Gérer les cours pour "{section.title}"</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </header>
                
                <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
                    <div className="flex flex-col">
                        <h3 className="font-semibold mb-2">Cours dans cette section ({coursesInSection.length})</h3>
                        <div className="bg-gray-800/50 p-2 rounded-md mb-2">
                             <h4 className="text-sm font-semibold text-gray-400 mb-1">Édition en Masse</h4>
                             <div className="flex gap-2">
                                 <input type="text" placeholder="URL Externe pour tous" value={bulkUrl} onChange={e => setBulkUrl(e.target.value)} className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-1 text-xs" />
                                 <button onClick={handleBulkApply} className="bg-blue-600 text-white px-3 py-1 text-xs rounded-md hover:bg-blue-500">Appliquer à tous</button>
                             </div>
                        </div>
                        <div className="flex-1 bg-gray-800/50 p-2 rounded-md overflow-y-auto space-y-2">
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
                                        onReorder={handleReorder} 
                                        onAction={handleRemoveCourse} 
                                        onContextChange={handleContextChange}
                                        onEditCourse={onEditCourse}
                                        actionIcon="minus-circle" 
                                        actionText="Retirer" 
                                        theme={theme}
                                    />
                                 )
                            })}
                        </div>
                    </div>
                     <div className="flex flex-col">
                        <h3 className="font-semibold mb-2">Cours disponibles ({filteredAvailableCourses.length})</h3>
                         <input type="text" placeholder="Rechercher des cours disponibles..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 mb-2 text-sm" />
                        <div className="flex-1 bg-gray-800/50 p-2 rounded-md overflow-y-auto space-y-2">
                            {filteredAvailableCourses.map(course => (
                                <ListItem key={course.id} course={course} onAction={handleAddCourse} actionIcon="plus-circle" actionText="Ajouter" />
                            ))}
                        </div>
                    </div>
                </div>

                <footer className="p-4 border-t border-gray-700 flex justify-end gap-3 flex-shrink-0">
                     <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Annuler</button>
                     <button onClick={handleSave} className={`${currentTheme.button} text-white font-bold py-2 px-4 rounded`}>Sauvegarder</button>
                </footer>
            </div>
        </div>
    );
};

const ListItem: React.FC<{course: Course, onAction: (id: number) => void, actionIcon: string, actionText: string}> = ({ course, onAction, actionIcon, actionText }) => (
    <div className="flex items-center p-2 bg-gray-800 rounded-md">
        <img src={course.img} alt={course.title} className="w-16 h-12 object-cover rounded flex-shrink-0" />
        <span className="flex-grow ml-3 text-sm font-medium truncate" title={course.title}>{course.title}</span>
        <button onClick={() => onAction(course.id)} title={actionText} className={`p-2 rounded-full flex-shrink-0 ${actionIcon === 'plus-circle' ? 'text-green-400 hover:bg-green-900/50' : 'text-red-400 hover:bg-red-900/50'}`}>
            <FeatherIcon name={actionIcon} size={18} />
        </button>
    </div>
);

const DraggableListItem: React.FC<{
    index: number;
    course: Course;
    linkConfig: CourseContextLink;
    allCategories: SoftwarePill[];
    onReorder: (payload: ReorderPayload) => void;
    onAction: (id: number) => void;
    onContextChange: (courseId: number, field: keyof CourseContextLink, value: any) => void;
    onEditCourse: (course: Course) => void;
    actionIcon: string;
    actionText: string;
    theme: Theme;
}> = ({ index, course, linkConfig, allCategories, onReorder, onAction, onContextChange, onEditCourse, actionIcon, actionText, theme }) => {
    const ref = useRef<HTMLDivElement>(null);
    const dragItem = useRef<number | null>(null);

    const handleDragStart = () => { dragItem.current = index; };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, hoverIndex: number) => {
        e.preventDefault();
        if (dragItem.current === null || dragItem.current === hoverIndex) return;
        onReorder({ dragIndex: dragItem.current, hoverIndex });
        dragItem.current = hoverIndex;
    };
    
    const handleKeywordChange = (keyword: string) => {
        const currentKeywords = linkConfig.contextKeywords || [];
        const newKeywords = currentKeywords.includes(keyword)
            ? currentKeywords.filter(k => k !== keyword)
            : [...currentKeywords, keyword];
        onContextChange(course.id, 'contextKeywords', newKeywords);
    };

    return (
         <div ref={ref} draggable onDragStart={handleDragStart} onDragOver={(e) => handleDragOver(e, index)} onDragEnd={() => dragItem.current = null} className="p-2 bg-gray-800 rounded-md">
            <div className="flex items-center gap-2">
                <span className="p-1 cursor-move text-gray-500 flex-shrink-0"><FeatherIcon name="move" size={18} /></span>
                <img src={course.img} alt={course.title} className="w-16 h-12 object-cover rounded flex-shrink-0" />
                <span className="flex-grow text-sm font-medium truncate" title={course.title}>{course.title}</span>
                <button onClick={() => onEditCourse(course)} title="Modifier le Cours" className="p-2 rounded-full text-blue-400 hover:bg-blue-900/50 flex-shrink-0"> <FeatherIcon name="edit-2" size={16} /> </button>
                <button onClick={() => onAction(course.id)} title={actionText} className={`p-2 rounded-full flex-shrink-0 ${actionIcon === 'plus-circle' ? 'text-green-400 hover:bg-green-900/50' : 'text-red-400 hover:bg-red-900/50'}`}> <FeatherIcon name={actionIcon} size={18} /> </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mt-2 pl-8">
                <select value={linkConfig.linkBehavior} onChange={e => onContextChange(course.id, 'linkBehavior', e.target.value)} className="bg-gray-700 p-1 rounded-md text-xs border border-gray-600">
                    <option value="detail">Page de Détail</option>
                    <option value="external">Lien Externe</option>
                </select>
                 {linkConfig.linkBehavior === 'external' && (
                    <input type="text" placeholder="URL Externe" value={linkConfig.overrideExternalLink || ''} onChange={e => onContextChange(course.id, 'overrideExternalLink', e.target.value)} className="bg-gray-700 p-1 rounded-md text-xs border border-gray-600" />
                )}
                
                <input type="text" placeholder="Label Primaire (ex: Premium)" value={linkConfig.subSection || ''} onChange={e => onContextChange(course.id, 'subSection', e.target.value)} className="bg-gray-700 p-1 rounded-md text-xs border border-gray-600" />
                 <div className="relative">
                    <div className="bg-gray-700 p-1 rounded-md text-xs border border-gray-600 flex flex-wrap gap-1 min-h-[26px]">
                        {(linkConfig.contextKeywords || []).map(k => <span key={k} className="bg-gray-600 px-1.5 py-0.5 rounded-sm">{allCategories.find(c=>c.category===k)?.name || k}</span>)}
                        {(!linkConfig.contextKeywords || linkConfig.contextKeywords.length === 0) && <span className="text-gray-500">Mots-clés contextuels</span>}
                    </div>
                 </div>

                <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={linkConfig.showBuyButton} onChange={e => onContextChange(course.id, 'showBuyButton', e.target.checked)} className={`h-4 w-4 rounded border-gray-600 bg-gray-700 shadow-sm focus:ring-opacity-50 ${theme === 'iris' ? 'text-teal-600 focus:ring-teal-500' : 'text-red-600 focus:ring-red-500'}`} />
                    Bouton Achat
                </label>
                 {linkConfig.showBuyButton && (
                     <div className="grid grid-cols-2 gap-1">
                        <input type="text" placeholder="URL Achat" value={linkConfig.overrideBuyLink || ''} onChange={e => onContextChange(course.id, 'overrideBuyLink', e.target.value)} className="bg-gray-700 p-1 rounded-md text-xs border border-gray-600" />
                        <input type="text" placeholder="Texte Bouton" value={linkConfig.overrideBuyButtonText || ''} onChange={e => onContextChange(course.id, 'overrideBuyButtonText', e.target.value)} className="bg-gray-700 p-1 rounded-md text-xs border border-gray-600" />
                     </div>
                )}
            </div>
            <div className="mt-2 pl-8">
                 <details>
                    <summary className="text-xs text-gray-500 cursor-pointer">Modifier Mots-clés...</summary>
                    <div className="p-2 mt-1 bg-gray-900/50 rounded-md max-h-24 overflow-y-auto flex flex-wrap gap-1">
                        {allCategories.map(cat => (
                            <button key={cat.category} onClick={() => handleKeywordChange(cat.category)} className={`py-0.5 px-2 rounded-full text-xs transition-colors ${(linkConfig.contextKeywords || []).includes(cat.category) ? `${theme === 'iris' ? 'bg-teal-600' : 'bg-red-600'}` : 'bg-gray-700 hover:bg-gray-600'}`}>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                 </details>
            </div>
        </div>
    );
};


export default SectionCourseManagerModal;