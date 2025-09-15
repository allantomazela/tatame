-- Remover a constraint de foreign key que está causando o problema
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Permitir que o campo id seja null inicialmente para perfis de alunos que não são usuários do sistema
ALTER TABLE public.profiles ALTER COLUMN id DROP NOT NULL;

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id) WHERE id IS NOT NULL;