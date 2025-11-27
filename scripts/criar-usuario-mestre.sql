-- =========================================
-- SCRIPT PARA CRIAR USUÁRIO MESTRE
-- Execute este script no SQL Editor do Supabase
-- =========================================

-- IMPORTANTE: Substitua os valores abaixo antes de executar:
-- - 'admin@tatame.com' pelo email desejado
-- - 'SenhaSegura123!' pela senha desejada (mínimo 6 caracteres)
-- - 'Administrador' pelo nome completo desejado

-- =========================================
-- MÉTODO RECOMENDADO: Usar a função do Supabase
-- =========================================

-- Este método usa a função auth.users() que é mais segura
-- Mas como não temos acesso direto, vamos usar o método alternativo abaixo

-- =========================================
-- MÉTODO ALTERNATIVO: Criar via API ou Formulário
-- =========================================

-- A forma mais simples é usar o próprio formulário de cadastro da aplicação:
-- 1. Acesse: http://localhost:8080/login
-- 2. Clique na aba "Cadastrar"
-- 3. Preencha:
--    - Nome Completo: Administrador
--    - Email: admin@tatame.com
--    - Telefone: (opcional)
--    - Tipo de Usuário: Mestre
--    - Senha: SenhaSegura123!
-- 4. Clique em "Cadastrar"
-- 5. Verifique seu email para confirmar (ou use o script abaixo para confirmar)

-- =========================================
-- SCRIPT PARA CONFIRMAR EMAIL E GARANTIR TIPO MESTRE
-- Execute APÓS criar o usuário pelo formulário
-- =========================================

-- 1. Confirmar email do usuário (se necessário)
UPDATE auth.users 
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW()
WHERE email = 'admin@tatame.com'; -- ALTERE AQUI: Email do administrador

-- 2. Garantir que o perfil existe e é do tipo mestre
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Buscar o ID do usuário
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = 'admin@tatame.com'; -- ALTERE AQUI: Mesmo email
  
  IF user_id IS NOT NULL THEN
    -- Criar ou atualizar perfil para garantir que é mestre
    INSERT INTO public.profiles (id, email, full_name, user_type, phone)
    VALUES (
      user_id,
      'admin@tatame.com', -- ALTERE AQUI: Mesmo email
      'Administrador', -- ALTERE AQUI: Mesmo nome
      'mestre',
      ''
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      user_type = 'mestre',
      full_name = COALESCE(EXCLUDED.full_name, 'Administrador'), -- ALTERE AQUI: Mesmo nome
      updated_at = NOW();
    
    RAISE NOTICE 'Perfil atualizado para mestre com sucesso!';
  ELSE
    RAISE NOTICE 'Usuário não encontrado. Crie o usuário pelo formulário primeiro.';
  END IF;
END $$;

-- 3. Verificar se o usuário foi configurado corretamente
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.user_type,
  p.created_at,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
    ELSE '⚠️ Email não confirmado'
  END as status_email,
  CASE 
    WHEN p.user_type = 'mestre' THEN '✅ Tipo mestre configurado'
    ELSE '⚠️ Tipo não é mestre'
  END as status_tipo
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'admin@tatame.com'; -- ALTERE AQUI: Mesmo email

-- =========================================
-- INSTRUÇÕES COMPLETAS:
-- =========================================
-- 
-- OPÇÃO 1 (Mais Simples):
-- 1. Acesse: http://localhost:8080/login
-- 2. Clique em "Cadastrar"
-- 3. Preencha o formulário selecionando "Mestre" como tipo
-- 4. Execute este script para confirmar email e garantir tipo mestre
-- 
-- OPÇÃO 2 (Via SQL - Requer Service Role Key):
-- Use o script Node.js: node scripts/criar-usuario-mestre.js
-- 
-- =========================================

