import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, Plus, MapPin, CheckCircle2, XCircle, ClipboardList, Loader2 } from "lucide-react";
import { usePolos } from "@/hooks/usePolos";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";
import { useClasses } from "@/hooks/useClasses";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Agenda() {
  const { polos, loading: polosLoading } = usePolos();
  const { sessions, loading: sessionsLoading, fetchSessions, createSession, getSessionAttendance, markMultipleAttendance } = useTrainingSessions();
  const { classes } = useClasses();
  const { userType, user, loading: authLoading } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [selectedPolo, setSelectedPolo] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [sessionForm, setSessionForm] = useState({
    polo_id: "",
    class_id: "none",
    session_date: format(new Date(), "yyyy-MM-dd"),
    start_time: "18:00",
    end_time: "19:30",
    instructor_id: "",
    description: "",
    max_participants: 30
  });

  // Carregar sessões quando polo ou data mudarem, mas apenas após autenticação
  useEffect(() => {
    if (authLoading || !user) {
      return; // Aguardar autenticação
    }
    
    const poloId = selectedPolo && selectedPolo !== "all" ? selectedPolo : undefined;
    fetchSessions(poloId, selectedDate, selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPolo, selectedDate, user, authLoading]);

  // Carregar frequência quando sessão for selecionada
  useEffect(() => {
    if (selectedSession && isAttendanceDialogOpen) {
      loadAttendance();
    }
  }, [selectedSession, isAttendanceDialogOpen]);

  const loadAttendance = async () => {
    if (!selectedSession) return;
    try {
      setActionLoading(true);
      setAttendanceRecords([]);
      const records = await getSessionAttendance(selectedSession);
      setAttendanceRecords(records);
      if (records.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum aluno encontrado para esta sessão. Verifique se há alunos vinculados ao polo.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar frequência:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de alunos.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      setActionLoading(true);
      await createSession({
        polo_id: sessionForm.polo_id,
        class_id: sessionForm.class_id === "none" ? null : sessionForm.class_id || null,
        session_date: sessionForm.session_date,
        start_time: sessionForm.start_time,
        end_time: sessionForm.end_time,
        instructor_id: sessionForm.instructor_id || null,
        description: sessionForm.description || null,
        max_participants: sessionForm.max_participants || null
      });
      setIsSessionDialogOpen(false);
      resetSessionForm();
      // Recarregar sessões após criar
      const poloId = selectedPolo && selectedPolo !== "all" ? selectedPolo : undefined;
      await fetchSessions(poloId, selectedDate, selectedDate);
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAttendance = (sessionId: string) => {
    setSelectedSession(sessionId);
    setIsAttendanceDialogOpen(true);
  };

  const handleToggleAttendance = (studentId: string) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.student_id === studentId 
          ? { ...record, present: !record.present }
          : record
      )
    );
  };

  const handleUpdateNotes = (studentId: string, notes: string) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.student_id === studentId 
          ? { ...record, notes }
          : record
      )
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedSession) return;
    
    try {
      setActionLoading(true);
      const records = attendanceRecords.map(record => ({
        studentId: record.student_id,
        present: record.present,
        notes: record.notes || undefined
      }));
      
      await markMultipleAttendance(selectedSession, records);
      setIsAttendanceDialogOpen(false);
      setSelectedSession(null);
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const resetSessionForm = () => {
    setSessionForm({
      polo_id: selectedPolo || "",
      class_id: "none",
      session_date: format(new Date(), "yyyy-MM-dd"),
      start_time: "18:00",
      end_time: "19:30",
      instructor_id: "",
      description: "",
      max_participants: 30
    });
  };

  const filteredSessions = sessions.filter(session => {
    if (selectedPolo && selectedPolo !== "all" && session.polo_id !== selectedPolo) return false;
    if (selectedDate && session.session_date !== selectedDate) return false;
    return true;
  });

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEEE", { locale: ptBR });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
            <p className="text-muted-foreground">
              Gerencie treinos e eventos dos polos
            </p>
          </div>
          {(userType === 'mestre' || userType === 'aluno') && (
            <Dialog open={isSessionDialogOpen} onOpenChange={(open) => {
              setIsSessionDialogOpen(open);
              if (!open) resetSessionForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-accent hover:bg-accent shadow-accent">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Sessão
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nova Sessão de Treino</DialogTitle>
                  <DialogDescription>
                    Crie uma nova sessão de treino para um polo
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="polo_id">Polo *</Label>
                    <Select
                      value={sessionForm.polo_id}
                      onValueChange={(value) => setSessionForm({ ...sessionForm, polo_id: value })}
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {sessionForm.polo_id && polos.find(p => p.id === sessionForm.polo_id) && (
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0 border border-gray-300" 
                              style={{ backgroundColor: polos.find(p => p.id === sessionForm.polo_id)?.color || '#3b82f6' }}
                            />
                          )}
                          <SelectValue placeholder="Selecione o polo" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {polos.map((polo) => (
                          <SelectItem key={polo.id} value={polo.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0 border border-gray-300" 
                                style={{ backgroundColor: polo.color || '#3b82f6' }}
                              />
                              <span>{polo.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="class_id">Classe (Opcional)</Label>
                    <Select
                      value={sessionForm.class_id}
                      onValueChange={(value) => setSessionForm({ ...sessionForm, class_id: value })}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="session_date">Data *</Label>
                      <Input
                        id="session_date"
                        type="date"
                        value={sessionForm.session_date}
                        onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="max_participants">Máx. Participantes</Label>
                      <Input
                        id="max_participants"
                        type="number"
                        min="1"
                        value={sessionForm.max_participants}
                        onChange={(e) => setSessionForm({ ...sessionForm, max_participants: parseInt(e.target.value) || 30 })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start_time">Horário Início *</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={sessionForm.start_time}
                        onChange={(e) => setSessionForm({ ...sessionForm, start_time: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end_time">Horário Fim *</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={sessionForm.end_time}
                        onChange={(e) => setSessionForm({ ...sessionForm, end_time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={sessionForm.description}
                      onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                      placeholder="Observações sobre a sessão..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsSessionDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateSession} 
                    disabled={actionLoading || !sessionForm.polo_id || !sessionForm.session_date}
                    className="bg-gradient-accent"
                  >
                    {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Sessão
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filtros</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const poloId = selectedPolo && selectedPolo !== "all" ? selectedPolo : undefined;
                  fetchSessions(poloId, selectedDate, selectedDate);
                }}
                disabled={sessionsLoading}
              >
                {sessionsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Atualizar
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Polo</Label>
                <Select value={selectedPolo} onValueChange={(value) => setSelectedPolo(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os polos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os polos</SelectItem>
                    {polos.map((polo) => (
                      <SelectItem key={polo.id} value={polo.id}>
                        {polo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Sessões */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {authLoading ? (
            <div className="col-span-full text-center py-12">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Carregando...</p>
            </div>
          ) : sessionsLoading ? (
            <div className="col-span-full text-center py-12">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Carregando sessões...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Nenhuma sessão encontrada</p>
              <p className="text-sm text-muted-foreground">
                {selectedPolo === "all" 
                  ? "Não há sessões cadastradas para a data selecionada."
                  : `Não há sessões cadastradas para ${polos.find(p => p.id === selectedPolo)?.name || "este polo"} na data selecionada.`}
              </p>
              {userType === "responsavel" && (
                <p className="text-sm text-muted-foreground mt-2">
                  Quando houver alunos vinculados ao seu perfil e treinos cadastrados nos polos deles, as sessões aparecerão aqui.
                </p>
              )}
              {(userType === 'mestre' || userType === 'aluno') && (
                <p className="text-sm text-muted-foreground mt-2">
                  Use "Nova Sessão" para criar uma sessão avulsa ou configure horários fixos no gerenciamento de Polos.
                </p>
              )}
            </div>
          ) : (
            filteredSessions.map((session) => (
              <Card 
                key={session.id} 
                className="hover:shadow-lg transition-all duration-200 border-l-4" 
                style={{ borderLeftColor: session.polo_color || '#3b82f6' }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: session.polo_color || '#3b82f6' }}
                      />
                      <CardTitle className="text-lg">
                        {session.class_name || "Sessão de Treino"}
                      </CardTitle>
                    </div>
                    <Badge 
                      variant="outline"
                      style={{ 
                        borderColor: session.polo_color || '#3b82f6',
                        color: session.polo_color || '#3b82f6'
                      }}
                    >
                      {session.polo_name}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(session.session_date), "dd/MM/yyyy", { locale: ptBR })} - {getDayName(session.session_date)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-blue-600" />
                      {session.start_time} - {session.end_time}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-green-600" />
                      {session.polo_name}
                    </div>
                    {session.instructor_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-purple-600" />
                        {session.instructor_name}
                      </div>
                    )}
                    {session.description && (
                      <p className="text-sm text-muted-foreground">{session.description}</p>
                    )}
                    {(userType === 'mestre' || userType === 'aluno') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleOpenAttendance(session.id)}
                      >
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Fazer Chamada
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Dialog de Chamada */}
        <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chamada de Frequência</DialogTitle>
              <DialogDescription>
                Marque a presença dos alunos e adicione justificativas quando necessário
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {attendanceRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Carregando lista de alunos...
                </p>
              ) : (
                attendanceRecords.map((record) => (
                  <Card 
                    key={record.student_id} 
                    className={`transition-all ${
                      record.present 
                        ? 'border-green-200 bg-green-50/50' 
                        : 'border-red-200 bg-red-50/50'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={record.present}
                            onCheckedChange={() => handleToggleAttendance(record.student_id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-base">{record.student_name}</p>
                              <Badge variant="outline" className="text-xs">
                                {record.student_belt_color}
                              </Badge>
                            </div>
                            <div className="mt-2">
                              <Label htmlFor={`notes-${record.student_id}`} className="text-xs text-muted-foreground">
                                Justificativa / Observações
                              </Label>
                              <Textarea
                                id={`notes-${record.student_id}`}
                                value={record.notes || ""}
                                onChange={(e) => handleUpdateNotes(record.student_id, e.target.value)}
                                placeholder={record.present ? "Observações (opcional)" : "Justificativa da falta (opcional)"}
                                rows={2}
                                className="mt-1 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {record.present ? (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Presente
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                              <XCircle className="mr-1 h-3 w-3" />
                              Ausente
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAttendanceDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveAttendance}
                disabled={actionLoading}
                className="bg-gradient-accent"
              >
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Frequência
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
