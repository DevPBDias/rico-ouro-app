# 🏛️ Architecture Blueprint: Rico Ouro App (Gold Standard)

Este documento serve como a **"Fonte da Verdade"** para a arquitetura do projeto. Ele define como construir uma aplicação offline-first confiável, testável e legível usando **Next.js, RxDB e CouchDB**.

---

## 🧭 Princípios Core

1.  **Offline-First by Default**: O app deve ser 100% funcional sem internet. A sincronização é um processo de background.
2.  **Clean Architecture**: Separação rigorosa entre Lógica de Negócio (Core), Persistência (Data) e Interface (Presentation).
3.  **Documentos Agregados**: Evitar JOINs. Um documento principal (ex: Animal) deve conter seu histórico relevante para garantir consistência offline.
4.  **Type Safety Absoluto**: Proibido o uso de `any`. Validação rigorosa com Zod em todas as entradas.
5.  **Testabilidade**: Toda lógica de negócio deve ser testável via Vitest sem necessidade de browser.

---

## 📂 Estrutura de Pastas (The Right Way)

```text
src/
├── core/                         # 🧠 DOMAIN & LOGIC (Não conhece o React ou DB)
│   ├── entities/                 # Interfaces puras e tipos base
│   ├── schemas/                  # Validações Zod (Regras de Negócio)
│   ├── services/                 # Casos de Uso (RegisterAnimal, ApplyVaccine)
│   └── errors/                   # Classes de erro customizadas (AppError)
│
├── data/                         # 💾 INFRASTRUCTURE (Persistência e Sync)
│   ├── database/                 # Configuração do RxDB client e JSON Schemas
│   ├── repositories/             # Repository Pattern (CRUD contra o RxDB)
│   └── sync/                     # Configuração de replicação CouchDB
│
├── presentation/                 # 🎨 UI & HOOKS (Onde o React vive)
│   ├── hooks/                    # Hooks que conectam Services à UI
│   ├── components/               # UI components, Layouts e Widgets
│   ├── providers/                # Contextos (DatabaseProvider, ServiceProvider)
│   └── styles/                   # Design System (CSS puro ou Tailwind)
│
├── app/                          # 🌐 NEXT.JS ROUTES (Thin layer)
└── shared/                       # 🛠️ UTILS & CONSTANTS
```

---

## 🛠️ Stack Recomendada

- **Frontend**: Next.js (App Router) + React 19
- **Local DB**: RxDB + Dexie (IndexedDB)
- **Sync DB**: CouchDB (Docker ou Managed)
- **Auth**: Supabase Auth (JWT)
- **Validação**: Zod
- **Testes**: Vitest (Unit) + Playwright (E2E)

---

## 🏗️ Implementação: Persistência Simplificada

Para manter o código legível e evitar "boilerplate" (código repetitivo), adotamos o padrão **Generic Repository Factory**.

### 1. Repositorio Genérico (Sem Classes Extras)
Em vez de criar 15 arquivos de repositório, use uma única função fábrica que gera o CRUD básico para qualquer coleção. Isso reduz drasticamente o número de arquivos e chaves.

```typescript
// src/data/repositories/generic.repository.ts
export const createRepository = <T>(collection: RxCollection<T>) => ({
  findAll: (query) => collection.find(query).exec(),
  findById: (id) => collection.findOne(id).exec(),
  save: (data) => collection.insert({ ...data, created_at: Date.now(), updated_at: Date.now() }),
  update: (id, data) => collection.findOne(id).patch({ ...data, updated_at: Date.now() }),
  delete: (id) => collection.findOne(id).patch({ _deleted: true })
});
```

### 2. Sincronização Unificada
Não crie um arquivo de sync por entidade. Use um único loop no seu `setupSync.ts` que itera sobre as coleções e ativa a replicação CouchDB automaticamente. Isso remove a complexidade de gerenciar 15 conexões manualmente.

### 3. Documentos Agregados (Menos "Keys" de Tabela)
Evite espalhar dados. Se um Animal tem vacinas, as vacinas são uma **lista dentro do documento do Animal**, e não uma coleção separada. Isso reduz o número de databases (keys) no CouchDB e simplifica o sync.

---

## 🧪 Estratégia de Testes

1.  **Unit Tests (Core)**: Testar Services e Schemas Zod. Devem ser rápidos e 100% isolados.
2.  **Integration Tests (Data)**: Testar Repositories contra uma instância in-memory do RxDB.
3.  **E2E Tests (Presentation)**: Testar fluxos completos (Offline -> Online) com Playwright.

---

## 🤖 AI Prompt para Novos Módulos

"Aja como um Dev Senior especializado em RxDB e Clean Architecture. Crie um novo módulo para [NOME DA FEATURE] seguindo esta estrutura:
1. Crie a entidade em `core/entities` herdando de `BaseEntity`.
2. Crie o schema Zod em `core/schemas` para validação de criação e update.
3. Crie o Repository em `data/repositories` especializado para esta entidade.
4. Crie o Service em `core/services` com a lógica de negócio principal.
5. NÃO use 'any'. Use timestamps como numbers (Date.now()).
6. Garanta que a entidade seja agregada se fizer parte de um documento pai."

---

## 🚀 Como Iniciar (Quickstart)

1.  **Docker**: Suba o CouchDB (`docker-compose up -d`).
2.  **Setup**: Rodar `setup-couchdb.ts` para criar os databases.
3.  **Auth**: Configurar Supabase Auth Key no `.env`.
4.  **Service Worker**: Garantir que o `next-pwa` está configurado para o modo offline.
