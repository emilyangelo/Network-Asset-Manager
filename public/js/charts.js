/**
 * ChartRenderer - Geração de Gráficos SVG Nativo e Interativo
 * Network Asset Manager
 * 
 * Sem dependências externas. Paleta executiva vibrante, 13 categorias de ativos,
 * hover dinâmico e tooltips adaptados ao tema Claro/Escuro.
 */

class ChartRenderer {
  // Paleta de cores distinta para até 13+ categorias
  static COLORS = [
    '#3B82F6', // Azul vibrante
    '#06B6D4', // Ciano
    '#F43F5E', // Coral
    '#6366F1', // Índigo
    '#10B981', // Esmeralda
    '#8B5CF6', // Violeta
    '#EC4899', // Rosa
    '#F59E0B', // Âmbar
    '#14B8A6', // Teal
    '#F97316', // Laranja
    '#0EA5E9', // Azul céu
    '#84CC16', // Lima
    '#64748B'  // Cinza ardósia
  ];

  static COLOR_MAP = {
    // Status
    'ativo': '#10B981',
    'manutencao': '#F59E0B',
    'manutenção': '#F59E0B',
    'inativo': '#F43F5E',
    // Tipos Manutenção
    'preventiva': '#10B981',
    'preditiva': '#06B6D4',
    'corretiva': '#F43F5E',
    // Categorias de Tipo de Equipamento (13 categorias distintas)
    'switch': '#3B82F6',
    'roteador': '#06B6D4',
    'firewall': '#F43F5E',
    'servidor': '#6366F1',
    'access point': '#10B981',
    'storage / nas': '#8B5CF6',
    'impressora / multifuncional': '#EC4899',
    'nobreak (ups)': '#F59E0B',
    'patch panel': '#14B8A6',
    'câmera ip / nvr': '#F97316',
    'camera ip / nvr': '#F97316',
    'telefone ip (voip)': '#0EA5E9',
    'desktop / notebook': '#84CC16',
    'outro': '#64748B'
  };

  /**
   * Gráfico de Rosca (Donut) SVG Interativo com hover sincronizado e tooltip
   */
  static renderDonutChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!data || data.length === 0 || data.every(d => d.value === 0)) {
      container.innerHTML = '<div class="chart-empty">Nenhum dado disponível</div>';
      return;
    }

    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    const nonZeroItems = data.filter(d => d.value > 0);
    const size = 196;
    const strokeWidth = 26;
    const radius = (size - strokeWidth - 10) / 2;
    const circumference = 2 * Math.PI * radius;

    // Decide entre pontas arredondadas (com espaçamento limpo) ou espaçamento reto para muitas fatias pequenas
    const minSliceArc = nonZeroItems.length > 0
      ? Math.min(...nonZeroItems.map(d => (d.value / total) * circumference))
      : circumference;
    const useRoundedCaps = nonZeroItems.length === 1 || minSliceArc >= (strokeWidth + 8);
    const gapPx = nonZeroItems.length > 1 ? 6 : 0;

    let accumulatedAngle = 0;
    let pathsSvg = '';

    const enrichedData = data.map((item, idx) => {
      const color = item.color || this.COLOR_MAP[item.label.toLowerCase()] || this.COLORS[idx % this.COLORS.length];
      const pctNum = total > 0 ? (item.value / total) * 100 : 0;
      return {
        ...item,
        index: idx,
        color,
        pctText: `${pctNum.toFixed(1)}%`,
        pctRounded: `${Math.round(pctNum)}%`
      };
    });

    enrichedData.forEach((item) => {
      if (item.value === 0) return;
      const percentage = item.value / total;
      const arcLen = percentage * circumference;

      let dashLen;
      let startAngleDeg;
      let linecapAttr = '';

      if (nonZeroItems.length === 1) {
        dashLen = circumference;
        startAngleDeg = accumulatedAngle * 360;
      } else if (useRoundedCaps) {
        dashLen = Math.max(arcLen - strokeWidth - gapPx, 1);
        const capOffsetDeg = ((strokeWidth / 2 + gapPx / 2) / circumference) * 360;
        startAngleDeg = accumulatedAngle * 360 + capOffsetDeg;
        linecapAttr = 'stroke-linecap="round"';
      } else {
        dashLen = Math.max(arcLen - 3, 1.5);
        const gapOffsetDeg = (1.5 / circumference) * 360;
        startAngleDeg = accumulatedAngle * 360 + gapOffsetDeg;
      }

      accumulatedAngle += percentage;

      pathsSvg += `
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          fill="none"
          stroke="${item.color}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${dashLen} ${circumference}"
          transform="rotate(${startAngleDeg - 90} ${size / 2} ${size / 2})"
          ${linecapAttr}
          class="donut-segment"
          data-index="${item.index}"
          data-label="${this.escapeAttr(item.label)}"
          data-value="${item.value}"
          data-pct="${item.pctText}"
          data-color="${item.color}"
        >
          <title>${this.escapeAttr(item.label)}: ${item.value} (${item.pctText})</title>
        </circle>
      `;
    });

    const centerLabel = options.centerLabel || 'Total';
    const svgHtml = `
      <div class="donut-wrapper">
        <div class="donut-visual">
          <div class="chart-tooltip" aria-live="polite"></div>
          <svg width="188" height="188" viewBox="0 0 ${size} ${size}" class="donut-svg" role="img" aria-label="${this.escapeAttr(centerLabel)}">
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="var(--chart-track, #F1F5F9)" stroke-width="${strokeWidth}" class="donut-track" />
            ${pathsSvg}
            <text x="50%" y="46%" text-anchor="middle" class="donut-total-val">${total}</text>
            <text x="50%" y="61%" text-anchor="middle" class="donut-total-lbl">${this.escapeHtml(centerLabel)}</text>
            <text x="50%" y="73%" text-anchor="middle" class="donut-total-pct"></text>
          </svg>
        </div>
        <div class="chart-legend">
          ${enrichedData.map((item) => `
            <div class="legend-item" data-index="${item.index}" data-label="${this.escapeAttr(item.label)}" data-value="${item.value}" data-pct="${item.pctText}" data-color="${item.color}">
              <span class="legend-left">
                <span class="legend-pill-badge" style="background-color: ${item.color}"></span>
                <span class="legend-text" title="${this.escapeAttr(item.label)}">${this.escapeHtml(item.label)}</span>
              </span>
              <span class="legend-metrics">
                <span class="legend-val">${item.value}</span>
                <span class="legend-pct-pill">${item.pctRounded}</span>
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.innerHTML = svgHtml;

    // Interatividade de hover entre fatias SVG e itens da legenda
    const wrapper = container.querySelector('.donut-wrapper');
    const centerValEl = container.querySelector('.donut-total-val');
    const centerLblEl = container.querySelector('.donut-total-lbl');
    const centerPctEl = container.querySelector('.donut-total-pct');
    const tooltipEl = container.querySelector('.chart-tooltip');
    const segments = container.querySelectorAll('.donut-segment');
    const legendItems = container.querySelectorAll('.legend-item');

    const activateIndex = (idx) => {
      const target = enrichedData.find(d => String(d.index) === String(idx));
      if (!target) return;

      wrapper.classList.add('has-hover');
      segments.forEach(s => s.classList.toggle('is-active', s.dataset.index === String(idx)));
      legendItems.forEach(l => l.classList.toggle('is-active', l.dataset.index === String(idx)));

      const shortLabel = target.label.length > 13 ? target.label.slice(0, 12) + '…' : target.label;
      centerValEl.textContent = target.value;
      centerValEl.style.fill = target.color;
      centerLblEl.textContent = shortLabel;
      centerPctEl.textContent = target.pctText;
      centerPctEl.style.fill = target.color;

      tooltipEl.innerHTML = `
        <span class="chart-tooltip-dot" style="background-color: ${target.color}"></span>
        <span>${this.escapeHtml(target.label)}:</span>
        <strong>${target.value} (${target.pctText})</strong>
      `;
      tooltipEl.classList.add('visible');
    };

    const clearHover = () => {
      wrapper.classList.remove('has-hover');
      segments.forEach(s => s.classList.remove('is-active'));
      legendItems.forEach(l => l.classList.remove('is-active'));

      centerValEl.textContent = total;
      centerValEl.style.fill = '';
      centerLblEl.textContent = centerLabel;
      centerPctEl.textContent = '';
      centerPctEl.style.fill = '';
      tooltipEl.classList.remove('visible');
    };

    segments.forEach(seg => {
      seg.addEventListener('mouseenter', () => activateIndex(seg.dataset.index));
      seg.addEventListener('mouseleave', clearHover);
    });

    legendItems.forEach(itemEl => {
      itemEl.addEventListener('mouseenter', () => activateIndex(itemEl.dataset.index));
      itemEl.addEventListener('mouseleave', clearHover);
    });
  }

  /**
   * Gráfico de Barras Horizontal Moderno com suporte a subtítulo/status e cores semânticas
   */
  static renderBarChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!data || data.length === 0 || data.every(d => d.value === 0)) {
      container.innerHTML = '<div class="chart-empty">Nenhum dado disponível</div>';
      return;
    }

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const totalValue = data.reduce((acc, d) => acc + d.value, 0);
    const isCurrency = options.isCurrency || false;
    const unitSuffix = options.unitSuffix || '';
    const formatVal = (v) => {
      if (isCurrency) {
        return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      if (unitSuffix && typeof unitSuffix === 'object') {
        const suffix = v === 1 ? (unitSuffix.singular || '') : (unitSuffix.plural || unitSuffix.singular || '');
        return suffix ? `${v} ${suffix}` : String(v);
      }
      return unitSuffix ? `${v} ${unitSuffix}` : String(v);
    };

    const barsHtml = data.map((item, index) => {
      const pctWidth = Math.max((item.value / maxValue) * 100, item.value > 0 ? 4 : 0);
      const sharePct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(0) : 0;
      const color = item.color || this.COLOR_MAP[item.label.toLowerCase()] || this.COLORS[index % this.COLORS.length];
      const sublabelHtml = item.sublabel
        ? `<span class="bar-sublabel">${this.escapeHtml(item.sublabel)}</span>`
        : '';

      return `
        <div class="bar-row" title="${this.escapeAttr(item.label)}${item.sublabel ? ' — ' + this.escapeAttr(item.sublabel) : ''}: ${formatVal(item.value)} (${sharePct}%)">
          <div class="bar-info">
            <div class="bar-label-group">
              <span class="bar-color-dot" style="background-color: ${color};"></span>
              <span class="bar-label">${this.escapeHtml(item.label)}</span>
              ${sublabelHtml}
            </div>
            <div class="bar-val-group">
              <span class="bar-val">${formatVal(item.value)}</span>
              <span class="bar-pct">(${sharePct}%)</span>
            </div>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${pctWidth}%; background-color: ${color};"></div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="bar-chart-wrapper">${barsHtml}</div>`;
  }

  static escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  static escapeAttr(str) {
    return this.escapeHtml(str);
  }
}
