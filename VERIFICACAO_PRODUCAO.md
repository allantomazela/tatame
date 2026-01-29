# Verificação de prontidão para produção – Tatame

**Data da verificação:** 29/01/2025  
**Escopo:** código, configuração, segurança, deploy e documentação.

---

## Resumo executivo

| Área              | Status   | Observação principal                                      |
|-------------------|----------|-----------------------------------------------------------|
| Segurança         | OK       | Credenciais via env; RLS em migrations recentes           |
| Build / Vite      | OK       | Base `/` alinhada com nginx na raiz; env documentado      |
| Rotas e auth      | OK       | ProtectedRoute, /unauthorized, allowedUserTypes           |
| Deploy (CI)       | OK       | Secrets usados no build; env não hardcoded                 |
| Dados e hooks     | OK       | Hooks tratam erro e usam toasts                            |
| Build/Lint local  | Pendente | Rodar `npm run build` e `npm run lint` manualmente        |

**Conclusão:** O sistema está **pronto para produção** do ponto de vista de código e configuração, desde que: (1) os secrets do GitHub e variáveis de ambiente estejam preenchidos no deploy, (2) as migrations (incluindo RLS) estejam aplicadas no Supabase de produção, (3) você execute e valide o build localmente.

---

## 1. Segurança

### 1.1 Credenciais e variáveis de ambiente

| Item | Status | Detalhe |
|------|--------|---------|
| Supabase URL e Anon Key fora do código | OK | `src/integrations/supabase/client.ts` usa `import.meta.env.VITE_SUPABASE_URL` e `import.meta.env.VITE_SUPABASE_ANON_KEY` (e fallback `VITE_SUPABASE_PUBLISHABLE_KEY`). Nada hardcoded. |
| Arquivos de ambiente no .gitignore | OK | `.env`, `.env.local`, `.env-dev`, `.env-homolog`, `.env-prod` listados em `.gitignore`. |
| Build no CI com env | OK | `.github/workflows/deploy.yml` passa `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` via `secrets` no step de build. |
| Tipos para env | OK | `src/vite-env.d.ts` declara `VITE_SUPABASE_*`. |

**Atenção:** Se `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` estiverem vazios no build, o client usa `""` e o app pode falhar em runtime. Em produção, os **secrets do repositório** (ou variáveis do ambiente de deploy) devem estar preenchidos.

### 1.2 Autenticação e autorização

| Item | Status | Detalhe |
|------|--------|---------|
| Rotas protegidas exigem usuário logado | OK | `ProtectedRoute` redireciona para `/login` quando `!user`. |
| Rotas por perfil (mestre) | OK | `allowedUserTypes={["mestre"]}` em Alunos, Graduações, Relatórios, Minhas Turmas, Polos, Financeiro. |
| Página de acesso não autorizado | OK | Rota `/unauthorized` e página `Unauthorized.tsx`; redirecionamento quando perfil não está em `allowedUserTypes`. |
| Sessão persistida e renovada | OK | Supabase Auth com `localStorage`, `persistSession: true`, `autoRefreshToken: true`. |
| Loading na proteção | OK | `ProtectedRoute` exibe skeleton enquanto `loading`. |

### 1.3 RLS e backend

| Item | Status | Detalhe |
|------|--------|---------|
| Migrations RLS | OK | Existem migrations de RLS (ex.: `20260127000000_rls_restrict_by_role.sql`, `20260128000001_fix_profiles_rls_500.sql`, `20260128000002_fix_rls_recursion_complete.sql`) com políticas por papel e funções `can_view_profile` / `current_user_is_mestre`. |
| Políticas “Everyone” | Atenção | O `CHECKLIST_PRODUCAO.md` cita políticas antigas “Everyone” em algumas tabelas. A ordem das migrations define o que vale. Recomendação: no Supabase (Dashboard → Table Editor → RLS) confirmar políticas ativas e restringir por `auth.uid()` e `user_type` onde fizer sentido. |

### 1.4 XSS e injeção

| Item | Status | Detalhe |
|------|--------|---------|
| dangerouslySetInnerHTML | OK | Nenhum uso encontrado em `src/`. |
| Queries Supabase | OK | Uso do client com `.insert()`, `.update()`, `.eq()` etc.; sem concatenação de SQL cru. |

---

## 2. Build e configuração

### 2.1 Vite

| Item | Status | Detalhe |
|------|--------|---------|
| base | OK | `vite.config.ts` usa `base: "/"`. Alinhado com `nginx-tatamebrasil-root.conf` (app na raiz). |
| Uso de base no Router | OK | `App.tsx`: `basename={(import.meta.env.BASE_URL ?? "/").replace(/\/$/, "")}`. |
| Redirecionamento /tatame | OK | Rotas `/tatame` e `/tatame/*` redirecionam para `/` (evita 404 em dev quando base é `/`). |

**Se no futuro o app for servido em subpath (ex.: `/tatame/`):** alterar em `vite.config.ts` algo como `base: mode === 'production' ? '/tatame/' : '/'` e no Supabase (Site URL / Redirect URLs) usar a mesma base. O `DEPLOY_PRODUCAO.md` descreve cenário com `base: "/tatame/"` e Nginx em `/tatame/`.

### 2.2 Variáveis de build

| Item | Status | Detalhe |
|------|--------|---------|
| Documentação | OK | `.env.example` documenta `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. |
| Produção | OK | GitHub Actions injeta essas variáveis via secrets no `npm run build`. |

### 2.3 Build e lint (ação manual)

O ambiente atual não permitiu executar comandos no terminal (sandbox/processo elevado). **Você deve rodar localmente:**

```bash
npm ci
npm run build
npm run lint
```

- Se `npm run build` concluir sem erro, o pacote de produção está gerado em `dist/`.
- Se `npm run lint` acusar erros, corrija antes de considerar produção fechada.

---

## 3. Deploy (GitHub Actions + Vultr)

| Item | Status | Detalhe |
|------|--------|---------|
| Trigger | OK | `on push branches: [main]`. |
| Build no CI | OK | `npm ci && npm run build` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` dos secrets. |
| Destino | OK | `easingthemes/ssh-deploy`, `SOURCE: "dist/"`, `TARGET: "/var/www/tatame/"`. |
| Secrets necessários | OK | Documentados em `DEPLOY_PRODUCAO.md`: `VULTR_SSH_KEY`, `VULTR_HOST`, `VULTR_USER`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. |

**Checklist no GitHub:** em Settings → Secrets and variables → Actions, conferir se os cinco secrets acima estão configurados.

---

## 4. Servidor (Nginx)

O arquivo `nginx-tatamebrasil-root.conf` está consistente com `base: "/"`:

- `root /var/www/tatame;`
- `location / { try_files $uri $uri/ /index.html; }`
- MIME para JS e cache para estáticos configurados.

Se usar esse config, o app é servido na **raiz** do domínio (ex.: `https://tatamebrasil.com.br/`). As meta tags de og/twitter em `index.html` foram ajustadas para `/og-image.png` (raiz); se você usar subpath no futuro, atualize de volta para `/tatame/og-image.png` (ou o path correto).

---

## 5. Funcionalidades e dados

- **Rotas e telas:** Index, Login, Dashboard, Alunos, Mensagens, Evolução, Graduações, Agenda, Configurações, Progresso, Conquistas, Relatórios, Minhas Turmas, Polos, Financeiro, NotFound, Unauthorized estão mapeadas em `App.tsx` com proteção adequada.
- **Hooks de persistência:** useStudents, useGraduations, useProfile, useSettings, useMessages, usePayments, useFinancialTransactions, usePolos, usePoloSchedules, useClasses, useTrainingSessions, useStudentEvolution (e outros) existem e há tratamento de erro/toast nos hooks (verificado por busca no código).
- **Index:** Redireciona autenticado para `/dashboard`; não autenticado mostra landing e botão para `/login`.

Nenhum dado mockado foi verificado em pontos críticos; o `CHECKLIST_PRODUCAO.md` e o `ESTADO_DO_PROJETO.md` já orientam conferir telas como Relatórios, Conquistas e Progresso para garantir que usam dados reais ou estado vazio.

---

## 6. Ajuste realizado nesta verificação

- **index.html:** `og:image` e `twitter:image` alterados de `/tatame/og-image.png` para `/og-image.png`, pois a configuração atual (nginx na raiz) serve o app em `/`. Se você passar a servir em `/tatame/`, reverta para `/tatame/og-image.png` e ajuste o `base` no Vite.

---

## 7. Checklist final antes de abrir para usuários

1. [ ] Rodar `npm run build` e `npm run lint` localmente e corrigir qualquer falha.
2. [ ] Confirmar no GitHub que os secrets do deploy estão preenchidos e que o último workflow de deploy concluiu com sucesso.
3. [ ] Confirmar no Supabase de **produção** que todas as migrations (incluindo RLS) foram aplicadas e que as políticas ativas são as desejadas.
4. [ ] No Supabase (Authentication → URL Configuration), configurar Site URL e Redirect URLs com o domínio real de produção (ex.: `https://tatamebrasil.com.br` se estiver na raiz).
5. [ ] Testar em produção: login, uma criação (ex.: aluno), uma edição, uma exclusão e acesso com perfil de aluno a rota só de mestre (deve ir para `/unauthorized`).
6. [ ] Garantir HTTPS no servidor (certificado e redirect HTTP→HTTPS, se aplicável).

---

## 8. Verificação via MCP Supabase

Foi feita uma tentativa de usar o **MCP do Supabase** (servidor `user-supabase`) para validar migrations, tabelas e RLS diretamente no projeto.

### Resultado da verificação via MCP (29/01/2025)

| Ação | Resultado |
|------|-----------|
| **list_projects** | OK. Retornou 2 projetos na conta conectada ao MCP. |
| **get_project(id: "hsqlsrdsljlvideihevy")** | **Projeto não encontrado.** O projeto Tatame (ref `hsqlsrdsljlvideihevy` usado no código/.env) **não pertence à organização conectada ao MCP** ou não existe nessa conta. |
| **list_migrations(project_id: "hsqlsrdsljlvideihevy")** | Timeout / falha (projeto inacessível). |

**Conclusão:** A conta Supabase vinculada ao MCP no Cursor contém outros projetos (ex.: "Templários Oficial", "Bodes Sobre Rodas"). Para rodar a verificação do **Tatame** via MCP, é preciso usar uma conta/organização onde o projeto Tatame exista (ou vincular o projeto Tatame ao MCP, se sua configuração permitir).

### Como repetir a verificação quando o projeto Tatame estiver acessível no MCP

Use o **project_id** do projeto Tatame (o `ref` do projeto no Supabase, ex.: `hsqlsrdsljlvideihevy` ou o que estiver no seu Dashboard).

1. **Listar projetos** (descobrir o `project_id`):
   - Ferramenta: `list_projects`  
   - Argumentos: `{}`

2. **Listar migrations aplicadas:**
   - Ferramenta: `list_migrations`  
   - Argumentos: `{ "project_id": "<SEU_PROJECT_ID>" }`  
   - Conferir se aparecem as migrations do Tatame (ex.: `20250128000000_add_color_to_polos`, `20260127000000_rls_restrict_by_role`, `20260128000002_fix_rls_recursion_complete`, etc.).

3. **Listar tabelas do schema public:**
   - Ferramenta: `list_tables`  
   - Argumentos: `{ "project_id": "<SEU_PROJECT_ID>", "schemas": ["public"] }`  
   - Verificar se existem: `profiles`, `students`, `graduations`, `polos`, `polo_schedules`, `financial_transactions`, `payments`, `messages`, etc.

4. **Verificar RLS ativo em todas as tabelas public:**
   - Ferramenta: `execute_sql`  
   - Argumentos:
     - `project_id`: `"<SEU_PROJECT_ID>"`
     - `query`:
       ```sql
       SELECT schemaname, tablename, rowsecurity
       FROM pg_tables
       WHERE schemaname = 'public'
       ORDER BY tablename;
       ```
   - Esperado: `rowsecurity = true` nas tabelas sensíveis (profiles, students, graduations, payments, messages, financial_transactions, polos, polo_schedules, etc.).

5. **Listar políticas RLS por tabela (opcional):**
   - Ferramenta: `execute_sql`  
   - Query:
     ```sql
     SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
     FROM pg_policies
     WHERE schemaname = 'public'
     ORDER BY tablename, policyname;
     ```
   - Revisar se não há políticas excessivamente permissivas (ex. "Everyone can …" em produção).

Depois de conectar o projeto Tatame ao MCP (ou trocar para a conta correta), você pode pedir ao assistente para “rodar a verificação de produção via MCP do Supabase” novamente; ele usará essas ferramentas com o `project_id` do Tatame.

---

*Documento gerado pela verificação de prontidão para produção. Use junto com `CHECKLIST_PRODUCAO.md` e `DEPLOY_PRODUCAO.md`.*
