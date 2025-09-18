import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Send, 
  Search, 
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  MessageSquare
} from "lucide-react";
import { useMessages, type Conversation, type Message } from "@/hooks/useMessages";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { NewConversationDialog } from "@/components/messaging/NewConversationDialog";

// Remoção dos dados mock - agora usando dados do banco

export default function Mensagens() {
  const [conversaSelecionada, setConversaSelecionada] = useState<string | null>(null);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [busca, setBusca] = useState("");
  const [searchParams] = useSearchParams();
  
  const { user } = useSupabaseAuth();
  const { messages, conversations, loading, fetchMessages, sendMessage } = useMessages();

  const conversaAtual = conversations.find(c => c.user_id === conversaSelecionada);
  
  const conversasFiltradas = conversations.filter(conversa =>
    conversa.name.toLowerCase().includes(busca.toLowerCase()) ||
    conversa.lastMessage.toLowerCase().includes(busca.toLowerCase())
  );

  const getTipoColor = (tipo: Conversation['type']) => {
    const colors = {
      "instrutor": "bg-gradient-primary text-white",
      "aluno": "bg-gradient-accent text-white", 
      "responsavel": "bg-gradient-secondary text-white"
    };
    return colors[tipo] || "bg-gray-100 text-gray-800";
  };

  const getTipoLabel = (tipo: Conversation['type']) => {
    switch (tipo) {
      case 'instrutor':
        return 'Prof.';
      case 'responsavel':
        return 'Resp.';
      default:
        return '';
    }
  };

  const enviarMensagem = async () => {
    if (novaMensagem.trim() && conversaSelecionada) {
      await sendMessage(conversaSelecionada, novaMensagem);
      setNovaMensagem("");
    }
  };

  const selecionarConversa = async (userId: string) => {
    setConversaSelecionada(userId);
    await fetchMessages(userId);
  };

  // Check for chat parameter in URL and auto-select conversation
  useEffect(() => {
    const chatUserId = searchParams.get('chat');
    if (chatUserId && conversations.length > 0) {
      const existingConversation = conversations.find(conv => conv.user_id === chatUserId);
      if (existingConversation) {
        setConversaSelecionada(existingConversation.user_id);
      } else {
        // Start a new conversation with this user
        setConversaSelecionada(chatUserId);
      }
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    if (conversaSelecionada) {
      fetchMessages(conversaSelecionada);
    }
  }, [conversaSelecionada]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mensagens</h1>
          <p className="text-muted-foreground">
            Converse com alunos e responsáveis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Lista de Conversas */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Conversas</CardTitle>
              
              {/* Botão Nova Conversa */}
              <NewConversationDialog 
                onSelectUser={(userId) => selecionarConversa(userId)} 
              />
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar conversas..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[480px]">
                <div className="space-y-1">
                  {loading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="p-3">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-12" />
                            </div>
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    conversasFiltradas.map((conversa) => (
                      <div
                        key={conversa.user_id}
                        className={`p-3 cursor-pointer hover:bg-muted transition-colors ${
                          conversaSelecionada === conversa.user_id ? 'bg-muted' : ''
                        }`}
                        onClick={() => selecionarConversa(conversa.user_id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversa.avatar_url || ""} />
                              <AvatarFallback className={getTipoColor(conversa.type)}>
                                {conversa.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            {conversa.online && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">
                                {getTipoLabel(conversa.type)} {conversa.name}
                              </p>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-muted-foreground">
                                  {conversa.time}
                                </span>
                                {conversa.unreadCount > 0 && (
                                  <Badge variant="secondary" className="bg-secondary text-white">
                                    {conversa.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {conversa.lastMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {!loading && conversasFiltradas.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {busca ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Ativo */}
          <Card className="lg:col-span-2 flex flex-col">
            {conversaAtual ? (
              <>
                {/* Header do Chat */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversaAtual.avatar_url || ""} />
                        <AvatarFallback className={getTipoColor(conversaAtual.type)}>
                          {conversaAtual.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{getTipoLabel(conversaAtual.type)} {conversaAtual.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {conversaAtual.online ? 'Online agora' : 'Visto por último hoje'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Mensagens */}
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[400px] p-4">
                    <div className="space-y-4">
                      {messages.map((mensagem) => {
                        const isFromMe = mensagem.sender_id === user?.id;
                        return (
                          <div
                            key={mensagem.id}
                            className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isFromMe
                                  ? 'bg-gradient-primary text-white'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              <p className="text-sm">{mensagem.content}</p>
                              <p className={`text-xs mt-1 ${
                                isFromMe ? 'text-white/70' : 'text-muted-foreground'
                              }`}>
                                {new Date(mensagem.created_at).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      
                      {messages.length === 0 && conversaSelecionada && (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            Inicie uma conversa enviando uma mensagem
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Input de Nova Mensagem */}
                <div className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={enviarMensagem}
                      className="bg-gradient-primary"
                      disabled={!novaMensagem.trim() || !conversaSelecionada}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
                  <p className="text-muted-foreground">
                    Escolha uma conversa para começar a trocar mensagens
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}