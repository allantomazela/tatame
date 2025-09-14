-- Corrigir recursão infinita nas políticas RLS
-- Primeiro, remover as políticas problemáticas
DROP POLICY IF EXISTS "Mestres can view all profiles" ON public.profiles;

-- Criar função security definer para obter o tipo de usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_type()
RETURNS TEXT AS $$
  SELECT user_type FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Recriar a política sem recursão
CREATE POLICY "Mestres can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR public.get_current_user_type() = 'mestre'
  );

-- Aplicar o mesmo padrão para outras políticas problemáticas
DROP POLICY IF EXISTS "Mestres can manage students" ON public.students;
CREATE POLICY "Mestres can manage students" ON public.students
  FOR ALL USING (public.get_current_user_type() = 'mestre');

DROP POLICY IF EXISTS "Mestres can manage classes" ON public.classes;
CREATE POLICY "Mestres can manage classes" ON public.classes
  FOR ALL USING (public.get_current_user_type() = 'mestre');

DROP POLICY IF EXISTS "Mestres can manage class enrollments" ON public.class_enrollments;
CREATE POLICY "Mestres can manage class enrollments" ON public.class_enrollments
  FOR ALL USING (public.get_current_user_type() = 'mestre');

DROP POLICY IF EXISTS "Mestres manage attendance" ON public.attendance;
CREATE POLICY "Mestres manage attendance" ON public.attendance
  FOR ALL USING (public.get_current_user_type() = 'mestre');

DROP POLICY IF EXISTS "Mestres manage graduations" ON public.graduations;
CREATE POLICY "Mestres manage graduations" ON public.graduations
  FOR ALL USING (public.get_current_user_type() = 'mestre');

DROP POLICY IF EXISTS "Mestres manage payments" ON public.payments;
CREATE POLICY "Mestres manage payments" ON public.payments
  FOR ALL USING (public.get_current_user_type() = 'mestre');

DROP POLICY IF EXISTS "Mestres can manage events" ON public.events;
CREATE POLICY "Mestres can manage events" ON public.events
  FOR ALL USING (public.get_current_user_type() = 'mestre');

DROP POLICY IF EXISTS "Mestres can manage event registrations" ON public.event_registrations;
CREATE POLICY "Mestres can manage event registrations" ON public.event_registrations
  FOR ALL USING (public.get_current_user_type() = 'mestre');

DROP POLICY IF EXISTS "Mestres can manage belt colors" ON public.belt_colors;
CREATE POLICY "Mestres can manage belt colors" ON public.belt_colors
  FOR ALL USING (public.get_current_user_type() = 'mestre');