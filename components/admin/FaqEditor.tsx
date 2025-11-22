
import React, { useState, useRef, useEffect } from 'react';
import type { FaqItem, Theme, ReorderPayload } from '@/types';
import FeatherIcon from '../FeatherIcon';

interface FaqEditorProps {
    faqItems: FaqItem[];
    onChange: (items: FaqItem[]) => void;
    theme: Theme;
    t: any;
    inputClass: string;
    textareaClass: string;
    confirmAction?: (title: string, desc: string, action: () => void, isDanger: boolean) => void;
}

const DraggableFaqItem: React.FC<{
    index: number;
    item: FaqItem;
    isExpanded: boolean;
    onToggle: () => void;
    onDelete: (index: number) => void;
    onChange: (index: number, field: keyof FaqItem, value: string) => void;
    onDragStart: (index: number) => void;
    onDragEnter: (index: number) => void;
    onDragEnd: () => void;
    theme: Theme;
    inputClass: string;
    textareaClass: string;
    t: any;
}> = ({ index, item, isExpanded, onToggle, onDelete, onChange, onDragStart, onDragEnter, onDragEnd, theme, inputClass, textareaClass, t }) => {
    const labelClass = `block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 font-heading`;
    const activeBorderClass = theme === 'iris' ? 'border-teal-500/30' : 'border-red-500/30';

    return (
        <div 
            draggable
            onDragStart={() => onDragStart(index)}
            onDragEnter={() => onDragEnter(index)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={onDragEnd}
            className="flex items-start gap-2 group"
        >
            {/* Main Card */}
            <div className={`flex-1 bg-[#0a0d0c] border rounded-xl transition-all duration-200 overflow-hidden ${isExpanded ? activeBorderClass : 'border-white/5 hover:border-white/10'}`}>
                <div className="flex-1 p-4 flex flex-col justify-center">
                    <div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
                         <div className="flex items-center gap-3 flex-1 min-w-0">
                             <span className="text-xs font-mono text-gray-600 w-6 flex-shrink-0">Q{index + 1}</span>
                             <div className="font-medium text-sm text-gray-200 truncate">
                                 {item.q || <span className="text-gray-600 italic">Nouvelle question...</span>}
                             </div>
                         </div>
                         <div className="flex items-center gap-3 pl-4">
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                                className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            >
                                <FeatherIcon name="trash-2" size={14}/>
                            </button>
                             <FeatherIcon name={isExpanded ? "chevron-up" : "chevron-down"} size={16} className="text-gray-500" />
                         </div>
                    </div>

                    {isExpanded && (
                        <div className="pt-4 mt-4 border-t border-white/5 space-y-4 animate-fadeIn">
                            <label className="block">
                                <span className={labelClass}>{t.question}</span>
                                <input 
                                    type="text" 
                                    value={item.q} 
                                    onChange={e => onChange(index, 'q', e.target.value)} 
                                    className={`${inputClass} font-bold`}
                                    placeholder={t.placeholders.question}
                                    autoFocus
                                />
                            </label>
                            <label className="block">
                                <span className={labelClass}>{t.answer}</span>
                                <textarea 
                                    value={item.a} 
                                    onChange={e => onChange(index, 'a', e.target.value)} 
                                    className={`${textareaClass} h-28 text-sm`} 
                                    placeholder={t.placeholders.answer}
                                />
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* Drag Handle - Outside Right */}
            <div className="mt-4 text-gray-700 cursor-move hover:text-gray-400 transition-colors flex-shrink-0 opacity-50 group-hover:opacity-100">
                <FeatherIcon name="more-vertical" size={16} />
            </div>
        </div>
    );
};

const FaqEditor: React.FC<FaqEditorProps> = ({ faqItems, onChange, theme, t, inputClass, textareaClass, confirmAction }) => {
    const [localItems, setLocalItems] = useState(faqItems);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    useEffect(() => {
        setLocalItems(faqItems);
    }, [faqItems]);

    const handleAdd = () => {
        const newItem: FaqItem = { q: '', a: '' };
        const newItems = [newItem, ...localItems];
        setLocalItems(newItems);
        onChange(newItems);
        setExpandedIndex(0);
    };
    
    const handleDelete = (index: number) => {
        const action = () => {
            const newItems = localItems.filter((_, i) => i !== index);
            setLocalItems(newItems);
            onChange(newItems);
            if (expandedIndex === index) setExpandedIndex(null);
        };

        if (confirmAction) {
            confirmAction("Supprimer ?", "Irréversible.", action, true);
        } else if (window.confirm("Supprimer ?")) {
            action();
        }
    };

    const handleChange = (index: number, field: keyof FaqItem, value: string) => {
        const newItems = localItems.map((item, i) => i === index ? { ...item, [field]: value } : item);
        setLocalItems(newItems);
        onChange(newItems);
    };

    const handleDragStart = (index: number) => {
        dragItem.current = index;
    };

    const handleDragEnter = (index: number) => {
        dragOverItem.current = index;
        if (dragItem.current !== null && dragItem.current !== index) {
            const newItems = [...localItems];
            const draggedItemContent = newItems[dragItem.current];
            newItems.splice(dragItem.current, 1);
            newItems.splice(index, 0, draggedItemContent);
            dragItem.current = index;
            setLocalItems(newItems);
            
            if (expandedIndex === dragItem.current) setExpandedIndex(index);
            else if (expandedIndex === index) setExpandedIndex(dragItem.current);
        }
    };

    const handleDragEnd = () => {
        dragItem.current = null;
        dragOverItem.current = null;
        onChange(localItems);
    };

    const glowColor = theme === 'iris' ? "rgba(45,212,191,0.6)" : (theme === 'pristine' ? "rgba(255,71,87,0.6)" : "rgba(217,38,38,0.6)");

    return (
        <div className="max-w-7xl mx-auto pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10 mb-10">
                <div className="lg:col-span-1 p-6 bg-[#0a0d0c] border border-white/5 rounded-xl h-fit sticky top-24">
                     <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                        <FeatherIcon name="help-circle" size={24} className={theme === 'iris' ? 'text-teal-500' : 'text-red-500'} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 font-heading">{t.faq}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6">
                        Questions fréquentes. Glissez sur le côté droit pour réorganiser.
                    </p>
                    <button 
                        onClick={handleAdd} 
                        className="group relative flex items-center justify-center gap-2 bg-gradient-to-b from-[#161a19] to-[#0a0d0c] text-white font-bold py-2.5 px-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-[#131615] hover:border-white/20 font-heading text-xs uppercase tracking-wide w-full"
                        style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.4)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 20px ${glowColor}` }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.4)' }}
                    >
                        <FeatherIcon name="plus-circle" size={16} />
                        {t.addFaqItem}
                    </button>
                </div>

                <div className="lg:col-span-2 space-y-3">
                    {localItems.map((item, index) => (
                        <DraggableFaqItem
                            key={index}
                            index={index}
                            item={item}
                            isExpanded={expandedIndex === index}
                            onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
                            onDelete={handleDelete}
                            onChange={handleChange}
                            onDragStart={handleDragStart}
                            onDragEnter={handleDragEnter}
                            onDragEnd={handleDragEnd}
                            theme={theme}
                            inputClass={inputClass}
                            textareaClass={textareaClass}
                            t={t}
                        />
                    ))}

                    {localItems.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-xl text-gray-600">
                            <p className="text-sm">Aucune question.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FaqEditor;