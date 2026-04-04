-- Crear tabla accounts
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initial_balance DECIMAL NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Crear índice en user_id para mejor rendimiento
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts(user_id);

-- Crear tabla trades
CREATE TABLE IF NOT EXISTS trades (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  result TEXT CHECK (result IN ('TP', 'SL', 'BE')),
  profit DECIMAL NOT NULL,
  instrument TEXT NOT NULL,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Crear índices en trades para mejor rendimiento
CREATE INDEX IF NOT EXISTS trades_user_id_idx ON trades(user_id);
CREATE INDEX IF NOT EXISTS trades_account_id_idx ON trades(account_id);
CREATE INDEX IF NOT EXISTS trades_date_idx ON trades(date);

-- Habilitar Row Level Security (RLS)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para accounts
CREATE POLICY "Users can view their own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Crear políticas RLS para trades
CREATE POLICY "Users can view their own trades"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades"
  ON trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades"
  ON trades FOR DELETE
  USING (auth.uid() = user_id);
