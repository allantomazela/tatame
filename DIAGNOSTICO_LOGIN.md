# 🔍 Diagnóstico de login – usuários que já estão no Supabase

Use este guia quando um usuário “já está no Supabase” mas não consegue fazer login.

> **Se o login funcionou mas aparecem erros 500 em `profiles` ou `students`**, siga o guia **[ERRO_500_SUPABASE.md](./ERRO_500_SUPABASE.md)**.

---

## Passo 1: Abrir o SQL Editor no Supabase

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard).
2. Abra o projeto do Tatame.
3. No menu lateral, vá em **SQL Editor** e clique em **New query**.

---

## Passo 2: Rodar o script de diagnóstico

Cole o script abaixo no editor e **substitua `'seu@email.com'`** pelo e-mail do usuário que não está logando. Depois execute (Run). O resultado aparece em forma de tabela.

```sql
-- ============================================
-- DIAGNÓSTICO DE LOGIN – um usuário por e-mail
-- Substitua 'seu@email.com' só na linha abaixo
-- ============================================
WITH vars AS (SELECT 'seu@email.com'::TEXT AS email)  -- << ALTERE AQUI
SELECT
  v.email AS "E-mail consultado",
  CASE WHEN u.id IS NOT NULL THEN 'SIM' ELSE 'NÃO' END AS "Existe em auth.users?",
  CASE WHEN u.email_confirmed_at IS NOT NULL THEN 'SIM' ELSE 'NÃO' END AS "E-mail confirmado?",
  CASE WHEN p.id IS NOT NULL THEN 'SIM' ELSE 'NÃO' END AS "Existe em public.profiles?",
  CASE
    WHEN u.id IS NULL THEN 'Criar usuário pelo cadastro da aplicação ou em Auth → Users no Supabase.'
    WHEN u.email_confirmed_at IS NULL THEN 'Rodar script do Passo 3 (Confirmar e-mail).'
    WHEN p.id IS NULL THEN 'Rodar script do Passo 4 (Criar perfil).'
    ELSE 'Tudo ok. Verifique senha e .env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).'
  END AS "Próximo passo"
FROM vars v
LEFT JOIN auth.users u ON u.email = v.email
LEFT JOIN public.profiles p ON p.id = u.id;
```

**Como ler o resultado:**

| Coluna | Significado |
|--------|-------------|
| **Existe em auth.users?** | SIM = usuário existe no login do Supabase. NÃO = precisa ser criado pelo cadastro ou no painel. |
| **E-mail confirmado?** | SIM = pode logar com senha. NÃO = usar script do Passo 3. |
| **Existe em public.profiles?** | SIM = app consegue carregar nome/tipo. NÃO = usar script do Passo 4. |
| **Próximo passo** | O que fazer em seguida. |

---

## Passo 3: Confirmar o e-mail (se o diagnóstico indicou “E-mail confirmado: NÃO”)

Execute **uma vez** para esse e-mail, ajustando `'seu@email.com'`:

```sql
-- Confirmar e-mail para permitir login por senha
UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW()
WHERE email = 'seu@email.com';
```

Depois peça à pessoa para tentar entrar de novo com **e-mail e senha**.

---

## Passo 4: Criar perfil (se existe em auth.users mas não em profiles)

Use só quando o diagnóstico mostrar **Em auth.users: 1** e **Em public.profiles: 0**. Ajuste e-mail, nome e `user_type`:

```sql
-- Criar perfil a partir do usuário em auth.users
INSERT INTO public.profiles (id, email, full_name, user_type, phone)
SELECT
  id,
  email,
  'Nome do Usuário',   -- << altere se quiser
  'aluno',             -- << 'mestre', 'aluno' ou 'responsavel'
  COALESCE(phone, '')
FROM auth.users
WHERE email = 'seu@email.com'
ON CONFLICT (id) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  user_type = EXCLUDED.user_type,
  updated_at = NOW();
```

---

## Passo 5: Ver detalhes brutos (opcional)

Para inspecionar o que o Supabase tem para esse e-mail, pode rodar:

```sql
-- Troque o e-mail
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at AS auth_created,
  p.full_name,
  p.user_type,
  p.id IS NOT NULL AS tem_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'seu@email.com';
```

- **email_confirmed_at** nulo = usuário não pode logar por “email/senha” até ser confirmado (ou você rodar o script do Passo 3).
- **tem_perfil** false = não há linha em `public.profiles`; aí use o script do Passo 4.

---

## Checklist rápido

| O que verificar | Onde | O que fazer |
|-----------------|------|-------------|
| Usuário existe em Auth? | Diagnóstico: "Em auth.users" | 0 → criar usuário pelo cadastro ou pelo Supabase (Auth → Users). |
| E-mail confirmado? | Diagnóstico: "E-mail confirmado" | NÃO → rodar script do Passo 3. |
| Perfil existe? | Diagnóstico: "Em public.profiles" | 0 → rodar script do Passo 4. |
| App apontando pro projeto certo? | Arquivo `.env` na pasta do projeto | Conferir `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` do mesmo projeto. |

Se depois disso o login ainda falhar, envie o e-mail que você usou no diagnóstico e a mensagem de erro que aparece na tela ao tentar logar (ou um print), para afinarmos o próximo passo.

---

## Verificação via MCP Supabase (Cursor)

Foi feita uma verificação com o MCP do Supabase. Resultado:

### Projetos listados pelo MCP

| Projeto | ID | URL API | Schema |
|--------|-----|---------|--------|
| **Templários Oficial** | `hxncevpbwcearzxrstzj` | https://hxncevpbwcearzxrstzj.supabase.co | Loja – **não é Tatame** |
| **Bodes Sobre Rodas** | `yxzollavjqalahrobtky` | https://yxzollavjqalahrobtky.supabase.co | Motos/comunidade – **não é Tatame** |

### Tatame é um projeto à parte

O **projeto Tatame** no Supabase **não é** nenhum dos acima (nem Templários, nem Bodes, nem os IDs que aparecem em exemplos de código). É um projeto Supabase **separado**, onde estão o schema e os usuários do Tatame (tabelas `students`, `polos`, `graduations`, `messages`, `profiles` com `user_type`, etc.).

### O que o .env precisa ter

Para o login e o app funcionarem, o arquivo **`.env`** na raiz do projeto Tatame deve ter as credenciais **desse** projeto Supabase do Tatame:

1. Abra o [Dashboard do Supabase](https://supabase.com/dashboard) e entre no **projeto do Tatame**.
2. Vá em **Project Settings** → **API**.
3. Copie:
   - **Project URL** → use em `VITE_SUPABASE_URL`
   - **anon public** (em Project API keys) → use em `VITE_SUPABASE_ANON_KEY`
4. No `.env`:
   ```
   VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
   ```
   Substitua pelos valores reais do projeto Tatame.

5. Reinicie o servidor de desenvolvimento (`npm run dev`) depois de alterar o `.env`.

Se o `.env` estiver com URL ou chave de outro projeto (ou de um projeto que não existe), o login falha com erro de rede ou “Invalid login credentials”.
