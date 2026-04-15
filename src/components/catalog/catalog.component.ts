
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService } from '../../services/db.service';
import { TrackingService } from '../../services/tracking.service';
import { Product } from '../../models/types';
import { ProductModalComponent } from './product-modal.component';
import { ProductCarouselComponent } from './product-carousel.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, ProductModalComponent],
  template: `
    <div class="bg-slate-50 min-h-screen py-8 md:py-12">
      <div class="container mx-auto px-4">
        
        <div class="text-center mb-8 md:mb-12">
          <h1 class="text-3xl md:text-4xl font-bold text-navy-900 mb-2 md:mb-4">Nosso Catálogo</h1>
          <p class="text-slate-600 max-w-2xl mx-auto text-sm md:text-base">Confira nossos produtos e solicite seu orçamento personalizado. Qualidade garantida em cada impressão.</p>
        </div>

        <div class="flex flex-col md:flex-row gap-8">
          
          <!-- Sidebar Filters -->
          <div class="w-full md:w-72 flex-shrink-0">
             <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:sticky md:top-24">
               <h3 class="font-bold text-navy-900 text-lg mb-4 pb-2 border-b border-slate-100 hidden md:block">Categorias</h3>
               
               <!-- Mobile: Horizontal Scroll -->
               <div class="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
                 <button 
                   (click)="selectedCategory.set(null)"
                   [class]="!selectedCategory() ? 'bg-navy-900 text-white border-navy-900 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-navy-200'"
                   class="flex-shrink-0 md:w-full text-left px-5 py-2.5 rounded-xl border text-sm font-bold transition-all whitespace-nowrap">
                   Todos os Produtos
                 </button>
                 @for (cat of db.categories(); track cat.id) {
                   <button 
                     (click)="selectedCategory.set(cat.id)"
                     [class]="selectedCategory() === cat.id ? 'bg-navy-900 text-white border-navy-900 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-navy-200'"
                     class="flex-shrink-0 md:w-full text-left px-6 py-2.5 rounded-full border text-sm font-bold transition-all whitespace-nowrap">
                     {{ cat.name }}
                   </button>
                 }
               </div>
             </div>
          </div>

          <!-- Product Grid -->
          <div class="flex-grow">
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
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
 
                      <button (click)="openProduct(product); tracking.trackClick('Ver Detalhes', 'Catálogo')" class="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-2 md:py-2.5 px-3 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 group/btn text-[9px] md:text-xs">
                        <span>Detalhes</span>
                        <svg class="w-2.5 h-2.5 md:w-3 md:h-3 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              }
              @if (filteredProducts().length === 0) {
                 <div class="col-span-full text-center py-20 bg-white rounded-2xl border border-slate-200">
                    <p class="text-slate-400 font-bold">Nenhum produto encontrado nesta categoria.</p>
                 </div>
              }
            </div>
          </div>

        </div>
      </div>
    </div>

    @if (selectedProduct()) {
      <app-product-modal 
        [product]="selectedProduct()!" 
        (close)="closeModal()" />
    }
  `
})
export class CatalogComponent {
  db = inject(DbService);
  tracking = inject(TrackingService);
  selectedProduct = signal<Product | null>(null);
  selectedCategory = signal<string | null>(null);
  openDropdownId = signal<string | null>(null);
  selectedQuantities = signal<Record<string, number>>({});

  constructor() {
    this.tracking.trackCatalogAccess();
  }

  filteredProducts = computed(() => {
    const all = this.db.products();
    const catId = this.selectedCategory();
    if (!catId) return all;
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

  getCategoryName(id: string): string {
    const cat = this.db.categories().find(c => c.id === id);
    return cat ? cat.name : 'Papelaria Personalizada';
  }
}
