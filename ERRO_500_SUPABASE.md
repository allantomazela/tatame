# Erro 500 ao acessar profiles / students no Supabase

Quando o login funciona mas as requisições a `profiles` ou `students` retornam **500**, o problema costuma ser **RLS**, **schema** ou **tabelas/colunas** no projeto Supabase.

---

## 1. Ver a mensagem real do erro

### No navegador (DevTools)

1. Abra **DevTools** (F12) → aba **Network**.
2. Faça login de novo (ou recarregue a página logada).
3. Clique na requisição que falhou em vermelho (ex.: `profiles?select=*&id=eq....`).
4. Aba **Response** (ou **Preview**): aí vem o JSON do PostgREST com `message`, `details`, `hint`.

Anote o `message` e o `hint` – isso indica a causa.

### No código

Os hooks foram ajustados para logar no console:

- `Profile fetch error:` + `code`, `details`, `hint`
- `Dashboard students error:` + idem

Abra o **Console** (F12 → Console) e veja a linha que aparece ao dar 500.

---

## 2. Conferir tabelas e colunas no projeto Tatame

No **Supabase Dashboard** do projeto do Tatame:

1. **Table Editor** → verifique se existem as tabelas **`profiles`** e **`students`**.
2. Em **`profiles`**, confira se existem colunas como: `id`, `email`, `full_name`, `user_type`, `avatar_url`, `phone`, `created_at`, `updated_at`.
3. Em **`students`**, confira: `id`, `profile_id`, `active`, `created_at`, `monthly_fee`, etc.

Se as tabelas ou colunas forem diferentes das do app (ou de outro template), o 500 pode vir daí.

---

## 3. RLS em `profiles` e `students`

Erro 500 em `profiles` ou `students` muitas vezes é **política RLS** quebrando (subconsulta, coluna inexistente, etc.).

### Ver políticas atuais

No **SQL Editor** do projeto, rode:

```sql
-- Políticas em profiles
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Políticas em students
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'students';
```

### Garantir políticas que funcionem com o Tatame

O Tatame espera algo nesse estilo (ajuste se o seu schema for outro):

- **profiles**: o usuário pode fazer SELECT no **próprio** perfil (`auth.uid() = id`).
- **students**: depende das suas regras (ex.: mestres veem todos; alunos só o próprio; etc.).

Exemplo mínimo para **profiles** – usuário só vê o próprio perfil:

```sql
-- Exemplo: só leitura do próprio perfil (evita 500 por política complexa)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
```

Se você usar políticas que referenciam `user_type`, `students`, etc., todas essas tabelas/colunas precisam existir e estar coerentes com o schema do Tatame.

---

## 4. Migrations do Tatame

Se o projeto foi criado “vazio” ou com outro schema:

1. Confirme que as **migrations** do Tatame foram aplicadas **nesse** projeto (pasta `supabase/migrations` deste repositório).
2. No Supabase: **Database** → **Migrations** (ou via CLI `supabase db push` / `supabase link` + `supabase db push`).

Sem as migrations certas, `profiles` e `students` podem não existir ou não ter a estrutura que o app usa.

---

## 5. Testar direto no SQL (sem RLS)

Para isolar se o problema é RLS ou estrutura, rode no **SQL Editor** **como superuser** (sem RLS):

```sql
-- Troque pelo id do usuário que está logado (veja no console/Network o id da requisição)
SELECT * FROM public.profiles WHERE id = 'b52352e5-a4f1-4abd-b56c-494c8ee5d6fe';
SELECT id, active, created_at, monthly_fee FROM public.students LIMIT 5;
```

- Se **der certo**: o 500 provavelmente é **RLS** ou **permissão** (roles). Ajuste as políticas.
- Se **der erro**: o problema é **tabela/coluna** ou **schema**. Ajuste as migrations / estrutura das tabelas.

---

## Resumo rápido

| Onde olhar | O que ver |
|------------|-----------|
| Network → Response da requisição 500 | `message`, `hint` do PostgREST |
| Console do navegador | `Profile fetch error:` / `Dashboard students error:` + `details` / `hint` |
| Table Editor | Existência de `profiles` e `students` e colunas esperadas |
| SQL Editor → `pg_policies` | Políticas em `profiles` e `students` |
| Database → Migrations | Migrations do Tatame aplicadas nesse projeto |

Depois de ver o `message` e o `hint` do 500, use a tabela acima para decidir se o próximo passo é ajustar RLS, migrations ou estrutura das tabelas.

---

## Correção aplicável: RLS em profiles/students (erro 500)

Se o SQL direto `SELECT * FROM profiles WHERE id = '...'` funcionar no **SQL Editor** e o app continuar com 500 em `profiles` ou `students`, é bem provável que seja **RLS** (políticas com subconsultas em `profiles` causando recursão ou falha).

Existe uma migration que corrige isso:

**Arquivo:** `supabase/migrations/20260128000001_fix_profiles_rls_500.sql`

Ela:

1. Cria a função `current_user_is_mestre()` (SECURITY DEFINER) para saber se o usuário é mestre sem disparar RLS em `profiles`.
2. Cria a função `profile_ids_for_responsavel()` (SECURITY DEFINER) para responsáveis verem perfis dos alunos vinculados.
3. Ajusta as políticas de **SELECT** em `profiles` para usar essas funções em vez de subconsultas diretas.
4. Ajusta a política **"Mestres can manage students"** em `students` para usar `current_user_is_mestre()`.

### Como aplicar

1. Abra o **Supabase Dashboard** do projeto do Tatame.
2. Vá em **SQL Editor** → **New query**.
3. Copie todo o conteúdo de `supabase/migrations/20260128000001_fix_profiles_rls_500.sql`.
4. Cole no editor e execute (**Run**).
5. Recarregue o app e teste de novo o login e o carregamento do perfil/dashboard.
