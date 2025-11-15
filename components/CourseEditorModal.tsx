// Fix: Import React to fix JSX syntax errors.
import React, { useState, useEffect, useRef } from 'react';
import type { Course, CourseEditorModalProps, SoftwarePill, Theme } from '../types';
import RichTextToolbar from './RichTextToolbar';
import { uploadCourseImageAction } from '@/app/actions';

const CourseEditorModal: React.FC<CourseEditorModalProps> = ({ isOpen, onClose, course, onSave, theme, allCategories }) => {
    const [formData, setFormData] = useState<Omit<Course, 'id' | 'categories'> & { id?: number; categories: string[] }>({
        title: '', date: '', img: '', description: '', content: '', externalLink: '', categories: []
    });
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (course) {
            setFormData({
                ...course,
                categories: course.categories,
                description: course.description || '',
                content: course.content || '',
                externalLink: course.externalLink || ''
            });
        } else {
             setFormData({
                title: '',
                date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                img: '',
                description: '',
                content: '',
                externalLink: '',
                categories: []
            });
        }
    }, [course, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCategoryChange = (category: string) => {
        setFormData(prev => {
            const newCategories = prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category];
            return { ...prev, categories: newCategories };
        });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const finalCourse: Course = {
            ...formData,
            id: course?.id || Date.now(),
            categories: formData.categories,
        };
        onSave(finalCourse);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadCourseImageAction(formData);

        if (result.success && result.url) {
            setFormData(prev => ({ ...prev, img: result.url }));
        } else {
            alert(`Upload failed: ${result.error}`);
        }
        setIsUploading(false);
    };

    const themeClasses = {
        iris: { bg: 'bg-gray-900', border: 'border-teal-700/50', button: 'bg-teal-600 hover:bg-teal-500', headerText: 'text-teal-400', input: 'bg-gray-800 border-gray-700 focus:border-teal-500 focus:ring-teal-500' },
        pristine: { bg: 'bg-gray-900', border: 'border-red-700/50', button: 'bg-[#D92626] hover:bg-[#F24444]', headerText: 'text-red-400', input: 'bg-gray-800 border-gray-700 focus:border-red-500 focus:ring-red-500' }
    };
    const currentTheme = themeClasses[theme];

    const setContent = (value: string) => {
        setFormData(prev => ({ ...prev, content: value }));
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-4xl h-[90vh] ${currentTheme.bg} border ${currentTheme.border} rounded-lg shadow-lg flex flex-col`}>
                <header className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className={`text-2xl font-bold ${currentTheme.headerText}`}>{course ? 'Edit Course' : 'Add New Course'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </header>
                
                <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm p-3 ${currentTheme.input}`} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Image URL</label>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="relative flex-grow">
                                    <input type="text" name="img" value={formData.img} onChange={handleChange} className={`block w-full rounded-md shadow-sm p-3 pr-8 ${currentTheme.input}`} required />
                                    {formData.img && (
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData(prev => ({ ...prev, img: '' }))}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white w-6 h-6 rounded-full flex items-center justify-center"
                                            aria-label="Clear image URL"
                                        >
                                            &times;
                                        </button>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className={`py-3 px-4 rounded-md text-sm font-semibold whitespace-nowrap ${currentTheme.button} disabled:opacity-50`}>
                                    {isUploading ? 'Uploading...' : 'Upload Image'}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Date</label>
                            <input type="text" name="date" value={formData.date} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm p-3 ${currentTheme.input}`} required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Categories</label>
                        <div className="max-h-32 overflow-y-auto bg-gray-800 p-2 rounded-md border border-gray-700 flex flex-wrap gap-2">
                            {allCategories.map(cat => (
                                <button
                                    key={cat.category}
                                    type="button"
                                    onClick={() => handleCategoryChange(cat.category)}
                                    className={`py-1 px-3 rounded-full text-sm font-semibold transition-colors ${formData.categories.includes(cat.category) ? `${currentTheme.button} text-white` : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Description (Short)</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className={`mt-1 block w-full rounded-md shadow-sm p-3 ${currentTheme.input}`}></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Content (HTML allowed)</label>
                        <RichTextToolbar theme={theme} textareaRef={contentRef} setContent={setContent} />
                        <textarea ref={contentRef} name="content" value={formData.content} onChange={handleChange} rows={5} className={`mt-0 block w-full rounded-b-md shadow-sm p-3 border-t-0 bg-gray-200 text-black ${currentTheme.input}`}></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Default External Link URL (Optional)</label>
                        <input type="text" name="externalLink" value={formData.externalLink} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm p-3 ${currentTheme.input}`} />
                    </div>

                    <footer className="pt-4 flex justify-end gap-3 flex-shrink-0">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
                        <button type="submit" className={`${currentTheme.button} text-white font-bold py-2 px-4 rounded`}>Save Course</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default CourseEditorModal;