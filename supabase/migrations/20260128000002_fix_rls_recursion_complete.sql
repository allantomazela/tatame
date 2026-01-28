-- =============================================
-- Elimina recursão infinita entre profiles e students
-- Toda a lógica fica em funções SECURITY DEFINER que
-- rodam com owner (postgres) e não disparam RLS.
-- =============================================

-- 1) Função única: usuário pode ver o perfil X?
--    (próprio perfil, ou mestre, ou responsável dos alunos desse perfil)
CREATE OR REPLACE FUNCTION public.can_view_profile(target_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF target_id IS NULL THEN
    RETURN false;
  END IF;
  -- próprio perfil
  IF target_id = auth.uid() THEN
    RETURN true;
  END IF;
  -- mestre vê todos
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'mestre') THEN
    RETURN true;
  END IF;
  -- responsável vê perfis dos alunos vinculados
  IF EXISTS (
    SELECT 1 FROM public.students
    WHERE profile_id = target_id AND responsible_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

-- 2) Função: usuário é mestre? (para políticas em students e outras tabelas)
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

-- 3) PROFILES: uma única política de SELECT usando a função
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Mestres can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Responsaveis can view linked profiles" ON public.profiles;

CREATE POLICY "Profiles select via can_view_profile" ON public.profiles
  FOR SELECT USING (public.can_view_profile(id));

-- 4) PROFILES: política de UPDATE (próprio perfil) – sem subquery em outras tabelas
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Mestres can update profiles" ON public.profiles;

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Mestres can update profiles" ON public.profiles
  FOR UPDATE USING (public.current_user_is_mestre());

-- 5) STUDENTS: políticas que não tocam em profiles via subquery
DROP POLICY IF EXISTS "Mestres can manage students" ON public.students;

CREATE POLICY "Mestres can manage students" ON public.students
  FOR ALL USING (public.current_user_is_mestre());

-- Manter as que já são simples (sem subquery em profiles)
-- "Students can view own record" e "Responsaveis can view their students" permanecem iguais

COMMENT ON FUNCTION public.can_view_profile(uuid) IS 'Usado na política SELECT de profiles para evitar recursão RLS';
COMMENT ON FUNCTION public.current_user_is_mestre() IS 'Usado nas políticas de students e outras tabelas para checar mestre';
