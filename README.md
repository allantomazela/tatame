# Tatame - Sistema de Gestão para Artes Marciais

Sistema completo de gestão para academias de artes marciais, desenvolvido com React, TypeScript, Vite e Supabase.

## 📋 Estado Atual do Projeto

### ✅ Funcionalidades Implementadas

#### Autenticação e Usuários
- ✅ Sistema de autenticação com Supabase (Email/Senha e Google OAuth)
- ✅ Tipos de usuário: Mestre, Aluno e Responsável
- ✅ Proteção de rotas baseada em tipo de usuário
- ✅ Gerenciamento de perfis de usuário

#### Módulos Principais
- ✅ **Dashboard**: Visão geral com estatísticas e atividades recentes
- ✅ **Gestão de Alunos**: CRUD completo de alunos (apenas para mestres)
- ✅ **Mensagens**: Sistema de comunicação entre usuários
- ✅ **Evolução**: Acompanhamento do progresso dos alunos
- ✅ **Graduações**: Gerenciamento de faixas e graduações (apenas para mestres)
- ✅ **Agenda**: Calendário de aulas e eventos
- ✅ **Progresso**: Acompanhamento individual do progresso
- ✅ **Conquistas**: Sistema de badges e conquistas
- ✅ **Relatórios**: Análises e relatórios (apenas para mestres)
- ✅ **Configurações**: Configurações do sistema
- ✅ **Minhas Turmas**: Gerenciamento de turmas (apenas para mestres)

#### PWA (Instalar como app)
- ✅ **Vite PWA** (`vite-plugin-pwa`): service worker com atualização automática, cache de assets e da API Supabase
- ✅ **Manifest** (`public/manifest.json`): nome, ícones, tema e modo standalone
- ✅ **Instalar app**: banner "Instalar Tatame" em dispositivos móveis (quando o navegador dispara `beforeinstallprompt`)
- ✅ **Offline**: fallback para `index.html` em rotas SPA; requisições à API Supabase em cache (NetworkFirst)

#### Infraestrutura
- ✅ Banco de dados Supabase configurado
- ✅ 15 migrations aplicadas
- ✅ Estrutura de tabelas completa (profiles, students, classes, graduations, etc.)
- ✅ Sistema de autenticação e autorização
- ✅ UI moderna com shadcn/ui e Tailwind CSS

### 🚧 Próximos Passos Sugeridos

1. **Variáveis de Ambiente**
   - Mover credenciais do Supabase para arquivo `.env`
   - Criar arquivos `.env-dev`, `.env-homolog`, `.env-prod`

2. **Testes**
   - Implementar testes unitários
   - Testes de integração para fluxos críticos
   - Testes E2E para jornadas principais

3. **Melhorias de Segurança**
   - Implementar Row Level Security (RLS) no Supabase
   - Validação de dados no servidor
   - Sanitização de inputs

4. **Performance**
   - Implementar cache com React Query
   - Otimização de imagens
   - Lazy loading de componentes

5. **Documentação**
   - Documentação da API
   - Guia de contribuição
   - Documentação de componentes

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js 18+ e npm (ou yarn/pnpm)
- Conta no Supabase (já configurada)

### Instalação

```bash
# 1. Clone o repositório
git clone <YOUR_GIT_URL>
cd kicksensei-connect

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:8080`

### Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run build:dev    # Build em modo desenvolvimento
npm run preview      # Preview do build de produção
npm run lint         # Executa o linter
```

### Instalar como app (PWA)

No **celular**, abra o Tatame no navegador (Chrome/Edge Android ou Safari iOS). Se o navegador suportar, aparecerá um banner **"Instalar Tatame"**; toque em **Instalar** para adicionar à tela inicial. Em iOS: Safari → Compartilhar → "Adicionar à Tela de Início". O service worker é registrado automaticamente no build de produção e mantém o app atualizado.

## 📁 Estrutura do Projeto

```
kicksensei-connect/
├── src/
│   ├── components/          # Componentes React
│   │   ├── auth/           # Componentes de autenticação
│   │   ├── layout/          # Componentes de layout
│   │   ├── messaging/       # Componentes de mensagens
│   │   └── ui/              # Componentes UI (shadcn/ui)
│   ├── hooks/               # Custom hooks
│   ├── integrations/        # Integrações externas
│   │   └── supabase/        # Cliente Supabase
│   ├── lib/                 # Utilitários
│   ├── pages/               # Páginas da aplicação
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globais
├── supabase/
│   ├── migrations/          # Migrations do banco de dados
│   └── config.toml          # Configuração do Supabase
├── public/                  # Arquivos estáticos
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18.3** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite 5.4** - Build tool e dev server
- **React Router 6.30** - Roteamento
- **TanStack Query 5.83** - Gerenciamento de estado servidor
- **shadcn/ui** - Componentes UI
- **Tailwind CSS 3.4** - Estilização
- **React Hook Form 7.61** - Formulários
- **Zod 3.25** - Validação de schemas

### Backend
- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL Database
  - Authentication
  - Real-time subscriptions
  - Storage

## 🗄️ Estrutura do Banco de Dados

O banco de dados inclui as seguintes tabelas principais:

- `profiles` - Perfis de usuário
- `students` - Dados dos alunos
- `classes` - Turmas/aulas
- `graduations` - Graduações e faixas
- `attendance` - Controle de presença
- `messages` - Sistema de mensagens
- `achievements` - Conquistas e badges
- `payments` - Controle financeiro

Veja `database-setup.sql` para a estrutura completa.

## 🔐 Configuração do Supabase

As credenciais do Supabase estão atualmente hardcoded em `src/integrations/supabase/client.ts`.

**⚠️ IMPORTANTE**: Para produção, mova essas credenciais para variáveis de ambiente:

1. Crie arquivo `.env.local`:
```env
VITE_SUPABASE_URL=https://hsqlsrdsljlvideihevy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. Atualize `src/integrations/supabase/client.ts` para usar:
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

## 📝 Páginas e Rotas

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/` | Página inicial | Público |
| `/login` | Login/Cadastro | Público |
| `/dashboard` | Dashboard principal | Autenticado |
| `/alunos` | Gestão de alunos | Mestre |
| `/mensagens` | Sistema de mensagens | Autenticado |
| `/evolucao` | Evolução dos alunos | Autenticado |
| `/progresso` | Progresso individual | Autenticado |
| `/graduacoes` | Gerenciamento de graduações | Mestre |
| `/agenda` | Calendário de aulas | Autenticado |
| `/conquistas` | Sistema de conquistas | Autenticado |
| `/relatorios` | Relatórios e análises | Mestre |
| `/configuracoes` | Configurações | Autenticado |
| `/minhas-turmas` | Gerenciamento de turmas | Mestre |

## 🎨 Design System

O projeto utiliza um design system baseado em cores tradicionais coreanas:

- **Primary**: Preto tradicional (Taekwondo)
- **Secondary**: Vermelho coreano tradicional
- **Accent**: Azul coreano
- **Success**: Azul coreano (variação)
- **Warning**: Amarelo dourado

Veja `src/index.css` para todas as variáveis CSS customizadas.

## 📦 Dependências Principais

### Produção
- `@supabase/supabase-js` - Cliente Supabase
- `@tanstack/react-query` - Gerenciamento de estado servidor
- `react-router-dom` - Roteamento
- `react-hook-form` + `zod` - Formulários e validação
- `lucide-react` - Ícones
- `date-fns` - Manipulação de datas
- `recharts` - Gráficos

### Desenvolvimento
- `vite` - Build tool
- `vite-plugin-pwa` - PWA (service worker, manifest, cache)
- `typescript` - TypeScript
- `tailwindcss` - CSS framework
- `eslint` - Linter

## 🔄 Migrations do Banco de Dados

O projeto possui 15 migrations aplicadas. Para aplicar novas migrations:

```bash
# Usando Supabase CLI
supabase migration up

# Ou via dashboard do Supabase
```

## 🐛 Troubleshooting

### Erro ao conectar com Supabase
- Verifique se as credenciais estão corretas
- Verifique se o projeto Supabase está ativo
- Verifique a conexão com a internet

### Erro de build
```bash
# Limpe o cache e reinstale dependências
rm -rf node_modules package-lock.json
npm install
```

### Porta 8080 já em uso
Edite `vite.config.ts` e altere a porta:
```typescript
server: {
  port: 3000, // ou outra porta disponível
}
```

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Contribuindo

Este é um projeto privado. Para contribuições, entre em contato com a equipe de desenvolvimento.

## 🔗 Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação React](https://react.dev)
- [Documentação Vite](https://vitejs.dev)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Última atualização**: Janeiro 2025
**Versão**: 0.0.0 (Desenvolvimento)
