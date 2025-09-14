import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Search, 
  MoreVertical,
  Phone,
  Video,
  Paperclip
} from "lucide-react";

interface Conversa {
  id: string;
  nome: string;
  tipo: "mestre" | "aluno" | "responsavel";
  ultimaMensagem: string;
  horario: string;
  naoLidas: number;
  online: boolean;
}

interface Mensagem {
  id: string;
  texto: string;
  horario: string;
  enviada: boolean;
}

const conversasMock: Conversa[] = [
  {
    id: "1",
    nome: "João Silva",
    tipo: "aluno",
    ultimaMensagem: "Obrigado pelas dicas de hoje!",
    horario: "14:30",
    naoLidas: 0,
    online: true
  },
  {
    id: "2",
    nome: "Ana Costa (Responsável)",
    tipo: "responsavel",
    ultimaMensagem: "Maria poderá participar da graduação?",
    horario: "13:45",
    naoLidas: 2,
    online: false
  },
  {
    id: "3",
    nome: "Pedro Oliveira",
    tipo: "aluno",
    ultimaMensagem: "Qual horário da aula amanhã?",
    horario: "12:20",
    naoLidas: 1,
    online: true
  },
  {
    id: "4",
    nome: "Maria Santos",
    tipo: "aluno",
    ultimaMensagem: "Consegui fazer o movimento que você ensinou!",
    horario: "11:15",
    naoLidas: 0,
    online: false
  }
];

const mensagensMock: Mensagem[] = [
  {
    id: "1",
    texto: "Olá! Como está o treino?",
    horario: "13:00",
    enviada: false
  },
  {
    id: "2",
    texto: "Está indo muito bem! Consegui melhorar o chute lateral",
    horario: "13:05",
    enviada: true
  },
  {
    id: "3",
    texto: "Excelente! Continue praticando. Lembre-se de manter o equilíbrio",
    horario: "13:07",
    enviada: false
  },
  {
    id: "4",
    texto: "Vou continuar praticando. Obrigado pelas dicas de hoje!",
    horario: "14:30",
    enviada: true
  }
];

export default function Mensagens() {
  const [conversaSelecionada, setConversaSelecionada] = useState<Conversa>(conversasMock[0]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [busca, setBusca] = useState("");

  const getTipoColor = (tipo: string) => {
    const colors = {
      "mestre": "bg-gradient-primary text-white",
      "aluno": "bg-gradient-accent text-white",
      "responsavel": "bg-gradient-secondary text-white"
    };
    return colors[tipo as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const enviarMensagem = () => {
    if (novaMensagem.trim()) {
      // Lógica para enviar mensagem
      setNovaMensagem("");
    }
  };

  const conversasFiltradas = conversasMock.filter(conversa =>
    conversa.nome.toLowerCase().includes(busca.toLowerCase())
  );

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
                  {conversasFiltradas.map((conversa) => (
                    <div
                      key={conversa.id}
                      className={`p-3 cursor-pointer hover:bg-muted transition-colors ${
                        conversaSelecionada.id === conversa.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setConversaSelecionada(conversa)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="" />
                            <AvatarFallback className={getTipoColor(conversa.tipo)}>
                              {conversa.nome.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {conversa.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">
                              {conversa.nome}
                            </p>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-muted-foreground">
                                {conversa.horario}
                              </span>
                              {conversa.naoLidas > 0 && (
                                <Badge variant="secondary" className="bg-secondary text-white">
                                  {conversa.naoLidas}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {conversa.ultimaMensagem}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Ativo */}
          <Card className="lg:col-span-2 flex flex-col">
            {/* Header do Chat */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className={getTipoColor(conversaSelecionada.tipo)}>
                      {conversaSelecionada.nome.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{conversaSelecionada.nome}</h3>
                    <p className="text-xs text-muted-foreground">
                      {conversaSelecionada.online ? 'Online agora' : 'Visto por último hoje'}
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
                  {mensagensMock.map((mensagem) => (
                    <div
                      key={mensagem.id}
                      className={`flex ${mensagem.enviada ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          mensagem.enviada
                            ? 'bg-gradient-primary text-white'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{mensagem.texto}</p>
                        <p className={`text-xs mt-1 ${
                          mensagem.enviada ? 'text-white/70' : 'text-muted-foreground'
                        }`}>
                          {mensagem.horario}
                        </p>
                      </div>
                    </div>
                  ))}
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
                  disabled={!novaMensagem.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}