
import { supabase } from '../supabaseClient';
import { coursesData as defaultCourses, testimonials as defaultTestimonials, faqData as defaultFaq, softwarePillsData as defaultPills } from './data';
import type { SiteData, SiteConfig, PricingTier, Testimonial, SoftwarePill, PillItem, HomepageSection, Course, CourseContextLink } from '../types';
import { unstable_noStore as noStore } from 'next/cache';

const SITE_DATA_DOC_ID = 'main';

const getDefaultConfig = (): SiteConfig => ({
    heroBadgeText: 'Stop Wasting Time Searching For Courses',
    heroCta: {
        action: 'internal',
        externalUrl: 'https://example.com',
        ctaText: 'Unlock All Courses',
    },
    showCommunityLink: true,
    communityLinkText: 'Join our Telegram Community',
    communityLinkUrl: 'https://t.me/content_community',
    dmcaLinkText: 'DMCA',
    dmcaLinkUrl: '/dmca',
    dmcaTitle: 'DMCA Policy',
    dmcaContent: `<p>This page is pending content.</p><p>The site administrator will configure the content for this section soon. Please check back later.</p>`,
    themeNameIris: 'Iris',
    themeNamePristine: 'Pristine',
    themeNameBoss: 'Boss',
    contactLinkUrl: 'mailto:your-anonymous-email@pm.me',
    defaultBuyButtonText: "COMMANDER CE COURS MAINTENANT",
    
    // Defaults for new System/SEO fields
    seoTitle: 'Content. - Course Hub',
    seoDescription: 'A modern platform showcasing courses for digital creatives.',
    seoImage: '',
    logoUrl: '',
    favicon: '',
    headerScripts: '',
    bodyScripts: '',
    maintenanceMode: false,
    maintenanceMessage: "Nous mettons à jour la plateforme pour vous offrir une meilleure expérience. Nous serons de retour très vite.",
});

const getDefaultHomepageSections = (): HomepageSection[] => [
    { id: 'commander', title: 'COMMANDER', link: { type: 'section', value: 'commander' }, courses: [
        { courseId: 1, linkBehavior: 'detail', showBuyButton: true, subSection: 'Single Purchase', contextKeywords: ['ecommerce', 'business'] },
        { courseId: 2, linkBehavior: 'detail', showBuyButton: true, subSection: 'Single Purchase', contextKeywords: ['editing', 'smma'] },
        { courseId: 3, linkBehavior: 'detail', showBuyButton: true, subSection: 'Single Purchase', contextKeywords: ['after-effects'] },
        { courseId: 4, linkBehavior: 'detail', showBuyButton: true, subSection: 'Single Purchase', contextKeywords: ['editing'] },
        { courseId: 25, linkBehavior: 'detail', showBuyButton: true, subSection: 'Single Purchase', contextKeywords: ['editing'] },
        { courseId: 26, linkBehavior: 'detail', showBuyButton: true, subSection: 'Single Purchase', contextKeywords: ['editing', 'marketing'] }
    ]},
    { id: 'cours', title: 'COURS', link: { type: 'section', value: 'cours' }, courses: [
        { courseId: 5, linkBehavior: 'detail', showBuyButton: false, subSection: 'Premium', contextKeywords: ['blender'] },
        { courseId: 6, linkBehavior: 'detail', showBuyButton: false, subSection: 'Premium', contextKeywords: ['ux-ui'] },
        { courseId: 7, linkBehavior: 'detail', showBuyButton: false, subSection: 'Premium', contextKeywords: ['after-effects'] },
        { courseId: 27, linkBehavior: 'detail', showBuyButton: false, subSection: 'Premium', contextKeywords: ['editing'] },
        { courseId: 28, linkBehavior: 'detail', showBuyButton: false, subSection: 'Premium', contextKeywords: ['ux-ui'] },
        { courseId: 105, linkBehavior: 'detail', showBuyButton: false, subSection: 'Premium', contextKeywords: ['blender'] },
        { courseId: 115, linkBehavior: 'detail', showBuyButton: false, subSection: 'Premium', contextKeywords: ['blender'] },
        { courseId: 116, linkBehavior: 'detail', showBuyButton: false, subSection: 'Premium', contextKeywords: ['blender'] }
    ]},
    { id: 'post_recents', title: 'POST RECENTS', link: { type: 'section', value: 'post_recents' }, courses: [
        { courseId: 1, linkBehavior: 'detail', showBuyButton: false, subSection: 'Post' },
        { courseId: 2, linkBehavior: 'detail', showBuyButton: false, subSection: 'Post' },
        { courseId: 3, linkBehavior: 'detail', showBuyButton: false, subSection: 'Post' },
        { courseId: 4, linkBehavior: 'detail', showBuyButton: false, subSection: 'Post' },
        { courseId: 5, linkBehavior: 'detail', showBuyButton: false, subSection: 'Post' },
        { courseId: 6, linkBehavior: 'detail', showBuyButton: false, subSection: 'Post' },
        { courseId: 7, linkBehavior: 'detail', showBuyButton: false, subSection: 'Post' },
        { courseId: 8, linkBehavior: 'detail', showBuyButton: false, subSection: 'Post' }
    ]},
    { id: 'design_us', title: 'DESIGN US & COURS US', link: { type: 'section', value: 'design_us' }, courses: [
        { courseId: 100, linkBehavior: 'detail', showBuyButton: false, subSection: 'Design US', contextKeywords: ['blender'] },
        { courseId: 101, linkBehavior: 'detail', showBuyButton: false, subSection: 'Design US', contextKeywords: ['blender'] },
        { courseId: 102, linkBehavior: 'detail', showBuyButton: false, subSection: 'Design US', contextKeywords: ['blender'] },
        { courseId: 103, linkBehavior: 'detail', showBuyButton: false, subSection: 'Design US', contextKeywords: ['blender', 'after-effects'] },
        { courseId: 104, linkBehavior: 'detail', showBuyButton: false, subSection: 'Design US', contextKeywords: ['blender'] },
        { courseId: 105, linkBehavior: 'detail', showBuyButton: false, subSection: 'Design US', contextKeywords: ['blender', 'premium'] },
        { courseId: 106, linkBehavior: 'detail', showBuyButton: false, subSection: 'Design US', contextKeywords: ['blender'] },
        { courseId: 107, linkBehavior: 'detail', showBuyButton: false, subSection: 'Design US', contextKeywords: ['blender'] }
    ]},
    { id: 'graphic_design', title: 'GRAPHIC DESIGN / UX UI', link: { type: 'section', value: 'graphic_design' }, courses: [
        { courseId: 8, linkBehavior: 'detail', showBuyButton: false, contextKeywords: ['ux-ui', 'photoshop'] },
        { courseId: 9, linkBehavior: 'detail', showBuyButton: false, contextKeywords: ['ux-ui'] },
        { courseId: 10, linkBehavior: 'detail', showBuyButton: false, contextKeywords: ['ux-ui'] },
        { courseId: 11, linkBehavior: 'detail', showBuyButton: false, contextKeywords: ['photoshop'] },
        { courseId: 12, linkBehavior: 'detail', showBuyButton: false, contextKeywords: ['photoshop'] }
    ]},
    { id: 'ressources_video', title: 'RESSOURCES VIDEO', link: { type: 'section', value: 'ressources_video' }, courses: [
        { courseId: 17, linkBehavior: 'detail', showBuyButton: false, contextKeywords: ['editing'] },
        { courseId: 18, linkBehavior: 'detail', showBuyButton: false, contextKeywords: ['editing'] },
        { courseId: 19, linkBehavior: 'detail', showBuyButton: false, contextKeywords: ['editing'] },
        { courseId: 20, linkBehavior: 'detail', showBuyButton: false, contextKeywords: ['editing'] }
    ]},
    { id: 'patreon', title: 'PATREON', link: { type: 'section', value: 'patreon' }, courses: [
        { courseId: 21, linkBehavior: 'detail', showBuyButton: false, contextKeywords: ['patreon'] },
        { courseId: 22, linkBehavior: 'detail', showBuyButton: false, contextKeywords: ['patreon'] },
        { courseId: 23, linkBehavior: 'detail', showBuyButton: false, contextKeywords: ['patreon', 'photoshop'] },
        { courseId: 24, linkBehavior: 'detail', showBuyButton: false, contextKeywords: ['patreon', 'blender'] }
    ]},
];

const getDefaultPricingTiers = (): PricingTier[] => [
    {
        id: 'fr',
        name: 'Content. VIP Fr',
        plans: [
            { id: 'fr_starter', name: 'Starter Plan', duration: '30 Days Access', price: 10, priceDetails: '≈ $0.33/day', features: ['Unlimited access to all assets', '3 Premium Courses requests', 'Ui8', 'Freepik', 'Artlist.io', 'Envato', 'Motion Array', 'Mockupcloud.com'], isPopular: false, ctaText: 'Get Started', ctaUrl: 'https://t.me/content_bot?start=start', finePrint: 'Cancel anytime • Instant access' },
            { id: 'fr_pro', name: 'Pro Plan', duration: '60 Days Access', price: 29, priceDetails: 'Just $0.4/day • Save 40%', features: ['Unlimited access to all assets', '5 Premium Courses requests', 'Ui8', 'Freepik', 'Artlist.io', 'Envato', 'Motion Array', 'Mockupcloud.com'], isPopular: true, ctaText: 'Unlock Pro Now', ctaUrl: 'https://t.me/content_bot?start=start', finePrint: 'Most Popular • Risk-free guarantee' },
            { id: 'fr_premium', name: 'Premium Plan', duration: '90 Days Access', price: 59, priceDetails: 'Just $0.6/day • Save 60%', features: ['Unlimited access to all assets', '10 Premium Courses requests', 'Ui8', 'Freepik', 'Artlist.io', 'Envato', 'Motion Array', 'Mockupcloud.com'], isPopular: false, ctaText: 'Go Premium', ctaUrl: 'https.me/content_bot?start=start', finePrint: 'Full power • Priority support' },
        ]
    },
    {
        id: 'us',
        name: 'Content. VIP Us',
        plans: [
             { id: 'us_starter', name: 'Starter Plan', duration: '1 Month Access', price: 38, priceDetails: '≈ $1.2/day', features: ['Everything in Content.org included', 'All programs except Substance', 'Quick connection to your email', '85GB Cloud Storage', 'Supports 2 Devices'], isPopular: false, ctaText: 'Get Started', ctaUrl: '#', finePrint: 'Cancel anytime • Instant access' },
             { id: 'us_pro', name: 'Pro Plan', duration: '3 Months Access', price: 57, priceDetails: 'Just $0.62/day • Save 50%', features: ['Everything in Content.org included', 'All programs except Substance', 'Quick connection to your email', '85GB Cloud Storage', 'Supports 2 Devices'], isPopular: true, ctaText: 'Unlock Pro Now', ctaUrl: '#', finePrint: 'Most Popular • Risk-free' },
             { id: 'us_premium', name: 'Premium Plan', duration: '6 Months Access', price: 97, priceDetails: 'Best Value ($0.5/day) • Save 60%', features: ['Everything in Content.org included', 'All programs except Substance', 'Quick connection to your email', '85GB Cloud Storage', 'Supports 2 Devices'], isPopular: false, ctaText: 'Go Premium', ctaUrl: '#', finePrint: 'Full power • Priority support' },
        ]
    }
];

const testimonialsWithStars: Testimonial[] = defaultTestimonials.map(t => ({ ...t, stars: 5 }));

const getDefaultSiteData = (): SiteData => {
    const defaultData = {
        config: getDefaultConfig(),
        coursesData: defaultCourses.map(c => ({ ...c, status: 'published' as const })), // Migrate status
        testimonials: testimonialsWithStars,
        faqData: defaultFaq,
        softwarePillsData: defaultPills as PillItem[],
        pricingTiers: getDefaultPricingTiers(),
        homepageSections: getDefaultHomepageSections(),
        categoryCourseLinks: {} as Record<string, CourseContextLink[]>,
        stats: { totalViews: 0, dailyViews: {} },
        mediaLibrary: [],
        auditLogs: []
    };

    const categories = (defaultPills.filter(p => 'category' in p) as SoftwarePill[]).map(p => p.category);
    categories.forEach(cat => {
        defaultData.categoryCourseLinks[cat] = defaultCourses
            .filter(c => c.categories.some(courseCat => courseCat.toLowerCase().replace(/\s+/g, '-') === cat))
            .map(c => ({ courseId: c.id, linkBehavior: 'detail', showBuyButton: true }));
    });
    
    return defaultData;
};

// Robust deep merge utility
const isObject = (item: any) => (item && typeof item === 'object' && !Array.isArray(item));

const deepMerge = <T extends object>(target: T, ...sources: Partial<T>[]): T => {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            const sourceKey = key as keyof T;
            if (isObject(source[sourceKey])) {
                if (!target[sourceKey] || !isObject(target[sourceKey])) {
                    Object.assign(target, { [key]: {} });
                }
                deepMerge(target[sourceKey] as object, source[sourceKey] as object);
            } else {
                 Object.assign(target, { [key]: source[sourceKey] });
            }
        }
    }
    return deepMerge(target, ...sources);
};


// --- API Functions ---

export const getSiteData = async (): Promise<SiteData> => {
    noStore(); // Opt out of data caching
    const defaultData = getDefaultSiteData();
    
    try {
        const { data: fetched, error } = await supabase
            .from('site_data')
            .select('data')
            .eq('id', SITE_DATA_DOC_ID)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching site data from Supabase:', error.message, error);
            return defaultData; // Return default data if there's a real error
        }

        if (fetched && fetched.data) {
            console.log("Document data from Supabase:", fetched.data);
            const savedData = fetched.data as Partial<SiteData>;
            
            // Merge strategy to safely add new default content without overwriting user changes
            const savedCourseIds = new Set((savedData.coursesData || []).map((c: Course) => c.id));
            const newCourses = defaultData.coursesData.filter(c => !savedCourseIds.has(c.id));

            const savedPillCategories = new Set(((savedData.softwarePillsData || []).filter((p: PillItem): p is SoftwarePill => 'category' in p)).map((p: SoftwarePill) => p.category));
            const newPills = defaultData.softwarePillsData.filter(p => 'category' in p && !savedPillCategories.has((p as SoftwarePill).category));

            const savedSectionIds = new Set((savedData.homepageSections || []).map((s: HomepageSection) => s.id));
            const newSections = defaultData.homepageSections.filter(s => !savedSectionIds.has(s.id));
            
            const mergedConfig = deepMerge({ ...defaultData.config }, savedData.config || {});

            // Ensure new collections exist
            const stats = savedData.stats || { totalViews: 0, dailyViews: {} };
            const mediaLibrary = savedData.mediaLibrary || [];
            const auditLogs = savedData.auditLogs || [];

            const migratedData: SiteData = {
                ...defaultData,
                ...savedData,
                config: mergedConfig,
                coursesData: [...(savedData.coursesData || []), ...newCourses],
                softwarePillsData: [...(savedData.softwarePillsData || []), ...newPills],
                homepageSections: [...(savedData.homepageSections || []), ...newSections],
                categoryCourseLinks: { ...defaultData.categoryCourseLinks, ...(savedData.categoryCourseLinks || {}) },
                stats,
                mediaLibrary,
                auditLogs
            };
            
            return migratedData;
        } else {
            // Doc doesn't exist, so initialize it with default data.
            console.log("No data found in Supabase! Initializing with default data.");
            const { error: insertError } = await supabase
                .from('site_data')
                .insert({ id: SITE_DATA_DOC_ID, data: defaultData });

            if (insertError) {
                console.error("Failed to initialize data in Supabase:", insertError);
            }
            return defaultData;
        }
    } catch (e) {
        console.error("An unexpected error occurred while communicating with Supabase:", e);
        return defaultData;
    }
};
