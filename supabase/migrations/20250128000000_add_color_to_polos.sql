-- =========================================
-- ADICIONAR CAMPO DE COR AOS POLOS
-- =========================================

-- Adicionar coluna de cor aos polos
ALTER TABLE public.polos 
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3b82f6';

-- Comentário
COMMENT ON COLUMN public.polos.color IS 'Cor hexadecimal para identificação visual do polo';

-- Atualizar polos existentes com cores padrão diferentes
UPDATE public.polos 
SET color = CASE 
  WHEN name ILIKE '%centro%' THEN '#3b82f6'  -- Azul
  WHEN name ILIKE '%norte%' THEN '#ef4444'   -- Vermelho
  WHEN name ILIKE '%sul%' THEN '#10b981'     -- Verde
  WHEN name ILIKE '%leste%' THEN '#f59e0b'  -- Laranja
  WHEN name ILIKE '%oeste%' THEN '#8b5cf6'  -- Roxo
  ELSE '#3b82f6'                             -- Azul padrão
END
WHERE color IS NULL OR color = '#3b82f6';

