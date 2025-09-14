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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState(prev => ({ 
          ...prev, 
          session, 
          user: session?.user ?? null,
          loading: false 
        }));
        
        if (session?.user) {
          // Fetch profile directly without setTimeout to prevent loops
          fetchProfile(session.user.id);
        } else {
          setAuthState(prev => ({ ...prev, profile: null }));
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthState(prev => ({ 
        ...prev, 
        session, 
        user: session?.user ?? null,
        loading: false 
      }));
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
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
      console.log('Attempting signup with:', { email, userData });
      
      // Simplify the signup - remove emailRedirectTo temporarily
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

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error details:', error);
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive"
        });
        return { error: error.message };
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