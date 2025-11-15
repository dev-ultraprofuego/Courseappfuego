
'use client';
import React, { useState, useEffect } from 'react';
import LoginScreen from './LoginScreen';
import type { SiteData, Course, SoftwarePill, Theme, HomepageSection, CourseContextLink } from '../types';
import FeatherIcon from './FeatherIcon';
import CategoryCourseManagerModal from './CategoryCourseManagerModal';
import HomepageSectionsEditor from './HomepageSectionsEditor';
import SectionCourseManagerModal from './SectionCourseManagerModal';
// Import the new editor components
import SiteConfigEditor from './admin/SiteConfigEditor';
import CoursesEditor from './admin/CoursesEditor';
import PricingEditor from './admin/PricingEditor';
import PillsEditor from './admin/PillsEditor';
import TestimonialsEditor from './admin/TestimonialsEditor';
import FaqEditor from './admin/FaqEditor';


interface AdminPageProps {
  onLogout: () => void;
  theme: Theme;
  onOpenCourseEditor: (course: Course | null) => void;
  siteData: SiteData;
  onDataChange: (data: SiteData) => void;
  onSave: () => Promise<{ success: boolean; error?: string } | undefined>;
  isSaving: boolean;
}

type Tab = 'config' | 'sections' | 'pricing' | 'pills' | 'courses' | 'testimonials' | 'faq';
type Lang = 'fr' | 'en';

const translations = {
    fr: {
        adminTitle: "ONE",
        saveChanges: "Sauvegarder",
        saving: "Sauvegarde...",
        saved: "Sauvegardé !",
        logout: "Déconnexion",
        config: "Configuration",
        sections: "Gestion Sections des cours accueil",
        pricing: "Tarifs",
        pills: "Categorie Pills",
        courses: "Cours",
        testimonials: "Témoignages",
        faq: "FAQ",
        edit: "Modifier",
        delete: "Supprimer",
        cancel: "Annuler",
        heroCtaButton: "Bouton CTA du Héros",
        buttonAction: "Action du Bouton",
        internalPage: "Page Interne (Tarifs)",
        externalUrl: "URL Externe",
        buttonText: "Texte du Bouton",
        heroBadgeText: "Texte du Badge du Héros",
        headerCommunityLink: "Lien Communauté de l'En-tête",
        showCommunityLink: "Afficher le Lien Communauté",
        linkText: "Texte du Lien",
        linkUrl: "URL du Lien",
        dmcaLink: "Lien DMCA",
        dmcaTitle: "Titre de la Page DMCA",
        dmcaPageContent: "Contenu de la Page DMCA",
        manageAllCourses: "Gérer tous les cours",
        addNewCourse: "Ajouter un Cours",
        searchCourses: "Rechercher des cours...",
        confirmDeleteCourse: "Êtes-vous sûr de vouloir supprimer définitivement ce cours ?",
        manageCourses: "Gérer les Cours",
        addTestimonial: "Ajouter un Témoignage",
        author: "Auteur",
        text: "Texte",
        stars: "Étoiles (1-5)",
        addFaqItem: "Ajouter un élément FAQ",
        question: "Question",
        answer: "Réponse",
        name: "Nom",
        duration: "Durée",
        price: "Prix",
        priceDetails: "Détails du prix",
        features: "Fonctionnalités (une par ligne)",
        ctaText: "Texte du CTA",
        ctaUrl: "URL du CTA",
        finePrint: "Petits caractères",
        themeNames: "Noms des Thèmes",
        themeIris: "Nom du Thème Iris",
        themePristine: "Nom du Thème Pristine",
        badgeText: "Texte du Badge",
        contactPurchaseLinks: "Liens de Contact/Achat",
        defaultContactURL: "URL de Contact/Achat par Défaut",
        defaultBuyButtonText: "Texte par Défaut du Bouton d'Achat",
    },
    en: {
        adminTitle: "ONE",
        saveChanges: "Save Changes",
        saving: "Saving...",
        saved: "Saved!",
        logout: "Logout",
        config: "Configuration",
        sections: "Manage Homepage Course Sections",
        pricing: "Pricing",
        pills: "Category Pills",
        courses: "Courses",
        testimonials: "Testimonials",
        faq: "FAQ",
        edit: "Edit",
        delete: "Delete",
        cancel: "Cancel",
        heroCtaButton: "Hero CTA Button",
        buttonAction: "Button Action",
        internalPage: "Internal Page (Pricing)",
        externalUrl: "External URL",
        buttonText: "Button Text",
        heroBadgeText: "Hero Badge Text",
        headerCommunityLink: "Header Community Link",
        showCommunityLink: "Show Community Link",
        linkText: "Link Text",
        linkUrl: "Link URL",
        dmcaLink: "DMCA Link",
        dmcaTitle: "DMCA Page Title",
        dmcaPageContent: "DMCA Page Content",
        manageAllCourses: "Manage All Courses",
        addNewCourse: "Add New Course",
        searchCourses: "Search courses...",
        confirmDeleteCourse: "Are you sure you want to permanently delete this course?",
        manageCourses: "Manage Courses",
        addTestimonial: "Add Testimonial",
        author: "Author",
        text: "Text",
        stars: "Stars (1-5)",
        addFaqItem: "Add FAQ Item",
        question: "Question",
        answer: "Answer",
        name: "Name",
        duration: "Duration",
        price: "Price",
        priceDetails: "Price Details",
        features: "Features (one per line)",
        ctaText: "CTA Text",
        ctaUrl: "CTA URL",
        finePrint: "Fine Print",
        themeNames: "Theme Names",
        themeIris: "Theme Name Iris",
        themePristine: "Theme Name Pristine",
        badgeText: "Badge Text",
        contactPurchaseLinks: "Contact/Purchase Links",
        defaultContactURL: "Default Contact/Purchase URL",
        defaultBuyButtonText: "Default Buy Button Text",
    }
};

const AdminPage: React.FC<AdminPageProps> = ({ onLogout, theme, onOpenCourseEditor, siteData, onDataChange, onSave, isSaving }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('config');
    const [lang, setLang] = useState<Lang>('fr');

    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<SoftwarePill | null>(null);
    
    const [isSectionManagerOpen, setIsSectionManagerOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);

    const t = translations[lang];

    useEffect(() => {
        if (sessionStorage.getItem('isAdminAuthenticated') === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLoginSuccess = () => {
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('isAdminAuthenticated');
        onLogout();
    };

    const handleSave = async () => {
        const result = await onSave();
        if (result?.success) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } else {
            alert(`Save failed: ${result?.error || 'Unknown error'}`);
        }
    };

    const handleDataChange = (section: keyof SiteData, value: any) => {
        onDataChange({ ...siteData, [section]: value });
    };
    
    const handleOpenCategoryManager = (category: SoftwarePill) => {
        setEditingCategory(category);
        setIsCategoryManagerOpen(true);
    };

    const handleCategoryCoursesSave = (categoryId: string, updatedLinks: CourseContextLink[]) => {
      handleDataChange('categoryCourseLinks', { ...siteData.categoryCourseLinks, [categoryId]: updatedLinks });
    };
    
    const handleOpenSectionManager = (section: HomepageSection) => {
        setEditingSection(section);
        setIsSectionManagerOpen(true);
    };
    
    const handleSectionCoursesSave = (sectionId: string, updatedCourses: CourseContextLink[]) => {
        const newSections = siteData.homepageSections.map(s => s.id === sectionId ? { ...s, courses: updatedCourses } : s);
        handleDataChange('homepageSections', newSections);
    };

    const themeClasses = {
        iris: {
            text: "text-[#7de8d0]",
            border: "border-[#7de8d0]",
            bg: "bg-[#0f1513]",
            bgActive: "bg-teal-800/50",
            bgHover: "hover:bg-gray-800",
            button: "bg-teal-600 hover:bg-teal-500",
            headerText: "text-teal-400",
        },
        pristine: {
            text: "text-[#F24444]",
            border: "border-[#F24444]",
            bg: "bg-[#1a1012]",
            bgActive: "bg-red-800/50",
            bgHover: "hover:bg-gray-800",
            button: "bg-[#D92626] hover:bg-[#F24444]",
            headerText: "text-red-400",
        }
    };
    const currentTheme = themeClasses[theme];
    
    const adminInputStyles = `block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm p-3 focus:ring-opacity-50 text-base ${theme === 'iris' ? 'focus:border-teal-500 focus:ring-teal-500' : 'focus:border-red-500 focus:ring-red-500'}`;
    const adminTextareaStyles = `${adminInputStyles} min-h-[120px]`;

    const tabConfig: { id: Tab, icon: string }[] = [
        { id: 'config', icon: 'sliders' },
        { id: 'pricing', icon: 'layers' },
        { id: 'pills', icon: 'tag' },
        { id: 'courses', icon: 'grid' },
        { id: 'sections', icon: 'layout' },
        { id: 'testimonials', icon: 'heart' },
        { id: 'faq', icon: 'help-circle' }
    ];

    if (!isAuthenticated) {
        return <LoginScreen onLoginSuccess={handleLoginSuccess} theme={theme} />;
    }

    return (
        <>
            <div className={`min-h-screen p-4 sm:p-8 text-gray-200 ${currentTheme.bg}`}>
                <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-700">
                    <h1 className="text-3xl font-bold admin-one-effect">
                        {t.adminTitle}<span className="admin-umbrella">☂️</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 bg-gray-800 rounded-full p-1">
                            <button onClick={() => setLang('fr')} className={`px-3 py-1 text-sm rounded-full ${lang === 'fr' ? currentTheme.button : 'bg-transparent'}`}>FR</button>
                            <button onClick={() => setLang('en')} className={`px-3 py-1 text-sm rounded-full ${lang === 'en' ? currentTheme.button : 'bg-transparent'}`}>EN</button>
                        </div>
                        <button onClick={handleSave} disabled={isSaving} className="bg-blue-900/60 border border-blue-500/80 hover:bg-blue-800/60 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50">
                            {isSaving ? t.saving : t.saveChanges}
                        </button>
                        <button onClick={handleLogout} className="bg-gray-800/60 border border-gray-600/80 hover:bg-gray-700/60 text-white font-bold py-2 px-4 rounded-lg transition">
                            {t.logout}
                        </button>
                    </div>
                </header>
                
                <div className="flex flex-col md:flex-row gap-8">
                    <nav className="flex md:flex-col md:w-1/5 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0">
                        {tabConfig.map(({ id, icon }) => (
                            <button key={id} onClick={() => setActiveTab(id)} className={`w-full text-left p-3 rounded-lg mb-2 capitalize transition flex-shrink-0 flex items-center gap-3 ${activeTab === id ? currentTheme.bgActive : currentTheme.bgHover}`}>
                                <FeatherIcon name={icon} size={20} />
                                <span>{t[id]}</span>
                            </button>
                        ))}
                    </nav>

                    <main className="flex-1">
                        {activeTab === 'config' && <SiteConfigEditor config={siteData.config} onChange={val => handleDataChange('config', val)} theme={theme} t={t} inputClass={adminInputStyles}/>}
                        {activeTab === 'sections' && <HomepageSectionsEditor sections={siteData.homepageSections} onChange={val => handleDataChange('homepageSections', val)} theme={theme} onManageCourses={handleOpenSectionManager} t={t} onEditCourse={onOpenCourseEditor} />}
                        {activeTab === 'courses' && <CoursesEditor courses={siteData.coursesData} allCategories={siteData.softwarePillsData.filter((p): p is SoftwarePill => 'category' in p) as SoftwarePill[]} onChange={val => handleDataChange('coursesData', val)} onEditCourse={onOpenCourseEditor} theme={theme} t={t} inputClass={adminInputStyles} />}
                        {activeTab === 'pricing' && <PricingEditor tiers={siteData.pricingTiers} onChange={val => handleDataChange('pricingTiers', val)} theme={theme} t={t} inputClass={adminInputStyles} textareaClass={adminTextareaStyles} />}
                        {activeTab === 'pills' && <PillsEditor pills={siteData.softwarePillsData} onChange={val => handleDataChange('softwarePillsData', val)} theme={theme} onManageCourses={handleOpenCategoryManager} t={t} />}
                        {activeTab === 'testimonials' && <TestimonialsEditor testimonials={siteData.testimonials} onChange={val => handleDataChange('testimonials', val)} theme={theme} t={t} inputClass={adminInputStyles} textareaClass={adminTextareaStyles} />}
                        {activeTab === 'faq' && <FaqEditor faqItems={siteData.faqData} onChange={val => handleDataChange('faqData', val)} theme={theme} t={t} inputClass={adminInputStyles} textareaClass={adminTextareaStyles} />}
                    </main>
                </div>
            </div>
            {isCategoryManagerOpen && editingCategory && (
              <CategoryCourseManagerModal
                isOpen={isCategoryManagerOpen}
                onClose={() => setIsCategoryManagerOpen(false)}
                category={editingCategory}
                allCourses={siteData.coursesData}
                categoryCourseLinks={siteData.categoryCourseLinks[editingCategory.category] || []}
                onSave={handleCategoryCoursesSave}
                onEditCourse={onOpenCourseEditor}
                theme={theme}
              />
            )}
             {isSectionManagerOpen && editingSection && (
                <SectionCourseManagerModal 
                    isOpen={isSectionManagerOpen}
                    onClose={() => setIsSectionManagerOpen(false)}
                    section={editingSection}
                    allCourses={siteData.coursesData}
                    allCategories={siteData.softwarePillsData.filter((p): p is SoftwarePill => 'category' in p)}
                    onSave={handleSectionCoursesSave}
                    onEditCourse={onOpenCourseEditor}
                    theme={theme}
                />
            )}
             <div className={`fixed bottom-8 right-8 bg-gray-800 border border-gray-600 text-white py-3 px-6 rounded-lg shadow-lg transition-transform duration-300 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {t.saved}
            </div>
        </>
    );
};

export default AdminPage;