# Guia de Migração: Template de Replicação Padronizado

Este documento descreve como migrar as replicações existentes (em `src/db/replications/`) para o novo template padronizado (em `src/db/replication/`).

## 📁 Estrutura Nova vs Antiga

```
# ANTIGA (será removida após migração completa)
src/db/replications/
├── animal.replication.ts
├── vaccine.replication.ts
├── farm.replication.ts
└── ...

# NOVA (padrão a ser usado)
src/db/replication/
├── base/
│   ├── createReplication.ts   # Factory principal
│   ├── conflictResolver.ts    # Estratégias de conflito
│   ├── types.ts               # Tipos TypeScript
│   └── index.ts               # Re-exports
├── animal.replication.ts      # ✅ Migrado
├── semenDose.replication.ts   # ✅ Migrado
├── vaccine.replication.ts     # 🔄 A migrar
└── index.ts                   # Índice geral
```

## 🔄 Passo a Passo para Migrar uma Entidade

### 1. Verificar/Atualizar o Tipo

O tipo da entidade DEVE ter `updated_at` e `_deleted` obrigatórios:

```typescript
// src/types/minha_entidade.type.ts
export interface MinhaEntidade {
  id: string;
  // ... outros campos
  updated_at: string;  // OBRIGATÓRIO
  _deleted: boolean;   // OBRIGATÓRIO
}
```

### 2. Criar o Arquivo de Replicação

```typescript
// src/db/replication/minhaEntidade.replication.ts
import { createReplication } from "./base";
import { MinhaEntidade } from "@/types/minha_entidade.type";

export const minhaEntidadeReplication = createReplication<MinhaEntidade>({
  collectionName: "minha_entidade",  // Nome da coleção RxDB
  tableName: "minha_entidade",       // Nome da tabela Supabase
  replicationIdentifier: "minha-entidade-replication-v1",

  // Mapeia documento RxDB → Supabase
  mapToSupabase: (doc) => ({
    id: doc.id,
    // ... mapear todos os campos
    updated_at: doc.updated_at,
    _deleted: doc._deleted,
  }),
});

// Wrapper para compatibilidade com o sistema atual
export async function replicateMinhaEntidadeNew(
  db: Parameters<typeof minhaEntidadeReplication>[0],
  supabaseUrl: string,
  supabaseKey: string
) {
  return minhaEntidadeReplication(db, supabaseUrl, supabaseKey);
}
```

### 3. Adicionar ao Índice

```typescript
// src/db/replication/index.ts
export { minhaEntidadeReplication, replicateMinhaEntidadeNew } from "./minhaEntidade.replication";
```

### 4. Atualizar `replication.ts` Principal

```typescript
// src/db/replication.ts
import { replicateMinhaEntidadeNew } from "./replication/minhaEntidade.replication";

// Substituir chamada antiga pela nova
const minhaEntidadeReplication = await replicateMinhaEntidadeNew(
  db,
  SUPABASE_URL,
  SUPABASE_KEY
);
```

### 5. Testar

- [ ] Verificar pull (Supabase → RxDB)
- [ ] Verificar push (RxDB → Supabase)
- [ ] Testar offline → online
- [ ] Verificar logs no console

## ✅ Entidades Migradas

| Entidade | Status | Versão |
|----------|--------|--------|
| `animals` | ✅ Migrado | v2 |
| `semen_doses` | ✅ Migrado | v5 |
| `vaccines` | 🔄 Pendente | - |
| `farms` | 🔄 Pendente | - |
| `animal_metrics_weight` | 🔄 Pendente | - |
| `animal_metrics_ce` | 🔄 Pendente | - |
| `animal_vaccines` | 🔄 Pendente | - |
| `reproduction_events` | 🔄 Pendente | - |
| `animal_statuses` | 🔄 Pendente | - |

## ⚠️ Notas Importantes

1. **Incrementar replicationIdentifier**: Sempre incremente a versão ao migrar para evitar conflitos de checkpoint.

2. **_deleted obrigatório**: O RxDB exige que `_deleted` seja boolean, não opcional. Garanta isso no tipo.

3. **mapToSupabase**: Sempre mapeie explicitamente os campos. Use `?? null` para campos opcionais.

4. **Compatibilidade**: Os arquivos antigos podem coexistir temporariamente. Remova-os após validar a migração.

5. **Testes**: Teste em um ambiente de desenvolvimento antes de atualizar produção.

## 📚 Referências

- [RxDB Replication](https://rxdb.info/replication.html)
- [Supabase PostgREST](https://supabase.com/docs/guides/api)
