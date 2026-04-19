
import { Component, input, output, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Product, Lead } from '../../models/types';
import { DbService } from '../../services/db.service';
import { TrackingService } from '../../services/tracking.service';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" (click)="close.emit()"></div>
      
      <!-- Modal Content -->
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto relative z-10 flex flex-col md:flex-row overflow-hidden animate-fade-in-up">
        
        <!-- Success Overlay -->
        @if (showSuccess()) {
          <div class="absolute inset-0 z-[60] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div class="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mb-6 animate-bounce">
              ✓
            </div>
            <h3 class="text-3xl font-black text-navy-900 mb-2">Pedido Enviado!</h3>
            <p class="text-slate-500 max-w-md mx-auto mb-8">
              Seu interesse foi registrado. Estamos te redirecionando para o WhatsApp para finalizar os detalhes.
            </p>
            <div class="flex items-center gap-2 text-navy-900 font-bold">
              <span class="w-2 h-2 rounded-full bg-navy-900 animate-ping"></span>
              Redirecionando...
            </div>
          </div>
        }

        <!-- Close Button mobile -->
        <button class="absolute top-4 right-4 md:hidden z-30 bg-white/80 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-md text-slate-500 hover:text-navy-900" (click)="close.emit()">
          ✕
        </button>

        <!-- Left: Image Section (Greater Prominence) -->
        <div class="w-full md:w-3/5 bg-white flex flex-col relative">
          <!-- Main Image Display - Optimized Aspect Ratio -->
          <div class="w-full aspect-[4/5] md:aspect-square overflow-hidden bg-slate-50 flex items-center justify-center relative group">
            <img [src]="activeImage()" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Product">
            
            <!-- Floating Badge -->
            <div class="absolute top-6 left-6 bg-navy-900/90 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-xl z-10">
              Premium Quality
            </div>
          </div>

          <!-- Gallery Thumbnails - Overlay style -->
          @if (allImages().length > 1) {
            <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 px-4 py-3 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-w-[90%] overflow-x-auto no-scrollbar">
              @for (img of allImages(); track img; let i = $index) {
                <button 
                  (click)="activeImage.set(img)"
                  [class.ring-2]="activeImage() === img"
                  [class.ring-navy-900]="activeImage() === img"
                  [class.scale-110]="activeImage() === img"
                  class="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 border-white bg-white transition-all duration-300 hover:scale-105">
                  <img [src]="img" class="w-full h-full object-cover">
                </button>
              }
            </div>
          }
        </div>

        <!-- Right: Info & Form Section -->
        <div class="w-full md:w-2/5 p-6 md:p-10 bg-white flex flex-col border-l border-slate-100">
          <button class="hidden md:flex absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors w-8 h-8 items-center justify-center rounded-full hover:bg-red-50" (click)="close.emit()">
             <span class="text-2xl leading-none">×</span>
          </button>

          <div class="mb-8">
            <h2 class="text-2xl md:text-3xl font-black text-navy-900 mb-3 leading-tight tracking-tight">{{ product().title }}</h2>
            <p class="text-slate-500 text-sm leading-relaxed">{{ product().description }}</p>
          </div>

          <!-- TECHNICAL SPECS SECTION - Refined Typography -->
          <div class="space-y-4 mb-8">
            <div class="flex items-center gap-3 mb-4">
              <div class="h-px bg-slate-200 flex-grow"></div>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Especificações</span>
              <div class="h-px bg-slate-200 flex-grow"></div>
            </div>
            
            <div class="grid grid-cols-2 gap-x-6 gap-y-4">
              @if (product().size) {
                <div class="flex items-center gap-3 group">
                  <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-sm group-hover:bg-navy-50 transition-colors">📏</div>
                  <div>
                    <span class="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Tamanho</span>
                    <span class="text-xs text-navy-900 font-bold">{{ product().size }}</span>
                  </div>
                </div>
              }
              @if (product().printType) {
                <div class="flex items-center gap-3 group">
                  <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-sm group-hover:bg-navy-50 transition-colors">🖨️</div>
                  <div>
                    <span class="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Impressão</span>
                    <span class="text-xs text-navy-900 font-bold">{{ product().printType }}</span>
                  </div>
                </div>
              }
              @if (product().paper) {
                <div class="flex items-center gap-3 group">
                  <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-sm group-hover:bg-navy-50 transition-colors">📄</div>
                  <div>
                    <span class="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Material</span>
                    <span class="text-xs text-navy-900 font-bold">{{ product().paper }}</span>
                  </div>
                </div>
              }
              @if (product().finishing) {
                <div class="flex items-center gap-3 group">
                  <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-sm group-hover:bg-navy-50 transition-colors">✨</div>
                  <div>
                    <span class="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Acabamento</span>
                    <span class="text-xs text-navy-900 font-bold">{{ product().finishing }}</span>
                  </div>
                </div>
              }
              @if (product().productionTime) {
                <div class="flex items-center gap-3 group pt-2 border-t border-slate-50 col-span-2">
                  <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-sm">🕒</div>
                  <div>
                    <span class="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Produção</span>
                    <span class="text-xs text-orange-600 font-black">{{ product().productionTime }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- KIT ITEMS (If applicable) - Compact style -->
          @if (product().type === 'fixed_kit' && product().items && product().items!.length > 0) {
            <div class="mb-8 p-4 bg-navy-50/50 rounded-2xl border border-navy-100">
              <h4 class="text-[10px] font-black text-navy-900 uppercase tracking-widest mb-3">Itens do Kit</h4>
              <div class="space-y-2">
                @for (item of product().items; track item.productName) {
                  <div class="flex items-center justify-between text-[11px] font-bold text-navy-800">
                    <span>• {{ item.productName }}</span>
                    <span class="text-navy-400">{{ item.size }}</span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- VARIABLE KIT ITEMS -->
          @if (product().type === 'variable_kit' && product().variableItems && product().variableItems!.length > 0) {
            <div class="mb-8 p-4 bg-navy-50/50 rounded-2xl border border-navy-100">
              <h4 class="text-[10px] font-black text-navy-900 uppercase tracking-widest mb-3">Itens do Combo</h4>
              <div class="space-y-3">
                @for (item of product().variableItems; track item.title) {
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center justify-between text-[11px] font-bold text-navy-800">
                      <span>• {{ item.title }}</span>
                      <span class="text-navy-400">{{ item.size }}</span>
                    </div>
                    <div class="flex gap-2 text-[9px] text-slate-500 font-medium pl-3">
                      <span>{{ item.printType }}</span>
                      <span>•</span>
                      <span>{{ item.paper }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Pricing & Lead Form -->
          <div class="mt-auto space-y-6">
            <!-- Pricing Card -->
            <div class="bg-slate-900 p-6 rounded-3xl shadow-xl text-white">
               <div class="flex items-center justify-between">
                 @if (product().type !== 'variable_kit') {
                   <div class="flex flex-col gap-1.5">
                     <label class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Quantidade</label>
                     <div class="relative">
                       <button 
                          type="button"
                          (click)="isQtyDropdownOpen.set(!isQtyDropdownOpen())"
                          class="w-full bg-slate-800 text-white font-black rounded-full px-6 py-2.5 text-sm flex items-center justify-between gap-4 hover:bg-slate-700 transition-all border border-slate-700 shadow-sm min-w-[120px]">
                          <span>{{ selectedQty() }} un.</span>
                          <svg class="w-4 h-4 transition-transform duration-300" [class.rotate-180]="isQtyDropdownOpen()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/></svg>
                       </button>
                       
                       @if (isQtyDropdownOpen()) {
                         <div class="absolute bottom-full mb-2 left-0 w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                           @for (tier of product().pricingGrid; track tier.qty) {
                             <button 
                               type="button"
                               (click)="selectedQty.set(tier.qty); isQtyDropdownOpen.set(false)"
                               [class.bg-orange-500]="selectedQty() === tier.qty"
                               [class.text-white]="selectedQty() === tier.qty"
                               class="w-full text-left px-6 py-3 text-sm font-bold hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-none">
                               {{ tier.qty }} un.
                             </button>
                           }
                         </div>
                       }
                     </div>
                   </div>
                 }
                 <div class="text-right">
                   <span class="block text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Total</span>
                   <span class="text-3xl font-black text-white tracking-tighter">{{ currentPrice() | currency:'BRL' }}</span>
                 </div>
               </div>
            </div>

            <!-- Lead Form Outside -->
            <form [formGroup]="leadForm" (ngSubmit)="submitLead()" class="space-y-4">
               <div class="space-y-3">
                  <input type="text" formControlName="name" placeholder="Seu Nome" class="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-full text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-navy-900 outline-none transition hover:bg-white">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="email" formControlName="email" placeholder="Email" class="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-full text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-navy-900 outline-none transition hover:bg-white">
                    <div class="relative">
                      <input type="tel" formControlName="whatsapp" placeholder="WhatsApp (ex: 11 99999-9999)" class="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-full text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-navy-900 outline-none transition hover:bg-white">
                      @if (leadForm.get('whatsapp')?.invalid && leadForm.get('whatsapp')?.touched) {
                        <span class="absolute -bottom-5 left-6 text-[10px] text-red-500 font-bold">Formato inválido</span>
                      }
                    </div>
                  </div>
               </div>
               
               <button 
                 type="submit"
                 [disabled]="leadForm.invalid"
                 (click)="tracking.trackClick('Pedir pelo WhatsApp', 'Modal Produto')"
                 class="w-full bg-navy-900 hover:bg-navy-800 disabled:opacity-30 text-white font-black py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2">
                 <span>Pedir pelo WhatsApp</span>
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
               </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductModalComponent {
  product = input.required<Product>();
  close = output<void>();
  
  db = inject(DbService);
  tracking = inject(TrackingService);
  fb: FormBuilder = inject(FormBuilder);

  activeImage = signal<string>('');
  isQtyDropdownOpen = signal<boolean>(false);
  showSuccess = signal<boolean>(false);
  allImages = computed(() => {
    const p = this.product();
    return [p.imageUrl, ...(p.additionalImages || [])];
  });

  selectedQty = signal<number>(0);
  currentPrice = computed(() => {
    const p = this.product();
    if (!p) return 0;

    if (p.type === 'variable_kit') {
      return p.basePrice || 0;
    }

    const qty = this.selectedQty();
    if (!p.pricingGrid || !Array.isArray(p.pricingGrid) || qty === 0 || p.pricingGrid.length === 0) {
      return 0;
    }
    const tier = p.pricingGrid.find(t => t.qty === qty);
    return tier ? tier.price : 0;
  });

  leadForm: FormGroup;

  constructor() {
    this.leadForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      // Relaxed pattern to allow spaces, dashes, parentheses
      whatsapp: ['', [Validators.required, Validators.pattern(/^[0-9\s\-\(\)\+]{10,20}$/)]]
    });

    effect(() => {
      const p = this.product();
      if(p) {
        this.activeImage.set(p.imageUrl);
        if (p.type === 'variable_kit') {
          this.selectedQty.set(0);
        } else if (p.pricingGrid && p.pricingGrid.length > 0) {
          this.selectedQty.set(p.pricingGrid[0].qty);
        }
      }
    });
  }

  onQtyChange(event: Event) {
    const qty = Number((event.target as HTMLSelectElement).value);
    this.selectedQty.set(qty);
  }

  submitLead() {
    if (this.leadForm.valid) {
      try {
        const p = this.product();
        if (!p) return;

        this.tracking.trackWhatsAppClick(p.id, p.title);

        // Sanitize WhatsApp number (keep only digits)
        const rawWhatsapp = this.leadForm.get('whatsapp')?.value || '';
        const sanitizedWhatsapp = rawWhatsapp.replace(/\D/g, '');

        // 1. WhatsApp Redirect Logic
        let phone = this.db.settings().contactPhone?.replace(/\D/g, '') || '';
        
        if (!phone) {
          alert('Erro de Configuração: O número de WhatsApp de atendimento não foi definido no painel administrativo.');
          return;
        }
        // Auto-append Brazil Country Code (55)
        if (phone.length <= 11 && !phone.startsWith('55')) {
            phone = '55' + phone;
        }

        // Build summary of specs to attach to lead
        const finalPrice = this.currentPrice() || 0;
        const qtyText = p.type === 'variable_kit' ? 'Kit Personalizado' : `${this.selectedQty()} un.`;
        const configSummary = `${p.title} | ${qtyText} | R$ ${finalPrice.toFixed(2)}`;

        const lead: Lead = {
          id: crypto.randomUUID(),
          ...this.leadForm.value,
          whatsapp: sanitizedWhatsapp, // Save sanitized version
          productInterest: p.title,
          configSummary: configSummary,
          value: finalPrice, // Saving numeric value for BI
          status: 'Novo',
          createdAt: new Date().toISOString()
        };

        // Save to DB
        await this.db.addLead(lead);

        // Show success feedback
        this.showSuccess.set(true);

        // Build technical details for WhatsApp
        let techDetails = '';
        if (p.type === 'simple_batch' || p.type === 'fixed_kit') {
          techDetails = `\n*Detalhes Técnicos:*\nTamanho: ${p.size || 'N/A'}\nImpressão: ${p.printType || 'N/A'}\nPapel: ${p.paper || 'N/A'}\nAcabamento: ${p.finishing || 'N/A'}`;
          
          if (p.type === 'fixed_kit' && p.items && Array.isArray(p.items)) {
            techDetails += `\n\n*Itens do Kit:*\n${p.items.map(i => `- ${i.productName} (${i.size})`).join('\n')}`;
          }
        } else if (p.type === 'variable_kit' && p.variableItems && Array.isArray(p.variableItems)) {
          techDetails = `\n*Itens do Combo:*\n${p.variableItems.map(i => `- ${i.title} (${i.size || ''})`).join('\n')}`;
        }

        // Redirect to WhatsApp after a short delay to show success message
        setTimeout(() => {
          const msg = encodeURIComponent(`Olá! Gostaria de encomendar: ${configSummary}. ${techDetails}\n\nMeu nome é ${lead.name}.`);
          window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
          this.close.emit();
        }, 2000);
      } catch (err: any) {
        console.error('Error submitting lead:', err);
        const errorMsg = err.message || 'Erro desconhecido';
        alert(`Ocorreu um erro ao processar seu pedido.\n\nDetalhe técnico: ${errorMsg}\n\nPor favor, tente novamente ou entre em contato diretamente.`);
      }
    }
  }
}
