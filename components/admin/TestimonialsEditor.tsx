import React from 'react';
import type { Testimonial, Theme } from '@/types';
import FeatherIcon from '../FeatherIcon';

interface TestimonialsEditorProps {
    testimonials: Testimonial[];
    onChange: (testimonials: Testimonial[]) => void;
    theme: Theme;
    t: any;
    inputClass: string;
    textareaClass: string;
}

const TestimonialsEditor: React.FC<TestimonialsEditorProps> = ({ testimonials, onChange, theme, t, inputClass, textareaClass }) => {
    
    const handleAdd = () => {
        const newTestimonial: Testimonial = { author: '', text: '', stars: 5 };
        onChange([newTestimonial, ...testimonials]);
    };
    
    const handleDelete = (index: number) => {
        onChange(testimonials.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, field: keyof Testimonial, value: string | number) => {
        onChange(testimonials.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const headerClass = `text-2xl font-bold mb-4 ${theme === 'iris' ? 'text-teal-400' : 'text-red-400'}`;
    const buttonClass = `text-white font-bold py-2 px-4 rounded transition-colors ${theme === 'iris' ? 'bg-teal-600 hover:bg-teal-500' : 'bg-red-600 hover:bg-red-500'}`;

    return (
        <div className="bg-gray-900 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className={headerClass}>{t.testimonials}</h2>
                <button onClick={handleAdd} className={buttonClass}>{t.addTestimonial}</button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {testimonials.map((testimonial, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-md space-y-2 relative">
                        <button onClick={() => handleDelete(index)} className="absolute top-2 right-2 p-1 text-red-400 hover:bg-red-900/50 rounded-full"><FeatherIcon name="trash-2" size={16}/></button>
                        <label className="block"><span className="text-gray-400 text-sm">{t.author}</span><input type="text" value={testimonial.author} onChange={e => handleChange(index, 'author', e.target.value)} className={`mt-1 ${inputClass}`} /></label>
                        <label className="block"><span className="text-gray-400 text-sm">{t.text}</span><textarea value={testimonial.text} onChange={e => handleChange(index, 'text', e.target.value)} className={`mt-1 ${textareaClass}`} /></label>
                        <label className="block"><span className="text-gray-400 text-sm">{t.stars}</span><input type="number" min="1" max="5" value={testimonial.stars} onChange={e => handleChange(index, 'stars', parseInt(e.target.value, 10))} className={`mt-1 ${inputClass}`} /></label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TestimonialsEditor;