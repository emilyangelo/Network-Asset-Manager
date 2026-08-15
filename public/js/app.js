/**
 * App - Controlador Principal da Aplicação Client-Side
 * Network Asset Manager
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

class App {
  static currentTab = 'assets'; // 'assets' ou 'maintenances'

  static init() {
    this.bindEvents();
    this.renderVendorOptions();
    this.renderApp();
  }

  /**
   * Vincula escutadores de eventos de botões, filtros, busca e modais
   */
  static bindEvents() {
    // Navegação via Sidebar
    const navDash = document.getElementById('nav-item-dashboard');
    const navAssets = document.getElementById('nav-item-assets');
    const navMaint = document.getElementById('nav-item-maint');

    if (navDash) {
      navDash.addEventListener('click', () => {
        this.setSidebarActive('nav-item-dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (navAssets) {
      navAssets.addEventListener('click', () => {
        this.switchTab('assets');
        this.scrollToTableSection();
      });
    }

    if (navMaint) {
      navMaint.addEventListener('click', () => {
        this.switchTab('maintenances');
        this.scrollToTableSection();
      });
    }

    // Abas de navegação internas da Tabela
    document.getElementById('tab-assets').addEventListener('click', () => this.switchTab('assets'));
    document.getElementById('tab-maintenances').addEventListener('click', () => this.switchTab('maintenances'));

    // Modais
    document.getElementById('btn-add-asset').addEventListener('click', () => this.openAssetModal());
    document.getElementById('btn-close-asset-modal').addEventListener('click', () => this.closeAssetModal());
    document.getElementById('btn-cancel-asset').addEventListener('click', () => this.closeAssetModal());

    document.getElementById('btn-add-maint').addEventListener('click', () => this.openMaintModal());
    document.getElementById('btn-close-maint-modal').addEventListener('click', () => this.closeMaintModal());
    document.getElementById('btn-cancel-maint').addEventListener('click', () => this.closeMaintModal());

    // Submissão de Formulários
    document.getElementById('form-asset').addEventListener('submit', (e) => this.handleAssetSubmit(e));
    document.getElementById('form-maint').addEventListener('submit', (e) => this.handleMaintSubmit(e));

    // Filtros e Pesquisa em Tempo Real
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

    // Resetar Dados
    document.getElementById('btn-reset-data').addEventListener('click', () => {
      if (confirm('Deseja restaurar os dados originais de demonstração? Todas as alterações serão mantidas no localStorage após restauração.')) {
        StorageManager.resetToDefaults();
        this.renderVendorOptions();
        this.renderApp();
      }
    });
  }

  /**
   * Altera a aba ativa entre Ativos e Manutenções
   */
  static switchTab(tabName) {
    this.currentTab = tabName;
    const tabAssetsBtn = document.getElementById('tab-assets');
    const tabMaintBtn = document.getElementById('tab-maintenances');
    const viewAssets = document.getElementById('view-assets-container');
    const viewMaint = document.getElementById('view-maintenances-container');

    if (tabName === 'assets') {
      if (tabAssetsBtn) tabAssetsBtn.classList.add('active');
      if (tabMaintBtn) tabMaintBtn.classList.remove('active');
      if (viewAssets) viewAssets.style.display = 'block';
      if (viewMaint) viewMaint.style.display = 'none';
      this.setSidebarActive('nav-item-assets');
    } else {
      if (tabMaintBtn) tabMaintBtn.classList.add('active');
      if (tabAssetsBtn) tabAssetsBtn.classList.remove('active');
      if (viewAssets) viewAssets.style.display = 'none';
      if (viewMaint) viewMaint.style.display = 'block';
      this.setSidebarActive('nav-item-maint');
    }

    this.renderTables();
  }

  static setSidebarActive(activeId) {
    ['nav-item-dashboard', 'nav-item-assets', 'nav-item-maint'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === activeId) el.classList.add('active');
        else el.classList.remove('active');
      }
    });
  }

  static scrollToTableSection() {
    const tableSection = document.querySelector('.table-section');
    if (tableSection) {
      tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Renderização completa de KPIs, Alerta de Maior Gasto, Gráficos e Tabelas
   */
  static renderApp() {
    const assets = StorageManager.getAssets();
    const maintenances = StorageManager.getMaintenances();

    this.renderKPIs(assets, maintenances);
    this.renderMajorExpenseBanner(maintenances);
    this.renderCharts(assets, maintenances);
    this.renderTables();
  }

  /**
   * Renderiza os 10 Cards de Indicadores (KPIs)
   */
  static renderKPIs(assets, maintenances) {
    const totalAssets = assets.length;
    const activeAssets = assets.filter(a => a.status === 'ativo').length;
    const maintAssets = assets.filter(a => a.status === 'manutencao').length;
    const inactiveAssets = assets.filter(a => a.status === 'inativo').length;

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

    document.getElementById('kpi-total-assets').textContent = totalAssets;
    document.getElementById('kpi-active-assets').textContent = activeAssets;
    document.getElementById('kpi-maint-assets').textContent = maintAssets;
    document.getElementById('kpi-inactive-assets').textContent = inactiveAssets;
    document.getElementById('kpi-total-occurrences').textContent = totalOccurrences;

    document.getElementById('kpi-cost-preventive').textContent = fmtCurrency(costPreventive);
    document.getElementById('kpi-cost-predictive').textContent = fmtCurrency(costPredictive);
    document.getElementById('kpi-cost-corrective').textContent = fmtCurrency(costCorrective);
    document.getElementById('kpi-total-cost').textContent = fmtCurrency(totalCost);
    document.getElementById('kpi-total-downtime').textContent = `${totalDowntime.toFixed(1)}h`;

    document.getElementById('asset-count-badge').textContent = totalAssets;
    document.getElementById('maint-count-badge').textContent = totalOccurrences;
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
    // 1. Distribuição de ativos por Tipo
    const typesCount = {};
    assets.forEach(a => {
      typesCount[a.tipo] = (typesCount[a.tipo] || 0) + 1;
    });

    const dataTypes = Object.keys(typesCount).map(tipo => ({
      label: tipo,
      value: typesCount[tipo]
    }));
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
      { label: 'Inativo', value: statusCount['Inativo'], color: '#EF4444' }
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
      { label: 'Corretiva', value: costsMap['Corretiva'], color: '#EF4444' }
    ];
    ChartRenderer.renderBarChart('chart-costs-by-type', dataCosts, { isCurrency: true });

    // 4. Ocorrências por Equipamento
    const occurrencesByAsset = {};
    maintenances.forEach(m => {
      const asset = assets.find(a => a.id === m.ativoId);
      const name = asset ? asset.nome : 'Ativo Removido';
      occurrencesByAsset[name] = (occurrencesByAsset[name] || 0) + 1;
    });

    const dataOccurrences = Object.keys(occurrencesByAsset).map(nome => ({
      label: nome,
      value: occurrencesByAsset[nome],
      color: '#3B82F6'
    })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5

    ChartRenderer.renderBarChart('chart-occurrences-by-asset', dataOccurrences);
  }

  /**
   * Preenche as opções do select de fabricantes dinamicamente
   */
  static renderVendorOptions() {
    const assets = StorageManager.getAssets();
    const vendors = [...new Set(assets.map(a => a.fabricante).filter(Boolean))].sort();

    const select = document.getElementById('filter-vendor');
    select.innerHTML = '<option value="">Todos os Fabricantes</option>';
    vendors.forEach(v => {
      const option = document.createElement('option');
      option.value = v;
      option.textContent = v;
      select.appendChild(option);
    });
  }

  /**
   * Calcula o status da próxima manutenção preventiva
   */
  static calculateMaintenanceStatus(lastMaintDateStr, periodDays) {
    if (!lastMaintDateStr) {
      return { code: 'overdue', label: 'Sem Registro', badgeClass: 'badge-inactive', daysRemaining: -999, nextDateFormatted: 'N/D' };
    }

    const lastDate = new Date(lastMaintDateStr);
    const period = parseInt(periodDays) || 90;
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + period);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = nextDate - today;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const nextDateFormatted = nextDate.toLocaleDateString('pt-BR');

    if (daysRemaining < 0) {
      return {
        code: 'overdue',
        label: `Atrasada (${Math.abs(daysRemaining)}d)`,
        badgeClass: 'badge-inactive',
        daysRemaining,
        nextDateFormatted
      };
    } else if (daysRemaining <= 15) {
      return {
        code: 'warning',
        label: `Próxima (${daysRemaining}d)`,
        badgeClass: 'badge-maint',
        daysRemaining,
        nextDateFormatted
      };
    } else {
      return {
        code: 'ok',
        label: `Em dia (${nextDateFormatted})`,
        badgeClass: 'badge-active',
        daysRemaining,
        nextDateFormatted
      };
    }
  }

  /**
   * Renderiza as tabelas com os filtros aplicados
   */
  static renderTables() {
    const assets = StorageManager.getAssets();
    const maintenances = StorageManager.getMaintenances();

    const searchVal = document.getElementById('search-input').value.toLowerCase().trim();
    const filterType = document.getElementById('filter-type').value;
    const filterVendor = document.getElementById('filter-vendor').value;
    const filterStatus = document.getElementById('filter-status').value;
    const filterMaintStatus = document.getElementById('filter-maint-status').value;

    // Filtragem de Ativos
    const filteredAssets = assets.filter(a => {
      const matchSearch = !searchVal || 
        (a.nome && a.nome.toLowerCase().includes(searchVal)) ||
        (a.ip && a.ip.toLowerCase().includes(searchVal)) ||
        (a.mac && a.mac.toLowerCase().includes(searchVal)) ||
        (a.numeroSerie && a.numeroSerie.toLowerCase().includes(searchVal));

      const matchType = !filterType || a.tipo === filterType;
      const matchVendor = !filterVendor || a.fabricante === filterVendor;
      const matchStatus = !filterStatus || a.status === filterStatus;

      const maintStatusInfo = this.calculateMaintenanceStatus(a.dataUltimaPreventiva, a.periodoRevisaoDias);
      const matchMaintStatus = !filterMaintStatus || maintStatusInfo.code === filterMaintStatus;

      return matchSearch && matchType && matchVendor && matchStatus && matchMaintStatus;
    });

    // Renderiza Tabela de Ativos
    const assetsTbody = document.getElementById('assets-table-body');
    if (filteredAssets.length === 0) {
      assetsTbody.innerHTML = `<tr><td colspan="9" class="empty-table-msg">Nenhum ativo encontrado para os filtros selecionados.</td></tr>`;
    } else {
      assetsTbody.innerHTML = filteredAssets.map(a => {
        const maintStatus = this.calculateMaintenanceStatus(a.dataUltimaPreventiva, a.periodoRevisaoDias);
        const statusBadge = a.status === 'ativo' ? '<span class="badge badge-active">Ativo</span>' :
                            a.status === 'manutencao' ? '<span class="badge badge-maint">Manutenção</span>' :
                            '<span class="badge badge-inactive">Inativo</span>';

        return `
          <tr>
            <td><strong>${this.escapeHtml(a.nome)}</strong></td>
            <td>${this.escapeHtml(a.tipo)}</td>
            <td>${this.escapeHtml(a.fabricante)} ${a.modelo ? `<br><small class="text-muted">${this.escapeHtml(a.modelo)}</small>` : ''}</td>
            <td><code>${this.escapeHtml(a.ip)}</code></td>
            <td><small>${this.escapeHtml(a.mac || '-')}</small></td>
            <td>${this.escapeHtml(a.localizacao || '-')}</td>
            <td>${statusBadge}</td>
            <td><span class="badge ${maintStatus.badgeClass}">${maintStatus.label}</span></td>
            <td style="text-align: right;">
              <button class="btn btn-secondary btn-sm" onclick="App.editAsset('${a.id}')" title="Editar Ativo">Editar</button>
              <button class="btn btn-cyan btn-sm" onclick="App.openMaintModalForAsset('${a.id}')" title="Nova Manutenção">+ Manut.</button>
              <button class="btn btn-danger btn-sm" onclick="App.deleteAsset('${a.id}')" title="Excluir Ativo">Excluir</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Renderiza Tabela de Manutenções
    const maintTbody = document.getElementById('maintenances-table-body');
    const filteredMaint = maintenances.filter(m => {
      const asset = assets.find(a => a.id === m.ativoId);
      const assetName = asset ? asset.nome.toLowerCase() : '';
      const desc = m.descricao ? m.descricao.toLowerCase() : '';
      
      const matchSearch = !searchVal || assetName.includes(searchVal) || desc.includes(searchVal);
      return matchSearch;
    });

    if (filteredMaint.length === 0) {
      maintTbody.innerHTML = `<tr><td colspan="7" class="empty-table-msg">Nenhuma manutenção encontrada.</td></tr>`;
    } else {
      maintTbody.innerHTML = filteredMaint.map(m => {
        const asset = assets.find(a => a.id === m.ativoId);
        const assetName = asset ? asset.nome : 'Ativo Removido';
        const costFmt = `R$ ${parseFloat(m.custo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        const dateFmt = m.data ? new Date(m.data + 'T00:00:00').toLocaleDateString('pt-BR') : '-';

        const tipoBadge = m.tipo === 'preventiva' ? '<span class="badge badge-active">Preventiva</span>' :
                          m.tipo === 'preditiva' ? '<span class="badge badge-maint" style="color:var(--cyan); border-color:var(--cyan);">Preditiva</span>' :
                          '<span class="badge badge-inactive">Corretiva</span>';

        return `
          <tr>
            <td>${dateFmt}</td>
            <td><strong>${this.escapeHtml(assetName)}</strong></td>
            <td>${tipoBadge}</td>
            <td>${this.escapeHtml(m.descricao)}</td>
            <td><strong>${costFmt}</strong></td>
            <td>${m.tempoIndisponibilidadeHoras || 0}h</td>
            <td style="text-align: right;">
              <button class="btn btn-danger btn-sm" onclick="App.deleteMaintenance('${m.id}')">Excluir</button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  /**
   * Operações com Modais de Ativos
   */
  static openAssetModal(asset = null) {
    const modal = document.getElementById('modal-asset');
    const title = document.getElementById('modal-asset-title');
    const form = document.getElementById('form-asset');

    form.reset();

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
      this.renderApp();
    }
  }

  static handleAssetSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('asset-id').value;

    const assetData = {
      id: id || undefined,
      nome: document.getElementById('asset-name').value.trim(),
      tipo: document.getElementById('asset-type').value,
      fabricante: document.getElementById('asset-vendor').value.trim(),
      modelo: document.getElementById('asset-model').value.trim(),
      numeroSerie: document.getElementById('asset-sn').value.trim(),
      ip: document.getElementById('asset-ip').value.trim(),
      mac: document.getElementById('asset-mac').value.trim(),
      vlan: document.getElementById('asset-vlan').value.trim(),
      gateway: document.getElementById('asset-gateway').value.trim(),
      localizacao: document.getElementById('asset-location').value.trim(),
      status: document.getElementById('asset-status').value,
      dataUltimaPreventiva: document.getElementById('asset-last-maint').value,
      periodoRevisaoDias: parseInt(document.getElementById('asset-review-period').value) || 90
    };

    if (id) {
      StorageManager.updateAsset(assetData);
    } else {
      StorageManager.addAsset(assetData);
    }

    this.closeAssetModal();
    this.renderVendorOptions();
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
      option.textContent = `${a.nome} (${a.ip}) - ${a.tipo}`;
      select.appendChild(option);
    });

    document.getElementById('maint-date').value = new Date().toISOString().split('T')[0];
    modal.classList.add('active');
  }

  static openMaintModalForAsset(assetId) {
    this.openMaintModal();
    document.getElementById('maint-asset-id').value = assetId;
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
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }
}
