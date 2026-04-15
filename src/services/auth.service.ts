import { Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = signal<boolean>(false);

  constructor() {
    // Check if session exists
    const session = sessionStorage.getItem('grafthi_admin_session');
    if (session === 'true') {
      this._isAuthenticated.set(true);
    }
  }

  isAuthenticated() {
    return this._isAuthenticated();
  }

  login(email: string, pass: string): boolean {
    if (email === environment.adminAuth.email && pass === environment.adminAuth.password) {
      this._isAuthenticated.set(true);
      sessionStorage.setItem('grafthi_admin_session', 'true');
      return true;
    }
    return false;
  }

  logout() {
    this._isAuthenticated.set(false);
    sessionStorage.removeItem('grafthi_admin_session');
  }
}
