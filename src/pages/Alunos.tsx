import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye,
  Edit,
  MessageCircle,
  Award,
  Calendar
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Aluno {
  id: string;
  nome: string;
  faixa: string;
  idade: number;
  frequencia: number;
  proximaGraduacao: string;
  contato: string;
  status: "ativo" | "inativo" | "suspenso";
}

const alunosMock: Aluno[] = [
  {
    id: "1",
    nome: "João Silva",
    faixa: "Verde",
    idade: 14,
    frequencia: 92,
    proximaGraduacao: "2024-04-15",
    contato: "joao@email.com",
    status: "ativo"
  },
  {
    id: "2",
    nome: "Maria Santos",
    faixa: "Azul",
    idade: 16,
    frequencia: 87,
    proximaGraduacao: "2024-06-20",
    contato: "maria@email.com",
    status: "ativo"
  },
  {
    id: "3",
    nome: "Pedro Oliveira",
    faixa: "Amarela",
    idade: 12,
    frequencia: 78,
    proximaGraduacao: "2024-03-10",
    contato: "pedro@email.com",
    status: "ativo"
  },
  {
    id: "4",
    nome: "Ana Costa",
    faixa: "Branca",
    idade: 10,
    frequencia: 95,
    proximaGraduacao: "2024-05-05",
    contato: "ana@email.com",
    status: "ativo"
  },
];

export default function Alunos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFaixa, setFilterFaixa] = useState("todas");
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);

  const getFaixaColor = (faixa: string) => {
    const colors = {
      "Branca": "bg-gray-100 text-gray-800",
      "Amarela": "bg-yellow-100 text-yellow-800",
      "Verde": "bg-green-100 text-green-800",
      "Azul": "bg-blue-100 text-blue-800",
      "Vermelha": "bg-red-100 text-red-800",
      "Preta": "bg-gray-900 text-white"
    };
    return colors[faixa as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "ativo": "bg-green-100 text-green-800",
      "inativo": "bg-gray-100 text-gray-800",
      "suspenso": "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const filteredAlunos = alunosMock.filter(aluno => {
    const matchesSearch = aluno.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaixa = filterFaixa === "todas" || aluno.faixa === filterFaixa;
    return matchesSearch && matchesFaixa;
  });

  return (
    <Layout userType="mestre" userName="Mestre Kim">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Alunos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os alunos da academia
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Novo Aluno
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
                <DialogDescription>
                  Adicione um novo aluno à academia
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome Completo</label>
                    <Input placeholder="Nome do aluno" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input placeholder="email@exemplo.com" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Idade</label>
                    <Input type="number" placeholder="14" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Faixa Inicial</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="branca">Branca</SelectItem>
                        <SelectItem value="amarela">Amarela</SelectItem>
                        <SelectItem value="verde">Verde</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Telefone</label>
                    <Input placeholder="(11) 99999-9999" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Observações Médicas</label>
                  <Input placeholder="Alergias, medicamentos, etc." />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button className="bg-gradient-primary">Cadastrar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar alunos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterFaixa} onValueChange={setFilterFaixa}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Faixas</SelectItem>
                    <SelectItem value="Branca">Branca</SelectItem>
                    <SelectItem value="Amarela">Amarela</SelectItem>
                    <SelectItem value="Verde">Verde</SelectItem>
                    <SelectItem value="Azul">Azul</SelectItem>
                    <SelectItem value="Vermelha">Vermelha</SelectItem>
                    <SelectItem value="Preta">Preta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Alunos */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAlunos.map((aluno) => (
            <Card key={aluno.id} className="hover:shadow-accent transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-accent text-white">
                        {aluno.nome.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{aluno.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground">{aluno.idade} anos</p>
                    </div>
                  </div>
                  <Badge className={getFaixaColor(aluno.faixa)}>
                    {aluno.faixa}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Frequência:</span>
                  <span className="font-medium">{aluno.frequencia}%</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Status:</span>
                  <Badge className={getStatusColor(aluno.status)} variant="outline">
                    {aluno.status}
                  </Badge>
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Próxima Graduação:</span>
                  <p className="font-medium">{new Date(aluno.proximaGraduacao).toLocaleDateString('pt-BR')}</p>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="mr-1 h-3 w-3" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageCircle className="mr-1 h-3 w-3" />
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAlunos.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhum aluno encontrado com os filtros aplicados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}