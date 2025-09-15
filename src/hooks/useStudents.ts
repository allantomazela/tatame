import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type StudentRow = Database['public']['Tables']['students']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface Student extends StudentRow {
  profile?: ProfileRow;
}

export interface CreateStudentData {
  // Personal information  
  full_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  
  // Address information
  street?: string;
  street_number?: string;
  neighborhood?: string;
  postal_code?: string;
  city?: string;
  state?: string;
  address_complement?: string;
  
  // Emergency contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  
  // Academic information
  belt_color: string;
  belt_degree: number;
  monthly_fee?: number;
  payment_due_date?: number;
  medical_info?: string;
  date_joined: string;
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profiles!students_profile_id_fkey (
            full_name,
            email,
            phone,
            birth_date,
            address,
            emergency_contact
          )
        `)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching students:', error);
        toast({
          title: "Erro ao carregar alunos",
          description: "Não foi possível carregar a lista de alunos.",
          variant: "destructive"
        });
        return;
      }

      setStudents((data as unknown as Student[]) || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao carregar alunos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createStudent = async (studentData: CreateStudentData) => {
    try {
      // Como não temos usuário real no auth, vamos criar o perfil sem especificar o ID
      // O Supabase irá gerar automaticamente um UUID

      // Combine address fields into a single address string
      const fullAddress = [
        studentData.street && studentData.street_number ? `${studentData.street}, ${studentData.street_number}` : studentData.street,
        studentData.address_complement,
        studentData.neighborhood,
        studentData.city,
        studentData.state,
        studentData.postal_code
      ].filter(Boolean).join(', ');
      
      // Combine emergency contact fields
      const emergencyContact = [
        studentData.emergency_contact_name,
        studentData.emergency_contact_phone,
        studentData.emergency_contact_relationship
      ].filter(Boolean).join(' | ');

      // Criar o perfil - vamos usar um ID gerado que não existe no auth.users
      const profileId = crypto.randomUUID();
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: profileId,
          full_name: studentData.full_name,
          email: studentData.email,
          phone: studentData.phone || null,
          birth_date: studentData.birth_date || null,
          address: fullAddress || null,
          emergency_contact: emergencyContact || null,
          user_type: 'aluno'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        toast({
          title: "Erro ao criar perfil",
          description: "Não foi possível criar o perfil do aluno.",
          variant: "destructive"
        });
        return { error: profileError.message };
      }

      // Depois criar o estudante
      const { data: studentCreated, error: studentError } = await supabase
        .from('students')
        .insert({
          profile_id: profileData.id,
          belt_color: studentData.belt_color,
          belt_degree: studentData.belt_degree,
          medical_info: studentData.medical_info || null,
          monthly_fee: studentData.monthly_fee || null,
          payment_due_date: studentData.payment_due_date || 5,
          date_joined: studentData.date_joined
        })
        .select()
        .single();

      if (studentError) {
        console.error('Error creating student:', studentError);
        // Limpar perfil criado se falhou
        await supabase.from('profiles').delete().eq('id', profileData.id);
        toast({
          title: "Erro ao criar aluno",
          description: "Não foi possível criar o registro do aluno.",
          variant: "destructive"
        });
        return { error: studentError.message };
      }

      toast({
        title: "Aluno criado com sucesso!",
        description: `${studentData.full_name} foi adicionado ao sistema.`
      });

      // Recarregar lista
      fetchStudents();
      return { data: studentCreated };
    } catch (error) {
      console.error('Error creating student:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao criar aluno.",
        variant: "destructive"
      });
      return { error: 'Erro inesperado' };
    }
  };

  const updateStudent = async (studentId: string, updates: Partial<CreateStudentData>) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) {
        toast({
          title: "Aluno não encontrado",
          description: "Não foi possível encontrar o aluno para atualizar.",
          variant: "destructive"
        });
        return { error: 'Aluno não encontrado' };
      }

      // Combine address fields if any are provided
      const addressFields = [
        updates.street && updates.street_number ? `${updates.street}, ${updates.street_number}` : updates.street,
        updates.address_complement,
        updates.neighborhood,
        updates.city,
        updates.state,
        updates.postal_code
      ].filter(Boolean);
      const fullAddress = addressFields.length > 0 ? addressFields.join(', ') : undefined;
      
      // Combine emergency contact fields for updates
      const emergencyContact = [
        updates.emergency_contact_name,
        updates.emergency_contact_phone,
        updates.emergency_contact_relationship
      ].filter(Boolean).join(' | ');

      // Atualizar perfil se houver dados do perfil
      if (updates.full_name || updates.email || updates.phone || updates.birth_date || fullAddress || updates.emergency_contact_name || updates.emergency_contact_phone || updates.emergency_contact_relationship) {
        const profileUpdates: Partial<Database['public']['Tables']['profiles']['Update']> = {};
        
        if (updates.full_name) profileUpdates.full_name = updates.full_name;
        if (updates.email) profileUpdates.email = updates.email;
        if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
        if (updates.birth_date !== undefined) profileUpdates.birth_date = updates.birth_date;
        if (fullAddress !== undefined) profileUpdates.address = fullAddress;
        if (emergencyContact !== undefined && emergencyContact !== '') profileUpdates.emergency_contact = emergencyContact;

        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', student.profile_id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          toast({
            title: "Erro ao atualizar perfil",
            description: "Não foi possível atualizar o perfil do aluno.",
            variant: "destructive"
          });
          return { error: profileError.message };
        }
      }

      // Atualizar dados do estudante
      const studentUpdates: Partial<Database['public']['Tables']['students']['Update']> = {};
      
      if (updates.belt_color) studentUpdates.belt_color = updates.belt_color;
      if (updates.belt_degree) studentUpdates.belt_degree = updates.belt_degree;
      if (updates.medical_info !== undefined) studentUpdates.medical_info = updates.medical_info;
      if (updates.monthly_fee !== undefined) studentUpdates.monthly_fee = updates.monthly_fee;
      if (updates.payment_due_date !== undefined) studentUpdates.payment_due_date = updates.payment_due_date;

      const { error: studentError } = await supabase
        .from('students')
        .update(studentUpdates)
        .eq('id', studentId);

      if (studentError) {
        console.error('Error updating student:', studentError);
        toast({
          title: "Erro ao atualizar aluno",
          description: "Não foi possível atualizar os dados do aluno.",
          variant: "destructive"
        });
        return { error: studentError.message };
      }

      toast({
        title: "Aluno atualizado com sucesso!",
        description: "Os dados do aluno foram atualizados."
      });

      // Recarregar lista
      fetchStudents();
      return { success: true };
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao atualizar aluno.",
        variant: "destructive"
      });
      return { error: 'Erro inesperado' };
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      // Marcar como inativo em vez de deletar
      const { error } = await supabase
        .from('students')
        .update({ active: false })
        .eq('id', studentId);

      if (error) {
        console.error('Error deactivating student:', error);
        toast({
          title: "Erro ao remover aluno",
          description: "Não foi possível remover o aluno.",
          variant: "destructive"
        });
        return { error: error.message };
      }

      toast({
        title: "Aluno removido com sucesso!",
        description: "O aluno foi removido do sistema."
      });

      // Recarregar lista
      fetchStudents();
      return { success: true };
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao remover aluno.",
        variant: "destructive"
      });
      return { error: 'Erro inesperado' };
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    createStudent,
    updateStudent,
    deleteStudent,
    refetch: fetchStudents
  };
}