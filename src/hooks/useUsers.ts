import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from './use-toast';

export interface User {
  id: string;
  full_name: string;
  email: string;
  user_type: 'instrutor' | 'aluno' | 'responsavel';
  avatar_url?: string;
  phone?: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  const fetchUsers = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, user_type, avatar_url, phone')
        .neq('id', user.id) // Excluir o usuário atual
        .order('full_name');

      if (error) throw error;

      setUsers((data || []) as User[]);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  return {
    users,
    loading,
    fetchUsers
  };
}