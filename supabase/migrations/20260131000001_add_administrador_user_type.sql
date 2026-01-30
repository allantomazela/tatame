-- Adiciona o tipo de usuário 'administrador' ao CHECK de profiles.user_type.
-- Administradores têm as mesmas permissões de mestre no app (rotas e menu).

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_user_type_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_type_check
  CHECK (user_type IN ('mestre', 'aluno', 'responsavel', 'administrador'));

COMMENT ON COLUMN public.profiles.user_type IS 'Tipos: mestre, aluno, responsavel, administrador. Administrador tem acesso de gestão como mestre.';
