-- =========================================
-- SISTEMA FINANCEIRO COMPLETO
-- =========================================

-- =========================================
-- 1. ADICIONAR CAMPO DE PROJETO SOCIAL NA TABELA PAYMENTS
-- =========================================
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS is_social_project BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.payments.is_social_project IS 'Indica se o pagamento é de um projeto social (gratuito)';

-- =========================================
-- 2. TABELA DE TRANSAÇÕES FINANCEIRAS (RECEITAS E DESPESAS)
-- =========================================
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('revenue', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'pix', 'transfer', 'check', 'other')),
  reference_number TEXT, -- Número de referência (nota fiscal, recibo, etc)
  supplier_payee TEXT, -- Fornecedor ou recebedor
  polo_id UUID REFERENCES public.polos(id) ON DELETE SET NULL, -- Polo relacionado (opcional)
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL, -- Aluno relacionado (opcional, para receitas específicas)
  is_recurring BOOLEAN NOT NULL DEFAULT false, -- Indica se é uma transação recorrente
  recurring_period TEXT CHECK (recurring_period IN ('monthly', 'quarterly', 'yearly')), -- Período de recorrência
  attachment_url TEXT, -- URL de anexo (comprovante, nota fiscal, etc)
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_amount_positive CHECK (amount > 0)
);

COMMENT ON TABLE public.financial_transactions IS 'Transações financeiras gerais (receitas e despesas)';
COMMENT ON COLUMN public.financial_transactions.transaction_type IS 'Tipo: revenue (receita) ou expense (despesa)';
COMMENT ON COLUMN public.financial_transactions.category IS 'Categoria da transação (ex: Aluguel, Material, Mensalidade, Evento, etc)';
COMMENT ON COLUMN public.financial_transactions.is_recurring IS 'Indica se é uma transação recorrente (ex: aluguel mensal)';

-- =========================================
-- 3. TABELA DE CATEGORIAS FINANCEIRAS
-- =========================================
CREATE TABLE IF NOT EXISTS public.financial_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('revenue', 'expense', 'both')),
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.financial_categories IS 'Categorias pré-definidas para receitas e despesas';

-- Inserir categorias padrão
INSERT INTO public.financial_categories (name, type, description) VALUES
  -- Receitas
  ('Mensalidades', 'revenue', 'Receitas de mensalidades dos alunos'),
  ('Eventos', 'revenue', 'Receitas de eventos e competições'),
  ('Venda de Material', 'revenue', 'Receitas de venda de materiais e uniformes'),
  ('Doações', 'revenue', 'Receitas de doações'),
  ('Outras Receitas', 'revenue', 'Outras receitas diversas'),
  -- Despesas
  ('Aluguel', 'expense', 'Despesas com aluguel'),
  ('Material de Treino', 'expense', 'Despesas com material de treino'),
  ('Uniforme', 'expense', 'Despesas com uniformes'),
  ('Equipamentos', 'expense', 'Despesas com equipamentos'),
  ('Manutenção', 'expense', 'Despesas com manutenção'),
  ('Salários', 'expense', 'Despesas com salários'),
  ('Energia Elétrica', 'expense', 'Despesas com energia elétrica'),
  ('Água', 'expense', 'Despesas com água'),
  ('Internet/Telefone', 'expense', 'Despesas com internet e telefone'),
  ('Marketing', 'expense', 'Despesas com marketing e publicidade'),
  ('Eventos', 'expense', 'Despesas com eventos'),
  ('Outras Despesas', 'expense', 'Outras despesas diversas')
ON CONFLICT (name) DO NOTHING;

-- =========================================
-- 4. TRIGGERS PARA UPDATED_AT
-- =========================================
CREATE TRIGGER update_financial_transactions_updated_at 
  BEFORE UPDATE ON public.financial_transactions 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_categories_updated_at 
  BEFORE UPDATE ON public.financial_categories 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- 5. ÍNDICES PARA PERFORMANCE
-- =========================================
CREATE INDEX idx_financial_transactions_type ON public.financial_transactions(transaction_type);
CREATE INDEX idx_financial_transactions_date ON public.financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_category ON public.financial_transactions(category);
CREATE INDEX idx_financial_transactions_polo ON public.financial_transactions(polo_id);
CREATE INDEX idx_financial_transactions_student ON public.financial_transactions(student_id);
CREATE INDEX idx_financial_transactions_recorded_by ON public.financial_transactions(recorded_by);
CREATE INDEX idx_financial_categories_type ON public.financial_categories(type);
CREATE INDEX idx_financial_categories_active ON public.financial_categories(active);

-- =========================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =========================================
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;

-- Políticas para FINANCIAL_TRANSACTIONS
-- Mestres podem gerenciar todas as transações
CREATE POLICY "Mestres can manage all financial transactions" ON public.financial_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

-- Todos podem visualizar transações (para relatórios)
CREATE POLICY "Everyone can view financial transactions" ON public.financial_transactions
  FOR SELECT USING (true);

-- Políticas para FINANCIAL_CATEGORIES
-- Todos podem visualizar categorias ativas
CREATE POLICY "Everyone can view active financial categories" ON public.financial_categories
  FOR SELECT USING (active = true);

-- Mestres podem gerenciar categorias
CREATE POLICY "Mestres can manage financial categories" ON public.financial_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

-- =========================================
-- 7. FUNÇÃO PARA CALCULAR SALDO
-- =========================================
CREATE OR REPLACE FUNCTION public.calculate_financial_balance(
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_revenue NUMERIC,
  total_expense NUMERIC,
  balance NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN transaction_type = 'revenue' THEN amount ELSE 0 END), 0) as total_revenue,
    COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
    COALESCE(SUM(CASE WHEN transaction_type = 'revenue' THEN amount ELSE -amount END), 0) as balance
  FROM public.financial_transactions
  WHERE 
    (start_date IS NULL OR transaction_date >= start_date)
    AND (end_date IS NULL OR transaction_date <= end_date);
END;
$$;

COMMENT ON FUNCTION public.calculate_financial_balance IS 'Calcula o saldo financeiro (receitas - despesas) para um período';

