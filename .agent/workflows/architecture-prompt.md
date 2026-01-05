---
description: Prompt de arquitetura estruturado e reutilizável para uso com IA no Nelore Índi Ouro App
---

# 🏗️ NELORE ÍNDI OURO APP - Prompt de Arquitetura para IA

## 📋 CONTEXTO DO PROJETO

Você está trabalhando no **Nelore Índi Ouro App** (rico-ouro-app), um **Progressive Web App (PWA)** para gestão completa de gado bovino Nelore. O aplicativo é projetado para funcionar **offline-first** em ambientes rurais com conectividade limitada.

---

## 🎯 OBJETIVO DO APLICATIVO

Sistema de gestão de rebanhos bovinos que permite:

- Cadastro e consulta de animais (touros e matrizes)
- Controle de vacinas e métricas (peso, CE)
- Gestão de eventos reprodutivos
- Controle de doses de sêmen
- Geração de relatórios em PDF/Excel
- Sincronização com banco de dados remoto quando online

---

## 🛠️ STACK TECNOLÓGICA

### Frontend

| Tecnologia        | Versão | Uso                            |
| ----------------- | ------ | ------------------------------ |
| **Next.js**       | 16.x   | Framework React com App Router |
| **React**         | 19.x   | Biblioteca de UI               |
| **TypeScript**    | 5.x    | Tipagem estática               |
| **Tailwind CSS**  | 4.x    | Estilização utility-first      |
| **Framer Motion** | 12.x   | Animações                      |
| **Radix UI**      | Latest | Componentes acessíveis         |
| **Lucide React**  | Latest | Ícones                         |
| **Recharts**      | 2.x    | Gráficos                       |

### Dados e Storage

| Tecnologia         | Uso                                                |
| ------------------ | -------------------------------------------------- |
| **RxDB**           | Banco de dados local reativo (IndexedDB via Dexie) |
| **Supabase**       | Backend remoto (PostgreSQL + Auth + Storage)       |
| **Service Worker** | Cache e funcionalidade offline                     |

### Utilitários

| Biblioteca            | Uso                   |
| --------------------- | --------------------- |
| **jsPDF + AutoTable** | Geração de PDFs       |
| **XLSX**              | Exportação Excel      |
| **UUID**              | Geração de IDs únicos |

---

## 📁 ESTRUTURA DE PASTAS

```
src/
├── app/                          # Next.js App Router
│   ├── (protected)/              # Rotas protegidas por autenticação
│   │   ├── animals/              # Gestão de animais individuais
│   │   ├── bois/                 # Detalhes de touros
│   │   ├── cadastro/             # Cadastro de animais
│   │   ├── consulta/             # Busca de animais
│   │   ├── geral/                # Dashboard e dados gerais
│   │   ├── gerenciar/            # Gestão de fazendas, vacinas, etc.
│   │   ├── importar/             # Importação CSV/Excel
│   │   ├── matrizes/             # Gestão de matrizes
│   │   ├── nascimentos/          # Registro de nascimentos
│   │   ├── pesagem-ce/           # Pesagens e CE
│   │   ├── reproducao/           # Eventos reprodutivos
│   │   └── vacinas/              # Controle vacinal
│   ├── login/                    # Página de login
│   ├── globals.css               # Estilos globais
│   └── layout.tsx                # Layout raiz
│
├── components/                   # Componentes reutilizáveis
│   ├── auth/                     # Componentes de autenticação
│   ├── buttons/                  # Botões customizados
│   ├── cards/                    # Cards de exibição
│   ├── charts/                   # Componentes de gráficos
│   ├── details-animals/          # Layout de detalhes
│   ├── doses/                    # Gestão de doses de sêmen
│   ├── farms/                    # Componentes de fazendas
│   ├── layout/                   # Header, Footer, Nav
│   ├── lists/                    # Componentes de listagem
│   ├── modals/                   # Modais (CRUD, confirmação)
│   ├── search/                   # Componentes de busca
│   ├── skeletons/                # Loading states
│   ├── sync/                     # Status de sincronização
│   ├── ui/                       # Componentes base (Radix)
│   └── vaccines/                 # Componentes de vacinas
│
├── constants/                    # Constantes do app
│
├── db/                           # Camada de dados RxDB
│   ├── client.ts                 # Inicialização do banco
│   ├── collections.ts            # Tipos de coleções
│   ├── replication.ts            # Setup de replicação (orquestrador)
│   ├── replication/              # 🆕 NOVO Sistema de replicação padronizado
│   │   ├── base/                 # Template base
│   │   │   ├── createReplication.ts  # Factory de replicação
│   │   │   ├── conflictResolver.ts   # Estratégias de conflito
│   │   │   ├── types.ts              # Tipos TypeScript
│   │   │   └── index.ts              # Re-exports
│   │   ├── animal.replication.ts     # ✅ Migrado
│   │   ├── semenDose.replication.ts  # ✅ Migrado
│   │   ├── MIGRATION_GUIDE.md        # Guia de migração
│   │   └── index.ts              # Índice geral
│   ├── replications/             # ⚠️ LEGADO - Em migração
│   │   ├── animal.replication.ts
│   │   ├── vaccine.replication.ts
│   │   └── ...
│   └── schemas/                  # Schemas RxDB
│       ├── animal.schema.ts
│       ├── vaccine.schema.ts
│       └── ...
│
├── hooks/                        # Custom hooks
│   ├── auth/                     # Hooks de autenticação
│   ├── core/                     # Hooks utilitários
│   ├── db/                       # Hooks de dados por entidade
│   │   ├── animals/              # CRUD de animais
│   │   ├── vaccines/             # CRUD de vacinas
│   │   ├── farms/                # CRUD de fazendas
│   │   ├── doses/                # CRUD de doses
│   │   └── ...
│   ├── matrizes/                 # Hooks específicos de matrizes
│   ├── sync/                     # Hooks de sincronização
│   └── utils/                    # Hooks utilitários
│
├── lib/                          # Configurações e libs
│   ├── auth/                     # Configuração de auth
│   ├── supabase/                 # Cliente Supabase
│   │   ├── api.ts                # Funções de API
│   │   ├── auth-helper.ts        # Helpers de auth
│   │   ├── client.ts             # Cliente browser
│   │   ├── storage.ts            # Upload de arquivos
│   │   └── ...
│   └── rsc/                      # React Server Components
│
├── providers/                    # Context Providers
│   ├── RxDBProvider.tsx          # Provider do banco local
│   ├── ReplicationProvider.tsx   # Provider de sync
│   └── LocalFirstProvider.tsx    # Provider offline-first
│
├── sw/                           # Service Worker
│   └── service-worker.ts         # Lógica do SW
│
├── types/                        # Definições TypeScript
│   ├── animal.type.ts            # Tipo Animal
│   ├── vaccine.type.ts           # Tipo Vaccine
│   ├── farm.type.ts              # Tipo Farm
│   ├── semen_dose.type.ts        # Tipo SemenDose
│   ├── reproduction_event.type.ts # Tipo ReproductionEvent
│   └── ...
│
└── utils/                        # Funções utilitárias
    ├── extractData.ts            # Extração de dados
    └── ...
```

---

## 🗄️ MODELO DE DADOS

### Coleções RxDB (Banco Local)

| Coleção                 | Tabela Supabase         | Descrição                           |
| ----------------------- | ----------------------- | ----------------------------------- |
| `animals`               | `animals`               | Dados dos animais (touros/matrizes) |
| `vaccines`              | `vaccines`              | Tipos de vacinas disponíveis        |
| `farms`                 | `farms`                 | Fazendas cadastradas                |
| `animal_vaccines`       | `animal_vaccines`       | Vacinas aplicadas por animal        |
| `animal_metrics_weight` | `animal_metrics_weight` | Histórico de pesagens               |
| `animal_metrics_ce`     | `animal_metrics_ce`     | Histórico de CE                     |
| `reproduction_events`   | `reproduction_events`   | Eventos reprodutivos                |
| `animal_statuses`       | `animal_statuses`       | Status dos animais                  |
| `semen_doses`           | `semen_doses`           | Doses de sêmen em estoque           |

### Tipos Principais

```typescript
// Animal (Touro ou Matriz)
interface Animal {
  rgn: string; // Primary Key - RGN único
  name?: string;
  sex?: "M" | "F";
  born_date?: string;
  serie_rgd: string;
  status: IStatus;
  farm_id?: string;
  classification?: string;
  type?: "Doadora" | "Reprodutora" | "Receptora FIV";
  father_name?: string;
  mother_rgn?: string;
  partnership?: string;
  updated_at?: string;
  _deleted?: boolean;
}

// Status do Animal
type IStatus = "ATIVO" | "MORTE" | "VENDA" | "DESCARTE" | string;

// Dose de Sêmen
interface SemenDose {
  id: string;
  animal_name: string;
  breed: string;
  quantity: number;
  animal_image?: string;
  father_name?: string;
  updated_at: string;
}
```

---

## 🔄 ARQUITETURA OFFLINE-FIRST

### Fluxo de Dados

```
┌─────────────────────────────────────────────────────────┐
│                      USUÁRIO                            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   COMPONENTES REACT                      │
│  (Leem dados via hooks, disparam ações de escrita)      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   CUSTOM HOOKS                           │
│  useAnimals, useCreateAnimal, useUpdateAnimal, etc.     │
│  (Abstraem operações CRUD no RxDB)                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     RxDBProvider                         │
│  (Gerencia instância do banco, estado de loading)       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                       RxDB                               │
│  (Banco local reativo - IndexedDB via Dexie)            │
│  - Observables para reatividade                         │
│  - Persistência automática                              │
│  - Versionamento de schemas                             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ (Quando online)
┌─────────────────────────────────────────────────────────┐
│               REPLICATION ENGINE                         │
│  (Push/Pull com Supabase via REST API)                  │
│  - Sincronização bidirecional                           │
│  - Resolução de conflitos (last-write-wins)             │
│  - Retry automático em caso de falha                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      SUPABASE                            │
│  (PostgreSQL + RLS + Storage)                           │
└─────────────────────────────────────────────────────────┘
```

### Princípios

1. **Local-First**: Todas as operações são feitas no banco local primeiro
2. **Reactive**: UI atualiza automaticamente via RxDB Observables
3. **Resilient**: Funciona 100% offline, sincroniza quando possível
4. **Conflict-Free**: Usa `updated_at` para resolução de conflitos

---

## 📝 CONVENÇÕES DE CÓDIGO

### Nomenclatura

| Tipo        | Convenção                        | Exemplo                  |
| ----------- | -------------------------------- | ------------------------ |
| Componentes | PascalCase                       | `AnimalCard.tsx`         |
| Hooks       | camelCase com `use`              | `useAnimals.ts`          |
| Tipos       | PascalCase com `.type.ts`        | `animal.type.ts`         |
| Schemas     | camelCase com `.schema.ts`       | `animal.schema.ts`       |
| Replicações | snake_case com `.replication.ts` | `animal.replication.ts`  |
| Páginas     | `page.tsx` em pasta              | `[id]/detalhes/page.tsx` |

### Padrões de Hooks

```typescript
// Hook de leitura (lista)
export function useAnimals() {
  const { db, isReady } = useRxDB();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db || !isReady) return;

    const subscription = db.animals
      .find()
      .where("_deleted")
      .ne(true)
      .$.subscribe((docs) => {
        setAnimals(docs.map((d) => d.toJSON()));
        setIsLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [db, isReady]);

  return { animals, isLoading };
}

// Hook de mutação (criar)
export function useCreateAnimal() {
  const { db, isReady } = useRxDB();

  const createAnimal = async (animal: Animal) => {
    if (!db || !isReady) throw new Error("DB not ready");

    await db.animals.insert({
      ...animal,
      updated_at: new Date().toISOString(),
    });
  };

  return { createAnimal };
}
```

### Padrões de Componentes

```typescript
// Componente com loading state
export function AnimalsList() {
  const { animals, isLoading } = useAnimals();

  if (isLoading) {
    return <AnimalsListSkeleton />;
  }

  if (animals.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {animals.map((animal) => (
        <AnimalCard key={animal.rgn} animal={animal} />
      ))}
    </div>
  );
}
```

---

## 🔌 INTEGRAÇÃO COM IA

### Para Adicionar Nova Funcionalidade

1. **Criar Tipo** em `src/types/`
2. **Criar Schema RxDB** em `src/db/schemas/`
3. **Adicionar Coleção** em `src/db/collections.ts`
4. **Configurar no Client** em `src/db/client.ts`
5. **Criar Replicação** em `src/db/replications/`
6. **Criar Hooks** em `src/hooks/db/[entidade]/`
7. **Criar Componentes** em `src/components/[feature]/`
8. **Criar Páginas** em `src/app/(protected)/[feature]/`

### Para Modificar Entidade Existente

1. Atualizar tipo em `src/types/`
2. Incrementar versão do schema
3. Adicionar migration strategy
4. Atualizar replicação se necessário
5. Atualizar hooks afetados
6. Atualizar componentes afetados

### Para Corrigir Bugs

1. Verificar se é problema de **sync** (replicação)
2. Verificar se é problema de **schema** (migração)
3. Verificar se é problema de **UI** (componente/hook)
4. Checar logs no console (`[RxDB]`, `[Supabase]`)

---

## ⚠️ PONTOS DE ATENÇÃO

### RxDB

- Sempre usar `_deleted` para soft-delete
- Sempre atualizar `updated_at` em mutações
- Schemas são versionados - incrementar versão ao mudar estrutura
- Migrations são obrigatórias ao mudar schema

### Supabase

- Tabelas devem ter RLS habilitado
- Campo `updated_at` deve existir em todas as tabelas
- Storage usa bucket `animal-images`

### TypeScript

- Usar tipos estritos, evitar `any`
- Campos opcionais com `?`
- Exportar tipos de `src/types/`

### Performance

- Usar `useMemo` e `useCallback` quando apropriado
- Evitar re-renders desnecessários
- Usar Suspense e lazy loading

---

## 🚀 COMANDOS ÚTEIS

```bash
# Desenvolvimento
npm run dev          # Inicia em modo dev com Turbopack

# Build
npm run build        # Build de produção (inclui Service Worker)
npm run build:sw     # Build apenas do Service Worker

# Produção
npm start            # Inicia servidor de produção
```

---

## 📚 REFERÊNCIAS

- [RxDB Documentation](https://rxdb.info/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
