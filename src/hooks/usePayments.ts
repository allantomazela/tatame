import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from './use-toast';

export interface Payment {
  id: string;
  student_id: string | null;
  amount: number;
  payment_date: string;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: string | null;
  reference_month?: string | null;
  notes?: string | null;
  recorded_by?: string | null;
  is_social_project: boolean;
  created_at: string;
  updated_at: string;
  student_name?: string;
  recorded_by_name?: string;
}

export interface CreatePaymentData {
  student_id: string | null;
  amount: number;
  payment_date: string;
  due_date: string;
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: string | null;
  reference_month?: string | null;
  notes?: string | null;
  is_social_project?: boolean;
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, userType } = useSupabaseAuth();
  const { toast } = useToast();

  const fetchPayments = async (filters?: {
    studentId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    isSocialProject?: boolean;
  }) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          students:student_id (
            id,
            profile_id,
            profiles:profile_id (full_name)
          ),
          profiles:recorded_by (full_name)
        `)
        .order('payment_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.studentId) {
        query = query.eq('student_id', filters.studentId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('payment_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('payment_date', filters.endDate);
      }

      if (filters?.isSocialProject !== undefined) {
        query = query.eq('is_social_project', filters.isSocialProject);
      }

      const { data, error } = await query;

      if (error) throw error;

      const paymentsWithDetails = (data || []).map(payment => ({
        ...payment,
        student_name: (payment.students as any)?.profiles?.full_name || 'Não vinculado',
        recorded_by_name: (payment.profiles as any)?.full_name || 'Não definido'
      }));

      setPayments(paymentsWithDetails);
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pagamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (paymentData: CreatePaymentData) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Validações
      if (paymentData.amount <= 0) {
        throw new Error('O valor deve ser maior que zero');
      }

      if (!paymentData.payment_date || !paymentData.due_date) {
        throw new Error('Data de pagamento e vencimento são obrigatórias');
      }

      // Se for projeto social, garantir que o valor seja 0
      if (paymentData.is_social_project && paymentData.amount !== 0) {
        throw new Error('Pagamentos de projeto social devem ter valor zero');
      }

      const { data, error } = await supabase
        .from('payments')
        .insert([{
          ...paymentData,
          status: paymentData.status || 'pending',
          is_social_project: paymentData.is_social_project || false,
          recorded_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: paymentData.is_social_project 
          ? "Mensalidade de projeto social registrada com sucesso!" 
          : "Mensalidade registrada com sucesso!",
      });

      await fetchPayments();
      return data;
    } catch (error: any) {
      console.error('Erro ao criar pagamento:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível registrar o pagamento.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePayment = async (paymentId: string, paymentData: Partial<CreatePaymentData>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Validações
      if (paymentData.amount !== undefined && paymentData.amount < 0) {
        throw new Error('O valor não pode ser negativo');
      }

      // Se for projeto social, garantir que o valor seja 0
      if (paymentData.is_social_project && paymentData.amount !== undefined && paymentData.amount !== 0) {
        throw new Error('Pagamentos de projeto social devem ter valor zero');
      }

      const { error } = await supabase
        .from('payments')
        .update(paymentData)
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pagamento atualizado com sucesso!",
      });

      await fetchPayments();
    } catch (error: any) {
      console.error('Erro ao atualizar pagamento:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o pagamento.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePayment = async (paymentId: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pagamento excluído com sucesso!",
      });

      await fetchPayments();
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o pagamento.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const generateMonthlyPayments = async (month: string, year: number) => {
    if (!user || userType !== 'mestre') {
      throw new Error('Apenas mestres podem gerar mensalidades');
    }

    try {
      // Buscar todos os alunos ativos com mensalidade definida
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          monthly_fee,
          payment_due_date,
          profile_id,
          profiles:profile_id (full_name)
        `)
        .eq('active', true)
        .not('monthly_fee', 'is', null);

      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum aluno ativo com mensalidade definida encontrado.",
        });
        return;
      }

      const referenceMonth = `${year}-${month.padStart(2, '0')}-01`;
      const dueDay = 5; // Dia padrão de vencimento
      const dueDate = `${year}-${month.padStart(2, '0')}-${dueDay.toString().padStart(2, '0')}`;

      const paymentsToCreate = students.map(student => ({
        student_id: student.id,
        amount: Number(student.monthly_fee || 0),
        payment_date: referenceMonth,
        due_date: dueDate,
        status: 'pending' as const,
        reference_month: referenceMonth,
        is_social_project: Number(student.monthly_fee || 0) === 0, // Se mensalidade for 0, é projeto social
        recorded_by: user.id
      }));

      // Verificar se já existem pagamentos para este mês
      const { data: existingPayments } = await supabase
        .from('payments')
        .select('student_id, reference_month')
        .eq('reference_month', referenceMonth);

      const existingMap = new Map(
        (existingPayments || []).map(p => [`${p.student_id}-${p.reference_month}`, true])
      );

      const newPayments = paymentsToCreate.filter(p => 
        !existingMap.has(`${p.student_id}-${p.reference_month}`)
      );

      if (newPayments.length === 0) {
        toast({
          title: "Aviso",
          description: "Todas as mensalidades para este mês já foram geradas.",
        });
        return;
      }

      const { error: insertError } = await supabase
        .from('payments')
        .insert(newPayments);

      if (insertError) throw insertError;

      toast({
        title: "Sucesso",
        description: `${newPayments.length} mensalidade(s) gerada(s) com sucesso!`,
      });

      await fetchPayments();
    } catch (error: any) {
      console.error('Erro ao gerar mensalidades:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar as mensalidades.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  return {
    payments,
    loading,
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
    generateMonthlyPayments,
    refetch: fetchPayments
  };
}

