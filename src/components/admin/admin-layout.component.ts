
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- Just a wrapper, specific layout logic is in Dashboard -->
    <router-outlet></router-outlet>
  `
})
export class AdminLayoutComponent {}
