// Fix: Import React to fix JSX syntax errors.
import React, { useState, useEffect } from 'react';
import type { Theme } from '../types';

interface RichTextToolbarProps {
    theme: Theme;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    setContent: (value: string) => void;
}

type FormatType = 'bold' | 'italic' | 'underline' | 'strike' | 'link' | 'image' | 'quote' | 'carousel';
type ModalType = 'link' | 'image' | 'carousel' | null;

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ theme, textareaRef, setContent }) => {
    const [modalType, setModalType] = useState<ModalType>(null);
    const [url, setUrl] = useState('');
    const [carouselUrls, setCarouselUrls] = useState('');
    const [selection, setSelection] = useState<{ start: number, end: number } | null>(null);

    const themeClasses = {
        iris: { 
            button: 'hover:bg-teal-700/50', 
            input: 'bg-gray-700 border-teal-700/50 focus:border-teal-500 focus:ring-teal-500',
            modalButton: 'bg-teal-600 hover:bg-teal-500',
        },
        pristine: { 
            button: 'hover:bg-red-700/50',
            input: 'bg-gray-700 border-red-700/50 focus:border-red-500 focus:ring-red-500',
            modalButton: 'bg-[#D92626] hover:bg-[#F24444]',
        }
    };
    const currentTheme = themeClasses[theme];

    useEffect(() => {
        if (modalType) {
            const textarea = textareaRef.current;
            if(textarea) {
                setSelection({ start: textarea.selectionStart, end: textarea.selectionEnd });
            }
        }
    }, [modalType, textareaRef]);
    
    const insertText = (textToInsert: string, sel: { start: number, end: number } | null) => {
        const textarea = textareaRef.current;
        if (!textarea || sel === null) return;

        const { value } = textarea;
        const newText = `${value.substring(0, sel.start)}${textToInsert}${value.substring(sel.end)}`;
        
        setContent(newText);
        
        textarea.focus();
        setTimeout(() => {
             textarea.selectionStart = sel.start + textToInsert.length;
             textarea.selectionEnd = sel.start + textToInsert.length;
        }, 0);
    }

    const applyWrapping = (tagStart: string, tagEnd: string, sel: { start: number, end: number } | null) => {
        const textarea = textareaRef.current;
        if (!textarea || sel === null) return;
        
        const { value } = textarea;
        const selectedText = value.substring(sel.start, sel.end);
        const newText = `${value.substring(0, sel.start)}${tagStart}${selectedText || (modalType === 'link' ? 'link text' : '')}${tagEnd}${value.substring(sel.end)}`;
        
        setContent(newText);
        
        textarea.focus();
        setTimeout(() => {
             textarea.selectionStart = sel.start + tagStart.length;
             textarea.selectionEnd = sel.end + tagStart.length;
        }, 0);
    }
    
    const handleToolbarClick = (format: FormatType) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const sel = { start: textarea.selectionStart, end: textarea.selectionEnd };

        switch (format) {
            case 'bold': applyWrapping('<strong>', '</strong>', sel); break;
            case 'italic': applyWrapping('<em>', '</em>', sel); break;
            case 'underline': applyWrapping('<u>', '</u>', sel); break;
            case 'strike': applyWrapping('<s>', '</s>', sel); break;
            case 'link': setModalType('link'); break;
            case 'image': setModalType('image'); break;
            case 'carousel': setModalType('carousel'); break;
            case 'quote': applyWrapping(`\n<blockquote>\n<p>`, `</p>\n</blockquote>\n`, sel); break;
        }
    };
    
    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selection) return;

        if (modalType === 'link' && url) {
            applyWrapping(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, '</a>', selection);
        } else if (modalType === 'image' && url) {
            insertText(`<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:8px;" />`, selection);
        } else if (modalType === 'carousel' && carouselUrls) {
            const urls = carouselUrls.split(/[\n,]+/).map(u => u.trim()).filter(Boolean).join(',');
            if (urls) {
                insertText(`[carousel src="${urls}"]`, selection);
            }
        }
        
        setModalType(null);
        setUrl('');
        setCarouselUrls('');
        setSelection(null);
    };

    const buttons: { format: FormatType, icon: React.ReactNode, title: string }[] = [
        { format: 'bold', icon: <strong>B</strong>, title: 'Bold' },
        { format: 'italic', icon: <em>I</em>, title: 'Italic' },
        { format: 'underline', icon: <u>U</u>, title: 'Underline' },
        { format: 'strike', icon: <s>S</s>, title: 'Strikethrough' },
        { format: 'link', icon: '🔗', title: 'Link' },
        { format: 'image', icon: '🖼️', title: 'Image' },
        { format: 'carousel', icon: '🎠', title: 'Carousel' },
        { format: 'quote', icon: '❞', title: 'Quote' },
    ];
    
    const renderModalContent = () => {
        switch(modalType) {
            case 'link':
            case 'image':
                return (
                     <>
                        <label className="text-sm text-gray-400 block mb-1">Enter {modalType} URL:</label>
                        <div className="flex gap-2">
                             <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className={`flex-grow text-white p-2 text-sm rounded border ${currentTheme.input}`}
                                required
                                autoFocus
                            />
                            <button type="submit" className={`text-white py-1 px-3 text-sm rounded ${currentTheme.modalButton}`}>Add</button>
                            <button type="button" onClick={() => { setModalType(null); setUrl(''); }} className="bg-gray-600 text-white py-1 px-3 text-sm rounded hover:bg-gray-500">Cancel</button>
                        </div>
                    </>
                );
            case 'carousel':
                return (
                    <>
                        <label className="text-sm text-gray-400 block mb-1">Enter Image URLs (one per line or separated by commas):</label>
                        <div className="flex flex-col gap-2">
                            <textarea
                                value={carouselUrls}
                                onChange={(e) => setCarouselUrls(e.target.value)}
                                className={`flex-grow text-white p-2 text-sm rounded border ${currentTheme.input} min-h-[100px]`}
                                required
                                autoFocus
                                placeholder="https://.../image1.png&#10;https://.../image2.png"
                            />
                            <div className="flex justify-end gap-2">
                                <button type="submit" className={`text-white py-1 px-3 text-sm rounded ${currentTheme.modalButton}`}>Add Carousel</button>
                                <button type="button" onClick={() => { setModalType(null); setCarouselUrls(''); }} className="bg-gray-600 text-white py-1 px-3 text-sm rounded hover:bg-gray-500">Cancel</button>
                            </div>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="relative">
            <div className={`bg-gray-800 border border-b-0 border-gray-700 rounded-t-md p-1 flex items-center gap-1 flex-wrap ${theme === 'iris' ? 'border-teal-700/50' : 'border-red-700/50'}`}>
                {buttons.map(({ format, icon, title }) => (
                    <button
                        key={format}
                        type="button"
                        title={title}
                        onClick={() => handleToolbarClick(format)}
                        className={`text-white font-mono rounded w-8 h-8 flex items-center justify-center transition-colors ${currentTheme.button}`}
                    >
                        {icon}
                    </button>
                ))}
            </div>
             {modalType && (
                <div className="absolute top-full left-0 mt-1 w-full z-10 bg-gray-800 p-2 rounded-b-md border border-t-0 border-gray-700 shadow-lg">
                    <form onSubmit={handleModalSubmit}>
                        {renderModalContent()}
                    </form>
                </div>
            )}
        </div>
    );
};

export default RichTextToolbar;