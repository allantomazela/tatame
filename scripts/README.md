# Scripts de Setup - Tatame

## Criar Usuário Mestre

Este diretório contém scripts para criar um usuário mestre com acesso máximo ao sistema.

### Opção 1: Script SQL (Recomendado)

**Arquivo**: `criar-usuario-mestre.sql`

**Como usar:**
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Abra o arquivo `scripts/criar-usuario-mestre.sql`
5. **ALTERE** os valores marcados com `-- ALTERE AQUI:`
   - Email do administrador
   - Senha do administrador
   - Nome completo
6. Execute o script
7. Use as credenciais criadas para fazer login

**Vantagens:**
- ✅ Mais seguro
- ✅ Funciona mesmo se o email já estiver cadastrado
- ✅ Permite criar usuário sem confirmação de email

### Opção 2: Script Node.js

**Arquivo**: `criar-usuario-mestre.js`

**Como usar:**
1. Abra o arquivo `scripts/criar-usuario-mestre.js`
2. **ALTERE** as configurações na seção `CONFIG`:
   ```javascript
   const CONFIG = {
     email: 'admin@tatame.com',
     password: 'SenhaSegura123!',
     fullName: 'Administrador',
     phone: ''
   };
   ```
3. Execute o script:
   ```bash
   node scripts/criar-usuario-mestre.js
   ```
4. Use as credenciais criadas para fazer login

**Vantagens:**
- ✅ Mais rápido
- ✅ Pode ser executado localmente
- ⚠️ Pode exigir confirmação de email

## Credenciais Padrão (Altere antes de usar!)

- **Email**: `admin@tatame.com`
- **Senha**: `SenhaSegura123!`
- **Nome**: `Administrador`
- **Tipo**: `mestre`

⚠️ **IMPORTANTE**: Altere essas credenciais antes de usar em produção!

## Após Criar o Usuário

1. Acesse: `http://localhost:8080/login`
2. Faça login com as credenciais criadas
3. Você terá acesso a todas as funcionalidades de mestre:
   - Gestão de Alunos
   - Graduações
   - Relatórios
   - Minhas Turmas
   - E muito mais!

## Troubleshooting

### Usuário já existe
- Use o script SQL para atualizar o tipo de usuário
- Ou use o SQL Editor para resetar a senha

### Email não confirmado
- Verifique a caixa de entrada do email
- Ou use o SQL Editor para confirmar manualmente:
  ```sql
  UPDATE auth.users 
  SET email_confirmed_at = NOW() 
  WHERE email = 'admin@tatame.com';
  ```

### Erro de permissão
- Verifique se o RLS (Row Level Security) está configurado corretamente
- Verifique se o trigger `handle_new_user()` está funcionando

