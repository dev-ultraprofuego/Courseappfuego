import React, { useRef } from 'react';
import type { SiteConfig, Theme } from '@/types';
import RichTextToolbar from '../RichTextToolbar';

interface SiteConfigEditorProps {
    config: SiteConfig;
    onChange: (config: SiteConfig) => void;
    theme: Theme;
    t: any;
    inputClass: string;
}

const SiteConfigEditor: React.FC<SiteConfigEditorProps> = ({ config, onChange, theme, t, inputClass }) => {
    const headerClass = `text-2xl font-bold mb-4 ${theme === 'iris' ? 'text-teal-400' : 'text-red-400'}`;
    const dmcaContentRef = useRef<HTMLTextAreaElement>(null);

    return (
        <div className="space-y-8">
            <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className={headerClass}>{t.contactPurchaseLinks}</h2>
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-400">{t.defaultContactURL}</span>
                        <input type="text" value={config.contactLinkUrl} onChange={e => onChange({ ...config, contactLinkUrl: e.target.value })} className={`mt-1 ${inputClass}`} />
                    </label>
                     <label className="block">
                        <span className="text-gray-400">{t.defaultBuyButtonText}</span>
                        <input type="text" value={config.defaultBuyButtonText} onChange={e => onChange({ ...config, defaultBuyButtonText: e.target.value })} className={`mt-1 ${inputClass}`} />
                    </label>
                </div>
            </div>

             <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className={headerClass}>{t.headerCommunityLink}</h2>
                <div className="space-y-4">
                    <label className="flex items-center">
                        <input type="checkbox" checked={config.showCommunityLink} onChange={e => onChange({ ...config, showCommunityLink: e.target.checked })} className={`rounded border-gray-600 bg-gray-800 shadow-sm focus:border-opacity-50 h-5 w-5 ${theme === 'iris' ? 'text-teal-600 focus:ring-teal-500' : 'text-red-600 focus:ring-red-500'}`} />
                        <span className="ml-2 text-gray-300">{t.showCommunityLink}</span>
                    </label>
                    {config.showCommunityLink && (
                        <>
                            <label className="block">
                                <span className="text-gray-400">{t.linkText}</span>
                                <input type="text" value={config.communityLinkText} onChange={e => onChange({ ...config, communityLinkText: e.target.value })} className={`mt-1 ${inputClass}`} />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">{t.linkUrl}</span>
                                <input type="text" value={config.communityLinkUrl} onChange={e => onChange({ ...config, communityLinkUrl: e.target.value })} className={`mt-1 ${inputClass}`} />
                            </label>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className={headerClass}>{t.themeNames}</h2>
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-400">{t.themeIris}</span>
                        <input type="text" value={config.themeNameIris} onChange={e => onChange({ ...config, themeNameIris: e.target.value })} className={`mt-1 ${inputClass}`} />
                    </label>
                    <label className="block">
                        <span className="text-gray-400">{t.themePristine}</span>
                        <input type="text" value={config.themeNamePristine} onChange={e => onChange({ ...config, themeNamePristine: e.target.value })} className={`mt-1 ${inputClass}`} />
                    </label>
                </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className={headerClass}>{t.heroBadgeText}</h2>
                <label className="block">
                    <span className="text-gray-400">{t.badgeText}</span>
                    <input type="text" value={config.heroBadgeText} onChange={e => onChange({ ...config, heroBadgeText: e.target.value })} className={`mt-1 ${inputClass}`} />
                </label>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className={headerClass}>{t.heroCtaButton}</h2>
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-400">{t.buttonText}</span>
                        <input type="text" value={config.heroCta.ctaText} onChange={e => onChange({ ...config, heroCta: { ...config.heroCta, ctaText: e.target.value } })} className={`mt-1 ${inputClass}`} />
                    </label>
                    <label className="block">
                        <span className="text-gray-400">{t.buttonAction}</span>
                        <select value={config.heroCta.action} onChange={e => onChange({ ...config, heroCta: { ...config.heroCta, action: e.target.value as 'internal' | 'external' } })} className={`mt-1 ${inputClass}`}>
                            <option value="internal">{t.internalPage}</option>
                            <option value="external">{t.externalUrl}</option>
                        </select>
                    </label>
                    {config.heroCta.action === 'external' && (
                         <label className="block">
                            <span className="text-gray-400">{t.externalUrl}</span>
                            <input type="text" value={config.heroCta.externalUrl} onChange={e => onChange({ ...config, heroCta: { ...config.heroCta, externalUrl: e.target.value } })} className={`mt-1 ${inputClass}`} />
                        </label>
                    )}
                </div>
            </div>

             <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className={headerClass}>{t.dmcaLink}</h2>
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-400">{t.linkText}</span>
                        <input type="text" value={config.dmcaLinkText} onChange={e => onChange({ ...config, dmcaLinkText: e.target.value })} className={`mt-1 ${inputClass}`} />
                    </label>
                    <label className="block">
                        <span className="text-gray-400">{t.linkUrl}</span>
                        <input type="text" value={config.dmcaLinkUrl} onChange={e => onChange({ ...config, dmcaLinkUrl: e.target.value })} className={`mt-1 ${inputClass}`} />
                    </label>
                    <label className="block">
                        <span className="text-gray-400">{t.dmcaTitle}</span>
                        <input type="text" value={config.dmcaTitle} onChange={e => onChange({ ...config, dmcaTitle: e.target.value })} className={`mt-1 ${inputClass}`} />
                    </label>
                </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className={headerClass}>{t.dmcaPageContent}</h2>
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
                    className={`mt-0 block w-full rounded-b-md shadow-sm p-3 border-t-0 bg-gray-200 text-black ${theme === 'iris' ? 'focus:border-teal-500 focus:ring-teal-500' : 'focus:border-red-500 focus:ring-red-500'}`}
                />
            </div>

        </div>
    );
};

export default SiteConfigEditor;