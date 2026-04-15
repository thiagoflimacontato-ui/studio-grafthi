
import { Injectable, inject, effect } from '@angular/core';
import { DbService } from './db.service';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private db = inject(DbService);
  private document = inject(DOCUMENT);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  constructor() {
    effect(() => {
      const settings = this.db.settings();

      // Prepare SEO Data
      const title = settings.metaTitle || settings.companyName || 'Studio Grafthi';
      const description = settings.metaDescription || 'Gráfica online especializada em pequenos empreendedores.';
      // Prefer banner image for social sharing as it's usually larger/better aspect ratio, fallback to logo
      const image = settings.bannerImageUrl || settings.logoUrl || '';
      const url = this.document.location.href;

      // 1. Update Basic Tags
      this.titleService.setTitle(title);
      this.metaService.updateTag({ name: 'description', content: description });

      // 2. Update Open Graph Tags (Facebook, WhatsApp, LinkedIn)
      this.metaService.updateTag({ property: 'og:site_name', content: settings.companyName || 'Studio Grafthi' });
      this.metaService.updateTag({ property: 'og:title', content: title });
      this.metaService.updateTag({ property: 'og:description', content: description });
      this.metaService.updateTag({ property: 'og:type', content: 'website' });
      this.metaService.updateTag({ property: 'og:url', content: url });
      
      if (image) {
        this.metaService.updateTag({ property: 'og:image', content: image });
        // Recommended for WhatsApp to render image correctly
        this.metaService.updateTag({ property: 'og:image:alt', content: title }); 
      }

      // 3. Update Twitter Card Tags
      this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.metaService.updateTag({ name: 'twitter:title', content: title });
      this.metaService.updateTag({ name: 'twitter:description', content: description });
      if (image) {
        this.metaService.updateTag({ name: 'twitter:image', content: image });
      }

      // 4. Manage Canonical URL
      this.updateCanonical(url.split('#')[0]);
    });
  }

  private updateCanonical(url: string) {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
