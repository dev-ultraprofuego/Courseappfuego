
'use client';
import React, { useState, useEffect, useRef } from 'react';
import AdminPage, { translations } from "@/components/AdminPage";
import CourseEditorModal from '@/components/CourseEditorModal';
import { getSiteData } from '@/constants/api';
import { updateSiteDataAction } from '@/app/actions';
import type { SiteData, Course, SoftwarePill, Theme, CourseContextLink, AuditLog, MediaFile } from '@/types';

export default function AdminClientPage() {
    const [theme, setTheme] = useState<Theme>('iris');
    const [siteData, setSiteData] = useState<SiteData | null>(null);
    const [originalData, setOriginalData] = useState<SiteData | null>(null);
    const [isCourseEditorOpen, setIsCourseEditorOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lang, setLang] = useState<'fr' | 'en'>('fr');
    
    const t = translations[lang];

    // Ref to hold the latest siteData to avoid closure staleness in callbacks
    const siteDataRef = useRef(siteData);
    useEffect(() => {
        siteDataRef.current = siteData;
    }, [siteData]);

    const fetchData = async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        try {
            const data = await getSiteData();
            setSiteData(data);
            setOriginalData(JSON.parse(JSON.stringify(data)));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenCourseEditor = (course: Course | null) => {
        setEditingCourse(course);
        setIsCourseEditorOpen(true);
    };

    // DIFF ENGINE: Generates logs based on changes
    const generateDiffLogs = (oldData: SiteData, newData: SiteData): AuditLog[] => {
        const logs: AuditLog[] = [];
        const timestamp = new Date().toISOString();
        const user = 'Admin';

        const createLog = (action: string, details: string) => ({
            id: Date.now().toString() + Math.random(),
            action,
            details,
            timestamp,
            user
        });

        // 1. Config Changes - GRANULAR CHECKS
        const oldConfig = oldData.config;
        const newConfig = newData.config;

        if (JSON.stringify(oldConfig) !== JSON.stringify(newConfig)) {
            
            // Maintenance Mode
            if (oldConfig.maintenanceMode !== newConfig.maintenanceMode) {
                logs.push(createLog('CONFIG_UPDATE', `Mode Maintenance|Système|${oldConfig.maintenanceMode ? 'ON' : 'OFF'}|${newConfig.maintenanceMode ? 'ON' : 'OFF'}`));
            }

            // Toggle Switches (Animation & Logs)
            if (oldConfig.showTypingAnimation !== newConfig.showTypingAnimation) {
                const action = newConfig.showTypingAnimation ? 'CONFIG_TOGGLE_ON' : 'CONFIG_TOGGLE_OFF';
                logs.push(createLog(action, `Animation Typing|Configuration > Système & SEO`));
            }
            if (oldConfig.showLogIndicators !== newConfig.showLogIndicators) {
                const action = newConfig.showLogIndicators ? 'CONFIG_TOGGLE_ON' : 'CONFIG_TOGGLE_OFF';
                logs.push(createLog(action, `Indicateurs Logs|Configuration > Système & SEO`));
            }
            
            // Hero Section
            if (oldConfig.heroBadgeText !== newConfig.heroBadgeText) {
                logs.push(createLog('CONFIG_UPDATE', `Badge Hero (Badge supérieur)|Config > Section Hero (Accueil)|${oldConfig.heroBadgeText}|${newConfig.heroBadgeText}`));
            }
            if (oldConfig.heroCta.ctaText !== newConfig.heroCta.ctaText) {
                logs.push(createLog('CONFIG_UPDATE', `Texte|Config > Section Hero (Accueil)|${oldConfig.heroCta.ctaText}|${newConfig.heroCta.ctaText}`));
            }
            if (oldConfig.heroCta.externalUrl !== newConfig.heroCta.externalUrl) {
                logs.push(createLog('CONFIG_UPDATE', `URL Externe|Config > Section Hero (Accueil)|${oldConfig.heroCta.externalUrl}|${newConfig.heroCta.externalUrl}`));
            }

            // SEO
            if (oldConfig.seoTitle !== newConfig.seoTitle) {
                logs.push(createLog('CONFIG_UPDATE', `Titre du site (Meta Title)|Config > Système & SEO|${oldConfig.seoTitle}|${newConfig.seoTitle}`));
            }
            if (oldConfig.seoDescription !== newConfig.seoDescription) {
                logs.push(createLog('CONFIG_UPDATE', `Description (Meta Desc)|Config > Système & SEO|${oldConfig.seoDescription}|${newConfig.seoDescription}`));
            }

            // Liens
            if (oldConfig.communityLinkUrl !== newConfig.communityLinkUrl) {
                logs.push(createLog('CONFIG_UPDATE', `URL|Config > Liens & Communauté|${oldConfig.communityLinkUrl}|${newConfig.communityLinkUrl}`));
            }
            if (oldConfig.communityLinkText !== newConfig.communityLinkText) {
                logs.push(createLog('CONFIG_UPDATE', `Texte|Config > Liens & Communauté|${oldConfig.communityLinkText}|${newConfig.communityLinkText}`));
            }
            if (oldConfig.contactLinkUrl !== newConfig.contactLinkUrl) {
                logs.push(createLog('CONFIG_UPDATE', `URL Achat Défaut|Config > Liens & Communauté|${oldConfig.contactLinkUrl}|${newConfig.contactLinkUrl}`));
            }
            if (oldConfig.defaultBuyButtonText !== newConfig.defaultBuyButtonText) {
                logs.push(createLog('CONFIG_UPDATE', `Texte Achat Défaut|Config > Liens & Communauté|${oldConfig.defaultBuyButtonText}|${newConfig.defaultBuyButtonText}`));
            }
            
            // DMCA
            if (oldConfig.dmcaContent !== newConfig.dmcaContent) {
                logs.push(createLog('CONFIG_UPDATE', `Contenu DMCA|Config > Mentions Légales (DMCA)|Ancien Contenu|Nouveau Contenu`));
            } 
            if (oldConfig.dmcaTitle !== newConfig.dmcaTitle) {
                logs.push(createLog('CONFIG_UPDATE', `Titre DMCA|Config > Mentions Légales (DMCA)|${oldConfig.dmcaTitle}|${newConfig.dmcaTitle}`));
            }
            if (oldConfig.dmcaLinkText !== newConfig.dmcaLinkText) {
                logs.push(createLog('CONFIG_UPDATE', `Texte (Footer)|Config > Mentions Légales (DMCA)|${oldConfig.dmcaLinkText}|${newConfig.dmcaLinkText}`));
            }
            if (oldConfig.dmcaLinkUrl !== newConfig.dmcaLinkUrl) {
                logs.push(createLog('CONFIG_UPDATE', `URL|Config > Mentions Légales (DMCA)|${oldConfig.dmcaLinkUrl}|${newConfig.dmcaLinkUrl}`));
            }

            // Themes
            if (oldConfig.themeNameIris !== newConfig.themeNameIris) {
                logs.push(createLog('CONFIG_UPDATE', `Nom Thème Iris|Config > Noms des Thèmes|${oldConfig.themeNameIris}|${newConfig.themeNameIris}`));
            }
            if (oldConfig.themeNamePristine !== newConfig.themeNamePristine) {
                logs.push(createLog('CONFIG_UPDATE', `Nom Thème Pristine|Config > Noms des Thèmes|${oldConfig.themeNamePristine}|${newConfig.themeNamePristine}`));
            }
            if (oldConfig.themeNameBoss !== newConfig.themeNameBoss) {
                logs.push(createLog('CONFIG_UPDATE', `Nom Thème Boss|Config > Noms des Thèmes|${oldConfig.themeNameBoss}|${newConfig.themeNameBoss}`));
            }
        }

        // 2. Pricing Changes
        if (JSON.stringify(oldData.pricingTiers) !== JSON.stringify(newData.pricingTiers)) {
             logs.push(createLog('PRICING_UPDATE', `Offres & Tarifs|Business > Pricing`));
        }

        // 3. FAQ
        if (JSON.stringify(oldData.faqData) !== JSON.stringify(newData.faqData)) {
             logs.push(createLog('FAQ_UPDATE', `Questions FAQ|Business > FAQ`));
        }

        // 4. Testimonials - SMART DIFF (ID based & Legacy fallback)
        const oldTests = oldData.testimonials || [];
        const newTests = newData.testimonials || [];
        
        if (JSON.stringify(oldTests) !== JSON.stringify(newTests)) {
            if (oldTests.length > newTests.length) {
                // Deletion detected
                const deleted = oldTests.find(oldT => !newTests.some(newT => {
                    if (oldT.id && newT.id) return oldT.id === newT.id;
                    return oldT.author === newT.author && oldT.text === newT.text;
                }));
                
                const deletedName = deleted ? deleted.author : 'Inconnu';
                const sourceSuffix = deleted?.source === 'external' ? '(Avis Public)' : '(Avis Privé)';
                logs.push(createLog('TESTIMONIAL_DELETE', `${deletedName}|Témoignage > ${sourceSuffix}`));
                
            } else if (newTests.length > oldTests.length) {
                // Creation detected
                const created = newTests.find(n => !oldTests.some(o => {
                    if (o.id && n.id) return o.id === n.id;
                    return o.author === n.author && o.text === n.text;
                }));
                const createdName = created ? created.author : 'Nouveau';
                logs.push(createLog('TESTIMONIAL_CREATE', `${createdName}|Témoignage > Ajout Manuel`));
            } else {
                // Modification
                logs.push(createLog('TESTIMONIAL_UPDATE', `Témoignages|Témoignage > Modification`));
            }
        }
        
        // 5. Homepage Sections (Structure Order)
        if (JSON.stringify(oldData.homepageSections) !== JSON.stringify(newData.homepageSections)) {
             // Note: Content changes (Items inside sections) are handled by specific logs in SectionCourseManagerModal
             // This log catches reordering of the sections themselves or title changes
             const oldTitles = oldData.homepageSections.map(s => s.title).join(',');
             const newTitles = newData.homepageSections.map(s => s.title).join(',');
             const oldIds = oldData.homepageSections.map(s => s.id).join(',');
             const newIds = newData.homepageSections.map(s => s.id).join(',');
             
             if (oldIds !== newIds || oldTitles !== newTitles) {
                 logs.push(createLog('SECTION_UPDATE', `Structure Section|Vitrine Accueil > Sections`));
             }
        }

        return logs;
    };

    const handleSave = async (): Promise<{ success: boolean; error?: string } | undefined> => {
        if (!siteData || !originalData) return;
        setIsSaving(true);

        // Generate granular logs based on Diff
        const newLogs = generateDiffLogs(originalData, siteData);
        
        // Append new logs to siteData before saving
        const updatedSiteData = {
            ...siteData,
            auditLogs: [...newLogs, ...(siteData.auditLogs || [])].slice(0, 200)
        };

        try {
            const result = await updateSiteDataAction(updatedSiteData);
            if (result.success) {
                setSiteData(updatedSiteData);
                setOriginalData(JSON.parse(JSON.stringify(updatedSiteData))); // Update baseline
            }
            return result;
        } catch (error) {
            console.error("Failed to save:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            return { success: false, error: errorMessage };
        } finally {
            setIsSaving(false);
        }
    }

    const handleSaveCourse = async (courseToSave: Course) => {
        if (!siteData) return;
        
        setIsSaving(true);
        let updatedCourses;
        let logAction = '';
        let logDetails = '';

        const existingCourse = siteData.coursesData.find(c => c.id === courseToSave.id);

        // Capture title strictly
        const courseTitle = courseToSave.title && courseToSave.title.trim() !== '' ? courseToSave.title : "Nouveau Cours";

        if (existingCourse) {
            updatedCourses = siteData.coursesData.map(c => c.id === courseToSave.id ? courseToSave : c);
            
            // --- SEO DIFF LOGIC ---
            if (existingCourse.seoTitle !== courseToSave.seoTitle || existingCourse.seoDescription !== courseToSave.seoDescription) {
                logAction = 'COURSE_SEO_UPDATE';
                logDetails = `${courseTitle}|SEO > Métadonnées`;
            } else {
                logAction = 'COURSE_EDIT';
                logDetails = `${courseTitle}|Bibliothèque > Modification`;
            }
        } else {
            updatedCourses = [courseToSave, ...siteData.coursesData];
            logAction = 'COURSE_CREATE';
            logDetails = `${courseTitle}|Bibliothèque > Ajouter un cours`;
        }
        
        // --- LOG ENTRY ---
        const newLog = {
            id: Date.now().toString(),
            action: logAction,
            details: logDetails,
            timestamp: new Date().toISOString(),
            user: 'Admin'
        };
        
        // Append log immediately
        const updatedLogs = [newLog, ...(siteData.auditLogs || [])].slice(0, 200);

        // --- AUTO ADD LOGIC ---
        let updatedCategoryLinks = { ...siteData.categoryCourseLinks };
        let updatedHomepageSections = [...siteData.homepageSections];

        siteData.softwarePillsData.forEach(pill => {
             if ('category' in pill && pill.autoAdd) {
                 const pillCategory = pill.category;
                 if (courseToSave.categories.some(cat => cat.toLowerCase().replace(/\s+/g, '-') === pillCategory)) {
                     const currentLinks = updatedCategoryLinks[pillCategory] || [];
                     if (!currentLinks.some(link => link.courseId === courseToSave.id)) {
                         updatedCategoryLinks[pillCategory] = [{
                             courseId: courseToSave.id,
                             linkBehavior: 'detail',
                             showBuyButton: false
                         }, ...currentLinks];
                     }
                 }
             }
        });

        updatedHomepageSections = updatedHomepageSections.map(section => {
             if (section.autoAdd && section.autoAddTag) {
                 const targetTag = section.autoAddTag.toLowerCase().replace(/\s+/g, '-');
                 if (courseToSave.categories.some(cat => cat.toLowerCase().replace(/\s+/g, '-') === targetTag)) {
                     if (!section.courses.some(link => link.courseId === courseToSave.id)) {
                         return {
                             ...section,
                             courses: [{
                                 courseId: courseToSave.id,
                                 linkBehavior: 'detail',
                                 showBuyButton: false,
                                 contextKeywords: []
                             }, ...section.courses]
                         };
                     }
                 }
             }
             return section;
        });

        const updatedSiteData = { 
            ...siteData, 
            coursesData: updatedCourses,
            categoryCourseLinks: updatedCategoryLinks,
            homepageSections: updatedHomepageSections,
            auditLogs: updatedLogs
        };
        
        setSiteData(updatedSiteData);
        
        try {
            const result = await updateSiteDataAction(updatedSiteData);
            if (result.success) {
                 setOriginalData(JSON.parse(JSON.stringify(updatedSiteData)));
            } else {
                console.error(`Error saving course: ${result.error}`);
            }
        } catch (error) {
             console.error("Failed to save course:", error);
        } finally {
            setIsSaving(false);
            setIsCourseEditorOpen(false);
            setEditingCourse(null);
        }
    };

    // --- Helper for Log Add ---
    const createLogObject = (actionCode: string, details: string): AuditLog => ({
        id: Date.now().toString(),
        action: actionCode,
        details: details,
        timestamp: new Date().toISOString(),
        user: 'Admin'
    });

    const addLog = (actionCode: string, details: string) => {
        const newLog = createLogObject(actionCode, details);
        // Use current ref state to avoid overwrites if called rapidly
        const currentData = siteDataRef.current;
        if (currentData) {
            const updatedData = {
                ...currentData,
                auditLogs: [newLog, ...(currentData.auditLogs || [])].slice(0, 200)
            };
            setSiteData(updatedData);
            
            // Force sync save for critical logs that might not trigger other saves
            // Also include MEDIA events to ensure they are saved to DB immediately
            if (['LINK_COPY', 'LOGIN_FAILED', 'MEDIA_DELETE', 'MEDIA_UPLOAD'].includes(actionCode)) {
                 updateSiteDataAction(updatedData);
            }
        }
    };

    // Auto-save handler for Media Library - ATOMIC LOG & DATA SAVE
    const handleMediaUpdate = (files: MediaFile[], log?: { action: string, details: string }) => {
        // Use functional update to guarantee latest state and prevent race conditions
        setSiteData(prev => {
            if (!prev) return prev;
            
            console.log("[MEDIA_AUTOSAVE] Initiating atomic save...", { count: files.length, log, timestamp: new Date().toISOString() });

            // 1. Prepare Logs Atomically (inside the same state update)
            let updatedLogs = prev.auditLogs || [];
            if (log) {
                const newLog = createLogObject(log.action, log.details);
                updatedLogs = [newLog, ...updatedLogs].slice(0, 200);
            }

            // 2. Prepare Data (Optimistic Update)
            const updatedData = { 
                ...prev, 
                mediaLibrary: files || [],
                auditLogs: updatedLogs // Merged logs here to avoid overwrite
            };
            
            // 3. Persist to Server (Background)
            updateSiteDataAction(updatedData)
                .then(result => {
                    if (!result.success) {
                        console.error("[MEDIA_AUTOSAVE] Server Error:", result.error);
                        notify(`Échec Sauvegarde Auto: ${result.error}`, 'error');
                    } else {
                        console.log("[MEDIA_AUTOSAVE] Success confirmed by DB.");
                    }
                })
                .catch(err => {
                    console.error("[MEDIA_AUTOSAVE] Network/Client Error:", err);
                    notify("Erreur critique sauvegarde média", 'error');
                });
            
            return updatedData;
        });
    };

    if (isLoading || !siteData) {
        const currentTheme = theme === 'iris' ? { border: 'border-[#7de8d0]', text: 'text-[#7de8d0]' } : { border: 'border-[#ff6b81]', text: 'text-[#ff6b81]' };
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0f0e]">
                <div className={`w-16 h-16 border-4 ${currentTheme.border}/20 border-t-4 border-t-white rounded-full animate-spin`}></div>
            </div>
        );
    }

    const notify = (message: string, type: 'success' | 'error' | 'info' | 'upload') => {
        // This relies on the AdminPage internal notification state via props if we could lift it, 
        // but here we just log it as the UI is handled by MediaLibrary's local notify or AdminPage logic.
        // NOTE: AdminPage children like MediaLibrary call their own 'notify' prop which bubbles up if wired.
        // Currently, we're using this internal function mostly for the error handling block above.
        // For a real app, we should expose setNotification from AdminPage to here.
    };

    return (
        <>
            <AdminPage 
                onLogout={() => window.location.href = '/'} 
                theme={theme} 
                onOpenCourseEditor={handleOpenCourseEditor}
                siteData={siteData}
                onDataChange={(data) => {
                    // Intercept media library changes to use the auto-save handler if needed
                    if (JSON.stringify(data.mediaLibrary) !== JSON.stringify(siteData.mediaLibrary)) {
                        handleMediaUpdate(data.mediaLibrary || []);
                    } else {
                        setSiteData(data);
                    }
                }}
                onSave={handleSave}
                isSaving={isSaving}
                lang={lang}
                setLang={setLang}
                onRefresh={() => fetchData(true)}
                onLog={addLog}
            />
            {isCourseEditorOpen && (
                <CourseEditorModal
                    isOpen={isCourseEditorOpen}
                    onClose={() => setIsCourseEditorOpen(false)}
                    course={editingCourse}
                    onSave={handleSaveCourse}
                    theme={theme}
                    allCategories={siteData.softwarePillsData.filter((p): p is SoftwarePill => 'category' in p)}
                    t={t}
                />
            )}
        </>
    );
}
