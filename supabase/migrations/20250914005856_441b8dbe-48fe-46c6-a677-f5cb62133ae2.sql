-- =========================================
-- POLÍTICAS DE SEGURANÇA RLS
-- =========================================

-- Políticas para PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Mestres can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

-- Políticas para STUDENTS
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

-- Políticas para CLASSES
CREATE POLICY "Everyone can view active classes" ON public.classes
  FOR SELECT USING (active = true);

CREATE POLICY "Mestres can manage classes" ON public.classes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

-- Políticas para CLASS_ENROLLMENTS  
CREATE POLICY "Mestres can manage class enrollments" ON public.class_enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

CREATE POLICY "Students can view their enrollments" ON public.class_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE id = student_id AND profile_id = auth.uid()
    )
  );

-- Políticas para ATTENDANCE
CREATE POLICY "Mestres manage attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

CREATE POLICY "Students can view own attendance" ON public.attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE id = student_id AND profile_id = auth.uid()
    )
  );

-- Políticas para GRADUATIONS
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

-- Políticas para MESSAGES
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update received messages" ON public.messages
  FOR UPDATE USING (recipient_id = auth.uid());

-- Políticas para PAYMENTS
CREATE POLICY "Mestres manage payments" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

CREATE POLICY "Students can view own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE id = student_id AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Responsaveis can view payments of their students" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE id = student_id AND responsible_id = auth.uid()
    )
  );

-- Políticas para EVENTS
CREATE POLICY "Everyone can view active events" ON public.events
  FOR SELECT USING (active = true);

CREATE POLICY "Mestres can manage events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

-- Políticas para EVENT_REGISTRATIONS
CREATE POLICY "Users can view their event registrations" ON public.event_registrations
  FOR SELECT USING (participant_id = auth.uid());

CREATE POLICY "Users can register for events" ON public.event_registrations
  FOR INSERT WITH CHECK (participant_id = auth.uid());

CREATE POLICY "Mestres can manage event registrations" ON public.event_registrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

-- Políticas para BELT_COLORS
CREATE POLICY "Everyone can view belt colors" ON public.belt_colors
  FOR SELECT USING (true);

CREATE POLICY "Mestres can manage belt colors" ON public.belt_colors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

-- Corrigir função para search_path seguro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'aluno'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  
  -- Se for aluno, criar registro na tabela students
  IF COALESCE(NEW.raw_user_meta_data->>'user_type', 'aluno') = 'aluno' THEN
    INSERT INTO public.students (profile_id, belt_color, belt_degree)
    VALUES (NEW.id, 'branca', 1);
  END IF;
  
  RETURN NEW;
END;
$$;