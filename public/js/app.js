/**
 * App - Controlador Principal da Aplicação Client-Side
 * Network Asset Manager
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

class App {
  static currentView = 'dashboard'; // 'dashboard' | 'assets' | 'maintenances'
  static currentTab = 'assets';     // mantido para compatibilidade
  static scheduleFilters = {
    noc: 'all',
    assets: 'all'
  };

  static init() {
    this.initTheme();
    this.bindEvents();
    this.renderVendorOptions();
    this.renderMaintAssetFilterOptions();
    this.renderApp();
    this.switchView('dashboard', false);
  }

  /**
   * Inicializa e persiste a preferência de tema (Claro / Escuro) no localStorage
   */
  static initTheme() {
    let savedTheme = 'light';
    try {
      savedTheme = localStorage.getItem('nam_theme') === 'dark' ? 'dark' : 'light';
    } catch (e) {
      savedTheme = 'light';
    }
    this.applyTheme(savedTheme, false);
  }

  static applyTheme(theme, persist = true) {
    const isDark = theme === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    const toggleBtn = document.getElementById('btn-theme-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', String(isDark));
      toggleBtn.setAttribute('title', isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro');
    }

    if (persist) {
      try {
        localStorage.setItem('nam_theme', isDark ? 'dark' : 'light');
      } catch (e) {
        console.error('Erro ao salvar preferência de tema no localStorage', e);
      }
    }
  }

  static toggleTheme() {
    const isCurrentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
    this.applyTheme(isCurrentlyDark ? 'light' : 'dark', true);
  }

  /**
   * Vincula escutadores de eventos de botões, filtros, busca e modais
   */
  static bindEvents() {
    // Alternância de Tema Claro / Escuro
    const themeToggleBtn = document.getElementById('btn-theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Navegação por Abas Independentes na Barra Superior
    const navDash = document.getElementById('nav-item-dashboard');
    const navAssets = document.getElementById('nav-item-assets');
    const navMaint = document.getElementById('nav-item-maint');

    if (navDash) {
      navDash.addEventListener('click', () => this.switchView('dashboard'));
    }

    if (navAssets) {
      navAssets.addEventListener('click', () => this.switchView('assets'));
    }

    if (navMaint) {
      navMaint.addEventListener('click', () => this.switchView('maintenances'));
    }

    // Compatibilidade com seletores legados
    const tabAssets = document.getElementById('tab-assets');
    const tabMaint = document.getElementById('tab-maintenances');
    if (tabAssets) tabAssets.addEventListener('click', () => this.switchView('assets'));
    if (tabMaint) tabMaint.addEventListener('click', () => this.switchView('maintenances'));

    // Mini-filtros do Cronograma de Preventivas (NOC e Catálogo)
    document.querySelectorAll('.schedule-filters').forEach(groupEl => {
      const groupName = groupEl.dataset.scheduleGroup || 'noc';
      groupEl.querySelectorAll('.schedule-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const filter = btn.dataset.scheduleFilter || 'all';
          this.scheduleFilters[groupName] = filter;
          groupEl.querySelectorAll('.schedule-filter-btn').forEach(b => {
            b.classList.toggle('active', b === btn);
          });
          this.renderPreventiveSchedules(StorageManager.getAssets());
        });
      });
    });

    // Modais
    document.getElementById('btn-add-asset').addEventListener('click', () => this.openAssetModal());
    document.getElementById('btn-close-asset-modal').addEventListener('click', () => this.closeAssetModal());
    document.getElementById('btn-cancel-asset').addEventListener('click', () => this.closeAssetModal());

    document.getElementById('btn-add-maint').addEventListener('click', () => this.openMaintModal());
    document.getElementById('btn-close-maint-modal').addEventListener('click', () => this.closeMaintModal());
    document.getElementById('btn-cancel-maint').addEventListener('click', () => this.closeMaintModal());

    // Limpa mensagem customizada de validação de IP ao digitar
    const ipInput = document.getElementById('asset-ip');
    if (ipInput) {
      ipInput.addEventListener('input', () => ipInput.setCustomValidity(''));
    }

    // Submissão de Formulários
    document.getElementById('form-asset').addEventListener('submit', (e) => this.handleAssetSubmit(e));
    document.getElementById('form-maint').addEventListener('submit', (e) => this.handleMaintSubmit(e));

    // Filtros do Catálogo de Ativos
    document.getElementById('search-input').addEventListener('input', () => this.renderTables());
    document.getElementById('filter-type').addEventListener('change', () => this.renderTables());
    document.getElementById('filter-vendor').addEventListener('change', () => this.renderTables());
    document.getElementById('filter-status').addEventListener('change', () => this.renderTables());
    document.getElementById('filter-maint-status').addEventListener('change', () => this.renderTables());

    document.getElementById('btn-clear-filters').addEventListener('click', () => {
      document.getElementById('search-input').value = '';
      document.getElementById('filter-type').value = '';
      document.getElementById('filter-vendor').value = '';
      document.getElementById('filter-status').value = '';
      document.getElementById('filter-maint-status').value = '';
      this.renderTables();
    });

    // Filtros da Aba Registro de Ocorrências (Manutenções)
    const maintSearch = document.getElementById('maint-search-input');
    const filterMaintType = document.getElementById('filter-maint-type');
    const filterMaintAsset = document.getElementById('filter-maint-asset');
    const btnClearMaint = document.getElementById('btn-clear-maint-filters');

    if (maintSearch) maintSearch.addEventListener('input', () => this.renderTables());
    if (filterMaintType) filterMaintType.addEventListener('change', () => this.renderTables());
    if (filterMaintAsset) filterMaintAsset.addEventListener('change', () => this.renderTables());
    if (btnClearMaint) {
      btnClearMaint.addEventListener('click', () => {
        if (maintSearch) maintSearch.value = '';
        if (filterMaintType) filterMaintType.value = '';
        if (filterMaintAsset) filterMaintAsset.value = '';
        this.renderTables();
      });
    }

    // Resetar Dados
    document.getElementById('btn-reset-data').addEventListener('click', () => {
      if (confirm('Deseja restaurar os dados originais de demonstração? Todas as alterações serão mantidas no localStorage após restauração.')) {
        StorageManager.resetToDefaults();
        this.renderVendorOptions();
        this.renderMaintAssetFilterOptions();
        this.renderApp();
      }
    });
  }

  /**
   * Alterna entre as 3 Views Independentes (Painel Geral, Catálogo de Ativos, Registro de Ocorrências)
   */
  static switchView(viewName, scrollTop = true) {
    this.currentView = viewName;
    if (viewName === 'assets' || viewName === 'maintenances') {
      this.currentTab = viewName;
    }

    const viewMap = {
      dashboard: { sectionId: 'view-section-dashboard', navId: 'nav-item-dashboard' },
      assets: { sectionId: 'view-section-assets', navId: 'nav-item-assets' },
      maintenances: { sectionId: 'view-section-maint', navId: 'nav-item-maint' }
    };

    Object.keys(viewMap).forEach(key => {
      const { sectionId, navId } = viewMap[key];
      const sectionEl = document.getElementById(sectionId);
      const navEl = document.getElementById(navId);
      const isActive = key === viewName;

      if (sectionEl) {
        sectionEl.classList.toggle('active', isActive);
      }
      if (navEl) {
        navEl.classList.toggle('active', isActive);
      }
    });

    if (scrollTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Compatibilidade com chamadas existentes de switchTab
   */
  static switchTab(tabName) {
    this.switchView(tabName === 'maintenances' ? 'maintenances' : 'assets');
    this.renderTables();
  }

  static setSidebarActive(activeId) {
    ['nav-item-dashboard', 'nav-item-assets', 'nav-item-maint'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.toggle('active', id === activeId);
      }
    });
  }

  static scrollToTableSection() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Renderização completa de KPIs, Alerta de Maior Gasto, Gráficos, Cronograma Preventivo e Tabelas
   */
  static renderApp() {
    const assets = StorageManager.getAssets();
    const maintenances = StorageManager.getMaintenances();

    this.renderKPIs(assets, maintenances);
    this.renderMajorExpenseBanner(maintenances);
    this.renderCharts(assets, maintenances);
    this.renderPreventiveSchedules(assets);
    this.renderTables();
  }

  /**
   * Renderiza os 10 Cards de Indicadores (KPIs) e os Resumos das Abas
   */
  static renderKPIs(assets, maintenances) {
    const totalAssets = assets.length;
    const activeAssets = assets.filter(a => a.status === 'ativo').length;
    const maintAssets = assets.filter(a => a.status === 'manutencao').length;
    const inactiveAssets = assets.filter(a => a.status === 'inativo').length;
    const overdueAssets = assets.filter(a => this.calculateMaintenanceStatus(a.dataUltimaPreventiva, a.periodoRevisaoDias).code === 'overdue').length;

    const totalOccurrences = maintenances.length;

    let costPreventive = 0;
    let costPredictive = 0;
    let costCorrective = 0;
    let totalDowntime = 0;

    maintenances.forEach(m => {
      const cost = parseFloat(m.custo) || 0;
      const downtime = parseFloat(m.tempoIndisponibilidadeHoras) || 0;
      totalDowntime += downtime;

      if (m.tipo === 'preventiva') costPreventive += cost;
      else if (m.tipo === 'preditiva') costPredictive += cost;
      else if (m.tipo === 'corretiva') costCorrective += cost;
    });

    const totalCost = costPreventive + costPredictive + costCorrective;

    const fmtCurrency = (v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    // KPIs principais (NOC)
    setText('kpi-total-assets', totalAssets);
    setText('kpi-active-assets', activeAssets);
    setText('kpi-maint-assets', maintAssets);
    setText('kpi-inactive-assets', inactiveAssets);
    setText('kpi-total-occurrences', totalOccurrences);

    setText('kpi-cost-preventive', fmtCurrency(costPreventive));
    setText('kpi-cost-predictive', fmtCurrency(costPredictive));
    setText('kpi-cost-corrective', fmtCurrency(costCorrective));
    setText('kpi-total-cost', fmtCurrency(totalCost));
    setText('kpi-total-downtime', `${totalDowntime.toFixed(1)}h`);

    // Contadores nas abas e cabeçalhos
    setText('asset-count-badge', totalAssets);
    setText('maint-count-badge', totalOccurrences);
    setText('nav-asset-count', totalAssets);
    setText('nav-maint-count', totalOccurrences);

    // Resumo rápido da Aba Catálogo de Ativos
    setText('assets-summary-total', totalAssets);
    setText('assets-summary-active', activeAssets);
    setText('assets-summary-maint', maintAssets);
    setText('assets-summary-overdue', overdueAssets);

    // Resumo rápido da Aba Registro de Ocorrências
    setText('maint-summary-total', totalOccurrences);
    setText('maint-summary-cost', fmtCurrency(totalCost));
    setText('maint-summary-corrective', fmtCurrency(costCorrective));
    setText('maint-summary-downtime', `${totalDowntime.toFixed(1)}h`);
  }

  /**
   * Identificação automática do maior gasto com manutenção
   */
  static renderMajorExpenseBanner(maintenances) {
    const descEl = document.getElementById('major-expense-desc');
    const valEl = document.getElementById('major-expense-value');

    if (!maintenances || maintenances.length === 0) {
      descEl.textContent = 'Nenhuma manutenção registrada até o momento.';
      valEl.textContent = 'R$ 0,00';
      return;
    }

    const costs = {
      preventiva: 0,
      preditiva: 0,
      corretiva: 0
    };

    let totalGlobal = 0;
    maintenances.forEach(m => {
      const c = parseFloat(m.custo) || 0;
      costs[m.tipo] = (costs[m.tipo] || 0) + c;
      totalGlobal += c;
    });

    if (totalGlobal === 0) {
      descEl.textContent = 'Não há custos de manutenção contabilizados.';
      valEl.textContent = 'R$ 0,00';
      return;
    }

    let majorType = 'preventiva';
    let majorVal = costs.preventiva;

    if (costs.preditiva > majorVal) {
      majorType = 'preditiva';
      majorVal = costs.preditiva;
    }
    if (costs.corretiva > majorVal) {
      majorType = 'corretiva';
      majorVal = costs.corretiva;
    }

    const pct = ((majorVal / totalGlobal) * 100).toFixed(1);
    const nomeTipoDisplay = {
      preventiva: 'Preventiva',
      preditiva: 'Preditiva',
      corretiva: 'Corretiva'
    }[majorType];

    descEl.innerHTML = `A <strong>Manutenção ${nomeTipoDisplay}</strong> representa o <strong>MAIOR CUSTO</strong> do sistema com <strong>${pct}%</strong> das despesas de infraestrutura.`;
    valEl.textContent = `R$ ${majorVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }

  /**
   * Renderização dos Gráficos SVG
   */
  static renderCharts(assets, maintenances) {
    // 1. Distribuição de ativos por Tipo (cores distintas por categoria via ChartRenderer.COLOR_MAP)
    const typesCount = {};
    assets.forEach(a => {
      const tipo = a.tipo || 'Outro';
      typesCount[tipo] = (typesCount[tipo] || 0) + 1;
    });

    const dataTypes = Object.keys(typesCount)
      .map(tipo => ({
        label: tipo,
        value: typesCount[tipo],
        color: ChartRenderer.COLOR_MAP[tipo.toLowerCase()] || undefined
      }))
      .sort((a, b) => b.value - a.value);
    ChartRenderer.renderDonutChart('chart-assets-by-type', dataTypes, { centerLabel: 'Ativos' });

    // 2. Equipamentos por Status
    const statusCount = { 'Ativo': 0, 'Manutenção': 0, 'Inativo': 0 };
    assets.forEach(a => {
      if (a.status === 'ativo') statusCount['Ativo']++;
      else if (a.status === 'manutencao') statusCount['Manutenção']++;
      else if (a.status === 'inativo') statusCount['Inativo']++;
    });

    const dataStatus = [
      { label: 'Ativo', value: statusCount['Ativo'], color: '#10B981' },
      { label: 'Manutenção', value: statusCount['Manutenção'], color: '#F59E0B' },
      { label: 'Inativo', value: statusCount['Inativo'], color: '#F43F5E' }
    ];
    ChartRenderer.renderDonutChart('chart-assets-by-status', dataStatus, { centerLabel: 'Status' });

    // 3. Gastos por Tipo de Manutenção
    const costsMap = { 'Preventiva': 0, 'Preditiva': 0, 'Corretiva': 0 };
    maintenances.forEach(m => {
      const c = parseFloat(m.custo) || 0;
      if (m.tipo === 'preventiva') costsMap['Preventiva'] += c;
      else if (m.tipo === 'preditiva') costsMap['Preditiva'] += c;
      else if (m.tipo === 'corretiva') costsMap['Corretiva'] += c;
    });

    const dataCosts = [
      { label: 'Preventiva', value: costsMap['Preventiva'], color: '#10B981' },
      { label: 'Preditiva', value: costsMap['Preditiva'], color: '#06B6D4' },
      { label: 'Corretiva', value: costsMap['Corretiva'], color: '#F43F5E' }
    ];
    ChartRenderer.renderBarChart('chart-costs-by-type', dataCosts, { isCurrency: true });

    // 4. Ocorrências por Equipamento (com tipo e cores semânticas por status)
    const occurrencesByAsset = {};
    maintenances.forEach(m => {
      const asset = assets.find(a => a.id === m.ativoId);
      const key = asset ? asset.id : 'removed';
      if (!occurrencesByAsset[key]) {
        const statusMeta = !asset
          ? { color: '#64748B', statusLabel: 'Removido', sublabel: 'Equipamento excluído' }
          : asset.status === 'ativo'
            ? { color: '#10B981', statusLabel: 'Ativo', sublabel: asset.tipo }
            : asset.status === 'manutencao'
              ? { color: '#F59E0B', statusLabel: 'Manutenção', sublabel: asset.tipo }
              : { color: '#F43F5E', statusLabel: 'Inativo', sublabel: asset.tipo };

        occurrencesByAsset[key] = {
          label: asset ? asset.nome : 'Ativo Removido',
          sublabel: asset ? `${asset.tipo} • ${statusMeta.statusLabel}` : statusMeta.sublabel,
          statusLabel: statusMeta.statusLabel,
          color: statusMeta.color,
          value: 0
        };
      }
      occurrencesByAsset[key].value += 1;
    });

    const dataOccurrences = Object.values(occurrencesByAsset)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5

    ChartRenderer.renderBarChart('chart-occurrences-by-asset', dataOccurrences, {
      unitSuffix: { singular: 'ocorr.', plural: 'ocorr.' }
    });
  }

  /**
   * Renderiza o Cronograma de Próximas Manutenções Preventivas (no NOC e no Catálogo)
   */
  static renderPreventiveSchedules(assets) {
    const items = assets.map(asset => {
      const status = this.calculateMaintenanceStatus(asset.dataUltimaPreventiva, asset.periodoRevisaoDias);
      return { asset, status };
    }).sort((a, b) => {
      // Sem registro ou atrasadas primeiro (menor daysRemaining primeiro)
      if (a.status.hasRecord !== b.status.hasRecord) {
        return a.status.hasRecord ? 1 : -1;
      }
      return a.status.daysRemaining - b.status.daysRemaining;
    });

    const counts = {
      all: items.length,
      overdue: items.filter(i => i.status.code === 'overdue').length,
      upcoming30: items.filter(i => i.status.hasRecord && i.status.daysRemaining >= 0 && i.status.daysRemaining <= 30).length,
      ok: items.filter(i => i.status.code === 'ok').length
    };

    // Atualiza contadores nos mini-filtros de todos os grupos
    document.querySelectorAll('.schedule-filters').forEach(groupEl => {
      ['all', 'overdue', 'upcoming30', 'ok'].forEach(key => {
        const badge = groupEl.querySelector(`[data-sf-count="${key}"]`);
        if (badge) badge.textContent = counts[key];
      });
    });

    this.renderScheduleIntoContainer('preventive-schedule-noc', items, this.scheduleFilters.noc);
    this.renderScheduleIntoContainer('preventive-schedule-assets', items, this.scheduleFilters.assets);
  }

  static renderScheduleIntoContainer(containerId, allItems, activeFilter) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const filtered = allItems.filter(({ status }) => {
      if (activeFilter === 'overdue') return status.code === 'overdue';
      if (activeFilter === 'upcoming30') return status.hasRecord && status.daysRemaining >= 0 && status.daysRemaining <= 30;
      if (activeFilter === 'ok') return status.code === 'ok';
      return true;
    });

    if (filtered.length === 0) {
      const emptyLabel = activeFilter === 'overdue'
        ? 'Nenhuma manutenção preventiva atrasada no momento.'
        : activeFilter === 'upcoming30'
          ? 'Nenhuma revisão preventiva prevista para os próximos 30 dias.'
          : activeFilter === 'ok'
            ? 'Nenhum equipamento com preventiva em dia.'
            : 'Nenhum equipamento cadastrado para monitorar preventivas.';
      container.innerHTML = `<div class="schedule-empty">${emptyLabel}</div>`;
      return;
    }

    const iconAlert = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2.6"/></svg>`;
    const iconClock = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
    const iconCheck = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    const iconPin = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
    const iconPlus = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;

    container.innerHTML = filtered.map(({ asset, status }) => {
      let stateClass = 'schedule-ok';
      let dayBadgeText = '';
      let dayBadgeIcon = iconCheck;
      let dateText = status.hasRecord ? `Prevista para <strong>${status.nextDateFormatted}</strong>` : 'Sem preventiva registrada';

      if (!status.hasRecord) {
        stateClass = 'schedule-overdue';
        dayBadgeText = 'Sem registro';
        dayBadgeIcon = iconAlert;
      } else if (status.daysRemaining < 0) {
        const d = Math.abs(status.daysRemaining);
        stateClass = 'schedule-overdue';
        dayBadgeText = d === 1 ? 'Atrasada há 1 dia' : `Atrasada há ${d} dias`;
        dayBadgeIcon = iconAlert;
      } else if (status.daysRemaining === 0) {
        stateClass = 'schedule-warning';
        dayBadgeText = 'Vence hoje';
        dayBadgeIcon = iconClock;
      } else if (status.daysRemaining === 1) {
        stateClass = 'schedule-warning';
        dayBadgeText = 'Amanhã';
        dayBadgeIcon = iconClock;
      } else if (status.daysRemaining <= 15) {
        stateClass = 'schedule-warning';
        dayBadgeText = `Faltam ${status.daysRemaining} dias`;
        dayBadgeIcon = iconClock;
      } else {
        stateClass = 'schedule-ok';
        dayBadgeText = `Faltam ${status.daysRemaining} dias`;
        dayBadgeIcon = iconCheck;
      }

      const typeColor = ChartRenderer.COLOR_MAP[(asset.tipo || '').toLowerCase()] || '#3B82F6';
      const progressPct = status.progressPct;
      const cycleLabel = `Ciclo de ${status.periodDays}d`;

      return `
        <div class="schedule-item ${stateClass}">
          <div class="schedule-item-info">
            <div class="schedule-item-top">
              <strong class="schedule-asset-name">${this.escapeHtml(asset.nome)}</strong>
              <span class="schedule-type-pill">
                <span class="schedule-type-dot" style="background-color: ${typeColor};"></span>
                ${this.escapeHtml(asset.tipo || 'Outro')}
              </span>
            </div>
            <div class="schedule-item-meta">
              <span class="schedule-loc">${iconPin} ${this.escapeHtml(asset.localizacao || 'Localização não informada')}</span>
              <span class="schedule-meta-sep">•</span>
              <span>${cycleLabel}</span>
            </div>
          </div>

          <div class="schedule-item-progress">
            <div class="schedule-progress-top">
              <span class="schedule-next-date">${dateText}</span>
              <span class="schedule-days-badge ${stateClass}-badge">
                ${dayBadgeIcon}
                <span>${dayBadgeText}</span>
              </span>
            </div>
            <div class="schedule-progress-track" title="Progresso do ciclo preventivo (${progressPct}%)">
              <div class="schedule-progress-fill ${stateClass}-fill" style="width: ${progressPct}%;"></div>
            </div>
          </div>

          <div class="schedule-item-action">
            <button type="button" class="btn btn-schedule-action" onclick="App.openPreventiveModalForAsset('${asset.id}')" title="Registrar manutenção preventiva para ${this.escapeHtml(asset.nome)}">
              ${iconPlus}
              <span>Registrar Preventiva</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Preenche as opções do select de fabricantes dinamicamente
   */
  static renderVendorOptions() {
    const assets = StorageManager.getAssets();
    const vendors = [...new Set(assets.map(a => a.fabricante).filter(Boolean))].sort();

    const select = document.getElementById('filter-vendor');
    if (!select) return;
    const prevValue = select.value;
    select.innerHTML = '<option value="">Todos os Fabricantes</option>';
    vendors.forEach(v => {
      const option = document.createElement('option');
      option.value = v;
      option.textContent = v;
      select.appendChild(option);
    });
    if (vendors.includes(prevValue)) {
      select.value = prevValue;
    }
  }

  /**
   * Preenche o filtro de equipamentos na aba Registro de Ocorrências
   */
  static renderMaintAssetFilterOptions() {
    const assets = StorageManager.getAssets();
    const select = document.getElementById('filter-maint-asset');
    if (!select) return;

    const prevValue = select.value;
    select.innerHTML = '<option value="">Todos os Equipamentos</option>';
    assets.forEach(a => {
      const option = document.createElement('option');
      option.value = a.id;
      option.textContent = `${a.nome} (${a.tipo})`;
      select.appendChild(option);
    });
    if (assets.some(a => a.id === prevValue)) {
      select.value = prevValue;
    }
  }

  /**
   * Calcula o status e o progresso do ciclo da próxima manutenção preventiva
   */
  static calculateMaintenanceStatus(lastMaintDateStr, periodDays) {
    const period = Math.max(parseInt(periodDays, 10) || 90, 1);

    if (!lastMaintDateStr) {
      return {
        code: 'overdue',
        hasRecord: false,
        label: 'Sem Registro',
        badgeClass: 'badge-inactive',
        daysRemaining: -9999,
        nextDateFormatted: 'N/D',
        periodDays: period,
        progressPct: 100
      };
    }

    // Parseia YYYY-MM-DD como data local para evitar deslocamento de fuso horário
    const normalizedStr = lastMaintDateStr.includes('T') ? lastMaintDateStr : `${lastMaintDateStr}T00:00:00`;
    const lastDate = new Date(normalizedStr);
    lastDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + period);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = nextDate - today;
    const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const elapsedDays = period - daysRemaining;
    const progressPct = Math.min(100, Math.max(6, Math.round((elapsedDays / period) * 100)));

    const nextDateFormatted = nextDate.toLocaleDateString('pt-BR');

    if (daysRemaining < 0) {
      return {
        code: 'overdue',
        hasRecord: true,
        label: `Atrasada (${Math.abs(daysRemaining)}d)`,
        badgeClass: 'badge-inactive',
        daysRemaining,
        nextDateFormatted,
        periodDays: period,
        progressPct: 100
      };
    } else if (daysRemaining <= 15) {
      return {
        code: 'warning',
        hasRecord: true,
        label: daysRemaining === 0 ? 'Vence hoje' : `Próxima (${daysRemaining}d)`,
        badgeClass: 'badge-maint',
        daysRemaining,
        nextDateFormatted,
        periodDays: period,
        progressPct
      };
    } else {
      return {
        code: 'ok',
        hasRecord: true,
        label: `Em dia (${nextDateFormatted})`,
        badgeClass: 'badge-active',
        daysRemaining,
        nextDateFormatted,
        periodDays: period,
        progressPct
      };
    }
  }

  /**
   * Valida formato IPv4 quando o campo opcional for preenchido
   */
  static isValidIPv4(ip) {
    const ipv4Regex = /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
    return ipv4Regex.test(ip);
  }

  /**
   * Renderiza as tabelas de Ativos e Manutenções com seus respectivos filtros
   */
  static renderTables() {
    const assets = StorageManager.getAssets();
    const maintenances = StorageManager.getMaintenances();

    // --- 1. Tabela de Ativos ---
    const searchVal = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
    const filterType = document.getElementById('filter-type')?.value || '';
    const filterVendor = document.getElementById('filter-vendor')?.value || '';
    const filterStatus = document.getElementById('filter-status')?.value || '';
    const filterMaintStatus = document.getElementById('filter-maint-status')?.value || '';

    const filteredAssets = assets.filter(a => {
      const matchSearch = !searchVal ||
        (a.nome && a.nome.toLowerCase().includes(searchVal)) ||
        (a.ip && a.ip.toLowerCase().includes(searchVal)) ||
        (a.mac && a.mac.toLowerCase().includes(searchVal)) ||
        (a.numeroSerie && a.numeroSerie.toLowerCase().includes(searchVal)) ||
        (a.localizacao && a.localizacao.toLowerCase().includes(searchVal));

      const matchType = !filterType || a.tipo === filterType;
      const matchVendor = !filterVendor || a.fabricante === filterVendor;
      const matchStatus = !filterStatus || a.status === filterStatus;

      const maintStatusInfo = this.calculateMaintenanceStatus(a.dataUltimaPreventiva, a.periodoRevisaoDias);
      const matchMaintStatus = !filterMaintStatus || maintStatusInfo.code === filterMaintStatus;

      return matchSearch && matchType && matchVendor && matchStatus && matchMaintStatus;
    });

    const assetsMetaEl = document.getElementById('assets-filtered-meta');
    if (assetsMetaEl) {
      assetsMetaEl.textContent = filteredAssets.length === assets.length
        ? `Exibindo todos os ${assets.length} equipamentos`
        : `Exibindo ${filteredAssets.length} de ${assets.length} equipamentos`;
    }

    const assetsTbody = document.getElementById('assets-table-body');
    if (filteredAssets.length === 0) {
      assetsTbody.innerHTML = `<tr><td colspan="8" class="empty-table-msg">Nenhum ativo encontrado para os filtros selecionados.</td></tr>`;
    } else {
      assetsTbody.innerHTML = filteredAssets.map(a => {
        const maintStatus = this.calculateMaintenanceStatus(a.dataUltimaPreventiva, a.periodoRevisaoDias);
        const statusBadge = a.status === 'ativo' ? '<span class="badge badge-active">Ativo</span>' :
                            a.status === 'manutencao' ? '<span class="badge badge-maint">Manutenção</span>' :
                            '<span class="badge badge-inactive">Inativo</span>';

        const ipHtml = a.ip && a.ip.trim()
          ? `<code>${this.escapeHtml(a.ip.trim())}</code>`
          : `<span class="badge-no-ip">Sem IP</span>`;
        const macHtml = a.mac && a.mac.trim()
          ? `<div class="cell-mac"><small>${this.escapeHtml(a.mac.trim())}</small></div>`
          : '';

        return `
          <tr>
            <td><strong>${this.escapeHtml(a.nome)}</strong></td>
            <td class="cell-wrap">${this.escapeHtml(a.tipo)}</td>
            <td class="cell-wrap">${this.escapeHtml(a.fabricante)}${a.modelo ? `<br><small class="text-muted">${this.escapeHtml(a.modelo)}</small>` : ''}</td>
            <td>${ipHtml}${macHtml}</td>
            <td class="cell-wrap">${this.escapeHtml(a.localizacao || '-')}</td>
            <td>${statusBadge}</td>
            <td><span class="badge ${maintStatus.badgeClass}">${maintStatus.label}</span></td>
            <td class="cell-actions">
              <div class="table-actions-group">
                <button class="btn btn-secondary btn-sm" onclick="App.editAsset('${a.id}')" title="Editar Ativo">Editar</button>
                <button class="btn btn-cyan btn-sm" onclick="App.openMaintModalForAsset('${a.id}')" title="Nova Manutenção">+ Manut.</button>
                <button class="btn btn-danger btn-sm" onclick="App.deleteAsset('${a.id}')" title="Excluir Ativo">Excluir</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    // --- 2. Tabela de Manutenções ---
    const maintSearchVal = (document.getElementById('maint-search-input')?.value || '').toLowerCase().trim();
    const filterMaintType = document.getElementById('filter-maint-type')?.value || '';
    const filterMaintAsset = document.getElementById('filter-maint-asset')?.value || '';

    const filteredMaint = maintenances.filter(m => {
      const asset = assets.find(a => a.id === m.ativoId);
      const assetName = asset ? asset.nome.toLowerCase() : '';
      const desc = m.descricao ? m.descricao.toLowerCase() : '';

      const matchSearch = !maintSearchVal || assetName.includes(maintSearchVal) || desc.includes(maintSearchVal);
      const matchType = !filterMaintType || m.tipo === filterMaintType;
      const matchAsset = !filterMaintAsset || m.ativoId === filterMaintAsset;
      return matchSearch && matchType && matchAsset;
    }).sort((a, b) => (b.data || '').localeCompare(a.data || ''));

    const maintMetaEl = document.getElementById('maint-filtered-meta');
    if (maintMetaEl) {
      maintMetaEl.textContent = filteredMaint.length === maintenances.length
        ? `Exibindo todos os ${maintenances.length} registros`
        : `Exibindo ${filteredMaint.length} de ${maintenances.length} registros`;
    }

    const maintTbody = document.getElementById('maintenances-table-body');
    const maintTfoot = document.getElementById('maintenances-table-foot');

    if (filteredMaint.length === 0) {
      maintTbody.innerHTML = `<tr><td colspan="7" class="empty-table-msg">Nenhuma manutenção encontrada para os filtros selecionados.</td></tr>`;
      if (maintTfoot) maintTfoot.innerHTML = '';
    } else {
      let filteredCostSum = 0;
      let filteredDowntimeSum = 0;

      maintTbody.innerHTML = filteredMaint.map(m => {
        const asset = assets.find(a => a.id === m.ativoId);
        const assetName = asset ? asset.nome : 'Ativo Removido';
        const assetSub = asset ? `${asset.tipo}${asset.ip ? ' • ' + asset.ip : ' • Sem IP'}` : 'Removido do inventário';
        const costNum = parseFloat(m.custo || 0);
        const downtimeNum = parseFloat(m.tempoIndisponibilidadeHoras || 0);
        filteredCostSum += costNum;
        filteredDowntimeSum += downtimeNum;

        const costFmt = `R$ ${costNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        const dateFmt = m.data ? new Date(m.data + 'T00:00:00').toLocaleDateString('pt-BR') : '-';

        const tipoBadge = m.tipo === 'preventiva' ? '<span class="badge badge-active">Preventiva</span>' :
                          m.tipo === 'preditiva' ? '<span class="badge badge-predictive">Preditiva</span>' :
                          '<span class="badge badge-inactive">Corretiva</span>';

        return `
          <tr>
            <td><span class="cell-mono">${dateFmt}</span></td>
            <td><strong>${this.escapeHtml(assetName)}</strong><br><small class="text-muted">${this.escapeHtml(assetSub)}</small></td>
            <td>${tipoBadge}</td>
            <td class="cell-wrap cell-desc">${this.escapeHtml(m.descricao)}</td>
            <td><strong class="cell-mono">${costFmt}</strong></td>
            <td><span class="cell-mono">${downtimeNum.toFixed(1)}h</span></td>
            <td class="cell-actions">
              <button class="btn btn-danger btn-sm" onclick="App.deleteMaintenance('${m.id}')">Excluir</button>
            </td>
          </tr>
        `;
      }).join('');

      if (maintTfoot) {
        const totalCostFmt = `R$ ${filteredCostSum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        maintTfoot.innerHTML = `
          <tr class="table-total-row">
            <td colspan="4"><strong>Totais (${filteredMaint.length} ${filteredMaint.length === 1 ? 'ocorrência' : 'ocorrências'})</strong></td>
            <td><strong class="cell-mono">${totalCostFmt}</strong></td>
            <td><strong class="cell-mono">${filteredDowntimeSum.toFixed(1)}h</strong></td>
            <td></td>
          </tr>
        `;
      }
    }
  }

  /**
   * Operações com Modais de Ativos
   */
  static openAssetModal(asset = null) {
    const modal = document.getElementById('modal-asset');
    const title = document.getElementById('modal-asset-title');
    const form = document.getElementById('form-asset');
    const ipInput = document.getElementById('asset-ip');

    form.reset();
    if (ipInput) ipInput.setCustomValidity('');

    if (asset) {
      title.textContent = 'Editar Ativo de Rede';
      document.getElementById('asset-id').value = asset.id;
      document.getElementById('asset-name').value = asset.nome || '';
      document.getElementById('asset-type').value = asset.tipo || 'Switch';
      document.getElementById('asset-vendor').value = asset.fabricante || '';
      document.getElementById('asset-model').value = asset.modelo || '';
      document.getElementById('asset-sn').value = asset.numeroSerie || '';
      document.getElementById('asset-ip').value = asset.ip || '';
      document.getElementById('asset-mac').value = asset.mac || '';
      document.getElementById('asset-vlan').value = asset.vlan || '';
      document.getElementById('asset-gateway').value = asset.gateway || '';
      document.getElementById('asset-location').value = asset.localizacao || '';
      document.getElementById('asset-status').value = asset.status || 'ativo';
      document.getElementById('asset-last-maint').value = asset.dataUltimaPreventiva || '';
      document.getElementById('asset-review-period').value = asset.periodoRevisaoDias || 90;
    } else {
      title.textContent = 'Cadastrar Novo Ativo de Rede';
      document.getElementById('asset-id').value = '';
    }

    modal.classList.add('active');
  }

  static closeAssetModal() {
    document.getElementById('modal-asset').classList.remove('active');
  }

  static editAsset(id) {
    const assets = StorageManager.getAssets();
    const asset = assets.find(a => a.id === id);
    if (asset) {
      this.openAssetModal(asset);
    }
  }

  static deleteAsset(id) {
    if (confirm('Tem certeza que deseja excluir este ativo de rede? O histórico de manutenções associado também será removido.')) {
      StorageManager.deleteAsset(id);
      this.renderVendorOptions();
      this.renderMaintAssetFilterOptions();
      this.renderApp();
    }
  }

  static handleAssetSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('asset-id').value;
    const ipInput = document.getElementById('asset-ip');
    const ipVal = ipInput.value.trim();

    // Endereço IP é opcional; valida formato IPv4 apenas se preenchido
    if (ipVal !== '' && !this.isValidIPv4(ipVal)) {
      ipInput.setCustomValidity('Informe um endereço IPv4 válido (ex: 192.168.1.1) ou deixe em branco.');
      ipInput.reportValidity();
      ipInput.focus();
      return;
    }
    ipInput.setCustomValidity('');

    const assetData = {
      id: id || undefined,
      nome: document.getElementById('asset-name').value.trim(),
      tipo: document.getElementById('asset-type').value,
      fabricante: document.getElementById('asset-vendor').value.trim(),
      modelo: document.getElementById('asset-model').value.trim(),
      numeroSerie: document.getElementById('asset-sn').value.trim(),
      ip: ipVal,
      mac: document.getElementById('asset-mac').value.trim(),
      vlan: document.getElementById('asset-vlan').value.trim(),
      gateway: document.getElementById('asset-gateway').value.trim(),
      localizacao: document.getElementById('asset-location').value.trim(),
      status: document.getElementById('asset-status').value,
      dataUltimaPreventiva: document.getElementById('asset-last-maint').value,
      periodoRevisaoDias: parseInt(document.getElementById('asset-review-period').value, 10) || 90
    };

    if (id) {
      StorageManager.updateAsset(assetData);
    } else {
      StorageManager.addAsset(assetData);
    }

    this.closeAssetModal();
    this.renderVendorOptions();
    this.renderMaintAssetFilterOptions();
    this.renderApp();
  }

  /**
   * Operações com Modais de Manutenções
   */
  static openMaintModal() {
    const modal = document.getElementById('modal-maint');
    const select = document.getElementById('maint-asset-id');
    const form = document.getElementById('form-maint');

    form.reset();

    const assets = StorageManager.getAssets();
    select.innerHTML = '<option value="">Selecione o equipamento...</option>';
    assets.forEach(a => {
      const option = document.createElement('option');
      option.value = a.id;
      const ipDisplay = a.ip && a.ip.trim() ? a.ip.trim() : 'Sem IP';
      option.textContent = `${a.nome} (${ipDisplay}) - ${a.tipo}`;
      select.appendChild(option);
    });

    document.getElementById('maint-date').value = new Date().toISOString().split('T')[0];
    modal.classList.add('active');
  }

  static openMaintModalForAsset(assetId) {
    this.openMaintModal();
    document.getElementById('maint-asset-id').value = assetId;
  }

  static openPreventiveModalForAsset(assetId) {
    this.openMaintModalForAsset(assetId);
    const maintTypeSelect = document.getElementById('maint-type');
    if (maintTypeSelect) {
      maintTypeSelect.value = 'preventiva';
    }
  }

  static closeMaintModal() {
    document.getElementById('modal-maint').classList.remove('active');
  }

  static deleteMaintenance(id) {
    if (confirm('Deseja realmente excluir este registro de manutenção?')) {
      StorageManager.deleteMaintenance(id);
      this.renderApp();
    }
  }

  static handleMaintSubmit(e) {
    e.preventDefault();

    const assetId = document.getElementById('maint-asset-id').value;
    const maintType = document.getElementById('maint-type').value;
    const maintDate = document.getElementById('maint-date').value;
    const cost = parseFloat(document.getElementById('maint-cost').value) || 0;
    const downtime = parseFloat(document.getElementById('maint-downtime').value) || 0;
    const desc = document.getElementById('maint-desc').value.trim();

    const maintData = {
      ativoId: assetId,
      tipo: maintType,
      data: maintDate,
      custo: cost,
      tempoIndisponibilidadeHoras: downtime,
      descricao: desc
    };

    StorageManager.addMaintenance(maintData);

    // Se a manutenção for preventiva, atualiza automaticamente a data de última preventiva no ativo
    if (maintType === 'preventiva' && maintDate) {
      const assets = StorageManager.getAssets();
      const asset = assets.find(a => a.id === assetId);
      if (asset) {
        asset.dataUltimaPreventiva = maintDate;
        StorageManager.updateAsset(asset);
      }
    }

    this.closeMaintModal();
    this.renderApp();
  }

  static escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }
}
