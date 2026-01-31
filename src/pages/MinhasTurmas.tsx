import { useState } from 'react';
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Plus, Users, Clock, CalendarDays, UserPlus, UserMinus } from "lucide-react";
import { useForm, Controller } from "react-hook-form";

const diasSemana = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

interface NovaClassForm {
  name: string;
  description: string;
  polo_name: string;
  instructor_name: string;
  training_days: number[];
  training_schedule: Record<string, { start_time: string; end_time: string }>;
  max_students: number;
}

export default function MinhasTurmas() {
  const { userType } = useSupabaseAuth();
  const { classes, loading, createClass, fetchClassEnrollments, enrollStudent, removeEnrollment, enrollments } = useClasses();
  const { students } = useStudents();
  const [turmaAtiva, setTurmaAtiva] = useState<string | null>(null);
  const [novaClassDialog, setNovaClassDialog] = useState(false);
  const [matriculaDialog, setMatriculaDialog] = useState(false);

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<NovaClassForm>({
    defaultValues: {
      training_days: [],
      training_schedule: {}
    }
  });

  const selectedDays = watch('training_days') || [];

  // Verificar permissão APÓS todos os hooks
  if (userType !== 'mestre') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Acesso restrito a mestres.</p>
        </div>
      </Layout>
    );
  }

  const onSubmitNovaClass = async (data: NovaClassForm) => {
    try {
      // Para compatibilidade com o campo day_of_week existente, usar o primeiro dia selecionado
      const firstDay = data.training_days.length > 0 ? data.training_days[0] : 1;
      
      // Para compatibilidade com start_time e end_time, usar o horário do primeiro dia
      const firstDaySchedule = data.training_schedule[firstDay.toString()];
      const start_time = firstDaySchedule?.start_time || "08:00";
      const end_time = firstDaySchedule?.end_time || "09:00";

      await createClass({
        name: data.name,
        description: data.description,
        polo_name: data.polo_name,
        instructor_name: data.instructor_name,
        training_days: data.training_days,
        training_schedule: data.training_schedule,
        max_students: data.max_students,
        day_of_week: firstDay,
        start_time,
        end_time,
        active: true
      });
      setNovaClassDialog(false);
      reset();
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const carregarTurma = async (classId: string) => {
    setTurmaAtiva(classId);
    await fetchClassEnrollments(classId);
  };

  const alunosDisponiveis = students.filter(student => 
    !enrollments.some(enrollment => enrollment.student_id === student.id)
  );

  const getBeltColor = (color: string) => {
    const colors: { [key: string]: string } = {
      'branca': 'bg-white text-black border dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
      'amarela': 'bg-yellow-400 dark:bg-yellow-600',
      'laranja': 'bg-orange-400 dark:bg-orange-600',
      'verde': 'bg-green-400 dark:bg-green-600',
      'azul': 'bg-blue-400 dark:bg-blue-600',
      'marrom': 'bg-amber-700 dark:bg-amber-800',
      'preta': 'bg-black text-white'
    };
    return colors[color] || 'bg-gray-400';
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Remove segundos
  };

  const getDayLabel = (day: number) => {
    return diasSemana.find(d => d.value === day)?.label || 'Desconhecido';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Minhas Turmas</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas turmas e alunos matriculados
            </p>
          </div>
          
          <Dialog open={novaClassDialog} onOpenChange={setNovaClassDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Turma
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit(onSubmitNovaClass)}>
                <DialogHeader>
                  <DialogTitle>Criar Nova Turma</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova turma ao seu cronograma
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Turma</Label>
                    <Input 
                      id="name" 
                      {...register("name", { required: "Nome é obrigatório" })}
                      placeholder="Ex: Turma Iniciante" 
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea 
                      id="description" 
                      {...register("description")}
                      placeholder="Descrição da turma..." 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="polo_name">Nome do Polo</Label>
                      <Input 
                        id="polo_name" 
                        {...register("polo_name", { required: "Nome do polo é obrigatório" })}
                        placeholder="Ex: Polo Centro" 
                      />
                      {errors.polo_name && <p className="text-sm text-red-500">{errors.polo_name.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="instructor_name">Nome do Professor</Label>
                      <Input 
                        id="instructor_name" 
                        {...register("instructor_name", { required: "Nome do professor é obrigatório" })}
                        placeholder="Ex: Mestre João" 
                      />
                      {errors.instructor_name && <p className="text-sm text-red-500">{errors.instructor_name.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Dias de Treinos da Semana</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {diasSemana.map(dia => (
                        <Controller
                          key={dia.value}
                          name="training_days"
                          control={control}
                          rules={{ 
                            validate: value => value && value.length > 0 || "Selecione pelo menos um dia"
                          }}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`day-${dia.value}`}
                                checked={field.value?.includes(dia.value) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, dia.value]);
                                  } else {
                                    field.onChange(current.filter(d => d !== dia.value));
                                  }
                                }}
                              />
                              <Label htmlFor={`day-${dia.value}`} className="text-sm">
                                {dia.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                    </div>
                    {errors.training_days && <p className="text-sm text-red-500">{errors.training_days.message}</p>}
                  </div>

                  {selectedDays.length > 0 && (
                    <div className="space-y-3">
                      <Label>Horários dos Treinos</Label>
                      <div className="space-y-3">
                        {selectedDays.map(dayValue => {
                          const dayLabel = diasSemana.find(d => d.value === dayValue)?.label;
                          return (
                            <div key={dayValue} className="border rounded-lg p-3 space-y-2">
                              <h4 className="font-medium text-sm">{dayLabel}</h4>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">Início</Label>
                                  <Input 
                                    type="time" 
                                    placeholder="08:00"
                                    onChange={(e) => {
                                      const current = watch('training_schedule') || {};
                                      setValue('training_schedule', {
                                        ...current,
                                        [dayValue]: {
                                          ...current[dayValue],
                                          start_time: e.target.value
                                        }
                                      });
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Fim</Label>
                                  <Input 
                                    type="time" 
                                    placeholder="09:00"
                                    onChange={(e) => {
                                      const current = watch('training_schedule') || {};
                                      setValue('training_schedule', {
                                        ...current,
                                        [dayValue]: {
                                          ...current[dayValue],
                                          end_time: e.target.value
                                        }
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="max_students">Máximo de Alunos</Label>
                    <Input 
                      id="max_students" 
                      type="number" 
                      {...register("max_students", { valueAsNumber: true })}
                      placeholder="20" 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Criar Turma</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={turmaAtiva || "overview"} onValueChange={setTurmaAtiva}>
          <TabsList className="grid grid-cols-1 md:grid-cols-4 w-full h-auto gap-2">
            <TabsTrigger value="overview" className="flex flex-col h-16">
              <span className="font-medium">Visão Geral</span>
              <span className="text-xs text-muted-foreground">{classes.length} turmas</span>
            </TabsTrigger>
            {classes.map(turma => (
              <TabsTrigger 
                key={turma.id} 
                value={turma.id}
                className="flex flex-col h-16"
                onClick={() => carregarTurma(turma.id)}
              >
                <span className="font-medium">{turma.name}</span>
                <span className="text-xs text-muted-foreground">
                  {getDayLabel(turma.day_of_week)} {formatTime(turma.start_time)}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <p>Carregando turmas...</p>
              ) : classes.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center h-48">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      Você ainda não tem turmas criadas
                    </p>
                  </CardContent>
                </Card>
              ) : (
                classes.map(turma => (
                  <Card key={turma.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{turma.name}</CardTitle>
                        <Badge variant="outline">{turma.enrolled_count || 0} alunos</Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {turma.description || 'Sem descrição'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {turma.polo_name && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span className="h-4 w-4 mr-2">🏢</span>
                            {turma.polo_name}
                          </div>
                        )}
                        {turma.instructor_name && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span className="h-4 w-4 mr-2">👨‍🏫</span>
                            {turma.instructor_name}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4 mr-2" />
                          {turma.training_days && turma.training_days.length > 0 
                            ? turma.training_days.map(day => getDayLabel(day)).join(', ')
                            : getDayLabel(turma.day_of_week)
                          }
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          {turma.training_schedule && Object.keys(turma.training_schedule).length > 0
                            ? Object.entries(turma.training_schedule).map(([day, schedule]) => 
                                `${getDayLabel(parseInt(day))}: ${schedule.start_time}-${schedule.end_time}`
                              ).join(' | ')
                            : `${formatTime(turma.start_time)} - ${formatTime(turma.end_time)}`
                          }
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-4 w-4 mr-2" />
                          Máx. {turma.max_students || 20} alunos
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {classes.map(turma => (
            <TabsContent key={turma.id} value={turma.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{turma.name}</CardTitle>
                      <CardDescription className="space-y-1">
                        {turma.polo_name && <div>📍 {turma.polo_name}</div>}
                        {turma.instructor_name && <div>👨‍🏫 {turma.instructor_name}</div>}
                        <div>
                          📅 {turma.training_days && turma.training_days.length > 0 
                            ? turma.training_days.map(day => getDayLabel(day)).join(', ')
                            : getDayLabel(turma.day_of_week)
                          }
                        </div>
                        <div>
                          🕐 {turma.training_schedule && Object.keys(turma.training_schedule).length > 0
                            ? Object.entries(turma.training_schedule).map(([day, schedule]) => 
                                `${getDayLabel(parseInt(day))}: ${schedule.start_time}-${schedule.end_time}`
                              ).join(' | ')
                            : `${formatTime(turma.start_time)} - ${formatTime(turma.end_time)}`
                          }
                        </div>
                      </CardDescription>
                    </div>
                    <Dialog open={matriculaDialog} onOpenChange={setMatriculaDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Matricular Aluno
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Matricular Aluno</DialogTitle>
                          <DialogDescription>
                            Selecione um aluno para matricular em {turma.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {alunosDisponiveis.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                              Todos os alunos já estão matriculados nesta turma
                            </p>
                          ) : (
                            alunosDisponiveis.map(student => (
                              <div
                                key={student.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                                onClick={() => {
                                  enrollStudent(student.id, turma.id);
                                  setMatriculaDialog(false);
                                }}
                              >
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={student.profile?.avatar_url || ""} />
                                    <AvatarFallback>
                                      {student.profile?.full_name?.split(' ').map(n => n[0]).join('') || '??'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{student.profile?.full_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Faixa {student.belt_color}
                                    </p>
                                  </div>
                                </div>
                                <Badge className={getBeltColor(student.belt_color)}>
                                  {student.belt_color}
                                </Badge>
                              </div>
                            ))
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="font-medium">Alunos Matriculados ({enrollments.length})</h4>
                    {enrollments.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum aluno matriculado ainda
                      </p>
                    ) : (
                      <div className="grid gap-3">
                        {enrollments.map(enrollment => (
                          <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {enrollment.student_name?.split(' ').map(n => n[0]).join('') || '??'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{enrollment.student_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Matriculado em {new Date(enrollment.enrolled_at).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getBeltColor(enrollment.student_belt_color || 'branca')}>
                                {enrollment.student_belt_color}
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => removeEnrollment(enrollment.id, turma.id)}
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
}