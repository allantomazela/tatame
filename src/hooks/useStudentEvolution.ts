import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type EvaluationRow = Database['public']['Tables']['student_evaluations']['Row'];
type GoalRow = Database['public']['Tables']['student_goals']['Row'];
type AchievementRow = Database['public']['Tables']['student_achievements']['Row'];
type CompetitionRow = Database['public']['Tables']['student_competitions']['Row'];

export interface StudentEvaluation extends EvaluationRow {}
export interface StudentGoal extends GoalRow {}
export interface StudentAchievement extends AchievementRow {}
export interface StudentCompetition extends CompetitionRow {}

export interface CreateEvaluationData {
  student_id: string;
  instructor_id?: string;
  evaluation_date?: string;
  poomsae_score?: number;
  kicks_score?: number;
  punches_score?: number;
  blocks_score?: number;
  stances_score?: number;
  balance_score?: number;
  flexibility_score?: number;
  strength_score?: number;
  speed_score?: number;
  precision_score?: number;
  sparring_technique?: number;
  sparring_strategy?: number;
  sparring_defense?: number;
  sparring_control?: number;
  sparring_attitude?: number;
  discipline_score?: number;
  respect_score?: number;
  focus_score?: number;
  improvement_attitude?: number;
  self_confidence?: number;
  observations?: string;
  strengths?: string;
  areas_for_improvement?: string;
  short_term_goals?: string;
  long_term_goals?: string;
}

export interface CreateGoalData {
  student_id: string;
  instructor_id?: string;
  title: string;
  description?: string;
  category: 'technique' | 'physical' | 'mental' | 'competition';
  target_date?: string;
  current_progress?: number;
}

export interface CreateAchievementData {
  student_id: string;
  achievement_type: 'belt' | 'competition' | 'milestone' | 'technique';
  title: string;
  description?: string;
  achievement_date?: string;
  points?: number;
}

export interface CreateCompetitionData {
  student_id: string;
  competition_name: string;
  competition_date: string;
  category?: string;
  division?: string;
  position?: number;
  total_participants?: number;
  notes?: string;
}

export function useStudentEvolution(studentId?: string) {
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([]);
  const [goals, setGoals] = useState<StudentGoal[]>([]);
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [competitions, setCompetitions] = useState<StudentCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStudentData = async (id: string) => {
    try {
      setLoading(true);
      
      // Buscar avaliações
      const { data: evaluationsData, error: evalError } = await supabase
        .from('student_evaluations')
        .select('*')
        .eq('student_id', id)
        .order('evaluation_date', { ascending: false });

      if (evalError) throw evalError;

      // Buscar metas
      const { data: goalsData, error: goalsError } = await supabase
        .from('student_goals')
        .select('*')
        .eq('student_id', id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      // Buscar conquistas
      const { data: achievementsData, error: achError } = await supabase
        .from('student_achievements')
        .select('*')
        .eq('student_id', id)
        .order('achievement_date', { ascending: false });

      if (achError) throw achError;

      // Buscar competições
      const { data: competitionsData, error: compError } = await supabase
        .from('student_competitions')
        .select('*')
        .eq('student_id', id)
        .order('competition_date', { ascending: false });

      if (compError) throw compError;

      setEvaluations(evaluationsData || []);
      setGoals(goalsData || []);
      setAchievements(achievementsData || []);
      setCompetitions(competitionsData || []);
      
    } catch (error) {
      console.error('Error fetching student evolution data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados de evolução do aluno.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvaluation = async (data: CreateEvaluationData) => {
    try {
      const { data: evaluation, error } = await supabase
        .from('student_evaluations')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Avaliação registrada!",
        description: "A avaliação foi registrada com sucesso."
      });

      if (studentId) fetchStudentData(studentId);
      return { data: evaluation };
    } catch (error) {
      console.error('Error creating evaluation:', error);
      toast({
        title: "Erro ao registrar avaliação",
        description: "Não foi possível registrar a avaliação.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const createGoal = async (data: CreateGoalData) => {
    try {
      const { data: goal, error } = await supabase
        .from('student_goals')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Meta criada!",
        description: "A meta foi criada com sucesso."
      });

      if (studentId) fetchStudentData(studentId);
      return { data: goal };
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Erro ao criar meta",
        description: "Não foi possível criar a meta.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const updateGoalProgress = async (goalId: string, progress: number, completed?: boolean) => {
    try {
      const updateData: any = { current_progress: progress };
      if (completed !== undefined) {
        updateData.completed = completed;
        if (completed) {
          updateData.completed_date = new Date().toISOString().split('T')[0];
        }
      }

      const { error } = await supabase
        .from('student_goals')
        .update(updateData)
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Progresso atualizado!",
        description: "O progresso da meta foi atualizado."
      });

      if (studentId) fetchStudentData(studentId);
      return { success: true };
    } catch (error) {
      console.error('Error updating goal progress:', error);
      toast({
        title: "Erro ao atualizar progresso",
        description: "Não foi possível atualizar o progresso.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const createAchievement = async (data: CreateAchievementData) => {
    try {
      const { data: achievement, error } = await supabase
        .from('student_achievements')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Conquista registrada!",
        description: "A conquista foi registrada com sucesso."
      });

      if (studentId) fetchStudentData(studentId);
      return { data: achievement };
    } catch (error) {
      console.error('Error creating achievement:', error);
      toast({
        title: "Erro ao registrar conquista",
        description: "Não foi possível registrar a conquista.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const createCompetition = async (data: CreateCompetitionData) => {
    try {
      const { data: competition, error } = await supabase
        .from('student_competitions')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Resultado de competição registrado!",
        description: "O resultado da competição foi registrado com sucesso."
      });

      if (studentId) fetchStudentData(studentId);
      return { data: competition };
    } catch (error) {
      console.error('Error creating competition:', error);
      toast({
        title: "Erro ao registrar competição",
        description: "Não foi possível registrar o resultado da competição.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('student_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Meta excluída!",
        description: "A meta foi excluída com sucesso."
      });

      if (studentId) fetchStudentData(studentId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Erro ao excluir meta",
        description: "Não foi possível excluir a meta.",
        variant: "destructive"
      });
      return { error };
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudentData(studentId);
    }
  }, [studentId]);

  return {
    evaluations,
    goals,
    achievements,
    competitions,
    loading,
    createEvaluation,
    createGoal,
    updateGoalProgress,
    createAchievement,
    createCompetition,
    deleteGoal,
    refetch: studentId ? () => fetchStudentData(studentId) : () => {}
  };
}