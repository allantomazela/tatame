-- Remover a constraint de foreign key que está causando o problema com perfis de estudantes
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;