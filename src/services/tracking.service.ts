
import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DbService } from './db.service';
import { AnalyticsEvent, AnalyticsEventType } from '../models/types';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private db = inject(DbService);
  private router = inject(Router);
  private visitorId: string = '';

  constructor() {
    this.initVisitorId();
    this.initRouteTracking();
  }

  private initVisitorId() {
    let id = localStorage.getItem('grafthi_visitor_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('grafthi_visitor_id', id);
    }
    this.visitorId = id;
  }

  private initRouteTracking() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.trackPageView(event.urlAfterRedirects);
    });
  }

  trackPageView(path: string) {
    this.addEvent(AnalyticsEventType.PAGE_VIEW, path);
  }

  trackProductView(productId: string, productTitle: string) {
    this.addEvent(AnalyticsEventType.PRODUCT_VIEW, this.router.url, { productId, productTitle });
  }

  trackClick(buttonName: string, label?: string, metadata?: any) {
    this.addEvent(AnalyticsEventType.CLICK, this.router.url, { buttonName, label, ...metadata });
  }

  trackWhatsAppClick(productId?: string, productTitle?: string) {
    this.addEvent(AnalyticsEventType.WHATSAPP_CLICK, this.router.url, { productId, productTitle });
  }

  trackCatalogAccess() {
    this.addEvent(AnalyticsEventType.CATALOG_ACCESS, this.router.url);
  }

  private addEvent(type: AnalyticsEventType, path: string, metadata?: any) {
    // No ambiente de Preview do AI Studio, registramos mas também logamos para facilitar o teste do usuário
    const isPreview = window.location.protocol === 'blob:' || window.location.hostname.includes('aistudio-internal');
    
    if (isPreview) {
      console.log('[Tracking-Preview] Registrando evento:', type, metadata);
    }

    const event: AnalyticsEvent = {
      id: crypto.randomUUID(),
      type,
      timestamp: new Date().toISOString(),
      path,
      visitorId: this.visitorId,
      metadata
    };
    this.db.addEvent(event);
  }
}
