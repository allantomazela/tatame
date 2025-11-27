-- =========================================
-- SCRIPT PARA CRIAR USUÁRIO MESTRE DIRETAMENTE
-- Execute este script no SQL Editor do Supabase Dashboard
-- =========================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard
-- 2. Selecione seu projeto
-- 3. Vá em "SQL Editor" (menu lateral)
-- 4. Cole este script completo
-- 5. Clique em "Run" ou pressione Ctrl+Enter
-- 6. Use as credenciais criadas para fazer login
--
-- =========================================
-- CONFIGURAÇÕES - ALTERE SE DESEJAR
-- =========================================

DO $$
DECLARE
  user_email TEXT := 'admin@tatame.com';
  user_password TEXT := 'SenhaSegura123!';
  user_name TEXT := 'Administrador';
  new_user_id UUID;
BEGIN
  -- Verificar se o usuário já existe
  SELECT id INTO new_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF new_user_id IS NULL THEN
    -- Criar novo usuário
    new_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      user_email,
      crypt(user_password, gen_salt('bf')),
      NOW(), -- Email já confirmado
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object(
        'full_name', user_name,
        'user_type', 'mestre',
        'phone', ''
      ),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    
    RAISE NOTICE '✅ Usuário criado com sucesso! ID: %', new_user_id;
  ELSE
    RAISE NOTICE '⚠️  Usuário já existe. ID: %', new_user_id;
  END IF;
  
  -- Criar ou atualizar perfil
  INSERT INTO public.profiles (id, email, full_name, user_type, phone)
  VALUES (
    new_user_id,
    user_email,
    user_name,
    'mestre',
    ''
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    user_type = 'mestre',
    full_name = user_name,
    email = user_email,
    updated_at = NOW();
  
  RAISE NOTICE '✅ Perfil configurado como mestre!';
  
  -- Confirmar email se ainda não estiver confirmado
  UPDATE auth.users 
  SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
  WHERE id = new_user_id;
  
  RAISE NOTICE '✅ Email confirmado!';
  
END $$;

-- =========================================
-- VERIFICAR SE FOI CRIADO CORRETAMENTE
-- =========================================

SELECT 
  u.id,
  u.email,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
    ELSE '❌ Não confirmado'
  END as status_email,
  p.full_name,
  p.user_type,
  CASE 
    WHEN p.user_type = 'mestre' THEN '✅ Mestre'
    ELSE '❌ Não é mestre'
  END as status_tipo,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'admin@tatame.com';

-- =========================================
-- CREDENCIAIS DE ACESSO:
-- =========================================
-- Email: admin@tatame.com
-- Senha: SenhaSegura123!
-- Tipo: Mestre
-- 
-- Acesse: http://localhost:8080/login
-- =========================================

