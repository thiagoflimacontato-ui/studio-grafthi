
import { Component, inject, signal, computed, ChangeDetectorRef, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormsModule, FormArray } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DbService } from '../../services/db.service';
import { Router } from '@angular/router';
import { Product, PageContent, LeadStatus, Lead, Category, SiteSettings, FeatureCard, JourneyStep, KitFixoItem, KitVariavelItem, ProductType } from '../../models/types';
import { TrackingSettingsComponent } from '../../app/admin/tracking/tracking-settings.component';
import { MetricsDashboardComponent } from './metrics-dashboard.component';

const PRINT_OPTIONS = ['Offset', 'Digital', 'UV', 'Serigrafia', 'Sublimação'];
const PAPER_OPTIONS = [
  'Couchê 90g', 'Couchê 120g', 'Couchê 170g', 'Couchê 250g', 'Couchê 300g', 'Offset', 'Kraft', 'Reciclado', 'Adesivo', 'PVC',
  'Papel Sulfite (Comum)', 'Papel Offset 75g', 'Papel Offset 90g', 'Papel Offset 120g', 'Papel Kraft', 'Papel Reciclado', 'Papel Colorido (Escolar)', 'Cartolina', 'Papel Vergê', 'Papel Opaline', 'Papel Paraná (base rígida)', 'Papel Couchê caseiro (para impressora)',
  'Papel Fotográfico Glossy 115g', 'Papel Fotográfico Glossy 135g', 'Papel Fotográfico Glossy 180g', 'Papel Fotográfico Glossy 200g', 'Papel Fotográfico Glossy 230g', 'Papel Fotográfico Glossy 260g',
  'Papel Fotográfico Matte 108g', 'Papel Fotográfico Matte 120g', 'Papel Fotográfico Matte 180g', 'Papel Fotográfico Matte 200g', 'Papel Fotográfico Matte 230g',
  'Papel Adesivo Glossy', 'Papel Adesivo Matte', 'Papel Vinil Adesivo'
];
const FINISH_OPTIONS = [
  'Laminação fosca/brilho', 'Verniz localizado', 'Corte especial', 'Hot stamping', 'Refile', 'Furo', 'Dobra',
  'Corte reto (guilhotina simples)', 'Corte com tesoura', 'Corte com estilete', 'Corte em plotter', 'Arredondamento de cantos (manual)', 'Furo simples (furador comum)', 'Dobra manual', 'Laminação com contact (adesivo transparente)', 'Laminação simples (BOPP manual)', 'Plastificação (polaseal)', 'Aplicação de fita dupla face', 'Aplicação de ilhós manual', 'Colagem manual', 'Grampeado', 'Encadernação simples', 'Sem acabamento'
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TrackingSettingsComponent, MetricsDashboardComponent],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
      <!-- Admin Header -->
      <div class="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div class="container mx-auto px-6 py-4 flex justify-between items-center">
          <div class="flex items-center gap-3">
             <div class="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center text-white font-bold">SG</div>
             <h1 class="font-bold text-lg text-navy-900 tracking-tight">Studio Grafthi <span class="text-slate-400 font-normal">| Painel</span></h1>
          </div>
          <div class="flex items-center gap-6">
            <span class="text-sm text-slate-500 hidden md:block">Bem-vindo, Admin</span>
            <button (click)="logout()" class="text-sm text-red-600 hover:text-red-700 font-semibold border border-red-100 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition-all">
              Sair
            </button>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-8 flex-grow max-w-7xl">
        
        <!-- Navigation Tabs -->
        <div class="flex overflow-x-auto gap-1 mb-8 p-1 bg-white rounded-xl shadow-sm border border-slate-200 w-full md:w-fit mx-auto md:mx-0">
          <button (click)="activeTab.set('leads')" [class]="getTabClass('leads')">
            <span class="mr-2">📈</span> Métricas
          </button>
          <button (click)="activeTab.set('leads_bi')" [class]="getTabClass('leads_bi')">
            <span class="mr-2">📊</span> Leads (BI)
          </button>
          <button (click)="activeTab.set('products')" [class]="getTabClass('products')">
            <span class="mr-2">📦</span> Catálogo
          </button>
          <button (click)="activeTab.set('categories')" [class]="getTabClass('categories')">
            <span class="mr-2">🏷️</span> Categorias
          </button>
          <button (click)="activeTab.set('pages')" [class]="getTabClass('pages')">
            <span class="mr-2">📝</span> Páginas
          </button>
          <button (click)="activeTab.set('settings')" [class]="getTabClass('settings')">
            <span class="mr-2">⚙️</span> Configurações
          </button>
          <button (click)="activeTab.set('tracking')" [class]="getTabClass('tracking')">
            <span class="mr-2">🔍</span> Rastreamento / Pixels
          </button>
        </div>

        <!-- Content Area -->
        <div class="animate-fade-in">
          
          <!-- METRICS TAB -->
          @if (activeTab() === 'leads') {
            <app-metrics-dashboard />
          }

          <!-- LEADS TAB -->
          @if (activeTab() === 'leads_bi') {
             <!-- BI Metrics Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <!-- Total Leads Card -->
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total de Leads</p>
                    <h3 class="text-3xl font-extrabold text-navy-900 group-hover:text-blue-600 transition-colors">{{ metrics().total }}</h3>
                  </div>
                  <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.002 3.002 0 014.288 0M12 15a3 3 0 100-6 3 3 0 000 6z"/></svg>
                  </div>
                </div>
                <div class="flex items-center text-xs text-slate-500">
                  <span class="text-blue-500 font-bold bg-blue-50 px-1.5 py-0.5 rounded mr-2">Real-time</span>
                  <span>Captura ativa</span>
                </div>
              </div>

              <!-- Conversion Card -->
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Taxa de Conversão</p>
                    <h3 class="text-3xl font-extrabold text-navy-900 group-hover:text-green-600 transition-colors">{{ metrics().conversionRate }}%</h3>
                  </div>
                  <div class="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div class="bg-green-500 h-1.5 rounded-full transition-all duration-1000" [style.width.%]="metrics().conversionRate"></div>
                </div>
              </div>

              <!-- Revenue Card -->
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pipeline Estimado</p>
                    <h3 class="text-3xl font-extrabold text-navy-900 group-hover:text-orange-600 transition-colors tracking-tight">{{ metrics().revenue | currency:'BRL':'symbol':'1.0-0' }}</h3>
                  </div>
                  <div class="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors shadow-sm">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1h-4zm-1 13H7v-2h6v2z"/></svg>
                  </div>
                </div>
                <p class="text-xs text-slate-400">Somatória de leads em andamento/finalizados.</p>
              </div>

               <!-- Breakdown Card -->
               <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
                 <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Status dos Leads</h4>
                 <div class="space-y-3">
                    <div class="flex items-center justify-between text-sm">
                       <div class="flex items-center gap-2">
                          <span class="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
                          <span class="text-slate-600 font-medium">Pendente</span>
                       </div>
                       <span class="font-bold text-navy-900">{{ metrics().pendente }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                       <div class="flex items-center gap-2">
                          <span class="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                          <span class="text-slate-600 font-medium">Novos</span>
                       </div>
                       <span class="font-bold text-navy-900">{{ metrics().novo }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                       <div class="flex items-center gap-2">
                          <span class="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></span>
                          <span class="text-slate-600 font-medium">Atendimento</span>
                       </div>
                       <span class="font-bold text-navy-900">{{ metrics().emAtendimento }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                       <div class="flex items-center gap-2">
                          <span class="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                          <span class="text-slate-600 font-medium">Finalizados</span>
                       </div>
                       <span class="font-bold text-navy-900">{{ metrics().finalizado }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                       <div class="flex items-center gap-2">
                          <span class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                          <span class="text-slate-600 font-medium">Cancelados</span>
                       </div>
                       <span class="font-bold text-navy-900">{{ metrics().cancelado }}</span>
                    </div>
                 </div>
              </div>
            </div>

            <!-- List Header & Actions -->
            <div class="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
              <div>
                <h2 class="text-2xl font-bold text-navy-900">Leads Recentes</h2>
                <p class="text-slate-500 text-sm mt-1">Gerencie os contatos vindos do site e WhatsApp.</p>
              </div>
              
              <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-20">
                <!-- Custom Status Filter -->
                <div class="relative w-full sm:w-56">
                  <!-- Trigger Button -->
                  <button
                    (click)="showStatusDropdown.set(!showStatusDropdown())"
                    class="w-full flex items-center justify-between pl-4 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all shadow-sm group">
                    
                    <div class="flex items-center gap-2">
                      @if(filterStatus()) {
                         <span class="w-2.5 h-2.5 rounded-full shadow-sm" [class]="getStatusColorDot(filterStatus())"></span>
                      } @else {
                        <span class="text-slate-400">🔍</span>
                      }
                      <span [class.text-navy-900]="filterStatus()" [class.font-bold]="filterStatus()">
                        {{ filterStatus() || 'Todos os Status' }}
                      </span>
                    </div>

                    <svg class="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:text-orange-500" [class.rotate-180]="showStatusDropdown()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  </button>

                  <!-- Backdrop -->
                  @if(showStatusDropdown()) {
                    <div class="fixed inset-0 z-10" (click)="showStatusDropdown.set(false)"></div>
                  }

                  <!-- Dropdown Menu -->
                  @if(showStatusDropdown()) {
                    <div class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in-down max-h-72 overflow-y-auto">
                      <div class="py-1">
                        <button (click)="selectStatusFilter('')" class="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50">
                           <span class="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
                           <span class="text-slate-600">Todos os Status</span>
                           @if(filterStatus() === '') { <span class="ml-auto text-orange-500 font-bold">✓</span> }
                        </button>
                        
                        @for(status of ['Pendente', 'Novo', 'Em Atendimento', 'Finalizado', 'Cancelado']; track status) {
                           <button (click)="selectStatusFilter(status)" class="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex items-center gap-3 transition-colors">
                              <span class="w-2.5 h-2.5 rounded-full shadow-sm" [class]="getStatusColorDot(status)"></span>
                              <span class="text-slate-700" [class.font-bold]="filterStatus() === status">{{ status }}</span>
                              @if(filterStatus() === status) { <span class="ml-auto text-orange-500 font-bold">✓</span> }
                           </button>
                        }
                      </div>
                    </div>
                  }
                </div>

                <!-- Search -->
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <input 
                      #searchInput
                      type="text" 
                      placeholder="Buscar por nome, email..."
                      [value]="searchTerm()"
                      (input)="searchTerm.set(searchInput.value)"
                      class="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition shadow-sm"
                  />
                </div>
                
                <!-- Export Button -->
                <button (click)="exportLeads()" class="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition shadow-md hover:shadow-lg">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Exportar CSV
                </button>
              </div>
            </div>
            
            <!-- Modern Table -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-slate-50 border-b border-slate-200">
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Produto de Interesse</th>
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor Est.</th>
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (lead of filteredLeads(); track lead.id) {
                      <tr 
                        class="hover:bg-blue-50/50 transition-colors duration-200 group border-l-4"
                        [class.border-purple-500]="lead.status === 'Pendente'"
                        [class.bg-purple-50]="lead.status === 'Pendente'"
                        [class.bg-opacity-30]="lead.status === 'Pendente'"
                        [class.border-blue-500]="lead.status === 'Novo'"
                        [class.bg-blue-50]="lead.status === 'Novo'"
                        [class.border-transparent]="lead.status !== 'Novo' && lead.status !== 'Pendente'">
                        
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          <div class="flex flex-col">
                            <span class="font-bold text-navy-900">{{ lead.createdAt | date:'dd/MM' }}</span>
                            <span class="text-xs text-slate-400">{{ lead.createdAt | date:'HH:mm' }}</span>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs relative">
                              {{ lead.name.charAt(0).toUpperCase() }}
                              @if (lead.status === 'Novo') {
                                <span class="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                  <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                </span>
                              }
                              @if (lead.status === 'Pendente') {
                                <span class="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span class="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                                </span>
                              }
                            </div>
                            <div>
                              <div class="font-bold text-navy-900 text-sm">{{ lead.name }}</div>
                              <div class="text-xs text-slate-500">{{ lead.email }}</div>
                              <div class="text-xs text-slate-400">{{ lead.whatsapp }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="text-sm font-semibold text-slate-700">{{ lead.productInterest }}</div>
                          <div class="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate opacity-80 group-hover:opacity-100 transition-opacity" [title]="lead.configSummary">
                            {{ lead.configSummary }}
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                           <span class="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                             {{ lead.value | currency:'BRL' }}
                           </span>
                        </td>
                        <td class="px-6 py-4 text-center">
                          <div class="relative inline-block">
                            <button type="button"
                              (click)="toggleDropdown('status-' + lead.id)"
                              [class]="getStatusClass(lead.status)"
                              class="pl-3 pr-8 py-1.5 rounded-full text-xs font-bold cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-navy-900 outline-none border-none shadow-sm transition-all hover:shadow-md text-center min-w-[120px] flex items-center justify-center gap-2 relative">
                              {{ lead.status }}
                              <svg class="w-3 h-3 absolute right-2.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                            </button>

                            @if (openProductDropdown() === 'status-' + lead.id) {
                              <div class="fixed inset-0 z-40" (click)="openProductDropdown.set(null)"></div>
                              <div class="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-down min-w-[150px]">
                                <div class="py-1">
                                  @for (status of ['Novo', 'Pendente', 'Em Atendimento', 'Finalizado', 'Cancelado']; track status) {
                                    <button type="button" 
                                      (click)="updateLeadStatus(lead, status); openProductDropdown.set(null)"
                                      class="w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-between"
                                      [class.text-navy-900]="lead.status === status"
                                      [class.bg-slate-50]="lead.status === status">
                                      <span class="flex items-center gap-2">
                                        <span class="w-2 h-2 rounded-full" [class]="getStatusDotClass(status)"></span>
                                        {{ status }}
                                      </span>
                                      @if(lead.status === status) { <span class="text-navy-900">✓</span> }
                                    </button>
                                  }
                                </div>
                              </div>
                            }
                          </div>
                        </td>
                        <td class="px-6 py-4 text-center">
                          <div class="flex items-center justify-center gap-1">
                            <button (click)="viewLead(lead)" class="text-slate-500 hover:text-navy-900 transition-colors p-2 rounded-full hover:bg-slate-100" title="Ver Detalhes">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            </button>
                            <button (click)="confirmDeleteLead(lead.id); $event.stopPropagation()" class="text-red-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50" title="Excluir Lead">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                    @if (filteredLeads().length === 0) {
                      <tr>
                        <td colspan="6" class="px-6 py-16 text-center">
                          <div class="flex flex-col items-center justify-center text-slate-400">
                             <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                               <svg class="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                             </div>
                             <p class="text-lg font-medium text-slate-500">
                                {{ searchTerm() ? 'Nenhum lead encontrado para "' + searchTerm() + '"' : 'Nenhum lead capturado ainda' }}
                             </p>
                             <p class="text-sm mt-1">Aguarde novos contatos ou ajuste seus filtros.</p>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
                <span>Mostrando {{ filteredLeads().length }} registros</span>
                <span>Atualização em tempo real</span>
              </div>
            </div>

            <!-- Lead Details Modal -->
            @if (selectedLead()) {
              <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" (click)="closeLeadModal()"></div>
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 flex flex-col overflow-hidden animate-fade-in-up">
                  <div class="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 class="text-lg font-bold text-navy-900">Detalhes do Lead</h3>
                    <button (click)="closeLeadModal()" class="text-slate-400 hover:text-navy-900">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                  <div class="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
                     <h2 class="text-2xl font-bold">{{ selectedLead()?.name }}</h2>
                     <p><strong>Email:</strong> {{ selectedLead()?.email }}</p>
                     <p><strong>WhatsApp:</strong> {{ selectedLead()?.whatsapp }}</p>
                     
                     <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Valor Negociado (R$)</label>
                        <div class="relative max-w-[200px]">
                           <span class="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">R$</span>
                           <input 
                              type="number" 
                              [value]="selectedLead()?.value" 
                              (input)="updateLeadValue(selectedLead()?.id!, $event)"
                              class="w-full border border-slate-300 rounded-lg py-2 pl-10 pr-3 focus:ring-2 focus:ring-navy-900 outline-none transition bg-slate-50 focus:bg-white font-bold text-navy-900"
                           >
                        </div>
                        <p class="text-[10px] text-slate-400 mt-1">Este valor reflete no Pipeline Estimado do BI.</p>
                     </div>

                     <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p class="text-sm">{{ selectedLead()?.configSummary }}</p>
                     </div>
                  </div>
                   <div class="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
                     <button (click)="confirmDeleteLead(selectedLead()?.id!); $event.stopPropagation()" class="text-red-600 hover:text-red-700 font-bold text-sm">Excluir</button>
                     <button (click)="closeLeadModal()" class="bg-navy-900 text-white font-bold px-6 py-2 rounded">Fechar</button>
                   </div>
                </div>
              </div>
            }
          }

          <!-- PRODUCTS TAB -->
          @if (activeTab() === 'products') {
             <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold text-navy-900">Gerenciar Catálogo</h2>
              <button class="bg-navy-900 text-white px-4 py-2 rounded hover:bg-navy-800 text-sm font-bold flex items-center gap-2" (click)="startEditProduct(null)">
                <span>+</span> Novo Produto
              </button>
            </div>
            
            @if (!editingProduct && !isCreatingProduct) {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 @for (prod of db.products(); track prod.id) {
                   <div class="border border-slate-200 rounded-lg p-4 flex gap-4 bg-white hover:shadow-md transition">
                     <img [src]="prod.imageUrl" class="w-24 h-24 object-cover rounded bg-slate-100 flex-shrink-0">
                     <div class="flex-grow">
                         <h3 class="font-bold text-navy-900">{{ prod.title }}</h3>
                         <div class="flex gap-2 mt-2">
                             <button (click)="startEditProduct(prod)" class="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded font-bold">Editar</button>
                             <button (click)="deleteProduct(prod.id); $event.stopPropagation()" class="text-xs bg-red-50 text-red-700 px-3 py-1 rounded font-bold">Excluir</button>
                         </div>
                     </div>
                   </div>
                 }
              </div>
            } @else {
               <!-- MODAL OVERLAY -->
               <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
                  <!-- MODAL CONTAINER -->
                  <div class="w-full max-w-4xl max-h-[95vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-fade-in-up">
                     
                     <!-- Form Header (Fixed) -->
                     <div class="bg-white px-8 py-5 flex justify-between items-center shrink-0 border-b border-slate-100">
                         <h3 class="text-xl font-bold text-slate-900">{{ editingProduct ? 'Editar ' + (productForm.get('title')?.value || 'Produto') : 'Novo Produto' }}</h3>
                         <button (click)="cancelEditProduct()" class="text-slate-400 hover:text-slate-600 transition-all text-xl">✕</button>
                     </div>

                     <!-- Product Type Tabs (Fixed) -->
                     <div class="flex border-b border-slate-200 bg-slate-50 shrink-0">
                       <button type="button" 
                         (click)="productForm.get('type')?.setValue('simple_batch')" 
                         [class]="productForm.get('type')?.value === 'simple_batch' ? 'border-orange-500 text-orange-600 bg-white' : 'border-transparent text-slate-500 hover:text-navy-900'"
                         class="flex-1 py-4 px-6 text-center font-bold text-sm border-b-2 transition-all flex items-center justify-center gap-2">
                         <span>📦</span> Produto Simples
                       </button>
                       <button type="button" 
                         (click)="productForm.get('type')?.setValue('variable_kit')" 
                         [class]="productForm.get('type')?.value === 'variable_kit' ? 'border-orange-500 text-orange-600 bg-white' : 'border-transparent text-slate-500 hover:text-navy-900'"
                         class="flex-1 py-4 px-6 text-center font-bold text-sm border-b-2 transition-all flex items-center justify-center gap-2">
                         <span>✨</span> Kit Variável
                       </button>
                       <button type="button" 
                         (click)="productForm.get('type')?.setValue('fixed_kit')" 
                         [class]="productForm.get('type')?.value === 'fixed_kit' ? 'border-orange-500 text-orange-600 bg-white' : 'border-transparent text-slate-500 hover:text-navy-900'"
                         class="flex-1 py-4 px-6 text-center font-bold text-sm border-b-2 transition-all flex items-center justify-center gap-2">
                         <span>🎁</span> Kit Fixo
                       </button>
                     </div>

                     <!-- Scrollable Content -->
                     <div class="overflow-y-auto flex-grow">
                        <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="flex flex-col min-h-full">
                            <div class="p-8 space-y-8 flex-grow">
                             
                             @if (saveMessage()) { 
                               <div class="p-4 rounded-xl border flex items-center gap-3 animate-fade-in" [class]="saveMessage()?.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'">
                                   <span class="text-2xl">{{ saveMessage()?.type === 'success' ? '✅' : '⚠️' }}</span>
                                   <span class="font-bold">{{ saveMessage()?.text }}</span>
                               </div> 
                             }

                             <div class="space-y-8">
                                <!-- SECTION: BASIC INFO -->
                                <div class="space-y-6">
                                    <div class="flex items-center gap-2 text-navy-900 font-bold border-b border-slate-100 pb-2">
                                      <span class="w-1.5 h-5 bg-orange-500 rounded-full"></span>
                                      Informações do Produto
                                    </div>

                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div class="space-y-1.5">
                                          <label class="block text-sm font-bold text-slate-700">Nome</label>
                                          <input formControlName="title" placeholder="Ex: Tag Quadrada 5x5cm" class="w-full border border-slate-300 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-slate-50 focus:bg-white">
                                      </div>
                                      <div class="space-y-1.5">
                                          <label class="block text-sm font-bold text-slate-700">Categoria</label>
                                          <div class="relative">
                                              <button type="button" 
                                                  (click)="toggleDropdown('category')"
                                                  class="w-full flex items-center justify-between border border-slate-300 rounded-xl p-3.5 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 focus:ring-2 focus:ring-orange-500 transition-all text-slate-700 font-medium text-left">
                                                  <span>{{ getCategoryName(productForm.get('categoryId')?.value) }}</span>
                                                  <svg class="h-4 w-4 text-slate-400 transition-transform duration-200" [class.rotate-180]="openProductDropdown() === 'category'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                                              </button>
                                              
                                              @if (openProductDropdown() === 'category') {
                                                  <div class="fixed inset-0 z-40" (click)="openProductDropdown.set(null)"></div>
                                                  <div class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-down max-h-60 overflow-y-auto">
                                                      <div class="py-1">
                                                          <button type="button" (click)="selectOption('categoryId', '', 'category')" class="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 text-slate-400">
                                                              Selecione uma categoria
                                                          </button>
                                                          @for (cat of db.categories(); track cat.id) {
                                                              <button type="button" 
                                                                  (click)="selectOption('categoryId', cat.id, 'category')" 
                                                                  class="w-full text-left px-4 py-3 text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center justify-between"
                                                                  [class.bg-orange-50]="productForm.get('categoryId')?.value === cat.id"
                                                                  [class.text-orange-700]="productForm.get('categoryId')?.value === cat.id"
                                                                  [class.font-bold]="productForm.get('categoryId')?.value === cat.id">
                                                                  {{ cat.name }}
                                                                  @if(productForm.get('categoryId')?.value === cat.id) { <span class="text-orange-500">✓</span> }
                                                              </button>
                                                          }
                                                      </div>
                                                  </div>
                                              }
                                          </div>
                                      </div>
                                    </div>

                                    <div class="space-y-1.5">
                                        <label class="block text-sm font-bold text-slate-700">Descrição do Produto</label>
                                        <textarea formControlName="description" rows="3" placeholder="Descreva os diferenciais e detalhes do produto..." class="w-full border border-slate-300 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-slate-50 focus:bg-white"></textarea>
                                    </div>

                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div class="space-y-1.5">
                                          <label class="block text-sm font-bold text-slate-700">URL da Imagem de Capa</label>
                                          <div class="flex gap-3">
                                            <div class="relative flex-grow">
                                              <input formControlName="imageUrl" placeholder="Cole aqui o link da imagem (ex: https://...)" class="w-full border border-slate-300 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-slate-50 focus:bg-white pr-10">
                                              @if(productForm.get('imageUrl')?.value && productForm.get('imageUrl')?.valid) {
                                                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</span>
                                              }
                                            </div>
                                            @if(productForm.get('imageUrl')?.value) {
                                              <div class="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden shrink-0 shadow-sm bg-slate-50 flex items-center justify-center">
                                                <img [src]="productForm.get('imageUrl')?.value" (error)="$event.target.src = 'https://placehold.co/100x100?text=Erro+Link'" class="w-full h-full object-cover">
                                              </div>
                                            }
                                          </div>
                                          <p class="text-[10px] text-slate-400">Use links diretos de imagens (JPG, PNG, WEBP).</p>
                                      </div>
                                      <div class="space-y-1.5">
                                          <label class="block text-sm font-bold text-slate-700">Prazo de Produção (Opcional)</label>
                                          <input formControlName="productionTime" placeholder="Ex: 3 a 5 dias úteis" class="w-full border border-slate-300 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-slate-50 focus:bg-white">
                                      </div>
                                    </div>
                                </div>

                                <!-- SECTION: TECHNICAL SPECS -->
                                @if (productForm.get('type')?.value !== 'variable_kit') {
                                    <div class="space-y-6">
                                        <div class="flex items-center gap-2 text-navy-900 font-bold border-b border-slate-100 pb-2">
                                          <span class="w-1.5 h-5 bg-amber-500 rounded-full"></span>
                                          Especificações Técnicas
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div class="space-y-1.5">
                                                <label class="block text-sm font-bold text-slate-700">Tamanho (cm)</label>
                                                <input formControlName="size" placeholder="4x5" class="w-full border border-slate-300 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-slate-50 focus:bg-white">
                                            </div>
                                            <div class="space-y-1.5">
                                                <label class="block text-sm font-bold text-slate-700">Impressão</label>
                                                <div class="relative">
                                                    <button type="button" 
                                                        (click)="toggleDropdown('printType')"
                                                        class="w-full flex items-center justify-between border border-slate-300 rounded-xl p-3.5 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 focus:ring-2 focus:ring-orange-500 transition-all text-slate-700 font-medium text-left">
                                                        <span>{{ getSelectedLabel('printType', 'Selecione') }}</span>
                                                        <svg class="h-4 w-4 text-slate-400 transition-transform duration-200" [class.rotate-180]="openProductDropdown() === 'printType'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                                                    </button>
                                                    
                                                    @if (openProductDropdown() === 'printType') {
                                                        <div class="fixed inset-0 z-40" (click)="openProductDropdown.set(null)"></div>
                                                        <div class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-down max-h-60 overflow-y-auto">
                                                            <div class="py-1">
                                                                <button type="button" (click)="selectOption('printType', '', 'printType')" class="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 text-slate-400">
                                                                    Selecione
                                                                </button>
                                                                @for (opt of printOptions; track opt) {
                                                                    <button type="button" 
                                                                        (click)="selectOption('printType', opt, 'printType')" 
                                                                        class="w-full text-left px-4 py-3 text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center justify-between"
                                                                        [class.bg-orange-50]="productForm.get('printType')?.value === opt"
                                                                        [class.text-orange-700]="productForm.get('printType')?.value === opt"
                                                                        [class.font-bold]="productForm.get('printType')?.value === opt">
                                                                        {{ opt }}
                                                                        @if(productForm.get('printType')?.value === opt) { <span class="text-orange-500">✓</span> }
                                                                    </button>
                                                                }
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div class="space-y-1.5">
                                                <label class="block text-sm font-bold text-slate-700">Papel</label>
                                                <div class="relative">
                                                    <button type="button" 
                                                        (click)="toggleDropdown('paper')"
                                                        class="w-full flex items-center justify-between border border-slate-300 rounded-xl p-3.5 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 focus:ring-2 focus:ring-orange-500 transition-all text-slate-700 font-medium text-left">
                                                        <span>{{ getSelectedLabel('paper', 'Selecione') }}</span>
                                                        <svg class="h-4 w-4 text-slate-400 transition-transform duration-200" [class.rotate-180]="openProductDropdown() === 'paper'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                                                    </button>
                                                    
                                                    @if (openProductDropdown() === 'paper') {
                                                        <div class="fixed inset-0 z-40" (click)="openProductDropdown.set(null)"></div>
                                                        <div class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-down max-h-60 overflow-y-auto">
                                                            <div class="py-1">
                                                                <button type="button" (click)="selectOption('paper', '', 'paper')" class="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 text-slate-400">
                                                                    Selecione
                                                                </button>
                                                                @for (opt of paperOptions; track opt) {
                                                                    <button type="button" 
                                                                        (click)="selectOption('paper', opt, 'paper')" 
                                                                        class="w-full text-left px-4 py-3 text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center justify-between"
                                                                        [class.bg-orange-50]="productForm.get('paper')?.value === opt"
                                                                        [class.text-orange-700]="productForm.get('paper')?.value === opt"
                                                                        [class.font-bold]="productForm.get('paper')?.value === opt">
                                                                        {{ opt }}
                                                                        @if(productForm.get('paper')?.value === opt) { <span class="text-orange-500">✓</span> }
                                                                    </button>
                                                                }
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div class="space-y-1.5">
                                                <label class="block text-sm font-bold text-slate-700">Acabamento</label>
                                                <div class="relative">
                                                    <button type="button" 
                                                        (click)="toggleDropdown('finishing')"
                                                        class="w-full flex items-center justify-between border border-slate-300 rounded-xl p-3.5 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 focus:ring-2 focus:ring-orange-500 transition-all text-slate-700 font-medium text-left">
                                                        <span>{{ getSelectedLabel('finishing', 'Selecione') }}</span>
                                                        <svg class="h-4 w-4 text-slate-400 transition-transform duration-200" [class.rotate-180]="openProductDropdown() === 'finishing'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                                                    </button>
                                                    
                                                    @if (openProductDropdown() === 'finishing') {
                                                        <div class="fixed inset-0 z-40" (click)="openProductDropdown.set(null)"></div>
                                                        <div class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-down max-h-60 overflow-y-auto">
                                                            <div class="py-1">
                                                                <button type="button" (click)="selectOption('finishing', '', 'finishing')" class="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 text-slate-400">
                                                                    Selecione
                                                                </button>
                                                                @for (opt of finishOptions; track opt) {
                                                                    <button type="button" 
                                                                        (click)="selectOption('finishing', opt, 'finishing')" 
                                                                        class="w-full text-left px-4 py-3 text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center justify-between"
                                                                        [class.bg-orange-50]="productForm.get('finishing')?.value === opt"
                                                                        [class.text-orange-700]="productForm.get('finishing')?.value === opt"
                                                                        [class.font-bold]="productForm.get('finishing')?.value === opt">
                                                                        {{ opt }}
                                                                        @if(productForm.get('finishing')?.value === opt) { <span class="text-orange-500">✓</span> }
                                                                    </button>
                                                                }
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }

                                <!-- SECTION: FIXED KIT ITEMS -->
                                @if (productForm.get('type')?.value === 'fixed_kit') {
                                    <div class="space-y-6" formArrayName="items">
                                        <div class="flex justify-between items-center border-b border-slate-100 pb-2">
                                            <div class="flex items-center gap-2 text-navy-900 font-bold">
                                              <span class="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                                              Itens Inclusos no Kit
                                            </div>
                                            <button type="button" (click)="addKitItem()" class="text-xs bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full font-bold hover:bg-indigo-100 transition flex items-center gap-1">
                                                <span>+</span> Adicionar Item
                                            </button>
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            @for (item of kitItems.controls; track item; let i = $index) {
                                                <div [formGroupName]="i" class="flex gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 group relative">
                                                    <div class="flex-grow space-y-3">
                                                        <input formControlName="productName" placeholder="Nome do Produto (ex: 100 Cartões)" class="w-full border-b border-slate-300 bg-transparent py-1 text-sm font-bold outline-none focus:border-indigo-500">
                                                        <input formControlName="size" placeholder="Tamanho (ex: 9x5cm)" class="w-full border-b border-slate-300 bg-transparent py-1 text-sm outline-none focus:border-indigo-500">
                                                    </div>
                                                    <button type="button" (click)="removeKitItem(i)" class="text-slate-300 hover:text-red-500 transition-colors">✕</button>
                                                </div>
                                            }
                                            @if(kitItems.length === 0) {
                                              <div class="col-span-full py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-sm">
                                                Nenhum item adicionado ao kit fixo ainda.
                                              </div>
                                            }
                                        </div>
                                    </div>
                                }

                                <!-- SECTION: VARIABLE KIT ITEMS -->
                                @if (productForm.get('type')?.value === 'variable_kit') {
                                    <div class="space-y-6">
                                        <div formArrayName="variableItems" class="space-y-6">
                                            <div class="flex justify-between items-center border-b border-slate-100 pb-2">
                                            <div class="flex items-center gap-2 text-navy-900 font-bold">
                                              <span class="w-1.5 h-5 bg-purple-500 rounded-full"></span>
                                              Configuração dos Itens do Kit
                                            </div>
                                            <button type="button" (click)="addVariableItem()" class="text-xs bg-purple-50 text-purple-600 px-4 py-2 rounded-full font-bold hover:bg-purple-100 transition flex items-center gap-1">
                                                <span>+</span> Novo Item Customizável
                                            </button>
                                        </div>
                                        <div class="grid grid-cols-1 gap-6">
                                            @for (item of variableItems.controls; track item; let i = $index) {
                                                <div [formGroupName]="i" class="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative">
                                                    <div class="flex justify-between items-center">
                                                        <div class="flex items-center gap-3">
                                                          <span class="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">#{{i+1}}</span>
                                                          <input formControlName="title" placeholder="Título do Item (ex: Adesivo Redondo)" class="bg-transparent border-b border-slate-300 py-1 text-lg font-bold outline-none focus:border-purple-500 min-w-[250px]">
                                                        </div>
                                                        <button type="button" (click)="removeVariableItem(i)" class="text-red-400 hover:text-red-600 text-xs font-bold flex items-center gap-1">
                                                          <span>🗑️</span> Remover
                                                        </button>
                                                    </div>
                                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div class="space-y-1.5">
                                                          <label class="block text-xs font-bold text-slate-700 uppercase">Tamanho</label>
                                                          <input formControlName="size" placeholder="Ex: 5x5cm" class="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-500">
                                                        </div>
                                                        <div class="space-y-1.5">
                                                          <label class="block text-xs font-bold text-slate-700 uppercase">Impressão</label>
                                                          <div class="relative">
                                                            <button type="button" 
                                                              (click)="toggleDropdown('printType-' + i)"
                                                              class="w-full flex items-center justify-between border border-slate-300 rounded-xl p-3 text-sm outline-none bg-slate-50 hover:bg-slate-100 hover:border-slate-400 focus:ring-2 focus:ring-purple-500 transition-all text-slate-700 font-medium text-left">
                                                              <span>{{ getVariableItemLabel(i, 'printType', 'Selecione') }}</span>
                                                              <svg class="h-4 w-4 text-slate-400 transition-transform duration-200" [class.rotate-180]="openProductDropdown() === 'printType-' + i" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                                                            </button>
                                                            
                                                            @if (openProductDropdown() === 'printType-' + i) {
                                                              <div class="fixed inset-0 z-40" (click)="openProductDropdown.set(null)"></div>
                                                              <div class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-down max-h-48 overflow-y-auto">
                                                                <div class="py-1">
                                                                  <button type="button" (click)="selectVariableItemOption(i, 'printType', '', 'printType-' + i)" class="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 text-slate-400">
                                                                    Selecione
                                                                  </button>
                                                                  @for (opt of printOptions; track opt) {
                                                                    <button type="button" 
                                                                      (click)="selectVariableItemOption(i, 'printType', opt, 'printType-' + i)" 
                                                                      class="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center justify-between"
                                                                      [class.bg-purple-50]="getVariableItemLabel(i, 'printType', '') === opt"
                                                                      [class.text-purple-700]="getVariableItemLabel(i, 'printType', '') === opt"
                                                                      [class.font-bold]="getVariableItemLabel(i, 'printType', '') === opt">
                                                                      {{ opt }}
                                                                      @if(getVariableItemLabel(i, 'printType', '') === opt) { <span class="text-purple-500">✓</span> }
                                                                    </button>
                                                                  }
                                                                </div>
                                                              </div>
                                                            }
                                                          </div>
                                                        </div>
                                                        <div class="space-y-1.5">
                                                          <label class="block text-xs font-bold text-slate-700 uppercase">Papel</label>
                                                          <div class="relative">
                                                            <button type="button" 
                                                              (click)="toggleDropdown('paper-' + i)"
                                                              class="w-full flex items-center justify-between border border-slate-300 rounded-xl p-3 text-sm outline-none bg-slate-50 hover:bg-slate-100 hover:border-slate-400 focus:ring-2 focus:ring-purple-500 transition-all text-slate-700 font-medium text-left">
                                                              <span>{{ getVariableItemLabel(i, 'paper', 'Selecione') }}</span>
                                                              <svg class="h-4 w-4 text-slate-400 transition-transform duration-200" [class.rotate-180]="openProductDropdown() === 'paper-' + i" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                                                            </button>
                                                            
                                                            @if (openProductDropdown() === 'paper-' + i) {
                                                              <div class="fixed inset-0 z-40" (click)="openProductDropdown.set(null)"></div>
                                                              <div class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-down max-h-48 overflow-y-auto">
                                                                <div class="py-1">
                                                                  <button type="button" (click)="selectVariableItemOption(i, 'paper', '', 'paper-' + i)" class="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 text-slate-400">
                                                                    Selecione
                                                                  </button>
                                                                  @for (opt of paperOptions; track opt) {
                                                                    <button type="button" 
                                                                      (click)="selectVariableItemOption(i, 'paper', opt, 'paper-' + i)" 
                                                                      class="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center justify-between"
                                                                      [class.bg-purple-50]="getVariableItemLabel(i, 'paper', '') === opt"
                                                                      [class.text-purple-700]="getVariableItemLabel(i, 'paper', '') === opt"
                                                                      [class.font-bold]="getVariableItemLabel(i, 'paper', '') === opt">
                                                                      {{ opt }}
                                                                      @if(getVariableItemLabel(i, 'paper', '') === opt) { <span class="text-purple-500">✓</span> }
                                                                    </button>
                                                                  }
                                                                </div>
                                                              </div>
                                                            }
                                                          </div>
                                                        </div>
                                                        <div class="space-y-1.5">
                                                          <label class="block text-xs font-bold text-slate-700 uppercase">Acabamento</label>
                                                          <div class="relative">
                                                            <button type="button" 
                                                              (click)="toggleDropdown('finishing-' + i)"
                                                              class="w-full flex items-center justify-between border border-slate-300 rounded-xl p-3 text-sm outline-none bg-slate-50 hover:bg-slate-100 hover:border-slate-400 focus:ring-2 focus:ring-purple-500 transition-all text-slate-700 font-medium text-left">
                                                              <span>{{ getVariableItemLabel(i, 'finishing', 'Selecione') }}</span>
                                                              <svg class="h-4 w-4 text-slate-400 transition-transform duration-200" [class.rotate-180]="openProductDropdown() === 'finishing-' + i" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                                                            </button>
                                                            
                                                            @if (openProductDropdown() === 'finishing-' + i) {
                                                              <div class="fixed inset-0 z-40" (click)="openProductDropdown.set(null)"></div>
                                                              <div class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-down max-h-48 overflow-y-auto">
                                                                <div class="py-1">
                                                                  <button type="button" (click)="selectVariableItemOption(i, 'finishing', '', 'finishing-' + i)" class="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 text-slate-400">
                                                                    Selecione
                                                                  </button>
                                                                  @for (opt of finishOptions; track opt) {
                                                                    <button type="button" 
                                                                      (click)="selectVariableItemOption(i, 'finishing', opt, 'finishing-' + i)" 
                                                                      class="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center justify-between"
                                                                      [class.bg-purple-50]="getVariableItemLabel(i, 'finishing', '') === opt"
                                                                      [class.text-purple-700]="getVariableItemLabel(i, 'finishing', '') === opt"
                                                                      [class.font-bold]="getVariableItemLabel(i, 'finishing', '') === opt">
                                                                      {{ opt }}
                                                                      @if(getVariableItemLabel(i, 'finishing', '') === opt) { <span class="text-purple-500">✓</span> }
                                                                    </button>
                                                                  }
                                                                </div>
                                                              </div>
                                                            }
                                                          </div>
                                                        </div>
                                                        <div class="space-y-1.5 md:col-span-2">
                                                          <label class="block text-xs font-bold text-slate-700 uppercase">URL da Imagem do Item</label>
                                                          <div class="flex gap-2">
                                                            <div class="relative flex-grow">
                                                              <input formControlName="image" placeholder="Cole aqui o link da imagem..." class="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-500 pr-8">
                                                              @if(item.get('image')?.value) {
                                                                <span class="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 text-xs">✓</span>
                                                              }
                                                            </div>
                                                            @if(item.get('image')?.value) {
                                                              <img [src]="item.get('image')?.value" (error)="$event.target.src = 'https://placehold.co/100x100?text=Erro'" class="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-slate-50">
                                                            }
                                                          </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                            @if(variableItems.length === 0) {
                                              <div class="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                                                Adicione pelo menos um item customizável ao kit.
                                              </div>
                                            }
                                        </div>
                                        </div>
                                        <div class="bg-purple-600 p-6 rounded-2xl text-white shadow-lg">
                                            <label class="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Preço Base do Kit Variável</label>
                                            <div class="relative max-w-[250px]">
                                              <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg">R$</span>
                                              <input type="number" formControlName="basePrice" placeholder="0.00" class="w-full bg-white/10 border border-white/20 rounded-xl py-4 pl-12 pr-4 text-2xl font-bold outline-none focus:bg-white/20 transition-all placeholder:text-white/30">
                                            </div>
                                            <p class="text-[10px] mt-3 opacity-70 italic">* Este valor será o ponto de partida para o orçamento no WhatsApp.</p>
                                        </div>
                                    </div>
                                }

                                <!-- SECTION: PRICING GRID -->
                                <div class="space-y-4" formArrayName="pricingGrid">
                                    <div class="flex justify-between items-center">
                                        <div class="text-slate-900 font-bold">
                                          Preços por Quantidade
                                        </div>
                                        <button type="button" (click)="addPriceTier()" class="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                                            <span class="text-lg">+</span> Adicionar
                                        </button>
                                    </div>

                                    <div class="space-y-3">
                                        @for (tier of pricingGrid.controls; track tier; let i = $index) {
                                            <div [formGroupName]="i" class="flex items-center gap-4 group">
                                                <div class="flex-1">
                                                    <input type="text" inputmode="numeric" formControlName="qty" placeholder="Quantidade" class="w-full border border-slate-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all">
                                                </div>
                                                <div class="flex-1">
                                                    <input type="text" inputmode="decimal" formControlName="price" placeholder="Preço(R$)" class="w-full border border-slate-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all">
                                                </div>
                                                <button type="button" (click)="removePriceTier(i)" class="text-slate-300 hover:text-red-500 transition-colors p-2">
                                                    ✕
                                                </button>
                                            </div>
                                        }
                                    </div>

                                    <div class="text-sm text-slate-400">
                                      Adicione opções de quantidade e preço (ex: 100 unid. = R$ 120,00)
                                    </div>

                                    @if(pricingGrid.length === 0) {
                                      <div class="py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-sm">
                                        Nenhuma faixa de preço definida. Clique em "+ Adicionar" para começar.
                                      </div>
                                    }
                                </div>

                                <!-- SECTION: ADDITIONAL IMAGES -->
                                <div class="space-y-6" formArrayName="additionalImages">
                                    <div class="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <div class="flex items-center gap-2 text-navy-900 font-bold">
                                          <span class="w-1.5 h-6 bg-slate-400 rounded-full"></span>
                                          Galeria de Imagens Adicionais
                                        </div>
                                        <button type="button" (click)="addAdditionalImage()" class="text-xs bg-slate-100 text-slate-600 px-4 py-2 rounded-full font-bold hover:bg-slate-200 transition flex items-center gap-1">
                                            <span>+</span> Adicionar Foto
                                        </button>
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        @for (imgControl of additionalImages.controls; track imgControl; let i = $index) {
                                            <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center gap-3 group">
                                                <div class="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                  @if(imgControl.value) {
                                                    <img [src]="imgControl.value" (error)="$event.target.src = 'https://placehold.co/100x100?text=Erro'" class="w-full h-full object-cover">
                                                  } @else {
                                                    <div class="w-full h-full flex items-center justify-center text-slate-300 text-[10px] font-bold">FOTO</div>
                                                  }
                                                </div>
                                                <div class="flex-grow relative">
                                                  <input [formControlName]="i" placeholder="Cole o link da foto..." class="w-full bg-transparent border-b border-slate-300 py-1 text-xs outline-none focus:border-navy-900 pr-6">
                                                  @if(imgControl.value) {
                                                    <span class="absolute right-0 top-1/2 -translate-y-1/2 text-green-500 text-[10px]">✓</span>
                                                  }
                                                </div>
                                                <button type="button" (click)="removeAdditionalImage(i)" class="text-slate-300 hover:text-red-500 transition-colors">✕</button>
                                            </div>
                                        }
                                    </div>
                                </div>
                             </div>
                             </div>

                             <!-- Form Actions (Sticky at bottom) -->
                             <div class="p-6 border-t border-slate-100 bg-white flex flex-col shrink-0 sticky bottom-0">
                                <button type="submit" class="w-full bg-[#d9a321] hover:bg-[#c4921d] text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center text-lg">
                                    {{ editingProduct ? 'Salvar' : 'Criar' }}
                                </button>
                                <button type="button" (click)="cancelEditProduct()" class="mt-2 text-slate-400 text-xs hover:text-slate-600 transition-all text-center">Cancelar</button>
                             </div>
                          </form>
                       </div>
                   </div>
                </div>
             }
          }

          <!-- CATEGORIES TAB -->
          @if (activeTab() === 'categories') {
             <h2 class="text-xl font-bold mb-6 text-navy-900">Gerenciar Categorias</h2>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <!-- Add/Edit Form -->
                 <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                     <h3 class="text-sm font-bold text-slate-500 uppercase mb-4">{{ editingCategory ? 'Editar Categoria' : 'Nova Categoria' }}</h3>
                     
                     <div class="space-y-4">
                        <div>
                           <label class="block text-xs font-semibold text-slate-500 mb-1">Nome</label>
                           <input #catName [value]="editingCategory ? editingCategory.name : ''" (keydown.enter)="saveCategory(catName.value); catName.value=''" placeholder="Ex: Papelaria Corporativa" class="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-navy-900 outline-none transition bg-slate-50 focus:bg-white">
                        </div>
                        
                        <div class="flex gap-3">
                           <button (click)="saveCategory(catName.value); catName.value=''" class="flex-grow bg-navy-900 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-navy-800 transition shadow-md">
                              {{ editingCategory ? 'Atualizar' : 'Adicionar' }}
                           </button>
                           @if (editingCategory) {
                               <button (click)="cancelEditCategory(); catName.value=''" class="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-lg font-bold hover:bg-slate-200 transition">
                                  Cancelar
                               </button>
                           }
                        </div>
                     </div>
                 </div>

                 <!-- List -->
                 <div class="space-y-3">
                     @for (cat of db.categories(); track cat.id) {
                         <div class="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                             <span class="font-semibold text-navy-900">{{ cat.name }}</span>
                             <div class="flex gap-2">
                                 <button type="button" (click)="startEditCategory(cat)" class="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors">
                                    Editar
                                 </button>
                                 <button type="button" (click)="deleteCategory(cat.id); $event.stopPropagation()" class="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors">
                                    Excluir
                                 </button>
                             </div>
                         </div>
                     }
                     @if (db.categories().length === 0) {
                         <div class="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                            <p class="text-slate-400 font-medium">Nenhuma categoria cadastrada.</p>
                         </div>
                     }
                 </div>
             </div>
          }

          <!-- PAGES TAB (MODERNIZED & ENHANCED) -->
          @if (activeTab() === 'pages') {
             <div class="max-w-6xl mx-auto pb-8">
                 <div class="text-center mb-8">
                    <h2 class="text-2xl font-bold text-navy-900">Gerenciar Conteúdo Institucional</h2>
                    <p class="text-slate-500 text-sm mt-1">Selecione a página abaixo para editar o título e o conteúdo HTML.</p>
                 </div>

                 <!-- Page Selector - Modern Pills -->
                 <div class="flex flex-wrap justify-center gap-3 mb-10">
                    @for (page of db.pages(); track page.slug) {
                        <button 
                            (click)="selectPage(page)" 
                            [class.ring-2]="selectedPage?.slug === page.slug"
                            [class.ring-orange-500]="selectedPage?.slug === page.slug"
                            [class.ring-offset-2]="selectedPage?.slug === page.slug"
                            [class.bg-navy-900]="selectedPage?.slug === page.slug"
                            [class.text-white]="selectedPage?.slug === page.slug"
                            [class.bg-white]="selectedPage?.slug !== page.slug"
                            [class.text-slate-600]="selectedPage?.slug !== page.slug"
                            class="px-6 py-3 rounded-full border border-slate-200 font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm md:text-base">
                            
                            <!-- Icons based on slug -->
                            @if (page.slug === 'contato') { <span>📞</span> }
                            @else if (page.slug.includes('politica')) { <span>📜</span> }
                            @else if (page.slug === 'faq') { <span>❓</span> }
                            @else { <span>📄</span> }
                            
                            {{ page.title }}
                        </button>
                    }
                 </div>

                 @if (selectedPage) {
                     <div class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in-up flex flex-col md:flex-row">
                         
                         <!-- Editor Area -->
                         <div class="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-slate-200">
                             
                             <!-- Toolbar & Title -->
                             <div class="p-4 bg-slate-50 border-b border-slate-200 space-y-4">
                                 <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Título da Página</label>
                                    <input 
                                        [value]="pageTitleBuffer" 
                                        (input)="updatePageTitle($event)" 
                                        class="w-full border border-slate-300 rounded-lg p-2.5 font-bold text-navy-900 focus:ring-2 focus:ring-navy-900 outline-none transition bg-white"
                                    >
                                 </div>

                                 <!-- Editor Toolbar -->
                                 <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                     <span class="text-[10px] font-bold text-slate-400 uppercase mr-1">Inserir:</span>
                                     <button (click)="insertTag('<b>', '</b>')" class="px-3 py-1 bg-white border border-slate-300 rounded text-xs font-bold hover:bg-slate-100 hover:text-navy-900" title="Negrito">&lt;b&gt;</button>
                                     <button (click)="insertTag('<h2>', '</h2>')" class="px-3 py-1 bg-white border border-slate-300 rounded text-xs font-bold hover:bg-slate-100 hover:text-navy-900" title="Subtítulo">&lt;h2&gt;</button>
                                     <button (click)="insertTag('<p>', '</p>')" class="px-3 py-1 bg-white border border-slate-300 rounded text-xs font-bold hover:bg-slate-100 hover:text-navy-900" title="Parágrafo">&lt;p&gt;</button>
                                     <button (click)="insertTag('<ul>\\n  <li>Item</li>\\n</ul>', '')" class="px-3 py-1 bg-white border border-slate-300 rounded text-xs font-bold hover:bg-slate-100 hover:text-navy-900" title="Lista">&lt;ul&gt;</button>
                                     <button (click)="insertTag('<br>', '')" class="px-3 py-1 bg-white border border-slate-300 rounded text-xs font-bold hover:bg-slate-100 hover:text-navy-900" title="Quebra de Linha">&lt;br&gt;</button>
                                 </div>
                             </div>

                             <!-- Code Editor -->
                             <div class="flex-grow relative bg-slate-900 group">
                                 <div class="absolute top-0 right-0 p-2 opacity-50 text-[10px] text-white font-mono pointer-events-none">HTML SOURCE</div>
                                 <textarea 
                                    #editorTextarea
                                    [value]="pageContentBuffer" 
                                    (input)="updatePageContent($event)" 
                                    class="w-full h-[500px] bg-slate-900 text-slate-300 p-4 font-mono text-sm leading-relaxed focus:outline-none resize-none border-0 selection:bg-orange-500 selection:text-white"
                                    placeholder="Digite o conteúdo HTML aqui..."
                                    spellcheck="false"
                                 ></textarea>
                             </div>
                         </div>

                         <!-- Preview Area -->
                         <div class="w-full md:w-1/2 bg-slate-50 flex flex-col">
                             <div class="p-3 bg-white border-b border-slate-200 flex justify-between items-center h-[76px]"> <!-- Matches Header height -->
                                <span class="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Visualização em Tempo Real
                                </span>
                             </div>
                             
                             <div class="flex-grow p-8 overflow-y-auto max-h-[500px]">
                                 <!-- Simulated Browser Rendering -->
                                 <div class="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-navy-900 prose-p:text-slate-600 prose-a:text-orange-500 prose-li:text-slate-600 bg-white p-8 rounded-lg shadow-sm border border-slate-100 min-h-full">
                                     <h1 class="text-3xl font-bold text-navy-900 mb-6 border-b pb-4">{{ pageTitleBuffer }}</h1>
                                     <div [innerHTML]="pageContentBuffer"></div>
                                 </div>
                             </div>
                         </div>
                     </div>

                     <!-- Actions Footer -->
                     <div class="mt-6 flex justify-end gap-4 items-center">
                         <span class="text-xs text-slate-400">Alterações não salvas serão perdidas ao sair.</span>
                         <button (click)="savePage()" class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            Salvar Página
                         </button>
                     </div>
                 } @else {
                    <div class="text-center py-20 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
                        <div class="text-4xl mb-4">👆</div>
                        <p class="text-slate-500 font-bold">Selecione uma página acima para começar a editar.</p>
                    </div>
                 }
             </div>
          }

          <!-- TRACKING TAB -->
          @if (activeTab() === 'tracking') {
            <app-tracking-settings />
          }

          <!-- SETTINGS TAB (RESTORED & UX IMPROVED) -->
          @if (activeTab() === 'settings') {
             <div class="max-w-5xl mx-auto pb-10">
                 <!-- Sticky Header with Actions -->
                 <div class="flex justify-between items-center mb-8 sticky top-0 bg-slate-50 py-4 z-10 border-b border-slate-200/50 backdrop-blur-sm">
                     <div>
                         <h2 class="text-2xl font-bold text-navy-900">Configurações Gerais</h2>
                         <p class="text-slate-500 text-sm mt-1">Personalize a aparência e informações do seu site.</p>
                     </div>
                     <button (click)="saveSettings()" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        Salvar Alterações
                     </button>
                 </div>

                 @if (saveMessage()) { 
                    <div class="p-4 mb-6 rounded-lg border flex items-center gap-2 animate-fade-in" [class]="saveMessage()?.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'">
                        <span class="text-xl">{{ saveMessage()?.type === 'success' ? '✓' : '⚠' }}</span>
                        {{ saveMessage()?.text }}
                    </div> 
                 }
                 
                 <form [formGroup]="settingsForm" class="space-y-8 animate-fade-in">
                     
                     <!-- 1. Identidade & Contato -->
                     <section class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60">
                         <h3 class="font-bold text-lg text-navy-900 mb-6 flex items-center gap-2 pb-2 border-b border-slate-100">
                            <span class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-base">🏢</span>
                            Identidade & Contato
                         </h3>
                         <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div class="md:col-span-1">
                                 <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nome da Empresa</label>
                                 <input formControlName="companyName" class="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-navy-900 outline-none transition bg-slate-50 focus:bg-white">
                             </div>
                             <div>
                                 <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">WhatsApp (Somente números)</label>
                                 <input formControlName="contactPhone" class="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-navy-900 outline-none transition bg-slate-50 focus:bg-white">
                             </div>
                             <div>
                                 <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email de Contato</label>
                                 <input formControlName="contactEmail" class="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-navy-900 outline-none transition bg-slate-50 focus:bg-white">
                             </div>
                         </div>
                     </section>

                     <!-- 2. Visual & Logotipo -->
                     <section class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60">
                         <h3 class="font-bold text-lg text-navy-900 mb-6 flex items-center gap-2 pb-2 border-b border-slate-100">
                             <span class="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center text-base">🎨</span>
                             Visual & Logotipo
                         </h3>
                         <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <!-- Colors -->
                             <div class="space-y-4">
                                 <h4 class="text-sm font-bold text-navy-900">Paleta de Cores</h4>
                                 <div class="flex flex-col gap-4">
                                     <div>
                                         <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Cor Primária</label>
                                         <div class="flex items-center gap-3">
                                            <div class="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                                <input type="color" formControlName="primaryColor" class="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0">
                                            </div>
                                            <div class="flex-grow">
                                                <input formControlName="primaryColor" class="w-full font-mono text-sm border border-slate-200 rounded p-2 bg-slate-50 text-slate-600 uppercase">
                                            </div>
                                         </div>
                                     </div>
                                     <div>
                                         <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Cor Secundária (Destaque)</label>
                                         <div class="flex items-center gap-3">
                                            <div class="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                                <input type="color" formControlName="secondaryColor" class="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0">
                                            </div>
                                            <div class="flex-grow">
                                                <input formControlName="secondaryColor" class="w-full font-mono text-sm border border-slate-200 rounded p-2 bg-slate-50 text-slate-600 uppercase">
                                            </div>
                                         </div>
                                     </div>
                                     <div>
                                         <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Header & Timeline</label>
                                         <div class="flex items-center gap-3">
                                            <div class="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                                <input type="color" formControlName="headerBackgroundColor" class="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0">
                                            </div>
                                             <div class="flex-grow">
                                                <input formControlName="headerBackgroundColor" placeholder="#FFFFFF (Opcional)" class="w-full font-mono text-sm border border-slate-200 rounded p-2 bg-slate-50 text-slate-600 uppercase">
                                            </div>
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             <!-- Logo Upload -->
                             <div class="space-y-4">
                                 <h4 class="text-sm font-bold text-navy-900">Logotipo</h4>
                                 <div class="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                                    <input type="file" (change)="onLogoUpload($event)" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                                    <div class="mb-3 p-3 bg-white rounded-full shadow-sm">
                                        <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"/></svg>
                                    </div>
                                    <p class="text-sm font-medium text-navy-900">Clique ou arraste para enviar</p>
                                    <p class="text-xs text-slate-500 mt-1">PNG Transparente (Recom: 600px)</p>
                                 </div>
                                 
                                 @if (settingsForm.get('logoUrl')?.value) { 
                                     <div class="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between">
                                        <div>
                                            <p class="text-xs font-bold text-slate-500 mb-2">Preview Atual:</p>
                                            <img [src]="settingsForm.get('logoUrl')?.value" class="h-10 object-contain">
                                        </div>
                                        <button (click)="clearLogo()" type="button" class="text-xs text-red-500 font-bold hover:underline">Remover</button>
                                     </div>
                                 }
                             </div>
                         </div>
                     </section>

                     <!-- 3. Banner Home -->
                      <section class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60">
                          <h3 class="font-bold text-lg text-navy-900 mb-6 flex items-center gap-2 pb-2 border-b border-slate-100">
                              <span class="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-base">🖼️</span>
                              Banner da Home
                          </h3>
                          <div class="space-y-6">
                              <!-- Text Content -->
                              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div class="md:col-span-2">
                                     <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Título Principal</label>
                                     <input formControlName="bannerTitle" class="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-navy-900 outline-none font-bold text-lg">
                                 </div>
                                 <div class="md:col-span-2">
                                     <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Subtítulo</label>
                                     <input formControlName="bannerSubtitle" class="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-navy-900 outline-none">
                                 </div>
                                 <div class="md:col-span-2">
                                     <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Descrição (Texto Menor)</label>
                                     <textarea formControlName="bannerDescription" rows="2" class="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-navy-900 outline-none resize-none" placeholder="Texto adicional abaixo do subtítulo..."></textarea>
                                 </div>
                              </div>

                              <hr class="border-slate-100">

                              <!-- Style & Alignment -->
                              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Alinhamento</label>
                                      <select formControlName="bannerAlignment" class="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-navy-900 outline-none bg-white">
                                          <option value="left">Esquerda</option>
                                          <option value="center">Centro</option>
                                          <option value="right">Direita</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Cor do Texto</label>
                                      <div class="flex items-center gap-2">
                                          <input type="color" formControlName="bannerTextColor" class="w-10 h-10 border-0 p-0 cursor-pointer rounded overflow-hidden">
                                          <span class="text-xs font-mono text-slate-500">{{ settingsForm.get('bannerTextColor')?.value }}</span>
                                      </div>
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Cor de Fundo (Banner)</label>
                                      <div class="flex items-center gap-2">
                                          <input type="color" formControlName="bannerBackgroundColor" class="w-10 h-10 border-0 p-0 cursor-pointer rounded overflow-hidden">
                                          <span class="text-xs font-mono text-slate-500">{{ settingsForm.get('bannerBackgroundColor')?.value }}</span>
                                      </div>
                                  </div>
                              </div>

                              <hr class="border-slate-100">

                              <!-- Background Image & Overlay -->
                              <div class="space-y-4">
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">URL da Imagem de Fundo</label>
                                      <input formControlName="bannerImageUrl" class="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-navy-900 outline-none text-sm font-mono text-slate-600 bg-slate-50">
                                  </div>

                                  <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                      <div class="flex items-center justify-between mb-4">
                                          <label class="flex items-center gap-2 cursor-pointer">
                                              <input type="checkbox" formControlName="bannerOverlayActive" class="w-4 h-4 rounded border-slate-300 text-navy-900 focus:ring-navy-900">
                                              <span class="text-xs font-bold text-slate-700 uppercase leading-none">Ativar Overlay (Escurecimento)</span>
                                          </label>
                                      </div>
                                      @if (settingsForm.get('bannerOverlayActive')?.value) {
                                          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                              <div>
                                                  <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cor do Overlay</label>
                                                  <div class="flex items-center gap-2">
                                                      <input type="color" formControlName="bannerOverlayColor" class="w-8 h-8 border-0 p-0 cursor-pointer rounded overflow-hidden">
                                                      <span class="text-xs font-mono text-slate-500">{{ settingsForm.get('bannerOverlayColor')?.value }}</span>
                                                  </div>
                                              </div>
                                              <div>
                                                  <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Opacidade ({{ (settingsForm.get('bannerOverlayOpacity')?.value * 100).toFixed(0) }}%)</label>
                                                  <input type="range" formControlName="bannerOverlayOpacity" min="0" max="1" step="0.1" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-navy-900">
                                              </div>
                                          </div>
                                      }
                                  </div>
                              </div>

                              <hr class="border-slate-100">

                              <!-- Button Config -->
                              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Texto do Botão</label>
                                      <input formControlName="bannerButtonText" class="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-navy-900 outline-none" placeholder="Ex: Ver Produtos">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Link do Botão</label>
                                      <input formControlName="bannerButtonLink" class="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-navy-900 outline-none" placeholder="Ex: /catalogo">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Estilo do Botão</label>
                                      <select formControlName="bannerButtonStyle" class="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-navy-900 outline-none bg-white">
                                          <option value="primary">Primário (Laranja)</option>
                                          <option value="secondary">Secundário (Azul/Transparente)</option>
                                      </select>
                                  </div>
                              </div>

                              @if(settingsForm.get('bannerImageUrl')?.value) {
                                 <div class="relative min-h-[160px] md:h-48 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner group">
                                     <img [src]="settingsForm.get('bannerImageUrl')?.value" class="w-full h-full object-cover">
                                     
                                     <!-- Dynamic Overlay Preview -->
                                     @if (settingsForm.get('bannerOverlayActive')?.value) {
                                         <div class="absolute inset-0 z-1" 
                                              [style.backgroundColor]="settingsForm.get('bannerOverlayColor')?.value"
                                              [style.opacity]="settingsForm.get('bannerOverlayOpacity')?.value"></div>
                                     }

                                     <div class="absolute inset-0 z-10 flex flex-col p-6 pointer-events-none"
                                          [class.items-start]="settingsForm.get('bannerAlignment')?.value === 'left'"
                                          [class.items-center]="settingsForm.get('bannerAlignment')?.value === 'center'"
                                          [class.items-end]="settingsForm.get('bannerAlignment')?.value === 'right'"
                                          [class.text-left]="settingsForm.get('bannerAlignment')?.value === 'left'"
                                          [class.text-center]="settingsForm.get('bannerAlignment')?.value === 'center'"
                                          [class.text-right]="settingsForm.get('bannerAlignment')?.value === 'right'">
                                         
                                         <h4 class="font-bold text-sm mb-1 drop-shadow-sm" [style.color]="settingsForm.get('bannerTextColor')?.value">
                                            {{ settingsForm.get('bannerTitle')?.value || 'Título do Banner' }}
                                         </h4>
                                         <p class="text-[10px] opacity-90 leading-tight max-w-[250px]" [style.color]="settingsForm.get('bannerTextColor')?.value">
                                            {{ settingsForm.get('bannerSubtitle')?.value || 'Subtítulo...' }}
                                         </p>
                                         <div class="mt-4 px-3 py-1.5 rounded-full text-[9px] font-bold shadow-sm"
                                              [class.bg-orange-500]="settingsForm.get('bannerButtonStyle')?.value === 'primary'"
                                              [class.text-white]="settingsForm.get('bannerButtonStyle')?.value === 'primary'"
                                              [class.bg-navy-900]="settingsForm.get('bannerButtonStyle')?.value === 'secondary'"
                                              [class.text-white]="settingsForm.get('bannerButtonStyle')?.value === 'secondary'">
                                              {{ settingsForm.get('bannerButtonText')?.value || 'Botão' }}
                                         </div>
                                     </div>
                                     <div class="absolute top-3 right-3 z-20">
                                         <span class="text-white text-[9px] font-bold bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-sm">Preview Real-time</span>
                                     </div>
                                 </div>
                              }
                          </div>
                      </section>

                     <!-- 4. Redes Sociais -->
                     <section class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60">
                         <h3 class="font-bold text-lg text-navy-900 mb-6 flex items-center gap-2 pb-2 border-b border-slate-100">
                             <span class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-base">🌐</span>
                             Redes Sociais
                         </h3>
                         <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div class="relative">
                                 <span class="absolute left-3 top-3 text-lg">📸</span>
                                 <label class="block text-[10px] font-bold text-slate-400 uppercase absolute top-1.5 left-10">Instagram</label>
                                 <input formControlName="instagramUrl" class="w-full border border-slate-300 rounded-lg pt-6 pb-2 pl-10 pr-3 focus:ring-2 focus:ring-navy-900 outline-none text-sm transition">
                             </div>
                             <div class="relative">
                                 <span class="absolute left-3 top-3 text-lg">👍</span>
                                 <label class="block text-[10px] font-bold text-slate-400 uppercase absolute top-1.5 left-10">Facebook</label>
                                 <input formControlName="facebookUrl" class="w-full border border-slate-300 rounded-lg pt-6 pb-2 pl-10 pr-3 focus:ring-2 focus:ring-navy-900 outline-none text-sm transition">
                             </div>
                             <div class="relative">
                                 <span class="absolute left-3 top-3 text-lg">🎵</span>
                                 <label class="block text-[10px] font-bold text-slate-400 uppercase absolute top-1.5 left-10">TikTok</label>
                                 <input formControlName="tiktokUrl" class="w-full border border-slate-300 rounded-lg pt-6 pb-2 pl-10 pr-3 focus:ring-2 focus:ring-navy-900 outline-none text-sm transition">
                             </div>
                             <div class="relative">
                                 <span class="absolute left-3 top-3 text-lg">📌</span>
                                 <label class="block text-[10px] font-bold text-slate-400 uppercase absolute top-1.5 left-10">Pinterest</label>
                                 <input formControlName="pinterestUrl" class="w-full border border-slate-300 rounded-lg pt-6 pb-2 pl-10 pr-3 focus:ring-2 focus:ring-navy-900 outline-none text-sm transition">
                             </div>
                         </div>
                     </section>

                     <!-- 5. SEO -->
                     <section class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60">
                         <h3 class="font-bold text-lg text-navy-900 mb-6 flex items-center gap-2 pb-2 border-b border-slate-100">
                             <span class="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-base">🔍</span>
                             SEO (Google)
                         </h3>
                         <div class="space-y-4">
                             <div>
                                 <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Título da Página (Meta Title)</label>
                                 <input formControlName="metaTitle" class="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-navy-900 outline-none transition">
                             </div>
                             <div>
                                 <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Descrição (Meta Description)</label>
                                 <textarea formControlName="metaDescription" rows="3" class="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-navy-900 outline-none transition"></textarea>
                                 <p class="text-xs text-slate-400 mt-1 flex justify-between">
                                     <span>Breve resumo que aparece no Google.</span>
                                     <span>Recomendado: 150-160 caracteres.</span>
                                 </p>
                             </div>
                         </div>
                     </section>

                     <!-- 6. Destaques Home (Cards) -->
                     <section class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60">
                         <h3 class="font-bold text-lg text-navy-900 mb-6 flex items-center gap-2 pb-2 border-b border-slate-100">
                             <span class="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center text-base">⭐</span>
                             Cards de Destaque (Home)
                         </h3>
                         <div formArrayName="featureCards" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                             @for (card of featureCardsArray.controls; track card; let i = $index) {
                                 <div [formGroupName]="i" class="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-orange-300 transition-colors group">
                                     <div class="flex gap-4">
                                        <div class="w-16 flex-shrink-0">
                                            <label class="block text-[10px] font-bold text-slate-400 mb-1 text-center">ÍCONE</label>
                                            <input formControlName="icon" class="w-full h-12 border border-slate-200 rounded-lg text-center text-2xl focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                                        </div>
                                        <div class="flex-grow space-y-3">
                                            <div>
                                                <input formControlName="title" placeholder="Título do Card" class="w-full border-b border-slate-200 bg-transparent py-1 font-bold text-navy-900 focus:border-orange-500 outline-none placeholder-slate-300">
                                            </div>
                                            <div>
                                                <textarea formControlName="description" rows="2" placeholder="Descrição curta..." class="w-full border border-slate-200 rounded p-2 text-sm bg-white focus:ring-1 focus:ring-orange-500 outline-none resize-none"></textarea>
                                            </div>
                                        </div>
                                     </div>
                                 </div>
                             }
                         </div>
                     </section>

                     <!-- 7. Jornada de Compra -->
                     <section class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60">
                         <h3 class="font-bold text-lg text-navy-900 mb-6 flex items-center gap-2 pb-2 border-b border-slate-100">
                             <span class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-base">🚀</span>
                             Passo a Passo (Jornada)
                         </h3>
                         <div formArrayName="journeySteps" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                             @for (step of journeyStepsArray.controls; track step; let i = $index) {
                                 <div [formGroupName]="i" class="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                                     <div class="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold shadow-sm z-10 border-4 border-white">
                                         {{i+1}}
                                     </div>
                                     <div class="mt-2 flex items-center gap-3 mb-3">
                                         <input formControlName="icon" class="w-10 h-10 border border-slate-200 rounded text-center text-xl bg-white focus:ring-1 focus:ring-purple-500 outline-none" placeholder="Icon">
                                         <input formControlName="title" class="flex-grow border-b border-slate-200 bg-transparent py-1 font-bold text-navy-900 focus:border-purple-500 outline-none" placeholder="Título do Passo">
                                     </div>
                                     <textarea formControlName="description" rows="2" class="w-full border border-slate-200 rounded p-2 text-sm bg-white focus:ring-1 focus:ring-purple-500 outline-none resize-none" placeholder="Descrição do passo..."></textarea>
                                 </div>
                             }
                         </div>
                         <div class="mt-4">
                             <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Cor de Destaque da Linha do Tempo</label>
                             <div class="flex items-center gap-3">
                                 <div class="relative w-10 h-10 rounded overflow-hidden border border-slate-200">
                                     <input type="color" formControlName="journeyHighlightColor" class="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0">
                                 </div>
                                 <span class="text-xs font-mono text-slate-500">{{ settingsForm.get('journeyHighlightColor')?.value }}</span>
                             </div>
                         </div>
                     </section>

                     <!-- 8. Conteúdo Sidebar Contato -->
                     <section class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60">
                         <h3 class="font-bold text-lg text-navy-900 mb-6 flex items-center gap-2 pb-2 border-b border-slate-100">
                             <span class="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-base">📝</span>
                             Texto Sidebar (Página Contato)
                         </h3>
                         <div class="bg-slate-900 rounded-lg p-1">
                             <div class="flex items-center justify-between px-4 py-2 text-xs text-slate-400 border-b border-slate-700 mb-0">
                                 <span>HTML Editor</span>
                                 <span>&lt;/&gt;</span>
                             </div>
                             <textarea formControlName="contactFormContent" rows="10" class="w-full bg-slate-900 text-slate-300 p-4 font-mono text-xs leading-relaxed focus:outline-none rounded-b-lg border-0"></textarea>
                         </div>
                         <p class="text-xs text-slate-400 mt-2">Aceita tags HTML básicas (h2, p, ul, li) para formatação.</p>
                     </section>

                      <!-- 9. Data Safety / Backup -->
                      <section class="bg-red-50 p-6 md:p-8 rounded-2xl shadow-sm border border-red-100">
                          <h3 class="font-bold text-lg text-red-900 mb-4 flex items-center gap-2 pb-2 border-b border-red-200">
                              <span class="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-base">🛡️</span>
                              Segurança de Dados
                          </h3>
                          <p class="text-red-800 text-sm mb-6">
                              Como este sistema opera localmente, é fundamental que você faça backups regulares. 
                              Exporte seus dados para salvar em seu computador e use a restauração caso troque de dispositivo ou limpe o cache.
                          </p>
                          
                          <div class="flex flex-col md:flex-row gap-4">
                              <button type="button" (click)="downloadBackup()" class="flex-1 bg-white border border-red-200 text-red-700 hover:bg-red-100 font-bold py-4 px-6 rounded-xl shadow-sm flex items-center justify-center gap-3 transition-all">
                                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                  Baixar Backup Completo
                              </button>
                              
                              <div class="flex-1 relative">
                                  <input type="file" #restoreInput (change)="onRestoreFile($event)" class="hidden" accept=".json">
                                  <button type="button" (click)="restoreInput.click()" class="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-4 px-6 rounded-xl shadow-sm flex items-center justify-center gap-3 transition-all">
                                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"/></svg>
                                      Restaurar Backup
                                  </button>
                              </div>
                          </div>
                      </section>

                 </form>
             </div>
          }

        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  auth = inject(AuthService);
  db = inject(DbService);
  router = inject(Router);
  fb: FormBuilder = inject(FormBuilder);
  cdr = inject(ChangeDetectorRef);

  @ViewChild('editorTextarea') editorTextarea!: ElementRef<HTMLTextAreaElement>;

  activeTab = signal<'leads' | 'leads_bi' | 'products' | 'categories' | 'pages' | 'settings' | 'tracking'>('leads');
  
  // Lead Search & Filter
  searchTerm = signal('');
  filterStatus = signal('');
  showStatusDropdown = signal(false); 
  openProductDropdown = signal<string | null>(null);
  
  selectedLead = signal<Lead | null>(null);
  saveMessage = signal<{type: 'success' | 'error', text: string} | null>(null);

  // BI Metrics
  metrics = computed(() => {
    const leads = this.db.leads();
    const total = leads.length;
    const pendente = leads.filter(l => l.status === 'Pendente').length;
    const novo = leads.filter(l => l.status === 'Novo').length;
    const emAtendimento = leads.filter(l => l.status === 'Em Atendimento').length;
    const finalizado = leads.filter(l => l.status === 'Finalizado').length;
    const cancelado = leads.filter(l => l.status === 'Cancelado').length;
    
    const revenue = leads
      .filter(l => ['Finalizado', 'Em Atendimento'].includes(l.status))
      .reduce((acc, curr) => acc + (curr.value || 0), 0);

    const conversionRate = total > 0 ? ((finalizado / total) * 100).toFixed(1) : '0.0';

    return { total, pendente, novo, emAtendimento, finalizado, cancelado, revenue, conversionRate };
  });

  filteredLeads = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const statusFilter = this.filterStatus();
    const leads = this.db.leads();

    const filtered = leads.filter(lead => {
        const matchesTerm = !term || (
            lead.name.toLowerCase().includes(term) ||
            lead.email.toLowerCase().includes(term) ||
            lead.status.toLowerCase().includes(term) ||
            (lead.productInterest && lead.productInterest.toLowerCase().includes(term)) ||
            (lead.configSummary && lead.configSummary.toLowerCase().includes(term))
        );
        const matchesStatus = !statusFilter || lead.status === statusFilter;
        return matchesTerm && matchesStatus;
    });

    return filtered.sort((a, b) => {
      const getScore = (status: string) => {
        if (status === 'Pendente') return 4;
        if (status === 'Novo') return 3;
        if (status === 'Em Atendimento') return 2;
        return 1;
      };
      const scoreA = getScore(a.status);
      const scoreB = getScore(b.status);
      if (scoreA !== scoreB) return scoreB - scoreA; 
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  });

  // Product Logic
  editingProduct: Product | null = null;
  isCreatingProduct = false;
  productForm: FormGroup;
  printOptions = PRINT_OPTIONS;
  paperOptions = PAPER_OPTIONS;
  finishOptions = FINISH_OPTIONS;

  // Category Logic
  editingCategory: Category | null = null;

  // Page Logic
  selectedPage: PageContent | null = null;
  pageContentBuffer = '';
  pageTitleBuffer = '';

  // Settings
  settingsForm: FormGroup;
  isResizingImage = signal(false);
  
  // Custom Dropdown Helpers
  getCategoryName(id: string) {
    return this.db.categories().find(c => c.id === id)?.name || 'Selecione uma categoria';
  }

  getSelectedLabel(controlName: string, placeholder: string) {
    return this.productForm.get(controlName)?.value || placeholder;
  }

  getVariableItemLabel(index: number, controlName: string, placeholder: string) {
    const group = (this.productForm.get('variableItems') as FormArray).at(index);
    return group?.get(controlName)?.value || placeholder;
  }

  toggleDropdown(id: string) {
    if (this.openProductDropdown() === id) {
      this.openProductDropdown.set(null);
    } else {
      this.openProductDropdown.set(id);
    }
  }

  selectOption(controlName: string, value: any, dropdownId: string) {
    this.productForm.get(controlName)?.setValue(value);
    this.openProductDropdown.set(null);
  }

  selectVariableItemOption(index: number, controlName: string, value: any, dropdownId: string) {
    const group = (this.productForm.get('variableItems') as FormArray).at(index);
    group?.get(controlName)?.setValue(value);
    this.openProductDropdown.set(null);
  }

  getStatusDotClass(status: string) {
    switch (status) {
      case 'Novo': return 'bg-blue-500';
      case 'Pendente': return 'bg-amber-500';
      case 'Em Atendimento': return 'bg-purple-500';
      case 'Finalizado': return 'bg-green-500';
      case 'Cancelado': return 'bg-slate-400';
      default: return 'bg-slate-200';
    }
  }

  constructor() {
    this.productForm = this.fb.group({
      type: ['simple_batch', Validators.required],
      title: ['', Validators.required],
      categoryId: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.*$/)]],
      productionTime: [''],
      
      // Tag & Kit Fixo specific
      size: [''],
      printType: [''],
      paper: [''],
      finishing: [''],
      pricingGrid: this.fb.array([]),
      
      // Kit Fixo specific
      items: this.fb.array([]),
      
      // Kit Variavel specific
      basePrice: [''],
      variableItems: this.fb.array([]),

      // Legacy compatibility
      paperTypes: [''],
      weights: [''],
      colors: [''],
      finishes: [''],
      salesPrice: [''],
      additionalImages: this.fb.array([])
    });

    const settings = this.db.settings();
    const featureCardsArray = settings.featureCards ? 
        settings.featureCards.map(c => this.createFeatureCardGroup(c)) : [];

    const journeyStepsArray = settings.journeySteps ? 
        settings.journeySteps.map(s => this.createJourneyStepGroup(s)) : [];

    this.settingsForm = this.fb.group({
      bannerTitle: [settings.bannerTitle],
      bannerSubtitle: [settings.bannerSubtitle],
      bannerDescription: [settings.bannerDescription || ''],
      bannerImageUrl: [settings.bannerImageUrl],
      bannerTextColor: [settings.bannerTextColor || '#ffffff'],
      bannerBackgroundColor: [settings.bannerBackgroundColor || '#0f172a'],
      bannerAlignment: [settings.bannerAlignment || 'left'],
      bannerButtonText: [settings.bannerButtonText || 'Ver Produtos'],
      bannerButtonLink: [settings.bannerButtonLink || '/catalogo'],
      bannerButtonStyle: [settings.bannerButtonStyle || 'primary'],
      bannerOverlayActive: [settings.bannerOverlayActive ?? true],
      bannerOverlayColor: [settings.bannerOverlayColor || '#000000'],
      bannerOverlayOpacity: [settings.bannerOverlayOpacity || 0.3],
      logoUrl: [settings.logoUrl || ''],
      logoType: [settings.logoType || 'text'],
      logoText: [settings.logoText || ''],
      headerBackgroundColor: [settings.headerBackgroundColor || ''],
      primaryColor: [settings.primaryColor || '#0f172a'],
      secondaryColor: [settings.secondaryColor || '#f97316'],
      journeyHighlightColor: [settings.journeyHighlightColor || '#0f172a'],
      metaTitle: [settings.metaTitle || ''],
      metaDescription: [settings.metaDescription || ''],
      contactPhone: [settings.contactPhone, [Validators.required, Validators.pattern(/^\d{12,14}$/)]],
      contactEmail: [settings.contactEmail],
      contactFormContent: [settings.contactFormContent],
      featureCards: this.fb.array(featureCardsArray),
      journeySteps: this.fb.array(journeyStepsArray),
      companyName: [settings.companyName],
      facebookUrl: [settings.facebookUrl],
      instagramUrl: [settings.instagramUrl],
      tiktokUrl: [settings.tiktokUrl],
      pinterestUrl: [settings.pinterestUrl]
    });

    // Reactivity for Settings
    effect(() => {
      const s = this.db.settings();
      
      // Patch non-array values
      this.settingsForm.patchValue({
        bannerTitle: s.bannerTitle,
        bannerSubtitle: s.bannerSubtitle,
        bannerDescription: s.bannerDescription,
        bannerImageUrl: s.bannerImageUrl,
        bannerTextColor: s.bannerTextColor,
        bannerBackgroundColor: s.bannerBackgroundColor,
        bannerAlignment: s.bannerAlignment,
        bannerButtonText: s.bannerButtonText,
        bannerButtonLink: s.bannerButtonLink,
        bannerButtonStyle: s.bannerButtonStyle,
        bannerOverlayActive: s.bannerOverlayActive,
        bannerOverlayColor: s.bannerOverlayColor,
        bannerOverlayOpacity: s.bannerOverlayOpacity,
        logoUrl: s.logoUrl,
        logoType: s.logoType,
        logoText: s.logoText,
        headerBackgroundColor: s.headerBackgroundColor,
        primaryColor: s.primaryColor,
        secondaryColor: s.secondaryColor,
        journeyHighlightColor: s.journeyHighlightColor,
        metaTitle: s.metaTitle,
        metaDescription: s.metaDescription,
        contactPhone: s.contactPhone,
        contactEmail: s.contactEmail,
        contactFormContent: s.contactFormContent,
        companyName: s.companyName,
        facebookUrl: s.facebookUrl,
        instagramUrl: s.instagramUrl,
        tiktokUrl: s.tiktokUrl,
        pinterestUrl: s.pinterestUrl
      }, { emitEvent: false });

      // Rebuild arrays if they differ in length or on first load
      if (s.featureCards && s.featureCards.length !== this.featureCardsArray.length) {
        this.featureCardsArray.clear({ emitEvent: false });
        s.featureCards.forEach(c => this.featureCardsArray.push(this.createFeatureCardGroup(c), { emitEvent: false }));
      } else if (s.featureCards) {
        // Just patch if lengths match
        this.featureCardsArray.patchValue(s.featureCards, { emitEvent: false });
      }

      if (s.journeySteps && s.journeySteps.length !== this.journeyStepsArray.length) {
        this.journeyStepsArray.clear({ emitEvent: false });
        s.journeySteps.forEach(js => this.journeyStepsArray.push(this.createJourneyStepGroup(js), { emitEvent: false }));
      } else if (s.journeySteps) {
        this.journeyStepsArray.patchValue(s.journeySteps, { emitEvent: false });
      }

      this.cdr.detectChanges();
    });
  }

  createFeatureCardGroup(c: FeatureCard): FormGroup {
     return this.fb.group({ icon: [c.icon], title: [c.title], description: [c.description] });
  }

  createJourneyStepGroup(s: JourneyStep): FormGroup {
    return this.fb.group({ id: [s.id], icon: [s.icon], title: [s.title], description: [s.description] });
  }

  get featureCardsArray() { return this.settingsForm.get('featureCards') as FormArray; }
  get journeyStepsArray() { return this.settingsForm.get('journeySteps') as FormArray; }
  get pricingGrid() { return this.productForm.get('pricingGrid') as FormArray; }
  get additionalImages() { return this.productForm.get('additionalImages') as FormArray; }
  get kitItems() { return this.productForm.get('items') as FormArray; }
  get variableItems() { return this.productForm.get('variableItems') as FormArray; }

  addKitItem(productName: string = '', size: string = '') {
    this.kitItems.push(this.fb.group({
      productName: [productName, Validators.required],
      size: [size, Validators.required]
    }));
  }

  removeKitItem(index: number) {
    this.kitItems.removeAt(index);
  }

  addVariableItem(item?: KitVariavelItem) {
    this.variableItems.push(this.fb.group({
      title: [item?.title || '', Validators.required],
      size: [item?.size || '', Validators.required],
      printType: [item?.printType || '', Validators.required],
      paper: [item?.paper || '', Validators.required],
      finishing: [item?.finishing || '', Validators.required],
      image: [item?.image || '', Validators.pattern(/^https?:\/\/.*$/)]
    }));
  }

  removeVariableItem(index: number) {
    this.variableItems.removeAt(index);
  }

  addAdditionalImage(url: string = '') {
    this.additionalImages.push(this.fb.control(url, Validators.pattern(/^https?:\/\/.*$/)));
  }

  removeAdditionalImage(index: number) {
    this.additionalImages.removeAt(index);
  }

  newPriceTier(qty: number | null = null, price: number | null = null): FormGroup {
    return this.fb.group({ qty: [qty, [Validators.required, Validators.min(1)]], price: [price, [Validators.required, Validators.min(0)]] });
  }

  addPriceTier() { this.pricingGrid.push(this.newPriceTier()); }
  removePriceTier(index: number) { if (this.pricingGrid.length > 1) { this.pricingGrid.removeAt(index); } }

  getPriceDifference(index: number): number {
    if (index > 0 && this.pricingGrid.length > 1) {
      const currentPrice = this.pricingGrid.at(index).value.price || 0;
      const basePrice = this.pricingGrid.at(0).value.price || 0;
      return currentPrice - basePrice;
    }
    return 0;
  }

  getTabClass(tab: string) {
    const base = "flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ";
    return this.activeTab() === tab 
      ? base + "bg-navy-900 text-white shadow-md"
      : base + "text-slate-500 hover:bg-slate-100 hover:text-navy-900";
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  // --- Leads Logic (Export, UpdateStatus, View, Delete) ---
  exportLeads() {
    const data = this.db.leads().map(l => `${l.createdAt},${l.name},${l.email},${l.whatsapp},"${l.productInterest}","${l.status}",${l.value}`).join('\n');
    const blob = new Blob(['Data,Nome,Email,WhatsApp,Interesse,Status,Valor\n' + data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leads_grafthi_bi.csv'; a.click();
  }
  updateLeadStatus(lead: Lead, newStatus: string) { this.db.updateLeadStatus(lead.id, newStatus as LeadStatus); }
  updateLeadValue(id: string, event: Event) {
    const val = Number((event.target as HTMLInputElement).value);
    this.db.updateLeadValue(id, val);
    // Update local selectedLead signal to reflect change immediately in modal
    const current = this.selectedLead();
    if (current && current.id === id) {
      this.selectedLead.set({ ...current, value: val });
    }
  }
  viewLead(lead: Lead) { this.selectedLead.set(lead); }
  closeLeadModal() { this.selectedLead.set(null); }
  confirmDeleteLead(id: string) { this.db.deleteLead(id); this.closeLeadModal(); } 
  getStatusClass(status: string) {
    switch(status) {
      case 'Pendente': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Novo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Em Atendimento': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Finalizado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  }
  getStatusColorDot(status: string) {
    switch(status) {
      case 'Pendente': return 'bg-purple-500';
      case 'Novo': return 'bg-blue-500';
      case 'Em Atendimento': return 'bg-yellow-500';
      case 'Finalizado': return 'bg-green-500';
      case 'Cancelado': return 'bg-red-500';
      default: return 'bg-slate-300';
    }
  }
  selectStatusFilter(status: string) { this.filterStatus.set(status); this.showStatusDropdown.set(false); }

  // --- Product Logic (StartEdit, Save, Delete) ---
  startEditProduct(prod: Product | null) {
    this.editingProduct = prod;
    this.isCreatingProduct = !prod;
    this.pricingGrid.clear();
    this.additionalImages.clear();
    this.kitItems.clear();
    this.variableItems.clear();

    if (prod) {
      if (prod.pricingGrid) {
        prod.pricingGrid.forEach(tier => { this.pricingGrid.push(this.newPriceTier(tier.qty, tier.price)); });
      }
      if (prod.additionalImages) {
        prod.additionalImages.forEach(url => { this.addAdditionalImage(url); });
      }
      if (prod.items) {
        prod.items.forEach(item => { this.addKitItem(item.productName, item.size); });
      }
      if (prod.variableItems) {
        prod.variableItems.forEach(item => { this.addVariableItem(item); });
      }

      this.productForm.patchValue({
        type: prod.type || 'simple_batch',
        title: prod.title,
        categoryId: prod.categoryId,
        description: prod.description,
        imageUrl: prod.imageUrl,
        productionTime: prod.productionTime || '',
        size: prod.size || '',
        printType: prod.printType || '',
        paper: prod.paper || '',
        finishing: prod.finishing || '',
        basePrice: prod.basePrice || '',
        paperTypes: prod.paperTypes ? prod.paperTypes.join(', ') : '',
        weights: prod.weights ? prod.weights.join(', ') : '',
        colors: prod.colors ? prod.colors.join(', ') : '',
        finishes: prod.finishes ? prod.finishes.join(', ') : '',
        salesPrice: prod.salesPrice || ''
      });
    } else { 
      this.productForm.reset({ type: 'simple_batch' }); 
      this.addPriceTier(); 
    }
  }

  cancelEditProduct() { this.editingProduct = null; this.isCreatingProduct = false; }

  saveProduct() {
    this.saveMessage.set(null);
    if (this.productForm.valid) {
      try {
        const form = this.productForm.value;
        const newProd: Product = {
          id: this.editingProduct ? this.editingProduct.id : crypto.randomUUID(),
          type: form.type,
          title: form.title,
          categoryId: form.categoryId,
          description: form.description,
          imageUrl: form.imageUrl,
          productionTime: form.productionTime,
          additionalImages: form.additionalImages.filter((url: string) => !!url),
          
          // Simple & Fixed Kit
          size: form.size,
          printType: form.printType,
          paper: form.paper,
          finishing: form.finishing,
          pricingGrid: form.pricingGrid || [],
          
          // Fixed Kit
          items: form.items || [],
          
          // Variable Kit
          basePrice: form.basePrice,
          variableItems: form.variableItems || [],

          // Legacy compatibility
          paperTypes: form.paperTypes ? (typeof form.paperTypes === 'string' ? form.paperTypes.split(',').map((s:string) => s.trim()) : form.paperTypes) : [],
          weights: form.weights ? (typeof form.weights === 'string' ? form.weights.split(',').map((s:string) => s.trim()) : form.weights) : [],
          colors: form.colors ? (typeof form.colors === 'string' ? form.colors.split(',').map((s:string) => s.trim()) : form.colors) : [],
          finishes: form.finishes ? (typeof form.finishes === 'string' ? form.finishes.split(',').map((s:string) => s.trim()) : form.finishes) : [],
          salesPrice: form.salesPrice
        };
        
        if (this.editingProduct) { 
          this.db.updateProduct(newProd); 
        } else { 
          this.db.addProduct(newProd); 
        }
        
        this.saveMessage.set({ type: 'success', text: 'Produto salvo com sucesso!' });
        setTimeout(() => {
          this.saveMessage.set(null);
          this.cancelEditProduct();
        }, 1500);
      } catch (e) {
        console.error('Error saving product:', e);
        this.saveMessage.set({ type: 'error', text: 'Erro ao salvar o produto.' });
      }
    } else {
      this.productForm.markAllAsTouched();
      this.saveMessage.set({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios.' });
    }
  }
  deleteProduct(id: string) { this.db.deleteProduct(id); } 

  // --- Category Logic ---
  saveCategory(name: string) {
    if (!name) return;
    if (this.editingCategory) { this.db.updateCategory({ ...this.editingCategory, name }); this.editingCategory = null; } 
    else { this.db.addCategory({ id: crypto.randomUUID(), name }); }
  }
  startEditCategory(cat: Category) { this.editingCategory = cat; }
  cancelEditCategory() { this.editingCategory = null; }

  deleteCategory(id: string) { 
      this.db.deleteCategory(id); 
      if (this.editingCategory?.id === id) {
          this.cancelEditCategory();
      }
  }

  // --- Page Logic ---
  selectPage(page: PageContent) { this.selectedPage = page; this.pageContentBuffer = page.content; this.pageTitleBuffer = page.title; }
  updatePageTitle(e: Event) { this.pageTitleBuffer = (e.target as HTMLInputElement).value; }
  updatePageContent(e: Event) { this.pageContentBuffer = (e.target as HTMLTextAreaElement).value; }
  
  insertTag(startTag: string, endTag: string) {
      if (!this.editorTextarea) return;
      const el = this.editorTextarea.nativeElement;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const text = el.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const selection = text.substring(start, end);
      
      const newText = before + startTag + selection + endTag + after;
      this.pageContentBuffer = newText;
      
      // Update element and cursor
      setTimeout(() => {
          el.value = newText;
          el.selectionStart = el.selectionEnd = start + startTag.length + selection.length + endTag.length;
          el.focus();
      });
  }

  savePage() {
    if (this.selectedPage) {
      this.db.updatePage({ ...this.selectedPage, title: this.pageTitleBuffer, content: this.pageContentBuffer });
      alert('Página atualizada!');
    }
  }

  // --- Settings ---
  saveSettings() {
    this.saveMessage.set(null);
    if (this.settingsForm.valid) {
      try {
        const current: SiteSettings = this.db.settings();
        this.db.updateSettings({ ...current, ...this.settingsForm.value });
        this.saveMessage.set({ type: 'success', text: 'Configurações salvas com sucesso!' });
        setTimeout(() => { this.saveMessage.set(null); }, 3000);
      } catch (e) { this.saveMessage.set({ type: 'error', text: 'Erro ao salvar configurações.' }); }
    } else {
      this.settingsForm.markAllAsTouched();
      this.saveMessage.set({ type: 'error', text: 'Verifique os campos obrigatórios.' });
    }
  }
  onLogoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Reset input value to allow re-selecting the same file if needed
    input.value = '';

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) { 
        alert('Formato inválido. Use PNG, JPEG, WEBP ou SVG.'); 
        return; 
    }
    
    this.isResizingImage.set(true);
    
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600; const MAX_HEIGHT = 200;
        let width = img.width; let height = img.height;
        
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
           const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
           width = width * ratio; height = height * ratio;
        }
        
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
           ctx.drawImage(img, 0, 0, width, height);
           // Default to png to preserve transparency
           const outputType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
           const dataUrl = canvas.toDataURL(outputType, 0.9);
           
           this.settingsForm.patchValue({ logoUrl: dataUrl, logoType: 'image' });
           this.settingsForm.markAsDirty();
           
           this.isResizingImage.set(false);
           // Force update UI because this happens inside an async callback (FileReader)
           this.cdr.detectChanges();
        }
      };
      
      // Basic error handling
      img.onerror = () => {
         this.isResizingImage.set(false);
         alert('Erro ao processar imagem.');
         this.cdr.detectChanges();
      };

      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
  
  clearLogo() { 
      this.settingsForm.patchValue({ logoUrl: '' }); 
      this.settingsForm.markAsDirty();
  }

  // --- Data Safety / Backup Feature ---
  downloadBackup() {
      const backupData = {
          categories: localStorage.getItem('grafthi_categories'),
          products: localStorage.getItem('grafthi_products'),
          leads: localStorage.getItem('grafthi_leads'),
          pages: localStorage.getItem('grafthi_pages'),
          settings: localStorage.getItem('grafthi_settings'),
          backupDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-studiografthi-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
  }

  onRestoreFile(event: Event) {
      const input = event.target as HTMLInputElement;
      if (!input.files?.length) return;
      
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
          try {
              const json = JSON.parse(e.target?.result as string);
              
              if (confirm('ATENÇÃO: Isso substituirá TODOS os dados atuais pelos do backup. Deseja continuar?')) {
                  if (json.categories) localStorage.setItem('grafthi_categories', json.categories);
                  if (json.products) localStorage.setItem('grafthi_products', json.products);
                  if (json.leads) localStorage.setItem('grafthi_leads', json.leads);
                  if (json.pages) localStorage.setItem('grafthi_pages', json.pages);
                  if (json.settings) localStorage.setItem('grafthi_settings', json.settings);
                  
                  alert('Restauração concluída com sucesso! A página será recarregada.');
                  window.location.reload();
              }
          } catch (err) {
              alert('Erro ao ler o arquivo de backup. Certifique-se de que é um JSON válido.');
          }
      };
      reader.readAsText(file);
  }
}
