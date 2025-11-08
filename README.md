# 🐄 Rico Ouro App

Aplicativo web progressivo (PWA) para gestão completa de gado bovino, desenvolvido com foco em funcionalidade offline e experiência de usuário moderna.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![PWA](https://img.shields.io/badge/PWA-enabled-5A0FC8?style=for-the-badge&logo=pwa)

## 📋 Sobre o Projeto

O **Rico Ouro App** é uma solução completa para gestão de rebanhos bovinos, permitindo que produtores rurais gerenciem informações de seus animais de forma eficiente, mesmo em áreas com conexão limitada. O aplicativo funciona totalmente offline, utilizando armazenamento local para garantir que os dados estejam sempre acessíveis.

## ✨ Funcionalidades

### 🐮 Gestão de Animais

- **Cadastro completo**: Registro de informações básicas, genéticas e de pedigree
- **Consulta rápida**: Busca por RGN, série RGD ou nome
- **Edição de dados**: Atualização de informações dos animais
- **Visualização detalhada**: Acesso a todas as informações do animal em uma interface organizada

### 📊 Monitoramento e Análise

- **Registro de pesagens**: Histórico completo de pesagens com datas
- **Circunferência escrotal (CE)**: Acompanhamento de medidas ao longo do tempo
- **Gráficos de evolução**: Visualização gráfica do crescimento e desenvolvimento
- **Cálculo de ganho diário**: Análise automática de ganho de peso

### 💉 Controle de Vacinas

- **Registro de vacinas**: Controle completo do calendário vacinal
- **Histórico de aplicações**: Acompanhamento de todas as vacinas aplicadas
- **Gestão de vacinas**: Adição e remoção de tipos de vacinas

### 📄 Relatórios e Exportação

- **Relatórios em PDF**: Geração de relatórios personalizados com campos selecionáveis
- **Exportação para planilhas**: Exportação de dados em formato Excel/CSV
- **Filtros personalizados**: Seleção de campos específicos para relatórios

### 📥 Importação de Dados

- **Importação em lote**: Carregamento de múltiplos animais via planilhas CSV/Excel
- **Validação de dados**: Verificação automática de duplicatas e dados inválidos
- **Atualização inteligente**: Mesclagem automática de dados existentes

### 🌐 Funcionalidades Offline

- **PWA completo**: Instalável como aplicativo nativo
- **Armazenamento local**: Todos os dados salvos localmente usando IndexedDB
- **Sincronização**: Dados disponíveis mesmo sem conexão à internet
- **Service Worker**: Cache inteligente para melhor performance

## 🛠️ Tecnologias Utilizadas

### Frontend

- **Next.js 15.5** - Framework React com App Router
- **React 19** - Biblioteca para construção de interfaces
- **TypeScript** - Tipagem estática para maior segurança
- **Tailwind CSS 4** - Framework CSS utility-first
- **Framer Motion** - Animações fluidas e modernas

### Armazenamento e Dados

- **Dexie.js** - Wrapper para IndexedDB
- **IndexedDB** - Banco de dados local do navegador

### Bibliotecas de UI

- **Radix UI** - Componentes acessíveis e customizáveis
- **Lucide React** - Ícones modernos
- **Recharts** - Gráficos e visualizações

### Utilitários

- **jsPDF + jsPDF-AutoTable** - Geração de PDFs
- **XLSX** - Manipulação de planilhas Excel
- **UUID** - Geração de identificadores únicos
- **next-pwa** - Configuração de PWA

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ instalado
- npm, yarn, pnpm ou bun

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/rico-ouro-app.git
cd rico-ouro-app
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. Execute o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

4. Acesse o aplicativo em [http://localhost:3000](http://localhost:3000)

### Build para Produção

```bash
npm run build
npm start
```

## 📱 Instalação como PWA

O aplicativo pode ser instalado como Progressive Web App:

1. Acesse o aplicativo no navegador
2. No Chrome/Edge: Clique no ícone de instalação na barra de endereços
3. No Safari (iOS): Compartilhar > Adicionar à Tela de Início
4. O aplicativo será instalado e funcionará como um app nativo

## 🏗️ Estrutura do Projeto

```
rico-ouro-app/
├── src/
│   ├── app/                 # Páginas e rotas (App Router)
│   │   ├── bois/           # Gestão de animais individuais
│   │   ├── consulta/       # Busca de animais
│   │   ├── geral/          # Dados gerais do rebanho
│   │   ├── nascimentos/    # Registro de nascimentos
│   │   ├── vacinas/        # Gestão de vacinas
│   │   ├── relatorios/     # Geração de relatórios
│   │   └── importar/       # Importação de dados
│   ├── components/         # Componentes reutilizáveis
│   │   ├── layout/        # Header, Footer, Navigation
│   │   ├── modals/        # Modais de edição e ações
│   │   ├── cards/         # Cards de exibição
│   │   └── ui/            # Componentes de UI base
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Configurações e utilitários
│   ├── types/             # Definições TypeScript
│   ├── utils/             # Funções utilitárias
│   └── constants/         # Constantes e configurações
├── public/                # Arquivos estáticos e PWA
└── package.json
```

## 🎨 Características de Design

- **Interface moderna**: Design limpo e intuitivo
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Animações suaves**: Transições fluidas com Framer Motion
- **Acessibilidade**: Componentes acessíveis com Radix UI
- **Tema consistente**: Paleta de cores profissional

## 📊 Funcionalidades Técnicas

### Armazenamento de Dados

- Banco de dados local usando IndexedDB via Dexie.js
- Versionamento de schema para migrações
- Índices otimizados para buscas rápidas
- Validação de dados antes do armazenamento

### Performance

- Service Worker para cache de assets
- Lazy loading de componentes
- Otimização de imagens com Next.js Image
- Code splitting automático

### Experiência do Usuário

- Feedback visual em todas as ações
- Loading states e skeletons
- Tratamento de erros amigável
- Validação de formulários em tempo real

## 🔒 Segurança e Privacidade

- Todos os dados são armazenados localmente no dispositivo
- Nenhuma informação é enviada para servidores externos
- Controle total dos dados pelo usuário
- Possibilidade de limpeza completa dos dados

## 🚧 Melhorias Futuras

- [ ] Sincronização com servidor (opcional)
- [ ] Backup e restauração de dados
- [ ] Modo escuro
- [ ] Notificações de vacinas pendentes
- [ ] Análise estatística avançada
- [ ] Exportação de gráficos
- [ ] Suporte a múltiplos rebanhos

## 📝 Licença

Este projeto é privado e desenvolvido para uso específico.

## 👨‍💻 Desenvolvido por

Desenvolvido com ❤️ usando Next.js e React

---

**Nota**: Este é um projeto de portfólio demonstrando habilidades em desenvolvimento web moderno, PWA, gerenciamento de estado local e criação de interfaces de usuário responsivas.
