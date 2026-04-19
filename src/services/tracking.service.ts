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
  private sessionId: string = '';
  private userLocation: any = null;

  constructor() {
    this.initVisitorId();
    this.sessionId = crypto.randomUUID();
    this.initRouteTracking();
    this.fetchLocation();
  }

  private initVisitorId() {
    let id = localStorage.getItem('grafthi_visitor_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('grafthi_visitor_id', id);
    }
    this.visitorId = id;
  }

  private async fetchLocation() {
    try {
      // Usando ipapi.co (serviço gratuito com limites, seguro para uso básico)
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        this.userLocation = {
          city: data.city,
          country: data.country_name,
          region: data.region
        };
      }
    } catch (e) {
      console.warn('Falha ao obter geolocalização', e);
    }
  }

  private initRouteTracking() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.trackPageView(event.urlAfterRedirects);
    });
  }

  trackPageView(path: string) {
    this.addEvent(AnalyticsEventType.PAGE_VIEW, path, { url: window.location.href });
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

  private getDeviceInfo() {
    const ua = navigator.userAgent;
    let browser = 'Outro';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    let os = 'Outro';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'MacOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone')) os = 'iOS';
    else if (ua.includes('Linux')) os = 'Linux';

    const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop';
    
    return { browser, os, device, ua };
  }

  private async addEvent(type: AnalyticsEventType, path: string, metadata?: any) {
    // No ambiente de Preview do AI Studio, registramos mas também logamos para facilitar o teste do usuário
    const isPreview = window.location.protocol === 'blob:' || window.location.hostname.includes('aistudio-internal');
    
    if (isPreview) {
      console.log('[Tracking-Preview] Registrando evento:', type, metadata);
    }

    const { browser, os, device, ua } = this.getDeviceInfo();

    const event: AnalyticsEvent = {
      type,
      timestamp: new Date().toISOString(),
      path,
      visitorId: this.visitorId,
      sessionId: this.sessionId,
      referrer: document.referrer || 'Direto',
      userAgent: ua,
      device,
      os,
      browser,
      location: this.userLocation,
      metadata
    };
    
    this.db.addEvent(event);
  }
}
