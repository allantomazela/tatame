import React, { useState, useEffect, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export type UserType = 'mestre' | 'aluno' | 'responsavel';

type ProfileRow = Tables<"profiles">;

interface AuthState {
  user: User | null;
  profile: ProfileRow | null;
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
  
  // Ref para prevenir loops
  const profileFetched = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    // Prevenir loop absoluto
    if (profileFetched.current === userId) {
      return;
    }

    profileFetched.current = userId;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error.message, {
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        setAuthState(prev => ({ ...prev, profile: null, loading: false }));
        return;
      }

      if (data) {
        setAuthState(prev => ({ ...prev, profile: data, loading: false }));
        return;
      }

      // Usuário sem perfil (ex.: trigger falhou ou conta antiga). Criar a partir dos metadados do auth.
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        setAuthState(prev => ({ ...prev, profile: null, loading: false }));
        return;
      }

      const meta = user.user_metadata || {};
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email ?? '',
        full_name: meta.full_name ?? meta.name ?? '',
        user_type: (meta.user_type ?? 'aluno') as string,
        phone: meta.phone ?? null,
      });

      if (insertError) {
        console.error('Profile insert fallback error:', insertError.message);
        setAuthState(prev => ({ ...prev, profile: null, loading: false }));
        return;
      }

      const { data: newProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      setAuthState(prev => ({ ...prev, profile: newProfile ?? null, loading: false }));
    } catch (error) {
      console.error('Profile fetch catch:', error);
      setAuthState(prev => ({ ...prev, profile: null, loading: false }));
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        setAuthState(prev => ({ 
          ...prev, 
          session, 
          user: session?.user ?? null,
          loading: false 
        }));
        
        if (session?.user && mounted && profileFetched.current !== session.user.id) {
          fetchProfile(session.user.id);
        } else if (!session?.user && mounted) {
          setAuthState(prev => ({ ...prev, profile: null }));
          profileFetched.current = null;
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
      
      if (session?.user && mounted && profileFetched.current !== session.user.id) {
        fetchProfile(session.user.id);
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
        let description = error.message;
        if (error.message.toLowerCase().includes('email not confirmed') || error.message.toLowerCase().includes('confirm your')) {
          description = 'E-mail ainda não confirmado. Verifique sua caixa de entrada (e o spam) pelo link enviado, ou peça ao administrador para confirmar sua conta no painel do Supabase.';
        } else if (error.message.toLowerCase().includes('invalid login') || error.message.toLowerCase().includes('invalid credentials')) {
          description = 'E-mail ou senha incorretos. Confira os dados e tente novamente.';
        }
        toast({
          title: "Erro no login",
          description,
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
  }): Promise<{ error?: string; switchToLogin?: boolean }> => {
    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}${(import.meta.env.BASE_URL ?? '/').replace(/\/$/, '')}/auth/callback`
          : undefined;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            user_type: userData.userType,
            phone: userData.phone || ''
          },
          emailRedirectTo: redirectTo
        }
      });

      if (error) {
        // Tratamento específico para usuário já existente
        let errorMessage = error.message;
        if (error.message.includes('User already registered') || error.message.includes('user_already_exists')) {
          errorMessage = 'Este email já está cadastrado. Use o formulário de login abaixo.';
          // Automaticamente trocar para aba de login
          return { error: errorMessage, switchToLogin: true };
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

  const resetPasswordForEmail = async (email: string): Promise<{ error?: string }> => {
    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}${(import.meta.env.BASE_URL ?? '/').replace(/\/$/, '')}/redefinir-senha`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo
      });

      if (error) {
        toast({
          title: "Erro ao enviar e-mail",
          description: error.message,
          variant: "destructive"
        });
        return { error: error.message };
      }

      toast({
        title: "E-mail enviado",
        description: "Verifique sua caixa de entrada (e o spam) para redefinir sua senha."
      });
      return {};
    } catch (error) {
      const errorMessage = 'Erro inesperado ao enviar e-mail de recuperação';
      toast({
        title: "Erro",
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

  return {
    user: authState.user,
    profile: authState.profile,
    session: authState.session,
    loading: authState.loading,
    signIn,
    signUp,
    signOut,
    resetPasswordForEmail,
    isAuthenticated: !!authState.user,
    userType: authState.profile?.user_type as UserType | undefined,
  };
}