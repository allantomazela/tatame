# 🎯 Diretrizes de Desenvolvimento - Tatame

## ⚠️ PREMISSA FUNDAMENTAL

**NÃO ALTERAR NADA DO QUE JÁ ESTÁ PRONTO E FUNCIONAL**

### Regras de Ouro

1. **Preservação do Código Existente**
   - ✅ Não modificar funcionalidades que já estão funcionando
   - ✅ Não alterar a estrutura de componentes que estão operacionais
   - ✅ Não mudar lógica de negócio existente
   - ✅ Não alterar estilos/UI que já estão implementados

2. **Abordagem Conservadora**
   - ✅ Fazer apenas ajustes quando explicitamente solicitado
   - ✅ Implementar novas features com máximo cuidado
   - ✅ Manter o conceito e objetivo da aplicação intactos
   - ✅ Preservar a arquitetura e padrões já estabelecidos

3. **Implementações Novas**
   - ✅ Adicionar código novo sem modificar o existente
   - ✅ Estender funcionalidades sem quebrar as atuais
   - ✅ Criar novos componentes seguindo os padrões existentes
   - ✅ Manter consistência com o design system atual

4. **Ajustes Solicitados**
   - ✅ Fazer apenas os ajustes específicos pedidos
   - ✅ Não "melhorar" código que não foi solicitado
   - ✅ Não refatorar código funcional
   - ✅ Não otimizar prematuramente

## 📋 Checklist Antes de Qualquer Alteração

Antes de fazer qualquer mudança, verificar:

- [ ] A alteração foi explicitamente solicitada?
- [ ] A alteração não vai quebrar funcionalidades existentes?
- [ ] A alteração mantém o conceito e objetivo da aplicação?
- [ ] A alteração segue os padrões já estabelecidos no projeto?
- [ ] A alteração não modifica código funcional desnecessariamente?

## 🎨 Padrões a Seguir

### Estrutura de Código
- Manter a estrutura de pastas existente
- Seguir os padrões de nomenclatura já usados
- Usar os mesmos padrões de importação

### Componentes
- Seguir o padrão dos componentes existentes
- Usar os mesmos componentes UI (shadcn/ui)
- Manter consistência visual

### Hooks
- Seguir o padrão dos hooks existentes
- Usar os mesmos padrões de integração com Supabase
- Manter consistência de tratamento de erros

### Estilos
- Usar Tailwind CSS como já está sendo usado
- Manter o design system atual (cores coreanas)
- Não alterar estilos existentes

## 🚫 O Que NÃO Fazer

- ❌ Refatorar código funcional sem solicitação
- ❌ "Melhorar" código que não foi pedido
- ❌ Mudar padrões estabelecidos
- ❌ Alterar estrutura de arquivos existente
- ❌ Modificar componentes que estão funcionando
- ❌ Mudar lógica de negócio existente
- ❌ Alterar estilos/UI sem solicitação
- ❌ Otimizar prematuramente
- ❌ Adicionar features não solicitadas

## ✅ O Que Fazer

- ✅ Implementar apenas o que foi solicitado
- ✅ Adicionar código novo sem modificar o existente
- ✅ Seguir os padrões já estabelecidos
- ✅ Manter consistência com o código atual
- ✅ Preservar funcionalidades existentes
- ✅ Fazer ajustes pontuais quando solicitado
- ✅ Documentar mudanças quando necessário

## 📝 Processo de Trabalho

1. **Receber Solicitação**
   - Entender exatamente o que foi pedido
   - Identificar o que precisa ser alterado/adicionado
   - Verificar se não vai afetar código existente

2. **Planejamento**
   - Mapear o que será alterado/adicionado
   - Identificar dependências
   - Garantir que não vai quebrar nada

3. **Implementação**
   - Fazer apenas o solicitado
   - Seguir padrões existentes
   - Testar que não quebrou nada

4. **Validação**
   - Verificar que funcionalidades existentes ainda funcionam
   - Confirmar que a implementação segue os padrões
   - Garantir que o conceito da aplicação foi preservado

## 🎯 Objetivo da Aplicação

**Tatame** é um sistema completo de gestão para academias de artes marciais que permite:
- Gerenciar alunos, graduações e turmas
- Controlar presenças e evolução
- Comunicar com alunos e responsáveis
- Gerar relatórios e análises
- Acompanhar progresso e conquistas

**TODAS AS ALTERAÇÕES DEVEM PRESERVAR ESSE OBJETIVO**

---

**Última Atualização**: Janeiro 2025  
**Status**: Ativo e em vigor

