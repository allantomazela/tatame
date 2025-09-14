import { useState, useEffect } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, Profile, UserType } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
}

export function useSupabaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true
  })
  const { toast } = useToast()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({ ...prev, session, user: session?.user ?? null }))
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthState(prev => ({ ...prev, session, user: session?.user ?? null }))
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setAuthState(prev => ({ ...prev, profile: null, loading: false }))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      setAuthState(prev => ({ ...prev, profile: data, loading: false }))
    } catch (error) {
      console.error('Error fetching profile:', error)
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive"
        })
        return { success: false, error: error.message }
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!"
      })
      return { success: true }
    } catch (error) {
      const errorMessage = 'Erro inesperado no login'
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive"
      })
      return { success: false, error: errorMessage }
    }
  }

  const signUp = async (email: string, password: string, userData: {
    fullName: string;
    userType: UserType;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            user_type: userData.userType,
            phone: userData.phone
          }
        }
      })

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive"
        })
        return { success: false, error: error.message }
      }

      if (data.user && !data.session) {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta."
        })
      }

      return { success: true }
    } catch (error) {
      const errorMessage = 'Erro inesperado no cadastro'
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive"
      })
      return { success: false, error: errorMessage }
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast({
        title: "Logout realizado",
        description: "Até logo!"
      })
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao sair",
        variant: "destructive"
      })
    }
  }

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        toast({
          title: "Erro no login com Google",
          description: error.message,
          variant: "destructive"
        })
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      const errorMessage = 'Erro inesperado no login com Google'
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive"
      })
      return { success: false, error: errorMessage }
    }
  }

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
    userType: authState.profile?.user_type
  }
}