
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
    <div class="space-y-8 animate-fade-in">
      <!-- Header with Period Filter -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-navy-900">Métricas do Site</h2>
          <p class="text-slate-500 text-sm mt-1">Acompanhe o desempenho e interações em tempo real.</p>
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

      <!-- Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @for (card of overviewCards(); track card.label) {
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
            <div class="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
              <div class="h-full transition-all duration-1000" [class]="card.bgClass" [style.width.%]="100"></div>
            </div>
          </div>
        }
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Chart: Visits Over Time -->
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-navy-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              Visitas por Dia
            </h3>
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Últimos {{ selectedPeriod() }} dias</div>
          </div>
          <div #chartContainer class="h-[300px] w-full relative">
            <svg #chartSvg class="w-full h-full overflow-visible"></svg>
          </div>
        </div>

        <!-- Top Products List -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 class="font-bold text-navy-900 mb-6 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-orange-500"></span>
            Produtos Mais Vistos
          </h3>
          <div class="space-y-4">
            @for (prod of topProducts(); track prod.id; let i = $index) {
              <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                  #{{ i + 1 }}
                </div>
                <div class="flex-grow min-w-0">
                  <h4 class="text-sm font-bold text-navy-900 truncate">{{ prod.title }}</h4>
                  <p class="text-[10px] text-slate-400 font-medium">{{ prod.views }} visualizações</p>
                </div>
                <div class="text-xs font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-md">
                  {{ prod.percentage }}%
                </div>
              </div>
            }
            @if (topProducts().length === 0) {
              <div class="text-center py-12 text-slate-400 text-sm italic">
                Nenhum dado disponível para este período.
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Detailed Tables Tabs -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="flex border-b border-slate-100 bg-slate-50/50">
          <button 
            (click)="activeSubTab.set('pages')"
            [class]="activeSubTab() === 'pages' ? 'border-navy-900 text-navy-900 bg-white' : 'border-transparent text-slate-500 hover:text-navy-900'"
            class="px-8 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all">
            Páginas
          </button>
          <button 
            (click)="activeSubTab.set('clicks')"
            [class]="activeSubTab() === 'clicks' ? 'border-navy-900 text-navy-900 bg-white' : 'border-transparent text-slate-500 hover:text-navy-900'"
            class="px-8 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all">
            Cliques em Botões
          </button>
          <div class="ml-auto p-2 flex items-center gap-2">
             <button (click)="clearData()" 
               [class]="showClearConfirm() ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'"
               class="flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold transition border border-red-100">
               {{ showClearConfirm() ? '⚠️ Clique para Confirmar' : '🗑️ Limpar Dados' }}
             </button>
             <button (click)="exportData()" class="flex items-center gap-2 bg-navy-900 text-white px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-navy-800 transition shadow-sm">
               📥 Exportar CSV
             </button>
          </div>
        </div>

        <div class="p-0">
          @if (activeSubTab() === 'pages') {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th class="px-6 py-4">URL da Página</th>
                    <th class="px-6 py-4 text-center">Visualizações</th>
                    <th class="px-6 py-4 text-center">Visitantes Únicos</th>
                    <th class="px-6 py-4 text-center">Tempo Médio (est.)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  @for (page of pageStats(); track page.url) {
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="px-6 py-4">
                        <span class="text-sm font-bold text-navy-900">{{ page.url }}</span>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span class="text-sm font-medium text-slate-600">{{ page.views }}</span>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span class="text-sm font-medium text-slate-600">{{ page.uniqueVisitors }}</span>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span class="text-sm font-medium text-slate-600">--</span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @if (activeSubTab() === 'clicks') {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th class="px-6 py-4">Botão / Ação</th>
                    <th class="px-6 py-4">Localização</th>
                    <th class="px-6 py-4 text-center">Total de Cliques</th>
                    <th class="px-6 py-4 text-center">Último Clique</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  @for (click of clickStats(); track click.name) {
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                          <span class="p-1.5 rounded bg-slate-100 text-slate-500">🖱️</span>
                          <span class="text-sm font-bold text-navy-900">{{ click.name }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-xs text-slate-500">{{ click.label || 'Geral' }}</span>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span class="text-sm font-black text-blue-600">{{ click.count }}</span>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span class="text-xs text-slate-400">{{ click.lastAt | date:'dd/MM HH:mm' }}</span>
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
    .category-scrollbar::-webkit-scrollbar { height: 4px; }
    .category-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .category-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
  `]
})
export class MetricsDashboardComponent implements AfterViewInit, OnDestroy {
  db = inject(DbService);
  
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @ViewChild('chartSvg') chartSvg!: ElementRef;

  periods = [
    { id: 7, label: '7 Dias' },
    { id: 15, label: '15 Dias' },
    { id: 30, label: '30 Dias' },
    { id: 90, label: '90 Dias' }
  ];

  selectedPeriod = signal<number>(7);
  activeSubTab = signal<string>('pages');

  // Filtered events based on period
  filteredEvents = computed(() => {
    const now = new Date();
    const days = this.selectedPeriod();
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return this.db.events().filter(e => new Date(e.timestamp) >= cutoff);
  });

  overviewCards = computed(() => {
    const events = this.filteredEvents();
    const totalVisits = events.filter(e => e.type === AnalyticsEventType.PAGE_VIEW).length;
    const uniqueVisitors = new Set(events.map(e => e.visitorId)).size;
    const whatsappClicks = events.filter(e => e.type === AnalyticsEventType.WHATSAPP_CLICK).length;
    const productViews = events.filter(e => e.type === AnalyticsEventType.PRODUCT_VIEW).length;

    return [
      { 
        label: 'Total de Visitas', 
        value: totalVisits, 
        icon: '👁️', 
        colorClass: 'bg-blue-50 text-blue-600', 
        bgClass: 'bg-blue-500' 
      },
      { 
        label: 'Visitantes Únicos', 
        value: uniqueVisitors, 
        icon: '👤', 
        colorClass: 'bg-purple-50 text-purple-600', 
        bgClass: 'bg-purple-500' 
      },
      { 
        label: 'Cliques WhatsApp', 
        value: whatsappClicks, 
        icon: '💬', 
        colorClass: 'bg-green-50 text-green-600', 
        bgClass: 'bg-green-500' 
      },
      { 
        label: 'Visualizações Prod.', 
        value: productViews, 
        icon: '📦', 
        colorClass: 'bg-orange-50 text-orange-600', 
        bgClass: 'bg-orange-500' 
      }
    ];
  });

  topProducts = computed(() => {
    const events = this.filteredEvents().filter(e => e.type === AnalyticsEventType.PRODUCT_VIEW);
    const productCounts: Record<string, { title: string, count: number }> = {};
    
    events.forEach(e => {
      if (e.metadata?.productId) {
        if (!productCounts[e.metadata.productId]) {
          productCounts[e.metadata.productId] = { title: e.metadata.productTitle || 'Produto', count: 0 };
        }
        productCounts[e.metadata.productId].count++;
      }
    });

    const totalViews = events.length;
    return Object.entries(productCounts)
      .map(([id, data]) => ({
        id,
        title: data.title,
        views: data.count,
        percentage: totalViews > 0 ? Math.round((data.count / totalViews) * 100) : 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  });

  pageStats = computed(() => {
    const events = this.filteredEvents().filter(e => e.type === AnalyticsEventType.PAGE_VIEW);
    const stats: Record<string, { views: number, visitors: Set<string> }> = {};

    events.forEach(e => {
      const url = e.metadata?.url || '/';
      if (!stats[url]) {
        stats[url] = { views: 0, visitors: new Set() };
      }
      stats[url].views++;
      stats[url].visitors.add(e.visitorId);
    });

    return Object.entries(stats)
      .map(([url, data]) => ({
        url,
        views: data.views,
        uniqueVisitors: data.visitors.size
      }))
      .sort((a, b) => b.views - a.views);
  });

  clickStats = computed(() => {
    const events = this.filteredEvents().filter(e => e.type === AnalyticsEventType.CLICK || e.type === AnalyticsEventType.WHATSAPP_CLICK || e.type === AnalyticsEventType.CATALOG_ACCESS);
    const stats: Record<string, { count: number, lastAt: string, label?: string }> = {};

    events.forEach(e => {
      let name = '';
      if (e.type === AnalyticsEventType.WHATSAPP_CLICK) name = 'WhatsApp';
      else if (e.type === AnalyticsEventType.CATALOG_ACCESS) name = 'Acesso ao Catálogo';
      else name = e.metadata?.buttonName || 'Clique';

      const key = `${name}-${e.metadata?.label || ''}`;
      if (!stats[key]) {
        stats[key] = { count: 0, lastAt: e.timestamp, label: e.metadata?.label };
      }
      stats[key].count++;
      if (new Date(e.timestamp) > new Date(stats[key].lastAt)) {
        stats[key].lastAt = e.timestamp;
      }
    });

    return Object.entries(stats)
      .map(([key, data]) => ({
        name: key.split('-')[0],
        label: data.label,
        count: data.count,
        lastAt: data.lastAt
      }))
      .sort((a, b) => b.count - a.count);
  });

  private resizeObserver?: ResizeObserver;

  ngAfterViewInit() {
    this.renderChart();
    
    this.resizeObserver = new ResizeObserver(() => {
      this.renderChart();
    });
    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  renderChart() {
    if (!this.chartSvg) return;

    const svg = d3.select(this.chartSvg.nativeElement);
    svg.selectAll('*').remove();

    const container = this.chartContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    // Prepare data
    const events = this.filteredEvents().filter(e => e.type === AnalyticsEventType.PAGE_VIEW);
    const days = this.selectedPeriod();
    const data: { date: Date, count: number }[] = [];
    
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      d.setHours(0, 0, 0, 0);
      
      const count = events.filter(e => {
        const ed = new Date(e.timestamp);
        ed.setHours(0, 0, 0, 0);
        return ed.getTime() === d.getTime();
      }).length;
      
      data.push({ date: d, count });
    }

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) || 10])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3.line<{ date: Date, count: number }>()
      .x(d => x(d.date))
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);

    const area = d3.area<{ date: Date, count: number }>()
      .x(d => x(d.date))
      .y0(height - margin.bottom)
      .y1(d => y(d.count))
      .curve(d3.curveMonotoneX);

    // Gradient for area
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'chart-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.2);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0);

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width > 500 ? 7 : 4).tickFormat(d3.timeFormat('%d/%m') as any))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', '#e2e8f0'))
      .call(g => g.selectAll('.tick text').attr('fill', '#94a3b8').attr('font-size', '10px').attr('font-weight', 'bold'));

    // Y Axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', '#e2e8f0').attr('x2', width - margin.left - margin.right))
      .call(g => g.selectAll('.tick text').attr('fill', '#94a3b8').attr('font-size', '10px').attr('font-weight', 'bold'));

    // Area
    svg.append('path')
      .datum(data)
      .attr('fill', 'url(#chart-gradient)')
      .attr('d', area);

    // Line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', line);

    // Dots
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.count))
      .attr('r', 4)
      .attr('fill', 'white')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('class', 'dot transition-all duration-300 hover:r-6 cursor-pointer');
  }

  exportData() {
    const events = this.filteredEvents();
    if (events.length === 0) return;

    const headers = ['Timestamp', 'Type', 'VisitorID', 'URL', 'ProductID', 'ProductTitle', 'ButtonName', 'Label'];
    const rows = events.map(e => [
      e.timestamp,
      e.type,
      e.visitorId,
      e.metadata?.url || '',
      e.metadata?.productId || '',
      e.metadata?.productTitle || '',
      e.metadata?.buttonName || '',
      e.metadata?.label || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `metrics_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  showClearConfirm = signal<boolean>(false);

  clearData() {
    if (this.showClearConfirm()) {
      this.db.clearEvents();
      this.renderChart();
      this.showClearConfirm.set(false);
    } else {
      this.showClearConfirm.set(true);
      setTimeout(() => this.showClearConfirm.set(false), 3000);
    }
  }
}
