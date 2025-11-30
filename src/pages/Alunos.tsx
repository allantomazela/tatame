import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useStudents } from "@/hooks/useStudents";

export default function Alunos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFaixa, setFilterFaixa] = useState("todas");
  const { students, loading } = useStudents();
  const navigate = useNavigate();

  const getFaixaColor = (faixa: string) => {
    const colors = {
      "Branca": "bg-gray-100 text-gray-800",
      "Amarela": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "Verde": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "Azul": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "Vermelha": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "Preta": "bg-gray-900 text-white dark:bg-gray-800 dark:text-gray-100"
    };
    return colors[faixa as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "ativo": "bg-green-100 text-green-800",
      "inativo": "bg-gray-100 text-gray-800",
      "suspenso": "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getAge = (birthDate: string | null): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleChatClick = (studentProfileId: string) => {
    navigate(`/mensagens?chat=${studentProfileId}`);
  };

  const filteredStudents = students.filter(student => {
    const studentName = student.profile?.full_name || '';
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaixa = filterFaixa === "todas" || student.belt_color === filterFaixa.toLowerCase();
    return matchesSearch && matchesFaixa;
  });

  return (
    <Layout>
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
                    <SelectItem value="branca">Branca</SelectItem>
                    <SelectItem value="amarela">Amarela</SelectItem>
                    <SelectItem value="verde">Verde</SelectItem>
                    <SelectItem value="azul">Azul</SelectItem>
                    <SelectItem value="vermelha">Vermelha</SelectItem>
                    <SelectItem value="preta">Preta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Alunos */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-16 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex space-x-2 pt-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-accent transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={student.profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-gradient-accent text-white">
                          {student.profile?.full_name?.split(' ').map(n => n[0]).join('') || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{student.profile?.full_name || 'Nome não disponível'}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {getAge(student.profile?.birth_date || null)} anos
                        </p>
                      </div>
                    </div>
                    <Badge className={getFaixaColor(student.belt_color)}>
                      {student.belt_color.charAt(0).toUpperCase() + student.belt_color.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Grau da Faixa:</span>
                    <span className="font-medium">{student.belt_degree}º Dan</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Status:</span>
                    <Badge className="bg-green-100 text-green-800" variant="outline">
                      {student.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Data de Ingresso:</span>
                    <p className="font-medium">{new Date(student.date_joined).toLocaleDateString('pt-BR')}</p>
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleChatClick(student.profile_id || '')}
                    >
                      <MessageCircle className="mr-1 h-3 w-3" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {!loading && filteredStudents.length === 0 && (
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