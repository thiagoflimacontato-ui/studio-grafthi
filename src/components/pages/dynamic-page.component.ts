
import { Component, inject, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { DbService } from '../../services/db.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { DirectContactFormComponent } from '../home/direct-contact-form.component';

@Component({
  selector: 'app-dynamic-page',
  standalone: true,
  imports: [RouterLink, DirectContactFormComponent],
  template: `
    <div class="bg-white min-h-screen">
      <!-- Content Container -->
      <div class="container mx-auto px-4 max-w-3xl pt-12 pb-8">
        
        <!-- Back Button (Enhanced Visibility) -->
        <a routerLink="/" class="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-700 font-bold hover:text-orange-600 hover:border-orange-500 hover:shadow-md transition-all mb-8 group">
          <span class="transform group-hover:-translate-x-1 transition-transform">←</span> Voltar para Home
        </a>

        @if (pageData()) {
          <article class="prose prose-slate lg:prose-lg max-w-none">
            <h1 class="text-3xl font-bold text-navy-900 mb-6 border-b pb-4">{{ pageData()?.title }}</h1>
            
            <!-- Safe HTML rendering would normally utilize DomSanitizer, but for this simpler applet we trust internal DB html -->
            <div [innerHTML]="pageData()?.content"></div>
          </article>
        } @else {
          <div class="text-center py-12 border border-slate-100 rounded-xl bg-slate-50">
            <h2 class="text-2xl text-slate-400 font-bold">Página não encontrada</h2>
            <p class="text-slate-500 mt-2">O conteúdo que você procura não existe ou foi removido.</p>
            <div class="mt-6">
                <a routerLink="/" class="text-orange-500 font-bold hover:underline">Ir para a Página Inicial</a>
            </div>
          </div>
        }
      </div>

      <!-- Specific Injection for Contact Page -->
      @if (slug() === 'contato') {
        <div class="mt-4">
          <app-direct-contact-form />
        </div>
      }
    </div>
  `
})
export class DynamicPageComponent {
  private route = inject(ActivatedRoute);
  private db = inject(DbService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  // Get slug from route
  slug = toSignal(this.route.paramMap.pipe(map(params => params.get('slug'))));

  // Compute page data
  pageData = computed(() => {
    const s = this.slug();
    if (!s) return null;
    return this.db.getPage(s);
  });

  constructor() {
    // Dynamic SEO Effect
    effect(() => {
      const page = this.pageData();
      if (page) {
        // 1. Update Browser Title
        const newTitle = `${page.title} | ${this.db.settings().companyName}`;
        this.titleService.setTitle(newTitle);

        // 2. Update Meta Description
        // Remove HTML tags to create a clean text summary
        const cleanContent = page.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const summary = cleanContent.substring(0, 155) + (cleanContent.length > 155 ? '...' : '');
        
        // Fallback description if content is empty (e.g. contact page which relies on component)
        const finalDesc = summary || `Entre em contato com a ${this.db.settings().companyName}. Confira informações sobre ${page.title}.`;

        this.metaService.updateTag({ name: 'description', content: finalDesc });
        
        // Update Open Graph for sharing
        this.metaService.updateTag({ property: 'og:title', content: newTitle });
        this.metaService.updateTag({ property: 'og:description', content: finalDesc });
      }
    });
  }
}
