import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from './use-toast';

export interface Polo {
  id: string;
  name: string;
  address: string;
  responsible_id: string | null;
  max_capacity: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  responsible_name?: string;
  student_count?: number;
}

export interface StudentPolo {
  id: string;
  student_id: string;
  polo_id: string;
  enrolled_at: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  student_name?: string;
  polo_name?: string;
}

export interface CreatePoloData {
  name: string;
  address: string;
  responsible_id?: string | null;
  max_capacity: number;
}

export function usePolos() {
  const [polos, setPolos] = useState<Polo[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, userType } = useSupabaseAuth();
  const { toast } = useToast();

  const fetchPolos = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('polos')
        .select(`
          *,
          profiles:responsible_id (full_name)
        `)
        .eq('active', true)
        .order('name');

      // Se não for mestre, filtrar apenas polos onde o usuário tem acesso
      if (userType !== 'mestre') {
        // Alunos e responsáveis veem apenas polos onde estão vinculados
        const { data: studentPolos } = await supabase
          .from('student_polos')
          .select('polo_id')
          .eq('active', true);

        if (userType === 'aluno') {
          const { data: studentData } = await supabase
            .from('students')
            .select('id')
            .eq('profile_id', user.id)
            .single();

          if (studentData) {
            const { data: spData } = await supabase
              .from('student_polos')
              .select('polo_id')
              .eq('student_id', studentData.id)
              .eq('active', true);

            const poloIds = spData?.map(sp => sp.polo_id) || [];
            if (poloIds.length > 0) {
              query = query.in('id', poloIds);
            } else {
              setPolos([]);
              setLoading(false);
              return;
            }
          }
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      const polosWithDetails = (data || []).map(polo => ({
        ...polo,
        responsible_name: polo.profiles?.full_name || 'Não definido',
        student_count: 0 // Será calculado separadamente se necessário
      }));

      setPolos(polosWithDetails);
    } catch (error) {
      console.error('Erro ao buscar polos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os polos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPolo = async (poloData: CreatePoloData) => {
    try {
      const { data, error } = await supabase
        .from('polos')
        .insert([{
          ...poloData,
          responsible_id: poloData.responsible_id || user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Polo criado com sucesso!",
      });

      await fetchPolos();
      return data;
    } catch (error) {
      console.error('Erro ao criar polo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o polo.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePolo = async (poloId: string, poloData: Partial<CreatePoloData>) => {
    try {
      const { error } = await supabase
        .from('polos')
        .update(poloData)
        .eq('id', poloId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Polo atualizado com sucesso!",
      });

      await fetchPolos();
    } catch (error) {
      console.error('Erro ao atualizar polo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o polo.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePolo = async (poloId: string) => {
    try {
      const { error } = await supabase
        .from('polos')
        .update({ active: false })
        .eq('id', poloId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Polo desativado com sucesso!",
      });

      await fetchPolos();
    } catch (error) {
      console.error('Erro ao desativar polo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desativar o polo.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const enrollStudentInPolo = async (studentId: string, poloId: string) => {
    try {
      // Verificar se já está matriculado
      const { data: existing } = await supabase
        .from('student_polos')
        .select('id')
        .eq('student_id', studentId)
        .eq('polo_id', poloId)
        .single();

      if (existing) {
        // Reativar se estava inativo
        const { error } = await supabase
          .from('student_polos')
          .update({ active: true })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Criar nova matrícula
        const { error } = await supabase
          .from('student_polos')
          .insert([{
            student_id: studentId,
            polo_id: poloId,
            active: true
          }]);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Aluno vinculado ao polo!",
      });
    } catch (error) {
      console.error('Erro ao vincular aluno ao polo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível vincular o aluno ao polo.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeStudentFromPolo = async (studentId: string, poloId: string) => {
    try {
      const { error } = await supabase
        .from('student_polos')
        .update({ active: false })
        .eq('student_id', studentId)
        .eq('polo_id', poloId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aluno removido do polo!",
      });
    } catch (error) {
      console.error('Erro ao remover aluno do polo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o aluno do polo.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getStudentPolos = async (studentId: string): Promise<StudentPolo[]> => {
    try {
      const { data, error } = await supabase
        .from('student_polos')
        .select(`
          *,
          polos:polo_id (name)
        `)
        .eq('student_id', studentId)
        .eq('active', true);

      if (error) throw error;

      return (data || []).map(sp => ({
        ...sp,
        polo_name: sp.polos?.name || 'Não encontrado'
      }));
    } catch (error) {
      console.error('Erro ao buscar polos do aluno:', error);
      return [];
    }
  };

  const getPoloStudents = async (poloId: string): Promise<StudentPolo[]> => {
    try {
      const { data, error } = await supabase
        .from('student_polos')
        .select(`
          *,
          students:student_id (
            id,
            profile_id,
            profiles:profile_id (full_name)
          )
        `)
        .eq('polo_id', poloId)
        .eq('active', true);

      if (error) throw error;

      return (data || []).map(sp => ({
        ...sp,
        student_name: sp.students?.profiles?.full_name || 'Não encontrado'
      }));
    } catch (error) {
      console.error('Erro ao buscar alunos do polo:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      fetchPolos();
    }
  }, [user, userType]);

  return {
    polos,
    loading,
    fetchPolos,
    createPolo,
    updatePolo,
    deletePolo,
    enrollStudentInPolo,
    removeStudentFromPolo,
    getStudentPolos,
    getPoloStudents,
    refetch: fetchPolos
  };
}

