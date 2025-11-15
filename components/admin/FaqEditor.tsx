import React from 'react';
import type { FaqItem, Theme } from '@/types';
import FeatherIcon from '../FeatherIcon';

interface FaqEditorProps {
    faqItems: FaqItem[];
    onChange: (items: FaqItem[]) => void;
    theme: Theme;
    t: any;
    inputClass: string;
    textareaClass: string;
}

const FaqEditor: React.FC<FaqEditorProps> = ({ faqItems, onChange, theme, t, inputClass, textareaClass }) => {
    
    const handleAdd = () => {
        const newItem: FaqItem = { q: '', a: '' };
        onChange([newItem, ...faqItems]);
    };
    
    const handleDelete = (index: number) => {
        onChange(faqItems.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, field: keyof FaqItem, value: string) => {
        onChange(faqItems.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };
    
    const headerClass = `text-2xl font-bold mb-4 ${theme === 'iris' ? 'text-teal-400' : 'text-red-400'}`;
    const buttonClass = `text-white font-bold py-2 px-4 rounded transition-colors ${theme === 'iris' ? 'bg-teal-600 hover:bg-teal-500' : 'bg-red-600 hover:bg-red-500'}`;

    return (
        <div className="bg-gray-900 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className={headerClass}>{t.faq}</h2>
                <button onClick={handleAdd} className={buttonClass}>{t.addFaqItem}</button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {faqItems.map((item, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-md space-y-2 relative">
                        <button onClick={() => handleDelete(index)} className="absolute top-2 right-2 p-1 text-red-400 hover:bg-red-900/50 rounded-full"><FeatherIcon name="trash-2" size={16}/></button>
                        <label className="block"><span className="text-gray-400 text-sm">{t.question}</span><input type="text" value={item.q} onChange={e => handleChange(index, 'q', e.target.value)} className={`mt-1 ${inputClass}`} /></label>
                        <label className="block"><span className="text-gray-400 text-sm">{t.answer}</span><textarea value={item.a} onChange={e => handleChange(index, 'a', e.target.value)} className={`mt-1 ${textareaClass}`} /></label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FaqEditor;