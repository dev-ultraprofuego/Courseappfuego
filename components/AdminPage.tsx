'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import LoginScreen from './LoginScreen';
import type { SiteData, Course, SoftwarePill, Theme, HomepageSection, CourseContextLink, MediaFile, AuditLog } from '../types';
import FeatherIcon from './FeatherIcon';
import CategoryCourseManagerModal from './CategoryCourseManagerModal';
import HomepageSectionsEditor from './HomepageSectionsEditor';
import SectionCourseManagerModal from './SectionCourseManagerModal';
import SiteConfigEditor from './admin/SiteConfigEditor';
import CoursesEditor from './admin/CoursesEditor';
import PricingEditor from './admin/PricingEditor';
import PillsEditor from './admin/PillsEditor';
import TestimonialsEditor from './admin/TestimonialsEditor';
import FaqEditor from './admin/FaqEditor';
import MediaLibrary from './admin/MediaLibrary';
import TrashBin from './admin/TrashBin';
import AuditLogs from './admin/AuditLogs';
import ConfirmationModal from './admin/ConfirmationModal';

interface AdminPageProps {
  onLogout: () => void;
  theme: Theme;
  onOpenCourseEditor: (course: Course | null) => void;
  siteData: SiteData;
  onDataChange: (data: SiteData) => void;
  onSave: () => Promise<{ success: boolean; error?: string } | undefined>;
  isSaving: boolean;
  lang: 'fr' | 'en';
  setLang: (lang: 'fr' | 'en') => void;
  onRefresh?: () => Promise<void>;
  onLog?: (action: string, details: string) => void;
}

type Tab = 'dashboard' | 'config' | 'sections' | 'pricing' | 'pills' | 'courses' | 'testimonials' | 'faq' | 'media' | 'trash' | 'logs';
type Lang = 'fr' | 'en';
type NotificationType = 'save' | 'success' | 'error' | 'info' | 'upload';

export const translations = {
    fr: {
        dashboard: "Tableau de bord",
        adminTitle: "CONTENT.",
        saveChanges: "SAUVEGARDER",
        saving: "SAUVEGARDE...",
        saved: "Modifications enregistrées.",
        logout: "Déconnexion",
        config: "Configuration",
        sections: "Vitrine Accueil",
        pricing: "Offres & Tarifs",
        pills: "Catégories",
        courses: "Bibliothèque Cours",
        testimonials: "Témoignages",
        faq: "FAQ",
        media: "Médiathèque",
        trash: "Corbeille",
        logs: "Logs Activité",
        
        manageAllCourses: "Gérer tous les cours",
        itemsInDatabase: "éléments dans la base",
        addNewCourse: "Ajouter un Cours",
        searchCourses: "Rechercher...",
        confirmDeleteCourse: "Êtes-vous sûr de vouloir supprimer ce cours ?",
        itemsActive: "actifs",
        filterCategory: "Filtrer par catégorie",
        allCategories: "Toutes",
        noCoursesFound: "Aucun résultat.",
        tryChangingFilters: "Modifiez les filtres.",
        noActivity: "Aucune activité récente.",
        noFiles: "Aucun fichier.",
        noDeletedItems: "Corbeille vide.",
        upload: "Uploader",
        restore: "Restaurer",
        deletePermanently: "Supprimer définitivement",
        cancel: "Annuler",
        confirm: "Confirmer",
        
        stats: {
            totalCourses: "Total Cours",
            totalCategories: "Catégories",
            activeSections: "Sections Accueil",
            lastUpdate: "Dernière màj",
            totalViews: "Vues Totales",
            todayViews: "Vues Aujourd'hui"
        },
        quickActions: {
            title: "Actions Rapides",
            addCourse: "Ajouter un cours",
            manageSections: "Gérer l'accueil",
            viewSite: "Voir le site"
        },
        recentActivity: "Activité Récente",
        
        addTestimonial: "Ajouter un Témoignage",
        noTestimonials: "Aucun témoignage.",
        author: "Auteur",
        text: "Texte",
        stars: "Étoiles",
        
        addFaqItem: "Ajouter une Question",
        noFaq: "Aucune question FAQ.",
        question: "Question",
        answer: "Réponse",
        
        name: "Nom",
        duration: "Durée",
        price: "Prix",
        priceDetails: "Détails prix",
        features: "Fonctionnalités",
        ctaText: "Texte CTA",
        ctaUrl: "URL CTA",
        finePrint: "Mentions",
        
        themeNames: "Noms des Thèmes",
        themeIris: "Thème Iris",
        themePristine: "Thème Pristine",
        themeBoss: "Thème Boss",
        heroCtaButton: "Bouton Hero",
        buttonText: "Texte",
        buttonAction: "Action",
        internalPage: "Page Interne",
        externalUrl: "URL Externe",
        heroBadgeText: "Badge Hero",
        defaultBuyButtonText: "Texte Achat Défaut",
        defaultContactURL: "URL Achat Défaut",
        showCommunityLink: "Lien Communauté",
        linkText: "Texte",
        linkUrl: "URL",
        dmcaPageContent: "Contenu DMCA",
        dmcaTitle: "Titre DMCA",
        manageCourses: "Gérer",
        maintenanceMessage: "Message Maintenance",
        maintenanceMode: "Mode Maintenance",
        
        linkType: "Type",
        category: "Grille",
        external: "Link",
        destinationUrl: "URL",

        // Hardcoded strings translations
        sidebarHeaders: {
            content: "CONTENU",
            media: "MEDIATEQUE",
            business: "BUSINESS",
            system: "SYSTEME"
        },
        userStatus: {
            admin: "Administrateur",
            connected: "Connecté"
        },
        headerSubtitle: "Gestion & Administration",
        dashboardHome: {
            welcome: "Bienvenue, Administrateur",
            overview: "Aperçu de votre plateforme Content.",
            online: "En ligne",
            quickActionDesc1: "Ajouter du contenu à la base",
            quickActionDesc2: "Organiser la page d'accueil",
            quickActionDesc3: "Voir le rendu final"
        },
        configDescriptions: {
            themes: "Personnalisez les noms affichés pour les thèmes dans le sélecteur de l'en-tête.",
            hero: "Configurez le texte principal et le bouton d'appel à l'action visible en haut de la page d'accueil.",
            links: "Gérez les liens globaux, le bandeau communautaire et les actions par défaut.",
            dmca: "Configuration de la page de politique DMCA et de son lien dans le pied de page.",
            system: "Paramètres avancés : Métadonnées, Favicon, Scripts de suivi et Mode Maintenance."
        },
        coursesTable: {
            image: "Image",
            title: "Titre du Cours",
            status: "Statut",
            categories: "Catégories",
            date: "Date",
            action: "Action",
            draft: "Brouillon",
            published: "Publié",
            noCourses: "Aucun cours trouvé",
            tryFilter: "Essayez de modifier vos filtres...",
            filterAll: "Toutes catégories"
        },
        placeholders: {
            clientName: "Nom du client",
            comment: "Le commentaire du client...",
            question: "Posez la question ici...",
            answer: "Écrivez la réponse détaillée...",
            features: "• Accès illimité\n• Support 24/7\n• Tous les fichiers"
        },
        googlePreview: {
            title: "Google Search Preview",
            desc: "Description du cours qui apparaîtra dans les résultats de recherche..."
        },

        // Editor Translations
        editor: {
            editCourse: "Modifier le Cours",
            createCourse: "Créer un Nouveau Cours",
            fullscreen: "Espace d'édition plein écran.",
            write: "Écrire",
            preview: "Aperçu",
            save: "SAUVEGARDER",
            create: "CRÉER",
            content: "Contenu",
            resources: "Ressources",
            seo: "SEO / Google",
            titlePlaceholder: "Titre du cours",
            descPlaceholder: "Ajoutez une courte description...",
            contentPlaceholder: "Commencez à écrire votre contenu ici...",
            filesTitle: "Fichiers joints & Liens",
            fileName: "Nom du fichier/lien",
            url: "URL",
            add: "Add",
            noFiles: "Aucun fichier joint pour ce cours.",
            status: "Statut",
            draft: "Brouillon",
            published: "Publié",
            archived: "Archivé",
            slug: "Slug URL",
            coverImage: "Image de Couverture",
            change: "Changer",
            date: "Date",
            externalLink: "Lien Externe",
            tags: "Tags",
            metaTitle: "Meta Title (Titre SEO)",
            metaDesc: "Meta Description",
            socialPreview: "Social Preview (Twitter/X)",
            advancedConfig: "Configuration Avancée (Robots & Schema)",
            indexing: "Indexation (Robots)",
            indexingDesc: "Autoriser les moteurs à indexer cette page",
            schema: "Rich Snippet (Schema)",
            schemaDesc: "Générer JSON-LD Course (Expérimental)",
            canonical: "URL Canonique (Optionnel)",
            criteria: "Critères",
            lengthTitle: "Longueur Titre (30-60)",
            lengthDesc: "Longueur Desc (120-160)",
            socialImage: "Image Sociale",
            cleanSlug: "Slug URL Propre"
        },
        sectionEditor: {
            sectionTitle: "Titre de la section",
            manage: "GÉRER",
            configLink: "Configurer le lien",
            internal: "Interne",
            external: "Externe",
            noCourses: "Aucun cours visible"
        },
        manager: {
            categoryTitle: "Catégorie :",
            sectionTitle: "Section :",
            managePage: "Gestion de la page",
            manageDisplay: "Gérez l'affichage et l'ordre des cours",
            autoAdd: "Auto-Add",
            save: "SAUVEGARDER",
            activeList: "Liste Active",
            applyGlobalLink: "Appliquer lien global...",
            apply: "Appliquer",
            dragDrop: "Glissez des cours depuis la droite.",
            search: "Rechercher...",
            noResults: "Aucun cours trouvé.",
            createCourse: "Créer un nouveau cours",
            actionClick: "Action au clic",
            openPage: "Ouvrir la page",
            redirect: "Rediriger",
            label: "Étiquette (Badge)",
            buyButton: "Bouton Achat",
            redirectUrl: "URL de Redirection",
            buyLink: "Lien d'achat",
            buttonText: "Texte Bouton",
            contextTags: "Tags Contextuels"
        },
        trashBin: {
            title: "Corbeille",
            items: "ÉLÉMENTS",
            empty: "La corbeille est vide.",
            deleted: "SUPPRIMÉ",
            restore: "Restaurer",
            deletePermanent: "Suppression Définitive",
            irreversible: "Cette action est irréversible.",
            restoredMsg: "Cours restauré",
            deletedMsg: "Cours supprimé définitivement"
        },
        mediaLib: {
            title: "Médiathèque",
            upload: "Uploader",
            noFiles: "Aucun fichier. Uploadez votre première image.",
            copyLink: "Copier le lien",
            delete: "Supprimer",
            grid: "Grille",
            list: "Liste"
        },
        auditLogs: {
            title: "Console Activity",
            recent: "RÉCENT",
            oldest: "ANCIEN",
            today: "Aujourd'hui",
            yesterday: "Hier",
            noSignal: "_ No signal..."
        }
    },
    en: {
        dashboard: "Dashboard",
        adminTitle: "CONTENT.",
        saveChanges: "SAVE CHANGES",
        saving: "SAVING...",
        saved: "Changes saved.",
        logout: "Logout",
        config: "Configuration",
        sections: "Storefront Layout",
        pricing: "Pricing & Plans",
        pills: "Categories",
        courses: "Course Library",
        testimonials: "Testimonials",
        faq: "FAQ",
        media: "Media Library",
        trash: "Trash Bin",
        logs: "Audit Logs",
        
        manageAllCourses: "Manage All Courses",
        itemsInDatabase: "items in database",
        addNewCourse: "Add New Course",
        searchCourses: "Search...",
        confirmDeleteCourse: "Are you sure you want to delete this course?",
        itemsActive: "active",
        filterCategory: "Filter by category",
        allCategories: "All",
        noCoursesFound: "No results found.",
        tryChangingFilters: "Try changing filters.",
        noActivity: "No recent activity.",
        noFiles: "No files.",
        noDeletedItems: "Trash is empty.",
        upload: "Upload",
        restore: "Restore",
        deletePermanently: "Delete permanently",
        cancel: "Cancel",
        confirm: "Confirm",
        
        stats: {
            totalCourses: "Total Courses",
            totalCategories: "Categories",
            activeSections: "Home Sections",
            lastUpdate: "Last Update",
            totalViews: "Total Views",
            todayViews: "Views Today"
        },
        quickActions: {
            title: "Quick Actions",
            addCourse: "Add a course",
            manageSections: "Manage Home",
            viewSite: "View Site"
        },
        recentActivity: "Recent Activity",
        
        addTestimonial: "Add Testimonial",
        noTestimonials: "No testimonials.",
        author: "Author",
        text: "Text",
        stars: "Stars",
        
        addFaqItem: "Add Question",
        noFaq: "No FAQ items.",
        question: "Question",
        answer: "Answer",
        
        name: "Name",
        duration: "Duration",
        price: "Price",
        priceDetails: "Price Details",
        features: "Features",
        ctaText: "CTA Text",
        ctaUrl: "CTA URL",
        finePrint: "Fine Print",
        
        themeNames: "Theme Names",
        themeIris: "Iris Theme",
        themePristine: "Pristine Theme",
        themeBoss: "Boss Theme",
        heroCtaButton: "Hero Button",
        buttonText: "Text",
        buttonAction: "Action",
        internalPage: "Internal Page",
        externalUrl: "External URL",
        heroBadgeText: "Hero Badge",
        defaultBuyButtonText: "Default Buy Text",
        defaultContactURL: "Default Buy URL",
        showCommunityLink: "Community Link",
        linkText: "Text",
        linkUrl: "URL",
        dmcaPageContent: "DMCA Content",
        dmcaTitle: "DMCA Title",
        manageCourses: "Manage",
        maintenanceMessage: "Maintenance Message",
        maintenanceMode: "Maintenance Mode",
        
        linkType: "Type",
        category: "Grid",
        external: "Link",
        destinationUrl: "URL",

        // Hardcoded strings translations
        sidebarHeaders: {
            content: "CONTENT",
            media: "MEDIA LIBRARY",
            business: "BUSINESS",
            system: "SYSTEM"
        },
        userStatus: {
            admin: "Administrator",
            connected: "Online"
        },
        headerSubtitle: "Management & Admin",
        dashboardHome: {
            welcome: "Welcome, Administrator",
            overview: "Platform Overview",
            online: "Online",
            quickActionDesc1: "Add content to database",
            quickActionDesc2: "Organize storefront",
            quickActionDesc3: "View live site"
        },
        configDescriptions: {
            themes: "Customize displayed theme names in the header selector.",
            hero: "Configure main hero text and CTA button visible on homepage.",
            links: "Manage global links, community banner and default actions.",
            dmca: "Configure DMCA policy page and its footer link.",
            system: "Advanced settings: Metadata, Favicon, Tracking Scripts and Maintenance Mode."
        },
        coursesTable: {
            image: "Image",
            title: "Course Title",
            status: "Status",
            categories: "Categories",
            date: "Date",
            action: "Action",
            draft: "Draft",
            published: "Published",
            noCourses: "No courses found",
            tryFilter: "Try adjusting your filters...",
            filterAll: "All Categories"
        },
        placeholders: {
            clientName: "Client Name",
            comment: "Client's feedback...",
            question: "Ask a question...",
            answer: "Write detailed answer...",
            features: "• Unlimited access\n• 24/7 Support\n• All files"
        },
        googlePreview: {
            title: "Google Search Preview",
            desc: "Course description as it appears in search results..."
        },

        editor: {
            editCourse: "Edit Course",
            createCourse: "Create New Course",
            fullscreen: "Fullscreen Editor.",
            write: "Write",
            preview: "Preview",
            save: "SAVE",
            create: "CREATE",
            content: "Content",
            resources: "Resources",
            seo: "SEO / Google",
            titlePlaceholder: "Course Title",
            descPlaceholder: "Add a short description...",
            contentPlaceholder: "Start writing content here...",
            filesTitle: "Attachments & Links",
            fileName: "File/Link Name",
            url: "URL",
            add: "Add",
            noFiles: "No attachments for this course.",
            status: "Status",
            draft: "Draft",
            published: "Published",
            archived: "Archived",
            slug: "URL Slug",
            coverImage: "Cover Image",
            change: "Change",
            date: "Date",
            externalLink: "External Link",
            tags: "Tags",
            metaTitle: "Meta Title (SEO Title)",
            metaDesc: "Meta Description",
            socialPreview: "Social Preview (Twitter/X)",
            advancedConfig: "Advanced Config (Robots & Schema)",
            indexing: "Indexing (Robots)",
            indexingDesc: "Allow engines to index this page",
            schema: "Rich Snippet (Schema)",
            schemaDesc: "Generate JSON-LD (Experimental)",
            canonical: "Canonical URL (Optional)",
            criteria: "Criteria",
            lengthTitle: "Title Length (30-60)",
            lengthDesc: "Desc Length (120-160)",
            socialImage: "Social Image",
            cleanSlug: "Clean Slug"
        },
        sectionEditor: {
            sectionTitle: "Section Title",
            manage: "MANAGE",
            configLink: "Config Link",
            internal: "Internal",
            external: "External",
            noCourses: "No visible courses"
        },
        manager: {
            categoryTitle: "Category:",
            sectionTitle: "Section:",
            managePage: "Page Management",
            manageDisplay: "Manage display and order",
            autoAdd: "Auto-Add",
            save: "SAVE",
            activeList: "Active List",
            applyGlobalLink: "Apply global link...",
            apply: "Apply",
            dragDrop: "Drag courses from the right.",
            search: "Search...",
            noResults: "No courses found.",
            createCourse: "Create new course",
            actionClick: "Click Action",
            openPage: "Open Page",
            redirect: "Redirect",
            label: "Label (Badge)",
            buyButton: "Buy Button",
            redirectUrl: "Redirect URL",
            buyLink: "Buy Link",
            buttonText: "Button Text",
            contextTags: "Context Tags"
        },
        trashBin: {
            title: "Trash Bin",
            items: "ITEMS",
            empty: "Trash bin is empty.",
            deleted: "DELETED",
            restore: "Restore",
            deletePermanent: "Delete Permanently",
            irreversible: "This action is irreversible.",
            restoredMsg: "Course restored",
            deletedMsg: "Course permanently deleted"
        },
        mediaLib: {
            title: "Media Library",
            upload: "Upload",
            noFiles: "No files. Upload your first image.",
            copyLink: "Copy Link",
            delete: "Delete",
            grid: "Grid",
            list: "List"
        },
        auditLogs: {
            title: "Console Activity",
            recent: "NEWEST",
            oldest: "OLDEST",
            today: "Today",
            yesterday: "Yesterday",
            noSignal: "_ No signal..."
        }
    }
};

const AdminPage: React.FC<AdminPageProps> = ({ onLogout, theme, onOpenCourseEditor, siteData, onDataChange, onSave, isSaving, lang, setLang, onRefresh, onLog }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [notification, setNotification] = useState<{show: boolean, message: string, type: NotificationType}>({show: false, message: '', type: 'save'});
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<SoftwarePill | null>(null);
    
    const [isSectionManagerOpen, setIsSectionManagerOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);

    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => {},
        isDanger: false,
        singleButton: false
    });

    // Ref to hold the latest siteData to avoid closure staleness in callbacks
    const siteDataRef = useRef(siteData);
    useEffect(() => {
        siteDataRef.current = siteData;
    }, [siteData]);

    const t = translations[lang];

    useEffect(() => {
        if (sessionStorage.getItem('isAdminAuthenticated') === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const notify = (message: string, type: NotificationType = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
    };

    // Helper to Create Log Object
    const createLogObject = (actionCode: string, details: string): AuditLog => ({
        id: Date.now().toString(),
        action: actionCode,
        details: details,
        timestamp: new Date().toISOString(),
        user: 'Admin'
    });

    const handleLoginSuccess = () => {
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        setIsAuthenticated(true);
        if (onLog) onLog('LOGIN_SUCCESS', 'Admin|Système > Accès');
    };

    const handleLogout = () => {
        sessionStorage.removeItem('isAdminAuthenticated');
        onLogout();
    };

    const confirmAction = (title: string, description: string, action: () => void, isDanger = false, singleButton = false) => {
        setConfirmState({
            isOpen: true,
            title,
            description,
            onConfirm: () => {
                action();
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            },
            isDanger,
            singleButton
        });
    };

    const handleSave = async () => {
        setTimeout(async () => {
             const result = await onSave();
            if (result?.success) {
                notify(t.saved, 'save');
            } else {
                confirmAction("Erreur", result?.error || "Erreur inconnue", () => {}, true, true);
            }
        }, 100);
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
      if (onLog) onLog('CATEGORY_CONTENT', `Catégorie ${categoryId}|Catégories > ${categoryId} > Contenu`);
    };
    
    const handleUpdateCategoryConfig = (categoryId: string, config: { autoAdd: boolean }) => {
        const newPills = siteData.softwarePillsData.map(p => {
            if ('category' in p && p.category === categoryId) {
                return { ...p, ...config };
            }
            return p;
        });
        handleDataChange('softwarePillsData', newPills);
    };
    
    const handleOpenSectionManager = (section: HomepageSection) => {
        setEditingSection(section);
        setIsSectionManagerOpen(true);
    };
    
    const handleSectionCoursesSave = (updatedSection: HomepageSection) => {
        const newSections = siteData.homepageSections.map(s => s.id === updatedSection.id ? updatedSection : s);
        handleDataChange('homepageSections', newSections);
        if (onLog) onLog('SECTION_CONTENT', `${updatedSection.title}|Accueil > ${updatedSection.title} > Contenu`);
    };

    // CRITICAL FIX: Use siteDataRef.current to access fresh state in the callback
    const handleSoftDelete = (courseId: number) => {
        // Access fresh data from Ref
        const currentData = siteDataRef.current;
        const course = currentData.coursesData.find(c => c.id === courseId);
        const courseTitle = course?.title || "Cours";
        
        confirmAction("Supprimer ?", `Le cours '${courseTitle}' sera déplacé dans la corbeille.`, () => {
            // Re-access fresh data inside the callback
            const freshData = siteDataRef.current; 
            
            // 1. Prepare Updated Courses
            const updatedCourses = freshData.coursesData.map(c => 
                c.id === courseId ? { ...c, deletedAt: new Date().toISOString(), status: 'archived' as const } : c
            );

            // 2. Prepare Updated Logs
            const newLog = createLogObject('COURSE_DELETE', `${courseTitle}|Bibliothèque > Corbeille`);
            const updatedLogs = [newLog, ...(freshData.auditLogs || [])].slice(0, 200);

            // 3. SINGLE ATOMIC UPDATE
            onDataChange({
                ...freshData,
                coursesData: updatedCourses,
                auditLogs: updatedLogs
            });
            
            // 4. Notification (RED)
            notify("Cours déplacé dans la corbeille", "error");

        }, true);
    };

    const handleRestore = (courseId: number) => {
        const currentData = siteDataRef.current;
        const course = currentData.coursesData.find(c => c.id === courseId);
        const courseTitle = course?.title || "Cours";
        
        // 1. Prepare Courses
        const updatedCourses = currentData.coursesData.map(c => 
            c.id === courseId ? { ...c, deletedAt: null, status: 'draft' as const } : c
        );

        // 2. Prepare Logs
        const newLog = createLogObject('COURSE_RESTORE', `${courseTitle}|Corbeille > Bibliothèque`);
        const updatedLogs = [newLog, ...(currentData.auditLogs || [])].slice(0, 200);

        // 3. Atomic Update
        onDataChange({
            ...currentData,
            coursesData: updatedCourses,
            auditLogs: updatedLogs
        });
    };

    const handlePermanentDelete = (courseId: number) => {
        // Fix: No double confirmation. TrashBin handles the UI, this handles the logic.
        const currentData = siteDataRef.current;
        const course = currentData.coursesData.find(c => c.id === courseId);
        const courseTitle = course?.title || "Cours";
        
        // 1. Prepare Updated Data
        const updatedCourses = currentData.coursesData.filter(c => c.id !== courseId);
        
        // FIX: Updated context from 'Système' to 'Corbeille'
        const newLog = createLogObject('COURSE_PURGE', `${courseTitle}|Corbeille`);
        const updatedLogs = [newLog, ...(currentData.auditLogs || [])].slice(0, 200);

        // 2. Atomic Update
        onDataChange({
            ...currentData,
            coursesData: updatedCourses,
            auditLogs: updatedLogs
        });
    };

    const handleMediaUpdate = (files: MediaFile[]) => {
        handleDataChange('mediaLibrary', files);
    };

    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const activeCourses = siteData.coursesData.filter(c => !c.deletedAt);
        const sortedCourses = [...activeCourses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return {
            totalCourses: activeCourses.length,
            totalCategories: siteData.softwarePillsData.filter(p => 'category' in p).length,
            activeSections: siteData.homepageSections.length,
            lastUpdate: sortedCourses.length > 0 ? sortedCourses[0].date : 'N/A',
            totalViews: siteData.stats?.totalViews || 0,
            todayViews: siteData.stats?.dailyViews?.[today] || 0
        };
    }, [siteData]);

    const themeClasses = {
        iris: {
            sidebarActive: "border-l-2 border-teal-500 bg-gradient-to-r from-teal-500/10 to-transparent text-white",
            icon: "text-teal-400",
            toastBorder: "border-teal-500/30 shadow-[0_0_30px_-5px_rgba(45,212,191,0.3)]",
            indicator: "bg-teal-400",
            glowColor: "rgba(45,212,191,0.4)",
            accentText: "text-teal-400",
            saveBtn: "from-[#0d332d] to-[#041412] border-teal-900/30 text-teal-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_20px_rgba(45,212,191,0.15)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_0_25px_rgba(45,212,191,0.3)]"
        },
        pristine: {
            sidebarActive: "border-l-2 border-[#ff4757] bg-gradient-to-r from-[#ff4757]/10 to-transparent text-white",
            icon: "text-[#ff6b81]",
            toastBorder: "border-[#ff4757]/30 shadow-[0_0_30px_-5px_rgba(255,71,87,0.3)]",
            indicator: "bg-[#ff4757]",
            glowColor: "rgba(255,71,87,0.4)",
            accentText: "text-[#ff6b81]",
            saveBtn: "from-[#3f121a] to-[#1a0508] border-[#ff4757]/30 text-[#ffcbd1] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_20px_rgba(255,71,87,0.15)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_0_25px_rgba(255,71,87,0.3)]"
        },
        boss: {
            sidebarActive: "border-l-2 border-[#D92626] bg-gradient-to-r from-[#D92626]/10 to-transparent text-white",
            icon: "text-[#F24444]",
            toastBorder: "border-[#D92626]/30 shadow-[0_0_30px_-5px_rgba(217,38,38,0.3)]",
            indicator: "bg-[#D92626]",
            glowColor: "rgba(217,38,38,0.4)",
            accentText: "text-[#F24444]",
            saveBtn: "from-[#3f1212] to-[#1a0505] border-red-900/30 text-red-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_20px_rgba(220,38,38,0.15)] hover:shadow-[inset_0_1px_0_rgba(220,38,38,0.3)]"
        }
    };
    const currentTheme = themeClasses[theme];
    const adminInputStyles = `block w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-200 font-heading shadow-inner`;
    const adminTextareaStyles = `${adminInputStyles} min-h-[120px]`;

    if (!isAuthenticated) return <LoginScreen onLoginSuccess={handleLoginSuccess} theme={theme} onLog={onLog} />;

    const SidebarItem = ({ id, icon, label }: { id: Tab, icon: string, label: string }) => (
        <button 
            onClick={() => {
                setActiveTab(id);
                setIsMobileMenuOpen(false);
            }} 
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium font-heading transition-all duration-200 group ${activeTab === id ? currentTheme.sidebarActive : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
            <FeatherIcon name={icon} size={16} className={`transition-colors ${activeTab === id ? currentTheme.icon : 'opacity-60 group-hover:text-white group-hover:opacity-100'}`} />
            {label}
        </button>
    );

    const DashboardHome = () => {
        return (
            <div className="space-y-8 animate-fadeIn pb-12">
                 <div className="flex items-center justify-between">
                    <div><h2 className="text-2xl font-bold text-white tracking-tight mb-1 font-heading">{t.dashboardHome.welcome}</h2><p className="text-sm text-gray-500">{t.dashboardHome.overview}</p></div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111413] rounded-full border border-white/5 shadow-sm"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><span className="text-[10px] font-bold text-green-500 uppercase tracking-wide font-heading">{t.dashboardHome.online}</span></div>
                </div>
                {/* ROW 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[{ label: t.stats.totalViews, value: stats.totalViews, icon: 'eye' }, { label: t.stats.todayViews, value: stats.todayViews, icon: 'bar-chart-2' }].map((stat, i) => (
                        <div key={i} className="bg-[#0a0d0c] border border-white/5 p-6 rounded-xl flex flex-col gap-4 shadow-sm hover:border-white/10 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1">
                            <div className="flex items-center justify-between"><span className="text-xs uppercase font-bold text-gray-500 tracking-wider font-heading">{stat.label}</span><div className={`p-2 rounded-md bg-white/5 group-hover:bg-white/10 transition-colors ${currentTheme.icon}`}><FeatherIcon name={stat.icon} size={18} /></div></div>
                            <span className="text-4xl font-black text-white font-heading tracking-tight">{stat.value}</span>
                        </div>
                    ))}
                </div>
                {/* ROW 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[{ label: t.stats.totalCourses, value: stats.totalCourses, icon: 'grid' }, { label: t.stats.totalCategories, value: stats.totalCategories, icon: 'tag' }, { label: t.stats.lastUpdate, value: stats.lastUpdate, icon: 'clock' }].map((stat, i) => (
                        <div key={i} className="bg-[#0a0d0c] border border-white/5 p-5 rounded-xl flex flex-col gap-4 shadow-sm hover:border-white/10 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1">
                             <div className="flex items-center justify-between"><span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider font-heading">{stat.label}</span><div className={`p-1.5 rounded-md bg-white/5 group-hover:bg-white/10 transition-colors ${currentTheme.icon}`}><FeatherIcon name={stat.icon} size={14} /></div></div>
                            <span className="text-3xl font-black text-white font-heading tracking-tight">{stat.value}</span>
                        </div>
                    ))}
                </div>

                {/* Layout 1/3 - 2/3 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quick Actions (Vertical) */}
                    <div className="lg:col-span-1 bg-[#0a0d0c] border border-white/5 p-6 rounded-xl h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <FeatherIcon name="zap" size={16} className={currentTheme.icon} />
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest font-heading">{t.quickActions.title}</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3 flex-grow">
                            <button onClick={() => onOpenCourseEditor(null)} className={`p-4 rounded-lg border border-transparent bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 transition-all text-left group relative overflow-hidden border-white/5`}>
                                <div className={`mb-3 ${currentTheme.icon} p-2 bg-white/5 rounded-lg w-fit`}><FeatherIcon name="plus-circle" size={20}/></div>
                                <span className="font-bold text-white block relative z-10 font-heading text-lg">{t.quickActions.addCourse}</span>
                                <span className="text-xs text-gray-400 group-hover:text-gray-300 relative z-10 mt-1 block">{t.dashboardHome.quickActionDesc1}</span>
                            </button>
                            <button onClick={() => setActiveTab('sections')} className="p-4 rounded-lg bg-[#111413] border border-white/5 hover:border-white/10 transition-all text-left group">
                                <div className="mb-2 text-gray-400 group-hover:text-white"><FeatherIcon name="layout" size={20}/></div>
                                <span className="font-bold text-gray-200 group-hover:text-white block font-heading">{t.quickActions.manageSections}</span>
                                <span className="text-xs text-gray-500">{t.dashboardHome.quickActionDesc2}</span>
                            </button>
                             <a href="/" target="_blank" className="p-4 rounded-lg bg-[#111413] border border-white/5 hover:border-white/10 transition-all text-left group block no-underline">
                                <div className="mb-2 text-gray-400 group-hover:text-white"><FeatherIcon name="external-link" size={20}/></div>
                                <span className="font-bold text-gray-200 group-hover:text-white block font-heading">{t.quickActions.viewSite}</span>
                                <span className="text-xs text-gray-500">{t.dashboardHome.quickActionDesc3}</span>
                            </a>
                        </div>
                    </div>

                    {/* Recent Activity (Expanded) */}
                    <div className="lg:col-span-2 bg-[#0a0d0c] border border-white/5 p-6 rounded-xl">
                        <div className="flex items-center gap-2 mb-6">
                            <FeatherIcon name="clock" size={16} className={currentTheme.icon} />
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest font-heading">{t.recentActivity}</h3>
                        </div>
                        <div className="space-y-2">
                            {siteData.coursesData.filter(c => !c.deletedAt).slice(0, 5).map(course => (
                                <div key={course.id} className="flex items-center gap-4 p-3 bg-[#0E1110] hover:bg-[#131615] rounded-lg transition-colors group cursor-default border border-white/5 hover:border-white/10">
                                    <div className="w-10 h-10 rounded-md overflow-hidden bg-[#1A1D1C] relative flex-shrink-0">
                                        <img src={course.img} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-200 group-hover:text-white truncate transition-colors font-heading">{course.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded text-white font-bold ${course.status === 'draft' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                                {course.status === 'draft' ? 'DRAFT' : 'LIVE'}
                                            </span>
                                            <span className="text-[10px] text-gray-600">{course.date}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => onOpenCourseEditor(course)} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-all transform hover:scale-105">
                                        <FeatherIcon name="edit-2" size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Detect full page tabs to remove bottom padding from container
    const isFullPageTab = ['media', 'trash', 'logs'].includes(activeTab);

    return (
        <>
            <div className={`flex min-h-screen text-gray-200 bg-[#050505] font-sans selection:bg-white/20`}>
                {/* Mobile Backdrop */}
                <div 
                    className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* SIDEBAR */}
                <aside className={`w-64 bg-[#0a0d0c] border-r border-white/5 flex-shrink-0 flex flex-col fixed h-full z-30 overflow-hidden transition-transform duration-300 ease-in-out transform lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-20 flex items-center px-6 border-b border-white/5 justify-between">
                        <h1 className="text-2xl font-black admin-one-effect flex items-center gap-1 tracking-tight cursor-pointer font-heading group/logo" onClick={() => setActiveTab('dashboard')}>
                            CONTENT.
                            <span className="text-2xl transform -rotate-[15deg] inline-block admin-fire-effect -translate-y-1 ml-0.5">☔</span>
                        </h1>
                        {/* Mobile Close Button inside Sidebar */}
                        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-500 hover:text-white">
                            <FeatherIcon name="x-octagon" size={20} />
                        </button>
                    </div>

                    <div 
                        className="flex-1 overflow-y-auto py-6 space-y-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <SidebarItem id="dashboard" icon="pie-chart" label={t.dashboard} />
                        <div className="px-6 py-3 mt-4 mb-1 text-[10px] font-bold text-gray-600 uppercase tracking-widest font-heading">{t.sidebarHeaders.content}</div>
                        <SidebarItem id="pills" icon="tag" label={t.pills} />
                        <SidebarItem id="courses" icon="grid" label={t.courses} />
                        <SidebarItem id="sections" icon="layout" label={t.sections} />

                        <div className="px-6 py-3 mt-4 mb-1 text-[10px] font-bold text-gray-600 uppercase tracking-widest font-heading">{t.sidebarHeaders.media}</div>
                        <SidebarItem id="media" icon="image" label={t.media} />

                        <div className="px-6 py-3 mt-4 mb-1 text-[10px] font-bold text-gray-600 uppercase tracking-widest font-heading">{t.sidebarHeaders.business}</div>
                        <SidebarItem id="pricing" icon="dollar-sign" label={t.pricing} />
                        <SidebarItem id="testimonials" icon="heart" label={t.testimonials} />
                        <SidebarItem id="faq" icon="help-circle" label={t.faq} />

                        <div className="px-6 py-3 mt-4 mb-1 text-[10px] font-bold text-gray-600 uppercase tracking-widest font-heading">{t.sidebarHeaders.system}</div>
                        <SidebarItem id="config" icon="sliders" label={t.config} />
                        <SidebarItem id="logs" icon="list" label={t.logs} />
                        <SidebarItem id="trash" icon="trash-2" label={t.trash} />
                    </div>

                    <div className="p-4 border-t border-white/5 bg-[#080a09]">
                        <div className="flex items-center gap-3 mb-3 px-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 relative flex items-center justify-center">
                                <span className="font-bold text-xs text-gray-400">A</span>
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#080a09] rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate font-heading">{t.userStatus.admin}</p>
                                <p className="text-[10px] text-gray-500 truncate">{t.userStatus.connected}</p>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => setLang('fr')} className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors font-heading ${lang === 'fr' ? 'bg-white text-black' : 'text-gray-600 hover:text-white'}`}>FR</button>
                                <button onClick={() => setLang('en')} className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors font-heading ${lang === 'en' ? 'bg-white text-black' : 'text-gray-600 hover:text-white'}`}>EN</button>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-md transition-colors font-heading border border-transparent hover:border-red-500/10">
                            <FeatherIcon name="log-out" size={12} />
                            {t.logout}
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTENT - Fixed Background Coverage */}
                <main className={`flex-1 lg:ml-64 ml-0 min-w-0 bg-[#050505] relative min-h-screen z-0 transition-all duration-300`}>
                    {/* Top Bar */}
                    <header className="h-20 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 transition-all duration-200">
                        <div className="flex items-center gap-3">
                            {/* Mobile Menu Button */}
                            <button 
                                onClick={() => setIsMobileMenuOpen(true)} 
                                className="lg:hidden p-2 mr-2 text-gray-400 hover:text-white bg-white/5 rounded-lg"
                            >
                                <FeatherIcon name="list" size={20} />
                            </button>

                            <div className={`p-2 rounded-md bg-white/5 ${currentTheme.icon}`}>
                                <FeatherIcon name={
                                    activeTab === 'dashboard' ? 'pie-chart' : 
                                    activeTab === 'sections' ? 'layout' :
                                    activeTab === 'courses' ? 'grid' : 
                                    activeTab === 'pricing' ? 'dollar-sign' : 
                                    activeTab === 'media' ? 'image' :
                                    activeTab === 'trash' ? 'trash-2' :
                                    activeTab === 'config' ? 'sliders' : 'hash'
                                } size={18} />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-white uppercase tracking-wide font-heading leading-none">
                                    {activeTab === 'dashboard' ? t.dashboard : 
                                    activeTab === 'sections' ? t.sections :
                                    activeTab === 'courses' ? t.courses : t[activeTab]}
                                </h2>
                                <span className="text-[10px] text-gray-500 font-medium">{t.headerSubtitle}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving} 
                                className={`group relative flex items-center gap-2 bg-gradient-to-b ${currentTheme.saveBtn} text-white font-bold py-2.5 px-6 rounded-xl border transition-all duration-300 font-heading text-xs uppercase tracking-wide`}
                            >
                                {isSaving ? <FeatherIcon name="loader" size={14} className="animate-spin"/> : <FeatherIcon name="save" size={14}/>}
                                <span className="hidden sm:inline">{isSaving ? t.saving : t.saveChanges}</span>
                            </button>
                        </div>
                    </header>

                    {/* Content Area - Conditional Padding for Immersive Views */}
                    <div className={`w-full max-w-7xl mx-auto animate-fadeIn flex flex-col bg-[#050505] min-h-[calc(100vh-5rem)] ${isFullPageTab ? 'p-0' : 'p-4 sm:p-8 pb-20'}`}>
                        {activeTab === 'dashboard' && <DashboardHome />}
                        {activeTab === 'config' && <SiteConfigEditor config={siteData.config} onChange={val => handleDataChange('config', val)} theme={theme} t={t} inputClass={adminInputStyles} confirmAction={confirmAction}/>}
                        {activeTab === 'sections' && <HomepageSectionsEditor sections={siteData.homepageSections} allCourses={siteData.coursesData} onChange={val => handleDataChange('homepageSections', val)} theme={theme} onManageCourses={handleOpenSectionManager} t={t} onEditCourse={onOpenCourseEditor} />}
                        
                        {activeTab === 'courses' && <CoursesEditor courses={siteData.coursesData.filter(c => !c.deletedAt)} allCategories={siteData.softwarePillsData.filter((p): p is SoftwarePill => 'category' in p) as SoftwarePill[]} onChange={val => handleDataChange('coursesData', val)} onEditCourse={onOpenCourseEditor} theme={theme} t={t} inputClass={adminInputStyles} onDelete={handleSoftDelete} />}
                        
                        {activeTab === 'pricing' && <PricingEditor tiers={siteData.pricingTiers} onChange={val => handleDataChange('pricingTiers', val)} theme={theme} t={t} inputClass={adminInputStyles} textareaClass={adminTextareaStyles} />}
                        {activeTab === 'pills' && <PillsEditor pills={siteData.softwarePillsData} onChange={val => handleDataChange('softwarePillsData', val)} theme={theme} onManageCourses={handleOpenCategoryManager} t={t} onLog={onLog} />}
                        {activeTab === 'testimonials' && <TestimonialsEditor testimonials={siteData.testimonials} onChange={val => handleDataChange('testimonials', val)} theme={theme} t={t} inputClass={adminInputStyles} textareaClass={adminTextareaStyles} confirmAction={confirmAction} notify={notify} onRefresh={onRefresh} config={siteData.config} onLog={onLog} />}
                        {activeTab === 'faq' && <FaqEditor faqItems={siteData.faqData} onChange={val => handleDataChange('faqData', val)} theme={theme} t={t} inputClass={adminInputStyles} textareaClass={adminTextareaStyles} confirmAction={confirmAction} />}
                        
                        {activeTab === 'media' && <MediaLibrary files={siteData.mediaLibrary || []} onUpdate={(files) => handleMediaUpdate(files)} theme={theme} confirmAction={confirmAction} notify={notify} onLog={onLog} t={t} />}
                        {activeTab === 'trash' && <TrashBin deletedCourses={siteData.coursesData.filter(c => c.deletedAt)} onRestore={handleRestore} onPermanentDelete={handlePermanentDelete} theme={theme} confirmAction={confirmAction} notify={notify} t={t} />}
                        {activeTab === 'logs' && <AuditLogs logs={siteData.auditLogs || []} lang={lang} t={t} />}
                    </div>
                </main>
            </div>
            
            {/* Modals */}
            {isCategoryManagerOpen && editingCategory && (
              <CategoryCourseManagerModal
                isOpen={isCategoryManagerOpen}
                onClose={() => setIsCategoryManagerOpen(false)}
                category={editingCategory}
                allCourses={siteData.coursesData.filter(c => !c.deletedAt)}
                categoryCourseLinks={siteData.categoryCourseLinks[editingCategory.category] || []}
                onSave={handleCategoryCoursesSave}
                onUpdateCategoryConfig={handleUpdateCategoryConfig}
                onEditCourse={onOpenCourseEditor}
                theme={theme}
                t={t}
                onLog={onLog}
              />
            )}
             {isSectionManagerOpen && editingSection && (
                <SectionCourseManagerModal 
                    isOpen={isSectionManagerOpen}
                    onClose={() => setIsSectionManagerOpen(false)}
                    section={editingSection}
                    allCourses={siteData.coursesData.filter(c => !c.deletedAt)}
                    allCategories={siteData.softwarePillsData.filter((p): p is SoftwarePill => 'category' in p)}
                    onSave={handleSectionCoursesSave}
                    onEditCourse={onOpenCourseEditor}
                    theme={theme}
                    t={t}
                    onLog={onLog}
                />
            )}

            <ConfirmationModal 
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                description={confirmState.description}
                onConfirm={confirmState.onConfirm}
                onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                isDanger={confirmState.isDanger}
                singleButton={confirmState.singleButton}
            />
             
             {/* Unified Global Toast */}
             <div className={`fixed bottom-8 right-8 bg-[#0a0d0c] text-white py-3 px-6 rounded-xl transform transition-all duration-500 ease-out flex items-center gap-3 z-50 border backdrop-blur-xl ${notification.show ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'} ${
                 notification.type === 'save' ? currentTheme.toastBorder : 
                 notification.type === 'error' ? 'border-red-500/30 shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]' :
                 notification.type === 'info' ? 'border-blue-500/30 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]' :
                 notification.type === 'upload' ? 'border-purple-500/30 shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]' :
                 'border-green-500/30 shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)]'
             }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                    notification.type === 'save' ? currentTheme.indicator :
                    notification.type === 'error' ? 'bg-red-500' :
                    notification.type === 'info' ? 'bg-blue-500' :
                    notification.type === 'upload' ? 'bg-purple-500' :
                    'bg-green-500'
                }`}></div>
                <span className="font-bold text-sm tracking-wide font-heading">{notification.message}</span>
                <FeatherIcon name={
                    notification.type === 'error' ? 'alert-triangle' : 
                    notification.type === 'info' ? 'info' : 
                    notification.type === 'upload' ? 'check' :
                    'check'
                } size={16} className={
                    notification.type === 'save' ? currentTheme.icon :
                    notification.type === 'error' ? 'text-red-500' :
                    notification.type === 'info' ? 'text-blue-500' :
                    notification.type === 'upload' ? 'text-purple-500' :
                    'text-green-500'
                } />
            </div>
        </>
    );
};

export default AdminPage;
