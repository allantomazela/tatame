import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from './use-toast';

export interface ClassData {
  id: string;
  name: string;
  description?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_students?: number;
  instructor_id?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  instructor_name?: string;
  enrolled_count?: number;
}

export interface ClassEnrollment {
  id: string;
  student_id: string;
  class_id: string;
  enrolled_at: string;
  active: boolean;
  student_name?: string;
  student_belt_color?: string;
}

export function useClasses() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [enrollments, setEnrollments] = useState<ClassEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, userType } = useSupabaseAuth();
  const { toast } = useToast();

  const fetchClasses = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('classes')
        .select(`
          *,
          profiles:instructor_id (full_name)
        `)
        .eq('active', true)
        .order('day_of_week')
        .order('start_time');

      // Se for instrutor, filtrar apenas suas turmas
      if (userType === 'mestre') {
        query = query.eq('instructor_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const classesWithDetails = (data || []).map(cls => ({
        ...cls,
        instructor_name: cls.profiles?.full_name || 'Não definido'
      }));

      setClasses(classesWithDetails);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as turmas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClassEnrollments = async (classId: string) => {
    try {
      // Buscar matrículas
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('class_enrollments')
        .select('*')
        .eq('class_id', classId)
        .eq('active', true);

      if (enrollmentsError) throw enrollmentsError;

      // Buscar dados dos alunos
      const studentIds = enrollmentsData?.map(e => e.student_id) || [];
      
      if (studentIds.length === 0) {
        setEnrollments([]);
        return [];
      }

      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, belt_color, profile_id')
        .in('id', studentIds);

      if (studentsError) throw studentsError;

      // Buscar perfis separadamente
      const profileIds = studentsData?.map(s => s.profile_id).filter(Boolean) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', profileIds);

      const enrollmentsWithDetails = (enrollmentsData || []).map(enrollment => {
        const student = studentsData?.find(s => s.id === enrollment.student_id);
        const profile = profilesData?.find(p => p.id === student?.profile_id);
        return {
          ...enrollment,
          student_name: profile?.full_name || 'Nome não encontrado',
          student_belt_color: student?.belt_color || 'branca'
        };
      });

      setEnrollments(enrollmentsWithDetails);
      return enrollmentsWithDetails;
    } catch (error) {
      console.error('Erro ao buscar matrículas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as matrículas.",
        variant: "destructive",
      });
      return [];
    }
  };

  const createClass = async (classData: Omit<ClassData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          ...classData,
          instructor_id: classData.instructor_id || user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Turma criada com sucesso!",
      });

      await fetchClasses();
      return data;
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a turma.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const enrollStudent = async (studentId: string, classId: string) => {
    try {
      // Verificar se já está matriculado
      const { data: existing } = await supabase
        .from('class_enrollments')
        .select('id')
        .eq('student_id', studentId)
        .eq('class_id', classId)
        .eq('active', true)
        .single();

      if (existing) {
        toast({
          title: "Aviso",
          description: "O aluno já está matriculado nesta turma.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('class_enrollments')
        .insert([{
          student_id: studentId,
          class_id: classId,
          active: true
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aluno matriculado na turma!",
      });

      await fetchClassEnrollments(classId);
    } catch (error) {
      console.error('Erro ao matricular aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível matricular o aluno.",
        variant: "destructive",
      });
    }
  };

  const removeEnrollment = async (enrollmentId: string, classId: string) => {
    try {
      const { error } = await supabase
        .from('class_enrollments')
        .update({ active: false })
        .eq('id', enrollmentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Matrícula removida com sucesso!",
      });

      await fetchClassEnrollments(classId);
    } catch (error) {
      console.error('Erro ao remover matrícula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a matrícula.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user, userType]);

  return {
    classes,
    enrollments,
    loading,
    fetchClasses,
    fetchClassEnrollments,
    createClass,
    enrollStudent,
    removeEnrollment,
    refetch: fetchClasses
  };
}