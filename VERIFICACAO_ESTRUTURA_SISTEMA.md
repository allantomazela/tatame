# Verificação da Estrutura do Sistema – Tatame

**Data da verificação:** 29/01/2025  
**Objetivo:** Validar toda a estrutura e o funcionamento do sistema antes de atualizar o servidor.

---

## 1. Resumo executivo

| Área | Status | Observação |
|------|--------|------------|
| Package.json e scripts | ✅ OK | `dev`, `build`, `lint`, `preview` configurados; dependências consistentes |
| Configurações (Vite, TS, Tailwind) | ✅ OK | Base `/`, alias `@/`, build sem erros |
| Variáveis de ambiente | ✅ OK | Supabase via `VITE_SUPABASE_*`; `.env.example` e `.gitignore` corretos |
| Rotas e autenticação | ✅ OK | ProtectedRoute, Unauthorized, rotas por perfil (mestre/aluno/responsável) |
| Integração Supabase | ✅ OK | Client usa env; migrations RLS com SECURITY DEFINER (sem recursão) |
| Deploy (GitHub Actions) | ✅ OK | Secrets `VITE_SUPABASE_*` e `VULTR_*` no build e SSH |
| Build de produção | ✅ OK | `npm run build` concluído com sucesso |
| Lint | ✅ OK | 0 erros; 73 warnings (não bloqueiam deploy) |

**Conclusão:** O sistema está estruturalmente correto e pronto para atualização do servidor, desde que os secrets do GitHub e o Supabase de produção estejam configurados.

---

## 2. Detalhes por área

### 2.1 Package.json e dependências

- **Scripts:** `dev`, `dev:clean`, `build`, `build:dev`, `lint`, `preview`
- **Runtime:** React 18, React Router 6, TanStack Query, Supabase JS, Radix UI, Tailwind
- **Build:** Vite 5, TypeScript 5, SWC
- **Lockfile:** `bun.lockb` e `package-lock.json` presentes; o workflow usa `npm ci`

### 2.2 Configurações

- **vite.config.ts:** `base: "/"` (adequado para app na raiz do domínio, ex.: tatamebrasil.com.br). Nginx de referência serve em `/var/www/tatame` com `try_files` para SPA.
- **TypeScript:** `tsconfig.json` + `tsconfig.app.json`; paths `@/*` → `./src/*`
- **Variáveis de ambiente:** `src/vite-env.d.ts` declara `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
- **client.ts:** Usa apenas `import.meta.env.VITE_SUPABASE_*`; nenhum valor hardcoded

### 2.3 Rotas e autenticação

- **Rotas públicas:** `/`, `/login`, `/auth/callback`, `/redefinir-senha`, `/unauthorized`
- **Rotas protegidas (qualquer usuário logado):** Dashboard, Mensagens, Evolução, Progresso, Conquistas, Agenda, Configurações
- **Rotas restritas a mestre:** Alunos, Graduações, Relatórios, Minhas Turmas, Polos, Financeiro
- **ProtectedRoute:** Redireciona para `/login` se não houver usuário; para `/unauthorized` se o perfil não estiver em `allowedUserTypes`
- **Auth:** Supabase com `localStorage`, `persistSession: true`, `autoRefreshToken: true`

### 2.4 Supabase e RLS

- **Migrations recentes:** `20260128000001_fix_profiles_rls_500.sql` e `20260128000002_fix_rls_recursion_complete.sql` usam funções `SECURITY DEFINER` (`can_view_profile`, `current_user_is_mestre`) para evitar recursão e erro 500 em `profiles`/`students`.
- **Deploy das migrations:** Garantir que todas as migrations foram aplicadas no projeto Supabase de **produção** (Dashboard → SQL Editor ou CLI).

### 2.5 Deploy (GitHub Actions)

- **Arquivo:** `.github/workflows/deploy.yml`
- **Trigger:** `push` na branch `main`
- **Build:** `npm ci && npm run build` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` dos secrets
- **Deploy:** `easingthemes/ssh-deploy@v4`; `SOURCE: dist/`, `TARGET: /var/www/tatame/`
- **Secrets necessários:** `VULTR_SSH_KEY`, `VULTR_HOST`, `VULTR_USER`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### 2.6 Build e Lint (executados nesta verificação)

- **Build:** Concluído em ~14s; saída em `dist/` (index.html + assets). Aviso de chunk > 500 kB (recomendação futura: code-split).
- **Lint:** 0 erros, 73 warnings:
  - `react-refresh/only-export-components` em alguns componentes UI (Shadcn)
  - `react-hooks/exhaustive-deps` em vários hooks/páginas
  - `@typescript-eslint/no-explicit-any` em hooks e páginas  
  Nenhum deles impede o deploy; podem ser tratados em sprints de qualidade.

---

## 3. Checklist pré-atualização do servidor

Antes de dar push para `main` ou rodar o deploy manualmente:

1. **Secrets do repositório (GitHub → Settings → Secrets and variables → Actions)**  
   - [ ] `VITE_SUPABASE_URL` = URL do projeto Supabase de **produção**  
   - [ ] `VITE_SUPABASE_ANON_KEY` = Anon key do projeto de **produção**  
   - [ ] `VULTR_SSH_KEY`, `VULTR_HOST`, `VULTR_USER` preenchidos

2. **Supabase (projeto de produção)**  
   - [ ] Todas as migrations aplicadas (incluindo as de RLS 20260128*)  
   - [ ] Authentication → URL Configuration: Site URL e Redirect URLs com o domínio de produção  
   - [ ] RLS ativo nas tabelas sensíveis; políticas revisadas (evitar “Everyone” onde não for desejado)

3. **Servidor (Vultr)**  
   - [ ] Nginx (ou Apache) servindo `/var/www/tatame/` com fallback SPA para `index.html`  
   - [ ] HTTPS configurado (ex.: Let’s Encrypt)  
   - [ ] Permissões da pasta corretas para o usuário do servidor web

4. **Testes pós-deploy**  
   - [ ] Acessar a URL de produção e carregar a aplicação  
   - [ ] Login com usuário de produção  
   - [ ] Uma operação de criação (ex.: aluno) e uma de edição  
   - [ ] Acesso com perfil “aluno” a rota só de mestre → deve redirecionar para `/unauthorized`

---

## 4. Melhorias sugeridas (não bloqueantes)

- **Performance:** Implementar code-split (ex.: `React.lazy` + `Suspense`) para reduzir o tamanho do chunk principal e melhorar o tempo de carregamento inicial.
- **Qualidade de código:** Reduzir gradualmente os 73 warnings do ESLint (tipos em vez de `any`, dependências de hooks).
- **Documentação:** O `CHECKLIST_PRODUCAO.md` foi atualizado no item 1.2.1 para refletir que Supabase já usa variáveis de ambiente (não está mais hardcoded).

---

*Documento gerado a partir da verificação automatizada e da análise do código e da configuração do projeto.*
