-- =============================================
-- ZAPDATA - SQL PARA CONFIGURAR NO SUPABASE
-- =============================================
-- Execute este SQL no SQL Editor do Supabase
-- (https://supabase.com/dashboard/project/_/sql/new)

-- 1. Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de métricas
CREATE TABLE IF NOT EXISTS product_metrics (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  investido NUMERIC(10,2) DEFAULT 0,
  leads INTEGER DEFAULT 0,
  qnt_pix INTEGER DEFAULT 0,
  pix_total NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, metric_date)
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_product_id ON product_metrics(product_id);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON product_metrics(metric_date);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_metrics ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de segurança para PRODUCTS
-- Usuário pode ver apenas seus produtos
CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

-- Usuário pode inserir seus produtos
CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuário pode atualizar seus produtos
CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuário pode deletar seus produtos
CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Políticas de segurança para PRODUCT_METRICS
-- Usuário pode ver métricas dos seus produtos
CREATE POLICY "Users can view metrics of own products"
  ON product_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_metrics.product_id
      AND products.user_id = auth.uid()
    )
  );

-- Usuário pode inserir métricas nos seus produtos
CREATE POLICY "Users can insert metrics in own products"
  ON product_metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_metrics.product_id
      AND products.user_id = auth.uid()
    )
  );

-- Usuário pode atualizar métricas dos seus produtos
CREATE POLICY "Users can update metrics of own products"
  ON product_metrics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_metrics.product_id
      AND products.user_id = auth.uid()
    )
  );

-- Usuário pode deletar métricas dos seus produtos
CREATE POLICY "Users can delete metrics of own products"
  ON product_metrics FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_metrics.product_id
      AND products.user_id = auth.uid()
    )
  );

-- 7. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para atualizar updated_at
CREATE TRIGGER update_product_metrics_updated_at
  BEFORE UPDATE ON product_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PRONTO! Agora você pode usar o ZapData
-- =============================================
