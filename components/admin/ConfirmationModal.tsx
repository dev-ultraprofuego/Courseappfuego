
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import FeatherIcon from '../FeatherIcon';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDanger?: boolean;
    singleButton?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, description, onConfirm, onCancel, isDanger = false, singleButton = false }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onCancel();
            if (e.key === 'Enter') onConfirm();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onConfirm, onCancel]);

    if (!isOpen) return null;

    const content = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={singleButton ? onConfirm : onCancel}></div>
            <div ref={modalRef} className={`relative w-full max-w-xs bg-[#050505] border border-white/10 rounded-xl p-5 transform transition-all scale-100 animate-fadeInUp`}>
                <div className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isDanger ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-white'}`}>
                        <FeatherIcon name={isDanger ? 'alert-triangle' : 'info'} size={20} />
                    </div>
                    <h3 className="text-base font-bold text-white font-heading mb-1">{title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-5">{description}</p>
                    
                    <div className="flex gap-2 w-full">
                        {!singleButton && (
                            <button 
                                onClick={onCancel}
                                className="flex-1 py-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-xs font-medium text-white border border-white/5 transition-colors"
                            >
                                Annuler
                            </button>
                        )}
                        <button 
                            onClick={onConfirm}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all ${isDanger ? 'bg-red-600 hover:bg-red-500' : 'bg-white text-black hover:bg-gray-200'}`}
                        >
                            {singleButton ? 'OK' : 'Confirmer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
};

export default ConfirmationModal;
