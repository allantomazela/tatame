# Leitura geral – Pré-produção Tatame

Documento gerado a partir de uma auditoria do código antes do build para implantação em produção. Use como checklist e referência.

---

## 1. Resumo executivo

| Item | Status |
|------|--------|
| Build de produção | OK – `npm run build` conclui com sucesso |
| Lint | OK – 0 erros, 72 warnings (não bloqueiam deploy) |
| Variáveis de ambiente | OK – Supabase via `VITE_SUPABASE_*` |
| Logs de debug | Corrigido – `console.log` de desenvolvimento removidos |
| Segredos no código | OK – Nenhuma chave hardcoded |
| Rotas protegidas | OK – `ProtectedRoute` e `allowedUserTypes` em uso |

---

## 2. O que foi verificado e ajustado nesta leitura

### 2.1 Logs de debug removidos

Foram removidos ou substituídos por comentários os `console.log`/`console.warn` usados apenas para desenvolvimento:

- **useTrainingSessions.ts** – Vários `console.log` e `console.warn` em `getSessionAttendance` (fluxo de frequência).
- **Graduacoes.tsx** – Dois `console.log` de debug (students/loading e student data).
- **Agenda.tsx** – Três `console.log` em `loadAttendance`.
- **Evolucao.tsx** – `console.log` no botão “Salvar Avaliação” de Poomsae trocado por comentário TODO (fluxo ainda não persiste no banco).

Foram mantidos **apenas** `console.error` em blocos `catch` onde faz sentido para suporte em produção.

### 2.2 useProfile

O `console.warn('Erro ao atualizar email no auth:', ...)` em **useProfile.ts** foi mantido: ajuda a detectar falhas de atualização de e-mail em produção. Se quiser silenciar em prod, pode envolver em `if (import.meta.env.DEV)`.

---

## 3. Pontos de atenção antes do deploy

### 3.1 Build e bundle

- O build gera um chunk JS de **~1,26 MB** (minificado). O Vite avisa:
  - “Some chunks are larger than 500 kB. Consider using dynamic import() to code-split.”
- **Sugestão (não obrigatória):** Lazy load de rotas pesadas (ex.: Evolucao, Financeiro, Polos) com `React.lazy` + `Suspense` para reduzir o pacote inicial.

### 3.2 Browserslist

- Aviso: “browsers data (caniuse-lite) is 7 months old”.
- **Sugestão:** Rodar `npx update-browserslist-db@latest` antes do build de produção.

### 3.3 Lint – warnings

Existem **72 warnings** (nenhum erro):

- **react-hooks/exhaustive-deps** – Vários `useEffect`/`useCallback` com dependências omitidas (ex.: `fetchClasses`, `fetchDashboardData`, `user`). Podem ser revisados depois; costumam ser intencionais para evitar loops.
- **@typescript-eslint/no-explicit-any** – Uso de `any` em tipos (ex.: Configuracoes, Evolucao, Financeiro, Graduacoes). Melhorar gradualmente com tipos mais precisos.
- **react-refresh/only-export-components** – Alguns arquivos de UI exportam constantes/funções além de componentes. Não impede o deploy.

Nenhum desses itens bloqueia o build ou a implantação.

### 3.4 index.html e metadados

- **lang:** Definido como `lang="pt-BR"` em `index.html`.
- **Open Graph / Twitter:** `og:image` e `twitter:image` apontam para `/tatame/og-image.png`. Coloque a imagem do Tatame (logo ou screenshot) em **`public/og-image.png`** — o build copia o conteúdo de `public/` para a raiz do `dist/`, então em produção ela será servida nesse caminho.

### 3.5 Evolucao – Poomsae

O botão “Salvar Avaliação” no diálogo de Poomsae **não persiste** no banco; apenas fecha o diálogo. Há um TODO no código. Para produção, ou:

- Implementar persistência (useStudentEvolution ou RPC no Supabase), ou  
- Esconder/desabilitar o botão ou o fluxo até a feature estar pronta.

---

## 4. Checklist rápido pré-deploy

Use este checklist no dia do deploy:

| # | Ação | Feito? |
|---|------|--------|
| 1 | Rodar `npm run build` e conferir que não há erros | ☐ |
| 2 | (Opcional) Rodar `npx update-browserslist-db@latest` | ☐ |
| 3 | Definir no CI/servidor `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (ou `VITE_SUPABASE_PUBLISHABLE_KEY`) para o projeto de **produção** | ☐ |
| 4 | Aplicar migrations de RLS no Supabase de produção (incl. `20260128000002_fix_rls_recursion_complete.sql` se ainda não aplicada) | ☐ |
| 5 | No Supabase (Auth → URL Configuration): Site URL e Redirect URLs com o domínio de produção (ex.: `https://seudominio.com/tatame/`) | ☐ |
| 6 | Bucket `avatars` criado e políticas de Storage aplicadas (ver GUIA_MIGRATION_E_BUCKET_AVATARS.md) | ☐ |
| 7 | Servidor web (Nginx/Apache) configurado para servir o build em `/tatame/` com fallback SPA para `index.html` | ☐ |
| 8 | Testar em produção: login, uma criação (ex.: aluno), uma edição, uma exclusão e acesso indevido (ex.: aluno em rota só de mestre) | ☐ |

---

## 5. Referências no repositório

- **CHECKLIST_PRODUCAO.md** – Checklist detalhado (segurança, RLS, deploy, funcionalidades).
- **DEPLOY_PRODUCAO.md** – Passo a passo de deploy (secrets, Nginx, Supabase, migrations).
- **GUIA_MIGRATION_E_BUCKET_AVATARS.md** – RLS (profiles/students) e bucket `avatars`.
- **.env.example** – Modelo de variáveis; nunca commitar `.env` com valores reais.

---

## 6. Segurança – conferências feitas

- **client.ts** – Usa apenas `import.meta.env.VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY`. Nada hardcoded.
- **.gitignore** – Inclui `.env`, `.env.local`, `.env-dev`, `.env-homolog`, `.env-prod`.
- **ProtectedRoute** – Redireciona para `/login` se não houver usuário; redireciona para `/unauthorized` se o perfil não estiver em `allowedUserTypes`.
- **Rotas restritas a mestre** – Alunos, Graduações, Relatórios, Minhas Turmas, Polos, Financeiro usam `allowedUserTypes={["mestre"]}`.

---

*Documento gerado com base na leitura do código em jan/2026. Revisar antes de cada deploy importante.*
