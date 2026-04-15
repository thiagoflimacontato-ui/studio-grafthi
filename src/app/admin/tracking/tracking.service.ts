
import { Injectable, signal } from '@angular/core';

export interface TrackingScript {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private readonly STORAGE_KEY = 'tracking_scripts';
  
  scripts = signal<TrackingScript[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.scripts.set(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing tracking scripts from localStorage', e);
        this.scripts.set([]);
      }
    }
  }

  private saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.scripts()));
  }

  addScript(name: string, code: string) {
    const newScript: TrackingScript = {
      id: crypto.randomUUID(),
      name,
      code,
      active: true
    };
    this.scripts.update(list => [...list, newScript]);
    this.saveToStorage();
    return newScript;
  }

  updateScript(updated: TrackingScript) {
    this.scripts.update(list => list.map(s => s.id === updated.id ? updated : s));
    this.saveToStorage();
  }

  deleteScript(id: string) {
    console.log('[TrackingService] Deletando script:', id);
    this.scripts.update(list => list.filter(s => s.id !== id));
    this.saveToStorage();
  }

  toggleActive(id: string) {
    this.scripts.update(list => list.map(s => {
      if (s.id === id) {
        return { ...s, active: !s.active };
      }
      return s;
    }));
    this.saveToStorage();
  }
}
