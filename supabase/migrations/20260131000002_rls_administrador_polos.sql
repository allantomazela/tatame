-- =============================================
-- RLS: permitir administrador nas mesmas políticas
-- que mestre (polos, student_polos, training_sessions,
-- polo_schedules, polo_substitutes).
-- =============================================

-- POLOS: gerenciar (INSERT/UPDATE/DELETE/SELECT para gestão)
DROP POLICY IF EXISTS "Mestres can manage all polos" ON public.polos;
CREATE POLICY "Mestres and admins can manage all polos" ON public.polos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type IN ('mestre', 'administrador')
    )
  );

-- STUDENT_POLOS
DROP POLICY IF EXISTS "Mestres can manage student polos" ON public.student_polos;
CREATE POLICY "Mestres and admins can manage student polos" ON public.student_polos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type IN ('mestre', 'administrador')
    )
  );

-- TRAINING_SESSIONS
DROP POLICY IF EXISTS "Mestres can manage training sessions" ON public.training_sessions;
CREATE POLICY "Mestres and admins can manage training sessions" ON public.training_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type IN ('mestre', 'administrador')
    )
  );

-- POLO_SCHEDULES
DROP POLICY IF EXISTS "Mestres can manage polo schedules" ON public.polo_schedules;
CREATE POLICY "Mestres and admins can manage polo schedules" ON public.polo_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type IN ('mestre', 'administrador')
    )
  );

-- POLO_SUBSTITUTES
DROP POLICY IF EXISTS "Mestres can manage polo substitutes" ON public.polo_substitutes;
CREATE POLICY "Mestres and admins can manage polo substitutes" ON public.polo_substitutes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type IN ('mestre', 'administrador')
    )
  );
