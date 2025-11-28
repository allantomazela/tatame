import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from './use-toast';

export interface TrainingSession {
  id: string;
  polo_id: string;
  class_id: string | null;
  session_date: string;
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
  attendance_count?: number;
}

export interface CreateTrainingSessionData {
  polo_id: string;
  class_id?: string | null;
  session_date: string;
  start_time: string;
  end_time: string;
  instructor_id?: string | null;
  description?: string | null;
  max_participants?: number | null;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  training_session_id: string;
  present: boolean;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
  student_name?: string;
  student_belt_color?: string;
}

export function useTrainingSessions() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, userType } = useSupabaseAuth();
  const { toast } = useToast();

  const fetchSessions = async (poloId?: string, startDate?: string, endDate?: string) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('training_sessions')
        .select(`
          *,
          polos:polo_id (name),
          classes:class_id (name),
          profiles:instructor_id (full_name)
        `)
        .eq('active', true)
        .order('session_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (poloId) {
        query = query.eq('polo_id', poloId);
      }

      if (startDate) {
        query = query.gte('session_date', startDate);
      }

      if (endDate) {
        query = query.lte('session_date', endDate);
      }

      // Se não for mestre, filtrar apenas sessões dos polos do usuário
      if (userType !== 'mestre' && userType !== 'aluno') {
        // Para responsáveis, filtrar por polos dos seus alunos
        // Isso será feito via RLS, mas podemos adicionar filtro adicional se necessário
      }

      const { data, error } = await query;

      if (error) throw error;

      const sessionsWithDetails = (data || []).map(session => ({
        ...session,
        polo_name: session.polos?.name || 'Não encontrado',
        class_name: session.classes?.name || null,
        instructor_name: session.profiles?.full_name || 'Não definido',
        attendance_count: 0 // Será calculado separadamente se necessário
      }));

      setSessions(sessionsWithDetails);
    } catch (error) {
      console.error('Erro ao buscar sessões de treino:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as sessões de treino.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (sessionData: CreateTrainingSessionData) => {
    try {
      const { data, error } = await supabase
        .from('training_sessions')
        .insert([{
          ...sessionData,
          instructor_id: sessionData.instructor_id || user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Sessão de treino criada com sucesso!",
      });

      await fetchSessions();
      return data;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a sessão de treino.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSession = async (sessionId: string, sessionData: Partial<CreateTrainingSessionData>) => {
    try {
      const { error } = await supabase
        .from('training_sessions')
        .update(sessionData)
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Sessão de treino atualizada com sucesso!",
      });

      await fetchSessions();
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a sessão de treino.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('training_sessions')
        .update({ active: false })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Sessão de treino desativada com sucesso!",
      });

      await fetchSessions();
    } catch (error) {
      console.error('Erro ao desativar sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desativar a sessão de treino.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getSessionAttendance = async (sessionId: string): Promise<AttendanceRecord[]> => {
    try {
      // Primeiro, buscar a sessão para obter o polo_id e class_id
      const { data: sessionData, error: sessionError } = await supabase
        .from('training_sessions')
        .select('polo_id, class_id')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Buscar alunos do polo (e da classe se houver)
      let studentIds: string[] = [];
      
      if (sessionData.class_id) {
        // Se há classe, buscar alunos matriculados na classe
        const { data: enrollments } = await supabase
          .from('class_enrollments')
          .select('student_id')
          .eq('class_id', sessionData.class_id)
          .eq('active', true);
        
        studentIds = enrollments?.map(e => e.student_id) || [];
      } else {
        // Se não há classe, buscar todos os alunos do polo
        const { data: studentPolos } = await supabase
          .from('student_polos')
          .select('student_id')
          .eq('polo_id', sessionData.polo_id)
          .eq('active', true);
        
        studentIds = studentPolos?.map(sp => sp.student_id) || [];
      }

      if (studentIds.length === 0) {
        return [];
      }

      // Buscar registros de frequência existentes
      const { data: existingAttendance, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          *,
          students:student_id (
            id,
            belt_color,
            profile_id,
            profiles:profile_id (full_name)
          )
        `)
        .eq('training_session_id', sessionId);

      if (attendanceError) throw attendanceError;

      const existingMap = new Map(
        (existingAttendance || []).map(att => [att.student_id, att])
      );

      if (studentIds.length === 0) {
        return [];
      }

      // Buscar dados dos alunos
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          belt_color,
          profile_id,
          profiles!students_profile_id_fkey (full_name)
        `)
        .in('id', studentIds)
        .eq('active', true);

      if (studentsError) {
        console.error('Erro ao buscar alunos:', studentsError);
        throw studentsError;
      }

      // Criar registros para todos os alunos (com presença existente ou não)
      return (studentsData || []).map(student => {
        const existing = existingMap.get(student.id);
        return {
          id: existing?.id || '',
          student_id: student.id,
          training_session_id: sessionId,
          present: existing?.present || false,
          notes: existing?.notes || null,
          recorded_by: existing?.recorded_by || null,
          created_at: existing?.created_at || new Date().toISOString(),
          student_name: student.profiles?.full_name || 'Não encontrado',
          student_belt_color: student.belt_color || 'branca'
        };
      });
    } catch (error) {
      console.error('Erro ao buscar frequência da sessão:', error);
      return [];
    }
  };

  const markAttendance = async (
    sessionId: string,
    studentId: string,
    present: boolean,
    notes?: string
  ) => {
    try {
      // Verificar se já existe registro
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('training_session_id', sessionId)
        .eq('student_id', studentId)
        .single();

      if (existing) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('attendance')
          .update({
            present,
            notes: notes || null,
            recorded_by: user?.id || null
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from('attendance')
          .insert([{
            training_session_id: sessionId,
            student_id: studentId,
            present,
            notes: notes || null,
            recorded_by: user?.id || null,
            date: new Date().toISOString().split('T')[0] // Data atual como fallback
          }]);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: present ? "Presença marcada!" : "Falta registrada!",
      });
    } catch (error) {
      console.error('Erro ao marcar frequência:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a frequência.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const markMultipleAttendance = async (
    sessionId: string,
    attendanceRecords: Array<{ studentId: string; present: boolean; notes?: string }>
  ) => {
    try {
      // Buscar a data da sessão
      const { data: sessionData } = await supabase
        .from('training_sessions')
        .select('session_date')
        .eq('id', sessionId)
        .single();

      const sessionDate = sessionData?.session_date || new Date().toISOString().split('T')[0];

      const records = attendanceRecords.map(record => ({
        training_session_id: sessionId,
        student_id: record.studentId,
        present: record.present,
        notes: record.notes || null,
        recorded_by: user?.id || null,
        date: sessionDate
      }));

      // Buscar registros existentes
      const { data: existing } = await supabase
        .from('attendance')
        .select('id, student_id')
        .eq('training_session_id', sessionId);

      const existingMap = new Map(existing?.map(e => [e.student_id, e.id]) || []);

      // Separar em updates e inserts
      const updates = records.filter(r => existingMap.has(r.student_id));
      const inserts = records.filter(r => !existingMap.has(r.student_id));

      // Executar updates
      for (const record of updates) {
        const existingId = existingMap.get(record.student_id);
        if (existingId) {
          await supabase
            .from('attendance')
            .update({
              present: record.present,
              notes: record.notes,
              recorded_by: record.recorded_by
            })
            .eq('id', existingId);
        }
      }

      // Executar inserts
      if (inserts.length > 0) {
        const { error } = await supabase
          .from('attendance')
          .insert(inserts);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Frequência registrada para todos os alunos!",
      });
    } catch (error) {
      console.error('Erro ao marcar frequência em lote:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a frequência.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    sessions,
    loading,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    getSessionAttendance,
    markAttendance,
    markMultipleAttendance,
    refetch: fetchSessions
  };
}

