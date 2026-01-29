# Configuração de Auth em Produção – Tatame

Este guia evita os problemas: **cadastro não completa**, **tela de erro ao confirmar e-mail**, **"não encontra usuário" após confirmar** e **recuperação de senha**.

---

## 1. Supabase: URL Configuration (obrigatório)

No **Dashboard do Supabase** → **Authentication** → **URL Configuration**:

| Campo | Valor (exemplo com app na raiz) |
|-------|----------------------------------|
| **Site URL** | `https://tatamebrasil.com.br` (ou seu domínio real) |
| **Redirect URLs** | Adicione **cada** URL abaixo (uma por linha): |
| | `https://tatamebrasil.com.br` |
| | `https://tatamebrasil.com.br/**` |
| | `https://tatamebrasil.com.br/auth/callback` |
| | `https://tatamebrasil.com.br/redefinir-senha` |

Substitua `tatamebrasil.com.br` pelo seu domínio. Se o app estiver em subpath (ex.: `/tatame/`), use:
- `https://seu-dominio.com/tatame/auth/callback`
- `https://seu-dominio.com/tatame/redefinir-senha`

**Sem essas URLs**, após clicar no link de confirmação de e-mail ou no link de "Esqueci minha senha", o Supabase pode redirecionar para uma tela de erro ou bloquear o redirect.

---

## 2. Fluxo de cadastro (novo usuário)

1. Usuário acessa a tela de **Login** → aba **Cadastrar**.
2. Preenche nome, e-mail, tipo (Aluno, Responsável ou Mestre) e senha.
3. O sistema envia um e-mail de confirmação (Supabase).
4. Usuário clica no link do e-mail → é redirecionado para **`/auth/callback`** no seu site.
5. A página de callback confirma a sessão e redireciona para **Dashboard**.
6. O perfil é criado pelo trigger `handle_new_user` no banco ou, se não existir, pelo fallback no app.

**Se aparecer "não encontra usuário" após confirmar:** o app agora tenta criar o perfil a partir dos dados do auth quando o perfil não existe. Garanta que as Redirect URLs acima estão configuradas.

---

## 3. Cadastro de aluno pelo mestre

Para o mestre **vincular um aluno** na tela **Alunos** (criar registro de aluno):

1. O **aluno** precisa ter se **cadastrado antes** na tela de login (aba Cadastrar) com tipo **Aluno** e ter **confirmado o e-mail**.
2. Depois, o mestre em **Alunos** → **Cadastrar aluno** informa o **e-mail** desse aluno (e demais dados).
3. O sistema busca o perfil pelo e-mail e cria o vínculo (registro em `students`).

Ou seja: primeiro o aluno se cadastra e confirma o e-mail; em seguida o mestre pode cadastrá-lo como aluno pelo e-mail.

---

## 4. Recuperação de senha

- Na tela de **Login** há o link **"Esqueci minha senha"**.
- O usuário informa o e-mail e recebe um link para **`/redefinir-senha`**.
- A URL de redefinição (**`/redefinir-senha`**) deve estar em **Redirect URLs** no Supabase (item 1).

---

## 5. Resumo do que foi implementado no código

- **`/auth/callback`** – Página que recebe o redirect após confirmação de e-mail e redireciona para o Dashboard.
- **`/redefinir-senha`** – Página para definir nova senha após clicar no link do e-mail de recuperação.
- **Login** – Link "Esqueci minha senha" e envio de e-mail de recuperação.
- **Cadastro** – Uso de `emailRedirectTo` para enviar o usuário para `/auth/callback` após confirmar.
- **Perfil** – Se o usuário existir no auth mas não tiver perfil, o app tenta criar o perfil a partir dos metadados (fallback).

Configurando as URLs no Supabase (item 1), cadastro, confirmação de e-mail e recuperação de senha passam a funcionar em produção.
