'use client';
import React, { useState, useEffect, useRef } from 'react';
import { submitTestimonialAction, validateReviewTokenAction, getPublicSystemConfigAction } from '@/app/actions';
import FeatherIcon from '@/components/FeatherIcon';

export default function ReviewPage({ params }: { params: { id: string } }) {
    const [formData, setFormData] = useState({ author: '', text: '', stars: 5 });
    const [status, setStatus] = useState<'loading' | 'idle' | 'submitting' | 'success' | 'error' | 'invalid_token'>('loading');
    const token = params.id;
    
    // Animation States
    const [showTypingAnimation, setShowTypingAnimation] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<any>(null);

    useEffect(() => {
        // 1. Validate Token
        validateReviewTokenAction(token).then(result => {
            if (result.valid) {
                setStatus('idle');
            } else {
                setStatus('invalid_token');
            }
        });
        
        // 2. Fetch Config for Animation
        getPublicSystemConfigAction().then(config => {
            if (config.showTypingAnimation) {
                setShowTypingAnimation(true);
            }
        });
    }, [token]);
    
    const isValid = formData.author.trim().length > 0 && formData.text.trim().length > 0;

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, text: e.target.value }));
        
        // Typing Animation Logic
        if (showTypingAnimation) {
            setIsTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
            }, 1000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        setStatus('submitting');
        const result = await submitTestimonialAction({
            author: formData.author,
            text: formData.text,
            stars: formData.stars,
            status: 'pending'
        }, token);

        if (result.success) {
            setStatus('success');
        } else {
            setStatus('error');
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (status === 'invalid_token') {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-white">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="relative z-10 text-center animate-fadeInUp">
                    <div className="w-20 h-20 mx-auto bg-[#0a0d0c] border border-red-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]">
                        <FeatherIcon name="x-octagon" size={40} className="text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-3 font-heading text-white">Lien Expiré</h1>
                    <p className="text-white/50 text-base max-w-sm mx-auto font-medium">Ce lien n'est plus valide ou a déjà été utilisé.</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-white">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                
                <div className="relative z-10 text-center animate-fadeInUp">
                    <div className="w-20 h-20 mx-auto bg-[#0a0d0c] border border-green-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)]">
                        <FeatherIcon name="check" size={40} className="text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 font-heading">Merci pour votre confiance</h1>
                    <p className="text-white/50">Votre avis a bien été reçu.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans text-white items-start">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Modal Container with internal Scroll - Added select-none */}
            <div className="w-full max-w-md bg-[#0a0d0c] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10 backdrop-blur-xl max-h-[80vh] overflow-y-auto scrollbar-hide select-none">
                <div className="text-center mb-8 relative">
                    <h1 className="text-2xl font-black tracking-tight font-heading mb-2">Votre Avis Compte</h1>
                    <p className="text-sm text-white/40">Partagez votre expérience avec nous.</p>
                    
                    {/* TYPING ANIMATION - Moved here, absolute under subtitle */}
                    {showTypingAnimation && isTyping && (
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 flex gap-1 h-2 items-center">
                            <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse"></div>
                            <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
                            <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-heading">Votre Nom <span className="text-red-500">*</span></label>
                        {/* Added select-text and outline-none */}
                        <input 
                            type="text" 
                            value={formData.author}
                            onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
                            className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all select-text outline-none"
                            placeholder="Comment vous appelez-vous ?"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-heading">Note <span className="text-red-500">*</span></label>
                        <div className="flex gap-2 justify-center bg-[#050505] border border-white/10 rounded-xl p-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, stars: star }))}
                                    className="focus:outline-none transition-transform hover:scale-110 active:scale-90"
                                >
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill={star <= formData.stars ? "#fbbf24" : "none"} stroke={star <= formData.stars ? "none" : "#4b5563"} strokeWidth="2">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider font-heading">Message <span className="text-red-500">*</span></label>
                        </div>
                        
                        {/* Added select-text and outline-none */}
                        <textarea 
                            value={formData.text}
                            onChange={handleTextChange}
                            className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all min-h-[120px] resize-none select-text outline-none"
                            placeholder="Dites-nous ce que vous avez pensé..."
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={!isValid || status === 'submitting'}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 ${isValid ? 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
                    >
                        {status === 'submitting' ? 'Envoi en cours...' : 'Envoyer mon avis'}
                    </button>
                </form>
                
                {status === 'error' && (
                    <div className="mt-4 text-center text-xs text-red-400 font-bold">
                        Erreur lors de l'envoi. Veuillez réessayer.
                    </div>
                )}
            </div>
        </div>
    );
}
