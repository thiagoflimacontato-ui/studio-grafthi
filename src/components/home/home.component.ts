
import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DbService } from '../../services/db.service';
import { TrackingService } from '../../services/tracking.service';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ProductModalComponent } from '../catalog/product-modal.component';
import { Product } from '../../models/types';
import { DirectContactFormComponent } from './direct-contact-form.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, NgOptimizedImage, ProductModalComponent, DirectContactFormComponent],
  template: `
    <!-- Hero Banner -->
    <section class="relative bg-navy-900 min-h-[500px] md:h-[550px] flex items-center overflow-hidden">
      <div class="absolute inset-0 z-0 opacity-30">
         <img [ngSrc]="db.settings().bannerImageUrl" fill priority [alt]="db.settings().bannerTitle + ' - ' + db.settings().companyName" class="object-cover">
      </div>
      <div class="container mx-auto px-6 py-12 md:px-4 relative z-10 text-center md:text-left">
        <h1 class="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight max-w-4xl drop-shadow-lg">
          {{ db.settings().bannerTitle }}
        </h1>
        <p class="text-lg md:text-xl text-slate-100 mb-8 max-w-2xl leading-relaxed drop-shadow-md mx-auto md:mx-0">
          {{ db.settings().bannerSubtitle }}
        </p>
        <div class="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
          <a routerLink="/catalogo" (click)="tracking.trackClick('Ver Produtos', 'Hero Banner')" class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transform transition hover:scale-105 text-lg w-full md:w-auto">
            Ver Produtos
          </a>
        </div>
      </div>
    </section>
    
    <!-- CUSTOMER JOURNEY (New Section) -->
    <section class="py-12 md:py-20 bg-white">
      <div class="container mx-auto px-4">
         <div class="text-center mb-10 md:mb-16">
            <h2 class="text-2xl md:text-3xl font-bold text-navy-900 tracking-tight">Processo de Compra</h2>
            <p class="text-slate-500 mt-2 max-w-2xl mx-auto text-sm md:text-base">Entenda como garantimos a excelência do seu pedido, da configuração à entrega.</p>
         </div>

         <div class="relative max-w-6xl mx-auto">
            <!-- Timeline Line (Horizontal on Desktop, Hidden on Mobile for simpler stack) -->
            <div class="hidden md:block absolute top-[2.5rem] left-0 right-0 h-0.5 -z-0" 
                 [style.backgroundColor]="db.settings().journeyHighlightColor || '#e2e8f0'"></div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
               @for (step of db.settings().journeySteps; track step.id; let isLast = $last) {
                  <div class="flex flex-col items-center text-center group">
                     <!-- Icon Circle -->
                     <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border-4 flex items-center justify-center text-2xl md:text-3xl shadow-sm mb-4 md:mb-6 transition-transform group-hover:scale-110 duration-300 relative"
                          [style.borderColor]="db.settings().journeyHighlightColor || '#0f172a'">
                        {{ step.icon }}
                        <!-- Mobile connector line (Removed for cleaner single column look) -->
                     </div>
                     
                     <!-- Content -->
                     <div class="px-4 md:px-2">
                        <span class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 md:mb-2">Passo 0{{ step.id }}</span>
                        <h3 class="text-lg font-bold text-navy-900 mb-2 md:mb-3 leading-tight min-h-[auto] md:min-h-[3rem] flex items-center justify-center">{{ step.title }}</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">{{ step.description }}</p>
                     </div>
                  </div>
               }
            </div>
         </div>
      </div>
    </section>

    <!-- Highlights / Most Wanted -->
    <section class="py-12 md:py-16 bg-slate-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-8 md:mb-10">
          <span class="text-orange-500 font-bold uppercase tracking-wider text-xs md:text-sm">Vitrine</span>
          <h2 class="text-2xl md:text-3xl font-bold text-navy-900 mt-2 mb-2">Os Queridinhos do Momento</h2>
          <div class="w-16 h-1 bg-orange-500 mx-auto rounded"></div>
        </div>

        <!-- Horizontal Category Pills - Optimized for Touch -->
        <div class="scroll-container-wrapper mb-8 md:mb-10">
          <div class="flex overflow-x-auto gap-3 justify-start md:justify-center pb-4 category-scrollbar px-4">
            <button 
               (click)="selectedCategory.set(null)"
               [class.bg-navy-900]="!selectedCategory()"
               [class.text-white]="!selectedCategory()"
               [class.bg-white]="selectedCategory()"
               [class.text-slate-600]="selectedCategory()"
               [class.border-slate-200]="selectedCategory()"
               class="px-5 py-2.5 md:px-6 md:py-3 rounded-full font-bold whitespace-nowrap transition-colors border shadow-sm text-sm md:text-base flex-shrink-0">
               Todos os Produtos
            </button>
            @for (cat of db.categories(); track cat.id) {
               <button 
                 (click)="selectedCategory.set(cat.id)"
                 [class.bg-navy-900]="selectedCategory() === cat.id"
                 [class.text-white]="selectedCategory() === cat.id"
                 [class.bg-white]="selectedCategory() !== cat.id"
                 [class.text-slate-600]="selectedCategory() !== cat.id"
                 [class.border-slate-200]="selectedCategory() !== cat.id"
                 class="px-5 py-2.5 md:px-6 md:py-3 rounded-full font-bold whitespace-nowrap transition-colors border shadow-sm text-sm md:text-base flex-shrink-0">
                 {{ cat.name }}
               </button>
            }
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          @for (product of filteredProducts(); track product.id) {
            <div class="bg-white rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col h-full group">
              <!-- Image Section -->
              <div class="aspect-square overflow-hidden cursor-pointer relative" (click)="openProduct(product)">
                <img [src]="product.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" [alt]="product.title">
                @if (product.type === 'fixed_kit' || product.type === 'variable_kit') {
                  <div class="absolute top-2 left-2 md:top-2.5 md:left-2.5 bg-orange-500 text-white text-[7px] md:text-[9px] font-bold px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    {{ product.type === 'fixed_kit' ? 'Kit Fixo' : 'Combo' }}
                  </div>
                }
              </div>
              
              <!-- Content Section -->
              <div class="p-3 md:p-4 flex-grow flex flex-col">
                <h3 class="text-xs md:text-sm font-bold text-navy-900 mb-2 md:mb-2.5 leading-tight line-clamp-2">{{ product.title }}</h3>
                
                <!-- Technical Info Chips -->
                <div class="flex flex-wrap gap-1 md:gap-1.5 mb-2.5 md:mb-3">
                  @if (product.size) {
                    <span class="flex items-center gap-1 text-[7px] md:text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                      <span>📏</span> {{ product.size }}
                    </span>
                  }
                  @if (product.printType) {
                    <span class="flex items-center gap-1 text-[7px] md:text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                      <span>🖨️</span> {{ product.printType }}
                    </span>
                  }
                </div>
 
                <!-- Pricing & Action -->
                <div class="mt-auto">
                  <div class="flex flex-col gap-2 mb-3 md:mb-4">
                    <div class="flex flex-col">
                      <span class="text-[7px] md:text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                        {{ selectedQuantities()[product.id] ? 'Total' : 'A partir de' }}
                      </span>
                      <span class="text-base md:text-lg font-black text-navy-900 tracking-tight">{{ getPrice(product) | currency:'BRL' }}</span>
                    </div>
                    
                    @if (product.pricingGrid && product.pricingGrid.length > 0) {
                      <div class="relative">
                        <button 
                          (click)="openDropdownId.set(openDropdownId() === product.id ? null : product.id)"
                          class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 md:px-3 md:py-2 text-[8px] md:text-[10px] font-bold text-navy-900 flex items-center justify-between gap-2 hover:bg-white transition-all shadow-sm w-full">
                          <span>{{ selectedQuantities()[product.id] || 'Qtd.' }} {{ selectedQuantities()[product.id] ? 'un.' : '' }}</span>
                          <svg class="w-2.5 h-2.5 md:w-3 md:h-3 transition-transform duration-300" [class.rotate-180]="openDropdownId() === product.id" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/></svg>
                        </button>
                        
                        @if (openDropdownId() === product.id) {
                          <div class="absolute bottom-full mb-1 left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-1 duration-200">
                            @for (tier of product.pricingGrid; track tier.qty) {
                              <button 
                                (click)="updateQuantity(product.id, tier.qty); openDropdownId.set(null)"
                                [class.bg-navy-900]="selectedQuantities()[product.id] === tier.qty"
                                [class.text-white]="selectedQuantities()[product.id] === tier.qty"
                                class="w-full text-left px-3 py-1.5 md:px-4 md:py-2 text-[9px] md:text-[10px] font-bold hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-none">
                                {{ tier.qty }} un.
                              </button>
                            }
                          </div>
                        }
                      </div>
                    }
                  </div>
 
                  <button (click)="openProduct(product); tracking.trackClick('Mostrar Detalhes', 'Home Vitrine')" class="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-2 md:py-2.5 px-3 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 group/btn text-[9px] md:text-xs">
                    <span>Detalhes</span>
                    <svg class="w-2.5 h-2.5 md:w-3 md:h-3 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </button>
                </div>
              </div>
            </div>
          }
          @if (filteredProducts().length === 0) {
            <div class="col-span-2 md:col-span-3 text-center py-12 bg-white rounded-xl border border-slate-200 mx-4 md:mx-0">
              <p class="text-slate-500 text-lg">Nenhum produto encontrado nesta categoria no momento.</p>
              <button (click)="selectedCategory.set(null)" class="mt-4 text-orange-500 font-bold underline">Ver todos os produtos</button>
            </div>
          }
        </div>
        
        <div class="text-center mt-10 md:mt-12">
           <a routerLink="/catalogo" (click)="tracking.trackClick('Explorar Catálogo Completo', 'Home Vitrine')" class="w-full md:w-auto inline-block border-2 border-navy-900 text-navy-900 font-bold py-3.5 px-8 rounded-lg hover:bg-navy-900 hover:text-white transition uppercase text-sm tracking-wide">
             Explorar Catálogo Completo
           </a>
        </div>
      </div>
    </section>

    <!-- Features Strip (Dynamic Value Proposition) -->
    <section id="features" class="py-12 md:py-16 bg-white border-t border-slate-100">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          
          @for (card of db.settings().featureCards; track $index) {
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center hover:-translate-y-1 transition duration-300">
              <div [class]="getIconBgClass($index)" class="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl md:text-3xl">
                {{ card.icon }}
              </div>
              <h4 class="font-bold text-navy-900 text-lg mb-2">{{ card.title }}</h4>
              <p class="text-sm text-slate-600 leading-relaxed">{{ card.description }}</p>
            </div>
          }

        </div>
      </div>
    </section>

    <!-- New Direct Contact Form Section -->
    <app-direct-contact-form />

    @if (selectedProduct()) {
      <app-product-modal 
        [product]="selectedProduct()!" 
        (close)="closeModal()" />
    }
  `
})
export class HomeComponent {
  db = inject(DbService);
  tracking = inject(TrackingService);
  selectedProduct = signal<Product | null>(null);
  selectedCategory = signal<string | null>(null);
  openDropdownId = signal<string | null>(null);
  selectedQuantities = signal<Record<string, number>>({});

  filteredProducts = computed(() => {
    const all = this.db.products();
    const catId = this.selectedCategory();
    
    // Logic: If no category selected, show first 16 (4 rows of 4). If category, show all matching.
    if (!catId) return all.slice(0, 16);
    return all.filter(p => p.categoryId === catId);
  });

  updateQuantity(productId: string, qty: number) {
    this.selectedQuantities.update(prev => ({ ...prev, [productId]: qty }));
  }

  getPrice(product: Product): number {
    if (product.type === 'variable_kit') {
      return product.basePrice || 0;
    }

    const selectedQty = this.selectedQuantities()[product.id];
    if (selectedQty) {
      const tier = product.pricingGrid?.find(t => t.qty === selectedQty);
      if (tier) return tier.price;
    }
    return this.getMinPrice(product);
  }

  openProduct(product: Product) {
    this.tracking.trackProductView(product.id, product.title);
    this.selectedProduct.set(product);
  }

  closeModal() {
    this.selectedProduct.set(null);
  }

  getMinPrice(product: Product): number {
    if (product.type === 'variable_kit') {
      return product.basePrice || 0;
    }
    if (!product.pricingGrid || product.pricingGrid.length === 0) return 0;
    return Math.min(...product.pricingGrid.map(p => p.price));
  }

  getIconBgClass(index: number): string {
    const colors = ['bg-blue-100', 'bg-green-100', 'bg-orange-100', 'bg-purple-100'];
    return colors[index % colors.length];
  }

  getCategoryName(id: string): string {
    const cat = this.db.categories().find(c => c.id === id);
    return cat ? cat.name : 'Papelaria Personalizada';
  }
}
