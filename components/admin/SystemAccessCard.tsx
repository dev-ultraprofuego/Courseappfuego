
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import FeatherIcon from '../FeatherIcon';
import type { Theme } from '@/types';

interface SystemAccessCardProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    theme: Theme;
}

const SystemAccessCard: React.FC<SystemAccessCardProps> = ({ isOpen, onClose, onLogout, theme }) => {
    const [uptime, setUptime] = useState(0);
    const [sessionId] = useState(() => 'SES-' + Math.random().toString(36).substr(2, 9).toUpperCase());

    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => setUptime(p => p + 1), 1000);
        return () => clearInterval(interval);
    }, [isOpen]);

    if (!isOpen) return null;

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const themeClasses = {
        iris: { border: 'border-teal-500/30', text: 'text-teal-400', bg: 'bg-teal-500/10', glow: 'shadow-[0_0_30px_-5px_rgba(45,212,191,0.2)]' },
        pristine: { border: 'border-[#ff4757]/30', text: 'text-[#ff6b81]', bg: 'bg-[#ff4757]/10', glow: 'shadow-[0_0_30px_-5px_rgba(255,71,87,0.2)]' },
        boss: { border: 'border-[#D92626]/30', text: 'text-[#F24444]', bg: 'bg-[#D92626]/10', glow: 'shadow-[0_0_30px_-5px_rgba(217,38,38,0.2)]' }
    };
    const currentTheme = themeClasses[theme];

    const content = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose}></div>
            
            <div className={`relative w-full max-w-sm bg-[#09090b] border ${currentTheme.border} rounded-2xl p-6 transform transition-all animate-fadeInUp ${currentTheme.glow}`}>
                {/* Holographic Line Top */}
                <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-${currentTheme.text.split('-')[1]} to-transparent opacity-50`}></div>

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg border border-white/10 bg-black flex items-center justify-center relative overflow-hidden`}>
                             <span className={`font-heading font-black text-lg ${currentTheme.text}`}>&lt;&gt;</span>
                             <div className={`absolute inset-0 ${currentTheme.bg} opacity-20 animate-pulse`}></div>
                        </div>
                        <div>
                            <h3 className={`font-mono font-bold text-lg leading-none tracking-tight text-white mb-1`}>ONE &lt;&gt;</h3>
                            <p className={`text-[9px] uppercase tracking-[0.2em] ${currentTheme.text} font-bold`}>Root Access</p>
                        </div>
                    </div>
                    <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-gray-400">
                        V 2.4.0
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[#111413] p-3 rounded-lg border border-white/5">
                        <span className="block text-[9px] text-gray-600 uppercase font-bold tracking-wider mb-1">Session ID</span>
                        <span className="font-mono text-xs text-gray-300">{sessionId}</span>
                    </div>
                    <div className="bg-[#111413] p-3 rounded-lg border border-white/5">
                        <span className="block text-[9px] text-gray-600 uppercase font-bold tracking-wider mb-1">Uptime</span>
                        <span className={`font-mono text-xs ${currentTheme.text}`}>{formatTime(uptime)}</span>
                    </div>
                    <div className="bg-[#111413] p-3 rounded-lg border border-white/5 col-span-2 flex justify-between items-center">
                        <div>
                            <span className="block text-[9px] text-gray-600 uppercase font-bold tracking-wider mb-0.5">Connection Status</span>
                            <span className="text-xs text-white font-bold flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Encrypted / Secure
                            </span>
                        </div>
                        <FeatherIcon name="shield" size={16} className="text-green-500/50" />
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group text-left">
                        <div className="flex items-center gap-3">
                            <FeatherIcon name="lock" size={14} className="text-gray-400 group-hover:text-white" />
                            <span className="text-xs font-bold text-gray-300 group-hover:text-white uppercase tracking-wide">Verrouiller Session</span>
                        </div>
                        <span className="text-[9px] text-gray-600 font-mono group-hover:text-gray-500">CTRL+L</span>
                    </button>
                    
                    <button onClick={onLogout} className={`w-full flex items-center justify-between p-3 rounded-lg ${currentTheme.bg} hover:brightness-125 border ${currentTheme.border} transition-all group text-left`}>
                        <div className="flex items-center gap-3">
                            <FeatherIcon name="log-out" size={14} className={currentTheme.text} />
                            <span className={`text-xs font-bold ${currentTheme.text} uppercase tracking-wide`}>Déconnexion Système</span>
                        </div>
                    </button>
                </div>

                {/* Close Button Absolute */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors">
                    <FeatherIcon name="x-octagon" size={16} />
                </button>

            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
};

export default SystemAccessCard;
