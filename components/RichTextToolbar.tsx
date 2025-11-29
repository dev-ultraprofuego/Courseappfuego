
// Fix: Import React to fix JSX syntax errors.
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Theme } from '../types';
import FeatherIcon from './FeatherIcon';

interface RichTextToolbarProps {
    theme: Theme;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    setContent: (value: string) => void;
}

type FormatType = 'bold' | 'italic' | 'underline' | 'strike' | 'h2' | 'h3' | 'ul' | 'ol' | 'link' | 'image' | 'video' | 'carousel' | 'quote' | 'divider' | 'callout';
type ModalType = 'link' | 'image' | 'video' | 'carousel' | 'callout';

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ theme, textareaRef, setContent }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType | null>(null);
    const [modalValue, setModalValue] = useState('');
    const [modalLabel, setModalLabel] = useState('');
    const [mounted, setMounted] = useState(false);
    
    // Extended State for Link features
    const [linkText, setLinkText] = useState('');
    const [isButtonStyle, setIsButtonStyle] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);
    
    const themeClasses = {
        iris: { 
            button: 'hover:bg-teal-500/10 text-teal-400 hover:text-teal-300 border-teal-500/10', 
            modalBg: 'bg-[#0a0d0c]',
            modalBorder: 'border-teal-500/30',
            modalInput: 'bg-[#050505] border-[#2a2f2e] focus:border-teal-500 focus:ring-teal-500',
            modalButton: 'bg-teal-600 hover:bg-teal-500',
            toggleActive: 'bg-teal-600',
            activeColor: '#7de8d0'
        },
        pristine: { 
            button: 'hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 border-rose-500/10',
            modalBg: 'bg-[#0a0d0c]',
            modalBorder: 'border-rose-500/30',
            modalInput: 'bg-[#050505] border-[#2a2f2e] focus:border-rose-500 focus:ring-rose-500',
            modalButton: 'bg-[#ff4757] hover:bg-[#ff6b81]',
            toggleActive: 'bg-[#ff4757]',
            activeColor: '#ff4757'
        },
        boss: {
            button: 'hover:bg-red-500/10 text-red-400 hover:text-red-300 border-red-500/10',
            modalBg: 'bg-[#0a0d0c]',
            modalBorder: 'border-red-500/30',
            modalInput: 'bg-[#050505] border-[#2a2f2e] focus:border-red-500 focus:ring-red-500',
            modalButton: 'bg-[#D92626] hover:bg-[#F24444]',
            toggleActive: 'bg-[#D92626]',
            activeColor: '#D92626'
        }
    };
    const currentTheme = themeClasses[theme];
    
    const openModal = (type: ModalType) => {
        const textarea = textareaRef.current;
        const selectedText = textarea ? textarea.value.substring(textarea.selectionStart, textarea.selectionEnd) : '';

        let label = '';
        if (type === 'link') label = "URL de destination";
        if (type === 'image') label = "URL de l'image";
        if (type === 'video') label = "URL de la vidéo (Youtube/Vimeo/MP4)";
        if (type === 'carousel') label = "URLs des images (séparées par des virgules)";
        
        setModalType(type);
        setModalLabel(label);
        setModalValue('');
        
        // Smart preset for Link
        if (type === 'link') {
            setLinkText(selectedText);
            setIsButtonStyle(false);
        }

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalValue('');
        setModalType(null);
        setLinkText('');
        setIsButtonStyle(false);
    };

    const handleToolbarClick = (format: FormatType) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const sel = { start: textarea.selectionStart, end: textarea.selectionEnd };
        const selectedText = textarea.value.substring(sel.start, sel.end);
        
        const insertAround = (startTag: string, endTag: string) => {
             const { value } = textarea;
            const newText = `${value.substring(0, sel.start)}${startTag}${selectedText}${endTag}${value.substring(sel.end)}`;
            setContent(newText);
            textarea.focus();
            setTimeout(() => {
                 textarea.selectionStart = sel.start + startTag.length;
                 textarea.selectionEnd = sel.start + startTag.length + selectedText.length;
            }, 0);
        }

        switch (format) {
            case 'bold': insertAround('<strong>', '</strong>'); break;
            case 'italic': insertAround('<em>', '</em>'); break;
            case 'underline': insertAround('<u>', '</u>'); break;
            case 'strike': insertAround('<s>', '</s>'); break;
            case 'h2': insertAround('\n<h2>', '</h2>\n'); break;
            case 'h3': insertAround('\n<h3>', '</h3>\n'); break;
            case 'ul': insertAround('\n<ul>\n  <li>', '</li>\n</ul>\n'); break;
            case 'ol': insertAround('\n<ol>\n  <li>', '</li>\n</ol>\n'); break;
            case 'quote': insertAround('\n<blockquote>\n  ', '\n</blockquote>\n'); break;
            case 'divider': insertAround('\n<hr />\n', ''); break;
            case 'link': openModal('link'); break;
            case 'image': openModal('image'); break;
            case 'video': openModal('video'); break;
            case 'carousel': openModal('carousel'); break;
            case 'callout': openModal('callout'); break;
        }
    };

    const insertCallout = (type: 'info' | 'warning' | 'danger' | 'success') => {
        const colors = {
            info: { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: 'ℹ️', title: 'Information' },
            warning: { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: '⚠️', title: 'Attention' },
            danger: { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: '🛑', title: 'Important' },
            success: { border: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: '✅', title: 'Astuce' }
        };
        const c = colors[type];
        
        // Inline styles for robustness across themes
        const html = `\n<div style="border-left: 4px solid ${c.border}; background: ${c.bg}; padding: 1.5rem; border-radius: 4px; margin: 1.5rem 0; display: flex; gap: 1rem; align-items: flex-start;">
  <div style="font-size: 1.5rem; line-height: 1;">${c.icon}</div>
  <div>
    <strong style="display: block; margin-bottom: 0.5rem; color: ${c.border}; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;">${c.title}</strong>
    <span style="color: rgba(255,255,255,0.9);">Votre texte ici...</span>
  </div>
</div>\n`;

        handleInsertText(html);
        closeModal();
    };

    const handleInsertText = (textToInsert: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        
        const sel = { start: textarea.selectionStart, end: textarea.selectionEnd };
        const { value } = textarea;
        const newText = `${value.substring(0, sel.start)}${textToInsert}${value.substring(sel.end)}`;
        setContent(newText);
        
        textarea.focus();
        setTimeout(() => {
             textarea.selectionStart = textarea.selectionEnd = sel.start + textToInsert.length;
        }, 0);
    }

    const handleConfirm = () => {
        if (modalType !== 'callout' && !modalValue && modalType !== 'link') {
             closeModal();
             return;
        }
        // Link allows empty modalValue if just configuring text? No, usually we need URL.
        if (modalType === 'link' && !modalValue) {
            closeModal(); // Or show error
            return;
        }

        let htmlToInsert = '';
        switch (modalType) {
            case 'link':
                const textToLink = linkText || modalValue;
                // Button Style Logic
                const style = isButtonStyle 
                    ? `display: inline-block; background: ${currentTheme.activeColor}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em; margin: 10px 0; box-shadow: 0 4px 14px rgba(0,0,0,0.25); transition: transform 0.2s;`
                    : `color: ${currentTheme.activeColor}; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; font-weight: 600;`;
                
                htmlToInsert = `<a href="${modalValue}" target="_blank" rel="noopener noreferrer" style="${style}">${textToLink}</a>`;
                break;
            case 'image':
                htmlToInsert = `\n<img src="${modalValue}" alt="Image" style="max-width:100%;height:auto;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.3);" />\n`;
                break;
            case 'video':
                let embedUrl = modalValue;
                if (modalValue.includes('youtube.com/watch?v=')) {
                    embedUrl = modalValue.replace('watch?v=', 'embed/');
                } else if (modalValue.includes('youtu.be/')) {
                    embedUrl = modalValue.replace('youtu.be/', 'youtube.com/embed/');
                }
                htmlToInsert = `\n<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;margin:1em 0;border:1px solid rgba(255,255,255,0.1);"><iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>\n`;
                break;
            case 'carousel':
                htmlToInsert = `\n[carousel src="${modalValue}"]\n`;
                break;
        }

        if (htmlToInsert) {
            handleInsertText(htmlToInsert);
        }

        closeModal();
    };

    const groups = [
        [
            { format: 'h2', icon: <FeatherIcon name="heading-1" size={16} />, title: 'Grand Titre (H2)' },
            { format: 'h3', icon: <FeatherIcon name="heading-2" size={16} />, title: 'Sous-titre (H3)' },
        ],
        [
            { format: 'bold', icon: <FeatherIcon name="bold" size={14} />, title: 'Gras' },
            { format: 'italic', icon: <FeatherIcon name="italic" size={14} />, title: 'Italique' },
            { format: 'underline', icon: <FeatherIcon name="underline" size={14} />, title: 'Souligné' },
            { format: 'strike', icon: <FeatherIcon name="strike" size={14} />, title: 'Barré' },
        ],
        [
            { format: 'ul', icon: <FeatherIcon name="list" size={16} />, title: 'Liste à puces' },
            { format: 'ol', icon: <FeatherIcon name="list-ordered" size={16} />, title: 'Liste numérotée' },
            { format: 'quote', icon: <FeatherIcon name="quote" size={14} />, title: 'Citation' },
            { format: 'callout', icon: <FeatherIcon name="alert-triangle" size={14} />, title: 'Alerte / Info' },
        ],
        [
            { format: 'link', icon: <FeatherIcon name="link" size={14}/>, title: 'Lien' },
            { format: 'image', icon: <FeatherIcon name="image" size={14}/>, title: 'Image' },
            { format: 'video', icon: <FeatherIcon name="video" size={14}/>, title: 'Vidéo' },
            { format: 'carousel', icon: <FeatherIcon name="layers" size={14}/>, title: 'Carrousel' },
        ],
        [
            { format: 'divider', icon: <FeatherIcon name="minus" size={14}/>, title: 'Séparateur' },
        ]
    ];
    
    // Render Content for Modal based on Type
    const renderModalBody = () => {
        if (modalType === 'callout') {
            return (
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => insertCallout('info')} className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex flex-col items-center gap-2 group">
                        <FeatherIcon name="info" size={24} className="text-blue-400" />
                        <span className="text-xs font-bold text-blue-400 uppercase">Info</span>
                    </button>
                    <button onClick={() => insertCallout('success')} className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors flex flex-col items-center gap-2 group">
                        <FeatherIcon name="check-circle" size={24} className="text-green-400" />
                        <span className="text-xs font-bold text-green-400 uppercase">Succès</span>
                    </button>
                    <button onClick={() => insertCallout('warning')} className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors flex flex-col items-center gap-2 group">
                        <FeatherIcon name="alert-triangle" size={24} className="text-yellow-400" />
                        <span className="text-xs font-bold text-yellow-400 uppercase">Attention</span>
                    </button>
                    <button onClick={() => insertCallout('danger')} className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors flex flex-col items-center gap-2 group">
                        <FeatherIcon name="x-octagon" size={24} className="text-red-400" />
                        <span className="text-xs font-bold text-red-400 uppercase">Important</span>
                    </button>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 font-heading">{modalLabel}</label>
                    <input
                        type="text"
                        value={modalValue}
                        onChange={(e) => setModalValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                        className={`block w-full rounded-lg shadow-inner p-3 text-sm text-white focus:ring-1 focus:outline-none transition-all font-heading ${currentTheme.modalInput}`}
                        autoFocus
                        placeholder="https://..."
                    />
                </div>

                {modalType === 'link' && (
                    <>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 font-heading">Texte du lien</label>
                            <input
                                type="text"
                                value={linkText}
                                onChange={(e) => setLinkText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                                className={`block w-full rounded-lg shadow-inner p-3 text-sm text-white focus:ring-1 focus:outline-none transition-all font-heading ${currentTheme.modalInput}`}
                                placeholder="Cliquez ici..."
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Afficher comme un bouton</span>
                            <button 
                                onClick={() => setIsButtonStyle(!isButtonStyle)}
                                className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none ${isButtonStyle ? currentTheme.toggleActive : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isButtonStyle ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </>
                )}
                
                <div className="flex justify-end gap-3 mt-2">
                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-xs uppercase tracking-wide transition-colors font-heading">Annuler</button>
                    <button type="button" onClick={handleConfirm} className={`px-4 py-2 rounded-lg text-white font-bold text-xs uppercase tracking-wide transition-colors shadow-lg font-heading ${currentTheme.modalButton}`}>Appliquer</button>
                </div>
            </div>
        );
    };
    
    const ModalContainer = (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999]">
            <div className={`p-6 rounded-xl shadow-2xl w-full max-w-md border ${currentTheme.modalBg} ${currentTheme.modalBorder} transform transition-all scale-100`}>
                <h3 className="text-lg font-bold text-white mb-4 font-heading">
                    {modalType === 'callout' ? 'Insérer une Alerte' : `Insérer : ${modalType === 'link' ? 'Lien' : modalType === 'image' ? 'Image' : modalType === 'video' ? 'Vidéo' : 'Carrousel'}`}
                </h3>
                {renderModalBody()}
            </div>
        </div>
    );
    
    return (
        <div className="sticky top-0 z-30">
            <div className={`bg-[#111413] border-b border-white/10 px-3 py-2 flex items-center gap-4 flex-wrap`}>
                {groups.map((group, groupIndex) => (
                    <div key={groupIndex} className="flex items-center gap-1 pr-3 border-r border-white/5 last:border-r-0 last:pr-0">
                        {group.map((btn: any) => (
                             <button
                                key={btn.format}
                                type="button"
                                title={btn.title}
                                onClick={() => handleToolbarClick(btn.format as FormatType)}
                                className={`text-gray-500 rounded-md w-8 h-8 flex items-center justify-center transition-all border border-transparent ${currentTheme.button}`}
                            >
                                {btn.icon}
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            {isModalOpen && mounted && createPortal(ModalContainer, document.body)}
        </div>
    );
};

export default RichTextToolbar;
