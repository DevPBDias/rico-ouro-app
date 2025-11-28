# RxDB DB9 Error - Troubleshooting Guide

## 📋 Resumo do Problema

Erro **DB9 (Schema Mismatch)** persistente no RxDB após deploy na Vercel, mesmo com:
- Remoção do IndexedDB
- Incremento de versão do banco
- Tentativas de reset automático

## ✅ Correções Já Aplicadas

### 1. **Storage Correto** ✓
- ❌ Removido: `wrappedValidateAjvStorage` (causa DB9 em produção)
- ✅ Usando: `getRxStorageDexie()` diretamente

### 2. **Versionamento** ✓
- Versão atual: `indi_ouro_db_v9`
- Schemas limpos (removidos console.log de debug)

### 3. **Singleton Supabase** ✓
- Criado: `src/lib/supabase/client.ts`
- Elimina warning "Multiple GoTrueClient instances"

### 4. **Reset IndexedDB Robusto** ✓
- Criado: `src/db/utils/reset-indexeddb.ts`
- Usa `indexedDB.deleteDatabase()` nativo
- Delay de 2 segundos após cleanup

### 5. **Provider com Dynamic Import** ✓
- `src/providers/RxDBProvider.tsx` usa import dinâmico
- Previne execução no servidor

## 🔍 Possíveis Causas Remanescentes

### Causa #1: Múltiplas Abas/Tabs Abertas
**Sintoma:** IndexedDB bloqueado durante reset
**Solução:**
```javascript
// Já implementado em reset-indexeddb.ts
req.onblocked = () => {
  console.warn("IndexedDB reset blocked — close other tabs");
};
```
**Ação:** Feche TODAS as abas do app antes de testar

### Causa #2: Service Worker Cache
**Sintoma:** Código antigo sendo servido
**Solução:**
1. Abra DevTools → Application → Service Workers
2. Clique em "Unregister"
3. Limpe "Cache Storage"
4. Hard refresh (Ctrl+Shift+R)

### Causa #3: Vercel Edge Cache
**Sintoma:** Build antigo sendo servido
**Solução:**
1. No dashboard da Vercel → Deployments
2. Clique nos 3 pontos do deployment → "Redeploy"
3. Marque "Use existing Build Cache" como OFF

### Causa #4: Schema Oculto Incompatível
**Sintoma:** Algum campo com tipo inválido
**Verificar:**
```typescript
// Campos que PODEM causar problema:
- Campos opcionais sem default
- Arrays sem items definido
- Objects sem properties
- Enums vazios
```

## 🚀 Próximos Passos Recomendados

### Opção A: Reset Completo Manual (Mais Seguro)

1. **Limpar tudo localmente:**
```javascript
// Cole no console do browser:
(async () => {
  const dbs = await indexedDB.databases();
  for (const db of dbs) {
    indexedDB.deleteDatabase(db.name);
    console.log('Deleted:', db.name);
  }
  console.log('✅ All databases deleted. Refresh the page.');
})();
```

2. **Incrementar versão para v10:**
```typescript
// src/db/client.ts
const DB_NAME = "indi_ouro_db_v10";
```

3. **Deploy limpo na Vercel:**
- Redeploy sem cache
- Aguardar 2-3 minutos
- Testar em aba anônima

### Opção B: Simplificar Temporariamente

1. **Desabilitar replicação temporariamente:**
```typescript
// src/db/client.ts - comentar bloco de replicação
/*
const supabase = getBrowserSupabase();
if (supabase && navigator.onLine) {
  // ... replication code
}
*/
```

2. **Testar apenas criação do DB:**
- Se funcionar → problema está na replicação
- Se não funcionar → problema está no schema

### Opção C: Usar Schema Migration (Recomendado para Produção)

```typescript
// Exemplo de migration strategy
export const animalSchema: RxJsonSchema<AnimalData> = {
  title: "animals",
  version: 1, // ← Incrementar quando mudar schema
  primaryKey: "uuid",
  type: "object",
  properties: { /* ... */ },
  
  // Adicionar migration
  migrationStrategies: {
    1: function(oldDoc) {
      // Transformar documento antigo para novo formato
      return oldDoc;
    }
  }
};
```

## 🐛 Debug Avançado

### Ver todos os bancos IndexedDB:
```javascript
indexedDB.databases().then(dbs => console.table(dbs));
```

### Verificar se DB existe:
```javascript
const request = indexedDB.open("indi_ouro_db_v9");
request.onsuccess = () => {
  const db = request.result;
  console.log('Stores:', db.objectStoreNames);
  db.close();
};
```

### Monitorar eventos IndexedDB:
```javascript
// Já adicionado no seu código
const rawDB = await indexedDB.open(DB_NAME);
rawDB.onupgradeneeded = (e) => {
  console.log('Upgrade:', e.oldVersion, '→', e.newVersion);
};
```

## 📝 Checklist Final

Antes de fazer novo deploy:

- [ ] Todas as abas do app fechadas
- [ ] Service Worker desregistrado
- [ ] Cache do browser limpo
- [ ] IndexedDB local deletado manualmente
- [ ] Versão do DB incrementada (v10)
- [ ] Build local testado (`npm run build && npm start`)
- [ ] Variáveis de ambiente na Vercel verificadas:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Deploy na Vercel SEM cache
- [ ] Testar em aba anônima após deploy

## 🆘 Última Alternativa

Se nada funcionar, considere:

1. **Usar outro storage:**
```typescript
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
const storage = getRxStorageMemory(); // Temporário, só para testar
```

2. **Reportar bug no RxDB:**
- https://github.com/pubkey/rxdb/issues
- Incluir: versão RxDB, Next.js, navegador, erro completo

## 📚 Recursos Úteis

- [RxDB Error Codes](https://rxdb.info/errors.html)
- [RxDB Dev Mode](https://rxdb.info/dev-mode.html)
- [Schema Validation](https://rxdb.info/rx-schema.html)
- [Migration Strategies](https://rxdb.info/migration-schema.html)

---

**Última atualização:** 27/11/2025 21:33
**Status:** Em investigação - DB9 persistente
**Próxima ação sugerida:** Opção A (Reset Completo Manual)
