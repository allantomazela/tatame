import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from './use-toast';

export interface ProfileData {
  full_name: string;
  email: string;
  phone?: string | null;
  birth_date?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
  avatar_url?: string | null;
}

export function useProfile() {
  const { user, profile } = useSupabaseAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return data;
  };

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setLoading(true);

      // Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Se o email foi alterado, atualizar também no auth
      if (updates.email && updates.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: updates.email
        });

        if (emailError) {
          console.warn('Erro ao atualizar email no auth:', emailError);
          // Não falhar completamente, apenas avisar
          toast({
            title: "Aviso",
            description: "Perfil atualizado, mas o email pode precisar ser confirmado.",
            variant: "default",
          });
        }
      }

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });

      // Recarregar perfil - recarregar a página para atualizar o estado
      window.location.reload();

      return { success: true };
    } catch (error: unknown) {
      console.error('Erro ao atualizar perfil:', error);
      const msg = error instanceof Error ? error.message : "Não foi possível atualizar o perfil.";
      toast({
        title: "Erro",
        description: msg,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setLoading(true);

      // Verificar senha atual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: currentPassword
      });

      if (signInError) {
        throw new Error('Senha atual incorreta');
      }

      // Atualizar senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      });

      return { success: true };
    } catch (error: unknown) {
      console.error('Erro ao atualizar senha:', error);
      const msg = error instanceof Error ? error.message : "Não foi possível alterar a senha.";
      toast({
        title: "Erro",
        description: msg,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /** Tamanho máximo do avatar: 2MB. Evita sobrecarga no Storage e no banco. */
  const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
  const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const uploadAvatar = async (file: File) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setLoading(true);

      if (file.size > AVATAR_MAX_BYTES) {
        toast({
          title: "Arquivo grande",
          description: `O avatar deve ter no máximo 2 MB. O arquivo enviado tem ${(file.size / 1024 / 1024).toFixed(2)} MB.`,
          variant: "destructive",
        });
        throw new Error('Arquivo maior que 2 MB');
      }

      if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: "Tipo não permitido",
          description: "Use imagem em JPEG, PNG, WebP ou GIF.",
          variant: "destructive",
        });
        throw new Error('Tipo de arquivo não permitido');
      }

      // Nome único: userId + timestamp. Sempre sobrescreve o anterior do mesmo usuário.
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt) ? fileExt : 'jpg';
      const filePath = `${user.id}/avatar-${Date.now()}.${safeExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
          toast({
            title: "Bucket não configurado",
            description: "Crie o bucket 'avatars' no Supabase (Storage) e torne-o público para exibir fotos.",
            variant: "destructive",
          });
          throw new Error('Bucket de avatares não encontrado');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      // Não chama updateProfile aqui: o caller decide (ex.: salvar só avatar ou avatar + formulário).
      return { url: publicUrl };
    } catch (error: unknown) {
      console.error('Erro ao fazer upload do avatar:', error);
      const msg = error instanceof Error ? error.message : "Não foi possível fazer upload do avatar.";
      toast({
        title: "Erro",
        description: msg,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    updatePassword,
    uploadAvatar
  };
}

