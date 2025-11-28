-- =========================================
-- HORÁRIOS FIXOS SEMANAIS POR POLO
-- =========================================

-- =========================================
-- TABELA DE HORÁRIOS FIXOS SEMANAIS
-- =========================================
CREATE TABLE public.polo_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  polo_id UUID REFERENCES public.polos(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=domingo, 6=sábado
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  instructor_id UUID REFERENCES public.profiles(id),
  description TEXT,
  max_participants INTEGER,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(polo_id, day_of_week, start_time, end_time)
);

COMMENT ON TABLE public.polo_schedules IS 'Horários fixos semanais de treino por polo';
COMMENT ON COLUMN public.polo_schedules.day_of_week IS 'Dia da semana (0=domingo, 6=sábado)';
COMMENT ON COLUMN public.polo_schedules.class_id IS 'ID da classe relacionada (opcional)';

-- =========================================
-- TRIGGER PARA UPDATED_AT
-- =========================================
CREATE TRIGGER update_polo_schedules_updated_at 
  BEFORE UPDATE ON public.polo_schedules 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- ÍNDICES PARA PERFORMANCE
-- =========================================
CREATE INDEX idx_polo_schedules_polo_id ON public.polo_schedules(polo_id);
CREATE INDEX idx_polo_schedules_day_of_week ON public.polo_schedules(day_of_week);
CREATE INDEX idx_polo_schedules_active ON public.polo_schedules(active);

-- =========================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================
ALTER TABLE public.polo_schedules ENABLE ROW LEVEL SECURITY;

-- Mestres podem gerenciar todos os horários
CREATE POLICY "Mestres can manage polo schedules" ON public.polo_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

-- Instrutores podem gerenciar horários onde são instrutores
CREATE POLICY "Instructors can manage their schedules" ON public.polo_schedules
  FOR ALL USING (instructor_id = auth.uid());

-- Todos podem visualizar horários ativos
CREATE POLICY "Everyone can view active polo schedules" ON public.polo_schedules
  FOR SELECT USING (active = true);

