import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from './use-toast';

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: 'pt-BR' | 'en-US' | 'es-ES';
  email_notifications: boolean;
  push_notifications: boolean;
  payment_reminders: boolean;
  attendance_notifications: boolean;
  event_notifications: boolean;
  message_notifications: boolean;
  auto_backup: boolean;
  date_format: string;
  time_format: '12h' | '24h';
  currency_symbol: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingsData {
  theme?: 'light' | 'dark' | 'system';
  language?: 'pt-BR' | 'en-US' | 'es-ES';
  email_notifications?: boolean;
  push_notifications?: boolean;
  payment_reminders?: boolean;
  attendance_notifications?: boolean;
  event_notifications?: boolean;
  message_notifications?: boolean;
  auto_backup?: boolean;
  date_format?: string;
  time_format?: '12h' | '24h';
  currency_symbol?: string;
}

const defaultSettings: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  theme: 'light',
  language: 'pt-BR',
  email_notifications: true,
  push_notifications: true,
  payment_reminders: true,
  attendance_notifications: true,
  event_notifications: true,
  message_notifications: true,
  auto_backup: true,
  date_format: 'DD/MM/YYYY',
  time_format: '24h',
  currency_symbol: 'R$'
};

export function useSettings() {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
      } else {
        // Criar settings padrão se não existir
        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert([{ user_id: user.id, ...defaultSettings }])
          .select()
          .single();

        // Se erro 23505 (unique violation) ou 409 (conflict), tentar buscar novamente
        if (createError && (createError.code === '23505' || createError.code === '409')) {
          // Settings já existem, buscar novamente
          const { data: existingData } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (existingData) {
            setSettings(existingData);
          } else {
            throw createError;
          }
        } else if (createError) {
          throw createError;
        } else if (newSettings) {
          setSettings(newSettings);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      // Usar settings padrão em caso de erro
      setSettings({
        id: '',
        user_id: user?.id || '',
        ...defaultSettings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as UserSettings);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: UpdateSettingsData) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso!",
      });

      await fetchSettings();

      // Aplicar tema se foi alterado
      if (updates.theme) {
        applyTheme(updates.theme);
      }
    } catch (error: any) {
      console.error('Erro ao atualizar configurações:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar as configurações.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  };

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  useEffect(() => {
    if (settings?.theme) {
      applyTheme(settings.theme);
    }
  }, [settings?.theme]);

  return {
    settings: settings || {
      id: '',
      user_id: user?.id || '',
      ...defaultSettings,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as UserSettings,
    loading,
    fetchSettings,
    updateSettings,
    refetch: fetchSettings
  };
}

