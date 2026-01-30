-- =============================================
-- Substitutos por polo: mestre pode ser responsável
-- por vários polos ou substituto em emergência.
-- =============================================

CREATE TABLE IF NOT EXISTS public.polo_substitutes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  polo_id UUID NOT NULL REFERENCES public.polos(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(polo_id, profile_id)
);

COMMENT ON TABLE public.polo_substitutes IS 'Instrutores/mestres que podem substituir no polo em caso de emergência';
COMMENT ON COLUMN public.polo_substitutes.profile_id IS 'Perfil do mestre/instrutor substituto';

CREATE INDEX idx_polo_substitutes_polo_id ON public.polo_substitutes(polo_id);
CREATE INDEX idx_polo_substitutes_profile_id ON public.polo_substitutes(profile_id);

ALTER TABLE public.polo_substitutes ENABLE ROW LEVEL SECURITY;

-- Mestres podem gerenciar todos os substitutos
CREATE POLICY "Mestres can manage polo substitutes" ON public.polo_substitutes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'mestre'
    )
  );

-- Responsável pelo polo pode gerenciar substitutos do seu polo
CREATE POLICY "Polo responsible can manage substitutes" ON public.polo_substitutes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.polos
      WHERE id = polo_substitutes.polo_id AND responsible_id = auth.uid()
    )
  );

-- Substitutos podem ver sua própria relação
CREATE POLICY "Substitutes can view own" ON public.polo_substitutes
  FOR SELECT USING (profile_id = auth.uid());
