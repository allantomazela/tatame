import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import type { Student } from '@/hooks/useStudents';

/**
 * Retorna o registro de aluno do usuário logado quando o perfil é "aluno".
 * Usado na página Evolução para exibir apenas os dados do próprio aluno, sem seletor.
 */
export function useCurrentStudent() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, userType } = useSupabaseAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (userType !== 'aluno' || !user) {
      setStudent(null);
      setLoading(false);
      return;
    }

    const fetchCurrentStudent = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('students')
          .select(`
            *,
            profile:profiles!students_profile_id_fkey (
              id,
              full_name,
              email,
              phone,
              birth_date,
              address,
              emergency_contact
            )
          `)
          .eq('profile_id', user.id)
          .eq('active', true)
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar aluno do perfil:', error);
          toast({
            title: "Erro ao carregar seus dados",
            description: "Não foi possível carregar o registro de aluno.",
            variant: "destructive",
          });
          setStudent(null);
          return;
        }

        setStudent((data as unknown as Student) ?? null);
      } catch {
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, userType]);

  return { student, loading };
}
