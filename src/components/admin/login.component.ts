
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-[calc(100vh-200px)] flex items-center justify-center bg-slate-100 px-4">
      <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-navy-900">
        <h2 class="text-2xl font-bold text-navy-900 mb-2 text-center">Acesso Administrativo</h2>
        <p class="text-slate-500 text-sm text-center mb-8">Studio Grafthi Dashboard</p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" formControlName="email" class="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-navy-900 outline-none transition">
          </div>

          <div>
             <label class="block text-sm font-medium text-slate-700 mb-1">Senha</label>
             <input type="password" formControlName="password" class="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-navy-900 outline-none transition">
          </div>

          @if (error) {
            <div class="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
              {{ error }}
            </div>
          }

          <button type="submit" class="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-3 rounded transition-colors shadow-lg">
            Entrar
          </button>
          
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  fb: FormBuilder = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);
  
  error = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit() {
    this.error = '';
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      if (this.auth.login(email!, password!)) {
        this.router.navigate(['/adminsg/dashboard']);
      } else {
        this.error = 'Credenciais inválidas.';
      }
    }
  }
}
