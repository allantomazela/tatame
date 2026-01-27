-- =========================================
-- RLS: Restringir políticas "Everyone" por papel (mestre/aluno/responsável)
-- Substitui políticas permissivas em students, graduations e tabelas de evolução.
-- =========================================

-- ---------------------------------------------------------------
-- 1. STUDENTS – Remover "Everyone" e políticas antigas; criar por papel
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Everyone can view students" ON public.students;
DROP POLICY IF EXISTS "Everyone can create students" ON public.students;
DROP POLICY IF EXISTS "Everyone can update students" ON public.students;
DROP POLICY IF EXISTS "Mestres can manage students" ON public.students;
DROP POLICY IF EXISTS "Students can view own record" ON public.students;
DROP POLICY IF EXISTS "Responsaveis can view their students" ON public.students;

CREATE POLICY "Mestres can manage students" ON public.students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

CREATE POLICY "Students can view own record" ON public.students
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Responsaveis can view their students" ON public.students
  FOR SELECT USING (responsible_id = auth.uid());

-- ---------------------------------------------------------------
-- 2. GRADUATIONS – Remover "Everyone"/"Temp" e restaurar políticas por papel
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Everyone can create graduations" ON public.graduations;
DROP POLICY IF EXISTS "Everyone can update graduations" ON public.graduations;
DROP POLICY IF EXISTS "Everyone can delete graduations" ON public.graduations;
DROP POLICY IF EXISTS "Temp access graduations" ON public.graduations;
DROP POLICY IF EXISTS "Mestres manage graduations" ON public.graduations;
DROP POLICY IF EXISTS "Students can view own graduations" ON public.graduations;
DROP POLICY IF EXISTS "Responsaveis can view graduations of their students" ON public.graduations;

CREATE POLICY "Mestres manage graduations" ON public.graduations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

CREATE POLICY "Students can view own graduations" ON public.graduations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE id = student_id AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Responsaveis can view graduations of their students" ON public.graduations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE id = student_id AND responsible_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------
-- 3. Tabelas de evolução – Remover "Everyone" e criar políticas por papel
-- ---------------------------------------------------------------

-- student_evaluations
DROP POLICY IF EXISTS "Everyone can access student evaluations" ON public.student_evaluations;
DROP POLICY IF EXISTS "Mestres can manage student evaluations" ON public.student_evaluations;
DROP POLICY IF EXISTS "Students can view own evaluations" ON public.student_evaluations;
DROP POLICY IF EXISTS "Responsaveis can view evaluations of their students" ON public.student_evaluations;

CREATE POLICY "Mestres can manage student evaluations" ON public.student_evaluations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

CREATE POLICY "Students can view own evaluations" ON public.student_evaluations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE id = student_id AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Responsaveis can view evaluations of their students" ON public.student_evaluations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE id = student_id AND responsible_id = auth.uid()
    )
  );

-- student_goals
DROP POLICY IF EXISTS "Everyone can access student goals" ON public.student_goals;
DROP POLICY IF EXISTS "Mestres can manage student goals" ON public.student_goals;
DROP POLICY IF EXISTS "Students can view own goals" ON public.student_goals;
DROP POLICY IF EXISTS "Responsaveis can view goals of their students" ON public.student_goals;

CREATE POLICY "Mestres can manage student goals" ON public.student_goals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

CREATE POLICY "Students can view own goals" ON public.student_goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE id = student_id AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Responsaveis can view goals of their students" ON public.student_goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE id = student_id AND responsible_id = auth.uid()
    )
  );

-- student_achievements
DROP POLICY IF EXISTS "Everyone can access student achievements" ON public.student_achievements;
DROP POLICY IF EXISTS "Mestres can manage student achievements" ON public.student_achievements;
DROP POLICY IF EXISTS "Students can view own achievements" ON public.student_achievements;
DROP POLICY IF EXISTS "Responsaveis can view achievements of their students" ON public.student_achievements;

CREATE POLICY "Mestres can manage student achievements" ON public.student_achievements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

CREATE POLICY "Students can view own achievements" ON public.student_achievements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE id = student_id AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Responsaveis can view achievements of their students" ON public.student_achievements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE id = student_id AND responsible_id = auth.uid()
    )
  );

-- student_competitions
DROP POLICY IF EXISTS "Everyone can access student competitions" ON public.student_competitions;
DROP POLICY IF EXISTS "Mestres can manage student competitions" ON public.student_competitions;
DROP POLICY IF EXISTS "Students can view own competitions" ON public.student_competitions;
DROP POLICY IF EXISTS "Responsaveis can view competitions of their students" ON public.student_competitions;

CREATE POLICY "Mestres can manage student competitions" ON public.student_competitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

CREATE POLICY "Students can view own competitions" ON public.student_competitions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE id = student_id AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Responsaveis can view competitions of their students" ON public.student_competitions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE id = student_id AND responsible_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------
-- 4. PROFILES – Restringir insert/view/update por papel
-- Mantém: próprio perfil; mestre cria/vê/atualiza perfis (ex.: aluno);
-- responsável vê apenas perfis dos alunos vinculados.
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own or mestre inserts" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Mestres can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Responsaveis can view linked profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Mestres can update profiles" ON public.profiles;

-- INSERT: próprio perfil (signup/trigger) ou mestre criando perfil de aluno
CREATE POLICY "Users can insert own or mestre inserts" ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'mestre'
    )
  );

-- SELECT: próprio perfil, mestre vê todos, responsável vê perfis dos alunos vinculados
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Mestres can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'mestre'
    )
  );

CREATE POLICY "Responsaveis can view linked profiles" ON public.profiles
  FOR SELECT USING (
    id IN (
      SELECT profile_id FROM public.students WHERE responsible_id = auth.uid()
    )
  );

-- UPDATE: próprio perfil ou mestre (para editar perfis de alunos)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Mestres can update profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'mestre'
    )
  );
