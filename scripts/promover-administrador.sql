-- =========================================
-- PROMOVER PERFIL A ADMINISTRADOR
-- Execute no SQL Editor do Supabase Dashboard
-- =========================================
--
-- INSTRUÇÕES:
-- 1. Altere abaixo o email do perfil que será administrador
-- 2. Acesse: Supabase Dashboard → SQL Editor
-- 3. Cole este script e clique em Run
-- 4. O usuário com esse email passará a ter acesso de administrador
--    (mesmo menu e rotas do mestre; vê todos os polos por padrão)
--
-- PRÉ-REQUISITO: A migration 20260131000001_add_administrador_user_type.sql
-- deve estar aplicada (supabase db push ou aplicada no projeto remoto).
-- =========================================

-- CONFIGURE O EMAIL DO PERFIL A PROMOVER
DO $$
DECLARE
  email_do_perfil TEXT := 'admin@tatame.com';  -- altere para o email desejado
  linhas_afetadas INT;
BEGIN
  UPDATE public.profiles
  SET user_type = 'administrador', updated_at = NOW()
  WHERE email = email_do_perfil;

  GET DIAGNOSTICS linhas_afetadas = ROW_COUNT;

  IF linhas_afetadas > 0 THEN
    RAISE NOTICE 'Perfil com email % foi definido como administrador.', email_do_perfil;
  ELSE
    RAISE NOTICE 'Nenhum perfil encontrado com o email %. Verifique o email e se o usuário já existe em public.profiles.', email_do_perfil;
  END IF;
END $$;

-- Verificação (opcional): listar o perfil atualizado
-- SELECT id, email, full_name, user_type, updated_at
-- FROM public.profiles
-- WHERE email = 'admin@tatame.com';
