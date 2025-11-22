
'use client';
import React, { useState, useEffect } from 'react';
import AdminPage, { translations } from "@/components/AdminPage";
import CourseEditorModal from '@/components/CourseEditorModal';
import { getSiteData } from '@/constants/api';
import { updateSiteDataAction } from '@/app/actions';
import type { SiteData, Course, SoftwarePill, Theme, CourseContextLink, AuditLog } from '@/types';

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

    useEffect(() => {
        getSiteData().then(data => {
            setSiteData(data);
            // Deep copy for comparison
            setOriginalData(JSON.parse(JSON.stringify(data)));
            setIsLoading(false);
        });
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

            // Fallback if multiple changes or untracked field
            if (logs.length === 0) {
                 logs.push(createLog('CONFIG_UPDATE', `Paramètres Généraux|Configuration > Système`));
            }
        }

        // 2. Pricing Changes
        if (JSON.stringify(oldData.pricingTiers) !== JSON.stringify(newData.pricingTiers)) {
             logs.push(createLog('PRICING_UPDATE', `Offres & Tarifs|Business > Pricing`));
        }

        // 3. FAQ & Testimonials
        if (JSON.stringify(oldData.faqData) !== JSON.stringify(newData.faqData)) {
             logs.push(createLog('FAQ_UPDATE', `Questions FAQ|Business > FAQ`));
        }
        if (JSON.stringify(oldData.testimonials) !== JSON.stringify(newData.testimonials)) {
             logs.push(createLog('TESTIMONIAL_UPDATE', `Témoignages|Business > Avis`));
        }
        
        // 4. Homepage Sections
        if (JSON.stringify(oldData.homepageSections) !== JSON.stringify(newData.homepageSections)) {
             logs.push(createLog('SECTION_UPDATE', `Structure Accueil|Vitrine Accueil > Sections`));
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

    if (isLoading || !siteData) {
        const currentTheme = theme === 'iris' ? { border: 'border-[#7de8d0]', text: 'text-[#7de8d0]' } : { border: 'border-[#ff6b81]', text: 'text-[#ff6b81]' };
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0f0e]">
                <div className={`w-16 h-16 border-4 ${currentTheme.border}/20 border-t-4 border-t-white rounded-full animate-spin`}></div>
            </div>
        );
    }

    return (
        <>
            <AdminPage 
                onLogout={() => window.location.href = '/'} 
                theme={theme} 
                onOpenCourseEditor={handleOpenCourseEditor}
                siteData={siteData}
                onDataChange={setSiteData}
                onSave={handleSave}
                isSaving={isSaving}
                lang={lang}
                setLang={setLang}
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
