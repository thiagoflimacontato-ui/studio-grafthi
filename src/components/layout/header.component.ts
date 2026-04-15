import { Component, inject, Pipe, PipeTransform, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DbService } from '../../services/db.service';
import { TrackingService } from '../../services/tracking.service';
import { CommonModule } from '@angular/common';

@Pipe({
  name: 'numberString'
})
export class NumberStringPipe implements PipeTransform {
  transform(value: string | undefined): string {
    return value ? value.replace(/\D/g, '') : '';
  }
}

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, CommonModule, NumberStringPipe],
  template: `
    <header 
      [style.backgroundColor]="db.settings().headerBackgroundColor || undefined"
      [class.bg-navy-900]="!db.settings().headerBackgroundColor"
      class="text-white shadow-lg sticky top-0 z-40 transition-colors duration-300">
      <div class="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
        <!-- Logo -->
        <a routerLink="/" class="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 z-50 relative">
          @if (db.settings().logoType === 'image' && db.settings().logoUrl) {
            <!-- 
               Smart Logo Sizing:
               1. h-10 md:h-14: Sets a fixed height constraint suitable for a navbar.
               2. w-auto: Allows width to scale based on aspect ratio.
               3. max-w-[...]: Prevents extremely wide logos from breaking layout on mobile.
               4. object-contain: Crucial! Ensures the image is never squashed/flattened.
            -->
            <img [src]="db.settings().logoUrl" alt="Logo" class="h-10 md:h-14 w-auto max-w-[280px] md:max-w-[500px] object-contain">
          } @else {
            <span class="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-black text-navy-900 text-sm md:text-base">
              {{ (db.settings().logoText || db.settings().companyName?.charAt(0) || 'S').slice(0, 2) }}
            </span>
            <span class="truncate max-w-[150px] md:max-w-none">{{ db.settings().companyName }}</span>
          }
        </a>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-8 font-medium">
          <a routerLink="/" 
             routerLinkActive="text-orange-500" 
             [routerLinkActiveOptions]="{exact: true}"
             class="hover:text-orange-400 transition-colors">
             Home
          </a>
          <a routerLink="/catalogo" 
             routerLinkActive="text-orange-500" 
             class="hover:text-orange-400 transition-colors">
             Catálogo
          </a>
          <a routerLink="/contato"
             routerLinkActive="text-orange-500"
             class="hover:text-orange-400 transition-colors">
             Fale Conosco
          </a>
        </nav>

        <!-- Mobile Menu Trigger -->
        <button class="md:hidden text-white p-2 focus:outline-none z-50 relative" (click)="toggleMenu()" aria-label="Abrir Menu">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </button>
      </div>
      
      <!-- Mobile Menu Drawer (Overlay) -->
      @if (isMenuOpen()) {
        <div class="relative z-50 md:hidden">
            <!-- Backdrop -->
            <div class="fixed inset-0 bg-navy-900/80 backdrop-blur-sm transition-opacity" (click)="closeMenu()"></div>
            
            <!-- Drawer Content -->
            <div class="fixed inset-y-0 right-0 w-[85%] max-w-[320px] bg-white text-navy-900 shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out">
            
            <!-- Drawer Header -->
            <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
                <div>
                    <span class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Navegação</span>
                    <h3 class="font-bold text-xl text-navy-900">Menu</h3>
                </div>
                <button (click)="closeMenu()" class="p-2 -mr-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" aria-label="Fechar Menu">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <!-- Navigation Links -->
            <nav class="flex-grow px-6 py-6 overflow-y-auto space-y-2">
                <a routerLink="/" 
                    (click)="closeMenu()" 
                    routerLinkActive="bg-orange-50 text-orange-600 border-orange-200"
                    [routerLinkActiveOptions]="{exact: true}"
                    class="flex items-center gap-4 px-4 py-3.5 rounded-xl text-lg font-bold text-slate-600 hover:bg-slate-50 border border-transparent transition-all">
                    <span class="text-xl">🏠</span> Home
                </a>
                <a routerLink="/catalogo" 
                    (click)="closeMenu()" 
                    routerLinkActive="bg-orange-50 text-orange-600 border-orange-200"
                    class="flex items-center gap-4 px-4 py-3.5 rounded-xl text-lg font-bold text-slate-600 hover:bg-slate-50 border border-transparent transition-all">
                    <span class="text-xl">📦</span> Catálogo
                </a>
                <a routerLink="/contato" 
                    (click)="closeMenu()" 
                    routerLinkActive="bg-orange-50 text-orange-600 border-orange-200"
                    class="flex items-center gap-4 px-4 py-3.5 rounded-xl text-lg font-bold text-slate-600 hover:bg-slate-50 border border-transparent transition-all">
                    <span class="text-xl">📞</span> Fale Conosco
                </a>
            </nav>

            <!-- Drawer Footer (CTA) -->
            <div class="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
                <!-- WhatsApp Button -->
                <a [href]="'https://wa.me/' + (db.settings().contactPhone | numberString)" target="_blank"
                    (click)="tracking.trackWhatsAppClick(); closeMenu()"
                    class="flex items-center justify-center gap-3 w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 active:scale-95 transition-all">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.074-.458.075-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    Falar no WhatsApp
                </a>
            </div>
           </div>
        </div>
      }
    </header>
  `
})
export class HeaderComponent {
  db = inject(DbService);
  tracking = inject(TrackingService);
  isMenuOpen = signal(false);
// ...

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }
}