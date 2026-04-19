import { Injectable, signal, effect } from '@angular/core';
import { Product, Lead, PageContent, SiteSettings, LeadStatus, Category, FeatureCard, JourneyStep, AnalyticsEvent } from '../models/types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private supabase: SupabaseClient;

  // Signals for state
  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  leads = signal<Lead[]>([]);
  pages = signal<PageContent[]>([]);
  settings = signal<SiteSettings>({
    bannerTitle: 'A Gráfica Online do Pequeno Empreendedor',
    bannerSubtitle: 'Tags, adesivos, sacolas e lacres personalizados para valorizar sua marca. Entregamos em todo o Brasil',
    bannerImageUrl: 'https://picsum.photos/1200/600?grayscale',
    metaTitle: 'Studio Grafthi | Gráfica Online para Pequenos Empreendedores',
    metaDescription: 'Papelaria profissional em pequenas quantidades',
    contactPhone: '5511999999999',
    contactEmail: 'contato@studiografthi.com',
    companyName: 'Studio Grafthi',
    instagramUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
    pinterestUrl: '',
    featureCards: [],
    journeySteps: [],
    scripts: []
  });
  events = signal<AnalyticsEvent[]>([]);

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.key);
    this.loadFromSupabase();
  }

  // Initial load of all necessary data
  private async loadFromSupabase() {
    await Promise.all([
      this.fetchCategories(),
      this.fetchProducts(),
      this.fetchLeads(),
      this.fetchPages(),
      this.fetchSettings()
    ]);
  }

  // --- Categories ---
  async fetchCategories() {
    const { data, error } = await this.supabase.from('categories').select('*').order('created_at', { ascending: true });
    if (!error && data) this.categories.set(data as Category[]);
  }

  async addCategory(category: Category) {
    const { data, error } = await this.supabase.from('categories').insert([{ name: category.name }]).select();
    if (!error && data) {
      this.categories.update(list => [...list, data[0] as Category]);
    } else {
      console.error('Error adding category', error);
    }
  }

  async updateCategory(category: Category) {
    const { error } = await this.supabase.from('categories').update({ name: category.name }).eq('id', category.id);
    if (!error) {
      this.categories.update(list => list.map(c => c.id === category.id ? category : c));
    }
  }

  async deleteCategory(id: string) {
    const { error } = await this.supabase.from('categories').delete().eq('id', id);
    if (!error) {
      this.categories.update(list => list.filter(c => c.id !== id));
    }
  }

  // --- Products ---
  async fetchProducts() {
    const { data, error } = await this.supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      // Map back snake_case to camelCase
      const mapped = data.map((p: any) => ({
        id: p.id,
        type: p.type,
        categoryId: p.categoryId,
        title: p.title,
        description: p.description,
        imageUrl: p.imageUrl,
        productionTime: p.productionTime,
        size: p.size,
        printType: p.printType,
        paper: p.paper,
        finishing: p.finishing,
        basePrice: p.basePrice ? Number(p.basePrice) : 0,
        pricingGrid: (p.pricingGrid || []).map((t: any) => ({ qty: Number(t.qty), price: Number(t.price) })),
        items: p.items || [],
        variableItems: p.variableItems || []
      })) as Product[];
      this.products.set(mapped);
    }
  }

  async addProduct(product: Product) {
    const dbPayload = {
      type: product.type,
      categoryId: product.categoryId,
      title: product.title,
      description: product.description,
      imageUrl: product.imageUrl,
      productionTime: product.productionTime,
      size: product.size,
      printType: product.printType,
      paper: product.paper,
      finishing: product.finishing,
      basePrice: product.basePrice,
      pricingGrid: product.pricingGrid,
      items: product.items,
      variableItems: product.variableItems
    };
    
    const { data, error } = await this.supabase.from('products').insert([dbPayload]).select();
    if (!error && data) {
      await this.fetchProducts(); // Refresh list to get accurate IDs
    } else {
      console.error('Error adding product', error);
    }
  }

  async updateProduct(product: Product) {
    const dbPayload = {
      type: product.type,
      categoryId: product.categoryId,
      title: product.title,
      description: product.description,
      imageUrl: product.imageUrl,
      productionTime: product.productionTime,
      size: product.size,
      printType: product.printType,
      paper: product.paper,
      finishing: product.finishing,
      basePrice: product.basePrice,
      pricingGrid: product.pricingGrid,
      items: product.items,
      variableItems: product.variableItems
    };

    const { error } = await this.supabase.from('products').update(dbPayload).eq('id', product.id);
    if (!error) {
      this.products.update(list => list.map(p => p.id === product.id ? product : p));
    }
  }

  async deleteProduct(id: string) {
    const { error } = await this.supabase.from('products').delete().eq('id', id);
    if (!error) {
      this.products.update(list => list.filter(p => p.id !== id));
    }
  }

  // --- Leads ---
  async fetchLeads() {
    const { data, error } = await this.supabase.from('leads').select('*').order('createdAt', { ascending: false });
    if (!error && data) {
      const mapped = data.map((l: any) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        whatsapp: l.whatsapp,
        productInterest: l.productInterest,
        configSummary: l.configSummary,
        value: l.value,
        status: l.status as LeadStatus,
        createdAt: l.createdAt
      })) as Lead[];
      this.leads.set(mapped);
    }
  }

  async addLead(lead: Lead) {
    const dbPayload = {
      name: lead.name,
      email: lead.email,
      whatsapp: lead.whatsapp,
      productInterest: lead.productInterest,
      configSummary: lead.configSummary,
      value: lead.value,
      status: lead.status || 'Novo'
    };

    const { data, error } = await this.supabase.from('leads').insert([dbPayload]).select();
    if (!error && data) {
      await this.fetchLeads();
    } else {
      console.error('Error adding lead', error);
      throw new Error(error?.message || 'Falha ao salvar lead no banco de dados');
    }
  }

  async updateLeadStatus(id: string, status: LeadStatus) {
    const { error } = await this.supabase.from('leads').update({ status }).eq('id', id);
    if (!error) {
      this.leads.update(list => list.map(l => l.id === id ? { ...l, status } : l));
    }
  }

  async updateLeadValue(id: string, value: number) {
    const { error } = await this.supabase.from('leads').update({ value }).eq('id', id);
    if (!error) {
      this.leads.update(list => list.map(l => l.id === id ? { ...l, value } : l));
    }
  }

  async deleteLead(id: string) {
    const { error } = await this.supabase.from('leads').delete().eq('id', id);
    if (!error) {
      this.leads.update(list => list.filter(l => l.id !== id));
    }
  }

  // --- Pages ---
  async fetchPages() {
    const { data, error } = await this.supabase.from('pages').select('*');
    if (!error && data) {
      this.pages.set(data as PageContent[]);
    }
  }

  getPage(slug: string) {
    return this.pages().find(p => p.slug === slug);
  }

  async updatePage(updatedPage: PageContent) {
    const { data, error } = await this.supabase.from('pages')
      .upsert({ slug: updatedPage.slug, title: updatedPage.title, content: updatedPage.content })
      .select();
      
    if (!error && data) {
      this.pages.update(list => {
        const exists = list.find(p => p.slug === updatedPage.slug);
        if (exists) {
          return list.map(p => p.slug === updatedPage.slug ? updatedPage : p);
        }
        return [...list, updatedPage];
      });
    }
  }

  // --- Settings ---
  async fetchSettings() {
    const { data, error } = await this.supabase.from('site_settings').select('*').single();
    if (!error && data) {
      const mapped: SiteSettings = {
        bannerTitle: data.banner_title || '',
        bannerSubtitle: data.banner_subtitle || '',
        bannerImageUrl: data.banner_image_url || '',
        logoUrl: data.logo_url || '',
        logoType: data.logo_type || 'text',
        logoText: data.logo_text || 'S',
        headerBackgroundColor: data.header_background_color || '',
        primaryColor: data.primary_color || '#0f172a',
        secondaryColor: data.secondary_color || '#f97316',
        journeyHighlightColor: data.journey_highlight_color || '#0f172a',
        journeySteps: data.journey_steps || [],
        metaTitle: data.meta_title || '',
        metaDescription: data.meta_description || '',
        contactPhone: data.contact_phone || '',
        contactEmail: data.contact_email || '',
        contactFormContent: data.contact_form_content || '',
        featureCards: data.feature_cards || [],
        companyName: data.company_name || 'Studio Grafthi',
        instagramUrl: data.instagram_url || '',
        facebookUrl: data.facebook_url || '',
        tiktokUrl: data.tiktok_url || '',
        pinterestUrl: data.pinterest_url || '',
        scripts: data.scripts || []
      };
      this.settings.set(mapped);
    } else if (error && error.code === 'PGRST116') {
      // Row not found, create default
       await this.updateSettings(this.settings());
    }
  }

  async updateSettings(newSettings: SiteSettings) {
    const dbPayload = {
      id: true, // required by constraint
      banner_title: newSettings.bannerTitle,
      banner_subtitle: newSettings.bannerSubtitle,
      banner_image_url: newSettings.bannerImageUrl,
      logo_url: newSettings.logoUrl,
      logo_type: newSettings.logoType,
      logo_text: newSettings.logoText,
      header_background_color: newSettings.headerBackgroundColor,
      primary_color: newSettings.primaryColor,
      secondary_color: newSettings.secondaryColor,
      journey_highlight_color: newSettings.journeyHighlightColor,
      journey_steps: newSettings.journeySteps,
      meta_title: newSettings.metaTitle,
      meta_description: newSettings.metaDescription,
      contact_phone: newSettings.contactPhone,
      contact_email: newSettings.contactEmail,
      contact_form_content: newSettings.contactFormContent,
      feature_cards: newSettings.featureCards,
      company_name: newSettings.companyName,
      instagram_url: newSettings.instagramUrl,
      facebook_url: newSettings.facebookUrl,
      tiktok_url: newSettings.tiktokUrl,
      pinterest_url: newSettings.pinterestUrl,
      scripts: newSettings.scripts
    };

    const { error } = await this.supabase.from('site_settings').upsert([dbPayload]);
    if (!error) {
      this.settings.set(newSettings);
    } else {
      console.error('Error updating settings', error);
    }
  }

  // --- Analytics (Local only for now to avoid DB overload) ---
  addEvent(event: AnalyticsEvent) {
    this.events.update(list => [...list, event]);
    // Optional: Only save to local storage or implement batch sending to Supabase
  }

  clearEvents() {
    this.events.set([]);
  }
}
