# 🛠️ COMANDOS ÚTEIS - DB9

## 🚀 DESENVOLVIMENTO

### Build e Deploy
```bash
# Limpar build
rm -rf .next

# Rebuild Service Worker
npm run build:sw

# Build completo
npm run build

# Rodar local
npm run dev

# Deploy Vercel
vercel --prod

# Deploy forçando cache limpo
vercel --prod --force
```

### Testes
```bash
# Rodar em produção local
npm run build && npm run start

# Abrir em http://localhost:3000
```

---

## 🔍 DIAGNÓSTICO (Console do Navegador)

### Listar Bancos IndexedDB
```javascript
indexedDB.databases().then(dbs => {
  console.log('📦 Bancos IndexedDB:');
  dbs.forEach(db => console.log(`  - ${db.name} (v${db.version})`));
});
```

### Listar Caches
```javascript
caches.keys().then(keys => {
  console.log('💾 Caches:');
  keys.forEach(key => console.log(`  - ${key}`));
});
```

### Verificar Service Workers
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('⚙️ Service Workers:');
  regs.forEach(reg => {
    console.log(`  - ${reg.active?.scriptURL}`);
    console.log(`    State: ${reg.active?.state}`);
  });
});
```

### Verificar Storage
```javascript
navigator.storage.estimate().then(usage => {
  const used = (usage.usage / 1024 / 1024).toFixed(2);
  const quota = (usage.quota / 1024 / 1024).toFixed(2);
  const percent = ((usage.usage / usage.quota) * 100).toFixed(2);
  
  console.log('💾 Storage:');
  console.log(`  Usado: ${used} MB`);
  console.log(`  Quota: ${quota} MB`);
  console.log(`  Percentual: ${percent}%`);
});
```

### Verificar Online/Offline
```javascript
console.log('🌐 Status:', navigator.onLine ? 'ONLINE' : 'OFFLINE');

// Monitorar mudanças
window.addEventListener('online', () => console.log('✅ ONLINE'));
window.addEventListener('offline', () => console.log('❌ OFFLINE'));
```

---

## 🗑️ LIMPEZA (Console do Navegador)

### Deletar Banco Específico
```javascript
indexedDB.deleteDatabase('indi_ouro_db_v9');
console.log('✅ Banco v9 deletado');
```

### Deletar TODOS os Bancos
```javascript
indexedDB.databases().then(dbs => {
  dbs.forEach(db => {
    indexedDB.deleteDatabase(db.name);
    console.log(`🗑️ Deletado: ${db.name}`);
  });
});
```

### Deletar Cache Específico
```javascript
caches.delete('rico-ouro-cache-v1');
console.log('✅ Cache v1 deletado');
```

### Deletar TODOS os Caches
```javascript
caches.keys().then(keys => {
  keys.forEach(key => {
    caches.delete(key);
    console.log(`🗑️ Deletado: ${key}`);
  });
});
```

### Limpar LocalStorage
```javascript
localStorage.clear();
console.log('✅ LocalStorage limpo');
```

### Limpar SessionStorage
```javascript
sessionStorage.clear();
console.log('✅ SessionStorage limpo');
```

### RESET COMPLETO
```javascript
// Deletar tudo
localStorage.clear();
sessionStorage.clear();

caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

indexedDB.databases().then(dbs => {
  dbs.forEach(db => indexedDB.deleteDatabase(db.name));
});

console.log('🔥 RESET COMPLETO EXECUTADO');
console.log('⚠️ Recarregue a página: Ctrl+Shift+R');
```

---

## 🔧 UTILITÁRIOS DO PROJETO

### Reset Robusto
```javascript
import { resetIndexedDB, resetAllDatabases } from '@/db/utils/reset-indexeddb';

// Reset de um banco específico
await resetIndexedDB({
  dbName: 'indi_ouro_db_v9',
  clearLocalStorage: true,
  clearSessionStorage: true,
  invalidateSWCache: true,
  timeout: 10000
});

// Reset de TODOS os bancos
await resetAllDatabases();
```

### Backup e Migração
```javascript
import { 
  backupBeforeMigration, 
  migrateFromOldVersion,
  exportToJSON,
  downloadBackup
} from '@/db/utils/migrations';

// Criar backup
await backupBeforeMigration('indi_ouro_db_v9');

// Migrar dados
const result = await migrateFromOldVersion('indi_ouro_db_v9', 'indi_ouro_db_v10');
console.log('Migração:', result);

// Export para JSON
const json = await exportToJSON('indi_ouro_db_v10');
downloadBackup('indi_ouro_db_v10', json);
```

---

## 🔍 DEBUGGING

### Monitorar Criação do DB
```javascript
// Adicione no console ANTES de recarregar
const originalOpen = indexedDB.open;
indexedDB.open = function(...args) {
  console.log('🔍 IndexedDB.open:', args[0], 'version:', args[1]);
  return originalOpen.apply(this, args);
};
```

### Monitorar Fetch do Service Worker
```javascript
// No console
navigator.serviceWorker.addEventListener('message', event => {
  console.log('📨 SW Message:', event.data);
});
```

### Logs do RxDB
```javascript
// No código (src/db/client.ts já tem isso)
import { addRxPlugin } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';

if (process.env.NODE_ENV === 'development') {
  addRxPlugin(RxDBDevModePlugin);
}
```

---

## 🆘 TROUBLESHOOTING

### DB9 Ainda Aparece
```javascript
// 1. Reset completo
await resetAllDatabases();

// 2. Limpar tudo
localStorage.clear();
sessionStorage.clear();
caches.keys().then(keys => keys.forEach(k => caches.delete(k)));

// 3. Desregistrar SW
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});

// 4. Recarregar com cache limpo
// Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
```

### Cache Não Atualiza
```javascript
// Forçar atualização do SW
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => {
    reg.update();
    console.log('🔄 SW atualizado');
  });
});

// Ou desregistrar completamente
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => {
    reg.unregister();
    console.log('🗑️ SW desregistrado');
  });
});
```

### Replicação Não Funciona
```javascript
// Verificar se está online
console.log('Online:', navigator.onLine);

// Verificar Supabase
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌');

// Testar conexão
fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/')
  .then(r => console.log('Supabase:', r.ok ? '✅' : '❌'))
  .catch(e => console.error('Supabase:', e));
```

---

## 📊 MONITORAMENTO

### Performance
```javascript
// Tempo de inicialização
const start = performance.now();
// ... após DB inicializar
const end = performance.now();
console.log(`⏱️ Inicialização: ${(end - start).toFixed(2)}ms`);
```

### Memória
```javascript
if (performance.memory) {
  const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
  const total = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
  console.log(`🧠 Memória: ${used}MB / ${total}MB`);
}
```

### Network
```javascript
// Monitorar requests
const observer = new PerformanceObserver(list => {
  list.getEntries().forEach(entry => {
    if (entry.name.includes('supabase')) {
      console.log(`🌐 ${entry.name}: ${entry.duration.toFixed(2)}ms`);
    }
  });
});
observer.observe({ entryTypes: ['resource'] });
```

---

## 🎯 ATALHOS DO NAVEGADOR

### Chrome DevTools
- **Abrir DevTools**: `F12` ou `Ctrl+Shift+I`
- **Console**: `Ctrl+Shift+J`
- **Application**: `F12` → Tab "Application"
- **Network**: `F12` → Tab "Network"
- **Recarregar sem cache**: `Ctrl+Shift+R`
- **Hard reload**: `Ctrl+F5`

### Limpar Site Data
1. `F12` → Application
2. Storage → Clear site data
3. Marcar tudo
4. Clear site data

---

## 📝 LOGS ÚTEIS

### Formato de Log Padrão
```javascript
console.log('🚀 Iniciando...');
console.log('✅ Sucesso!');
console.log('❌ Erro!');
console.log('⚠️ Aviso!');
console.log('ℹ️ Info');
console.log('🔍 Debug');
console.log('📊 Stats');
console.log('💾 Storage');
console.log('🌐 Network');
console.log('⏱️ Performance');
```

---

**Versão**: v10  
**Última atualização**: 2025-11-28
