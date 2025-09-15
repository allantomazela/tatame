import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type GraduationRow = Database['public']['Tables']['graduations']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type StudentRow = Database['public']['Tables']['students']['Row'];

export interface Graduation extends GraduationRow {
  student?: StudentRow & {
    profile?: ProfileRow;
  };
  instructor?: ProfileRow;
}

export interface CreateGraduationData {
  student_id: string;
  belt_color: string;
  belt_degree: number;
  graduation_date: string;
  instructor_id?: string;
  notes?: string;
}

export function useGraduations() {
  const [graduations, setGraduations] = useState<Graduation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGraduations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('graduations')
        .select(`
          *,
          student:students!inner(
            *,
            profile:profiles(*)
          ),
          instructor:profiles!graduations_instructor_id_fkey(*)
        `)
        .order('graduation_date', { ascending: false });

      if (error) {
        console.error('Error fetching graduations:', error);
        toast({
          title: "Erro ao carregar graduações",
          description: "Não foi possível carregar a lista de graduações.",
          variant: "destructive"
        });
        return;
      }

      setGraduations((data as unknown as Graduation[]) || []);
    } catch (error) {
      console.error('Error fetching graduations:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao carregar graduações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createGraduation = async (graduationData: CreateGraduationData) => {
    try {
      // Inserir graduação
      const { data: graduationCreated, error: graduationError } = await supabase
        .from('graduations')
        .insert({
          student_id: graduationData.student_id,
          belt_color: graduationData.belt_color,
          belt_degree: graduationData.belt_degree,
          graduation_date: graduationData.graduation_date,
          instructor_id: graduationData.instructor_id || null,
          notes: graduationData.notes || null
        })
        .select()
        .single();

      if (graduationError) {
        console.error('Error creating graduation:', graduationError);
        toast({
          title: "Erro ao registrar graduação",
          description: "Não foi possível registrar a graduação.",
          variant: "destructive"
        });
        return { error: graduationError.message };
      }

      // Atualizar a faixa do aluno
      const { error: updateError } = await supabase
        .from('students')
        .update({
          belt_color: graduationData.belt_color,
          belt_degree: graduationData.belt_degree
        })
        .eq('id', graduationData.student_id);

      if (updateError) {
        console.error('Error updating student belt:', updateError);
        toast({
          title: "Graduação registrada com aviso",
          description: "Graduação criada, mas não foi possível atualizar a faixa do aluno.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Graduação registrada com sucesso!",
          description: `Graduação registrada e faixa do aluno atualizada.`
        });
      }

      // Recarregar lista
      fetchGraduations();
      return { data: graduationCreated };
    } catch (error) {
      console.error('Error creating graduation:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao registrar graduação.",
        variant: "destructive"
      });
      return { error: 'Erro inesperado' };
    }
  };

  const deleteGraduation = async (graduationId: string) => {
    try {
      const { error } = await supabase
        .from('graduations')
        .delete()
        .eq('id', graduationId);

      if (error) {
        console.error('Error deleting graduation:', error);
        toast({
          title: "Erro ao remover graduação",
          description: "Não foi possível remover a graduação.",
          variant: "destructive"
        });
        return { error: error.message };
      }

      toast({
        title: "Graduação removida com sucesso!",
        description: "A graduação foi removida do sistema."
      });

      // Recarregar lista
      fetchGraduations();
      return { success: true };
    } catch (error) {
      console.error('Error deleting graduation:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao remover graduação.",
        variant: "destructive"
      });
      return { error: 'Erro inesperado' };
    }
  };

  useEffect(() => {
    fetchGraduations();
  }, []);

  return {
    graduations,
    loading,
    createGraduation,
    deleteGraduation,
    refetch: fetchGraduations
  };
}