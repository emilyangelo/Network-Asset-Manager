/**
 * ChartRenderer - Geração de Gráficos SVG Nativo
 * Network Asset Manager
 * 
 * Sem dependências externas. Paleta clara corporativa ITAM (Sem tom roxo!).
 */

class ChartRenderer {
  // Paleta de cores oficial para os segmentos de gráficos
  static COLORS = [
    '#3B82C4', // Azul principal
    '#60A5D8', // Azul claro
    '#2563A8', // Azul de seleção
    '#16A34A', // Verde sucesso
    '#D97706', // Laranja atenção
    '#DC2626'  // Vermelho erro
  ];

  static COLOR_MAP = {
    // Status
    'ativo': '#16A34A',
    'manutencao': '#D97706',
    'inativo': '#DC2626',
    // Tipos Manutenção
    'preventiva': '#16A34A',
    'preditiva': '#3B82C4',
    'corretiva': '#DC2626'
  };

  /**
   * Gráfico de Rosca (Donut) SVG
   */
  static renderDonutChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!data || data.length === 0 || data.every(d => d.value === 0)) {
      container.innerHTML = '<div class="chart-empty">Nenhum dado disponível</div>';
      return;
    }

    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    const size = 180;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    let pathsSvg = '';
    data.forEach((item, index) => {
      if (item.value === 0) return;
      const percentage = item.value / total;
      const strokeDashoffset = circumference * (1 - percentage);
      const rotation = accumulatedAngle * 360;
      accumulatedAngle += percentage;

      const color = item.color || this.COLOR_MAP[item.label.toLowerCase()] || this.COLORS[index % this.COLORS.length];

      pathsSvg += `
        <circle 
          cx="${size / 2}" 
          cy="${size / 2}" 
          r="${radius}" 
          fill="none" 
          stroke="${color}" 
          stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${strokeDashoffset}"
          transform="rotate(${rotation - 90} ${size / 2} ${size / 2})"
          class="donut-segment"
        >
          <title>${item.label}: ${item.value} (${(percentage * 100).toFixed(1)}%)</title>
        </circle>
      `;
    });

    const centerLabel = options.centerLabel || 'Total';
    const svgHtml = `
      <div class="donut-wrapper">
        <svg viewBox="0 0 ${size} ${size}" class="donut-svg">
          <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="#EAF2F9" stroke-width="${strokeWidth}" />
          ${pathsSvg}
          <text x="50%" y="46%" text-anchor="middle" class="donut-total-val">${total}</text>
          <text x="50%" y="62%" text-anchor="middle" class="donut-total-lbl">${centerLabel}</text>
        </svg>
        <div class="chart-legend">
          ${data.map((item, idx) => {
            const color = item.color || this.COLOR_MAP[item.label.toLowerCase()] || this.COLORS[idx % this.COLORS.length];
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
            return `
              <div class="legend-item">
                <span class="legend-dot" style="background-color: ${color}"></span>
                <span class="legend-text">${item.label}</span>
                <span class="legend-val">${item.value} (${pct}%)</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    container.innerHTML = svgHtml;
  }

  /**
   * Gráfico de Barras SVG (Vertical ou Horizontal)
   */
  static renderBarChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!data || data.length === 0 || data.every(d => d.value === 0)) {
      container.innerHTML = '<div class="chart-empty">Nenhum dado disponível</div>';
      return;
    }

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const isCurrency = options.isCurrency || false;
    const formatVal = (v) => isCurrency ? `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : v;

    const barsHtml = data.map((item, index) => {
      const pct = (item.value / maxValue) * 100;
      const color = item.color || this.COLOR_MAP[item.label.toLowerCase()] || this.COLORS[index % this.COLORS.length];
      
      return `
        <div class="bar-row">
          <div class="bar-info">
            <span class="bar-label" title="${item.label}">${item.label}</span>
            <span class="bar-val">${formatVal(item.value)}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${pct}%; background-color: ${color};">
              <title>${item.label}: ${formatVal(item.value)}</title>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="bar-chart-wrapper">${barsHtml}</div>`;
  }
}

