-- Remover função e todas as dependências com CASCADE
DROP FUNCTION IF EXISTS public.get_current_user_type() CASCADE;

-- Recriar políticas mais simples sem recursão
-- Para a tabela profiles, permitir apenas acesso ao próprio perfil
CREATE POLICY "Users can view own profile only" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile only" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Para students - permitir que vejam seus próprios dados
CREATE POLICY "Students can view own data" ON public.students
  FOR SELECT USING (profile_id = auth.uid());

-- Para classes - permitir que todos vejam classes ativas
CREATE POLICY "All can view active classes" ON public.classes
  FOR SELECT USING (active = true);

-- Para outras tabelas, permitir acesso básico por enquanto
CREATE POLICY "Basic access to belt colors" ON public.belt_colors
  FOR SELECT USING (true);

-- Temporariamente permitir acesso total às outras tabelas para desenvolvimento
CREATE POLICY "Temp access class enrollments" ON public.class_enrollments
  FOR SELECT USING (true);

CREATE POLICY "Temp access attendance" ON public.attendance
  FOR SELECT USING (true);

CREATE POLICY "Temp access graduations" ON public.graduations
  FOR SELECT USING (true);

CREATE POLICY "Temp access payments" ON public.payments
  FOR SELECT USING (true);

CREATE POLICY "Temp access events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Temp access event registrations" ON public.event_registrations
  FOR SELECT USING (true);