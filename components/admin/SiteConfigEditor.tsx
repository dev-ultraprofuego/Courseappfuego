
import React, { useRef, useState } from 'react';
import type { SiteConfig, Theme } from '@/types';
import RichTextToolbar from '../RichTextToolbar';
import FeatherIcon from '../FeatherIcon';
import { uploadCourseImageAction } from '@/app/actions';

interface SiteConfigEditorProps {
    config: SiteConfig;
    onChange: (config: SiteConfig) => void;
    theme: Theme;
    t: any;
    inputClass: string;
    confirmAction?: (title: string, description: string, action: () => void, isDanger?: boolean, singleButton?: boolean) => void;
}

const ConfigSection: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-b border-white/5 pb-10 mb-10 last:border-b-0">
        <div className="lg:col-span-1">
            <h3 className="text-lg font-bold text-white mb-2 font-heading">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
        <div className="lg:col-span-2 space-y-6">
            {children}
        </div>
    </div>
);

const SiteConfigEditor: React.FC<SiteConfigEditorProps> = ({ config, onChange, theme, t, inputClass, confirmAction }) => {
    const labelClass = `block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2 font-heading`; 
    const dmcaContentRef = useRef<HTMLTextAreaElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);
    const ogImageInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: keyof SiteConfig) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadCourseImageAction(formData);

        if (result.success && result.url) {
            onChange({ ...config, [field]: result.url });
        } else {
            alert(`Upload failed: ${result.error}`);
        }
        setIsUploading(false);
    };

    const handleRemoveImage = (field: keyof SiteConfig) => {
        const action = () => onChange({ ...config, [field]: '' });
        if (confirmAction) {
            confirmAction("Retirer l'image ?", "Confirmez le retrait.", action, true);
        } else if (window.confirm("Retirer l'image ?")) {
            action();
        }
    };

    return (
        <div className="max-w-5xl mx-auto pt-6">
            
            {/* Branding & Themes */}
            <ConfigSection title={t.themeNames} description={t.configDescriptions.themes}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="block">
                        <span className={labelClass}>{t.themeIris}</span>
                        <input type="text" value={config.themeNameIris} onChange={e => onChange({ ...config, themeNameIris: e.target.value })} className={inputClass} />
                    </label>
                    <label className="block">
                        <span className={labelClass}>{t.themePristine}</span>
                        <input type="text" value={config.themeNamePristine} onChange={e => onChange({ ...config, themeNamePristine: e.target.value })} className={inputClass} />
                    </label>
                    <label className="block">
                        <span className={labelClass}>{t.themeBoss}</span>
                        <input type="text" value={config.themeNameBoss} onChange={e => onChange({ ...config, themeNameBoss: e.target.value })} className={inputClass} />
                    </label>
                </div>
            </ConfigSection>

            {/* Hero Section */}
            <ConfigSection title="Section Hero (Accueil)" description={t.configDescriptions.hero}>
                <label className="block">
                    <span className={labelClass}>{t.heroBadgeText}</span>
                    <input type="text" value={config.heroBadgeText} onChange={e => onChange({ ...config, heroBadgeText: e.target.value })} className={inputClass} />
                </label>
                
                <div className="p-4 bg-[#0E1110] border border-white/5 rounded-xl">
                    <span className={`block text-xs font-bold text-white mb-4 border-b border-white/5 pb-2`}>{t.heroCtaButton}</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block">
                            <span className={labelClass}>{t.buttonText}</span>
                            <input type="text" value={config.heroCta.ctaText} onChange={e => onChange({ ...config, heroCta: { ...config.heroCta, ctaText: e.target.value } })} className={inputClass} />
                        </label>
                        <label className="block">
                            <span className={labelClass}>{t.buttonAction}</span>
                            <div className="relative">
                                <select 
                                    value={config.heroCta.action} 
                                    onChange={e => onChange({ ...config, heroCta: { ...config.heroCta, action: e.target.value as 'internal' | 'external' } })} 
                                    className={`${inputClass} appearance-none cursor-pointer bg-[#050505] text-white`}
                                >
                                    <option value="internal">{t.internalPage}</option>
                                    <option value="external">{t.externalUrl}</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-white">
                                    <FeatherIcon name="chevron-down" size={14} />
                                </div>
                            </div>
                        </label>
                    </div>
                    {config.heroCta.action === 'external' && (
                         <label className="block mt-4">
                            <span className={labelClass}>{t.externalUrl}</span>
                            <input type="text" value={config.heroCta.externalUrl} onChange={e => onChange({ ...config, heroCta: { ...config.heroCta, externalUrl: e.target.value } })} className={inputClass} />
                        </label>
                    )}
                </div>
            </ConfigSection>

            {/* Links & Community */}
            <ConfigSection title="Liens & Communauté" description={t.configDescriptions.links}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="block">
                        <span className={labelClass}>{t.defaultBuyButtonText}</span>
                        <input type="text" value={config.defaultBuyButtonText} onChange={e => onChange({ ...config, defaultBuyButtonText: e.target.value })} className={inputClass} />
                    </label>
                    <label className="block">
                        <span className={labelClass}>{t.defaultContactURL}</span>
                        <input type="text" value={config.contactLinkUrl} onChange={e => onChange({ ...config, contactLinkUrl: e.target.value })} className={inputClass} />
                    </label>
                </div>

                <div className="mt-4">
                    <div className="flex items-center p-3 bg-[#0E1110] rounded-lg border border-white/5 mb-4">
                        <input type="checkbox" checked={config.showCommunityLink} onChange={e => onChange({ ...config, showCommunityLink: e.target.checked })} className={`rounded border-gray-600 bg-gray-800 h-4 w-4 cursor-pointer ${theme === 'iris' ? 'text-teal-600 focus:ring-teal-500' : 'text-red-600 focus:ring-red-500'}`} />
                        <span className="ml-3 text-sm font-medium text-gray-200 font-heading">{t.showCommunityLink}</span>
                    </div>
                    {config.showCommunityLink && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-white/5 animate-fadeIn">
                            <label className="block">
                                <span className={labelClass}>{t.linkText}</span>
                                <input type="text" value={config.communityLinkText} onChange={e => onChange({ ...config, communityLinkText: e.target.value })} className={inputClass} />
                            </label>
                            <label className="block">
                                <span className={labelClass}>{t.linkUrl}</span>
                                <input type="text" value={config.communityLinkUrl} onChange={e => onChange({ ...config, communityLinkUrl: e.target.value })} className={inputClass} />
                            </label>
                        </div>
                    )}
                </div>
            </ConfigSection>

            {/* DMCA & Legal */}
             <ConfigSection title="Mentions Légales (DMCA)" description={t.configDescriptions.dmca}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <label className="block">
                        <span className={labelClass}>{t.linkText} (Footer)</span>
                        <input type="text" value={config.dmcaLinkText} onChange={e => onChange({ ...config, dmcaLinkText: e.target.value })} className={inputClass} />
                    </label>
                    <label className="block">
                        <span className={labelClass}>{t.linkUrl}</span>
                        <input type="text" value={config.dmcaLinkUrl} onChange={e => onChange({ ...config, dmcaLinkUrl: e.target.value })} className={inputClass} />
                    </label>
                    <label className="block">
                        <span className={labelClass}>{t.dmcaTitle}</span>
                        <input type="text" value={config.dmcaTitle} onChange={e => onChange({ ...config, dmcaTitle: e.target.value })} className={inputClass} />
                    </label>
                </div>

                <div>
                    <span className={labelClass}>{t.dmcaPageContent}</span>
                    <div className="bg-[#050505] border border-white/10 rounded-lg overflow-hidden">
                        <RichTextToolbar 
                            theme={theme} 
                            textareaRef={dmcaContentRef} 
                            setContent={(value) => onChange({ ...config, dmcaContent: value })} 
                        />
                        <textarea
                            ref={dmcaContentRef}
                            value={config.dmcaContent}
                            onChange={e => onChange({ ...config, dmcaContent: e.target.value })}
                            rows={10}
                            className="w-full p-4 bg-[#0D1117] text-[#e6edf3] focus:outline-none resize-none text-sm font-sans"
                        />
                    </div>
                </div>
            </ConfigSection>

            {/* SYSTEM & SEO */}
            <ConfigSection title="Système & SEO" description={t.configDescriptions.system}>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="block">
                        <span className={labelClass}>Titre du site (Meta Title)</span>
                        <input type="text" value={config.seoTitle || ''} onChange={e => onChange({ ...config, seoTitle: e.target.value })} className={inputClass} placeholder="Ex: Content. - Hub Premium" />
                    </label>
                    <label className="block">
                        <span className={labelClass}>Description (Meta Desc)</span>
                        <input type="text" value={config.seoDescription || ''} onChange={e => onChange({ ...config, seoDescription: e.target.value })} className={inputClass} placeholder="Description courte pour Google..." />
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <span className={labelClass}>Logo Header</span>
                        <div className="flex items-center gap-4 bg-[#0E1110] p-3 rounded-lg border border-white/5">
                            <div className="w-10 h-10 bg-black rounded flex items-center justify-center border border-white/10 overflow-hidden shrink-0 relative group">
                                {config.logoUrl ? <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain" /> : <FeatherIcon name="image" size={16} className="text-gray-600"/>}
                            </div>
                            <div className="flex-1 flex gap-2">
                                <input type="file" ref={logoInputRef} onChange={e => handleImageUpload(e, 'logoUrl')} className="hidden" accept="image/*" />
                                <button onClick={() => logoInputRef.current?.click()} className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded border border-white/10 transition-colors flex-1">
                                    {isUploading ? '...' : 'Uploader'}
                                </button>
                                {config.logoUrl && (
                                    <button onClick={() => handleRemoveImage('logoUrl')} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-red-500" title="Supprimer">
                                        <FeatherIcon name="trash-2" size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <span className={labelClass}>Favicon (32x32)</span>
                        <div className="flex items-center gap-4 bg-[#0E1110] p-3 rounded-lg border border-white/5">
                            <div className="w-10 h-10 bg-black rounded flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
                                {config.favicon ? <img src={config.favicon} alt="Favicon" className="w-6 h-6" /> : <FeatherIcon name="image" size={16} className="text-gray-600"/>}
                            </div>
                            <div className="flex-1 flex gap-2">
                                <input type="file" ref={faviconInputRef} onChange={e => handleImageUpload(e, 'favicon')} className="hidden" accept="image/*" />
                                <button onClick={() => faviconInputRef.current?.click()} className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded border border-white/10 transition-colors flex-1">
                                    {isUploading ? '...' : 'Uploader'}
                                </button>
                                {config.favicon && (
                                    <button onClick={() => handleRemoveImage('favicon')} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-red-500" title="Supprimer">
                                        <FeatherIcon name="trash-2" size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <span className={labelClass}>Image de Partage (OG)</span>
                        <div className="flex items-center gap-4 bg-[#0E1110] p-3 rounded-lg border border-white/5">
                             <div className="w-16 h-10 bg-black rounded flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
                                {config.seoImage ? <img src={config.seoImage} alt="OG" className="w-full h-full object-cover" /> : <FeatherIcon name="image" size={16} className="text-gray-600"/>}
                            </div>
                             <div className="flex-1 flex gap-2">
                                <input type="file" ref={ogImageInputRef} onChange={e => handleImageUpload(e, 'seoImage')} className="hidden" accept="image/*" />
                                <button onClick={() => ogImageInputRef.current?.click()} className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded border border-white/10 transition-colors flex-1">
                                    {isUploading ? '...' : 'Uploader'}
                                </button>
                                {config.seoImage && (
                                    <button onClick={() => handleRemoveImage('seoImage')} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-red-500" title="Supprimer">
                                        <FeatherIcon name="trash-2" size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block">
                        <span className={labelClass}>Scripts Header (Analytics, Pixel...)</span>
                        <textarea 
                            value={config.headerScripts || ''} 
                            onChange={e => onChange({ ...config, headerScripts: e.target.value })} 
                            className="w-full bg-[#0D1117] border border-white/10 rounded-lg p-3 text-[11px] font-mono text-green-400 focus:outline-none h-24 resize-none"
                            placeholder="<script>...</script>"
                        />
                    </label>
                     <label className="block">
                        <span className={labelClass}>Scripts Body (Chat widgets...)</span>
                        <textarea 
                            value={config.bodyScripts || ''} 
                            onChange={e => onChange({ ...config, bodyScripts: e.target.value })} 
                            className="w-full bg-[#0D1117] border border-white/10 rounded-lg p-3 text-[11px] font-mono text-green-400 focus:outline-none h-24 resize-none"
                            placeholder="<script>...</script>"
                        />
                    </label>
                </div>

                {/* Toggle Section for Visuals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="flex flex-col p-4 bg-[#0E1110] rounded-xl border border-white/5 gap-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-white text-sm font-heading mb-1">Animation Typing</h4>
                                <p className="text-[10px] text-gray-500">Affiche 3 points animés quand le client écrit un avis.</p>
                            </div>
                            <button 
                                onClick={() => onChange({ ...config, showTypingAnimation: !config.showTypingAnimation })}
                                className={`relative w-9 h-5 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${config.showTypingAnimation ? 'bg-teal-600' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${config.showTypingAnimation ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col p-4 bg-[#0E1110] rounded-xl border border-white/5 gap-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-white text-sm font-heading mb-1">Indicateurs Logs</h4>
                                <p className="text-[10px] text-gray-500">Affiche un point vert sur les avis publics validés dans l'admin.</p>
                            </div>
                            <button 
                                onClick={() => onChange({ ...config, showLogIndicators: !config.showLogIndicators })}
                                className={`relative w-9 h-5 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${config.showLogIndicators ? 'bg-teal-600' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${config.showLogIndicators ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Maintenance Mode */}
                <div className="flex flex-col p-4 bg-[#0E1110] rounded-xl border border-white/5 border-l-4 border-l-yellow-500/50 gap-3 transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-white text-sm font-heading mb-1">{t.maintenanceMode}</h4>
                            <p className="text-[10px] text-gray-500">Le site sera inaccessible aux visiteurs.</p>
                        </div>
                        <button 
                            onClick={() => onChange({ ...config, maintenanceMode: !config.maintenanceMode })}
                            className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none mt-1 flex-shrink-0 ${config.maintenanceMode ? 'bg-yellow-600' : 'bg-gray-700'}`}
                        >
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${config.maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                    
                    {config.maintenanceMode && (
                        <div className="animate-fadeIn pt-2 border-t border-white/5 mt-2">
                            <label className="block">
                                 <span className={labelClass}>{t.maintenanceMessage}</span>
                                 <textarea 
                                    value={config.maintenanceMessage || "Maintenance en cours, retour bientôt"}
                                    onChange={e => onChange({ ...config, maintenanceMessage: e.target.value })}
                                    className={`${inputClass} min-h-[60px] text-xs`}
                                 />
                            </label>
                        </div>
                    )}
                </div>

            </ConfigSection>

        </div>
    );
};

export default SiteConfigEditor;
