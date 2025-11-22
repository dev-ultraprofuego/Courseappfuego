
import React, { useRef, useState, useEffect } from 'react';
import type { HomepageSection, Course, Theme, ReorderPayload } from '../types';
import FeatherIcon from './FeatherIcon';

interface HomepageSectionsEditorProps {
    sections: HomepageSection[];
    allCourses: Course[]; 
    onChange: (sections: HomepageSection[]) => void;
    theme: Theme;
    t: any;
    onEditCourse: (course: Course) => void;
    onManageCourses: (section: HomepageSection) => void;
}

const HomepageSectionsEditor: React.FC<HomepageSectionsEditorProps> = ({ sections, allCourses, onChange, theme, t, onEditCourse, onManageCourses }) => {
    const [localSections, setLocalSections] = useState(sections);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    
    useEffect(() => {
        setLocalSections(sections);
    }, [sections]);

    const handleDragStart = (index: number) => {
        dragItem.current = index;
    };

    const handleDragEnter = (index: number) => {
        dragOverItem.current = index;
        if (dragItem.current !== null && dragItem.current !== index) {
            const newSections = [...localSections];
            const draggedItemContent = newSections[dragItem.current];
            newSections.splice(dragItem.current, 1);
            newSections.splice(index, 0, draggedItemContent);
            dragItem.current = index;
            setLocalSections(newSections);
        }
    };

    const handleDragEnd = () => {
        dragItem.current = null;
        dragOverItem.current = null;
        onChange(localSections);
    };

    const handleSectionChange = (id: string, field: keyof HomepageSection, value: any) => {
        const newSections = localSections.map(s => s.id === id ? { ...s, [field]: value } : s);
        setLocalSections(newSections);
        onChange(newSections);
    };

    const handleLinkChange = (id: string, field: 'type' | 'value', value: string) => {
        const newSections = localSections.map(s => {
            if (s.id === id) {
                const newLink = { ...s.link, [field]: value };
                if (field === 'type' && value === 'section') {
                    newLink.value = id;
                }
                return { ...s, link: newLink };
            }
            return s;
        });
        setLocalSections(newSections);
        onChange(newSections);
    }
    
    const themeClasses = {
        iris: { accent: 'text-teal-400', borderFocus: 'focus:border-teal-500', ringFocus: 'focus:ring-teal-500', hoverBorder: 'hover:border-teal-500/30' },
        pristine: { accent: 'text-rose-400', borderFocus: 'focus:border-rose-500', ringFocus: 'focus:ring-rose-500', hoverBorder: 'hover:border-[#ff4757]/30' },
        boss: { accent: 'text-red-500', borderFocus: 'focus:border-red-500', ringFocus: 'focus:ring-red-500', hoverBorder: 'hover:border-red-500/30' }
    };
    const currentTheme = themeClasses[theme] || themeClasses.iris;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {localSections.map((section, index) => (
                <DraggableSectionCard
                    key={section.id}
                    index={index}
                    section={section}
                    allCourses={allCourses}
                    onDragStart={handleDragStart}
                    onDragEnter={handleDragEnter}
                    onDragEnd={handleDragEnd}
                    onSectionChange={(field, value) => handleSectionChange(section.id, field, value)}
                    onLinkChange={(field, value) => handleLinkChange(section.id, field, value)}
                    onManageCourses={() => onManageCourses(section)}
                    t={t}
                    currentTheme={currentTheme}
                />
            ))}
        </div>
    );
};

const DraggableSectionCard: React.FC<{
    index: number;
    section: HomepageSection;
    allCourses: Course[];
    onDragStart: (index: number) => void;
    onDragEnter: (index: number) => void;
    onDragEnd: () => void;
    onSectionChange: (field: keyof HomepageSection, value: any) => void;
    onLinkChange: (field: 'type' | 'value', value: string) => void;
    onManageCourses: () => void;
    t: any;
    currentTheme: any;
}> = ({ index, section, allCourses, onDragStart, onDragEnter, onDragEnd, onSectionChange, onLinkChange, onManageCourses, t, currentTheme }) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingLink, setIsEditingLink] = useState(false);

    const previewImages = section.courses
        .slice(0, 5)
        .map(link => allCourses.find(c => c.id === link.courseId)?.img)
        .filter(Boolean);

    return (
        <div 
            draggable 
            onDragStart={() => onDragStart(index)}
            onDragEnter={() => onDragEnter(index)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={onDragEnd}
            className={`group bg-[#0a0d0c] rounded-xl border border-white/5 ${currentTheme.hoverBorder} shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col h-full hover:shadow-lg`}
        >
            {/* Header: Drag + Title */}
            <div className="p-4 flex items-start gap-3 border-b border-white/5 bg-[#0E1110]">
                <span className="cursor-move text-gray-600 hover:text-gray-300 mt-1"><FeatherIcon name="move" size={16} /></span>
                <div className="flex-grow min-w-0">
                    <div className="relative">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 font-heading">{t.sectionEditor.sectionTitle}</label>
                        {isEditingTitle ? (
                            <input 
                                type="text" 
                                value={section.title} 
                                onChange={e => onSectionChange('title', e.target.value)}
                                onBlur={() => setIsEditingTitle(false)}
                                autoFocus
                                className={`block w-full bg-transparent border-b-2 border-${currentTheme.accent.split('-')[1]} text-lg font-bold text-white focus:outline-none p-0 pb-1 font-heading`}
                            />
                        ) : (
                            <h3 
                                onClick={() => setIsEditingTitle(true)}
                                className="text-lg font-bold text-white cursor-text hover:text-gray-200 truncate border-b-2 border-transparent hover:border-gray-700 pb-1 transition-all font-heading"
                            >
                                {section.title}
                            </h3>
                        )}
                    </div>
                </div>
            </div>

            {/* Body: Visual Strip */}
            <div className="p-4 flex-grow bg-[#0a0d0c] flex items-center justify-center min-h-[120px]">
                {previewImages.length > 0 ? (
                    <div className="flex items-center -space-x-4 hover:space-x-1 transition-all duration-300 p-2 overflow-x-hidden">
                        {previewImages.map((img, i) => (
                            <div key={i} className="relative w-14 h-20 rounded-lg overflow-hidden border-2 border-[#0a0d0c] shadow-lg transform transition-transform hover:scale-110 hover:z-10 hover:border-white/20">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </div>
                        ))}
                        {section.courses.length > 5 && (
                            <div className="w-10 h-10 rounded-full bg-[#1F2322] border-2 border-[#0a0d0c] flex items-center justify-center text-[10px] text-gray-400 font-bold z-10 ml-2">
                                +{section.courses.length - 5}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-gray-700 text-xs italic flex flex-col items-center gap-2 opacity-40">
                        <FeatherIcon name="image" size={24} />
                        {t.sectionEditor.noCourses}
                    </div>
                )}
            </div>

            {/* Footer: Actions */}
            <div className="p-3 bg-[#0E1110] border-t border-white/5 flex items-center justify-between gap-4">
                
                {/* Link Config Toggle */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                     <button 
                        onClick={() => setIsEditingLink(!isEditingLink)} 
                        className={`p-2 rounded-md transition-colors ${isEditingLink ? 'bg-[#1F2322] text-white' : 'text-gray-600 hover:text-gray-300'}`}
                     >
                         <FeatherIcon name={section.link.type === 'external' ? 'link' : 'layout'} size={14} />
                     </button>
                     
                     {isEditingLink && (
                         <div className="flex-1 flex gap-2 animate-fadeIn">
                            <select 
                                value={section.link.type} 
                                onChange={e => onLinkChange('type', e.target.value)} 
                                className="bg-[#050505] border border-white/10 text-[10px] text-gray-300 rounded px-2 py-1 focus:outline-none font-heading"
                            >
                                <option value="section">{t.sectionEditor.internal}</option>
                                <option value="external">{t.sectionEditor.external}</option>
                            </select>
                            {section.link.type === 'external' && (
                                <input 
                                    type="text" 
                                    value={section.link.value} 
                                    onChange={e => onLinkChange('value', e.target.value)} 
                                    placeholder="https://..." 
                                    className="bg-[#050505] border border-white/10 text-[10px] text-white rounded px-2 py-1 w-full focus:outline-none focus:border-gray-500 font-mono"
                                />
                            )}
                         </div>
                     )}
                </div>

                {/* Manage Button */}
                <button 
                    onClick={onManageCourses} 
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all border border-transparent shadow-sm ${section.courses.length === 0 ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-[#151918] text-white border-white/10 hover:border-gray-500 hover:bg-[#1A1D1C]'}`}
                >
                    <span className="font-heading">{t.sectionEditor.manage}</span>
                    <span className={`px-1.5 py-0.5 rounded bg-black/30 text-[9px] ${currentTheme.accent}`}>{section.courses.length}</span>
                </button>
            </div>
        </div>
    );
};

export default HomepageSectionsEditor;