# Guia passo a passo: Rodar a migration RLS e criar o bucket avatars

Use este guia no **projeto Supabase do Tatame** (ex.: `pdjiimzpswmeqvixcmfj` ou o projeto que está no seu `.env`).

---

## Parte 1 – Rodar a migration de RLS

A migration remove a recursão infinita nas políticas de `profiles` e `students`, corrigindo os erros 500.

### Passo 1.1 – Abrir o Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard) e faça login.
2. Clique no **projeto do Tatame** (o que tem a URL usada no seu `.env`).

### Passo 1.2 – Abrir o SQL Editor

1. No menu lateral, clique em **SQL Editor** (ícone de terminal/código).
2. Clique em **New query** para abrir uma nova consulta.

### Passo 1.3 – Colar e executar a migration

1. Abra no seu projeto o arquivo:
   ```
   supabase/migrations/20260128000002_fix_rls_recursion_complete.sql
   ```
2. Selecione **todo o conteúdo** do arquivo (Ctrl+A) e copie (Ctrl+C).
3. No SQL Editor do Supabase, **cole** o conteúdo (Ctrl+V).
4. Clique em **Run** (ou pressione Ctrl+Enter).

### Passo 1.4 – Conferir o resultado

- Se aparecer **“Success. No rows returned”** (ou algo equivalente), a migration rodou com sucesso.
- Se aparecer erro em vermelho, copie a mensagem completa e confira:
  - Se as tabelas `profiles` e `students` existem.
  - Se os nomes das políticas antigas são exatamente os que o script está tentando dropar (o script usa `DROP POLICY IF EXISTS`, então políticas com outros nomes não impedem a execução).

Depois disso, teste de novo no app: login, carregamento do perfil e dashboard (students). Os 500 em `profiles` e `students` devem ter parado.

---

## Parte 2 – Criar o bucket `avatars` no Storage

O app envia fotos de perfil para o bucket **`avatars`**. Se o bucket não existir, o upload falha.

### Passo 2.1 – Ir para o Storage

1. No mesmo projeto do Tatame, no menu lateral clique em **Storage** (ícone de pasta/arquivos).

### Passo 2.2 – Criar o bucket

1. Clique em **New bucket**.
2. Preencha:
   - **Name:** `avatars` (exatamente assim, em minúsculo).
   - **Public bucket:** marque **sim** (ativado), para que as URLs geradas pelo app funcionem sem autenticação na leitura.
3. Clique em **Create bucket**.

### Passo 2.3 – Políticas do bucket (quem pode subir e ler)

Com o bucket público, as URLs de leitura já funcionam. Falta permitir que **usuários logados** façam upload apenas na pasta do próprio usuário (`{user_id}/`).

**Opção A – Pelo SQL Editor (recomendado):**

1. Vá em **SQL Editor** → **New query**.
2. Cole e execute o bloco abaixo (troque nada se o bucket se chama `avatars`):

```sql
-- Remove políticas antigas (se existirem) para poder rodar o script de novo sem erro
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;

-- Permite usuário logado fazer upload só na pasta com o próprio id
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
);

-- Permite leitura pública (redundante se o bucket já é público, mas não atrapalha)
CREATE POLICY "Public read avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

3. Clique em **Run**. Se aparecer “Success”, as políticas foram criadas (ou atualizadas). Pode rodar de novo sem erro: o script primeiro remove as antigas e depois recria.

**Opção B – Pela interface Storage:**

1. No Storage, clique no bucket **avatars**.
2. Abra **Policies** (ou ícone de escudo ao lado do bucket).
3. **New policy** → **For full customization**.
4. **Política de upload:** nome `Users can upload own avatar`, operação **INSERT**, role **authenticated**, em **WITH CHECK** use:
   `(bucket_id = 'avatars' AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub'))`
5. **Política de leitura (opcional se bucket público):** nome `Public read avatars`, operação **SELECT**, role **public**, em **USING** use: `(bucket_id = 'avatars')`.
6. Salve as políticas.

### Passo 2.4 – Conferir

1. No app, vá em **Configurações** e escolha uma foto de perfil (até 2 MB, JPEG/PNG/WebP/GIF).
2. Clique em **Enviar** ou em **Salvar Alterações**.
3. A foto deve aparecer no perfil e, no Storage do Supabase, em **avatars** → pasta com o `user_id` → arquivo `avatar-{timestamp}.{ext}`.

---

## Resumo rápido

| O quê | Onde | Ação |
|-------|------|------|
| Migration RLS | Supabase → **SQL Editor** → New query | Colar o conteúdo de `20260128000002_fix_rls_recursion_complete.sql` e clicar **Run** |
| Bucket avatars | Supabase → **Storage** → New bucket | Nome: `avatars`, **Public bucket** = sim |
| Permissão de upload | Storage → bucket **avatars** → **Policies** | Política INSERT para `authenticated` restrita à pasta `auth.uid()/` |

---

## Se der erro

- **Migration:** anote a mensagem de erro completa e, se quiser, abra uma issue ou mande para alguém que mexa no projeto com o trecho do SQL que falhou.
- **Storage “Bucket not found”:** confirme que o nome do bucket é exatamente `avatars` (minúsculo) e que você está no mesmo projeto em que o app está conectado (o do `.env`).
- **Upload negado (403):** revise as políticas do bucket `avatars` (INSERT para `authenticated` na pasta do usuário).

Depois de rodar a migration e criar o bucket, faça um novo teste de login, perfil e fotos no app.
