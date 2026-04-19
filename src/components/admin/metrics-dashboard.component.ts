
import { Component, inject, signal, computed, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService } from '../../services/db.service';
import { AnalyticsEvent, AnalyticsEventType } from '../../models/types';
import * as d3 from 'd3';

@Component({
  selector: 'app-metrics-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- Header with Period Filter -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-navy-900">Métricas do Site</h2>
          <p class="text-slate-500 text-sm mt-1">Acompanhe o desempenho e interações de visitantes reais.</p>
        </div>
        
        <div class="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          @for (period of periods; track period.id) {
            <button 
              (click)="selectedPeriod.set(period.id)"
              [class]="selectedPeriod() === period.id ? 'bg-navy-900 text-white' : 'text-slate-500 hover:bg-slate-50'"
              class="px-4 py-2 rounded-lg text-xs font-bold transition-all">
              {{ period.label }}
            </button>
          }
        </div>
      </div>

      <!-- Main Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @for (card of mainStats(); track card.label) {
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
            <div class="flex justify-between items-start mb-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm" [class]="card.colorClass">
                {{ card.icon }}
              </div>
              <div class="text-right">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{{ card.label }}</p>
                <h3 class="text-2xl font-black text-navy-900">{{ card.value }}</h3>
              </div>
            </div>
            <div class="flex items-center gap-2">
               <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-100">
                 Acumulado no período
               </span>
            </div>
          </div>
        }
      </div>

      <!-- Charts & Insights -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Visits Chart -->
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-navy-900 flex items-center gap-2 text-sm uppercase tracking-wider">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></span>
              Visitas por Dia
            </h3>
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Últimos {{ selectedPeriod() }} dias</div>
          </div>
          <div #chartContainer class="h-[280px] w-full relative">
            <svg #chartSvg class="w-full h-full overflow-visible"></svg>
          </div>
        </div>

        <!-- Devices & Browsers -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 class="font-bold text-navy-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
            <span class="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-200"></span>
            Tecnologia dos Visitantes
          </h3>
          
          <div class="space-y-6">
            <!-- Devices -->
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-3">Dispositivos</p>
              <div class="space-y-3">
                @for (dev of deviceStats(); track dev.name) {
                  <div class="space-y-1">
                    <div class="flex justify-between text-xs">
                      <span class="font-bold text-navy-900 flex items-center gap-1.5">
                        <span class="text-sm">{{ dev.icon }}</span> {{ dev.name }}
                      </span>
                      <span class="text-slate-500">{{ dev.percentage }}%</span>
                    </div>
                    <div class="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div class="h-full bg-indigo-500 rounded-full transition-all duration-1000" [style.width.%]="dev.percentage"></div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Browsers -->
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-3">Navegadores</p>
              <div class="grid grid-cols-2 gap-3">
                @for (br of browserStats(); track br.name) {
                  <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                       <span class="text-lg">{{ br.icon }}</span>
                       <span class="text-xs font-bold text-navy-900">{{ br.name }}</span>
                    </div>
                    <span class="text-[10px] font-black text-slate-400">{{ br.count }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Logs & Lists -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="flex flex-wrap border-b border-slate-100 bg-slate-50/30">
          <button 
            (click)="activeSubTab.set('accesses')"
            [class]="activeSubTab() === 'accesses' ? 'border-navy-900 text-navy-900 bg-white' : 'border-transparent text-slate-500 hover:text-navy-900'"
            class="px-6 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all">
            👤 Logs de Acesso
          </button>
          <button 
            (click)="activeSubTab.set('pages')"
            [class]="activeSubTab() === 'pages' ? 'border-navy-900 text-navy-900 bg-white' : 'border-transparent text-slate-500 hover:text-navy-900'"
            class="px-6 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all">
            📄 Páginas
          </button>
          <button 
            (click)="activeSubTab.set('clicks')"
            [class]="activeSubTab() === 'clicks' ? 'border-navy-900 text-navy-900 bg-white' : 'border-transparent text-slate-500 hover:text-navy-900'"
            class="px-6 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all">
            🖱️ Ações
          </button>
          <div class="md:ml-auto p-2 flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-slate-100">
             <button (click)="exportData()" class="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-navy-900 text-white px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-navy-800 transition shadow-sm">
               📥 Baixar CSV
             </button>
             <button (click)="clearData()" 
               [class]="showClearConfirm() ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'"
               class="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold transition border border-red-100">
               {{ showClearConfirm() ? '⚠️ Confirmar' : '🗑️ Limpar' }}
             </button>
          </div>
        </div>

        <div class="min-h-[400px]">
          <!-- Access Logs -->
          @if (activeSubTab() === 'accesses') {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th class="px-6 py-4">Data/Hora</th>
                    <th class="px-6 py-4">Visitante (Anon)</th>
                    <th class="px-6 py-4">Localização</th>
                    <th class="px-6 py-4">Ambiente</th>
                    <th class="px-6 py-4">Origem</th>
                    <th class="px-6 py-4">Página</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  @for (event of recentAccesses(); track event.id) {
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex flex-col">
                           <span class="text-xs font-black text-navy-900">{{ event.timestamp | date:'dd/MM HH:mm' }}</span>
                           <span class="text-[9px] text-slate-400 leading-none mt-0.5">{{ event.timestamp | date:'yyyy' }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                           <div class="w-2 h-2 rounded-full" [style.backgroundColor]="'#' + event.visitorId.slice(-6)"></div>
                           <span class="text-[10px] font-mono text-slate-500 uppercase">{{ event.visitorId.slice(0, 8) }}...</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex flex-col">
                           <span class="text-xs font-bold text-navy-900">{{ event.location?.city || 'Desconhecido' }}</span>
                           <span class="text-[10px] text-slate-400">{{ event.location?.country || '--' }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-2 text-navy-900">
                           <span class="text-base" [title]="event.device">{{ event.device === 'Mobile' ? '📱' : '💻' }}</span>
                           <div class="flex flex-col">
                              <span class="text-[10px] font-bold leading-tight">{{ event.browser }}</span>
                              <span class="text-[9px] text-slate-400 leading-none">{{ event.os }}</span>
                           </div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                           {{ event.referrer }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-xs font-mono text-blue-600 bg-blue-50/50 px-2 py-1 rounded">{{ event.path }}</span>
                      </td>
                    </tr>
                  }
                  @if (recentAccesses().length === 0) {
                    <tr><td colspan="6" class="px-6 py-12 text-center text-slate-400 italic text-sm">Nenhum log disponível.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- Pages Stats -->
          @if (activeSubTab() === 'pages') {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th class="px-6 py-4">URL da Página</th>
                    <th class="px-6 py-4 text-center">Visualizações</th>
                    <th class="px-6 py-4 text-center">Visitantes Únicos</th>
                    <th class="px-6 py-4 text-center">Distribuição</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  @for (page of pageStats(); track page.url) {
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="px-6 py-4">
                        <span class="text-sm font-bold text-navy-900">{{ page.url }}</span>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span class="text-base font-black text-navy-900">{{ page.views }}</span>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span class="text-sm font-medium text-slate-600">{{ page.uniqueVisitors }}</span>
                      </td>
                      <td class="px-6 py-4 min-w-[150px]">
                        <div class="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                           <div class="h-full bg-blue-500" [style.width.%]="(page.views / maxPageViews()) * 100"></div>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- Actions Stats -->
          @if (activeSubTab() === 'clicks') {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th class="px-6 py-4">Ação / Evento</th>
                    <th class="px-6 py-4">Contexto</th>
                    <th class="px-6 py-4 text-center">Cliques</th>
                    <th class="px-6 py-4 text-center">Última Ocorrência</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  @for (click of clickStats(); track click.name) {
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <span class="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center text-sm">🖱️</span>
                          <span class="text-sm font-bold text-navy-900">{{ click.name }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-[10px] font-bold text-slate-400 uppercase leading-none">{{ click.label || 'Interação Geral' }}</span>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span class="text-lg font-black text-navy-900">{{ click.count }}</span>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span class="text-[10px] font-bold text-slate-400">{{ click.lastAt | date:'dd/MM HH:mm' }}</span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class MetricsDashboardComponent implements AfterViewInit, OnDestroy {
  db = inject(DbService);
  
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @ViewChild('chartSvg') chartSvg!: ElementRef;

  periods = [
    { id: 7, label: '7 Dias' },
    { id: 30, label: '30 Dias' },
    { id: 90, label: 'Todo Período' }
  ];

  selectedPeriod = signal<number>(7);
  activeSubTab = signal<string>('accesses');

  // Filtered events based on period
  filteredEvents = computed(() => {
    const events = this.db.events();
    if (this.selectedPeriod() === 90) return events;
    
    const now = new Date();
    const days = this.selectedPeriod();
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return events.filter(e => new Date(e.timestamp) >= cutoff);
  });

  recentAccesses = computed(() => {
    return this.filteredEvents()
      .filter(e => e.type === AnalyticsEventType.PAGE_VIEW)
      .slice(0, 50); // Show last 50 accesses
  });

  mainStats = computed(() => {
    const events = this.filteredEvents();
    const views = events.filter(e => e.type === AnalyticsEventType.PAGE_VIEW).length;
    const unique = new Set(events.map(e => e.visitorId)).size;
    const leads = events.filter(e => e.type === AnalyticsEventType.WHATSAPP_CLICK).length;
    const prodViews = events.filter(e => e.type === AnalyticsEventType.PRODUCT_VIEW).length;

    return [
      { label: 'Total de Acessos', value: views, icon: '📈', colorClass: 'bg-blue-50 text-blue-600' },
      { label: 'Visitantes Únicos', value: unique, icon: '👤', colorClass: 'bg-indigo-50 text-indigo-600' },
      { label: 'Cliques no WhatsApp', value: leads, icon: '💬', colorClass: 'bg-green-50 text-green-600' },
      { label: 'Interesse em Prod.', value: prodViews, icon: '🏷️', colorClass: 'bg-orange-50 text-orange-600' }
    ];
  });

  deviceStats = computed(() => {
    const events = this.filteredEvents();
    const total = events.length;
    if (total === 0) return [];

    const stats: Record<string, number> = { 'Desktop': 0, 'Mobile': 0 };
    events.forEach(e => {
       const dev = e.device || 'Desktop';
       stats[dev] = (stats[dev] || 0) + 1;
    });

    return Object.entries(stats).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
      icon: name === 'Mobile' ? '📱' : '💻'
    })).sort((a, b) => b.count - a.count);
  });

  browserStats = computed(() => {
    const events = this.filteredEvents();
    const stats: Record<string, number> = {};
    events.forEach(e => {
       const b = e.browser || 'Outro';
       stats[b] = (stats[b] || 0) + 1;
    });

    const icons: Record<string, string> = { 'Chrome': '🌐', 'Firefox': '🦊', 'Safari': '🍎', 'Edge': '🟦', 'Outro': '❓' };

    return Object.entries(stats).map(([name, count]) => ({
      name,
      count,
      icon: icons[name] || '❓'
    })).sort((a, b) => b.count - a.count).slice(0, 4);
  });

  pageStats = computed(() => {
    const events = this.filteredEvents().filter(e => e.type === AnalyticsEventType.PAGE_VIEW);
    const stats: Record<string, { views: number, visitors: Set<string> }> = {};

    events.forEach(e => {
      const url = e.path || '/';
      if (!stats[url]) stats[url] = { views: 0, visitors: new Set() };
      stats[url].views++;
      stats[url].visitors.add(e.visitorId);
    });

    return Object.entries(stats).map(([url, data]) => ({
      url,
      views: data.views,
      uniqueVisitors: data.visitors.size
    })).sort((a, b) => b.views - a.views);
  });

  maxPageViews = computed(() => {
    const stats = this.pageStats();
    return stats.length > 0 ? Math.max(...stats.map(s => s.views)) : 1;
  });

  clickStats = computed(() => {
    const types = [AnalyticsEventType.CLICK, AnalyticsEventType.WHATSAPP_CLICK, AnalyticsEventType.CATALOG_ACCESS];
    const events = this.filteredEvents().filter(e => types.includes(e.type));
    const stats: Record<string, { count: number, lastAt: string, label?: string }> = {};

    events.forEach(e => {
      let name = e.type === AnalyticsEventType.WHATSAPP_CLICK ? 'WhatsApp' : 
                 e.type === AnalyticsEventType.CATALOG_ACCESS ? 'Catálogo' : 
                 (e.metadata?.buttonName || 'Ação');
      
      const key = `${name}-${e.metadata?.label || ''}`;
      if (!stats[key]) stats[key] = { count: 0, lastAt: e.timestamp, label: e.metadata?.label };
      stats[key].count++;
      if (new Date(e.timestamp) > new Date(stats[key].lastAt)) stats[key].lastAt = e.timestamp;
    });

    return Object.entries(stats).map(([key, data]) => ({
      name: key.split('-')[0],
      label: data.label,
      count: data.count,
      lastAt: data.lastAt
    })).sort((a, b) => b.count - a.count);
  });

  private resizeObserver?: ResizeObserver;

  ngAfterViewInit() {
    this.renderChart();
    this.resizeObserver = new ResizeObserver(() => this.renderChart());
    if (this.chartContainer) this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  renderChart() {
    if (!this.chartSvg) return;

    const svg = d3.select(this.chartSvg.nativeElement);
    svg.selectAll('*').remove();

    const container = this.chartContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const events = this.filteredEvents().filter(e => e.type === AnalyticsEventType.PAGE_VIEW);
    const days = this.selectedPeriod() === 90 ? 30 : this.selectedPeriod();
    const data: { date: Date, count: number }[] = [];
    
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      d.setHours(0, 0, 0, 0);
      const count = events.filter(e => {
        const ed = new Date(e.timestamp); ed.setHours(0, 0, 0, 0);
        return ed.getTime() === d.getTime();
      }).length;
      data.push({ date: d, count });
    }

    const x = d3.scaleTime().domain(d3.extent(data, d => d.date) as [Date, Date]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.count) || 5]).nice().range([height - margin.bottom, margin.top]);
    const line = d3.line<{ date: Date, count: number }>().x(d => x(d.date)).y(d => y(d.count)).curve(d3.curveMonotoneX);
    const area = d3.area<{ date: Date, count: number }>().x(d => x(d.date)).y0(height - margin.bottom).y1(d => y(d.count)).curve(d3.curveMonotoneX);

    const gradient = svg.append('defs').append('linearGradient').attr('id', 'blue-grad').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.2);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0);

    svg.append('g').attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%d/%m') as any)).call(g => g.select('.domain').remove()).call(g => g.selectAll('.tick line').remove()).call(g => g.selectAll('.tick text').attr('fill', '#94a3b8').attr('font-size', '10px').attr('font-weight', '500'));
    svg.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(5)).call(g => g.select('.domain').remove()).call(g => g.selectAll('.tick line').attr('stroke', '#f1f5f9').attr('x2', width - margin.left - margin.right)).call(g => g.selectAll('.tick text').attr('fill', '#94a3b8').attr('font-size', '10px'));
    svg.append('path').datum(data).attr('fill', 'url(#blue-grad)').attr('d', area);
    svg.append('path').datum(data).attr('fill', 'none').attr('stroke', '#3b82f6').attr('stroke-width', 2.5).attr('d', line);
  }

  exportData() {
    const events = this.db.events();
    if (events.length === 0) return;
    const headers = ['Data', 'Tipo', 'ID_Vistante', 'Sessao', 'Local', 'Dispositivo', 'Navegador', 'Origem', 'Pagina', 'Metadata'];
    const rows = events.map(e => [
      new Date(e.timestamp).toLocaleString(),
      e.type, e.visitorId, e.sessionId || '', 
      `${e.location?.city || ''}-${e.location?.country || ''}`,
      e.device || '', e.browser || '', e.referrer || '', e.path,
      JSON.stringify(e.metadata || {})
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'metricas_detalhadas.csv'; a.click();
  }

  showClearConfirm = signal<boolean>(false);
  clearData() {
    if (this.showClearConfirm()) {
      this.db.clearEvents();
      this.showClearConfirm.set(false);
    } else {
      this.showClearConfirm.set(true);
      setTimeout(() => this.showClearConfirm.set(false), 3000);
    }
  }
}
