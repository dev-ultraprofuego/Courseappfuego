
'use client';
import React, { useState, useEffect } from 'react';
import type { MediaFile, Theme } from '@/types';
import FeatherIcon from '../FeatherIcon';
import { uploadCourseImageAction, deleteMediaFileAction } from '@/app/actions';

interface MediaLibraryProps {
    files: MediaFile[];
    onUpdate: (files: MediaFile[], log?: { action: string, details: string }) => void;
    theme: Theme;
    confirmAction?: (title: string, desc: string, action: () => void, isDanger: boolean) => void;
    notify: (message: string, type: 'success' | 'error' | 'info' | 'upload') => void;
    onLog?: (action: string, details: string) => void;
    t: any;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ files = [], onUpdate, theme, confirmAction, notify, onLog, t }) => {
    // HYBRID APPROACH: Local state for instant feedback + Sync with props for persistence
    const [localFiles, setLocalFiles] = useState<MediaFile[]>(files);
    const [isUploading, setIsUploading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Sync local state when parent props change (e.g. after tab switch or server fetch)
    useEffect(() => {
        setLocalFiles(files);
    }, [files]);

    const glowColor = theme === 'iris' ? "rgba(45,212,191,0.6)" : (theme === 'pristine' ? "rgba(255,71,87,0.6)" : "rgba(217,38,38,0.6)");

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileInput = event.target;
        const file = fileInput.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadCourseImageAction(formData);

        if (result.success && result.url) {
            const newFile: MediaFile = {
                id: Date.now().toString(),
                url: result.url,
                name: file.name,
                type: 'image',
                date: new Date().toISOString().split('T')[0]
            };
            
            // 1. Optimistic Update (Immediate)
            const updatedFiles = [newFile, ...localFiles];
            setLocalFiles(updatedFiles);
            
            // 2. Notify Parent (Trigger Auto-save WITH ATOMIC LOG)
            const size = (file.size / 1024 / 1024).toFixed(2) + 'MB';
            onUpdate(updatedFiles, { action: 'MEDIA_UPLOAD', details: `${file.name} (${size})|Médiathèque > Upload` });
            
            notify("Image uploadée avec succès", "upload");
        } else {
            notify(`Erreur upload: ${result.error}`, 'error');
        }
        
        setIsUploading(false);
        fileInput.value = '';
    };

    const handleDelete = (id: string) => {
        const fileToDelete = localFiles.find(f => f.id === id);
        
        const action = async () => {
            // 1. Optimistic Update (Immediate)
            const updatedFiles = localFiles.filter(f => f.id !== id);
            setLocalFiles(updatedFiles);
            
            // 2. Notify Parent (Trigger Auto-save WITH ATOMIC LOG)
            if (fileToDelete) {
                onUpdate(updatedFiles, { action: 'MEDIA_DELETE', details: `${fileToDelete.name}|Médiathèque > Suppression` });
                // 3. Physical Delete (Async)
                await deleteMediaFileAction(fileToDelete.url);
            } else {
                onUpdate(updatedFiles);
            }
            
            notify("Fichier supprimé", "error");
        };
        
        if (confirmAction) {
            confirmAction("Supprimer ?", "Irréversible (Supprime aussi du stockage).", action, true);
        } else {
            action();
        }
    };

    const copyToClipboard = (url: string, fileName: string) => {
        navigator.clipboard.writeText(url);
        notify("Lien copié !", "info");
        if (onLog) onLog('LINK_COPY', `${fileName}|Médiathèque > Copie Lien`);
    };

    return (
        <div className="flex flex-col h-full w-full p-8">
            <div className="flex justify-between items-center mb-8 px-2">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-white font-heading tracking-tight">{t.mediaLib.title}</h2>
                    <div className="flex bg-[#0a0d0c] p-1 rounded-lg border border-white/10">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}><FeatherIcon name="grid" size={14}/></button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}><FeatherIcon name="list" size={14}/></button>
                    </div>
                </div>
                <div className="relative">
                    <input type="file" onChange={handleUpload} className="hidden" id="media-upload" accept="image/*" />
                    <label 
                        htmlFor="media-upload" 
                        className="group relative flex items-center gap-2 bg-gradient-to-b from-[#161a19] to-[#0a0d0c] text-white font-bold py-2 px-4 rounded-lg border border-white/10 transition-all duration-300 hover:bg-[#131615] hover:border-white/20 font-heading text-xs uppercase tracking-wide cursor-pointer"
                        style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.4)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 20px ${glowColor}` }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.4)' }}
                    >
                        {isUploading ? <FeatherIcon name="loader" size={14} className="animate-spin"/> : <FeatherIcon name="plus-circle" size={14}/>}
                        {t.mediaLib.upload}
                    </label>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {localFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-gray-700 py-32 h-full border-2 border-dashed border-white/5 rounded-xl bg-transparent">
                        <FeatherIcon name="image" size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">{t.mediaLib.noFiles}</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6" : "space-y-3"}>
                        {localFiles.map(file => (
                            viewMode === 'grid' ? (
                                <div key={file.id} className="group relative aspect-square bg-[#0a0d0c] rounded-xl border border-white/10 overflow-hidden hover:border-white/30 transition-all shadow-lg hover:-translate-y-1">
                                    <img src={file.url} alt={file.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                                        <button 
                                            onClick={() => copyToClipboard(file.url, file.name)} 
                                            className={`p-2 rounded-full hover:bg-white/20 text-white transition-colors bg-white/10 border border-white/10`} 
                                        >
                                            <FeatherIcon name="link" size={16}/>
                                        </button>
                                        <button onClick={() => handleDelete(file.id)} className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/40 text-red-400 border border-red-500/20"><FeatherIcon name="trash-2" size={16}/></button>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-6">
                                        <div className="text-[10px] text-white font-medium truncate">{file.name}</div>
                                    </div>
                                </div>
                            ) : (
                                <div key={file.id} className="flex items-center gap-4 p-3 bg-[#0a0d0c] border border-white/5 rounded-xl hover:border-white/20 group transition-all hover:bg-[#0E1110]">
                                    <img src={file.url} alt={file.name} className="w-12 h-12 rounded-lg object-cover bg-black border border-white/5" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-gray-200 truncate">{file.name}</div>
                                        <div className="text-[10px] text-gray-600 font-mono">{file.date}</div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity px-2">
                                         <button 
                                            onClick={() => copyToClipboard(file.url, file.name)} 
                                            className={`p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5`}
                                        >
                                            <FeatherIcon name="link" size={14}/>
                                        </button>
                                         <button onClick={() => handleDelete(file.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/5"><FeatherIcon name="trash-2" size={14}/></button>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaLibrary;
