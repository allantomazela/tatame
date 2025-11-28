import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from './use-toast';

export interface PoloSchedule {
  id: string;
  polo_id: string;
  class_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  instructor_id: string | null;
  description: string | null;
  max_participants: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  polo_name?: string;
  class_name?: string;
  instructor_name?: string;
}

export interface CreatePoloScheduleData {
  polo_id: string;
  class_id?: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  instructor_id?: string | null;
  description?: string | null;
  max_participants?: number | null;
}

export function usePoloSchedules() {
  const [schedules, setSchedules] = useState<PoloSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, userType } = useSupabaseAuth();
  const { toast } = useToast();

  const fetchSchedules = async (poloId?: string) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('polo_schedules')
        .select(`
          *,
          polos:polo_id (name),
          classes:class_id (name),
          profiles:instructor_id (full_name)
        `)
        .eq('active', true)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (poloId) {
        query = query.eq('polo_id', poloId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const schedulesWithDetails = (data || []).map(schedule => ({
        ...schedule,
        polo_name: schedule.polos?.name || 'Não encontrado',
        class_name: schedule.classes?.name || null,
        instructor_name: schedule.profiles?.full_name || 'Não definido'
      }));

      setSchedules(schedulesWithDetails);
    } catch (error) {
      console.error('Erro ao buscar horários fixos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os horários fixos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async (scheduleData: CreatePoloScheduleData) => {
    try {
      const { data, error } = await supabase
        .from('polo_schedules')
        .insert([{
          ...scheduleData,
          instructor_id: scheduleData.instructor_id || user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Horário fixo criado com sucesso!",
      });

      await fetchSchedules();
      return data;
    } catch (error) {
      console.error('Erro ao criar horário fixo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o horário fixo.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSchedule = async (scheduleId: string, scheduleData: Partial<CreatePoloScheduleData>) => {
    try {
      const { error } = await supabase
        .from('polo_schedules')
        .update(scheduleData)
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Horário fixo atualizado com sucesso!",
      });

      await fetchSchedules();
    } catch (error) {
      console.error('Erro ao atualizar horário fixo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o horário fixo.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('polo_schedules')
        .update({ active: false })
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Horário fixo desativado com sucesso!",
      });

      await fetchSchedules();
    } catch (error) {
      console.error('Erro ao desativar horário fixo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desativar o horário fixo.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const generateSessionsFromSchedules = async (
    poloId: string,
    startDate: string,
    endDate: string
  ) => {
    try {
      // Buscar horários fixos do polo
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('polo_schedules')
        .select('*')
        .eq('polo_id', poloId)
        .eq('active', true);

      if (schedulesError) throw schedulesError;

      if (!schedulesData || schedulesData.length === 0) {
        toast({
          title: "Aviso",
          description: "Não há horários fixos configurados para este polo.",
          variant: "destructive",
        });
        return;
      }

      // Gerar sessões para cada data no intervalo
      const start = new Date(startDate);
      const end = new Date(endDate);
      const sessionsToCreate: any[] = [];

      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.getDay(); // 0 = domingo, 6 = sábado
        
        // Encontrar horários fixos para este dia da semana
        const daySchedules = schedulesData.filter(s => s.day_of_week === dayOfWeek);

        for (const schedule of daySchedules) {
          // Verificar se já existe uma sessão para esta data e horário
          const sessionDate = date.toISOString().split('T')[0];
          
          const { data: existing } = await supabase
            .from('training_sessions')
            .select('id')
            .eq('polo_id', poloId)
            .eq('session_date', sessionDate)
            .eq('start_time', schedule.start_time)
            .eq('end_time', schedule.end_time)
            .eq('active', true)
            .single();

          if (!existing) {
            sessionsToCreate.push({
              polo_id: poloId,
              class_id: schedule.class_id,
              session_date: sessionDate,
              start_time: schedule.start_time,
              end_time: schedule.end_time,
              instructor_id: schedule.instructor_id,
              description: schedule.description,
              max_participants: schedule.max_participants,
              active: true
            });
          }
        }
      }

      if (sessionsToCreate.length === 0) {
        toast({
          title: "Aviso",
          description: "Todas as sessões já foram criadas para este período.",
        });
        return;
      }

      // Inserir todas as sessões
      const { error: insertError } = await supabase
        .from('training_sessions')
        .insert(sessionsToCreate);

      if (insertError) throw insertError;

      toast({
        title: "Sucesso",
        description: `${sessionsToCreate.length} sessões criadas com sucesso!`,
      });

      return sessionsToCreate.length;
    } catch (error) {
      console.error('Erro ao gerar sessões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar as sessões.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchSchedules();
    }
  }, [user, userType]);

  return {
    schedules,
    loading,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    generateSessionsFromSchedules,
    refetch: fetchSchedules
  };
}

