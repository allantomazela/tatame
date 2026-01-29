# Deploy para Produção – Tatame

Passo a passo para deixar o deploy pronto e publicar em produção.

---

## 1. Secrets no GitHub

Em **Settings → Secrets and variables → Actions** do repositório, configure:

| Secret | Uso |
|--------|-----|
| `VULTR_SSH_KEY` | Chave privada SSH para o servidor Vultr (conteúdo do arquivo da chave). |
| `VULTR_HOST` | IP ou hostname do servidor (ex.: `123.45.67.89` ou `tatame.sistemascuesta.com.br`). |
| `VULTR_USER` | Usuário SSH no servidor (ex.: `root` ou `deploy`). |
| `VITE_SUPABASE_URL` | URL do projeto Supabase de **produção** (ex.: `https://xxxx.supabase.co`). |
| `VITE_SUPABASE_ANON_KEY` | Anon key pública do projeto Supabase de **produção**. |

**Importante:** `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` são usados no **build** (GitHub Actions). O build de produção passa a usar o Supabase de prod; sem eles, o app usa o fallback hardcoded (ambiente de dev).

---

## 2. Servidor: pasta e permissões

O workflow envia o conteúdo de `dist/` para `/var/www/tatame/`. Garanta que:

1. A pasta existe: `mkdir -p /var/www/tatame`
2. O usuário que o SSH usa tem permissão de escrita: por exemplo, se `REMOTE_USER` for `deploy`, o dono da pasta pode ser `deploy:www-data` e permissões adequadas para o servidor web ler os arquivos.

---

## 3. Nginx: servir o app em `/tatame/`

O app usa `base: "/tatame/"` em produção. O Nginx deve servir os arquivos estáticos e fazer **fallback SPA** para `index.html` em rotas do front (ex.: `/tatame/dashboard`).

Exemplo dentro do `server` que já escuta HTTPS no seu domínio:

```nginx
location /tatame/ {
    alias /var/www/tatame/;
    try_files $uri $uri/ /tatame/index.html;
}
```

Se o deploy escreve em `/var/www/tatame/` (conteúdo de `dist/` já na raiz), está correto. Se por acaso o action criar `/var/www/tatame/dist/`, ajuste o `alias` para `/var/www/tatame/dist/`.

Reinicie o Nginx após alterar: `sudo systemctl reload nginx` (ou `reload` do seu processo).

---

## 4. Supabase: URLs de produção (obrigatório para cadastro e recuperação de senha)

No **Dashboard do Supabase** do projeto de produção:

1. **Authentication → URL Configuration**
2. **Site URL:** a URL pública do app (raiz), ex.: `https://tatamebrasil.com.br` ou `https://tatame.sistemascuesta.com.br`  
   Se o app estiver em subpath: `https://dominio.com/tatame/`
3. **Redirect URLs:** adicione **todas** as URLs abaixo (substitua pelo seu domínio):
   - `https://SEU-DOMINIO.com.br`
   - `https://SEU-DOMINIO.com.br/**`
   - `https://SEU-DOMINIO.com.br/auth/callback`
   - `https://SEU-DOMINIO.com.br/redefinir-senha`
   - Se usar subpath `/tatame/`: `https://SEU-DOMINIO.com.br/tatame/auth/callback` e `https://SEU-DOMINIO.com.br/tatame/redefinir-senha`

**Por quê:** após confirmar o e-mail (cadastro), o Supabase redireciona para `/auth/callback`. Após clicar em "Esqueci minha senha", o link do e-mail redireciona para `/redefinir-senha`. Se essas URLs não estiverem em Redirect URLs, o Supabase bloqueia o redirect e o usuário vê erro.

Assim o Supabase Auth aceita redirects do ambiente de produção e o cadastro/recuperação de senha funcionam.

---

## 5. Migrations no Supabase de produção

As migrations (incluindo a de RLS `20260127000000_rls_restrict_by_role.sql`) precisam estar aplicadas no projeto **Supabase de produção**:

- Pelo Dashboard: **SQL Editor** → rodar as migrations na ordem, ou
- Pela CLI: `supabase link --project-ref <ref>` e `supabase db push` a partir da pasta do projeto.

Não use o banco de dev/homolog como produção.

---

## 6. Testar build localmente (opcional)

Antes de fazer push, você pode validar o build de produção na sua máquina:

```bash
npm run build
npm run preview
```

Abra no navegador **http://localhost:4173/tatame/** (a base em produção é `/tatame/`). Confira se a aplicação carrega e as rotas funcionam.

---

## 7. Testar o deploy

1. Faça **push** na branch `main` e confira se o workflow **Deploy Tatame to Vultr** conclui sem erros.
2. Acesse no navegador a URL de produção (ex.: `https://dominio.com/tatame/`).
3. Teste:
   - Carregamento da página e recursos (CSS/JS).
   - Login com um usuário de produção.
   - Navegação (ex.: `/tatame/dashboard`) e recarregamento da página (fallback SPA).
   - Uma operação crítica (ex.: listar alunos, se for mestre).

---

## 8. Resumo rápido

| O quê | Onde |
|------|------|
| Secrets (VULTR_*, VITE_SUPABASE_*) | GitHub → Settings → Secrets and variables → Actions |
| Pasta no servidor | `/var/www/tatame/` com permissões corretas |
| Nginx | `location /tatame/` com `alias` e `try_files ... /tatame/index.html` |
| Supabase prod | Site URL e Redirect URLs com o domínio de produção |
| Migrations | Aplicadas no projeto Supabase de produção |

Depois disso, cada **push em `main`** gera um novo build e redeploy automático para `/var/www/tatame/`.
