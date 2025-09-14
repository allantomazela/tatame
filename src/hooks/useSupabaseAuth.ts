import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type UserType = 'mestre' | 'aluno' | 'responsavel';

interface AuthState {
  user: User | null;
  profile: any | null;
  session: Session | null;
  loading: boolean;
}

export function useSupabaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  });

  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setAuthState(prev => ({ ...prev, profile: null }));
        return;
      }

      setAuthState(prev => ({ ...prev, profile: data }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      setAuthState(prev => ({ ...prev, profile: null }));
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setAuthState(prev => ({ 
          ...prev, 
          session, 
          user: session?.user ?? null,
          loading: false 
        }));
        
        if (session?.user && mounted) {
          // Usar setTimeout para evitar loops
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user.id);
            }
          }, 0);
        } else if (mounted) {
          setAuthState(prev => ({ ...prev, profile: null }));
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      if (!mounted) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!mounted) return;
      
      setAuthState(prev => ({ 
        ...prev, 
        session, 
        user: session?.user ?? null,
        loading: false 
      }));
      
      if (session?.user && mounted) {
        setTimeout(() => {
          if (mounted) {
            fetchProfile(session.user.id);
          }
        }, 0);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);


  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive"
        });
        return { error: error.message };
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!"
      });
      return {};
    } catch (error) {
      const errorMessage = 'Erro inesperado no login';
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, userData: {
    fullName: string;
    userType: UserType;
    phone?: string;
  }): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            user_type: userData.userType,
            phone: userData.phone || ''
          }
        }
      });

      if (error) {
        // Melhor tratamento de erros específicos
        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login ou use outro email.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Email inválido. Verifique o formato do email.';
        } else if (error.message.includes('Password')) {
          errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
        }
        
        toast({
          title: "Erro no cadastro",
          description: errorMessage,
          variant: "destructive"
        });
        return { error: errorMessage };
      }

      if (data.user && !data.session) {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta e faça login."
        });
      } else {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Bem-vindo ao Tatame!"
        });
      }

      return {};
    } catch (error) {
      const errorMessage = 'Erro inesperado no cadastro';
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: errorMessage };
    }
  };

  const signOut = async (): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive"
        });
        return { error: error.message };
      }
      
      toast({
        title: "Logout realizado",
        description: "Até logo!"
      });
      return {};
    } catch (error) {
      const errorMessage = 'Erro inesperado ao sair';
      toast({
        title: "Erro ao sair",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: errorMessage };
    }
  };

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Erro no login com Google",
          description: error.message,
          variant: "destructive"
        });
        return { error: error.message };
      }

      return {};
    } catch (error) {
      const errorMessage = 'Erro inesperado no login com Google';
      toast({
        title: "Erro no login com Google",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: errorMessage };
    }
  };

  return {
    user: authState.user,
    profile: authState.profile,
    session: authState.session,
    loading: authState.loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    isAuthenticated: !!authState.user,
    userType: authState.profile?.user_type as UserType | undefined,
  };
}