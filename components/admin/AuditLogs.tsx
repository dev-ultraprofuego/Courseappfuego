'use client';
import React, { useState, useMemo, useEffect } from 'react';
import type { AuditLog } from '@/types';
import FeatherIcon from '../FeatherIcon';

interface AuditLogsProps {
    logs: AuditLog[];
    lang?: 'fr' | 'en';
    t: any;
}

const AuditLogs: React.FC<AuditLogsProps> = ({ logs = [], lang = 'fr', t }) => {
    // Default: Recent groups first (Today -> Yesterday), Chronological logs inside (09h -> 10h)
    const [groupSort, setGroupSort] = useState<'asc' | 'desc'>('desc');
    const [timeSort, setTimeSort] = useState<'asc' | 'desc'>('asc');

    // Load preferences from sessionStorage on mount
    useEffect(() => {
        try {
            const storedGroup = sessionStorage.getItem('audit_group_sort');
            const storedTime = sessionStorage.getItem('audit_time_sort');
            if (storedGroup === 'asc' || storedGroup === 'desc') setGroupSort(storedGroup);
            if (storedTime === 'asc' || storedTime === 'desc') setTimeSort(storedTime);
        } catch (e) {
            // Ignore storage errors
        }
    }, []);

    const toggleGroupSort = () => {
        const newSort = groupSort === 'desc' ? 'asc' : 'desc';
        setGroupSort(newSort);
        sessionStorage.setItem('audit_group_sort', newSort);
    };

    const toggleTimeSort = () => {
        const newSort = timeSort === 'asc' ? 'desc' : 'asc';
        setTimeSort(newSort);
        sessionStorage.setItem('audit_time_sort', newSort);
    };
    
    const getActionColor = (action: string) => {
        if (action.includes('DELETE') || action.includes('PURGE')) return 'text-red-500';
        if (action.includes('ADD') || action.includes('UPLOAD') || action.includes('RESTORE') || action.includes('LOGIN') || action.includes('CREATE')) return 'text-green-500';
        if (action.includes('SEO')) return 'text-purple-500';
        if (action.includes('UPDATE') || action.includes('CONTENT') || action.includes('EDIT') || action.includes('SAVE') || action.includes('CONFIG')) return 'text-blue-500';
        if (action.includes('LINK')) return 'text-white';
        return 'text-gray-400';
    };

    const getHeaderAction = (code: string) => {
        const map: Record<string, string> = {
            'COURSE_CREATE': 'COURSE ADD', 
            'COURSE_DELETE': 'COURSE DELETE',
            'MEDIA_UPLOAD': 'MEDIA UPLOAD',
            'CONFIG_UPDATE': 'UPDATE CONFIG',
            'SECTION_UPDATE': 'SECTION UPDATE',
            'PRICING_UPDATE': 'PRICING UPDATE',
            'CATEGORY_CONTENT': 'CATEGORY UPDATE',
            'LOGIN_SUCCESS': 'SYSTEM LOGIN',
            'COURSE_EDIT': 'COURSE EDIT',
            'COURSE_RESTORE': 'COURSE RESTORE',
            'MEDIA_DELETE': 'MEDIA DELETE',
            'COURSE_SEO_UPDATE': 'SEO UPDATE',
            'LINK_COPY': 'LINK COPY'
        };
        return map[code] || code.replace(/_/g, ' ');
    };

    const getIcon = (action: string) => {
        if (action.includes('DELETE')) return 'trash-2';
        if (action.includes('UPLOAD') || action.includes('ADD') || action.includes('CREATE')) return 'plus-circle';
        if (action.includes('EDIT') || action.includes('UPDATE')) return 'edit-2';
        if (action.includes('LOGIN')) return 'user';
        if (action.includes('SEO')) return 'search';
        if (action.includes('LINK')) return 'link';
        if (action.includes('CONFIG')) return 'sliders';
        return 'activity';
    };

    const parseDetails = (details: string, action: string) => {
        const hasSeparator = details && details.includes('|');
        const parts = hasSeparator ? details.split('|') : [details || ''];
        
        const objectName = parts[0] || 'Item'; 
        const contextPath = parts.length > 1 ? parts[1] : '';
        
        let prefix = '';

        if (action === 'CONFIG_UPDATE' && parts.length === 4) {
            const oldVal = parts[2];
            const newVal = parts[3];
            const verb = lang === 'fr' 
                ? `a été modifié dans ${parts[1]}. Il y avait '${oldVal}' à sa place et a été remplacé par '${newVal}'` 
                : `was modified in ${parts[1]}. Was '${oldVal}' and changed to '${newVal}'`;
            
            return { 
                objectName, 
                verb, 
                contextPath: '', 
                objectColorClass: 'text-orange-300',
                prefix
            };
        }

        let verb = '';
        let objectColorClass = 'text-yellow-400';

        if (action.includes('MEDIA_DELETE')) {
            verb = lang === 'fr' ? 'a été supprimé de ' : 'was removed from '; 
            objectColorClass = 'text-red-300';
            prefix = lang === 'fr' ? 'Le fichier' : 'The file';
        }
        else if (action.includes('DELETE')) { 
            verb = lang === 'fr' ? 'a été supprimé de ' : 'was removed from '; 
            objectColorClass = 'text-red-300';
        }
        else if (action.includes('RESTORE')) { 
            verb = lang === 'fr' ? 'a été restauré dans ' : 'was restored to ';
            objectColorClass = 'text-green-300'; 
        }
        else if (action.includes('CREATE') || action.includes('ADD')) { 
            verb = lang === 'fr' ? 'a été ajouté à ' : 'was added to '; 
            objectColorClass = 'text-green-300';
        }
        else if (action.includes('UPLOAD')) { 
            verb = lang === 'fr' ? 'a été uploadé dans ' : 'was uploaded to ';
            objectColorClass = 'text-purple-300'; 
        }
        else if (action.includes('SEO')) { 
            verb = lang === 'fr' ? 'a été optimisé dans ' : 'was optimized in ';
            objectColorClass = 'text-purple-300'; 
        }
        else if (action.includes('LOGIN')) { 
            verb = lang === 'fr' ? "s'est connecté au" : 'logged in to';
            objectColorClass = 'text-green-400';
        }
        else if (action.includes('LINK')) { 
            verb = lang === 'fr' ? "a été copié depuis " : 'was copied from ';
            objectColorClass = 'text-gray-300'; 
        }
        else if (action.includes('CONFIG')) {
            verb = lang === 'fr' ? 'a été modifié dans ' : 'was modified in ';
            objectColorClass = 'text-orange-300';
        }
        else { 
            verb = lang === 'fr' ? 'a été modifié dans ' : 'was modified in ';
            objectColorClass = 'text-blue-300';
        }

        return { objectName, verb, contextPath, objectColorClass, prefix };
    };

    const cleanLogs = useMemo(() => {
        return logs.filter(l => !l.action.includes('GLOBAL') && !l.details.includes('Sauvegarde globale') && l.details !== '');
    }, [logs]);

    const groupedLogs = useMemo(() => {
        // 1. Group logs by Date String (YYYY-MM-DD)
        const groupsMap = new Map<string, AuditLog[]>();
        
        cleanLogs.forEach(log => {
            const date = new Date(log.timestamp);
            const dateKey = date.toDateString();
            if (!groupsMap.has(dateKey)) {
                groupsMap.set(dateKey, []);
            }
            groupsMap.get(dateKey)?.push(log);
        });

        // 2. Convert map to array
        const groupsArray = Array.from(groupsMap.entries()).map(([dateKey, logs]) => {
            const date = new Date(logs[0].timestamp);
            let dateLabel = date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (date.toDateString() === today.toDateString()) {
                dateLabel = t.auditLogs.today;
            } else if (date.toDateString() === yesterday.toDateString()) {
                dateLabel = t.auditLogs.yesterday;
            } else {
                dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
            }

            // 3. Sort logs WITHIN the group (Time Sort)
            const sortedLogs = [...logs].sort((a, b) => {
                const tA = new Date(a.timestamp).getTime();
                const tB = new Date(b.timestamp).getTime();
                return timeSort === 'asc' ? tA - tB : tB - tA;
            });

            return { dateLabel, logs: sortedLogs, firstTimestamp: new Date(logs[0].timestamp).getTime() };
        });

        // 4. Sort the groups themselves (Group Sort)
        groupsArray.sort((a, b) => {
            return groupSort === 'asc' ? a.firstTimestamp - b.firstTimestamp : b.firstTimestamp - a.firstTimestamp;
        });

        return groupsArray;
    }, [cleanLogs, groupSort, timeSort, lang, t]);

    return (
        <div className="flex flex-col h-full w-full p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <h2 className="text-sm font-sans font-bold text-white tracking-wider uppercase">{t.auditLogs.title}</h2>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* Time Sort Button (Minimalist Arrow) */}
                    <button 
                        onClick={toggleTimeSort}
                        className="p-2 text-gray-500 hover:text-white transition-colors"
                    >
                        <FeatherIcon 
                            name={timeSort === 'asc' ? "chevron-up" : "chevron-down"} 
                            size={16} 
                        />
                    </button>

                    {/* Date Group Sort Button (Standard with Dynamic Label) */}
                    <button 
                        onClick={toggleGroupSort}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-white transition-all group"
                    >
                        <span>{groupSort === 'desc' ? t.auditLogs.recent : t.auditLogs.oldest}</span>
                        <FeatherIcon 
                            name={groupSort === 'asc' ? "chevron-up" : "chevron-down"} 
                            size={14} 
                            className="opacity-70 group-hover:opacity-100"
                        />
                    </button>
                </div>
            </div>
            
            {/* Terminal List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-8">
                <div className="flex flex-col font-sans space-y-0">
                    {groupedLogs.map((group, gIndex) => (
                        <React.Fragment key={gIndex}>
                            {/* Date Header Separator */}
                            <div className="sticky top-0 z-10 py-3 bg-[#050505]/95 backdrop-blur-sm flex items-center gap-4 group/header">
                                <span className="px-3 py-1 rounded-md bg-[#0a0d0c] border border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest shadow-sm">
                                    {group.dateLabel}
                                </span>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                            </div>

                            {/* Logs for this date */}
                            {group.logs.map((log, i) => {
                                const { objectName, verb, contextPath, objectColorClass, prefix } = parseDetails(log.details, log.action);
                                const colorClass = getActionColor(log.action);
                                const headerText = getHeaderAction(log.action);
                                const iconName = getIcon(log.action);
                                
                                const dateObj = new Date(log.timestamp);
                                const dateStr = !isNaN(dateObj.getTime()) 
                                    ? `le ${dateObj.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')} à ${dateObj.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', {hour: '2-digit', minute:'2-digit'})}`
                                    : '';

                                return (
                                    <div key={log.id + i} className="flex items-baseline gap-3 py-3 px-2 border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        {/* 1. Icon */}
                                        <div className={`flex-shrink-0 ${colorClass} opacity-70 translate-y-[2px]`}>
                                            <FeatherIcon name={iconName} size={14} />
                                        </div>

                                        {/* 2. Action Header + Separator */}
                                        <div className="flex items-baseline gap-2 flex-shrink-0">
                                            <span className={`font-bold tracking-wide ${colorClass} text-sm uppercase whitespace-nowrap`}>
                                                {headerText}
                                            </span>
                                            <span className="text-gray-600 font-bold">:</span>
                                        </div>

                                        {/* 3. Content Sentence */}
                                        <div className="flex-1 text-gray-300 text-[15px] leading-relaxed font-medium whitespace-normal break-words">
                                            {prefix && <span className="text-gray-400 mr-1.5 text-sm">{prefix}</span>}
                                            <span className={`${objectColorClass} font-bold mr-1.5 brightness-110`}>{objectName}</span>
                                            <span className="text-gray-400 mr-1.5 text-sm">{verb}</span>
                                            {contextPath && (
                                                <span className="text-gray-500 font-medium text-sm">
                                                    {contextPath.replace('>', ' > ')}
                                                </span>
                                            )}
                                        </div>

                                        {/* 4. Date (End of line - Preserved) */}
                                        <div className="flex-shrink-0 text-gray-600 text-xs font-medium ml-4 whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity">
                                            {dateStr}
                                        </div>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                    
                    {cleanLogs.length === 0 && (
                        <div className="text-gray-800 text-sm italic py-10 text-center">{t.auditLogs.noSignal}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;