# Network Asset Manager 🌐

O **Network Asset Manager** é um sistema completo e 100% client-side para gestão estratégica de ativos e infraestrutura de rede, controle de ocorrências e análise de custos de manutenções preventivas, preditivas e corretivas.

---

## 🚀 Funcionalidades Principais

- **Cadastro e Gestão de Ativos de Rede**: Registro detalhado com Nome/Hostname, Tipo (Switch, Roteador, Firewall, Servidor, Access Point, Outro), Fabricante, Modelo, Número de Série, Endereço IP, Endereço MAC, VLAN, Gateway, Localização e Status.
- **Dashboard com 10 Indicadores Chave (KPIs)**: Total de ativos, operacionais, em manutenção, inativos, ocorrências, custos por modalidade de manutenção (Preventiva, Preditiva, Corretiva), custo total acumulado e horas de indisponibilidade.
- **Identificação Automática do Maior Gasto**: Banner de destaque que calcula dinamicamente qual modalidade de manutenção representa o maior gasto financeiro e sua porcentagem em relação ao investimento total.
- **Gráficos SVG Dinâmicos e Nativos (Sem Libs Externas)**: Ativos por Tipo, Equipamentos por Status, Gastos por Tipo de Manutenção e Ocorrências por Equipamento.
- **Alertas Automatizados de Próxima Manutenção Preventiva**: Sinalização visual por cores (Em dia, Próxima e Atrasada) calculada dinamicamente.
- **Filtros e Pesquisa Instantânea**: Busca por Hostname, IP, MAC ou Número de Série e filtros combinados por Tipo, Fabricante, Status e Situação da Manutenção.
- **Persistência em localStorage**: Armazenamento 100% local com dados demonstrativos iniciais.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3 Vanilla**: Interface com layout responsivo em tema claro corporativo ITAM (com fonte **IBM Plex Sans** e **IBM Plex Mono**).
- **JavaScript Pure (ES6+)**: Lógica da aplicação, cálculos analíticos, manipuladores de DOM e persistência no `localStorage`.
- **SVG (Scalable Vector Graphics)**: Renderização de gráficos nativos para máxima performance e zero dependências externas.
- **Node.js (http-server)**: Utilizado estritamente como servidor estático de desenvolvimento local em localhost.

---

## 📁 Estrutura do Projeto

```
gerenciadornetwork/
├── package.json              # Configuração de scripts e dependência de dev (http-server)
├── README.md                 # Documentação e guia do sistema
└── public/                   # Pasta raiz servida localmente e no Firebase Hosting
    ├── index.html            # Interface corporativa com sidebar
    ├── css/
    │   └── styles.css        # Folha de estilos corporativa clara
    └── js/
        ├── storage.js        # Módulo de persistência localStorage e CRUD
        ├── charts.js         # Gerador de gráficos dinâmicos em SVG
        └── app.js            # Lógica principal, filtros, KPIs e eventos
```

---

## 💻 Como Rodar o Projeto Localmente no Terminal

### Opção 1: Servidor Local Node.js (`npm run dev` / `npm start`)

1. **Instalar as dependências de desenvolvimento**:
   ```bash
   npm install
   ```
2. **Iniciar o servidor de desenvolvimento estático**:
   ```bash
   npm run dev
   ```
   *(ou `npm start`)*

3. **Acessar no navegador**:
   Abra o endereço: **`http://localhost:3000`**

4. **Encerrar o servidor**:
   No terminal onde o servidor está rodando, pressione as teclas **`Ctrl + C`** (e confirme digitando `S` ou `Y` se solicitado).

### Opção 2: Diretamente no Navegador
1. Navegue até a pasta `public/`.
2. Dê um duplo clique no arquivo `index.html` para abrir diretamente no navegador.

---

## ☁️ Deploy no Firebase Hosting

O projeto é 100% estático client-side. A pasta `public/` é o que será publicado no Firebase Hosting:

1. **Instalar o Firebase CLI** (caso não possua instalado):
   ```bash
   npm install -g firebase-tools
   ```
2. **Realizar Login no Firebase**:
   ```bash
   firebase login
   ```
3. **Inicializar o Firebase no projeto**:
   ```bash
   firebase init hosting
   ```
   - Pasta pública: digite **`public`**
   - Single Page App (SPA): responda **`N`**
   - Sobrescrever `public/index.html`: responda **`N`**

4. **Publicar a aplicação**:
   ```bash
   firebase deploy
   ```

---

## 🎨 Paleta de Cores (Tema Claro Corporativo ITAM)

| Elemento | Finalidade | Hex Code |
| :--- | :--- | :--- |
| **Fundo Geral** | Background claro da aplicação | `#F4F8FC` |
| **Sidebar** | Painel lateral de navegação | `#EAF2F9` |
| **Cards / Superfícies** | Fundo dos cards e componentes | `#FFFFFF` |
| **Bordas** | Linhas divisórias discretas | `#D6E2ED` |
| **Azul Principal** | Botões primários e ações de relevância | `#3B82C4` |
| **Azul Claro** | Efeitos de hover e bordas de destaque | `#60A5D8` |
| **Azul de Seleção** | Item/linha atualmente selecionada | `#2563A8` |
| **Azul Muito Claro** | Destaque de fundo suave | `#E6F2FB` |
| **Texto Principal** | Alta legibilidade para títulos e dados | `#1E293B` |
| **Texto Secundário** | Rótulos, descrições e legendas | `#64748B` |
| **Status Ativo / Em dia** | Badge verde de operabilidade | `#16A34A` |
| **Status Atenção / Próxima** | Badge amarelo/laranja de alerta | `#D97706` |
| **Status Atrasada / Inativo** | Badge vermelho de emergência | `#DC2626` |

