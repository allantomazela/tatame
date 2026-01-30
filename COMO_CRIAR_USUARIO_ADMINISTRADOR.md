# Como criar ou promover usuário Administrador

O tipo **Administrador** tem o mesmo acesso de gestão que o **Mestre** (Alunos, Graduações, Polos, Financeiro, Relatórios, etc.) e, por padrão, **vê todos os polos** sem precisar alternar “Ver todos os polos”.

## Pré-requisito: migration aplicada

O banco deve aceitar o tipo `administrador` em `profiles.user_type`. Isso é feito pela migration:

- `supabase/migrations/20260131000001_add_administrador_user_type.sql`

**Local (Supabase CLI):**

```bash
cd l:\APPS\tatame
npx supabase db push
```

**Remoto (produção):**  
As migrations são aplicadas ao fazer push do repositório se o deploy estiver configurado para rodar migrations, ou aplique manualmente no **Supabase Dashboard → SQL Editor** o conteúdo da migration acima.

---

## Opção 1: Promover um perfil existente a Administrador

Se você já tem um usuário (por exemplo um mestre) e quer torná-lo administrador:

1. Abra o script **`scripts/promover-administrador.sql`**.
2. Altere a variável `email_do_perfil` para o email do usuário que será administrador:
   ```sql
   email_do_perfil TEXT := 'seu-email@exemplo.com';
   ```
3. No **Supabase Dashboard → SQL Editor**, cole o script e execute (Run).
4. Faça logout e login de novo na aplicação com esse usuário.

Esse usuário passará a ter:
- Menu e rotas de gestão (como mestre).
- Lista de polos mostrando **todos os polos** por padrão (sem “Meus Polos”).

---

## Opção 2: Criar um novo usuário como Administrador

1. Crie o usuário normalmente pelo **Cadastro** da aplicação (Login → Cadastrar), escolhendo por exemplo **Mestre**.
2. Confirme o email (ou use o SQL de confirmação do guia do mestre, se necessário).
3. Siga a **Opção 1** acima: execute `scripts/promover-administrador.sql` com o **email** desse novo usuário para alterar o tipo para `administrador`.

---

## Verificação

Após promover ou criar o administrador:

- Faça login com esse usuário.
- Verifique se o menu lateral mostra Alunos, Graduações, Evolução, Agenda, Mensagens, Polos, Financeiro, Relatórios, Configurações.
- Em **Polos**, a lista deve exibir todos os polos (sem filtro “Meus Polos”) por padrão.

Se algo não aparecer, confira se a migration `20260131000001_add_administrador_user_type.sql` foi aplicada e se o `user_type` do perfil está como `administrador` em `public.profiles`.
