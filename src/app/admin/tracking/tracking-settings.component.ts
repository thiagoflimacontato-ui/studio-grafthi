
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackingService, TrackingScript } from './tracking.service';
import { TrackingLoaderService } from './tracking-loader.service';

@Component({
  selector: 'app-tracking-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking-settings.component.html'
})
export class TrackingSettingsComponent {
  trackingService = inject(TrackingService);
  private loaderService = inject(TrackingLoaderService);
  private cdr = inject(ChangeDetectorRef);
  
  saveSuccess: { [key: string]: boolean } = {};

  addNewScript() {
    this.trackingService.addScript('Novo Script', '');
  }

  saveScript(script: TrackingScript) {
    if (!script.name || !script.code) {
      alert('Por favor, preencha o nome e o código do script.');
      return;
    }
    this.trackingService.updateScript(script);
    if (script.active) {
      this.loaderService.injectScript(script);
    } else {
      this.loaderService.removeScript(script.id);
    }

    // Feedback visual
    this.saveSuccess[script.id] = true;
    setTimeout(() => {
      this.saveSuccess[script.id] = false;
    }, 3000);
  }

  deleteScript(id: string) {
    // Remove do DOM imediatamente
    this.loaderService.removeScript(id);
    
    // Remove da lista e do storage através do serviço
    this.trackingService.deleteScript(id);
    
    // Forçar atualização se necessário
    this.cdr.detectChanges();
  }

  isScriptActive(id: string): boolean {
    return !!document.getElementById('tracking-' + id);
  }

  toggleActive(script: TrackingScript) {
    this.trackingService.updateScript(script);
    if (script.active) {
      this.loaderService.injectScript(script);
    } else {
      this.loaderService.removeScript(script.id);
    }
  }
}
