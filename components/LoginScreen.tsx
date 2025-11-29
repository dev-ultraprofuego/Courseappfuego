'use client';
import React, { useState } from 'react';
import type { Theme } from '../types';
import FeatherIcon from './FeatherIcon';

interface LoginScreenProps {
    onLoginSuccess: () => void;
    theme: Theme;
    onLog?: (action: string, details: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, theme, onLog }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const themeClasses = {
        iris: {
            glow: "bg-teal-500/20",
            icon: "text-teal-400",
            focusBorder: "focus:border-teal-500/50",
            focusRing: "focus:ring-teal-500/20",
            button: "bg-teal-600 hover:bg-teal-500",
            selection: "selection:bg-teal-500/30",
            accent: "text-teal-500"
        },
        pristine: {
            glow: "bg-[#ff4757]/20",
            icon: "text-[#ff6b81]",
            focusBorder: "focus:border-[#ff4757]/50",
            focusRing: "focus:ring-[#ff4757]/20",
            button: "bg-[#ff4757] hover:bg-[#ff6b81]",
            selection: "selection:bg-[#ff4757]/30",
            accent: "text-[#ff4757]"
        },
        boss: {
            glow: "bg-[#D92626]/20",
            icon: "text-[#F24444]",
            focusBorder: "focus:border-[#D92626]/50",
            focusRing: "focus:ring-[#D92626]/20",
            button: "bg-[#D92626] hover:bg-[#F24444]",
            selection: "selection:bg-[#D92626]/30",
            accent: "text-[#D92626]"
        }
    };
    const currentTheme = themeClasses[theme];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                onLoginSuccess();
            } else {
                setError(data.error || 'Invalid credentials. Access denied.');
                if (onLog) onLog('LOGIN_FAILED', 'Tentative de connexion échouée');
            }
        } catch (err) {
            setError('Failed to connect to the server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen w-full bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans ${currentTheme.selection}`}>
            
            {/* Ambient Background Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 pointer-events-none ${currentTheme.glow}`}></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none z-0"></div>

            {/* Login Card */}
            <div className="w-full max-w-[400px] bg-[#0a0d0c] border border-white/5 rounded-2xl shadow-2xl relative z-10 p-8 mx-4 backdrop-blur-xl">
                
                {/* Header / Logo */}
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black mb-2 inline-flex items-center tracking-tighter text-white font-heading">
                        ONE <span className={`ml-2 text-3xl tracking-widest ${currentTheme.accent}`}>&lt;&gt;</span>
                    </h1>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] font-heading mt-1">
                        Restricted Access System
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Username Field */}
                    <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-heading ml-1" htmlFor="username">
                            Identifiant
                        </label>
                        <div className="relative group">
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${currentTheme.icon} opacity-50 group-focus-within:opacity-100`}>
                                <FeatherIcon name="user" size={16} />
                            </div>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={`w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-700 focus:outline-none transition-all duration-300 ${currentTheme.focusBorder} focus:ring-1 ${currentTheme.focusRing} font-heading shadow-inner`}
                                placeholder="ID Utilisateur..."
                                autoComplete="username"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-heading ml-1" htmlFor="password">
                            Clé de sécurité
                        </label>
                        <div className="relative group">
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${currentTheme.icon} opacity-50 group-focus-within:opacity-100`}>
                                <FeatherIcon name="hash" size={16} />
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-700 focus:outline-none transition-all duration-300 ${currentTheme.focusBorder} focus:ring-1 ${currentTheme.focusRing} font-heading shadow-inner`}
                                placeholder="••••••••••••"
                                autoComplete="current-password"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-wide animate-fadeIn font-heading">
                            <FeatherIcon name="help-circle" size={14} />
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-heading mt-4 ${currentTheme.button}`}
                    >
                        {isLoading ? (
                            <>
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Vérification...
                            </>
                        ) : (
                            <>
                                Authentifier
                                <FeatherIcon name="arrow-left" className="rotate-180" size={14} />
                            </>
                        )}
                    </button>
                </form>
                
                {/* Footer */}
                <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-2 opacity-30">
                        <FeatherIcon name="shield" size={12} />
                        <p className="text-[9px] font-mono uppercase tracking-widest">
                            Secure Environment
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;