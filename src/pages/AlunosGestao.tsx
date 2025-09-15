import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
  Award,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStudents, CreateStudentData } from "@/hooks/useStudents";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AlunosGestao() {
  const { students, loading, createStudent, updateStudent, deleteStudent } = useStudents();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBelt, setFilterBelt] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateStudentData>({
    full_name: "",
    email: "",
    phone: "",
    birth_date: "",
    street: "",
    street_number: "",
    neighborhood: "",
    postal_code: "",
    city: "",
    state: "",
    address_complement: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    belt_color: "branca",
    belt_degree: 1,
    monthly_fee: 150,
    medical_info: "",
    payment_due_date: 5,
    date_joined: new Date().toISOString().split('T')[0]
  });

  const beltColors = [
    { value: "branca", label: "Branca", color: "bg-gray-100", visualColor: "linear-gradient(90deg, #ffffff 100%)" },
    { value: "branca_ponta_amarela", label: "Branca Ponta Amarela", color: "bg-gradient-to-r from-white to-yellow-400", visualColor: "linear-gradient(90deg, #ffffff 80%, #fbbf24 100%)" },
    { value: "amarela", label: "Amarela", color: "bg-yellow-400", visualColor: "linear-gradient(90deg, #fbbf24 100%)" },
    { value: "amarela_ponta_verde", label: "Amarela Ponta Verde", color: "bg-gradient-to-r from-yellow-400 to-green-500", visualColor: "linear-gradient(90deg, #fbbf24 80%, #10b981 100%)" },
    { value: "verde", label: "Verde", color: "bg-green-500", visualColor: "linear-gradient(90deg, #10b981 100%)" },
    { value: "verde_ponta_azul", label: "Verde Ponta Azul", color: "bg-gradient-to-r from-green-500 to-blue-600", visualColor: "linear-gradient(90deg, #10b981 80%, #2563eb 100%)" },
    { value: "azul", label: "Azul", color: "bg-blue-600", visualColor: "linear-gradient(90deg, #2563eb 100%)" },
    { value: "azul_ponta_vermelha", label: "Azul Ponta Vermelha", color: "bg-gradient-to-r from-blue-600 to-red-600", visualColor: "linear-gradient(90deg, #2563eb 80%, #dc2626 100%)" },
    { value: "vermelha", label: "Vermelha", color: "bg-red-600", visualColor: "linear-gradient(90deg, #dc2626 100%)" },
    { value: "vermelha_ponta_preta", label: "Vermelha Ponta Preta", color: "bg-gradient-to-r from-red-600 to-black", visualColor: "linear-gradient(90deg, #dc2626 80%, #000000 100%)" },
    { value: "prata_ponta_branca", label: "Prata Ponta Branca", color: "bg-gradient-to-r from-gray-400 to-white", visualColor: "linear-gradient(90deg, #9ca3af 80%, #ffffff 100%)" },
    { value: "preta", label: "Preta", color: "bg-black", visualColor: "linear-gradient(90deg, #000000 100%)" }
  ];

  const BeltColorDisplay = ({ belt, size = "default" }: { belt: typeof beltColors[0], size?: "small" | "default" | "large" }) => {
    const sizeClasses = {
      small: "w-6 h-3",
      default: "w-20 h-6", 
      large: "w-32 h-8"
    };
    
    return (
      <div 
        className={`${sizeClasses[size]} rounded-sm border border-gray-300 shadow-sm`}
        style={{ background: belt.visualColor }}
      />
    );
  };

  const handleSaveStudent = async () => {
    try {
      setActionLoading(true);
      
      if (editingStudent) {
        await updateStudent(editingStudent, formData);
      } else {
        await createStudent(formData);
      }
      
      setIsDialogOpen(false);
      setEditingStudent(null);
      resetForm();
    } catch (error) {
      console.error('Error saving student:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    try {
      setActionLoading(true);
      await deleteStudent(studentToDelete);
      setStudentToDelete(null);
    } catch (error) {
      console.error('Error deleting student:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      birth_date: "",
      street: "",
      street_number: "",
      neighborhood: "",
      postal_code: "",
      city: "",
      state: "",
      address_complement: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",
      belt_color: "branca",
      belt_degree: 1,
      monthly_fee: 150,
      medical_info: "",
      payment_due_date: 5,
      date_joined: new Date().toISOString().split('T')[0]
    });
  };

  const openEditDialog = (student: any) => {
    setEditingStudent(student.id);
    // Parse existing address back into components if it exists
    const addressParts = student.profile?.address?.split(', ') || [];
    const emergencyParts = student.profile?.emergency_contact?.split(' | ') || [];
    
    setFormData({
      full_name: student.profile?.full_name || "",
      email: student.profile?.email || "",
      phone: student.profile?.phone || "",
      birth_date: student.profile?.birth_date || "",
      street: addressParts[0]?.split(', ')[0] || "",
      street_number: addressParts[0]?.split(', ')[1] || "",
      neighborhood: addressParts[2] || "",
      postal_code: addressParts[5] || "",
      city: addressParts[3] || "",
      state: addressParts[4] || "",
      address_complement: addressParts[1] || "",
      emergency_contact_name: emergencyParts[0] || "",
      emergency_contact_phone: emergencyParts[1] || "",
      emergency_contact_relationship: emergencyParts[2] || "",
      belt_color: student.belt_color,
      belt_degree: student.belt_degree,
      monthly_fee: student.monthly_fee || 150,
      medical_info: student.medical_info || "",
      payment_due_date: student.payment_due_date || 5,
      date_joined: student.date_joined || new Date().toISOString().split('T')[0]
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
    const matchesSearch = student.profile?.full_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      student.profile?.email
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

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-10 w-full" />
            </CardHeader>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-20 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

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
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                    <Label htmlFor="full_name">Nome Completo *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Nome do aluno"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Endereço Completo</Label>
                  <div className="grid gap-3 p-4 border rounded-lg bg-muted/10">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="street">Nome da Rua *</Label>
                        <Input
                          id="street"
                          value={formData.street || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                          placeholder="Nome completo da rua ou avenida"
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="street_number">Número *</Label>
                        <Input
                          id="street_number"
                          value={formData.street_number || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, street_number: e.target.value }))}
                          placeholder="123"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="neighborhood">Bairro *</Label>
                        <Input
                          id="neighborhood"
                          value={formData.neighborhood || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                          placeholder="Nome do bairro"
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="postal_code">CEP *</Label>
                        <Input
                          id="postal_code"
                          value={formData.postal_code || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                          placeholder="00000-000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade *</Label>
                        <Input
                          id="city"
                          value={formData.city || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Nome da cidade"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado *</Label>
                        <Select 
                          value={formData.state || ""} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AC">AC - Acre</SelectItem>
                            <SelectItem value="AL">AL - Alagoas</SelectItem>
                            <SelectItem value="AP">AP - Amapá</SelectItem>
                            <SelectItem value="AM">AM - Amazonas</SelectItem>
                            <SelectItem value="BA">BA - Bahia</SelectItem>
                            <SelectItem value="CE">CE - Ceará</SelectItem>
                            <SelectItem value="DF">DF - Distrito Federal</SelectItem>
                            <SelectItem value="ES">ES - Espírito Santo</SelectItem>
                            <SelectItem value="GO">GO - Goiás</SelectItem>
                            <SelectItem value="MA">MA - Maranhão</SelectItem>
                            <SelectItem value="MT">MT - Mato Grosso</SelectItem>
                            <SelectItem value="MS">MS - Mato Grosso do Sul</SelectItem>
                            <SelectItem value="MG">MG - Minas Gerais</SelectItem>
                            <SelectItem value="PA">PA - Pará</SelectItem>
                            <SelectItem value="PB">PB - Paraíba</SelectItem>
                            <SelectItem value="PR">PR - Paraná</SelectItem>
                            <SelectItem value="PE">PE - Pernambuco</SelectItem>
                            <SelectItem value="PI">PI - Piauí</SelectItem>
                            <SelectItem value="RJ">RJ - Rio de Janeiro</SelectItem>
                            <SelectItem value="RN">RN - Rio Grande do Norte</SelectItem>
                            <SelectItem value="RS">RS - Rio Grande do Sul</SelectItem>
                            <SelectItem value="RO">RO - Rondônia</SelectItem>
                            <SelectItem value="RR">RR - Roraima</SelectItem>
                            <SelectItem value="SC">SC - Santa Catarina</SelectItem>
                            <SelectItem value="SP">SP - São Paulo</SelectItem>
                            <SelectItem value="SE">SE - Sergipe</SelectItem>
                            <SelectItem value="TO">TO - Tocantins</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address_complement">Complemento</Label>
                      <Input
                        id="address_complement"
                        value={formData.address_complement || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, address_complement: e.target.value }))}
                        placeholder="Apartamento, casa, sala, bloco, etc."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Contato de Emergência</Label>
                  <div className="grid gap-3 p-4 border rounded-lg bg-muted/10">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="emergency_contact_name">Nome Completo *</Label>
                        <Input
                          id="emergency_contact_name"
                          value={formData.emergency_contact_name || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                          placeholder="Nome da pessoa para contato"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergency_contact_phone">Telefone *</Label>
                        <Input
                          id="emergency_contact_phone"
                          value={formData.emergency_contact_phone || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_relationship">Parentesco e informações adicionais</Label>
                      <Textarea
                        id="emergency_contact_relationship"
                        value={formData.emergency_contact_relationship || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_relationship: e.target.value }))}
                        placeholder="Ex: Mãe, telefone alternativo, endereço se diferente..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
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
                            <div className="flex items-center space-x-3">
                              <BeltColorDisplay belt={belt} size="small" />
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
                      onChange={(e) => setFormData(prev => ({ ...prev, belt_degree: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly_fee">Mensalidade (R$)</Label>
                    <Input
                      id="monthly_fee"
                      type="number"
                      step="0.01"
                      value={formData.monthly_fee || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthly_fee: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_due_date">Vencimento</Label>
                    <Input
                      id="payment_due_date"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.payment_due_date || 5}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_due_date: parseInt(e.target.value) || 5 }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medical_info">Informações Médicas</Label>
                  <Textarea
                    id="medical_info"
                    value={formData.medical_info || ""}
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
                <Button onClick={handleSaveStudent} disabled={actionLoading}>
                  {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingStudent ? "Atualizar" : "Cadastrar"}
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
              <div className="text-2xl font-bold">
                {students.filter(s => {
                  const joinDate = new Date(s.date_joined);
                  const now = new Date();
                  return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
                }).length}
              </div>
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
              <CardTitle className="text-sm font-medium">Mensalidade Média</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {students.length > 0 ? (students.reduce((sum, s) => sum + (s.monthly_fee || 0), 0) / students.length).toFixed(0) : 0}
              </div>
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
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum aluno encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {students.length === 0 
                  ? "Cadastre o primeiro aluno para começar" 
                  : "Tente ajustar os filtros de busca"
                }
              </p>
              {students.length === 0 && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Aluno
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                        {student.profile?.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{student.profile?.full_name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <BeltColorDisplay 
                            belt={beltColors.find(b => b.value === student.belt_color) || beltColors[0]} 
                            size="small" 
                          />
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
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => setStudentToDelete(student.id)}
                        >
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
                    <span className="truncate">{student.profile?.email}</span>
                  </div>
                  
                  {student.profile?.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{student.profile.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Idade: {calculateAge(student.profile?.birth_date)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Desde: {new Date(student.date_joined).toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  {student.monthly_fee && (
                    <div className="pt-2">
                      <Badge variant="secondary">
                        R$ {student.monthly_fee.toFixed(2)}/mês
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover Aluno</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover este aluno? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteStudent}
                disabled={actionLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}