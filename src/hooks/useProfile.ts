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
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o perfil.",
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
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível alterar a senha.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setLoading(true);

      // Verificar se o bucket existe
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        throw new Error('Não foi possível acessar o storage. Verifique as configurações do Supabase.');
      }

      const avatarsBucket = buckets?.find(b => b.name === 'avatars');
      
      if (!avatarsBucket) {
        // Se o bucket não existe, usar uma URL base64 temporária ou informar o usuário
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = async () => {
            try {
              // Usar data URL como fallback
              const dataUrl = reader.result as string;
              await updateProfile({ avatar_url: dataUrl });
              resolve({ url: dataUrl });
            } catch (error) {
              reject(new Error('Bucket de avatares não encontrado. Por favor, crie o bucket "avatars" no Supabase Storage ou entre em contato com o administrador.'));
            }
          };
          reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
          reader.readAsDataURL(file);
        });
      }

      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Permitir sobrescrever se já existir
        });

      if (uploadError) {
        // Se erro de bucket não encontrado, usar fallback
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
          const reader = new FileReader();
          return new Promise((resolve, reject) => {
            reader.onloadend = async () => {
              try {
                const dataUrl = reader.result as string;
                await updateProfile({ avatar_url: dataUrl });
                resolve({ url: dataUrl });
              } catch (error) {
                reject(new Error('Bucket de avatares não encontrado. Por favor, crie o bucket "avatars" no Supabase Storage.'));
              }
            };
            reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
            reader.readAsDataURL(file);
          });
        }
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Atualizar perfil com a URL do avatar
      await updateProfile({ avatar_url: publicUrl });

      return { url: publicUrl };
    } catch (error: any) {
      console.error('Erro ao fazer upload do avatar:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível fazer upload do avatar. O bucket 'avatars' precisa ser criado no Supabase Storage.",
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

