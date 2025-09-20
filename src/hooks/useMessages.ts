import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from './use-toast';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject?: string;
  content: string;
  read: boolean;
  message_type: string;
  created_at: string;
  read_at?: string;
  sender_profile?: {
    full_name: string;
    avatar_url?: string;
  };
  recipient_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface Conversation {
  id: string;
  name: string;
  type: 'instrutor' | 'aluno' | 'responsavel';
  lastMessage: string;
  time: string;
  unreadCount: number;
  online: boolean;
  user_id: string;
  avatar_url?: string;
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  // Buscar conversas (usuários únicos com mensagens)
  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(full_name, avatar_url, user_type),
          recipient_profile:profiles!messages_recipient_id_fkey(full_name, avatar_url, user_type)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Agrupar mensagens por conversa
      const conversationsMap = new Map<string, Conversation>();
      
      messagesData?.forEach((message) => {
        const isFromCurrentUser = message.sender_id === user.id;
        const otherUserId = isFromCurrentUser ? message.recipient_id : message.sender_id;
        const otherUserProfile = isFromCurrentUser ? message.recipient_profile : message.sender_profile;
        
        if (!conversationsMap.has(otherUserId) && otherUserProfile) {
          conversationsMap.set(otherUserId, {
            id: otherUserId,
            name: otherUserProfile.full_name,
            type: otherUserProfile.user_type as 'instrutor' | 'aluno' | 'responsavel',
            lastMessage: message.content,
            time: new Date(message.created_at).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            unreadCount: 0,
            online: Math.random() > 0.5, // Placeholder para status online
            user_id: otherUserId,
            avatar_url: otherUserProfile.avatar_url
          });
        }
      });

      // Contar mensagens não lidas para cada conversa
      for (const [userId, conversation] of conversationsMap) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', userId)
          .eq('recipient_id', user.id)
          .eq('read', false);
        
        conversation.unreadCount = count || 0;
      }

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas.",
        variant: "destructive",
      });
    }
  };

  // Buscar mensagens de uma conversa específica
  const fetchMessages = async (otherUserId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(full_name, avatar_url),
          recipient_profile:profiles!messages_recipient_id_fkey(full_name, avatar_url)
        `)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar mensagens:', error);
        setMessages([]); // Set empty array even if no messages exist yet
        return;
      }

      setMessages(data || []);

      // Marcar mensagens recebidas como lidas
      await supabase
        .from('messages')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('sender_id', otherUserId)
        .eq('recipient_id', user.id)
        .eq('read', false);

    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      setMessages([]);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens.",
        variant: "destructive",
      });
    }
  };

  // Enviar nova mensagem
  const sendMessage = async (recipientId: string, content: string, subject?: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim(),
          subject,
          message_type: 'general',
          read: false
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Mensagem enviada com sucesso!",
      });

      // Recarregar mensagens
      await fetchMessages(recipientId);
      await fetchConversations();

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    }
  };

  // Configurar realtime para novas mensagens
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Carregar conversas iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchConversations();
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  return {
    messages,
    conversations,
    loading,
    fetchMessages,
    sendMessage,
    fetchConversations
  };
}