
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DbService } from '../../services/db.service';
import { TrackingService } from '../../services/tracking.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CommonModule],
  template: `
    <footer id="footer" class="bg-navy-950 text-slate-400 py-12">
      <div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- About -->
        <div>
          <div class="mb-4">
             @if (db.settings().logoUrl) {
                <img [src]="db.settings().logoUrl" alt="Logo" class="h-10 w-auto object-contain brightness-0 invert opacity-80">
             } @else {
                <h3 class="text-white text-lg font-bold">{{ db.settings().companyName }}</h3>
             }
          </div>
          <p class="mb-4">Sua parceira ideal em impressos gráficos. Qualidade, rapidez e o melhor preço do mercado.</p>
          
          <!-- Social Icons -->
          <div class="flex gap-3">
             @if (db.settings().instagramUrl) {
               <a [href]="db.settings().instagramUrl" target="_blank" (click)="tracking.trackClick('Instagram', 'Footer')" class="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors cursor-pointer text-white" aria-label="Instagram">
                 <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
               </a>
             }
             @if (db.settings().facebookUrl) {
               <a [href]="db.settings().facebookUrl" target="_blank" (click)="tracking.trackClick('Facebook', 'Footer')" class="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors cursor-pointer text-white" aria-label="Facebook">
                 <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
               </a>
             }
             @if (db.settings().tiktokUrl) {
               <a [href]="db.settings().tiktokUrl" target="_blank" (click)="tracking.trackClick('TikTok', 'Footer')" class="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors cursor-pointer text-white" aria-label="TikTok">
                 <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.16c0 2.52-1.12 4.84-2.9 6.45-1.79 1.62-4.22 2.3-6.62 1.93-2.4-.37-4.52-1.69-5.91-3.66-1.39-1.97-1.76-4.48-1.04-6.81.72-2.33 2.5-4.23 4.81-5.18.57-.23 1.16-.41 1.76-.53v4.06c-.95.27-1.84.93-2.39 1.76-.55.83-.69 1.88-.39 2.82.3.94 1.05 1.71 1.98 2.03.93.32 1.98.17 2.79-.4.81-.57 1.29-1.52 1.29-2.51v-14.13z"/></svg>
               </a>
             }
             @if (db.settings().pinterestUrl) {
               <a [href]="db.settings().pinterestUrl" target="_blank" (click)="tracking.trackClick('Pinterest', 'Footer')" class="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors cursor-pointer text-white" aria-label="Pinterest">
                 <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.399.165-1.487-.69-2.413-2.852-2.413-4.583 0-3.746 2.724-7.18 7.863-7.18 4.12 0 7.325 2.939 7.325 6.873 0 4.101-2.564 7.404-6.124 7.404-1.195 0-2.32-.619-2.705-1.355l-.736 2.813c-.276 1.046-.989 2.355-1.492 3.146 1.124.346 2.305.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>
               </a>
             }
          </div>
        </div>

        <!-- Institutional -->
        <div>
          <h3 class="text-white text-lg font-bold mb-4">Institucional</h3>
          <ul class="flex flex-col gap-2">
            <li><a routerLink="/politica-privacidade" (click)="tracking.trackClick('Política de Privacidade', 'Footer')" class="hover:text-orange-500 transition-colors">Política de Privacidade</a></li>
            <li><a routerLink="/reimpressao" (click)="tracking.trackClick('Política de Reimpressão', 'Footer')" class="hover:text-orange-500 transition-colors">Política de Reimpressão</a></li>
            <li><a routerLink="/faq" (click)="tracking.trackClick('FAQ', 'Footer')" class="hover:text-orange-500 transition-colors">Perguntas Frequentes (FAQ)</a></li>
            <li><a routerLink="/contato" (click)="tracking.trackClick('Fale Conosco', 'Footer')" class="hover:text-orange-500 transition-colors">Fale Conosco</a></li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="text-white text-lg font-bold mb-4">Contato</h3>
          <p class="mb-2"><span class="text-orange-500">WhatsApp:</span> {{ db.settings().contactPhone }}</p>
          <p class="mb-2"><span class="text-orange-500">Email:</span> {{ db.settings().contactEmail }}</p>
        </div>
      </div>

      <div class="border-t border-slate-800 mt-12 pt-8 text-center text-sm">
        <p>&copy; 2026 {{ db.settings().companyName }}. Todos os direitos reservados.</p>
        <div class="mt-4">
            <!-- Discrete Admin Link -->
            <a routerLink="/admin" class="text-navy-900 hover:text-slate-700 transition-colors text-xs">Área Administrativa</a>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  db = inject(DbService);
  tracking = inject(TrackingService);
}
