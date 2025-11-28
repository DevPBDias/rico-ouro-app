# ✅ CHECKLIST DE VALIDAÇÃO - DB9 RESOLVIDO

## 🎯 VALIDAÇÃO PRÉ-DEPLOY

### Código
- [ ] Versão do DB incrementada em `src/db/client.ts` (v10)
- [ ] Versão do cache incrementada em `src/sw/service-worker.ts` (v10)
- [ ] Schemas com `required: []` em objetos aninhados
- [ ] Schemas com `default: ""` em `lastModified`
- [ ] Schemas com `format: "date-time"` em `updatedAt`
- [ ] Schemas com `type: ["number", "null"]` em `id`
- [ ] Arrays com `required` nos items
- [ ] Provider com proteção contra duplicação
- [ ] Replicação com validação de campos obrigatórios
- [ ] Reset robusto implementado

### Build Local
- [ ] `npm run build` sem erros
- [ ] `npm run start` funciona
- [ ] Console sem DB9
- [ ] IndexedDB criado com v10
- [ ] Collections criadas corretamente
- [ ] Replicação iniciando
- [ ] Dados sincronizando

---

## 🚀 VALIDAÇÃO DURANTE DEPLOY

### Limpeza
- [ ] `.next` deletado
- [ ] `node_modules` reinstalado (opcional)
- [ ] Service Worker rebuilded (`npm run build:sw`)
- [ ] Cache da Vercel invalidado (`--force`)

### Deploy
- [ ] Commit realizado
- [ ] Push para repositório
- [ ] Deploy na Vercel iniciado
- [ ] Build da Vercel concluído sem erros
- [ ] Deploy marcado como "Ready"

---

## ✅ VALIDAÇÃO PÓS-DEPLOY

### Console do Navegador
Abra DevTools → Console e verifique:

- [ ] ✅ `🚀 Initializing RxDB...`
- [ ] ✅ `📦 Adding collections...`
- [ ] ✅ `✅ Collections created successfully`
- [ ] ✅ `🔄 Starting replication...`
- [ ] ✅ `✅ RxDB initialized successfully!`
- [ ] ❌ **NÃO** deve aparecer: `DB9`
- [ ] ❌ **NÃO** deve aparecer: `Schema conflict`
- [ ] ❌ **NÃO** deve aparecer: `DXE1`

### IndexedDB
Abra DevTools → Application → IndexedDB:

- [ ] ✅ Existe: `indi_ouro_db_v10`
- [ ] ✅ Tem collection: `animals`
- [ ] ✅ Tem collection: `vaccines`
- [ ] ✅ Tem collection: `farms`
- [ ] ✅ Tem collection: `matriz`
- [ ] ❌ **NÃO** existe: `indi_ouro_db_v9`
- [ ] ❌ **NÃO** existe: `indi_ouro_db_v8`
- [ ] ❌ **NÃO** existe versões antigas

### Cache Storage
Abra DevTools → Application → Cache Storage:

- [ ] ✅ Existe: `rico-ouro-cache-v10`
- [ ] ❌ **NÃO** existe: `rico-ouro-cache-v1`
- [ ] ❌ **NÃO** existe versões antigas

### Service Worker
Abra DevTools → Application → Service Workers:

- [ ] ✅ Status: `activated and running`
- [ ] ✅ Source contém `v10` no cache name
- [ ] ✅ Não há múltiplas instâncias registradas

### Local Storage
Abra DevTools → Application → Local Storage:

- [ ] ✅ Sem chaves de versões antigas do DB
- [ ] ✅ Sem dados corrompidos

---

## 🧪 TESTES FUNCIONAIS

### CRUD Básico
- [ ] ✅ Criar novo animal
- [ ] ✅ Editar animal existente
- [ ] ✅ Deletar animal
- [ ] ✅ Criar nova vacina
- [ ] ✅ Criar nova fazenda
- [ ] ✅ Criar nova matriz

### Sincronização
- [ ] ✅ Dados aparecem no Supabase
- [ ] ✅ Mudanças no Supabase aparecem localmente
- [ ] ✅ Conflitos resolvidos corretamente
- [ ] ✅ `_deleted` funciona corretamente

### Modo Offline
- [ ] ✅ Desconectar internet
- [ ] ✅ Criar/editar dados offline
- [ ] ✅ Reconectar internet
- [ ] ✅ Dados sincronizam automaticamente

### Persistência
- [ ] ✅ Recarregar página (F5)
- [ ] ✅ Dados permanecem
- [ ] ✅ Sem erro DB9 após reload
- [ ] ✅ Fechar e reabrir aba
- [ ] ✅ Dados permanecem

### Múltiplas Abas
- [ ] ✅ Abrir 2+ abas
- [ ] ✅ Editar em uma aba
- [ ] ✅ Mudança aparece em outras abas
- [ ] ✅ Sem erro DB9
- [ ] ✅ Sem conflitos

---

## 🌐 TESTES MULTI-DISPOSITIVO

### Desktop
- [ ] ✅ Chrome
- [ ] ✅ Firefox
- [ ] ✅ Edge
- [ ] ✅ Safari (Mac)

### Mobile
- [ ] ✅ Chrome Android
- [ ] ✅ Safari iOS
- [ ] ✅ Firefox Mobile

### Modos Especiais
- [ ] ✅ Modo anônimo/privado
- [ ] ✅ Modo desenvolvedor
- [ ] ✅ Slow 3G (throttling)

---

## 🔍 DIAGNÓSTICO AVANÇADO

### Execute no Console

```javascript
// 1. Listar bancos
indexedDB.databases().then(dbs => {
  console.log('📦 Bancos IndexedDB:', dbs);
  // ✅ Deve mostrar apenas v10
  // ❌ NÃO deve mostrar v9, v8, etc
});

// 2. Verificar cache
caches.keys().then(keys => {
  console.log('💾 Caches:', keys);
  // ✅ Deve mostrar apenas rico-ouro-cache-v10
  // ❌ NÃO deve mostrar v1, v9, etc
});

// 3. Verificar localStorage
console.log('🗄️ LocalStorage:', Object.keys(localStorage));
// ❌ NÃO deve ter chaves de versões antigas

// 4. Verificar Service Worker
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('⚙️ Service Workers:', regs);
  regs.forEach(reg => console.log('   -', reg.active?.scriptURL));
  // ✅ Deve ter apenas 1 registration
});

// 5. Verificar online/offline
console.log('🌐 Online:', navigator.onLine);
// ✅ Deve ser true (se online)

// 6. Verificar storage usage
navigator.storage.estimate().then(usage => {
  console.log('💾 Storage:', {
    used: `${(usage.usage / 1024 / 1024).toFixed(2)} MB`,
    quota: `${(usage.quota / 1024 / 1024).toFixed(2)} MB`,
    percentage: `${((usage.usage / usage.quota) * 100).toFixed(2)}%`
  });
});
```

---

## 🆘 SE FALHAR ALGUM ITEM

### Console mostra DB9
```javascript
// 1. Reset completo
import { resetAllDatabases } from '@/db/utils/reset-indexeddb';
await resetAllDatabases();

// 2. Limpar tudo manualmente
localStorage.clear();
sessionStorage.clear();
caches.keys().then(keys => keys.forEach(key => caches.delete(key)));

// 3. Recarregar com cache limpo
// Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
```

### Versões antigas aparecem
```javascript
// Deletar versões antigas manualmente
const oldVersions = ['v9', 'v8', 'v7', 'v6', 'v5', 'v4', 'v3', 'v2'];
oldVersions.forEach(v => {
  indexedDB.deleteDatabase(`indi_ouro_db_${v}`);
  indexedDB.deleteDatabase(`rico_ouro_db_${v}`);
});
```

### Cache antigo persiste
```javascript
// Deletar todos os caches
caches.keys().then(keys => {
  keys.forEach(key => {
    if (key.includes('rico-ouro') && !key.includes('v10')) {
      caches.delete(key);
      console.log('Deletado:', key);
    }
  });
});
```

### Service Worker não atualiza
```javascript
// Desregistrar todos os SWs
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => {
    reg.unregister();
    console.log('SW desregistrado');
  });
});
// Depois recarregar a página
```

---

## 📊 MÉTRICAS DE SUCESSO

### Performance
- [ ] ✅ Inicialização < 3s
- [ ] ✅ Primeira query < 100ms
- [ ] ✅ Sincronização < 5s (100 docs)
- [ ] ✅ Sem memory leaks

### Confiabilidade
- [ ] ✅ 0 erros DB9 em 24h
- [ ] ✅ 0 erros de sincronização
- [ ] ✅ 100% dos dados persistidos
- [ ] ✅ Funciona offline

### Compatibilidade
- [ ] ✅ Chrome 90+
- [ ] ✅ Firefox 88+
- [ ] ✅ Safari 14+
- [ ] ✅ Edge 90+
- [ ] ✅ Mobile browsers

---

## ✅ APROVAÇÃO FINAL

Marque quando TODOS os itens acima estiverem ✅:

- [ ] **PRÉ-DEPLOY**: Todos os itens validados
- [ ] **DURANTE DEPLOY**: Processo concluído
- [ ] **PÓS-DEPLOY**: Todas as validações passaram
- [ ] **TESTES FUNCIONAIS**: Todos os CRUDs funcionando
- [ ] **MULTI-DISPOSITIVO**: Testado em 3+ dispositivos
- [ ] **DIAGNÓSTICO**: Nenhum problema encontrado
- [ ] **MÉTRICAS**: Dentro dos limites esperados

---

## 🎉 DEPLOY APROVADO

Se todos os itens acima estão ✅, então:

**✅ ERRO DB9 DEFINITIVAMENTE RESOLVIDO!**

Pode considerar o deploy bem-sucedido e monitorar por 24-48h para garantir estabilidade.

---

**Data**: _____________  
**Validado por**: _____________  
**Versão**: v10  
**Status**: [ ] EM PROGRESSO  [ ] ✅ APROVADO
