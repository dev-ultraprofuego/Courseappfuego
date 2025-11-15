import React, { useRef } from 'react';
import type { PillItem, SoftwarePill, Theme, ReorderPayload } from '@/types';
import FeatherIcon from '../FeatherIcon';

interface PillsEditorProps {
    pills: PillItem[];
    onChange: (pills: PillItem[]) => void;
    theme: Theme;
    onManageCourses: (category: SoftwarePill) => void;
    t: any;
}

const DraggablePill: React.FC<{
    index: number;
    pill: SoftwarePill;
    onReorder: (payload: ReorderPayload) => void;
    onManageCourses: () => void;
    t: any;
}> = ({ index, pill, onReorder, onManageCourses, t }) => {
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
            className="flex items-center gap-4 p-2 bg-gray-800 rounded-lg"
        >
            <span className="cursor-move text-gray-500"><FeatherIcon name="move" size={20} /></span>
            <span className="font-semibold text-white">{pill.name}</span>
            <span className="text-sm text-gray-400">({pill.category})</span>
            <div className="flex-grow"></div>
            <button onClick={onManageCourses} className="bg-blue-800/60 hover:bg-blue-700/60 text-white text-sm font-semibold py-1 px-3 rounded-md">
                {t.manageCourses}
            </button>
        </div>
    );
};

const PillsEditor: React.FC<PillsEditorProps> = ({ pills, onChange, theme, onManageCourses, t }) => {
    
    const handleReorder = ({ dragIndex, hoverIndex }: ReorderPayload) => {
        const draggedItem = pills[dragIndex];
        const newOrderedPills = [...pills];
        newOrderedPills.splice(dragIndex, 1);
        newOrderedPills.splice(hoverIndex, 0, draggedItem);
        onChange(newOrderedPills);
    };

    const headerClass = `text-2xl font-bold mb-4 ${theme === 'iris' ? 'text-teal-400' : 'text-red-400'}`;
    
    return (
        <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className={headerClass}>{t.pills}</h2>
            <div className="space-y-2">
                {pills.map((pill, index) => (
                    'category' in pill ? (
                        <DraggablePill
                            key={`${pill.category}-${index}`}
                            index={index}
                            pill={pill}
                            onReorder={handleReorder}
                            onManageCourses={() => onManageCourses(pill)}
                            t={t}
                        />
                    ) : (
                        <div key={`separator-${index}`} className="text-center text-gray-500 py-2">--- {pill.text} ---</div>
                    )
                ))}
            </div>
        </div>
    );
};

export default PillsEditor;