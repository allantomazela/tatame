# Configuração Completa do Supabase

Este documento descreve todas as configurações necessárias para o funcionamento completo do sistema.

## ✅ Migrations Aplicadas

Todas as migrations foram aplicadas com sucesso, incluindo:
- Estrutura completa do banco de dados
- Políticas RLS otimizadas
- Índices para performance
- Funções corrigidas com search_path seguro

## 📦 Storage Buckets

### Bucket de Avatares

O bucket `avatars` precisa ser criado manualmente no Supabase Dashboard:

1. Acesse o Supabase Dashboard
2. Vá em **Storage** → **Buckets**
3. Clique em **New bucket**
4. Configure:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Sim (para permitir acesso público às imagens)
   - **File size limit**: 5 MB (recomendado)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`

### Políticas RLS para Storage

✅ **As políticas RLS do Storage já foram aplicadas via migração!**

As seguintes políticas foram criadas:
- `Users can upload own avatar` - Permite upload de avatares próprios
- `Users can update own avatar` - Permite atualização de avatares próprios
- `Users can delete own avatar` - Permite exclusão de avatares próprios
- `Public can view avatars` - Permite leitura pública de avatares

**Nota**: Estas políticas só funcionarão após criar o bucket `avatars` no Supabase Dashboard.

## 🔐 Segurança

### Funções Corrigidas

As seguintes funções foram corrigidas para usar `SET search_path = public`:
- `calculate_financial_balance()`
- `create_default_user_settings()`

### Políticas RLS Otimizadas

Todas as políticas RLS foram otimizadas para usar `(SELECT auth.uid())` em vez de `auth.uid()` diretamente, melhorando a performance em consultas grandes.

### Proteção de Senhas Comprometidas

⚠️ **Recomendado**: Ative a proteção contra senhas comprometidas no Supabase Auth:

1. Acesse o Supabase Dashboard
2. Vá em **Authentication** → **Policies**
3. Ative **"Leaked Password Protection"**
4. Isso verificará senhas contra o banco de dados HaveIBeenPwned.org

**URL de referência**: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## ⚡ Performance

### Índices Criados

Foram criados índices para todas as foreign keys identificadas pelo linter:
- `attendance`: class_id, recorded_by, training_session_id
- `class_enrollments`: class_id
- `classes`: instructor_id
- `event_registrations`: participant_id
- `events`: organizer_id
- `graduations`: instructor_id, student_id
- `payments`: recorded_by
- `polo_schedules`: class_id, instructor_id
- `training_sessions`: instructor_id

## 📋 Checklist de Configuração

- [x] Migrations aplicadas
- [x] Funções corrigidas (search_path)
- [x] Índices criados
- [x] Políticas RLS otimizadas
- [x] Políticas RLS do Storage configuradas
- [ ] Bucket `avatars` criado no Storage (manual - ver instruções abaixo)

## 🚀 Próximos Passos

1. **Criar o bucket de avatares** no Supabase Dashboard
2. **Aplicar as políticas RLS do Storage** (SQL acima)
3. **Testar o upload de avatares** na tela de Configurações
4. **Verificar se há outros buckets necessários** (ex: documentos, anexos financeiros)

## 📝 Notas

- O sistema tem fallback para usar data URLs (base64) se o bucket não existir
- As políticas RLS do Storage são importantes para segurança
- Todos os avatares devem ser públicos para exibição na interface

