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
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Search, 
  MapPin,
  Users,
  Edit, 
  Trash, 
  Loader2,
  Building2,
  User,
  Clock,
  Calendar,
  CalendarDays
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePolos, CreatePoloData } from "@/hooks/usePolos";
import { useStudents } from "@/hooks/useStudents";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { usePoloSchedules, CreatePoloScheduleData } from "@/hooks/usePoloSchedules";
import { useClasses } from "@/hooks/useClasses";
import { useToast } from "@/hooks/use-toast";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

const diasSemana = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

export default function Polos() {
  const { polos, loading, createPolo, updatePolo, deletePolo, getPoloStudents, enrollStudentInPolo, removeStudentFromPolo } = usePolos();
  const { students } = useStudents();
  const { classes } = useClasses();
  const { schedules, loading: schedulesLoading, createSchedule, updateSchedule, deleteSchedule, generateSessionsFromSchedules, fetchSchedules } = usePoloSchedules();
  const { userType, user } = useSupabaseAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStudentsDialogOpen, setIsStudentsDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isGenerateSessionsDialogOpen, setIsGenerateSessionsDialogOpen] = useState(false);
  const [editingPolo, setEditingPolo] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [poloToDelete, setPoloToDelete] = useState<string | null>(null);
  const [selectedPolo, setSelectedPolo] = useState<string | null>(null);
  const [poloStudents, setPoloStudents] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreatePoloData>({
    name: "",
    address: "",
    responsible_id: null,
    max_capacity: 30,
    color: "#3b82f6"
  });

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState<CreatePoloScheduleData>({
    polo_id: "",
    class_id: "none",
    day_of_week: 1,
    start_time: "18:00",
    end_time: "19:30",
    instructor_id: null,
    description: "",
    max_participants: 30
  });

  // Generate sessions form state
  const [generateForm, setGenerateForm] = useState({
    polo_id: "",
    start_date: "",
    end_date: ""
  });

  // Buscar alunos do polo quando selecionado
  useEffect(() => {
    if (selectedPolo && isStudentsDialogOpen) {
      loadPoloStudents();
    }
  }, [selectedPolo, isStudentsDialogOpen]);

  const loadPoloStudents = async () => {
    if (!selectedPolo) return;
    const students = await getPoloStudents(selectedPolo);
    setPoloStudents(students);
  };

  const handleSavePolo = async () => {
    try {
      setActionLoading(true);
      
      if (editingPolo) {
        await updatePolo(editingPolo, formData);
      } else {
        await createPolo(formData);
      }
      
      setIsDialogOpen(false);
      setEditingPolo(null);
      resetForm();
    } catch (error) {
      console.error('Error saving polo:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePolo = async () => {
    if (!poloToDelete) return;
    
    try {
      setActionLoading(true);
      await deletePolo(poloToDelete);
      setPoloToDelete(null);
    } catch (error) {
      console.error('Error deleting polo:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      responsible_id: null,
      max_capacity: 30,
      color: "#3b82f6"
    });
  };

  const handleEdit = (polo: any) => {
    setEditingPolo(polo.id);
    setFormData({
      name: polo.name,
      address: polo.address,
      responsible_id: polo.responsible_id,
      max_capacity: polo.max_capacity,
      color: polo.color || "#3b82f6"
    });
    setIsDialogOpen(true);
  };

  const handleOpenStudentsDialog = (poloId: string) => {
    setSelectedPolo(poloId);
    setIsStudentsDialogOpen(true);
  };

  const handleToggleStudent = async (studentId: string, isEnrolled: boolean) => {
    if (!selectedPolo) return;
    
    try {
      setActionLoading(true);
      if (isEnrolled) {
        await removeStudentFromPolo(studentId, selectedPolo);
      } else {
        await enrollStudentInPolo(studentId, selectedPolo);
      }
      await loadPoloStudents();
    } catch (error) {
      console.error('Error toggling student:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      setActionLoading(true);
      const scheduleData = {
        ...scheduleForm,
        class_id: scheduleForm.class_id === "none" ? null : scheduleForm.class_id
      };
      
      if (editingSchedule) {
        await updateSchedule(editingSchedule, scheduleData);
      } else {
        await createSchedule(scheduleData);
      }
      
      setIsScheduleDialogOpen(false);
      setEditingSchedule(null);
      resetScheduleForm();
    } catch (error) {
      console.error('Error saving schedule:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSchedule = (schedule: any) => {
    setEditingSchedule(schedule.id);
    setScheduleForm({
      polo_id: schedule.polo_id,
      class_id: schedule.class_id || "none",
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      instructor_id: schedule.instructor_id,
      description: schedule.description || "",
      max_participants: schedule.max_participants || 30
    });
    setIsScheduleDialogOpen(true);
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      polo_id: selectedPolo || "",
      class_id: "none",
      day_of_week: 1,
      start_time: "18:00",
      end_time: "19:30",
      instructor_id: null,
      description: "",
      max_participants: 30
    });
  };

  const handleOpenScheduleDialog = (poloId: string) => {
    setSelectedPolo(poloId);
    setScheduleForm(prev => ({ ...prev, polo_id: poloId }));
    setIsScheduleDialogOpen(true);
  };

  const handleGenerateSessions = async () => {
    if (!generateForm.polo_id || !generateForm.start_date || !generateForm.end_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(true);
      await generateSessionsFromSchedules(
        generateForm.polo_id,
        generateForm.start_date,
        generateForm.end_date
      );
      setIsGenerateSessionsDialogOpen(false);
      setGenerateForm({ polo_id: "", start_date: "", end_date: "" });
    } catch (error) {
      console.error('Error generating sessions:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Carregar horários quando polo selecionado mudar
  useEffect(() => {
    if (selectedPolo) {
      fetchSchedules(selectedPolo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPolo]);

  // Filtrar polos visíveis - mestres veem todos, outros veem apenas os seus
  const visiblePolos = userType === 'mestre' 
    ? polos 
    : polos.filter(polo => polo.responsible_id === user?.id);

  // Pode gerenciar se for mestre ou se for responsável por algum polo
  const canManagePolos = userType === 'mestre' || visiblePolos.length > 0;
  const canCreatePolos = userType === 'mestre'; // Apenas mestres podem criar novos polos

  // Filtrar polos visíveis com busca
  const filteredPolos = visiblePolos.filter(polo => 
    polo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    polo.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!canManagePolos) {
    return (
      <Layout>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Você não tem permissão para gerenciar polos.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Polos</h1>
            <p className="text-muted-foreground">
              Gerencie os polos/dojangs da academia
            </p>
          </div>
          {canCreatePolos && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingPolo(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Polo
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingPolo ? "Editar Polo" : "Novo Polo"}</DialogTitle>
                <DialogDescription>
                  {editingPolo ? "Atualize as informações do polo" : "Preencha os dados para criar um novo polo"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Polo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Polo Centro"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Endereço *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, número, bairro, cidade - CEP"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max_capacity">Capacidade Máxima *</Label>
                  <Input
                    id="max_capacity"
                    type="number"
                    min="1"
                    value={formData.max_capacity}
                    onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) || 30 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Cor de Identificação</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color || "#3b82f6"}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.color || "#3b82f6"}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Escolha uma cor para facilitar a identificação visual deste polo
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingPolo(null);
                  resetForm();
                }}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSavePolo} 
                  disabled={actionLoading || !formData.name || !formData.address}
                  className="bg-gradient-primary"
                >
                  {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingPolo ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Polos Cadastrados</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar polos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : visiblePolos.filter(polo => 
              polo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              polo.address.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum polo cadastrado</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {visiblePolos.filter(polo => 
                  polo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  polo.address.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((polo) => (
                  <Card key={polo.id} className="hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: polo.color || "#3b82f6" }}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: polo.color || "#3b82f6" }}
                            />
                            <CardTitle className="text-lg">{polo.name}</CardTitle>
                          </div>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {polo.address}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(canCreatePolos || polo.responsible_id === user?.id) && (
                              <DropdownMenuItem onClick={() => handleEdit(polo)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleOpenStudentsDialog(polo.id)}>
                              <Users className="mr-2 h-4 w-4" />
                              Gerenciar Alunos
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedPolo(polo.id);
                              fetchSchedules(polo.id);
                            }}>
                              <Clock className="mr-2 h-4 w-4" />
                              Horários Fixos
                            </DropdownMenuItem>
                            {canCreatePolos && (
                              <DropdownMenuItem 
                                onClick={() => setPoloToDelete(polo.id)}
                                className="text-destructive"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Responsável:</span>
                          <span>{polo.responsible_name || "Não definido"}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Capacidade:</span>
                          <Badge variant="outline">
                            {polo.student_count || 0} / {polo.max_capacity}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Gerenciamento de Alunos */}
        <Dialog open={isStudentsDialogOpen} onOpenChange={setIsStudentsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerenciar Alunos do Polo</DialogTitle>
              <DialogDescription>
                Selecione os alunos que pertencem a este polo
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {students.map((student) => {
                const isEnrolled = poloStudents.some(sp => sp.student_id === student.id && sp.active);
                return (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isEnrolled}
                        onCheckedChange={() => handleToggleStudent(student.id, isEnrolled)}
                        disabled={actionLoading}
                      />
                      <div>
                        <p className="font-medium">{student.profile?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.belt_color} - {student.profile?.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant={isEnrolled ? "default" : "outline"}>
                      {isEnrolled ? "Vinculado" : "Não vinculado"}
                    </Badge>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsStudentsDialogOpen(false)}>
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alert Dialog de Exclusão */}
        <AlertDialog open={!!poloToDelete} onOpenChange={(open) => !open && setPoloToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja desativar este polo? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePolo}
                className="bg-destructive text-destructive-foreground"
                disabled={actionLoading}
              >
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de Horários Fixos */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={(open) => {
          setIsScheduleDialogOpen(open);
          if (!open) {
            setEditingSchedule(null);
            resetScheduleForm();
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSchedule ? "Editar Horário Fixo" : "Novo Horário Fixo"}</DialogTitle>
              <DialogDescription>
                Configure um horário fixo semanal para este polo
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="schedule_day">Dia da Semana *</Label>
                <Select
                  value={scheduleForm.day_of_week.toString()}
                  onValueChange={(value) => setScheduleForm({ ...scheduleForm, day_of_week: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {diasSemana.map((dia) => (
                      <SelectItem key={dia.value} value={dia.value.toString()}>
                        {dia.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="schedule_start">Horário Início *</Label>
                  <Input
                    id="schedule_start"
                    type="time"
                    value={scheduleForm.start_time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="schedule_end">Horário Fim *</Label>
                  <Input
                    id="schedule_end"
                    type="time"
                    value={scheduleForm.end_time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="schedule_class">Classe (Opcional)</Label>
                <Select
                  value={scheduleForm.class_id || "none"}
                  onValueChange={(value) => setScheduleForm({ ...scheduleForm, class_id: value === "none" ? "none" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a classe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma (Sessão avulsa)</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="schedule_max">Máx. Participantes</Label>
                <Input
                  id="schedule_max"
                  type="number"
                  min="1"
                  value={scheduleForm.max_participants || 30}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, max_participants: parseInt(e.target.value) || 30 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="schedule_description">Descrição</Label>
                <Textarea
                  id="schedule_description"
                  value={scheduleForm.description || ""}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                  placeholder="Observações sobre o horário..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveSchedule} 
                disabled={actionLoading || !scheduleForm.polo_id}
                className="bg-gradient-primary"
              >
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingSchedule ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Lista de Horários Fixos e Geração de Sessões */}
        {selectedPolo && (
          <Dialog open={!!selectedPolo && !isScheduleDialogOpen && !isStudentsDialogOpen} onOpenChange={(open) => {
            if (!open) setSelectedPolo(null);
          }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Horários Fixos - {polos.find(p => p.id === selectedPolo)?.name}</DialogTitle>
                <DialogDescription>
                  Configure os horários fixos semanais para este polo. Estes horários serão usados para gerar sessões de treino automaticamente. 
                  Você pode criar múltiplos horários para o mesmo dia da semana (ex: manhã e tarde).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Horários Configurados</h3>
                  <Button 
                    size="sm"
                    onClick={() => handleOpenScheduleDialog(selectedPolo!)}
                    className="bg-gradient-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Horário
                  </Button>
                </div>
                {schedulesLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </div>
                ) : schedules.filter(s => s.polo_id === selectedPolo).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum horário fixo configurado
                  </p>
                ) : (
                  <div className="space-y-2">
                    {schedules.filter(s => s.polo_id === selectedPolo).map((schedule) => (
                      <Card key={schedule.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="font-medium">{diasSemana.find(d => d.value === schedule.day_of_week)?.label}</p>
                                <p className="text-sm text-muted-foreground">
                                  {schedule.start_time} - {schedule.end_time}
                                </p>
                                {schedule.class_name && (
                                  <Badge variant="outline" className="mt-1">
                                    {schedule.class_name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSchedule(schedule)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteSchedule(schedule.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Resumo dos Horários Fixos</h3>
                    <div className="grid grid-cols-7 gap-2 text-xs">
                      {diasSemana.map((dia) => {
                        const daySchedules = schedules.filter(s => s.polo_id === selectedPolo && s.day_of_week === dia.value);
                        return (
                          <div key={dia.value} className="border rounded p-2 text-center">
                            <p className="font-medium text-xs">{dia.label.substring(0, 3)}</p>
                            <p className="text-muted-foreground text-xs mt-1">
                              {daySchedules.length > 0 ? (
                                <span className="text-green-600 font-semibold">{daySchedules.length} horário(s)</span>
                              ) : (
                                <span className="text-gray-400">Sem treino</span>
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-4">Gerar Sessões de Treino</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use esta ferramenta para gerar automaticamente todas as sessões de treino baseadas nos horários fixos configurados acima. 
                      As sessões serão criadas apenas para os dias da semana que possuem horários fixos configurados.
                    </p>
                    
                    {/* Botões rápidos */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const today = new Date();
                          const yearStart = new Date(today.getFullYear(), 0, 1);
                          const yearEnd = new Date(today.getFullYear(), 11, 31);
                          setGenerateForm({
                            polo_id: selectedPolo!,
                            start_date: format(yearStart, "yyyy-MM-dd"),
                            end_date: format(yearEnd, "yyyy-MM-dd")
                          });
                        }}
                        disabled={schedules.filter(s => s.polo_id === selectedPolo).length === 0}
                        className="text-xs"
                      >
                        <Calendar className="mr-2 h-3 w-3" />
                        Ano {new Date().getFullYear()}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const today = new Date();
                          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                          setGenerateForm({
                            polo_id: selectedPolo!,
                            start_date: format(monthStart, "yyyy-MM-dd"),
                            end_date: format(monthEnd, "yyyy-MM-dd")
                          });
                        }}
                        disabled={schedules.filter(s => s.polo_id === selectedPolo).length === 0}
                        className="text-xs"
                      >
                        <CalendarDays className="mr-2 h-3 w-3" />
                        Mês Atual
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="grid gap-2">
                        <Label>Data Início *</Label>
                        <Input
                          type="date"
                          value={generateForm.start_date}
                          onChange={(e) => setGenerateForm({ ...generateForm, start_date: e.target.value, polo_id: selectedPolo! })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Data Fim *</Label>
                        <Input
                          type="date"
                          value={generateForm.end_date}
                          onChange={(e) => setGenerateForm({ ...generateForm, end_date: e.target.value, polo_id: selectedPolo! })}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleGenerateSessions}
                      disabled={actionLoading || !generateForm.start_date || !generateForm.end_date || schedules.filter(s => s.polo_id === selectedPolo).length === 0}
                      className="w-full bg-gradient-accent"
                    >
                      {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Gerar Sessões do Período
                    </Button>
                    {schedules.filter(s => s.polo_id === selectedPolo).length === 0 && (
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        Configure pelo menos um horário fixo antes de gerar sessões.
                      </p>
                    )}
                    {generateForm.start_date && generateForm.end_date && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Período selecionado: {format(new Date(generateForm.start_date), "dd/MM/yyyy")} até {format(new Date(generateForm.end_date), "dd/MM/yyyy")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setSelectedPolo(null)}>
                  Fechar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}

