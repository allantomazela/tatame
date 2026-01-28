import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  graduationsThisMonth: number;
  totalClasses: number;
  pendingMessages: number;
  monthlyRevenue: number;
  attendanceRate: number;
}

interface RecentActivity {
  id: string;
  type: 'graduation' | 'student' | 'payment' | 'message';
  title: string;
  description: string;
  timestamp: string;
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    graduationsThisMonth: 0,
    totalClasses: 0,
    pendingMessages: 0,
    monthlyRevenue: 0,
    attendanceRate: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // As queries são filtradas por RLS conforme o perfil (mestre vê todos, responsável vê só seus alunos, etc.)
      // Buscar estatísticas dos alunos
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, active, created_at, monthly_fee');

      if (studentsError) {
        console.error('Dashboard students error:', studentsError.message, {
          code: studentsError.code,
          details: studentsError.details,
          hint: studentsError.hint,
        });
        throw studentsError;
      }

      const totalStudents = studentsData?.length || 0;
      const activeStudents = studentsData?.filter(s => s.active)?.length || 0;

      // Buscar graduações do mês atual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: graduationsData, error: graduationsError } = await supabase
        .from('graduations')
        .select('id')
        .gte('graduation_date', startOfMonth.toISOString().split('T')[0]);

      if (graduationsError) throw graduationsError;

      const graduationsThisMonth = graduationsData?.length || 0;

      // Buscar turmas ativas
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .eq('active', true);

      if (classesError) throw classesError;

      const totalClasses = classesData?.length || 0;

      // Buscar mensagens não lidas
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .eq('read', false);

      if (messagesError) throw messagesError;

      const pendingMessages = messagesData?.length || 0;

      // Calcular receita mensal (estimativa baseada nas mensalidades)
      const monthlyRevenue = studentsData
        ?.filter(s => s.active && s.monthly_fee)
        ?.reduce((total, student) => total + (student.monthly_fee || 0), 0) || 0;

      // Buscar taxa de frequência (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('present')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (attendanceError) throw attendanceError;

      const totalAttendance = attendanceData?.length || 0;
      const presentCount = attendanceData?.filter(a => a.present)?.length || 0;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

      setStats({
        totalStudents,
        activeStudents,
        graduationsThisMonth,
        totalClasses,
        pendingMessages,
        monthlyRevenue,
        attendanceRate
      });

      // Buscar atividades recentes
      await fetchRecentActivities();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Erro ao carregar dashboard",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const activities: RecentActivity[] = [];

      // Graduações recentes (últimos 7 dias)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const { data: recentGraduations } = await supabase
        .from('graduations')
        .select(`
          id,
          graduation_date,
          belt_color,
          students!inner(
            profile:profiles(full_name)
          )
        `)
        .gte('graduation_date', lastWeek.toISOString().split('T')[0])
        .order('graduation_date', { ascending: false })
        .limit(3);

      type StudentWithProfile = { profile?: { full_name?: string } };
      recentGraduations?.forEach(grad => {
        const student = (grad.students as StudentWithProfile) ?? {};
        activities.push({
          id: grad.id,
          type: 'graduation',
          title: 'Nova graduação registrada',
          description: `${student.profile?.full_name ?? 'Aluno'} - Faixa ${grad.belt_color}`,
          timestamp: grad.graduation_date
        });
      });

      // Novos alunos (últimos 7 dias)
      const { data: recentStudents } = await supabase
        .from('students')
        .select(`
          id,
          created_at,
          profile:profiles(full_name)
        `)
        .gte('created_at', lastWeek.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      type ProfileName = { full_name?: string };
      recentStudents?.forEach(student => {
        const profile = (student.profile as ProfileName) ?? {};
        activities.push({
          id: student.id,
          type: 'student',
          title: 'Novo aluno cadastrado',
          description: profile?.full_name ?? 'Nome não disponível',
          timestamp: student.created_at
        });
      });

      // Ordernar atividades por data
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setRecentActivities(activities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    recentActivities,
    loading,
    refetch: fetchDashboardData
  };
}