'use client';
import React, { useRef, useState, useEffect } from 'react';
import type { PillItem, SoftwarePill, Theme, ReorderPayload } from '@/types';
import FeatherIcon from '../FeatherIcon';

interface PillsEditorProps {
    pills: PillItem[];
    onChange: (pills: PillItem[]) => void;
    theme: Theme;
    onManageCourses: (category: SoftwarePill) => void;
    t: any;
    onLog?: (action: string, details: string) => void;
}

const DraggablePill: React.FC<{
    index: number;
    pill: SoftwarePill;
    onDragStart: (index: number) => void;
    onDragEnter: (index: number) => void;
    onDragEnd: () => void;
    onManageCourses: () => void;
    onUpdate: (updatedPill: SoftwarePill) => void;
    t: any;
}> = ({ index, pill, onDragStart, onDragEnter, onDragEnd, onManageCourses, onUpdate, t }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const renderIcon = () => {
        if (pill.iconType === 'img') {
            return <img src={pill.icon} alt="" className="w-4 h-4 object-contain" />;
        } else if (pill.iconType === 'text') {
            return <span className="text-[10px] font-black tracking-tighter">{pill.icon}</span>;
        }
        return <FeatherIcon name={pill.icon} size={14} />;
    };

    const toggleLinkMode = () => {
        const newType = pill.linkType === 'external' ? 'category' : 'external';
        onUpdate({ ...pill, linkType: newType });
        if (newType === 'external') setIsExpanded(true);
    };

    return (
        <div 
            draggable 
            onDragStart={() => onDragStart(index)}
            onDragEnter={() => onDragEnter(index)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={onDragEnd}
            className="bg-[#0E1110] border border-[#1F2322] rounded-lg hover:border-[#333] transition-all group mb-2 overflow-hidden"
        >
            {/* Main Row */}
            <div className="flex items-center gap-4 p-3">
                <span className="cursor-move text-gray-600 hover:text-gray-300"><FeatherIcon name="move" size={16} /></span>
                
                <div className="w-8 h-8 rounded-full bg-[#1A1D1C] flex items-center justify-center border border-[#2a2f2e] text-white">
                    {renderIcon()}
                </div>

                <div className="flex flex-col">
                    <span className="font-bold text-sm text-white leading-tight">{pill.name}</span>
                </div>

                <div className="flex-grow"></div>

                {/* Toggle Button - Invisible unless hovered (Ghost) */}
                <button 
                    onClick={toggleLinkMode}
                    className={`p-2 rounded transition-all opacity-0 group-hover:opacity-100 ${pill.linkType === 'external' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
                >
                     <FeatherIcon name={pill.linkType === 'external' ? 'link' : 'grid'} size={14} />
                </button>

                {/* Manage Button - Rectangular w-12 h-8 with Layers Icon (Controlled Size) */}
                {pill.linkType !== 'external' && (
                    <button 
                        onClick={onManageCourses} 
                        className="h-8 w-12 flex items-center justify-center rounded-md bg-[#151918] border border-[#2a2f2e] text-gray-400 hover:text-white hover:bg-[#1A1D1C] hover:border-white/20 transition-all shadow-sm group/btn"
                    >
                        <FeatherIcon name="layers" size={14} className="group-hover/btn:scale-110 transition-transform"/>
                    </button>
                )}
            </div>

            {/* Expansion Panel only for External Link URL */}
            {isExpanded && pill.linkType === 'external' && (
                <div className="p-4 border-t border-white/5 bg-[#050505]/50 rounded-b-lg animate-fadeIn">
                    <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t.destinationUrl}</label>
                        <input 
                            type="text" 
                            value={pill.externalUrl || ''} 
                            onChange={(e) => onUpdate({ ...pill, externalUrl: e.target.value })}
                            placeholder="https://..." 
                            className="w-full bg-[#0a0d0c] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500/50 focus:outline-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const PillsEditor: React.FC<PillsEditorProps> = ({ pills, onChange, theme, onManageCourses, t, onLog }) => {
    const [localPills, setLocalPills] = useState(pills);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    useEffect(() => {
        setLocalPills(pills);
    }, [pills]);

    const handleDragStart = (index: number) => {
        dragItem.current = index;
    };

    const handleDragEnter = (index: number) => {
        dragOverItem.current = index;
        if (dragItem.current !== null && dragItem.current !== index) {
            const newPills = [...localPills];
            const draggedItemContent = newPills[dragItem.current];
            newPills.splice(dragItem.current, 1);
            newPills.splice(index, 0, draggedItemContent);
            dragItem.current = index;
            setLocalPills(newPills);
        }
    };

    const handleDragEnd = () => {
        dragItem.current = null;
        dragOverItem.current = null;
        onChange(localPills);
        if (onLog) onLog('CATEGORY_REORDER', "L'ordre a été modifié|Catégories > Réorganisation");
    };

    const handleUpdatePill = (index: number, updatedPill: SoftwarePill) => {
        const newPills = [...localPills];
        newPills[index] = updatedPill;
        setLocalPills(newPills);
        onChange(newPills);
    };

    const headerClass = `text-xl font-bold text-white mb-6`;
    
    return (
        <div className="bg-[#0a0d0c] border border-[#1F2322] p-6 rounded-xl">
            <h2 className={headerClass}>{t.pills}</h2>
            <div className="space-y-2 pr-1">
                {localPills.map((pill, index) => (
                    'category' in pill ? (
                        <DraggablePill
                            key={pill.category} 
                            index={index}
                            pill={pill}
                            onDragStart={handleDragStart}
                            onDragEnter={handleDragEnter}
                            onDragEnd={handleDragEnd}
                            onManageCourses={() => onManageCourses(pill)}
                            onUpdate={(updated) => handleUpdatePill(index, updated)}
                            t={t}
                        />
                    ) : (
                        <div key={`separator-${index}`} className="flex items-center gap-4 py-2 opacity-50">
                            <div className="h-px flex-1 bg-[#2a2f2e]"></div>
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{pill.text}</span>
                            <div className="h-px flex-1 bg-[#2a2f2e]"></div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default PillsEditor;