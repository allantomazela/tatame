-- Adicionar novos campos à tabela classes
ALTER TABLE public.classes 
ADD COLUMN polo_name TEXT,
ADD COLUMN instructor_name TEXT,
ADD COLUMN training_days INTEGER[] DEFAULT '{}',
ADD COLUMN training_schedule JSONB DEFAULT '{}';

-- Comentários para documentar os novos campos
COMMENT ON COLUMN public.classes.polo_name IS 'Nome do polo onde a turma acontece';
COMMENT ON COLUMN public.classes.instructor_name IS 'Nome do professor responsável pela turma';
COMMENT ON COLUMN public.classes.training_days IS 'Array com os dias da semana (0-6) em que há treino';
COMMENT ON COLUMN public.classes.training_schedule IS 'JSON com horários detalhados por dia da semana';

-- Atualizar a função de trigger para incluir os novos campos no updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';