# 🎯 Como Criar Usuário Mestre - Guia Rápido

## ✅ Método Mais Simples (Recomendado)

A forma mais fácil de criar um usuário mestre é usar o próprio formulário de cadastro da aplicação:

### Passos:

1. **Acesse a aplicação:**
   ```
   http://localhost:8080/login
   ```

2. **Clique na aba "Cadastrar"**

3. **Preencha o formulário:**
   - **Nome Completo**: `Administrador` (ou o nome que desejar)
   - **Email**: `admin@tatame.com` (ou o email que desejar)
   - **Telefone**: (opcional)
   - **Tipo de Usuário**: Selecione **"Mestre"** ⭐
   - **Senha**: `SenhaSegura123!` (ou a senha que desejar - mínimo 6 caracteres)

4. **Clique em "Cadastrar"**

5. **Confirme o email:**
   - Verifique a caixa de entrada do email informado
   - Clique no link de confirmação
   - Ou use o script SQL abaixo para confirmar sem email

6. **Faça login** com as credenciais criadas

7. **Pronto!** Você terá acesso completo como mestre

---

## 🔧 Método Alternativo: Script SQL

Se preferir criar via SQL ou se o email não foi confirmado:

### Passo 1: Criar pelo formulário (mesmo processo acima)

### Passo 2: Confirmar email e garantir tipo mestre via SQL

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Execute este script (altere o email se necessário):

```sql
-- Confirmar email do usuário
UPDATE auth.users 
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW()
WHERE email = 'admin@tatame.com';

-- Garantir que o perfil é do tipo mestre
DO $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = 'admin@tatame.com';
  
  IF user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, user_type, phone)
    VALUES (
      user_id,
      'admin@tatame.com',
      'Administrador',
      'mestre',
      ''
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      user_type = 'mestre',
      updated_at = NOW();
  END IF;
END $$;

-- Verificar
SELECT 
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.user_type
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'admin@tatame.com';
```

---

## 📋 Credenciais Sugeridas

Você pode usar estas credenciais ou criar as suas próprias:

- **Email**: `admin@tatame.com`
- **Senha**: `SenhaSegura123!`
- **Nome**: `Administrador`
- **Tipo**: `Mestre`

⚠️ **IMPORTANTE**: Altere essas credenciais antes de usar em produção!

---

## ✅ Verificar se Funcionou

Após criar o usuário e fazer login, você deve ver:

- ✅ Menu lateral com todas as opções de mestre
- ✅ Acesso à página "Alunos"
- ✅ Acesso à página "Graduações"
- ✅ Acesso à página "Relatórios"
- ✅ Acesso à página "Minhas Turmas"

Se não aparecer essas opções, verifique se o tipo de usuário está como "mestre" no perfil.

---

## 🆘 Problemas Comuns

### Email não confirmado
- Use o script SQL acima para confirmar manualmente
- Ou verifique a caixa de spam do email

### Tipo de usuário não é mestre
- Execute a parte do script SQL que atualiza o `user_type`
- Ou edite diretamente na tabela `profiles` no Supabase

### Não consigo fazer login
- Verifique se o email está correto
- Verifique se a senha está correta
- Use "Esqueci minha senha" se necessário

---

## 📝 Próximos Passos

Após criar o usuário mestre:

1. ✅ Faça login
2. ✅ Explore o Dashboard
3. ✅ Crie alguns alunos de teste
4. ✅ Configure turmas
5. ✅ Teste as funcionalidades

---

**Dúvidas?** Consulte os arquivos em `scripts/` para mais opções.

