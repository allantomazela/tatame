# Checklist para Produção – Tatame

Checkup minucioso do sistema antes de enviar para o servidor e disponibilizar em produção. Use este documento para marcar cada item verificando ou corrigindo.

---

## 1. Segurança

### 1.1 Autenticação e autorização

| # | Item | Status | Observação |
|---|------|--------|------------|
| 1.1.1 | Rotas protegidas exigem usuário logado | ☐ | `ProtectedRoute` redireciona para `/login` quando `!user`. |
| 1.1.2 | Rotas por perfil (mestre/aluno/responsável) | ☐ | `allowedUserTypes` em Alunos, Graduações, Relatórios, Minhas Turmas, Polos, Financeiro. |
| 1.1.3 | Página de acesso não autorizado | ☐ | Rota `/unauthorized` e página `Unauthorized.tsx` existem. Quem não tem perfil permitido é redirecionado para ela. |
| 1.1.4 | Sessão persistida e renovada | ☐ | Supabase Auth com `localStorage`, `persistSession: true`, `autoRefreshToken: true`. |
| 1.1.5 | Logout invalida acesso às rotas protegidas | ☐ | `signOut()` limpa sessão; `onAuthStateChange` atualiza estado. |

### 1.2 Credenciais e variáveis de ambiente

| # | Item | Status | Observação |
|---|------|--------|------------|
| 1.2.1 | **Supabase URL e Anon Key fora do código** | ☐ **CRÍTICO** | Hoje estão hardcoded em `src/integrations/supabase/client.ts`. Para produção: usar `import.meta.env.VITE_SUPABASE_URL` e `import.meta.env.VITE_SUPABASE_ANON_KEY` e garantir que o build receba essas variáveis. |
| 1.2.2 | Arquivos de ambiente não versionados | ☐ | `.env`, `.env.local`, `.env-dev`, `.env-homolog`, `.env-prod` devem estar no `.gitignore`. |
| 1.2.3 | Chaves e senhas só em env ou secrets | ☐ | Nenhuma chave em repositório. Deploy (GitHub Actions) usa `secrets.VULTR_SSH_KEY`, `VULTR_HOST`, `VULTR_USER`. |
| 1.2.4 | Anon key do Supabase é a chave “pública” | ☐ | É segura no front; segurança real vem das políticas RLS no banco. |

### 1.3 Row Level Security (RLS) no Supabase

| # | Item | Status | Observação |
|---|------|--------|------------|
| 1.3.1 | RLS habilitado nas tabelas sensíveis | ☐ | Migrations habilitam RLS em `profiles`, `students`, `graduations`, `payments`, `messages`, `financial_transactions`, `polos`, `polo_schedules`, `training_sessions`, `student_evaluations`, `student_goals`, `student_achievements`, `student_competitions`. |
| 1.3.2 | **Políticas “Everyone” em produção** | ☐ **ATENÇÃO** | Migrations `20250915133509` e `20250915171203` têm políticas tipo “Everyone can view/create/update/delete” em `students`, `graduations`, `student_evaluations`, `student_goals`, `student_achievements`, `student_competitions`. Ordem das migrations define o que vale. **Recomendação:** revisar no Supabase (Dashboard → Table Editor → RLS) e restringir por `auth.uid()` e `user_type` onde fizer sentido. |
| 1.3.3 | Políticas por papel (mestre/aluno/responsável) | ☐ | Algumas migrations usam `profiles.user_type` e restringem mestre/aluno/responsável. Confirmar no banco quais políticas estão ativas. |
| 1.3.4 | Políticas de `profiles` | ☐ | Há “Users can insert any profile” e “Users can view/update profiles” em migrations mais recentes. Garantir que apenas usuário autenticado e com regra de negócio correta possam alterar perfis. |

### 1.4 Injeção e XSS

| # | Item | Status | Observação |
|---|------|--------|------------|
| 1.4.1 | Sem `dangerouslySetInnerHTML` com entrada do usuário | ☐ | Nenhum uso encontrado no código. |
| 1.4.2 | Queries Supabase parametrizadas | ☐ | Uso do client Supabase com `.insert()`, `.update()`, `.eq()` etc. usa parâmetros; não há concatenação de SQL cru. |
| 1.4.3 | RLS como segunda barreira | ☐ | Mesmo que o front envie dados indevidos, RLS pode bloquear acesso/escrita. |

### 1.5 Outros

| # | Item | Status | Observação |
|---|------|--------|------------|
| 1.5.1 | HTTPS em produção | ☐ | Servidor (ex.: tatame.sistemascuesta.com.br) deve servir apenas via HTTPS. |
| 1.5.2 | CORS no Supabase | ☐ | No Dashboard do Supabase (Authentication → URL Configuration), conferir “Site URL” e “Redirect URLs” com o domínio de produção. |

---

## 2. Salvamento e fidelidade de dados

### 2.1 Padrão de erro e feedback

| # | Item | Status | Observação |
|---|------|--------|------------|
| 2.1.1 | Operações de escrita tratam `error` do Supabase | ☐ | Hooks usam `if (error)` e exibem toast. |
| 2.1.2 | Mensagens de erro amigáveis ao usuário | ☐ | Toasts com título/descrição em português. |
| 2.1.3 | `try/catch` em fluxos assíncronos críticos | ☐ | Hooks como `useStudents`, `useGraduations`, etc. usam try/catch e toast em caso de exceção. |

### 2.2 Rollback e consistência

| # | Item | Status | Observação |
|---|------|--------|------------|
| 2.2.1 | Rollback em criação de aluno | ☐ | Em `useStudents.createStudent`, se `students.insert` falha, é feito `profiles.delete` do perfil recém-criado. |
| 2.2.2 | Operações em múltiplas tabelas | ☐ | Criação de aluno: `profiles` → `students` → `student_polos`. Hoje não há transação explícita; dependem de rollback manual. Para maior garantia, considerar função RPC no Supabase com `BEGIN/COMMIT/ROLLBACK`. |
| 2.2.3 | Evitar duplicação de dados essenciais | ☐ | IDs gerados por Supabase ou `crypto.randomUUID()`; convém revisar triggers/constraints de unicidade (ex.: email em `profiles`). |

### 2.3 Validação de entrada

| # | Item | Status | Observação |
|---|------|--------|------------|
| 2.3.1 | Validação em formulários | ☐ | Uso de `react-hook-form` e validações pontuais (ex.: MinhasTurmas). Não há esquema Zod global por formulário. |
| 2.3.2 | Validação no backend | ☐ | Supabase: constraints de tabela e RLS. Para regras mais complexas, usar Functions ou RPC com validação. |
| 2.3.3 | Campos obrigatórios no TypeScript | ☐ | Interfaces como `CreateStudentData` indicam obrigatórios; o front deve bloquear submit sem eles. |

### 2.4 Hooks e telas que persistem dados

| # | Item | Status | Observação |
|---|------|--------|------------|
| 2.4.1 | useStudents | ☐ | create, update, delete; toast e rollback de perfil em criação. |
| 2.4.2 | useGraduations | ☐ | create, update, delete. |
| 2.4.3 | useProfile | ☐ | updateProfile, updatePassword, uploadAvatar. |
| 2.4.4 | useSettings | ☐ | update. |
| 2.4.5 | useMessages | ☐ | send, markAsRead. |
| 2.4.6 | usePayments | ☐ | create, update. |
| 2.4.7 | useFinancialTransactions | ☐ | create, update, delete; categorias. |
| 2.4.8 | usePolos | ☐ | create, update, delete. |
| 2.4.9 | usePoloSchedules | ☐ | create, update, delete. |
| 2.4.10 | useClasses | ☐ | create, update, delete; enrollments. |
| 2.4.11 | useTrainingSessions | ☐ | presença, sessões. |
| 2.4.12 | useStudentEvolution | ☐ | evaluations, goals, achievements, competitions. |

---

## 3. Configurações e deploy

### 3.1 Build

| # | Item | Status | Observação |
|---|------|--------|------------|
| 3.1.1 | Build de produção sem erros | ☐ | `npm run build` (Vite, mode production). |
| 3.1.2 | Base da aplicação em produção | ☐ | `vite.config.ts`: `base: "/tatame/"` em produção. Servidor/nginx deve servir o app em `/tatame/` ou ajustar `base` conforme hospedagem. |
| 3.1.3 | Variáveis de build | ☐ | Se usar `VITE_SUPABASE_*`, definir no ambiente do CI (ex.: GitHub Actions) ou no servidor antes do build. |
| 3.1.4 | Pasta de saída | ☐ | `dist/` (padrão Vite). Workflow envia `dist/` para o servidor. |

### 3.2 Deploy (GitHub Actions + Vultr)

| # | Item | Status | Observação |
|---|------|--------|------------|
| 3.2.1 | Trigger do deploy | ☐ | `on push branches: [main]`. |
| 3.2.2 | Build no CI | ☐ | `npm ci && npm run build`. |
| 3.2.3 | Destino no servidor | ☐ | `easingthemes/ssh-deploy`, `TARGET: "/var/www/tatame/"`. Os arquivos de `dist/` sobem para essa pasta. |
| 3.2.4 | Secrets do repositório | ☐ | `VULTR_SSH_KEY`, `VULTR_HOST`, `VULTR_USER` configurados em Settings → Secrets. |
| 3.2.5 | Servidor web (Nginx/Apache) | ☐ | Servir arquivos estáticos de `/var/www/tatame/` (ou `/var/www/tatame/dist/` se o deploy colocar o conteúdo dentro de `dist/` lá). Para SPA: fallback para `index.html` em rotas do front. |
| 3.2.6 | Base URL no servidor | ☐ | Se o app estiver em `https://dominio.com/tatame/`, o Nginx deve ter `location /tatame/` com `alias` ou `root` apontando para a pasta do build. |

### 3.3 Ambiente

| # | Item | Status | Observação |
|---|------|--------|------------|
| 3.3.1 | Diferença dev / prod no cliente | ☐ | `vite.config.ts`: `base` depende de `mode`. Em produção o Supabase usado deve ser o de produção (URL/key via env). |
| 3.3.2 | Arquivos .env por ambiente | ☐ | Ideal: `.env-dev`, `.env-homolog`, `.env-prod` (ou equivalentes) preenchidos e **não** versionados (já listados no .gitignore). |

---

## 4. Funcionalidades por tela

Verificar se cada tela carrega dados corretos, salva sem perder dados e respeita permissões.

| # | Tela / fluxo | Dados carregados de | Salvamento | Observação |
|---|----------------|---------------------|------------|------------|
| 4.1 | Login | — | signIn/signUp Supabase Auth | ☐ |
| 4.2 | Dashboard | useDashboard (Supabase) | — | ☐ |
| 4.3 | Alunos (lista) | useStudents | — | ☐ |
| 4.4 | Alunos (gestão / criar-editar) | useStudents | createStudent, updateStudent | ☐ |
| 4.5 | Graduações | useGraduations, useStudents | create, update, delete | ☐ |
| 4.6 | Evolução | useStudentEvolution, useStudents | evaluations, goals, achievements, competitions | ☐ |
| 4.7 | Agenda | useTrainingSessions, etc. | presença, sessões | ☐ |
| 4.8 | Mensagens | useMessages | send, markAsRead | ☐ |
| 4.9 | Configurações | useProfile, useSettings | updateProfile, updatePassword, uploadAvatar, update settings | ☐ |
| 4.10 | Relatórios | useDashboard | — (sem geração de relatório ainda) | ☐ |
| 4.11 | Minhas Turmas | useClasses, usePolos, etc. | create/update classes, enrollments | ☐ |
| 4.12 | Polos | usePolos, usePoloSchedules | CRUD polos e horários | ☐ |
| 4.13 | Financeiro | useFinancialTransactions, usePayments | transações, categorias, pagamentos | ☐ |
| 4.14 | Progresso | (vazio por enquanto) | — | ☐ |
| 4.15 | Conquistas | (vazio por enquanto) | — | ☐ |

---

## 5. UX e erros

| # | Item | Status | Observação |
|---|------|--------|------------|
| 5.1 | Loading em listagens | ☐ | Vários hooks têm `loading` e as telas exibem skeleton ou indicador. |
| 5.2 | Estado vazio (sem dados) | ☐ | Relatórios, Conquistas, Progresso têm mensagens de “nenhum dado ainda”. |
| 5.3 | Página 404 | ☐ | `NotFound.tsx` e rota `path="*"`. |
| 5.4 | Página sem permissão | ☐ | `Unauthorized.tsx` e rota `/unauthorized`. |
| 5.5 | Toasts de sucesso/erro | ☐ | useToast usado nos hooks de persistência. |

---

## 6. Pré-lançamento (última revisão)

| # | Item | Status |
|---|------|--------|
| 6.1 | Rodar `npm run build` e testar com `npm run preview` usando `base` de produção | ☐ |
| 6.2 | Conferir no Supabase que as migrations de produção foram aplicadas e que as políticas RLS ativas são as desejadas | ☐ |
| 6.3 | Garantir que URL e Anon Key de produção vêm de variáveis de ambiente no deploy | ☐ |
| 6.4 | Verificar no GitHub que os secrets do deploy estão preenchidos e que o último deploy concluiu com sucesso | ☐ |
| 6.5 | Testar em produção: login, uma criação (ex.: aluno), uma edição e uma exclusão, e checagem de permissão (aluno acessando rota só de mestre) | ☐ |
| 6.6 | Confirmar que não há dados mockados em produção (Relatórios, Dashboard, Conquistas, Progresso já ajustados para dados reais ou estado vazio) | ☐ |

---

## Resumo de ações prioritárias

1. **Segurança**
   - Mover Supabase URL e Anon Key para `import.meta.env.VITE_*` e configurar env no build de produção.
   - Revisar políticas RLS no Supabase, em especial as “Everyone can …” em `students`, `graduations` e tabelas de evolução.

2. **Deploy**
   - Garantir que o servidor (Nginx/Apache) está configurado para servir o build em `/tatame/` (ou no path definido em `base`) e com fallback SPA para `index.html`.

3. **Ambiente**
   - Manter `.env` e arquivos de ambiente sensíveis fora do repositório (já cobertos pelo `.gitignore` atualizado).

4. **Autorização**
   - Rota `/unauthorized` e página `Unauthorized` criadas; `ProtectedRoute` já redireciona para ela quando o perfil não está em `allowedUserTypes`.

---

*Documento gerado para checkup de produção. Marque cada item após verificação ou correção.*
