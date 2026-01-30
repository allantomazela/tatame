-- Permite que alunos vejam perfis de mestres e que qualquer usuário veja o perfil
-- de pessoas com quem já trocou mensagens (para a lista de conversas e chat).
-- Corrige: mensagem enviada ao aluno não aparecia no login do aluno (RLS bloqueava
-- o join em profiles do remetente).

CREATE OR REPLACE FUNCTION public.can_view_profile(target_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF target_id IS NULL THEN
    RETURN false;
  END IF;
  -- próprio perfil
  IF target_id = auth.uid() THEN
    RETURN true;
  END IF;
  -- mestre vê todos
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'mestre') THEN
    RETURN true;
  END IF;
  -- responsável vê perfis dos alunos vinculados
  IF EXISTS (
    SELECT 1 FROM public.students
    WHERE profile_id = target_id AND responsible_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;
  -- aluno vê perfil de mestre (para iniciar conversa e ver nome na lista de mensagens)
  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'aluno'
  ) AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = target_id AND user_type = 'mestre'
  ) THEN
    RETURN true;
  END IF;
  -- qualquer usuário vê perfil de quem já trocou mensagens com ele
  IF EXISTS (
    SELECT 1 FROM public.messages
    WHERE (sender_id = auth.uid() AND recipient_id = target_id)
       OR (recipient_id = auth.uid() AND sender_id = target_id)
    LIMIT 1
  ) THEN
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

COMMENT ON FUNCTION public.can_view_profile(uuid) IS 'Usado na política SELECT de profiles. Inclui: próprio perfil, mestre vê todos, responsável vê alunos, aluno vê mestre, e parceiros de conversa (mensagens).';
