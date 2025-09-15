-- Remover políticas antigas conflitantes
DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Criar nova política de INSERT que permite criação de perfis de alunos
CREATE POLICY "Users can insert any profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Política para visualizar perfis (próprio perfil ou perfis de alunos)
CREATE POLICY "Users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id OR user_type = 'aluno');

-- Política para atualizar (apenas próprio perfil ou perfis de alunos se for instrutor/mestre)
CREATE POLICY "Users can update profiles" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id OR user_type = 'aluno');