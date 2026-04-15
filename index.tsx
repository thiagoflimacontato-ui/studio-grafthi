

import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling } from '@angular/router';
import { AppComponent } from './src/app.component';
import { routes } from './src/app.routes';
import { APP_BASE_HREF } from '@angular/common';

// Fix: Detect blob/preview environment to prevent History API errors
// In production (Vercel), this is false, enabling clean URLs for SEO.
// In preview (Blob), this is true, using Hash to prevent crashes.
const isBlob = window.location.protocol === 'blob:';
const useHash = isBlob || window.location.protocol === 'file:';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      ...(useHash ? [withHashLocation()] : [])
    ),
    {
      provide: APP_BASE_HREF,
      useValue: isBlob ? window.location.href.split('#')[0] : '/'
    }
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
