
export interface Category {
  id: string;
  name: string;
}

export type ProductType = 'simple_batch' | 'fixed_kit' | 'variable_kit';

export interface PricingTier {
  qty: number;
  price: number;
}

export interface KitFixoItem {
  productName: string;
  size: string;
}

export interface KitVariavelItem {
  title: string;
  size: string;
  printType: string;
  paper: string;
  finishing: string;
  image?: string;
}

export interface Product {
  id: string;
  type: ProductType;
  categoryId: string;
  title: string;
  description: string;
  imageUrl: string;
  productionTime?: string;
  additionalImages?: string[];
  
  // Tag & Kit Fixo specific
  size?: string;
  printType?: string;
  paper?: string;
  finishing?: string;
  pricingGrid?: PricingTier[];
  
  // Kit Fixo specific
  items?: KitFixoItem[];
  
  // Kit Variavel specific
  basePrice?: number;
  variableItems?: KitVariavelItem[];

  // Legacy compatibility
  paperTypes?: string[];
  weights?: string[];
  colors?: string[];
  finishes?: string[];
  salesPrice?: number;
}

export type LeadStatus = 'Pendente' | 'Novo' | 'Em Atendimento' | 'Finalizado' | 'Cancelado';

export interface Lead {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  productInterest?: string;
  configSummary?: string;
  value?: number; // Added for BI Revenue calculation
  status: LeadStatus;
  createdAt: string;
}

export interface PageContent {
  slug: string;
  title: string;
  content: string; // HTML string
}

export type ScriptLocation = 'head' | 'body-top' | 'body-bottom';

export interface CustomScript {
  id: string;
  name: string;
  code: string;
  location: ScriptLocation;
  active: boolean; // New: Toggle execution without deleting
}

export interface FeatureCard {
  icon: string; // Emoji or short text
  title: string;
  description: string;
}

export interface JourneyStep {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface SiteSettings {
  bannerTitle: string;
  bannerSubtitle: string;
  bannerImageUrl: string;
  logoUrl?: string;
  logoType?: 'image' | 'text';
  logoText?: string;
  headerBackgroundColor?: string;
  primaryColor?: string; // Theming
  secondaryColor?: string; // Theming
  journeyHighlightColor?: string; // New: Color for the timeline line
  journeySteps: JourneyStep[]; // New: The 4 steps of the process
  metaTitle?: string; // SEO
  metaDescription?: string; // SEO
  contactPhone: string;
  contactEmail: string;
  contactFormContent?: string; // Editable sidebar content
  featureCards: FeatureCard[]; // Home feature cards
  companyName: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string; // Social
  pinterestUrl: string; // Social
  scripts: CustomScript[]; // Unlimited integrations
}

export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  PRODUCT_VIEW = 'product_view',
  CLICK = 'click',
  CATALOG_ACCESS = 'catalog_access',
  WHATSAPP_CLICK = 'whatsapp_click'
}

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: string;
  path: string;
  visitorId: string;
  metadata?: {
    productId?: string;
    productTitle?: string;
    buttonName?: string;
    label?: string;
    [key: string]: any;
  };
}
