-- =========================================
-- SISTEMA TATAME - ESTRUTURA DE BANCO DE DADOS
-- =========================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- 1. TABELA DE PERFIS DE USUÁRIO
-- =========================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_type TEXT NOT NULL CHECK (user_type IN ('mestre', 'aluno', 'responsavel')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  birth_date DATE,
  address TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 2. TABELA DE ALUNOS
-- =========================================
CREATE TABLE public.students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  belt_color TEXT NOT NULL DEFAULT 'branca',
  belt_degree INTEGER NOT NULL DEFAULT 1,
  date_joined DATE NOT NULL DEFAULT CURRENT_DATE,
  responsible_id UUID REFERENCES public.profiles(id),
  medical_info TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  monthly_fee DECIMAL(10,2),
  payment_due_date INTEGER DEFAULT 5, -- dia do mês
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 3. TABELA DE TURMAS/AULAS
-- =========================================
CREATE TABLE public.classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES public.profiles(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=domingo
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_students INTEGER DEFAULT 20,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 4. TABELA DE MATRÍCULAS EM TURMAS
-- =========================================
CREATE TABLE public.class_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(student_id, class_id)
);

-- =========================================
-- 5. TABELA DE PRESENÇAS
-- =========================================
CREATE TABLE public.attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  present BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, class_id, date)
);

-- =========================================
-- 6. TABELA DE GRADUAÇÕES
-- =========================================
CREATE TABLE public.graduations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  belt_color TEXT NOT NULL,
  belt_degree INTEGER NOT NULL,
  graduation_date DATE NOT NULL,
  instructor_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 7. TABELA DE MENSAGENS
-- =========================================
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  message_type TEXT DEFAULT 'general' CHECK (message_type IN ('general', 'announcement', 'payment_reminder', 'absence_notice')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- =========================================
-- 8. TABELA DE PAGAMENTOS
-- =========================================
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'pix', 'transfer', 'other')),
  reference_month DATE, -- mês de referência (YYYY-MM-01)
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 9. TABELA DE EVENTOS
-- =========================================
CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  event_type TEXT DEFAULT 'general' CHECK (event_type IN ('general', 'competition', 'seminar', 'graduation', 'party')),
  organizer_id UUID REFERENCES public.profiles(id),
  max_participants INTEGER,
  registration_fee DECIMAL(10,2),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 10. TABELA DE INSCRIÇÕES EM EVENTOS
-- =========================================
CREATE TABLE public.event_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  UNIQUE(event_id, participant_id)
);

-- =========================================
-- FUNCTIONS E TRIGGERS
-- =========================================

-- Function para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graduations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

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

-- Políticas para MESSAGES
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update received messages" ON public.messages
  FOR UPDATE USING (recipient_id = auth.uid());

-- Políticas para outras tabelas (acesso por mestres)
CREATE POLICY "Mestres manage attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

CREATE POLICY "Mestres manage graduations" ON public.graduations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

CREATE POLICY "Mestres manage payments" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

-- =========================================
-- ÍNDICES PARA PERFORMANCE
-- =========================================
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX idx_students_profile_id ON public.students(profile_id);
CREATE INDEX idx_students_responsible_id ON public.students(responsible_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_attendance_student_class ON public.attendance(student_id, class_id);
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_payments_student ON public.payments(student_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_events_date ON public.events(event_date);

-- =========================================
-- DADOS INICIAIS (OPCIONAL)
-- =========================================

-- Inserir cores de faixas disponíveis
CREATE TABLE public.belt_colors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  color TEXT NOT NULL UNIQUE,
  order_sequence INTEGER NOT NULL,
  description TEXT
);

INSERT INTO public.belt_colors (color, order_sequence, description) VALUES
  ('branca', 1, 'Faixa Branca - Iniciante'),
  ('amarela', 2, 'Faixa Amarela'),
  ('laranja', 3, 'Faixa Laranja'),
  ('verde', 4, 'Faixa Verde'),
  ('azul', 5, 'Faixa Azul'),
  ('marrom', 6, 'Faixa Marrom'),
  ('preta', 7, 'Faixa Preta');

-- Comentários nas tabelas
COMMENT ON TABLE public.profiles IS 'Perfis de usuários do sistema (mestres, alunos, responsáveis)';
COMMENT ON TABLE public.students IS 'Dados específicos dos alunos';
COMMENT ON TABLE public.classes IS 'Turmas e horários de aulas';
COMMENT ON TABLE public.attendance IS 'Controle de presença dos alunos';
COMMENT ON TABLE public.graduations IS 'Histórico de graduações/faixas';
COMMENT ON TABLE public.messages IS 'Sistema de mensagens entre usuários';
COMMENT ON TABLE public.payments IS 'Controle de pagamentos e mensalidades';
COMMENT ON TABLE public.events IS 'Eventos, competições e seminários';