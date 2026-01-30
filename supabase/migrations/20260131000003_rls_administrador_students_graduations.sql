-- =============================================
-- RLS: permitir administrador nas mesmas políticas
-- que mestre (students, graduations, evolução,
-- attendance, class_enrollments).
-- Necessário para chamada de presença e gestão
-- de alunos funcionarem para administrador.
-- =============================================

-- STUDENTS
DROP POLICY IF EXISTS "Mestres can manage students" ON public.students;
CREATE POLICY "Mestres and admins can manage students" ON public.students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type IN ('mestre', 'administrador')
    )
  );

-- GRADUATIONS
DROP POLICY IF EXISTS "Mestres manage graduations" ON public.graduations;
CREATE POLICY "Mestres and admins manage graduations" ON public.graduations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type IN ('mestre', 'administrador')
    )
  );

-- STUDENT_EVALUATIONS
DROP POLICY IF EXISTS "Mestres can manage student evaluations" ON public.student_evaluations;
CREATE POLICY "Mestres and admins can manage student evaluations" ON public.student_evaluations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type IN ('mestre', 'administrador')
    )
  );

-- STUDENT_GOALS
DROP POLICY IF EXISTS "Mestres can manage student goals" ON public.student_goals;
CREATE POLICY "Mestres and admins can manage student goals" ON public.student_goals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type IN ('mestre', 'administrador')
    )
  );

-- STUDENT_ACHIEVEMENTS
DROP POLICY IF EXISTS "Mestres can manage student achievements" ON public.student_achievements;
CREATE POLICY "Mestres and admins can manage student achievements" ON public.student_achievements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type IN ('mestre', 'administrador')
    )
  );

-- STUDENT_COMPETITIONS
DROP POLICY IF EXISTS "Mestres can manage student competitions" ON public.student_competitions;
CREATE POLICY "Mestres and admins can manage student competitions" ON public.student_competitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type IN ('mestre', 'administrador')
    )
  );

-- ATTENDANCE (chamada de presença)
DROP POLICY IF EXISTS "Mestres manage attendance" ON public.attendance;
CREATE POLICY "Mestres and admins manage attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type IN ('mestre', 'administrador')
    )
  );

-- CLASS_ENROLLMENTS
DROP POLICY IF EXISTS "Mestres can manage class enrollments" ON public.class_enrollments;
CREATE POLICY "Mestres and admins can manage class enrollments" ON public.class_enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type IN ('mestre', 'administrador')
    )
  );
