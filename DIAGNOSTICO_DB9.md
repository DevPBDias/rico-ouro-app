# 🔥 DIAGNÓSTICO COMPLETO - ERRO DB9 (Schema Mismatch)

## 📋 RESUMO EXECUTIVO

O erro DB9 ocorre devido a **incompatibilidades entre os schemas RxDB e os dados vindos do Supabase**, agravado por:

1. **Schemas mal definidos** (objetos sem `required`, arrays sem validação)
2. **Dados nulos do Postgres** sendo transformados incorretamente
3. **Service Worker** servindo código antigo em produção
4. **Replicação iniciando antes do DB estar pronto**
5. **Reset do IndexedDB incompleto**

---

## 🔴 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1️⃣ SCHEMAS COM DEFINIÇÕES INCOMPLETAS

#### `animal.schema.ts`:
- ❌ Objetos `animal`, `pai`, `mae`, `avoMaterno` sem `required: []`
- ❌ Arrays com items sem `required`
- ❌ Campo `animal.status` é `string` no schema mas `IStatus` (objeto) no TypeScript
- ❌ `lastModified` sem default
- ❌ `updatedAt` sem formato `date-time`

#### `matriz.schema.ts`:
- ❌ `protocolosReproducao` com objetos profundamente aninhados sem `required`
- ❌ `montaNatural` é obrigatório no TypeScript mas opcional no schema
- ❌ Enums podem receber `null` do Supabase

#### `vaccine.schema.ts` e `farm.schema.ts`:
- ❌ `lastModified` sem default
- ❌ `updatedAt` sem formato

---

### 2️⃣ REPLICAÇÃO SUPABASE

#### `replicateCollection.ts`:
- ❌ `transformPull` pode retornar `undefined` em campos obrigatórios
- ❌ Arrays vazios `[]` vs `undefined` - inconsistência
- ❌ Não valida campos obrigatórios antes de inserir

#### `animal.replication.ts`:
- ❌ `cleanNulls` pode remover `uuid` (campo obrigatório)
- ❌ Objetos aninhados podem ficar `{ nome: undefined }` e quebrar schema

---

### 3️⃣ INICIALIZAÇÃO DO RXDB

#### `client.ts`:
- ❌ `indexedDB.open()` redundante na linha 71 (race condition)
- ❌ Replicação inicia antes de validar que collections foram criadas
- ❌ Não aguarda DB estar 100% pronto

#### `RxDBProvider.tsx`:
- ❌ React 19 Strict Mode pode duplicar mount
- ❌ Não trata recuperação após falha

---

### 4️⃣ RESET DO INDEXEDDB

#### `reset-indexeddb.ts`:
- ❌ `onblocked` não força close de conexões
- ❌ Não limpa localStorage/sessionStorage
- ❌ Não invalida cache do Service Worker
- ❌ Sem fallback se falhar

---

### 5️⃣ SERVICE WORKER

#### `service-worker.ts`:
- ❌ `CACHE_NAME` fixo - não muda quando schema muda
- ❌ Cache pode servir JS antigo com schema desatualizado
- ⚠️ Deveria incluir versão do schema no nome do cache

---

### 6️⃣ TYPESCRIPT vs SCHEMA

#### `schemas.types.ts`:
- ❌ Todos os campos são opcionais (`?`) mas schema exige alguns como obrigatórios
- ❌ `animal.status` é `IStatus` (objeto) mas schema espera `string`
- ❌ `matriz.montaNatural` é obrigatório mas schema não força

---

## ✅ CAMPOS ESPECÍFICOS QUE QUEBRAM O SCHEMA

### Animal:
1. `animal` (objeto sem required)
2. `animal.status` (tipo incompatível)
3. `animal.pesosMedidos` (array sem required nos items)
4. `animal.ganhoDiario` (array sem required nos items)
5. `animal.circunferenciaEscrotal` (array sem required nos items)
6. `animal.vacinas` (array sem required nos items)
7. `pai` (objeto sem required)
8. `mae` (objeto sem required)
9. `avoMaterno` (objeto sem required)
10. `lastModified` (sem default, pode ser undefined)

### Matriz:
1. `protocolosReproducao` (objeto profundo sem required)
2. `protocolosReproducao.iatf` (array sem required nos items)
3. `protocolosReproducao.montaNatural` (array sem required nos items)
4. `protocolosReproducao.fivTETF` (array sem required nos items)
5. `status` (objeto sem required)
6. `parturitionFrom` (objeto sem required)
7. `lastModified` (sem default)

### Vaccine e Farm:
1. `lastModified` (sem default)

---

## 🎯 PRÓXIMOS PASSOS

Vou criar as correções completas para:

1. ✅ Schemas corrigidos com `required` e defaults
2. ✅ Replicação com validação de campos obrigatórios
3. ✅ Reset robusto do IndexedDB
4. ✅ Service Worker com versionamento
5. ✅ Provider com proteção contra duplicação
6. ✅ Inicialização do RxDB sem race conditions
7. ✅ TypeScript types alinhados com schemas
8. ✅ Migrations opcionais
9. ✅ Script de deploy para Vercel
10. ✅ Checklist de validação

---

**Data do diagnóstico**: 2025-11-28  
**Versão do DB atual**: `indi_ouro_db_v9`  
**RxDB**: 16.20.0  
**Next.js**: 16.0.5  
**React**: 19.2.0
