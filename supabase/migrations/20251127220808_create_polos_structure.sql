-- =========================================
-- SISTEMA DE POLOS/DOJANGS E AGENDAS
-- =========================================

-- =========================================
-- 1. TABELA DE POLOS/DOJANGS
-- =========================================
CREATE TABLE public.polos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  responsible_id UUID REFERENCES public.profiles(id),
  max_capacity INTEGER NOT NULL DEFAULT 30,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name)
);

COMMENT ON TABLE public.polos IS 'Polos/Dojangs onde acontecem os treinos';
COMMENT ON COLUMN public.polos.name IS 'Nome do polo/dojang';
COMMENT ON COLUMN public.polos.address IS 'Endereço completo do polo';
COMMENT ON COLUMN public.polos.responsible_id IS 'ID do responsável pelo polo (mestre)';
COMMENT ON COLUMN public.polos.max_capacity IS 'Capacidade máxima de alunos no polo';

-- =========================================
-- 2. TABELA DE RELAÇÃO ALUNOS-POLOS
-- =========================================
CREATE TABLE public.student_polos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  polo_id UUID REFERENCES public.polos(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, polo_id)
);

COMMENT ON TABLE public.student_polos IS 'Relação N:N entre alunos e polos';
COMMENT ON COLUMN public.student_polos.active IS 'Indica se o aluno está ativo no polo';

-- =========================================
-- 3. ATUALIZAR TABELA CLASSES PARA REFERENCIAR POLO
-- =========================================
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS polo_id UUID REFERENCES public.polos(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.classes.polo_id IS 'ID do polo onde a classe acontece';

-- =========================================
-- 4. TABELA DE SESSÕES DE TREINO
-- =========================================
CREATE TABLE public.training_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  polo_id UUID REFERENCES public.polos(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  instructor_id UUID REFERENCES public.profiles(id),
  description TEXT,
  max_participants INTEGER,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.training_sessions IS 'Sessões específicas de treino (eventos/aulas com data/hora específica)';
COMMENT ON COLUMN public.training_sessions.class_id IS 'ID da classe relacionada (opcional, pode ser sessão avulsa)';
COMMENT ON COLUMN public.training_sessions.session_date IS 'Data específica da sessão de treino';

-- =========================================
-- 5. ATUALIZAR TABELA ATTENDANCE PARA SUPORTAR SESSÕES
-- =========================================
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS training_session_id UUID REFERENCES public.training_sessions(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.attendance.training_session_id IS 'ID da sessão de treino específica (opcional, mantém compatibilidade com class_id)';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_attendance_training_session ON public.attendance(training_session_id);

-- =========================================
-- 6. TRIGGERS PARA UPDATED_AT
-- =========================================
CREATE TRIGGER update_polos_updated_at 
  BEFORE UPDATE ON public.polos 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_polos_updated_at 
  BEFORE UPDATE ON public.student_polos 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_sessions_updated_at 
  BEFORE UPDATE ON public.training_sessions 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- 7. ÍNDICES PARA PERFORMANCE
-- =========================================
CREATE INDEX idx_polos_responsible_id ON public.polos(responsible_id);
CREATE INDEX idx_polos_active ON public.polos(active);
CREATE INDEX idx_student_polos_student_id ON public.student_polos(student_id);
CREATE INDEX idx_student_polos_polo_id ON public.student_polos(polo_id);
CREATE INDEX idx_student_polos_active ON public.student_polos(active);
CREATE INDEX idx_classes_polo_id ON public.classes(polo_id);
CREATE INDEX idx_training_sessions_polo_id ON public.training_sessions(polo_id);
CREATE INDEX idx_training_sessions_class_id ON public.training_sessions(class_id);
CREATE INDEX idx_training_sessions_date ON public.training_sessions(session_date);
CREATE INDEX idx_training_sessions_active ON public.training_sessions(active);

-- =========================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =========================================

-- Habilitar RLS
ALTER TABLE public.polos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_polos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para POLOS
-- Mestres podem gerenciar todos os polos
CREATE POLICY "Mestres can manage all polos" ON public.polos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

-- Todos podem visualizar polos ativos
CREATE POLICY "Everyone can view active polos" ON public.polos
  FOR SELECT USING (active = true);

-- Instrutores podem visualizar polos onde são responsáveis
CREATE POLICY "Instructors can view their polos" ON public.polos
  FOR SELECT USING (responsible_id = auth.uid());

-- Políticas para STUDENT_POLOS
-- Mestres podem gerenciar todas as relações
CREATE POLICY "Mestres can manage student polos" ON public.student_polos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

-- Alunos podem visualizar seus próprios polos
CREATE POLICY "Students can view own polos" ON public.student_polos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE id = student_polos.student_id AND profile_id = auth.uid()
    )
  );

-- Responsáveis podem visualizar polos dos seus alunos
CREATE POLICY "Responsaveis can view their students polos" ON public.student_polos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE id = student_polos.student_id AND responsible_id = auth.uid()
    )
  );

-- Políticas para TRAINING_SESSIONS
-- Mestres podem gerenciar todas as sessões
CREATE POLICY "Mestres can manage training sessions" ON public.training_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

-- Instrutores podem gerenciar sessões onde são instrutores
CREATE POLICY "Instructors can manage their sessions" ON public.training_sessions
  FOR ALL USING (instructor_id = auth.uid());

-- Todos podem visualizar sessões ativas
CREATE POLICY "Everyone can view active training sessions" ON public.training_sessions
  FOR SELECT USING (active = true);

-- Alunos podem visualizar sessões dos seus polos
CREATE POLICY "Students can view sessions of their polos" ON public.training_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_polos sp
      JOIN public.students s ON s.id = sp.student_id
      WHERE sp.polo_id = training_sessions.polo_id 
        AND sp.active = true
        AND s.profile_id = auth.uid()
    )
  );

-- Responsáveis podem visualizar sessões dos polos dos seus alunos
CREATE POLICY "Responsaveis can view sessions of their students polos" ON public.training_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_polos sp
      JOIN public.students s ON s.id = sp.student_id
      WHERE sp.polo_id = training_sessions.polo_id 
        AND sp.active = true
        AND s.responsible_id = auth.uid()
    )
  );

