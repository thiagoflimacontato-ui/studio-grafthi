
import { Injectable, inject, effect } from '@angular/core';
import { DbService } from './db.service';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private db = inject(DbService);
  private document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const settings = this.db.settings();
      const root = this.document.documentElement;

      const primary = settings.primaryColor || '#0f172a';
      const secondary = settings.secondaryColor || '#f97316';

      root.style.setProperty('--color-primary', primary);
      root.style.setProperty('--color-secondary', secondary);
    });
  }
}
