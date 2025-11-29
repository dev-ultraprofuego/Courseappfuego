
// Central source of truth for the Theme type.
export type Theme = 'iris' | 'pristine' | 'boss';

// --- Core Data Structures ---

export interface NavLink {
  href: string;
  title: string;
  icon: string;
  iconType?: 'feather' | 'img' | 'text';
  categoryKey?: string;
  sectionId?: string;
}

export interface NavDropdown {
  title: string;
  columns: number;
  links: NavLink[];
}

export interface NavData {
  premium: { href: string; title: string; categoryKey?: string; sectionId?: string; };
  courses: NavDropdown;
  platforms: NavDropdown;
  design: NavDropdown;
  video: NavDropdown;
  theme: NavDropdown;
}

export interface Attachment {
    id: string;
    name: string;
    type: 'file' | 'link';
    url: string;
    size?: string;
}

export interface Course {
  id: number;
  title: string;
  slug?: string; // SEO Friendly URL
  status: 'published' | 'draft' | 'archived';
  date: string;
  categories: string[];
  img: string;
  description?: string;
  content?: string;
  externalLink?: string; // Default external link
  attachments?: Attachment[]; // Class resources
  deletedAt?: string | null; // Soft delete timestamp
  
  // SEO Fields
  seoTitle?: string;
  seoDescription?: string;
  
  // Advanced SEO (New Billgang Style)
  seoIndex?: boolean;      // true = index, false = noindex
  seoCanonical?: string;   // URL Canonique
  seoSchema?: boolean;     // Activer JSON-LD
}

export interface CourseContextLink {
    courseId: number;
    linkBehavior: 'detail' | 'external';
    showBuyButton: boolean;
    overrideExternalLink?: string; // Context-specific external link
    overrideBuyLink?: string; // Context-specific buy link
    overrideBuyButtonText?: string; // Context-specific buy button text
    subSection?: string; // For primary labels like "Single Purchase"
    contextKeywords?: string[]; // Context-specific keywords (category keys)
}

export interface HomepageSection {
  id: string;
  title: string;
  link: {
    type: 'section' | 'external';
    value: string;
  };
  courses: CourseContextLink[];
  autoAdd?: boolean; // New: Enable auto-adding of courses
  autoAddTag?: string; // New: Tag to watch for auto-adding
}

export interface Testimonial {
  id?: string;
  author: string;
  text: string;
  stars: number;
  status?: 'pending' | 'published'; // Status for review workflow
  source?: 'external' | 'manual'; // Origin of the review
  date?: string; // Date of submission or creation
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface SoftwarePill {
  href: string;
  category: string;
  icon: string;
  iconType: 'img' | 'text' | 'feather';
  name: string;
  count: string; // This is static text, dynamic count is calculated separately
  linkType: 'category' | 'external' | 'course';
  externalUrl?: string;
  courseId?: number;
  autoAdd?: boolean; // New: Enable auto-adding of courses
}

export interface Separator {
  type: 'separator';
  text: string;
}

export type PillItem = SoftwarePill | Separator;


// --- Dynamic Site Configuration (for Admin) ---

export interface HeroCtaConfig {
  action: 'internal' | 'external';
  externalUrl: string;
  ctaText: string;
}

export interface SiteConfig {
  heroBadgeText: string;
  heroCta: HeroCtaConfig;
  showCommunityLink: boolean;
  communityLinkText: string;
  communityLinkUrl: string;
  dmcaLinkText: string;
  dmcaLinkUrl: string;
  dmcaTitle: string;
  dmcaContent: string;
  themeNameIris: string;
  themeNamePristine: string;
  themeNameBoss: string;
  contactLinkUrl: string;
  defaultBuyButtonText: string;
  
  // --- NEW: SEO & SYSTEM FIELDS ---
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string; // OG Image URL
  logoUrl?: string; // Header Logo URL
  favicon?: string; // Favicon URL
  headerScripts?: string; // For Google Analytics, etc.
  bodyScripts?: string; // For Chat widgets, etc.
  maintenanceMode?: boolean;
  maintenanceMessage?: string; // Custom message for maintenance screen
  
  // --- UI Toggles ---
  showTypingAnimation?: boolean; // Show 3 dots animation on review page
  showLogIndicators?: boolean; // Show green/colored dots in admin lists
}

export interface PricingPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  priceDetails: string;
  features: string[];
  isPopular: boolean;
  ctaText: string;
  ctaUrl: string;
  finePrint: string;
}

export interface PricingTier {
  id: 'fr' | 'us';
  name: string;
  plans: PricingPlan[];
}

// --- Analytics & System Data Structure ---
export interface SiteStats {
    totalViews: number;
    dailyViews: Record<string, number>; // Date string YYYY-MM-DD -> count
}

export interface MediaFile {
    id: string;
    url: string;
    name: string;
    type: 'image' | 'file';
    date: string;
}

export interface AuditLog {
    id: string;
    action: string;
    details: string;
    timestamp: string;
    user: string;
}

export interface ReviewToken {
    token: string;
    createdAt: string;
}

// --- Master Data Object for the entire site ---

export interface SiteData {
  config: SiteConfig;
  coursesData: Course[];
  testimonials: Testimonial[];
  faqData: FaqItem[];
  softwarePillsData: PillItem[];
  pricingTiers: PricingTier[];
  homepageSections: HomepageSection[];
  categoryCourseLinks: Record<string, CourseContextLink[]>;
  stats?: SiteStats; 
  mediaLibrary?: MediaFile[]; // New Media Library
  auditLogs?: AuditLog[]; // New Audit Logs
  reviewTokens?: ReviewToken[]; // Secure tokens for reviews
}

// --- Component Props ---

export type View = 
  | { page: 'home' } 
  | { page: 'category', category: string } 
  | { page: 'course', courseId: number, showBuyButton: boolean, buyLink?: string, buyButtonText?: string } 
  | { page: 'pricing' } 
  | { page: 'admin' }
  | { page: 'dmca' }
  | { page: 'section', sectionId: string };

// Fix: Removed NavigationProps as it's a legacy from a pre-Next.js implementation
export interface HeaderProps {
    onSearchOpen: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    config: SiteConfig;
}

// Fix: Removed NavigationProps as it's a legacy from a pre-Next.js implementation
export interface HeroProps {
    theme: Theme;
    config: SiteConfig;
}

// Fix: Removed NavigationProps as it's a legacy from a pre-Next.js implementation
export interface SoftwarePillsProps {
    theme: Theme;
    pills: PillItem[];
    courses: Course[];
    categoryCourseLinks?: Record<string, CourseContextLink[]>;
}

// Fix: Removed NavigationProps as it's a legacy from a pre-Next.js implementation
export interface HomePageProps {
    data: SiteData;
    theme: Theme;
}

// Fix: Removed NavigationProps as it's a legacy from a pre-Next.js implementation
export interface CategoryPageProps {
    category: string;
    allCourses: Course[];
    pills: PillItem[];
    categoryCourseLinks: Record<string, CourseContextLink[]>;
    theme: Theme;
    config: SiteConfig;
}

// Fix: Removed NavigationProps as it's a legacy from a pre-Next.js implementation
export interface CourseDetailPageProps {
    course: Course;
    theme: Theme;
    allCourses: Course[];
    showBuyButton: boolean;
    buyLink?: string;
    buyButtonText?: string;
    config: SiteConfig;
    pills: PillItem[];
}

export interface PricingPageProps {
    theme: Theme;
    tiers: PricingTier[];
}

// Fix: Removed NavigationProps as it's a legacy from a pre-Next.js implementation
export interface SectionPageProps {
    sectionId: string;
    allCourses: Course[];
    homepageSections: HomepageSection[];
    theme: Theme;
    config: SiteConfig;
}

// Fix: Removed NavigationProps as it's a legacy from a pre-Next.js implementation
export interface CourseCarouselProps {
    section: HomepageSection;
    allCourses: Course[];
    pills: PillItem[];
    theme: Theme;
    config: SiteConfig;
}

// Fix: Removed NavigationProps as it's a legacy from a pre-Next.js implementation
export interface CourseCardProps {
    course: Course;
    theme: Theme;
    linkBehavior: 'detail' | 'external';
    linkUrl: string;
    showBuyButton: boolean;
    buyLink?: string;
    buyButtonText?: string;
    subSection?: string;
    contextKeywords?: string[];
}

// Fix: Removed NavigationProps as it's a legacy from a pre-Next.js implementation
export interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    theme: Theme;
    courses: Course[];
    config: SiteConfig;
}

export interface FAQProps {
  theme: Theme;
  faqItems: FaqItem[];
}

export interface WallofLoveProps {
  theme: Theme;
  testimonials: Testimonial[];
}

// --- Admin Panel Specific Props ---
export interface AdminPageProps {
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
}

export interface LoginScreenProps {
  onLoginSuccess: () => void;
  theme: Theme;
}

export interface CourseEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course | null; // null for adding a new course
    onSave: (course: Course) => void;
    theme: Theme;
    allCategories: SoftwarePill[];
}

export interface ReorderPayload {
  dragIndex: number;
  hoverIndex: number;
}

export interface CategoryCourseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: SoftwarePill;
  allCourses: Course[];
  categoryCourseLinks: CourseContextLink[];
  onSave: (categoryId: string, updatedLinks: CourseContextLink[]) => void;
  onUpdateCategoryConfig: (categoryId: string, config: { autoAdd: boolean }) => void;
  onEditCourse: (course: Course | null) => void; // Allow null
  theme: Theme;
}

export interface SectionCourseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: HomepageSection;
  allCourses: Course[];
  allCategories: SoftwarePill[];
  onSave: (updatedSection: HomepageSection) => void;
  onEditCourse: (course: Course | null) => void; // Allow null
  theme: Theme;
}
