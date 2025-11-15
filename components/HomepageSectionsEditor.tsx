// Fix: Import React to fix JSX syntax errors.
import React, { useRef } from 'react';
import type { HomepageSection, Course, Theme, ReorderPayload } from '../types';
import FeatherIcon from './FeatherIcon';

interface HomepageSectionsEditorProps {
    sections: HomepageSection[];
    onChange: (sections: HomepageSection[]) => void;
    theme: Theme;
    t: any;
    onEditCourse: (course: Course) => void;
    onManageCourses: (section: HomepageSection) => void;
}

const HomepageSectionsEditor: React.FC<HomepageSectionsEditorProps> = ({ sections, onChange, theme, t, onEditCourse, onManageCourses }) => {
    
    const handleReorder = ({ dragIndex, hoverIndex }: ReorderPayload) => {
        const draggedItem = sections[dragIndex];
        const newOrderedSections = [...sections];
        newOrderedSections.splice(dragIndex, 1);
        newOrderedSections.splice(hoverIndex, 0, draggedItem);
        onChange(newOrderedSections);
    };

    const handleSectionChange = (id: string, field: keyof HomepageSection, value: any) => {
        const newSections = sections.map(s => s.id === id ? { ...s, [field]: value } : s);
        onChange(newSections);
    };

    const handleLinkChange = (id: string, field: 'type' | 'value', value: string) => {
        const newSections = sections.map(s => {
            if (s.id === id) {
                const newLink = { ...s.link, [field]: value };
                if (field === 'type' && value === 'section') {
                    newLink.value = id;
                }
                return { ...s, link: newLink };
            }
            return s;
        });
        onChange(newSections);
    }
    
    const themeClasses = {
        iris: { headerText: 'text-teal-400', button: 'bg-teal-700 hover:bg-teal-600' },
        pristine: { headerText: 'text-red-400', button: 'bg-red-700 hover:bg-red-600' }
    };
    const currentTheme = themeClasses[theme];

    return (
        <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className={`text-2xl font-bold mb-4 ${currentTheme.headerText}`}>{t.sections}</h2>
            <div className="space-y-4">
                {sections.map((section, index) => (
                    <DraggableSection
                        key={section.id}
                        index={index}
                        section={section}
                        onReorder={handleReorder}
                        onSectionChange={(field, value) => handleSectionChange(section.id, field, value)}
                        onLinkChange={(field, value) => handleLinkChange(section.id, field, value)}
                        onManageCourses={() => onManageCourses(section)}
                        t={t}
                        theme={theme}
                    />
                ))}
            </div>
        </div>
    );
};

const DraggableSection: React.FC<{
    index: number;
    section: HomepageSection;
    onReorder: (payload: ReorderPayload) => void;
    onSectionChange: (field: keyof HomepageSection, value: any) => void;
    onLinkChange: (field: 'type' | 'value', value: string) => void;
    onManageCourses: () => void;
    t: any;
    theme: Theme;
}> = ({ index, section, onReorder, onSectionChange, onLinkChange, onManageCourses, t, theme }) => {
    const ref = useRef<HTMLDivElement>(null);
    const dragItem = useRef<number | null>(null);

    const handleDragStart = () => {
        dragItem.current = index;
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, hoverIndex: number) => {
        e.preventDefault();
        if (dragItem.current === null || dragItem.current === hoverIndex) return;
        onReorder({ dragIndex: dragItem.current, hoverIndex });
        dragItem.current = hoverIndex;
    };

    return (
        <div 
            ref={ref} 
            draggable 
            onDragStart={handleDragStart}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={() => dragItem.current = null}
            className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg flex-wrap"
        >
            <span className="cursor-move text-gray-500"><FeatherIcon name="move" size={20} /></span>
            <input 
                type="text" 
                value={section.title} 
                onChange={e => onSectionChange('title', e.target.value)}
                className="flex-grow bg-gray-700 p-2 rounded-md"
            />
             <select value={section.link.type} onChange={e => onLinkChange('type', e.target.value)} className="bg-gray-700 p-2 rounded-md">
                <option value="section">Page de Section</option>
                <option value="external">URL Externe</option>
            </select>
            {section.link.type === 'external' && (
                <input 
                    type="text" 
                    placeholder="https://..."
                    value={section.link.value}
                    onChange={e => onLinkChange('value', e.target.value)} 
                    className="bg-gray-700 p-2 rounded-md w-1/4"
                />
            )}
            <button onClick={onManageCourses} className={`${theme === 'iris' ? 'bg-teal-700 hover:bg-teal-600' : 'bg-red-700 hover:bg-red-600'} text-white font-semibold py-2 px-4 rounded-md text-sm`}>
                {t.manageCourses} ({section.courses.length})
            </button>
        </div>
    );
};

export default HomepageSectionsEditor;