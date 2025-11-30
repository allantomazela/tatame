import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from './use-toast';

export interface FinancialTransaction {
  id: string;
  transaction_type: 'revenue' | 'expense';
  category: string;
  description: string;
  amount: number;
  transaction_date: string;
  payment_method?: string | null;
  reference_number?: string | null;
  supplier_payee?: string | null;
  polo_id?: string | null;
  student_id?: string | null;
  is_recurring: boolean;
  recurring_period?: string | null;
  attachment_url?: string | null;
  notes?: string | null;
  recorded_by: string;
  created_at: string;
  updated_at: string;
  polo_name?: string;
  student_name?: string;
  recorded_by_name?: string;
}

export interface CreateFinancialTransactionData {
  transaction_type: 'revenue' | 'expense';
  category: string;
  description: string;
  amount: number;
  transaction_date: string;
  payment_method?: string | null;
  reference_number?: string | null;
  supplier_payee?: string | null;
  polo_id?: string | null;
  student_id?: string | null;
  is_recurring?: boolean;
  recurring_period?: string | null;
  attachment_url?: string | null;
  notes?: string | null;
}

export interface FinancialCategory {
  id: string;
  name: string;
  type: 'revenue' | 'expense' | 'both';
  description?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialBalance {
  total_revenue: number;
  total_expense: number;
  balance: number;
}

export function useFinancialTransactions() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, userType } = useSupabaseAuth();
  const { toast } = useToast();

  const fetchTransactions = async (filters?: {
    startDate?: string;
    endDate?: string;
    type?: 'revenue' | 'expense';
    category?: string;
    poloId?: string;
  }) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('financial_transactions')
        .select(`
          *,
          polos:polo_id (name),
          students:student_id (
            id,
            profile_id,
            profiles:profile_id (full_name)
          ),
          profiles:recorded_by (full_name)
        `)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('transaction_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('transaction_date', filters.endDate);
      }

      if (filters?.type) {
        query = query.eq('transaction_type', filters.type);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.poloId) {
        query = query.eq('polo_id', filters.poloId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transactionsWithDetails = (data || []).map(transaction => ({
        ...transaction,
        polo_name: (transaction.polos as any)?.name || null,
        student_name: (transaction.students as any)?.profiles?.full_name || null,
        recorded_by_name: (transaction.profiles as any)?.full_name || 'Não definido'
      }));

      setTransactions(transactionsWithDetails);
    } catch (error) {
      console.error('Erro ao buscar transações financeiras:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações financeiras.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('financial_categories')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const createTransaction = async (transactionData: CreateFinancialTransactionData) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Validações
      if (transactionData.amount <= 0) {
        throw new Error('O valor deve ser maior que zero');
      }

      if (!transactionData.category || !transactionData.description) {
        throw new Error('Categoria e descrição são obrigatórias');
      }

      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([{
          ...transactionData,
          recorded_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: transactionData.transaction_type === 'revenue' 
          ? "Receita registrada com sucesso!" 
          : "Despesa registrada com sucesso!",
      });

      await fetchTransactions();
      return data;
    } catch (error: any) {
      console.error('Erro ao criar transação:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível registrar a transação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTransaction = async (transactionId: string, transactionData: Partial<CreateFinancialTransactionData>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Validações
      if (transactionData.amount !== undefined && transactionData.amount <= 0) {
        throw new Error('O valor deve ser maior que zero');
      }

      const { error } = await supabase
        .from('financial_transactions')
        .update(transactionData)
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso!",
      });

      await fetchTransactions();
    } catch (error: any) {
      console.error('Erro ao atualizar transação:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar a transação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso!",
      });

      await fetchTransactions();
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getBalance = async (startDate?: string, endDate?: string): Promise<FinancialBalance> => {
    try {
      const startParam = startDate || null;
      const endParam = endDate || null;

      const { data, error } = await supabase.rpc('calculate_financial_balance', {
        start_date: startParam,
        end_date: endParam
      });

      if (error) throw error;

      return data && data.length > 0 ? data[0] : {
        total_revenue: 0,
        total_expense: 0,
        balance: 0
      };
    } catch (error) {
      console.error('Erro ao calcular saldo:', error);
      // Calcular manualmente se a função RPC falhar
      const filtered = transactions.filter(t => {
        if (startDate && t.transaction_date < startDate) return false;
        if (endDate && t.transaction_date > endDate) return false;
        return true;
      });

      const total_revenue = filtered
        .filter(t => t.transaction_type === 'revenue')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const total_expense = filtered
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        total_revenue,
        total_expense,
        balance: total_revenue - total_expense
      };
    }
  };

  const createCategory = async (name: string, type: 'revenue' | 'expense' | 'both', description?: string) => {
    if (!user || userType !== 'mestre') {
      throw new Error('Apenas mestres podem criar categorias');
    }

    try {
      const { data, error } = await supabase
        .from('financial_categories')
        .insert([{ name, type, description }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
      });

      await fetchCategories();
      return data;
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a categoria.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCategory = async (categoryId: string, updates: { name?: string; type?: 'revenue' | 'expense' | 'both'; description?: string; active?: boolean }) => {
    if (!user || userType !== 'mestre') {
      throw new Error('Apenas mestres podem atualizar categorias');
    }

    try {
      const { error } = await supabase
        .from('financial_categories')
        .update(updates)
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!",
      });

      await fetchCategories();
    } catch (error: any) {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar a categoria.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!user || userType !== 'mestre') {
      throw new Error('Apenas mestres podem excluir categorias');
    }

    try {
      // Buscar o nome da categoria primeiro
      const { data: categoryData, error: categoryError } = await supabase
        .from('financial_categories')
        .select('name')
        .eq('id', categoryId)
        .single();

      if (categoryError) throw categoryError;

      // Verificar se há transações usando esta categoria
      const { data: transactionsUsingCategory, error: checkError } = await supabase
        .from('financial_transactions')
        .select('id')
        .eq('category', categoryData.name)
        .limit(1);

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (transactionsUsingCategory && transactionsUsingCategory.length > 0) {
        // Se houver transações, desativar a categoria em vez de excluir
        await updateCategory(categoryId, { active: false });
        toast({
          title: "Aviso",
          description: "Categoria desativada pois há transações associadas. Para excluir, primeiro remova todas as transações desta categoria.",
        });
        return;
      }

      const { error } = await supabase
        .from('financial_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!",
      });

      await fetchCategories();
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir a categoria.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  return {
    transactions,
    categories,
    loading,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getBalance,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchTransactions
  };
}

