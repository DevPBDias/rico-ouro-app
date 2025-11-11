# Configuração do Supabase

## 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Crie uma conta (se não tiver)
3. Crie um novo projeto
4. Anote a URL do projeto e a chave anônima (anon key)

## 2. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env.local`
2. Preencha as variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

## 3. Criar Tabelas no Supabase

Execute os seguintes SQL no SQL Editor do Supabase:

### Tabela animal_data

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

### Tabela vaccines

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

### Tabela farms

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

## 4. Configurar Row Level Security (RLS)

Por padrão, o Supabase bloqueia acesso não autenticado. Para um app offline-first, você pode:

### Opção 1: Permitir acesso público (apenas leitura/escrita, não deletar)

```sql
-- Habilitar RLS
ALTER TABLE animal_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública" ON animal_data
  FOR SELECT USING (true);

-- Política para permitir inserção pública
CREATE POLICY "Permitir inserção pública" ON animal_data
  FOR INSERT WITH CHECK (true);

-- Política para permitir atualização pública
CREATE POLICY "Permitir atualização pública" ON animal_data
  FOR UPDATE USING (true);

-- Política para permitir deleção pública
CREATE POLICY "Permitir deleção pública" ON animal_data
  FOR DELETE USING (true);

-- Mesmas políticas para vaccines
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

### Opção 2: Usar autenticação (recomendado para produção)

1. Configure autenticação no Supabase
2. Use Service Role Key para operações server-side
3. Configure políticas RLS baseadas em usuário

## 5. Testar Conexão

Após configurar, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

O app deve:

- Funcionar offline com SQLite local
- Sincronizar automaticamente quando online
- Mostrar logs de sincronização no console

## Notas

- O app funciona **offline-first**: todas as operações funcionam localmente
- A sincronização acontece automaticamente quando online
- Conflitos são resolvidos usando `updated_at` (last-write-wins)
- Dados são salvos localmente no `localStorage` como SQLite binário
