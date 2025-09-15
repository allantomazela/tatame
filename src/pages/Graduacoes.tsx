import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2,
  Award,
  Calendar
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGraduations } from "@/hooks/useGraduations";
import { useStudents } from "@/hooks/useStudents";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export default function Graduacoes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFaixa, setFilterFaixa] = useState("todas");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [selectedStudent, setSelectedStudent] = useState("");
  const [beltColor, setBeltColor] = useState("");
  const [beltDegree, setBeltDegree] = useState("1");
  const [graduationDate, setGraduationDate] = useState("");
  const [notes, setNotes] = useState("");

  const { graduations, loading: graduationsLoading, createGraduation, deleteGraduation } = useGraduations();
  const { students, loading: studentsLoading } = useStudents();
  const { profile } = useSupabaseAuth();

  const beltColors = [
    { value: "branca", label: "Branca", color: "bg-gray-100 text-gray-800" },
    { value: "amarela", label: "Amarela", color: "bg-yellow-100 text-yellow-800" },
    { value: "verde", label: "Verde", color: "bg-green-100 text-green-800" },
    { value: "azul", label: "Azul", color: "bg-blue-100 text-blue-800" },
    { value: "vermelha", label: "Vermelha", color: "bg-red-100 text-red-800" },
    { value: "preta", label: "Preta", color: "bg-gray-900 text-white" }
  ];

  const getBeltColor = (belt: string) => {
    const color = beltColors.find(b => b.value === belt.toLowerCase());
    return color?.color || "bg-gray-100 text-gray-800";
  };

  const filteredGraduations = graduations.filter(graduation => {
    const student = graduation.student as any;
    const studentName = student?.profile?.full_name || '';
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaixa = filterFaixa === "todas" || graduation.belt_color.toLowerCase() === filterFaixa;
    return matchesSearch && matchesFaixa;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !beltColor || !graduationDate) {
      return;
    }

    const result = await createGraduation({
      student_id: selectedStudent,
      belt_color: beltColor,
      belt_degree: parseInt(beltDegree),
      graduation_date: graduationDate,
      instructor_id: profile?.id,
      notes
    });

    if (result?.data) {
      setIsDialogOpen(false);
      // Reset form
      setSelectedStudent("");
      setBeltColor("");
      setBeltDegree("1");
      setGraduationDate("");
      setNotes("");
    }
  };

  const handleDelete = async (graduationId: string) => {
    await deleteGraduation(graduationId);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Graduações</h1>
            <p className="text-muted-foreground">
              Gerencie as graduações e progressões dos alunos
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Nova Graduação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nova Graduação</DialogTitle>
                <DialogDescription>
                  Registre uma nova graduação para um aluno
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Aluno</label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o aluno" />
                      </SelectTrigger>
                      <SelectContent>
                        {studentsLoading ? (
                          <SelectItem value="" disabled>Carregando...</SelectItem>
                        ) : (
                          students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {(student.profile as any)?.full_name} - {student.belt_color}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data da Graduação</label>
                    <Input
                      type="date"
                      value={graduationDate}
                      onChange={(e) => setGraduationDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nova Faixa</label>
                    <Select value={beltColor} onValueChange={setBeltColor} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a faixa" />
                      </SelectTrigger>
                      <SelectContent>
                        {beltColors.map((belt) => (
                          <SelectItem key={belt.value} value={belt.value}>
                            {belt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grau</label>
                    <Select value={beltDegree} onValueChange={setBeltDegree}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 9 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}º Grau
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Observações</label>
                  <Input
                    placeholder="Observações sobre a graduação..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-gradient-primary">
                    Registrar Graduação
                  </Button>
                </div>
              </form>
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
                    placeholder="Buscar por aluno..."
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
                    {beltColors.map((belt) => (
                      <SelectItem key={belt.value} value={belt.value}>
                        {belt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Graduações */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {graduationsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : filteredGraduations.length > 0 ? (
            filteredGraduations.map((graduation) => {
              const student = graduation.student as any;
              const instructor = graduation.instructor as any;
              
              return (
                <Card key={graduation.id} className="hover:shadow-accent transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-gradient-accent text-white">
                            {student?.profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {student?.profile?.full_name || 'Nome não disponível'}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {new Date(graduation.graduation_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover Graduação</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover esta graduação? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(graduation.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Faixa:</span>
                      <Badge className={getBeltColor(graduation.belt_color)}>
                        {graduation.belt_color} - {graduation.belt_degree}º Grau
                      </Badge>
                    </div>
                    
                    {instructor && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Instrutor:</span>
                        <span className="font-medium">{instructor.full_name}</span>
                      </div>
                    )}

                    {graduation.notes && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Observações:</span>
                        <p className="mt-1 text-xs bg-muted p-2 rounded">
                          {graduation.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Nenhuma graduação encontrada</p>
                <p className="text-muted-foreground">
                  {searchTerm || filterFaixa !== "todas" 
                    ? "Nenhuma graduação encontrada com os filtros aplicados."
                    : "Registre a primeira graduação dos seus alunos."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}