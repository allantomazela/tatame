-- =============================================
-- Corrige 500 em SELECT em profiles (RLS)
-- As políticas que usam subquery em profiles/students
-- podem falhar na API; esta migration usa funções
-- SECURITY DEFINER para evitar recursão/erro.
-- =============================================

-- Função auxiliar: usuário atual é mestre? (roda sem RLS para evitar loop)
CREATE OR REPLACE FUNCTION public.current_user_is_mestre()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'mestre'
  );
$$;

-- Função auxiliar: ids de perfis que o responsável pode ver (alunos vinculados)
CREATE OR REPLACE FUNCTION public.profile_ids_for_responsavel()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT profile_id FROM public.students WHERE responsible_id = auth.uid();
$$;

-- Remover políticas de SELECT atuais em profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Mestres can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Responsaveis can view linked profiles" ON public.profiles;

-- Recriar SELECT: próprio perfil OU mestre OU responsável vendo perfis dos seus alunos
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR public.current_user_is_mestre()
    OR id IN (SELECT public.profile_ids_for_responsavel())
  );

-- Comentário para documentar
COMMENT ON FUNCTION public.current_user_is_mestre() IS 'Usado pelas políticas RLS para evitar recursão ao checar se o usuário é mestre';
COMMENT ON FUNCTION public.profile_ids_for_responsavel() IS 'Usado pelas políticas RLS de profiles para responsáveis verem perfis dos alunos vinculados';

-- ---------------------------------------------------------------
-- STUDENTS: usar current_user_is_mestre() em vez de SELECT em profiles
-- (evita que a política de students dispare RLS em profiles e cause 500)
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Mestres can manage students" ON public.students;
CREATE POLICY "Mestres can manage students" ON public.students
  FOR ALL USING (public.current_user_is_mestre());
