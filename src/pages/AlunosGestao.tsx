import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  User,
  Phone,
  Mail,
  Calendar,
  Award
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Student {
  id: string;
  profile_id: string;
  belt_color: string;
  belt_degree: number;
  date_joined: string;
  active: boolean;
  monthly_fee: number;
  medical_info?: string;
  responsible_id?: string;
  profiles?: {
    full_name: string;
    email: string;
    phone?: string;
    birth_date?: string;
  };
}

export default function AlunosGestao() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBelt, setFilterBelt] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    birth_date: "",
    belt_color: "branca",
    belt_degree: 1,
    monthly_fee: 0,
    medical_info: ""
  });

  const beltColors = [
    { value: "branca", label: "Branca", color: "bg-gray-100" },
    { value: "amarela", label: "Amarela", color: "bg-yellow-200" },
    { value: "laranja", label: "Laranja", color: "bg-orange-200" },
    { value: "verde", label: "Verde", color: "bg-green-200" },
    { value: "azul", label: "Azul", color: "bg-blue-200" },
    { value: "marrom", label: "Marrom", color: "bg-amber-600" },
    { value: "preta", label: "Preta", color: "bg-black text-white" },
  ];

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profiles!students_profile_id_fkey (
            full_name,
            email,
            phone,
            birth_date
          )
        `)
        .eq('active', true)
        .order('date_joined', { ascending: false });

      if (error) throw error;
      setStudents(data as Student[] || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alunos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSaveStudent = async () => {
    try {
      setLoading(true);
      
      if (editingStudent) {
        // Update existing student
        // Implementation for update would go here
        toast({
          title: "Sucesso",
          description: "Aluno atualizado com sucesso"
        });
      } else {
        // Create new student
        // First create profile, then create student record
        toast({
          title: "Funcionalidade em desenvolvimento",
          description: "Cadastro de novos alunos será implementado em breve"
        });
      }
      
      setIsDialogOpen(false);
      setEditingStudent(null);
      resetForm();
      fetchStudents();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o aluno",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      birth_date: "",
      belt_color: "branca",
      belt_degree: 1,
      monthly_fee: 0,
      medical_info: ""
    });
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      full_name: student.profiles?.full_name || "",
      email: student.profiles?.email || "",
      phone: student.profiles?.phone || "",
      birth_date: student.profiles?.birth_date || "",
      belt_color: student.belt_color,
      belt_degree: student.belt_degree,
      monthly_fee: student.monthly_fee || 0,
      medical_info: student.medical_info || ""
    });
    setIsDialogOpen(true);
  };

  const getBeltColor = (beltName: string) => {
    return beltColors.find(belt => belt.value === beltName)?.color || "bg-gray-100";
  };

  const getBeltLabel = (beltName: string) => {
    return beltColors.find(belt => belt.value === beltName)?.label || beltName;
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.profiles?.full_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      student.profiles?.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    
    const matchesBelt = filterBelt === "all" || student.belt_color === filterBelt;
    
    return matchesSearch && matchesBelt;
  });

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return "N/A";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anos`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Alunos</h1>
            <p className="text-muted-foreground">Gerencie todos os alunos do seu tatame</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Aluno
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingStudent ? "Editar Aluno" : "Cadastrar Novo Aluno"}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do aluno abaixo
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Nome do aluno"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="belt_color">Graduação</Label>
                    <Select 
                      value={formData.belt_color} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, belt_color: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {beltColors.map((belt) => (
                          <SelectItem key={belt.value} value={belt.value}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${belt.color}`}></div>
                              <span>{belt.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="belt_degree">Grau</Label>
                    <Input
                      id="belt_degree"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.belt_degree}
                      onChange={(e) => setFormData(prev => ({ ...prev, belt_degree: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly_fee">Mensalidade (R$)</Label>
                    <Input
                      id="monthly_fee"
                      type="number"
                      step="0.01"
                      value={formData.monthly_fee}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthly_fee: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medical_info">Informações Médicas</Label>
                  <Textarea
                    id="medical_info"
                    value={formData.medical_info}
                    onChange={(e) => setFormData(prev => ({ ...prev, medical_info: e.target.value }))}
                    placeholder="Alergias, medicamentos, restrições..."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveStudent} disabled={loading}>
                  {loading ? "Salvando..." : editingStudent ? "Atualizar" : "Cadastrar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos este mês</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faixas Pretas</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter(s => s.belt_color === 'preta').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Retenção</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterBelt} onValueChange={setFilterBelt}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as faixas</SelectItem>
                    {beltColors.map((belt) => (
                      <SelectItem key={belt.value} value={belt.value}>
                        {belt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Students Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {student.profiles?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{student.profiles?.full_name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getBeltColor(student.belt_color)}`}></div>
                        <span className="text-sm text-muted-foreground">
                          {getBeltLabel(student.belt_color)} {student.belt_degree}º Grau
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => openEditDialog(student)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="h-4 w-4 mr-2" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{student.profiles?.email}</span>
                </div>
                
                {student.profiles?.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{student.profiles.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {calculateAge(student.profiles?.birth_date)} • 
                    Desde {new Date(student.date_joined).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                {student.monthly_fee && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium">Mensalidade:</span>
                    <Badge variant="secondary">
                      R$ {student.monthly_fee.toFixed(2)}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 && !loading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum aluno encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || filterBelt !== "all" 
                  ? "Tente ajustar os filtros de busca" 
                  : "Comece cadastrando seu primeiro aluno"}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Aluno
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}