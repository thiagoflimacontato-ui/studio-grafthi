
import { Injectable, inject, RendererFactory2, Renderer2 } from '@angular/core';
import { TrackingService, TrackingScript } from './tracking.service';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TrackingLoaderService {
  private trackingService = inject(TrackingService);
  private document = inject(DOCUMENT);
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Initializes tracking by injecting all active scripts.
   */
  init() {
    const activeScripts = this.trackingService.scripts().filter(s => s.active);
    activeScripts.forEach(script => this.injectScript(script));
  }

  /**
   * Injects a script into the <head>.
   */
  injectScript(scriptData: TrackingScript) {
    this.removeScript(scriptData.id);

    if (!scriptData.code || !scriptData.active) return;

    const id = 'tracking-' + scriptData.id;
    
    // Create a container for the script content
    const container = this.renderer.createElement('div');
    this.renderer.setAttribute(container, 'id', id);
    this.renderer.setStyle(container, 'display', 'none');

    // Use Range to parse HTML strings (handles <script>, <noscript>, etc.)
    const range = this.document.createRange();
    range.selectNode(this.document.head);
    const fragment = range.createContextualFragment(scriptData.code);

    // Re-create script elements to ensure execution
    const scripts = fragment.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = this.renderer.createElement('script');
      this.renderer.setAttribute(newScript, 'type', 'text/javascript');
      
      Array.from(oldScript.attributes).forEach(attr => {
        this.renderer.setAttribute(newScript, attr.name, attr.value);
      });

      if (oldScript.innerHTML) {
        this.renderer.setProperty(newScript, 'innerHTML', oldScript.innerHTML);
      }
      
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    container.appendChild(fragment);
    this.renderer.appendChild(this.document.head, container);
    console.log(`[Tracking] Script carregado: ${scriptData.name}`);
    
    // Teste automático básico
    setTimeout(() => {
      const exists = this.document.getElementById('tracking-' + scriptData.id);
      console.log(exists ? `[Tracking] Verificação OK: ${scriptData.name}` : `[Tracking] Erro ao carregar script: ${scriptData.name}`);
    }, 500);
  }

  /**
   * Removes a script from the DOM.
   */
  removeScript(id: string) {
    const el = this.document.getElementById('tracking-' + id);
    if (el) {
      this.renderer.removeChild(this.document.head, el);
      console.log(`[Tracking] Script removido do DOM: tracking-${id}`);
    } else {
      console.log(`[Tracking] Script não encontrado no DOM para remoção: tracking-${id}`);
    }
  }

  /**
   * Refreshes all scripts (removes all and re-injects active ones).
   */
  refresh() {
    this.trackingService.scripts().forEach(s => this.removeScript(s.id));
    this.init();
  }
}
