import React from 'react';
import type { Theme, SiteConfig } from '../types';

interface DmcaPageProps {
    theme: Theme;
    config: SiteConfig;
}

const DmcaPageComponent: React.FC<DmcaPageProps> = ({ theme, config }) => {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-20 min-h-[60vh]">
            <h1 className="text-4xl sm:text-5xl font-bold text-white/95 mb-8 border-b border-white/10 pb-6">
                {config.dmcaTitle || 'DMCA Policy'}
            </h1>
            <div 
                className="prose prose-invert prose-lg prose-p:text-white/70"
                dangerouslySetInnerHTML={{ __html: config.dmcaContent || '<p>Content not configured.</p>' }}
            />
        </div>
    );
};

export default DmcaPageComponent;