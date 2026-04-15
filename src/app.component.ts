
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/layout/header.component';
import { FooterComponent } from './components/layout/footer.component';
import { ScriptLoaderService } from './services/script-loader.service';
import { ThemeService } from './services/theme.service';
import { SeoService } from './services/seo.service';
import { TrackingService } from './services/tracking.service';
import { TrackingLoaderService } from './app/admin/tracking/tracking-loader.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  host: {
    '(window:scroll)': 'onWindowScroll()'
  },
  template: `
    <div class="min-h-screen flex flex-col bg-slate-50 relative">
      <app-header />
      <main class="flex-grow">
        <router-outlet />
      </main>
      <app-footer />

      <!-- Back to Top Button -->
      <!-- 
         Behavior: 
         - Fixed position bottom-right
         - Transitions opacity and Y-position for a smooth entrance effect
         - Hidden from printers via 'print:hidden'
      -->
      <button
        (click)="scrollToTop()"
        [class.opacity-100]="showBackToTop()"
        [class.translate-y-0]="showBackToTop()"
        [class.opacity-0]="!showBackToTop()"
        [class.translate-y-10]="!showBackToTop()"
        [class.pointer-events-none]="!showBackToTop()"
        class="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 bg-orange-500 hover:bg-orange-600 text-white p-3 md:p-4 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 focus:outline-none print:hidden border-2 border-white/20 backdrop-blur-sm"
        aria-label="Voltar ao topo"
        title="Voltar ao topo">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  `
})
export class AppComponent {
  // Injecting to trigger constructor logic
  scriptLoader = inject(ScriptLoaderService);
  themeService = inject(ThemeService);
  seoService = inject(SeoService);
  trackingService = inject(TrackingService);
  trackingLoader = inject(TrackingLoaderService);
  private document = inject(DOCUMENT);

  constructor() {
    // Initialize tracking scripts
    this.trackingLoader.init();
  }

  // State for button visibility
  showBackToTop = signal(false);

  // Scroll Event Listener
  onWindowScroll() {
    const scrollPosition = window.scrollY || this.document.documentElement.scrollTop || this.document.body.scrollTop || 0;
    // Show button if scrolled more than 500px
    this.showBackToTop.set(scrollPosition > 500);
  }

  // Smooth Scroll Action
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
