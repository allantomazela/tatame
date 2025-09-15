-- Criar tabela para avaliações de evolução dos alunos
CREATE TABLE public.student_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  instructor_id UUID,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Aspectos técnicos (0-10)
  poomsae_score DECIMAL(3,1) DEFAULT 0,
  kicks_score DECIMAL(3,1) DEFAULT 0,
  punches_score DECIMAL(3,1) DEFAULT 0,
  blocks_score DECIMAL(3,1) DEFAULT 0,
  stances_score DECIMAL(3,1) DEFAULT 0,
  balance_score DECIMAL(3,1) DEFAULT 0,
  flexibility_score DECIMAL(3,1) DEFAULT 0,
  strength_score DECIMAL(3,1) DEFAULT 0,
  speed_score DECIMAL(3,1) DEFAULT 0,
  precision_score DECIMAL(3,1) DEFAULT 0,
  
  -- Aspectos de combate (0-10)
  sparring_technique DECIMAL(3,1) DEFAULT 0,
  sparring_strategy DECIMAL(3,1) DEFAULT 0,
  sparring_defense DECIMAL(3,1) DEFAULT 0,
  sparring_control DECIMAL(3,1) DEFAULT 0,
  sparring_attitude DECIMAL(3,1) DEFAULT 0,
  
  -- Aspectos mentais e disciplinares (0-10)
  discipline_score DECIMAL(3,1) DEFAULT 0,
  respect_score DECIMAL(3,1) DEFAULT 0,
  focus_score DECIMAL(3,1) DEFAULT 0,
  improvement_attitude DECIMAL(3,1) DEFAULT 0,
  self_confidence DECIMAL(3,1) DEFAULT 0,
  
  -- Observações e metas
  observations TEXT,
  strengths TEXT,
  areas_for_improvement TEXT,
  short_term_goals TEXT,
  long_term_goals TEXT,
  
  -- Meta dados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para metas específicas dos alunos
CREATE TABLE public.student_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  instructor_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'technique', 'physical', 'mental', 'competition'
  target_date DATE,
  current_progress INTEGER DEFAULT 0, -- 0-100
  completed BOOLEAN DEFAULT false,
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para conquistas/achievements
CREATE TABLE public.student_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  achievement_type TEXT NOT NULL, -- 'belt', 'competition', 'milestone', 'technique'
  title TEXT NOT NULL,
  description TEXT,
  achievement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  points INTEGER DEFAULT 0, -- pontuação para gamificação
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para competições e resultados
CREATE TABLE public.student_competitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  competition_name TEXT NOT NULL,
  competition_date DATE NOT NULL,
  category TEXT, -- poomsae, sparring, breaking, etc.
  division TEXT, -- weight/age division
  position INTEGER, -- 1st, 2nd, 3rd, etc.
  total_participants INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.student_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_competitions ENABLE ROW LEVEL SECURITY;

-- Criar políticas para acesso completo temporário
CREATE POLICY "Everyone can access student evaluations" 
ON public.student_evaluations 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Everyone can access student goals" 
ON public.student_goals 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Everyone can access student achievements" 
ON public.student_achievements 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Everyone can access student competitions" 
ON public.student_competitions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Criar triggers para updated_at
CREATE TRIGGER update_student_evaluations_updated_at
BEFORE UPDATE ON public.student_evaluations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_goals_updated_at
BEFORE UPDATE ON public.student_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();