'use client';
import React from 'react';
import type { Course, Theme } from '@/types';
import FeatherIcon from '../FeatherIcon';

interface TrashBinProps {
    deletedCourses: Course[];
    onRestore: (id: number) => void;
    onPermanentDelete: (id: number) => void;
    theme: Theme;
    confirmAction?: (title: string, description: string, action: () => void, isDanger?: boolean, singleButton?: boolean) => void;
    notify: (message: string, type: 'success' | 'error' | 'info') => void;
    t: any;
}

const TrashBin: React.FC<TrashBinProps> = ({ deletedCourses, onRestore, onPermanentDelete, theme, confirmAction, notify, t }) => {
    return (
        <div className="flex flex-col h-full w-full p-8">
            <div className="flex items-center gap-3 mb-8 px-2">
                <h2 className="text-xl font-bold text-white font-heading tracking-tight">{t.trashBin.title}</h2>
                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold rounded border border-red-500/20 uppercase tracking-wide">{deletedCourses.length} {t.trashBin.items}</span>
            </div>

            {/* Content Floating on Main Background */}
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {deletedCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-gray-700 h-full py-32 border-2 border-dashed border-white/5 rounded-xl bg-transparent">
                        <FeatherIcon name="trash-2" size={32} className="mb-3 opacity-20"/>
                        <p className="text-sm">{t.trashBin.empty}</p>
                    </div>
                ) : (
                    deletedCourses.map(course => (
                        <div key={course.id} className="flex items-center justify-between p-4 bg-[#0a0d0c] border border-white/10 rounded-xl hover:border-red-900/50 hover:bg-[#0E1110] transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#1A1D1C] rounded-lg overflow-hidden opacity-50 border border-white/5 relative">
                                    <img src={course.img} alt="" className="w-full h-full object-cover grayscale"/>
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <FeatherIcon name="x-octagon" size={16} className="text-white/50"/>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 line-through decoration-red-500/50 decoration-2">{course.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] text-red-500/70 font-mono bg-red-500/5 px-1.5 rounded border border-red-500/10">{t.trashBin.deleted}</span>
                                        <span className="text-[10px] text-gray-600 font-mono">ID: {course.id}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => {
                                        onRestore(course.id);
                                        notify(t.trashBin.restoredMsg, "success");
                                    }} 
                                    className="h-8 px-3 flex items-center justify-center bg-white/5 hover:bg-green-500/10 border border-white/10 hover:border-green-500/30 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-green-400 transition-all"
                                >
                                    {t.trashBin.restore}
                                </button>
                                <button 
                                    onClick={() => { 
                                        const action = () => {
                                            onPermanentDelete(course.id);
                                            notify(t.trashBin.deletedMsg, "error");
                                        };
                                        if(confirmAction) {
                                            confirmAction(t.trashBin.deletePermanent, t.trashBin.irreversible, action, true);
                                        } else {
                                            action();
                                        }
                                    }} 
                                    className="h-8 w-8 flex items-center justify-center bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                                >
                                    <FeatherIcon name="trash-2" size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TrashBin;