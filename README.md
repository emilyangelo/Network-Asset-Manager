# 🌐 Network Asset Manager — Portal ITAM & Gestão de Redes

<p align="left">
  <img src="[https://img.shields.io/badge/Deploy-Firebase_Hosting-FFCA28?style=for-the-badge&logo=firebase&logoColor=black](https://img.shields.io/badge/Deploy-Firebase_Hosting-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)" />
  <img src="[https://img.shields.io/badge/Domain-ITAM_%26_Infraestrutura-00599C?style=for-the-badge](https://img.shields.io/badge/Domain-ITAM_%26_Infraestrutura-00599C?style=for-the-badge)" />
  <img src="[https://img.shields.io/badge/JavaScript-Vanilla_ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black](https://img.shields.io/badge/JavaScript-Vanilla_ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)" />
  <img src="[https://img.shields.io/badge/Graphics-Native_SVG-FF6C37?style=for-the-badge](https://img.shields.io/badge/Graphics-Native_SVG-FF6C37?style=for-the-badge)" />
</p>

🔗 **Acesse a aplicação rodando ao vivo:** [gerenciadornetworks.web.app](https://gerenciadornetworks.web.app/)

---

## 📌 Sobre o Projeto

O **Network Asset Manager** é um sistema corporativo completo *client-side* desenvolvido para a **Gestão Estratégica de Ativos de TI (ITAM)** e controle operacional de infraestrutura de rede. 

A aplicação permite mapear equipamentos, monitorar ocorrências e analisar custos operacionais de manutenções (**Preventivas, Preditivas e Corretivas**), fornecendo relatórios em tempo real sem dependência de bibliotecas externas.

---

## 🚀 Funcionalidades Principais

- **📦 Cadastro & Mapeamento de Ativos:** Registro detalhado de Hostname, Tipo (Switch, Roteador, Firewall, Servidor, AP), Fabricante, Modelo, Serial, IP, MAC, VLAN, Gateway e Localização.
- **📊 Dashboard Analítico (10 KPIs Nativos):** Monitoramento de total de ativos, status operacional, custos agregados por modalidade de manutenção e cálculo automático de horas de indisponibilidade.
- **💰 Análise Financeira Inteligente:** Banner dinâmico que identifica automaticamente a modalidade de manutenção de maior impacto financeiro no orçamento.
- **📈 Gráficos Dinâmicos em SVG Próprio:** Renderização nativa de gráficos de ativos por tipo, status, custos e incidentes sem o uso de bibliotecas terceirizadas (alta performance).
- **⏱️ Alertas Automatizados de Manutenção:** Sinalização visual (*Em dia*, *Próxima* e *Atrasada*) calculada dinamicamente com base em regras de tempo.
- **🔍 Pesquisa Instantânea & Filtros Combinados:** Busca por Hostname, IP ou MAC e filtragem por fabricante, status e prioridade.
- **💾 Persistência de Dados Local:** Armazenamento via `localStorage` com carregamento de dados demonstrativos (*mock inicial*).

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3 Vanilla:** Design corporativo responsivo inspirado em padrões ITAM (utilizando as tipografias *IBM Plex Sans* e *IBM Plex Mono*).
- **JavaScript Pure (ES6+):** Lógica analítica, calculadora de KPIs, manipulação de DOM e persistência local.
- **Scalable Vector Graphics (SVG):** Construção nativa de componentes visuais e gráficos vetoriais.
- **Firebase Hosting & Node.js (http-server):** Ambiente de desenvolvimento e publicação em nuvem.

---

## 📁 Estrutura da Aplicação

- **gerenciadornetwork/**
  - **package.json** (Configurações do projeto e scripts de dev)
  - **README.md** (Documentação oficial)
  - **public/** (Build final publicado no Firebase)
    - **index.html** (Estrutura e layout da dashboard)
    - **css/styles.css** (Estilização corporativa)
    - **js/storage.js** (Módulo CRUD e controle do localStorage)
    - **js/charts.js** (Motor de geração de gráficos em SVG)
    - **js/app.js** (Lógica central, eventos e cálculo de KPIs)

---

## 🎨 Paleta de Cores (Tema Claro ITAM)

| Elemento | Finalidade | Hex Code |
| :--- | :--- | :--- |
| **Fundo Geral** | Background leve da aplicação | `#F4F8FC` |
| **Sidebar** | Painel lateral de navegação | `#EAF2F9` |
| **Cards & Superfícies** | Fundo de componentes e tabelas | `#FFFFFF` |
| **Azul Principal** | Botões primários e ações de relevância | `#3B82C4` |
| **Texto Principal** | Alta legibilidade para dados | `#1E293B` |
| **Status Operacional** | Badge verde de operabilidade | `#16A34A` |
| **Status Atenção** | Badge amarelo de alerta/manutenção | `#D97706` |
| **Status Emergência** | Badge vermelho de inatividade/atraso | `#DC2626` |

---

## 💻 Como Rodar Localmente

1. **Clone o repositório:**
   `git clone https://github.com/emilyangelo/Network-Asset-Manager.git`

2. **Acesse a pasta do projeto:**
   `cd Network-Asset-Manager`

3. **Instale as dependências e rode o servidor local:**
   `npm install`  
   `npm run dev`

4. **Abra no navegador:**
   `http://localhost:3000`

---

## 👤 Autora

**Emily Almeida Angelo**  
*Estudante de ADS (UNG) | Foco em Infraestrutura, Redes, Suporte & Cloud*  

- 🌐 **Aplicação Live:** [gerenciadornetworks.web.app](https://gerenciadornetworks.web.app/)
- 💻 **GitHub:** [@emilyangelo](https://github.com/emilyangelo)
- 💼 **LinkedIn:** [emilyangeloo](https://www.linkedin.com/in/emilyangeloo/)
