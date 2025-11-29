
// Fix: Import React to fix JSX syntax errors.
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Course, CourseEditorModalProps, SoftwarePill, Theme, Attachment } from '../types';
import RichTextToolbar from './RichTextToolbar';
import { uploadCourseImageAction } from '@/app/actions';
import FeatherIcon from './FeatherIcon';

interface ExtendedCourseEditorModalProps extends CourseEditorModalProps {
    t: any;
}

const CourseEditorModal: React.FC<ExtendedCourseEditorModalProps> = ({ isOpen, onClose, course, onSave, theme, allCategories, t }) => {
    const [formData, setFormData] = useState<Omit<Course, 'id' | 'categories'> & { id?: number; categories: string[] }>({
        title: '', date: '', img: '', description: '', content: '', externalLink: '', categories: [], 
        status: 'draft', slug: '', attachments: [], seoTitle: '', seoDescription: '',
        seoIndex: true, seoCanonical: '', seoSchema: false
    });
    const [isUploading, setIsUploading] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [activeTab, setActiveTab] = useState<'editor' | 'resources' | 'seo'>('editor');
    const [domainName, setDomainName] = useState('CONTENT-COURSE-HUB.COM');
    
    // New Resource Input State
    const [newResName, setNewResName] = useState('');
    const [newResUrl, setNewResUrl] = useState('');
    
    // Advanced Settings Accordion State
    const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setDomainName(window.location.host.toUpperCase());
        }
        if (isOpen) {
            setIsClosing(false);
            document.body.style.overflow = 'hidden';
            if (course) {
                setFormData({
                    ...course,
                    categories: course.categories,
                    description: course.description || '',
                    content: course.content || '',
                    externalLink: course.externalLink || '',
                    status: course.status || 'published',
                    slug: course.slug || '',
                    attachments: course.attachments || [],
                    seoTitle: course.seoTitle || '',
                    seoDescription: course.seoDescription || '',
                    seoIndex: course.seoIndex !== undefined ? course.seoIndex : true,
                    seoCanonical: course.seoCanonical || '',
                    seoSchema: course.seoSchema || false
                });
            } else {
                 setFormData({
                    title: '',
                    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    img: '',
                    description: '',
                    content: '',
                    externalLink: '',
                    categories: [],
                    status: 'draft',
                    slug: '',
                    attachments: [],
                    seoTitle: '',
                    seoDescription: '',
                    seoIndex: true,
                    seoCanonical: '',
                    seoSchema: false
                });
            }
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [course, isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData(prev => {
            const updates = { [name]: type === 'checkbox' ? checked : value };
            if (name === 'title' && (!prev.slug || prev.slug === prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))) {
                updates['slug'] = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            }
            return { ...prev, ...updates };
        });
    };
    
    const handleCategoryChange = (category: string) => {
        setFormData(prev => {
            const newCategories = prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category];
            return { ...prev, categories: newCategories };
        });
    };

    const handleAddAttachment = () => {
        if (newResUrl && newResName) {
            const newAttachment: Attachment = {
                id: Date.now().toString(),
                name: newResName,
                type: 'link',
                url: newResUrl,
                size: 'N/A'
            };
            setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), newAttachment] }));
            setNewResName('');
            setNewResUrl('');
        }
    };

    const removeAttachment = (id: string) => {
        setFormData(prev => ({ ...prev, attachments: (prev.attachments || []).filter(a => a.id !== id) }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const finalCourse: Course = {
            ...formData,
            id: course?.id || Date.now(),
            categories: formData.categories,
        };
        onSave(finalCourse);
        handleClose();
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

    const setContent = (value: string) => {
        setFormData(prev => ({ ...prev, content: value }));
    }

    // --- SEO SCORING LOGIC ---
    const calculateSeoScore = () => {
        let score = 0;
        const titleLen = formData.seoTitle?.length || 0;
        const descLen = formData.seoDescription?.length || 0;
        const hasImage = !!formData.img;
        const hasSlug = !!formData.slug;

        if (titleLen >= 30 && titleLen <= 60) score += 30;
        else if (titleLen > 0) score += 10;

        if (descLen >= 120 && descLen <= 160) score += 30;
        else if (descLen > 0) score += 10;

        if (hasImage) score += 20;
        if (hasSlug) score += 20;

        return score;
    };
    
    const seoScore = calculateSeoScore();
    
    const getScoreColor = (s: number) => {
        if (s >= 90) return '#10b981'; // Emerald
        if (s >= 70) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    const themeClasses = {
        iris: { 
            bg: 'bg-[#0a0d0c]', 
            accent: 'text-teal-400', 
            focusRing: 'focus:ring-teal-500/50',
            focusBorder: 'focus:border-teal-500',
            categoryActive: 'bg-teal-600 text-white border-teal-500',
            toggleActive: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
            glowColor: "rgba(45,212,191,0.6)"
        },
        pristine: { 
            bg: 'bg-[#0a0d0c]', 
            accent: 'text-rose-400', 
            focusRing: 'focus:ring-rose-500/50',
            focusBorder: 'focus:border-rose-500',
            categoryActive: 'bg-[#ff4757] text-white border-[#ff4757]',
            toggleActive: 'bg-[#ff4757]/20 text-[#ff6b81] border-[#ff4757]/30',
            glowColor: "rgba(255,71,87,0.6)"
        },
        boss: { 
            bg: 'bg-[#0a0d0c]', 
            accent: 'text-red-400', 
            focusRing: 'focus:ring-red-500/50',
            focusBorder: 'focus:border-red-500',
            categoryActive: 'bg-[#D92626] text-white border-[#D92626]',
            toggleActive: 'bg-[#D92626]/20 text-[#F24444] border-[#D92626]/30',
            glowColor: "rgba(217,38,38,0.6)"
        }
    };
    const currentTheme = themeClasses[theme];
    
    const inputStyle = `block w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 shadow-inner focus:outline-none transition-all duration-200 ${currentTheme.focusBorder} focus:ring-1 ${currentTheme.focusRing} font-heading`;
    const selectStyle = `block w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none cursor-pointer transition-all duration-200 ${currentTheme.focusBorder} focus:ring-1 ${currentTheme.focusRing} font-heading appearance-none`;

    return (
        <div className="fixed inset-0 z-[70] overflow-hidden flex justify-end">
            <div 
                className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} 
                onClick={handleClose}
            />

            <div className={`relative w-full ${currentTheme.bg} border-l border-white/5 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col h-full ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}>
                
                <form onSubmit={handleSave} className="flex flex-col h-full">
                    {/* 1. Header */}
                    <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#0a0d0c]/90 backdrop-blur-md z-20 flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={handleClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors group">
                                <FeatherIcon name="arrow-left" size={24} className="group-hover:-translate-x-1 transition-transform duration-200" />
                            </button>
                            <div className="h-8 w-px bg-white/10 mx-2"></div>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight font-heading">{course ? t.editor.editCourse : t.editor.createCourse}</h2>
                                <p className="text-sm text-gray-400">{t.editor.fullscreen}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                             <div className="hidden lg:flex items-center gap-1 bg-[#111413] p-1 rounded-lg border border-white/10">
                                <button type="button" onClick={() => setIsPreviewMode(false)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!isPreviewMode ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                                    <div className="flex items-center gap-2"><FeatherIcon name="edit-2" size={12}/> {t.editor.write}</div>
                                </button>
                                <button type="button" onClick={() => setIsPreviewMode(true)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isPreviewMode ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                                    <div className="flex items-center gap-2"><FeatherIcon name="eye" size={12}/> {t.editor.preview}</div>
                                </button>
                            </div>

                            <button type="button" onClick={() => setIsFocusMode(!isFocusMode)} className={`p-2.5 rounded-lg border transition-colors ${isFocusMode ? currentTheme.toggleActive : 'border-white/10 text-gray-500 hover:bg-white/5'}`}>
                                <FeatherIcon name="minimize" size={16} />
                            </button>
                            
                            <button 
                                type="submit" 
                                className="group relative flex items-center gap-2 bg-gradient-to-b from-[#161a19] to-[#0a0d0c] text-white font-bold py-2.5 px-8 rounded-xl border border-white/10 transition-all duration-300 hover:bg-[#131615] hover:border-white/20 font-heading text-xs uppercase tracking-wide"
                                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.4)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 20px ${currentTheme.glowColor}` }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.4)' }}
                            >
                                <FeatherIcon name="save" size={18} />
                                {course ? t.editor.save : t.editor.create}
                            </button>
                        </div>
                    </div>

                    {/* 2. Main Content */}
                    <div className="flex-1 overflow-hidden">
                        <div className="flex flex-col lg:flex-row h-full">
                            
                            {/* LEFT COLUMN: Content Editor */}
                            <div className={`flex-1 border-r border-white/5 overflow-y-auto custom-scrollbar bg-[#0a0d0c] transition-all duration-300 ${isFocusMode ? 'lg:px-32' : ''}`}>
                                
                                <div className="p-8 space-y-8">
                                    {/* Tabs for Content/Resources/SEO */}
                                    <div className="flex items-center gap-6 border-b border-white/5 pb-4 mb-6">
                                        <button type="button" onClick={() => setActiveTab('editor')} className={`text-sm font-bold uppercase tracking-wide pb-1 border-b-2 transition-colors ${activeTab === 'editor' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                                            {t.editor.content}
                                        </button>
                                        <button type="button" onClick={() => setActiveTab('resources')} className={`text-sm font-bold uppercase tracking-wide pb-1 border-b-2 transition-colors ${activeTab === 'resources' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                                            {t.editor.resources}
                                        </button>
                                        <button type="button" onClick={() => setActiveTab('seo')} className={`text-sm font-bold uppercase tracking-wide pb-1 border-b-2 transition-colors ${activeTab === 'seo' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                                            {t.editor.seo}
                                        </button>
                                    </div>

                                    {activeTab === 'editor' ? (
                                        isPreviewMode ? (
                                             <div className="prose prose-invert max-w-none prose-lg prose-headings:font-heading prose-a:text-blue-400">
                                                <h1 className="mb-4">{formData.title || 'Titre du cours'}</h1>
                                                <p className="text-xl text-gray-400 mb-8 leading-relaxed">{formData.description || 'Description courte...'}</p>
                                                <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                                             </div>
                                        ) : (
                                            <>
                                                <div>
                                                    <input 
                                                        type="text" 
                                                        name="title" 
                                                        value={formData.title} 
                                                        onChange={handleChange} 
                                                        placeholder={t.editor.titlePlaceholder}
                                                        className="block w-full bg-transparent border-none p-0 text-4xl font-black text-white placeholder-gray-700 focus:ring-0 font-heading"
                                                        autoFocus
                                                        required 
                                                    />
                                                </div>

                                                <div>
                                                    <textarea 
                                                        name="description" 
                                                        value={formData.description} 
                                                        onChange={handleChange} 
                                                        rows={2} 
                                                        placeholder={t.editor.descPlaceholder}
                                                        className="block w-full bg-transparent border-none p-0 text-lg text-gray-400 placeholder-gray-700 focus:ring-0 resize-none leading-relaxed font-sans"
                                                    ></textarea>
                                                </div>

                                                {/* Rich Content Editor Container */}
                                                <div className="flex flex-col flex-grow min-h-[500px] bg-[#050505] rounded-xl border border-white/10 overflow-hidden shadow-inner relative group">
                                                    <RichTextToolbar theme={theme} textareaRef={contentRef} setContent={setContent} />
                                                    <textarea 
                                                        ref={contentRef} 
                                                        name="content" 
                                                        value={formData.content} 
                                                        onChange={handleChange} 
                                                        className="flex-1 w-full p-8 bg-[#050505] text-gray-200 focus:outline-none resize-none font-sans text-[16px] leading-7"
                                                        placeholder={t.editor.contentPlaceholder}
                                                    ></textarea>
                                                </div>
                                            </>
                                        )
                                    ) : activeTab === 'resources' ? (
                                        <div className="space-y-6 animate-fadeIn">
                                            <h3 className="text-lg font-bold text-white font-heading mb-4">{t.editor.filesTitle}</h3>
                                            
                                            {/* Inline Add Form */}
                                            <div className="bg-[#0E1110] p-4 rounded-xl border border-white/5 flex gap-3 items-end">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">{t.editor.fileName}</label>
                                                    <input 
                                                        type="text" 
                                                        value={newResName} 
                                                        onChange={e => setNewResName(e.target.value)} 
                                                        className={inputStyle} 
                                                        placeholder="Ex: Guide PDF" 
                                                    />
                                                </div>
                                                <div className="flex-[2]">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">{t.editor.url}</label>
                                                    <input 
                                                        type="text" 
                                                        value={newResUrl} 
                                                        onChange={e => setNewResUrl(e.target.value)} 
                                                        className={inputStyle} 
                                                        placeholder="https://..." 
                                                    />
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={handleAddAttachment} 
                                                    disabled={!newResName || !newResUrl}
                                                    className={`px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wide transition-all border ${newResName && newResUrl ? 'bg-white text-black border-white hover:bg-gray-200' : 'bg-white/5 text-gray-500 border-white/5 cursor-not-allowed'}`}
                                                >
                                                    {t.editor.add}
                                                </button>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 gap-3">
                                                {(formData.attachments || []).map((file, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-4 bg-[#0E1110] border border-white/5 rounded-xl group hover:border-white/10">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                                                <FeatherIcon name="link" size={20} />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-sm text-white">{file.name}</div>
                                                                <div className="text-xs text-gray-500 truncate max-w-[300px]">{file.url}</div>
                                                            </div>
                                                        </div>
                                                        <button type="button" onClick={() => removeAttachment(file.id)} className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                            <FeatherIcon name="trash-2" size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {(formData.attachments || []).length === 0 && (
                                                    <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-xl text-gray-500">
                                                        {t.editor.noFiles}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        /* SEO TAB - REMET NOUVEAU SEO (ALIGNED BRICKS + RING) */
                                        <div className="flex flex-col lg:flex-row gap-20 animate-fadeIn">
                                            
                                            {/* LEFT COLUMN: Main Editors (Aligned Bricks - Fixed Width) */}
                                            <div className="flex-1 max-w-[600px] space-y-5">
                                                
                                                {/* 1. Google Preview */}
                                                <div>
                                                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                                        <FeatherIcon name="search" size={14}/>
                                                        {t.googlePreview.title}
                                                    </h3>
                                                    <div className="bg-[#202124] p-5 rounded-xl border border-[#3c4043] shadow-lg">
                                                        <div className="flex items-center gap-3 text-xs text-[#bdc1c6] mb-1 font-sans">
                                                            <div className="w-6 h-6 bg-[#303134] rounded-full flex items-center justify-center text-[10px]">C.</div>
                                                            <span>content-course-hub.com</span>
                                                            <span className="text-[#9aa0a6]">›</span>
                                                            <span>course</span>
                                                            <span className="text-[#9aa0a6]">›</span>
                                                            <span className="truncate max-w-[200px]">{formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</span>
                                                            <FeatherIcon name="more-vertical" size={12} className="text-[#9aa0a6] ml-auto"/>
                                                        </div>
                                                        <div className="text-xl text-[#8ab4f8] font-medium hover:underline cursor-pointer truncate mb-1 font-sans">
                                                            {formData.seoTitle || formData.title || 'Titre du cours'}
                                                        </div>
                                                        <div className="text-sm text-[#bdc1c6] line-clamp-2 font-sans leading-normal">
                                                            <span className="text-[#9aa0a6]">{new Date().toLocaleDateString()} — </span>
                                                            {formData.seoDescription || formData.description || t.googlePreview.desc}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 2. Inputs (Directly Below, Same Width) */}
                                                <div className="space-y-5">
                                                    <div>
                                                        <div className="flex justify-between mb-2">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t.editor.metaTitle}</label>
                                                            <span className={`text-[10px] font-mono ${ (formData.seoTitle?.length || 0) > 60 ? 'text-red-400' : 'text-gray-500'}`}>
                                                                {formData.seoTitle?.length || 0}/60
                                                            </span>
                                                        </div>
                                                        <input 
                                                            type="text" 
                                                            name="seoTitle"
                                                            value={formData.seoTitle || ''} 
                                                            onChange={handleChange} 
                                                            className={inputStyle} 
                                                            placeholder={formData.title}
                                                        />
                                                        {/* Progress Bar for Title - Restored */}
                                                        <div className="w-full h-[2px] bg-white/5 mt-1 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full transition-all duration-500 ${(formData.seoTitle?.length || 0) > 60 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                                                style={{ width: `${Math.min(((formData.seoTitle?.length || 0) / 60) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="flex justify-between mb-2">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t.editor.metaDesc}</label>
                                                            <span className={`text-[10px] font-mono ${ (formData.seoDescription?.length || 0) > 160 ? 'text-red-400' : 'text-gray-500'}`}>
                                                                {formData.seoDescription?.length || 0}/160
                                                            </span>
                                                        </div>
                                                        <textarea 
                                                            name="seoDescription"
                                                            value={formData.seoDescription || ''} 
                                                            onChange={handleChange} 
                                                            className={`${inputStyle} min-h-[100px] resize-none`} 
                                                            placeholder={formData.description}
                                                        />
                                                        {/* Progress Bar for Description - Restored */}
                                                        <div className="w-full h-[2px] bg-white/5 mt-1 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full transition-all duration-500 ${(formData.seoDescription?.length || 0) > 160 ? 'bg-red-500' : 'bg-green-500'}`} 
                                                                style={{ width: `${Math.min(((formData.seoDescription?.length || 0) / 160) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 3. Social Preview (Below) */}
                                                <div className="pt-6 border-t border-white/5">
                                                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                                        <FeatherIcon name="share-2" size={14}/>
                                                        {t.editor.socialPreview}
                                                    </h3>
                                                    <div className="rounded-xl border border-white/10 overflow-hidden bg-black">
                                                        <div className="aspect-[2/1] bg-[#111] relative flex items-center justify-center text-gray-700">
                                                            {formData.img ? (
                                                                <img src={formData.img} alt="Social" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <FeatherIcon name="image" size={32} />
                                                            )}
                                                        </div>
                                                        <div className="p-3 bg-black">
                                                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">{domainName}</div>
                                                            <div className="text-sm text-white/90 font-bold line-clamp-1">{formData.seoTitle || formData.title || 'Titre'}</div>
                                                            <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{formData.seoDescription || formData.description || 'Description...'}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 4. Advanced Config (Accordion) */}
                                                <div className="pt-4">
                                                    <button type="button" onClick={() => setIsAdvancedSettingsOpen(!isAdvancedSettingsOpen)} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-wide">
                                                        <FeatherIcon name={isAdvancedSettingsOpen ? 'chevron-down' : 'settings'} size={12} />
                                                        {t.editor.advancedConfig}
                                                    </button>
                                                    
                                                    {isAdvancedSettingsOpen && (
                                                        <div className="mt-4 space-y-4 p-4 bg-[#0E1110] rounded-xl border border-white/5 animate-fadeIn">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="text-xs font-bold text-white">{t.editor.indexing}</div>
                                                                    <div className="text-[10px] text-gray-500">{t.editor.indexingDesc}</div>
                                                                </div>
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => setFormData(p => ({ ...p, seoIndex: !p.seoIndex }))}
                                                                    className={`relative w-9 h-5 rounded-full transition-colors duration-300 focus:outline-none ${formData.seoIndex ? 'bg-green-600' : 'bg-gray-700'}`}
                                                                >
                                                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${formData.seoIndex ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                                                <div>
                                                                    <div className="text-xs font-bold text-white">{t.editor.schema}</div>
                                                                    <div className="text-[10px] text-gray-500">{t.editor.schemaDesc}</div>
                                                                </div>
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => setFormData(p => ({ ...p, seoSchema: !p.seoSchema }))}
                                                                    className={`relative w-9 h-5 rounded-full transition-colors duration-300 focus:outline-none ${formData.seoSchema ? currentTheme.toggleActive : 'bg-gray-700'}`}
                                                                >
                                                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${formData.seoSchema ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                                </button>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{t.editor.canonical}</label>
                                                                <input type="text" name="seoCanonical" value={formData.seoCanonical || ''} onChange={handleChange} className={inputStyle} placeholder="https://original-source.com..." />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                            </div>

                                            {/* RIGHT COLUMN: Health Hub (Floating Ring Chart) */}
                                            <div className="w-full lg:w-[300px] flex-shrink-0 space-y-6">
                                                
                                                {/* Health Ring Chart - Minimalist Ring */}
                                                <div className="bg-[#0E1110] p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                                                    <div className="relative w-32 h-32">
                                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                            <path
                                                                className="text-[#1A1D1C]"
                                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                            />
                                                            <path
                                                                className="transition-all duration-1000 ease-out"
                                                                strokeDasharray={`${seoScore}, 100`}
                                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                fill="none"
                                                                stroke={getScoreColor(seoScore)}
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                                            <span className="text-3xl font-heading font-bold text-white block">{seoScore}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Minimalist Checklist with Gauge Lines */}
                                                <div className="space-y-4">
                                                    <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-2 font-heading pl-1">{t.editor.criteria}</h4>
                                                    
                                                    {/* Item 1: Title Length */}
                                                    <div className="py-1 pb-2">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs text-gray-400">{t.editor.lengthTitle}</span>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${ (formData.seoTitle?.length || 0) >= 30 && (formData.seoTitle?.length || 0) <= 60 ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' : 'bg-gray-700'}`}></div>
                                                        </div>
                                                        <div className="w-full h-[1px] bg-white/5 rounded-full overflow-hidden relative">
                                                            <div 
                                                                className={`absolute left-0 top-0 h-full transition-all duration-500 ${ (formData.seoTitle?.length || 0) >= 30 && (formData.seoTitle?.length || 0) <= 60 ? 'bg-green-500' : 'bg-gray-600'}`}
                                                                style={{ width: `${Math.min(((formData.seoTitle?.length || 0) / 60) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    {/* Item 2: Desc Length */}
                                                    <div className="py-1 pb-2">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs text-gray-400">{t.editor.lengthDesc}</span>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${ (formData.seoDescription?.length || 0) >= 120 && (formData.seoDescription?.length || 0) <= 160 ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' : 'bg-gray-700'}`}></div>
                                                        </div>
                                                        <div className="w-full h-[1px] bg-white/5 rounded-full overflow-hidden relative">
                                                            <div 
                                                                className={`absolute left-0 top-0 h-full transition-all duration-500 ${ (formData.seoDescription?.length || 0) >= 120 && (formData.seoDescription?.length || 0) <= 160 ? 'bg-green-500' : 'bg-gray-600'}`}
                                                                style={{ width: `${Math.min(((formData.seoDescription?.length || 0) / 160) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    {/* Item 3: Social Image */}
                                                    <div className="py-1 pb-2 border-b border-white/5">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs text-gray-400">{t.editor.socialImage}</span>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${ formData.img ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' : 'bg-gray-700'}`}></div>
                                                        </div>
                                                    </div>

                                                    {/* Item 4: Slug */}
                                                    <div className="py-1 pb-2 last:border-0">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs text-gray-400">{t.editor.cleanSlug}</span>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${ formData.slug ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' : 'bg-gray-700'}`}></div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Metadata (Hidden in Focus Mode) */}
                            <div className={`${isFocusMode ? 'hidden' : 'block'} w-full lg:w-[350px] bg-[#0E1110] p-6 space-y-8 flex-shrink-0 border-l border-white/5 overflow-y-auto custom-scrollbar`}>
                                
                                {/* Status & Slug */}
                                <div className="space-y-4 p-4 bg-[#050505] rounded-xl border border-white/5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 font-heading">{t.editor.status}</label>
                                        <div className="relative">
                                            <select name="status" value={formData.status} onChange={handleChange} className={`${selectStyle} ${formData.status === 'published' ? 'text-green-400' : 'text-gray-400'}`}>
                                                <option value="draft">{t.editor.draft}</option>
                                                <option value="published">{t.editor.published}</option>
                                                <option value="archived">{t.editor.archived}</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500"><FeatherIcon name="chevron-down" size={14}/></div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 font-heading">{t.editor.slug}</label>
                                        <input type="text" name="slug" value={formData.slug} onChange={handleChange} className={inputStyle} placeholder="mon-super-cours" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1 font-heading">{t.editor.coverImage}</label>
                                    <div className="space-y-3">
                                        <div className={`relative aspect-video rounded-xl overflow-hidden border-2 border-dashed ${formData.img ? 'border-transparent shadow-md' : 'border-white/10 bg-[#050505]'} group transition-all`}>
                                            {formData.img ? (
                                                <>
                                                    <img src={formData.img} alt="Cover" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm font-medium text-xs border border-white/10 font-heading uppercase tracking-wide">{t.editor.change}</button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 cursor-pointer hover:text-gray-400 hover:bg-[#111413] transition-colors" onClick={() => fileInputRef.current?.click()}>
                                                    <FeatherIcon name="image" size={24} className="mb-2 opacity-50" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wide font-heading">{t.upload}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <input type="text" name="img" value={formData.img} onChange={handleChange} placeholder="URL..." className={inputStyle} />
                                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                                        </div>
                                        {isUploading && <div className="text-[10px] text-blue-400 animate-pulse mt-1 ml-1">Téléchargement...</div>}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 font-heading">{t.editor.date}</label>
                                        <input type="text" name="date" value={formData.date} onChange={handleChange} className={inputStyle} required />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 font-heading">{t.editor.externalLink}</label>
                                        <input type="text" name="externalLink" value={formData.externalLink} onChange={handleChange} placeholder="https://..." className={inputStyle} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1 font-heading">{t.editor.tags}</label>
                                    <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2 p-1">
                                        {allCategories.map(cat => (
                                            <button
                                                key={cat.category}
                                                type="button"
                                                onClick={() => handleCategoryChange(cat.category)}
                                                className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-all border font-heading ${formData.categories.includes(cat.category) ? currentTheme.categoryActive : 'bg-[#1A1D1C] text-gray-500 border-white/10 hover:border-gray-600 hover:text-gray-300'}`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseEditorModal;