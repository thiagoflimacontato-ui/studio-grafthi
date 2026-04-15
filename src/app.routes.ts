
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CatalogComponent } from './components/catalog/catalog.component';
import { AdminLayoutComponent } from './components/admin/admin-layout.component';
import { LoginComponent } from './components/admin/login.component';
import { DashboardComponent } from './components/admin/dashboard.component';
import { TrackingSettingsComponent } from './app/admin/tracking/tracking-settings.component';
import { DynamicPageComponent } from './components/pages/dynamic-page.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

const adminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) {
    return true;
  }
  return router.parseUrl('/adminsg/login');
};

export const routes: Routes = [
  // 1. Static Routes (High Priority)
  { path: '', component: HomeComponent },
  { path: 'catalogo', component: CatalogComponent },
  
  // 2. Admin Routes (Must come before generic :slug to avoid conflict)
  { 
    path: 'adminsg', 
    component: AdminLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [adminGuard]
      },
      { 
        path: 'tracking', 
        component: TrackingSettingsComponent,
        canActivate: [adminGuard]
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // 3. Dynamic Pages at Root Level (SEO Friendly)
  // e.g., domain.com/contato instead of domain.com/pagina/contato
  { path: ':slug', component: DynamicPageComponent },

  // 4. Wildcard (404 Fallback)
  { path: '**', redirectTo: '' }
];
