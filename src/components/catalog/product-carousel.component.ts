
import { Component, Input, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/types';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full overflow-hidden group">
      <!-- Images Container -->
      <div class="flex w-full h-full transition-transform duration-700 ease-in-out"
           [style.transform]="'translateX(-' + (currentIndex() * 100) + '%)'">
        
        <!-- Main Image -->
        <div class="w-full h-full flex-shrink-0">
          <img [src]="product.imageUrl" 
               [alt]="product.title" 
               class="w-full h-full object-cover">
        </div>

        <!-- Additional Images -->
        @for (imgUrl of product.additionalImages || []; track $index) {
          <div class="w-full h-full flex-shrink-0">
            <img [src]="imgUrl" 
                 [alt]="product.title + ' - Imagem ' + ($index + 2)" 
                 class="w-full h-full object-cover">
          </div>
        }
      </div>

      <!-- Indicators (Dots) -->
      @if (hasMultipleImages()) {
        <div class="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
          <button 
            (click)="setIndex(0, $event)"
            [class.bg-white]="currentIndex() === 0"
            [class.bg-white/40]="currentIndex() !== 0"
            class="w-1.5 h-1.5 rounded-full transition-all duration-300">
          </button>
          @for (img of product.additionalImages; track $index) {
            <button 
              (click)="setIndex($index + 1, $event)"
              [class.bg-white]="currentIndex() === ($index + 1)"
              [class.bg-white/40]="currentIndex() !== ($index + 1)"
              class="w-1.5 h-1.5 rounded-full transition-all duration-300">
            </button>
          }
        </div>
      }
    </div>
  `
})
export class ProductCarouselComponent implements OnInit, OnDestroy {
  @Input({ required: true }) product!: Product;
  
  currentIndex = signal(0);
  private intervalId: any;

  hasMultipleImages = computed(() => {
    return this.product.additionalImages && this.product.additionalImages.length > 0;
  });

  totalImages = computed(() => {
    return 1 + (this.product.additionalImages?.length || 0);
  });

  ngOnInit() {
    if (this.hasMultipleImages()) {
      this.startAutoSlide();
    }
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  private startAutoSlide() {
    this.stopAutoSlide();
    this.intervalId = setInterval(() => {
      this.next();
    }, 4000); // Slide every 4 seconds
  }

  private stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  next() {
    const nextIndex = (this.currentIndex() + 1) % this.totalImages();
    this.currentIndex.set(nextIndex);
  }

  setIndex(index: number, event: Event) {
    event.stopPropagation();
    this.currentIndex.set(index);
    this.startAutoSlide(); // Reset timer on manual click
  }
}
