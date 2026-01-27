# 🔐 Credenciais de Acesso - Usuário Mestre

## 📋 Credenciais Padrão para Desenvolvimento

Use estas credenciais para acessar o sistema como **Mestre** (acesso máximo):

```
Email: admin@tatame.com
Senha: SenhaSegura123!
Tipo: Mestre
```

## 🚀 Como Criar o Usuário

### Opção 1: SQL Editor do Supabase (Recomendado)

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Abra o arquivo: `scripts/criar-usuario-mestre-direto.sql`
5. Cole o conteúdo no editor
6. Clique em **Run** (ou Ctrl+Enter)
7. Pronto! O usuário será criado

### Opção 2: Formulário da Aplicação

1. Acesse: http://localhost:8080/ ou http://localhost:8080/login
2. Clique na aba **"Cadastrar"**
3. Preencha:
   - Nome: `Administrador`
   - Email: `admin@tatame.com`
   - Tipo: **Mestre**
   - Senha: `SenhaSegura123!`
4. Clique em **Cadastrar**
5. Confirme o email (ou use o SQL para confirmar)

## ✅ Verificar se Funcionou

Após criar o usuário e fazer login, você deve ver:

- ✅ Menu lateral com todas as opções de mestre
- ✅ Acesso à página "Alunos" 
- ✅ Acesso à página "Graduações"
- ✅ Acesso à página "Relatórios"
- ✅ Acesso à página "Minhas Turmas"

## 🔗 Links Úteis

- **Aplicação Local (dev)**: http://localhost:8080/ ou http://localhost:8080/login
- **Se alterações não aparecem:** veja `DEV_MODO_DESENVOLVIMENTO.md`
- **Supabase Dashboard**: https://supabase.com/dashboard
- **SQL Editor**: https://supabase.com/dashboard/project/[seu-project-id]/sql

## ⚠️ Importante

- Estas credenciais são apenas para **desenvolvimento local**
- Altere as credenciais antes de usar em produção
- Mantenha as credenciais seguras

---

**Última atualização**: Janeiro 2025

