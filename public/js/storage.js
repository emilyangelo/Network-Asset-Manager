/**
 * StorageManager - Gerenciamento de Persistência no localStorage
 * Network Asset Manager
 */

const STORAGE_KEYS = {
  ASSETS: 'netmanager_assets_v1',
  MAINTENANCES: 'netmanager_maintenances_v1'
};

// Dados Iniciais de Demonstração (Mock)
const DEFAULT_ASSETS = [
  {
    id: 'ast-001',
    nome: 'SW-CORE-01',
    tipo: 'Switch',
    fabricante: 'Cisco',
    modelo: 'Catalyst 9300 48P',
    numeroSerie: 'SN-CS9300-9821',
    ip: '192.168.1.2',
    mac: '00:1B:44:11:3A:B7',
    vlan: '10, 20, 99',
    gateway: '192.168.1.1',
    localizacao: 'Data Center - Rack A01',
    status: 'ativo',
    dataUltimaPreventiva: '2026-06-01',
    periodoRevisaoDias: 90
  },
  {
    id: 'ast-002',
    nome: 'RT-EDGE-01',
    tipo: 'Roteador',
    fabricante: 'MikroTik',
    modelo: 'CCR2004-16G-2S+',
    numeroSerie: 'SN-MT2004-4412',
    ip: '192.168.1.1',
    mac: 'E4:8D:8C:01:22:90',
    vlan: '1, 10, 100',
    gateway: '200.201.202.1',
    localizacao: 'Data Center - Rack A01',
    status: 'ativo',
    dataUltimaPreventiva: '2026-07-15',
    periodoRevisaoDias: 60
  },
  {
    id: 'ast-003',
    nome: 'FW-CORPORATE',
    tipo: 'Firewall',
    fabricante: 'Fortinet',
    modelo: 'FortiGate 60F',
    numeroSerie: 'SN-FG60F-8831',
    ip: '192.168.1.254',
    mac: '70:4C:A5:88:99:11',
    vlan: '1, 5, 10, 20, 30',
    gateway: '200.201.202.1',
    localizacao: 'Data Center - Rack A02',
    status: 'manutencao',
    dataUltimaPreventiva: '2026-04-10',
    periodoRevisaoDias: 90
  },
  {
    id: 'ast-004',
    nome: 'AP-RECEPCAO',
    tipo: 'Access Point',
    fabricante: 'Ubiquiti',
    modelo: 'UniFi 6 Pro',
    numeroSerie: 'SN-UB6P-1092',
    ip: '192.168.20.15',
    mac: '74:83:C2:55:12:DF',
    vlan: '20',
    gateway: '192.168.20.1',
    localizacao: 'Recepção Prédio Central',
    status: 'ativo',
    dataUltimaPreventiva: '2026-08-01',
    periodoRevisaoDias: 120
  },
  {
    id: 'ast-005',
    nome: 'SRV-MONITOR-01',
    tipo: 'Servidor',
    fabricante: 'Dell',
    modelo: 'PowerEdge R750',
    numeroSerie: 'SN-DELL-750-3341',
    ip: '192.168.10.50',
    mac: 'F4:03:43:88:AA:C1',
    vlan: '10',
    gateway: '192.168.10.1',
    localizacao: 'Data Center - Rack B03',
    status: 'inativo',
    dataUltimaPreventiva: '2026-02-10',
    periodoRevisaoDias: 90
  }
];

const DEFAULT_MAINTENANCES = [
  {
    id: 'mnt-001',
    ativoId: 'ast-001',
    tipo: 'preventiva',
    data: '2026-06-01',
    descricao: 'Atualização de Firmware IOS-XE e limpeza técnica de portas SFP+.',
    custo: 850.00,
    tempoIndisponibilidadeHoras: 1.5
  },
  {
    id: 'mnt-002',
    ativoId: 'ast-003',
    tipo: 'corretiva',
    data: '2026-08-05',
    descricao: 'Substituição de fonte redundante queimada por surto de energia.',
    custo: 2400.00,
    tempoIndisponibilidadeHoras: 4.0
  },
  {
    id: 'mnt-003',
    ativoId: 'ast-002',
    tipo: 'preditiva',
    data: '2026-07-15',
    descricao: 'Análise de telemetria de temperatura dos transmissores de fibra óptica.',
    custo: 450.00,
    tempoIndisponibilidadeHoras: 0.0
  },
  {
    id: 'mnt-004',
    ativoId: 'ast-005',
    tipo: 'corretiva',
    data: '2026-07-28',
    descricao: 'Troca de módulo de memória RAM com erro de barramento ECC.',
    custo: 1800.00,
    tempoIndisponibilidadeHoras: 8.5
  },
  {
    id: 'mnt-005',
    ativoId: 'ast-004',
    tipo: 'preventiva',
    data: '2026-08-01',
    descricao: 'Revisão de cabeamento estruturado Cat6A e teste de PoE+.',
    custo: 320.00,
    tempoIndisponibilidadeHoras: 0.5
  }
];

class StorageManager {
  static getAssets() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSETS);
      if (!data) {
        this.saveAssets(DEFAULT_ASSETS);
        return DEFAULT_ASSETS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Erro ao ler ativos do localStorage', e);
      return DEFAULT_ASSETS;
    }
  }

  static saveAssets(assets) {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    } catch (e) {
      console.error('Erro ao salvar ativos no localStorage', e);
    }
  }

  static addAsset(asset) {
    const assets = this.getAssets();
    if (!asset.id) {
      asset.id = 'ast-' + Date.now();
    }
    assets.push(asset);
    this.saveAssets(assets);
    return asset;
  }

  static updateAsset(updatedAsset) {
    let assets = this.getAssets();
    assets = assets.map(a => a.id === updatedAsset.id ? updatedAsset : a);
    this.saveAssets(assets);
    return updatedAsset;
  }

  static deleteAsset(id) {
    let assets = this.getAssets();
    assets = assets.filter(a => a.id !== id);
    this.saveAssets(assets);

    // Remove manutenções atreladas
    let maintenances = this.getMaintenances();
    maintenances = maintenances.filter(m => m.ativoId !== id);
    this.saveMaintenances(maintenances);
  }

  static getMaintenances() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MAINTENANCES);
      if (!data) {
        this.saveMaintenances(DEFAULT_MAINTENANCES);
        return DEFAULT_MAINTENANCES;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Erro ao ler manutenções do localStorage', e);
      return DEFAULT_MAINTENANCES;
    }
  }

  static saveMaintenances(maintenances) {
    try {
      localStorage.setItem(STORAGE_KEYS.MAINTENANCES, JSON.stringify(maintenances));
    } catch (e) {
      console.error('Erro ao salvar manutenções no localStorage', e);
    }
  }

  static addMaintenance(maintenance) {
    const maintenances = this.getMaintenances();
    if (!maintenance.id) {
      maintenance.id = 'mnt-' + Date.now();
    }
    maintenances.push(maintenance);
    this.saveMaintenances(maintenances);
    return maintenance;
  }

  static deleteMaintenance(id) {
    let maintenances = this.getMaintenances();
    maintenances = maintenances.filter(m => m.id !== id);
    this.saveMaintenances(maintenances);
  }

  static resetToDefaults() {
    this.saveAssets(DEFAULT_ASSETS);
    this.saveMaintenances(DEFAULT_MAINTENANCES);
  }
}
