# Guia de Sincronização com Supabase

## ✅ O que já está configurado

1. **Variáveis de ambiente**: Você já adicionou `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. **Serviço de sincronização**: O `SyncManager` foi adicionado ao layout e inicia automaticamente
3. **Validações**: O código verifica se o Supabase está configurado antes de sincronizar

## 📋 Próximos passos

### 1. Criar as tabelas no Supabase

Acesse o SQL Editor no seu projeto Supabase e execute os seguintes comandos:

#### Tabela `animal_data`:

```sql
-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela animal_data
CREATE TABLE IF NOT EXISTS animal_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uuid TEXT UNIQUE NOT NULL,
  animal_json JSONB NOT NULL,
  pai_json JSONB,
  mae_json JSONB,
  avo_materno_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_animal_data_uuid ON animal_data(uuid);
CREATE INDEX IF NOT EXISTS idx_animal_data_updated_at ON animal_data(updated_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_animal_data_updated_at BEFORE UPDATE
    ON animal_data FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### Tabela `vaccines`:

```sql
-- Criar tabela vaccines
CREATE TABLE IF NOT EXISTS vaccines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uuid TEXT UNIQUE NOT NULL,
  vaccine_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_vaccines_uuid ON vaccines(uuid);
CREATE INDEX IF NOT EXISTS idx_vaccines_name ON vaccines(vaccine_name);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_vaccines_updated_at BEFORE UPDATE
    ON vaccines FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### Tabela `farms`:

```sql
-- Criar tabela farms
CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uuid TEXT UNIQUE NOT NULL,
  farm_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_farms_uuid ON farms(uuid);
CREATE INDEX IF NOT EXISTS idx_farms_name ON farms(farm_name);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE
    ON farms FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. Configurar Row Level Security (RLS)

Para permitir que o app sincronize dados sem autenticação, você precisa configurar as políticas RLS:

```sql
-- Habilitar RLS
ALTER TABLE animal_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

-- Políticas para animal_data
CREATE POLICY "Permitir leitura pública" ON animal_data
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pública" ON animal_data
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização pública" ON animal_data
  FOR UPDATE USING (true);

CREATE POLICY "Permitir deleção pública" ON animal_data
  FOR DELETE USING (true);

-- Políticas para vaccines
CREATE POLICY "Permitir leitura pública" ON vaccines
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pública" ON vaccines
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização pública" ON vaccines
  FOR UPDATE USING (true);

CREATE POLICY "Permitir deleção pública" ON vaccines
  FOR DELETE USING (true);

-- Políticas para farms
CREATE POLICY "Permitir leitura pública" ON farms
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pública" ON farms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização pública" ON farms
  FOR UPDATE USING (true);

CREATE POLICY "Permitir deleção pública" ON farms
  FOR DELETE USING (true);
```

**⚠️ IMPORTANTE**: As políticas acima permitem acesso público completo. Para produção, considere implementar autenticação e políticas mais restritivas.

### 3. Reiniciar o servidor de desenvolvimento

Após configurar as tabelas no Supabase, reinicie o servidor:

```bash
npm run dev
```

### 4. Verificar a sincronização

1. Abra o console do navegador (F12)
2. Você deve ver mensagens como:

   - `✅ Sincronização automática iniciada`
   - `🔄 Iniciando sincronização...`
   - `✅ Sincronização concluída`

3. Os dados do SQLite local serão sincronizados automaticamente com o Supabase a cada 30 segundos quando online

## 🔄 Como funciona a sincronização

### Fluxo de sincronização:

1. **Local → Remoto**:

   - Quando você cria/atualiza/deleta dados localmente, eles são adicionados à fila de sincronização
   - O serviço de sincronização envia esses dados para o Supabase quando online

2. **Remoto → Local**:

   - O serviço baixa dados do Supabase que foram atualizados mais recentemente
   - Dados locais são atualizados se a versão remota for mais recente (last-write-wins)

3. **Resolução de conflitos**:
   - Usa `updated_at` para determinar qual versão é mais recente
   - A versão mais recente prevalece

### Sincronização automática:

- Sincroniza automaticamente a cada 30 segundos quando online
- Sincroniza imediatamente quando a conexão é restabelecida
- Funciona em background sem interferir no uso do app

## 🐛 Troubleshooting

### Sincronização não está funcionando:

1. **Verifique as variáveis de ambiente**:

   - Certifique-se de que `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão definidas
   - Reinicie o servidor após adicionar as variáveis

2. **Verifique o console do navegador**:

   - Procure por mensagens de erro
   - Verifique se há avisos sobre Supabase não configurado

3. **Verifique as políticas RLS**:

   - Certifique-se de que as políticas RLS estão configuradas corretamente
   - Verifique se as tabelas existem no Supabase

4. **Verifique a conexão**:
   - Certifique-se de que está online
   - Verifique se consegue acessar o Supabase

### Erro: "Supabase não está configurado"

- Verifique se as variáveis de ambiente estão definidas no arquivo `.env.local`
- Certifique-se de que as variáveis começam com `NEXT_PUBLIC_`
- Reinicie o servidor de desenvolvimento

### Erro: "Row Level Security policy violation"

- Verifique se as políticas RLS estão configuradas corretamente
- Certifique-se de que as políticas permitem as operações necessárias (SELECT, INSERT, UPDATE, DELETE)

## 📊 Monitoramento

Para ver o status da sincronização:

1. Abra o console do navegador
2. Procure por mensagens de sincronização
3. Verifique a fila de sincronização no console (se houver itens aguardando)

## 🔒 Segurança (Produção)

Para produção, considere:

1. **Implementar autenticação**: Use autenticação do Supabase para identificar usuários
2. **Políticas RLS mais restritivas**: Configure políticas baseadas em usuário
3. **Service Role Key**: Use Service Role Key para operações server-side (nunca exponha no cliente)
4. **Validação de dados**: Adicione validação no Supabase usando triggers ou Edge Functions

## 📝 Notas

- O app funciona **offline-first**: todas as operações funcionam localmente mesmo sem internet
- A sincronização acontece automaticamente em background
- Dados são salvos localmente no `localStorage` como SQLite binário
- A sincronização é bidirecional: dados locais vão para o Supabase e dados do Supabase vêm para o local
