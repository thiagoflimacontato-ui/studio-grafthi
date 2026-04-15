
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DbService } from '../../services/db.service';
import { TrackingService } from '../../services/tracking.service';
import { Lead } from '../../models/types';

@Component({
  selector: 'app-direct-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="py-16 bg-slate-50 border-t border-slate-200">
      <div class="container mx-auto px-4">
        <!-- Changed max-w-4xl to max-w-6xl for wider layout -->
        <div class="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          
          <!-- Left Side: Call to Action (Dynamic Content) -->
          <div class="w-full md:w-5/12 bg-navy-900 p-8 md:p-12 text-white flex flex-col justify-center relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
               <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#FFFFFF" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.2,-19.2,95.8,-5.3C93.5,8.6,82.1,21.5,70.6,32.3C59.1,43.1,47.5,51.8,35.4,58.3C23.3,64.9,10.7,69.2,-1.2,71.3C-13.1,73.4,-25.1,73.2,-36.5,67.3C-47.9,61.4,-58.7,49.8,-66.7,36.7C-74.7,23.6,-79.9,9,-78.9,-5.1C-77.9,-19.2,-70.7,-32.8,-60.2,-43.3C-49.7,-53.8,-35.9,-61.2,-22.3,-68.8C-8.7,-76.4,4.7,-84.2,19.1,-84.9C33.5,-85.6,48.9,-79.2,44.7,-76.4Z" transform="translate(100 100)" />
               </svg>
            </div>
            
            <!-- Dynamic Content Injection -->
            <div [innerHTML]="db.settings().contactFormContent"></div>
            
          </div>

          <!-- Right Side: Form -->
          <div class="w-full md:w-7/12 p-8 md:p-12">
            <h3 class="text-2xl font-bold text-navy-900 mb-6">Fale Conosco Agora</h3>
            
            <form [formGroup]="contactForm" (ngSubmit)="submitForm()" class="space-y-5">
              
              <div>
                <label class="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Nome Completo</label>
                <input type="text" formControlName="name" class="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-navy-900 outline-none transition hover:bg-white text-sm" placeholder="Seu nome">
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label class="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">WhatsApp</label>
                  <input type="tel" formControlName="whatsapp" class="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-navy-900 outline-none transition hover:bg-white text-sm" placeholder="(DDD) 99999-9999">
                  @if (contactForm.get('whatsapp')?.invalid && contactForm.get('whatsapp')?.touched) {
                    <p class="text-red-500 text-[10px] font-bold mt-1 ml-4">Digite apenas números com DDD (mínimo 10 dígitos).</p>
                  }
                </div>
                <div>
                  <label class="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">E-mail</label>
                  <input type="email" formControlName="email" class="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-navy-900 outline-none transition hover:bg-white text-sm" placeholder="seu@email.com">
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">O que você está procurando?</label>
                <textarea formControlName="message" rows="3" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-navy-900 outline-none transition hover:bg-white text-sm" placeholder="Descreva sua necessidade..."></textarea>
              </div>

              <button 
                type="submit" 
                [disabled]="contactForm.invalid"
                class="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.074-.458.075-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                Enviar via WhatsApp
              </button>
              <p class="text-xs text-slate-400 text-center mt-2">Nossa equipe responderá o mais breve possível.</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  `
})
export class DirectContactFormComponent {
  public db = inject(DbService); 
  private tracking = inject(TrackingService);
  private fb: FormBuilder = inject(FormBuilder);

  contactForm: FormGroup;

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      // Allow only digits, typically 10-15 chars long for flexibility but strictness on content
      whatsapp: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  submitForm() {
    if (this.contactForm.valid) {
      const form = this.contactForm.value;
      this.tracking.trackWhatsAppClick('MSG FORMULARIO', 'Formulário de Contato Direto');

      // 1. WhatsApp Redirect Logic with Global Fallback & Safety
      let phone = this.db.settings().contactPhone?.replace(/\D/g, '') || '';
      
      if (!phone) {
        alert('Erro de Configuração: O número de WhatsApp de atendimento não foi definido no painel administrativo.');
        return;
      }

      // Auto-append Brazil Country Code (55) if missing and number is mobile length
      if (phone.length <= 11 && !phone.startsWith('55')) {
          phone = '55' + phone;
      }

      // 2. Create Lead Object (Backend Logic)
      const lead: Lead = {
        id: crypto.randomUUID(),
        name: form.name,
        email: form.email,
        whatsapp: form.whatsapp,
        productInterest: 'MSG FORMULARIO',
        configSummary: form.message,
        value: 0,
        status: 'Novo', // Changed back to Novo
        createdAt: new Date().toISOString()
      };

      // 3. Save to DB
      this.db.addLead(lead);

      // 4. WhatsApp Redirect
      const text = encodeURIComponent(`Olá, meu nome é ${form.name}, procuro por: ${form.message}`);
      
      // Open WhatsApp
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');

      // 5. Reset Form
      this.contactForm.reset();
    }
  }
}
