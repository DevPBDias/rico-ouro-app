# 🚀 GUIA DE DEPLOY PARA VERCEL - SEM ERRO DB9

## 📋 PRÉ-DEPLOY CHECKLIST

Antes de fazer deploy, verifique:

- [ ] Versão do DB incrementada em `src/db/client.ts` (atualmente: `v10`)
- [ ] Versão do cache do SW atualizada em `src/sw/service-worker.ts` (atualmente: `v10`)
- [ ] Schemas validados com `required` e `default` corretos
- [ ] Todos os testes locais passando
- [ ] Build local funcionando: `npm run build`

---

## 🔧 PROCEDIMENTO DE DEPLOY

### 1️⃣ Limpar Cache Local (CRÍTICO)

```bash
# Limpar build cache do Next.js
rm -rf .next

# Limpar node_modules (opcional mas recomendado)
rm -rf node_modules
npm install

# Rebuild do Service Worker
npm run build:sw
```

### 2️⃣ Testar Build Localmente

```bash
npm run build
npm run start
```

Abra `http://localhost:3000` e:
- Abra DevTools → Application → IndexedDB
- Verifique se o banco `indi_ouro_db_v10` foi criado
- Verifique se NÃO há erro DB9 no console
- Teste criar/editar/deletar dados

### 3️⃣ Limpar Cache do Navegador

**Antes de testar em produção:**

1. Abra DevTools (F12)
2. Vá em **Application** → **Storage**
3. Clique em **Clear site data**
4. Marque TUDO:
   - ✅ Cookies
   - ✅ Local storage
   - ✅ Session storage
   - ✅ IndexedDB
   - ✅ Cache storage
5. Clique em **Clear site data**
6. Feche TODAS as abas do site
7. Feche o navegador completamente
8. Reabra o navegador

### 4️⃣ Deploy na Vercel

```bash
# Se usando Vercel CLI
vercel --prod

# Ou via Git
git add .
git commit -m "fix: resolve DB9 error with schema corrections v10"
git push origin main
```

### 5️⃣ Invalidar Cache da Vercel (CRÍTICO)

**Opção A: Via Dashboard**
1. Acesse https://vercel.com/dashboard
2. Vá no seu projeto
3. Settings → General → Build & Development Settings
4. Clique em **Redeploy** e marque:
   - ✅ Use existing Build Cache: **OFF**
   - ✅ Clear Cache

**Opção B: Via CLI**
```bash
vercel --prod --force
```

### 6️⃣ Forçar Atualização do Service Worker

Adicione este código temporário em `src/app/layout.tsx` (remover depois):

```typescript
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
        console.log('🗑️ Service Worker desregistrado');
      });
    });
  }
}, []);
```

---

## ✅ VALIDAÇÃO PÓS-DEPLOY

### 1️⃣ Verificar em Produção

Acesse seu site em produção e:

1. **Abra DevTools → Console**
   - ✅ Deve aparecer: `✅ RxDB initialized successfully!`
   - ❌ NÃO deve aparecer: `DB9` ou `Schema conflict`

2. **Abra DevTools → Application → IndexedDB**
   - ✅ Deve existir: `indi_ouro_db_v10`
   - ✅ Deve ter as collections: `animals`, `vaccines`, `farms`, `matriz`
   - ❌ NÃO deve existir versões antigas (`v9`, `v8`, etc)

3. **Abra DevTools → Application → Cache Storage**
   - ✅ Deve existir: `rico-ouro-cache-v10`
   - ❌ NÃO deve existir versões antigas (`v1`, `v9`, etc)

4. **Abra DevTools → Application → Service Workers**
   - ✅ Status deve ser: **activated and running**
   - ✅ Versão do cache deve ser `v10`

### 2️⃣ Testar Funcionalidades

- [ ] Criar novo animal
- [ ] Editar animal existente
- [ ] Deletar animal
- [ ] Sincronização com Supabase funcionando
- [ ] Modo offline funcionando
- [ ] Recarregar página sem erro

### 3️⃣ Testar em Múltiplos Dispositivos

- [ ] Desktop (Chrome, Firefox, Edge)
- [ ] Mobile (Chrome Android, Safari iOS)
- [ ] Modo anônimo/privado
- [ ] Múltiplas abas abertas

---

## 🆘 SE AINDA DER DB9 EM PRODUÇÃO

### Diagnóstico Rápido

1. **Abra Console e execute:**
```javascript
indexedDB.databases().then(dbs => console.log('Bancos:', dbs));
```

2. **Se aparecer versões antigas:**
```javascript
// Deletar TODOS os bancos
indexedDB.databases().then(dbs => {
  dbs.forEach(db => {
    indexedDB.deleteDatabase(db.name);
    console.log('Deletado:', db.name);
  });
});
```

3. **Limpar TUDO:**
```javascript
// Executar no console
localStorage.clear();
sessionStorage.clear();
caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
indexedDB.databases().then(dbs => dbs.forEach(db => indexedDB.deleteDatabase(db.name)));
```

4. **Recarregar com cache limpo:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

### Solução Definitiva

Se o erro persistir, adicione este código em `src/app/page.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { resetAllDatabases } from '@/db/utils/reset-indexeddb';

export default function Page() {
  useEffect(() => {
    const forceReset = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('reset') === 'true') {
        console.log('🔥 RESET FORÇADO ATIVADO');
        await resetAllDatabases();
        window.location.href = '/';
      }
    };
    forceReset();
  }, []);

  return <div>...</div>;
}
```

Depois acesse: `https://seu-site.vercel.app/?reset=true`

---

## 📊 MONITORAMENTO CONTÍNUO

### Adicionar Logging em Produção

Em `src/db/client.ts`, adicione:

```typescript
// Após linha 118
console.log('📊 DB Stats:', {
  name: db.name,
  collections: Object.keys(db.collections),
  version: DB_NAME,
  online: navigator.onLine,
  timestamp: new Date().toISOString(),
});
```

### Verificar Logs da Vercel

```bash
vercel logs <deployment-url> --follow
```

---

## 🎯 PRÓXIMA VEZ QUE MUDAR SCHEMA

1. Incrementar versão em **2 lugares**:
   - `src/db/client.ts` → `DB_NAME`
   - `src/sw/service-worker.ts` → `SCHEMA_VERSION`

2. Adicionar versão antiga na lista de cleanup em `client.ts`:
```typescript
const oldDbNames = [
  // ... versões existentes
  "indi_ouro_db_v10", // Adicionar versão atual
];
```

3. Seguir este guia de deploy novamente

---

## ✅ CHECKLIST FINAL

Antes de considerar o deploy bem-sucedido:

- [ ] Console sem erros DB9
- [ ] IndexedDB com versão correta (v10)
- [ ] Cache do SW com versão correta (v10)
- [ ] Sem versões antigas de bancos
- [ ] Sincronização funcionando
- [ ] Modo offline funcionando
- [ ] Testado em múltiplos dispositivos
- [ ] Testado em modo anônimo
- [ ] Testado com múltiplas abas
- [ ] Logs da Vercel sem erros

---

**Data**: 2025-11-28  
**Versão do DB**: v10  
**Versão do Cache**: v10
