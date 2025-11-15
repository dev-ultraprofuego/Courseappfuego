'use client';
// Fix: Import React to fix JSX syntax errors.
import React, { useState } from 'react';
import type { Theme } from '../types';

interface LoginScreenProps {
    onLoginSuccess: () => void;
    theme: Theme;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, theme }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const themeClasses = {
        iris: {
            text: "text-teal-400",
            border: "border-teal-500/20",
            shadow: "shadow-teal-500/10",
            inputBorder: "border-teal-700/50",
            focusBorder: "focus:border-teal-500",
            button: "bg-teal-600 hover:bg-teal-500",
            glitch1: "#7de8d0",
            glitch2: "#c3f2e4",
            scanline: "rgba(116, 180, 155, 0.1)",
        },
        pristine: {
            text: "text-red-400",
            border: "border-red-500/20",
            shadow: "shadow-red-500/10",
            inputBorder: "border-red-700/50",
            focusBorder: "focus:border-red-500",
            button: "bg-[#D92626] hover:bg-[#F24444]",
            glitch1: "#F24444",
            glitch2: "#D92626",
            scanline: "rgba(217, 38, 38, 0.1)",
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
            }
        } catch (err) {
            setError('Failed to connect to the server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0a0f0e] flex flex-col items-center justify-center z-50 scanline" style={{ '--scanline-bg': currentTheme.scanline } as React.CSSProperties}>
            <div className="text-center mb-12">
                <h1
                    className="text-6xl font-black glitch-effect"
                    data-text="Administrateur"
                    style={{
                        '--glitch-1': currentTheme.glitch1,
                        '--glitch-2': currentTheme.glitch2
                    } as React.CSSProperties}
                >
                    Administrateur
                </h1>
                <p className={`${currentTheme.text}/70`}>Admin Authentication Required</p>
            </div>

            <form onSubmit={handleSubmit} className={`w-full max-w-sm p-8 bg-gray-900/50 border ${currentTheme.border} rounded-lg shadow-2xl ${currentTheme.shadow}`}>
                <div className="mb-6">
                    <label className={`block ${currentTheme.text} text-sm font-bold mb-2`} htmlFor="username">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`shadow appearance-none border ${currentTheme.inputBorder} rounded w-full py-3 px-4 bg-gray-800 text-gray-200 leading-tight focus:outline-none focus:shadow-outline ${currentTheme.focusBorder}`}
                        disabled={isLoading}
                    />
                </div>
                <div className="mb-6">
                    <label className={`block ${currentTheme.text} text-sm font-bold mb-2`} htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`shadow appearance-none border ${currentTheme.inputBorder} rounded w-full py-3 px-4 bg-gray-800 text-gray-200 mb-3 leading-tight focus:outline-none focus:shadow-outline ${currentTheme.focusBorder}`}
                        disabled={isLoading}
                    />
                </div>
                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full ${currentTheme.button} text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-all disabled:opacity-50`}
                    >
                        {isLoading ? 'Authenticating...' : 'Authenticate'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginScreen;