import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Area,
  AreaChart,
  ComposedChart
} from "recharts";
import { 
  TrendingUp, 
  Award, 
  Target,
  Calendar,
  Users,
  Activity,
  Plus,
  Edit,
  Trophy,
  Brain,
  Zap,
  Shield,
  User,
  BookOpen,
  Swords,
  Heart,
  Star,
  TrendingDown,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { useStudentEvolution } from "@/hooks/useStudentEvolution";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

const categoryIcons = {
  technique: BookOpen,
  physical: Zap,
  mental: Brain,
  competition: Trophy
};

const categoryColors = {
  technique: "hsl(var(--primary))",
  physical: "hsl(var(--secondary))",
  mental: "hsl(var(--accent))",
  competition: "hsl(var(--warning))"
};

// Poomsae por faixa
const poomsaeByBelt = {
  'branca': ['Taegeuk Il Jang'],
  'amarela': ['Taegeuk Il Jang', 'Taegeuk I Jang'],
  'laranja': ['Taegeuk I Jang', 'Taegeuk Sam Jang'],
  'verde': ['Taegeuk Sam Jang', 'Taegeuk Sa Jang'],
  'azul': ['Taegeuk Sa Jang', 'Taegeuk Oh Jang'],
  'vermelha': ['Taegeuk Oh Jang', 'Taegeuk Yuk Jang'],
  'preta': ['Taegeuk Yuk Jang', 'Taegeuk Chil Jang', 'Taegeuk Pal Jang', 'Koryo', 'Keumgang', 'Taebaek']
};

// Movimentos básicos por categoria
const movementsByCategory = {
  'Técnicas Básicas': ['Ap Chagi (Chute Frontal)', 'Dollyo Chagi (Chute Circular)', 'Yop Chagi (Chute Lateral)', 'Dwi Chagi (Chute de Costas)', 'Naeryo Chagi (Chute Descendente)'],
  'Defesas': ['Arae Makki (Defesa Baixa)', 'Momtong Makki (Defesa Média)', 'Olgul Makki (Defesa Alta)', 'Sonnal Makki (Defesa com Lado da Mão)'],
  'Socos': ['Jireugi (Soco Direto)', 'Sewo Jireugi (Soco Vertical)', 'Yeop Jireugi (Soco Lateral)'],
  'Posições': ['Chunbi Seogi (Posição de Preparação)', 'Ap Seogi (Posição Frontal)', 'Dwi Seogi (Posição de Costas)', 'Juchum Seogi (Posição de Cavaleiro)']
};

export default function Evolucao() {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isAchievementDialogOpen, setIsAchievementDialogOpen] = useState(false);
  const [isCompetitionDialogOpen, setIsCompetitionDialogOpen] = useState(false);
  const [isPoomsaeDialogOpen, setIsPoomsaeDialogOpen] = useState(false);
  
  // Form states
  const [evaluationForm, setEvaluationForm] = useState<any>({});
  const [goalForm, setGoalForm] = useState<any>({});
  const [achievementForm, setAchievementForm] = useState<any>({});
  const [competitionForm, setCompetitionForm] = useState<any>({});
  const [poomsaeForm, setPoomsaeForm] = useState<any>({
    movements: {}
  });

  const { students, loading: studentsLoading } = useStudents();
  const { profile } = useSupabaseAuth();
  const {
    evaluations,
    goals,
    achievements,
    competitions,
    loading: evolutionLoading,
    createEvaluation,
    createGoal,
    updateGoalProgress,
    createAchievement,
    createCompetition
  } = useStudentEvolution(selectedStudentId);

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const currentPoomsae = selectedStudent ? poomsaeByBelt[selectedStudent.belt_color as keyof typeof poomsaeByBelt] || [] : [];

  // Calcular dados para gráficos
  const evolutionChartData = useMemo(() => {
    if (!evaluations.length) return [];
    
    return evaluations
      .slice(0, 12) // últimas 12 avaliações
      .reverse()
      .map(evaluation => ({
        date: new Date(evaluation.evaluation_date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        tecnicas: ((evaluation.poomsae_score || 0) + (evaluation.kicks_score || 0) + (evaluation.punches_score || 0) + (evaluation.blocks_score || 0)) / 4,
        combate: ((evaluation.sparring_technique || 0) + (evaluation.sparring_strategy || 0) + (evaluation.sparring_defense || 0)) / 3,
        fisico: ((evaluation.balance_score || 0) + (evaluation.flexibility_score || 0) + (evaluation.strength_score || 0) + (evaluation.speed_score || 0)) / 4,
        mental: ((evaluation.discipline_score || 0) + (evaluation.respect_score || 0) + (evaluation.focus_score || 0) + (evaluation.self_confidence || 0)) / 4
      }));
  }, [evaluations]);

  // Dados específicos para Poomsae
  const poomsaeProgressData = useMemo(() => {
    if (!evaluations.length) return [];
    
    return evaluations
      .slice(0, 8)
      .reverse()
      .map(evaluation => ({
        date: new Date(evaluation.evaluation_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        poomsae: evaluation.poomsae_score || 0,
        precisao: evaluation.precision_score || 0,
        posicoes: evaluation.stances_score || 0
      }));
  }, [evaluations]);

  // Dados específicos para Combate
  const combatProgressData = useMemo(() => {
    if (!evaluations.length) return [];
    
    return evaluations
      .slice(0, 8)
      .reverse()
      .map(evaluation => ({
        date: new Date(evaluation.evaluation_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        tecnica: evaluation.sparring_technique || 0,
        estrategia: evaluation.sparring_strategy || 0,
        defesa: evaluation.sparring_defense || 0,
        controle: evaluation.sparring_control || 0
      }));
  }, [evaluations]);

  const latestEvaluation = evaluations[0];
  const radarData = useMemo(() => {
    if (!latestEvaluation) return [];
    
    return [
      { categoria: 'Poomsae', valor: latestEvaluation.poomsae_score || 0 },
      { categoria: 'Chutes', valor: latestEvaluation.kicks_score || 0 },
      { categoria: 'Socos', valor: latestEvaluation.punches_score || 0 },
      { categoria: 'Defesas', valor: latestEvaluation.blocks_score || 0 },
      { categoria: 'Equilíbrio', valor: latestEvaluation.balance_score || 0 },
      { categoria: 'Flexibilidade', valor: latestEvaluation.flexibility_score || 0 },
      { categoria: 'Força', valor: latestEvaluation.strength_score || 0 },
      { categoria: 'Disciplina', valor: latestEvaluation.discipline_score || 0 }
    ];
  }, [latestEvaluation]);

  const handleCreateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    const result = await createEvaluation({
      student_id: selectedStudentId,
      instructor_id: profile?.id,
      ...evaluationForm
    });

    if (result?.data) {
      setIsEvaluationDialogOpen(false);
      setEvaluationForm({});
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !goalForm.title) return;

    const result = await createGoal({
      student_id: selectedStudentId,
      instructor_id: profile?.id,
      ...goalForm
    });

    if (result?.data) {
      setIsGoalDialogOpen(false);
      setGoalForm({});
    }
  };

  const handleCreateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !achievementForm.title) return;

    const result = await createAchievement({
      student_id: selectedStudentId,
      ...achievementForm
    });

    if (result?.data) {
      setIsAchievementDialogOpen(false);
      setAchievementForm({});
    }
  };

  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !competitionForm.competition_name) return;

    const result = await createCompetition({
      student_id: selectedStudentId,
      ...competitionForm
    });

    if (result?.data) {
      setIsCompetitionDialogOpen(false);
      setCompetitionForm({});
    }
  };

  const getAverageScore = (category: 'technical' | 'combat' | 'physical' | 'mental') => {
    if (!latestEvaluation) return 0;
    
    switch (category) {
      case 'technical':
        return ((latestEvaluation.poomsae_score || 0) + (latestEvaluation.kicks_score || 0) + 
                (latestEvaluation.punches_score || 0) + (latestEvaluation.blocks_score || 0)) / 4;
      case 'combat':
        return ((latestEvaluation.sparring_technique || 0) + (latestEvaluation.sparring_strategy || 0) + 
                (latestEvaluation.sparring_defense || 0) + (latestEvaluation.sparring_control || 0)) / 4;
      case 'physical':
        return ((latestEvaluation.balance_score || 0) + (latestEvaluation.flexibility_score || 0) + 
                (latestEvaluation.strength_score || 0) + (latestEvaluation.speed_score || 0)) / 4;
      case 'mental':
        return ((latestEvaluation.discipline_score || 0) + (latestEvaluation.respect_score || 0) + 
                (latestEvaluation.focus_score || 0) + (latestEvaluation.self_confidence || 0)) / 4;
      default:
        return 0;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Evolução do Aluno</h1>
            <p className="text-muted-foreground">
              Acompanhe o progresso técnico e desenvolvimento dos alunos
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecione um aluno" />
              </SelectTrigger>
              <SelectContent>
                {studentsLoading ? (
                  <SelectItem value="loading" disabled>Carregando...</SelectItem>
                ) : (
                  students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {(student.profile as any)?.full_name} - {student.belt_color}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedStudentId && (
              <div className="flex space-x-2">
                <Dialog open={isEvaluationDialogOpen} onOpenChange={setIsEvaluationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-primary">
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Avaliação
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Nova Avaliação - {selectedStudent?.profile?.full_name}</DialogTitle>
                      <DialogDescription>
                        Registre uma avaliação detalhada do desenvolvimento do aluno
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateEvaluation} className="space-y-6">
                      <Tabs defaultValue="technical" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="technical">Técnicas</TabsTrigger>
                          <TabsTrigger value="combat">Combate</TabsTrigger>
                          <TabsTrigger value="physical">Físico</TabsTrigger>
                          <TabsTrigger value="mental">Mental</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="technical" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { key: 'poomsae_score', label: 'Poomsae' },
                              { key: 'kicks_score', label: 'Chutes' },
                              { key: 'punches_score', label: 'Socos' },
                              { key: 'blocks_score', label: 'Defesas' },
                              { key: 'stances_score', label: 'Posições' },
                              { key: 'precision_score', label: 'Precisão' }
                            ].map(field => (
                              <div key={field.key} className="space-y-2">
                                <Label>{field.label} (0-10)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={evaluationForm[field.key] || ''}
                                  onChange={(e) => setEvaluationForm(prev => ({
                                    ...prev,
                                    [field.key]: parseFloat(e.target.value) || 0
                                  }))}
                                />
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="combat" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { key: 'sparring_technique', label: 'Técnica no Combate' },
                              { key: 'sparring_strategy', label: 'Estratégia' },
                              { key: 'sparring_defense', label: 'Defesa' },
                              { key: 'sparring_control', label: 'Controle' },
                              { key: 'sparring_attitude', label: 'Atitude' }
                            ].map(field => (
                              <div key={field.key} className="space-y-2">
                                <Label>{field.label} (0-10)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={evaluationForm[field.key] || ''}
                                  onChange={(e) => setEvaluationForm(prev => ({
                                    ...prev,
                                    [field.key]: parseFloat(e.target.value) || 0
                                  }))}
                                />
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="physical" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { key: 'balance_score', label: 'Equilíbrio' },
                              { key: 'flexibility_score', label: 'Flexibilidade' },
                              { key: 'strength_score', label: 'Força' },
                              { key: 'speed_score', label: 'Velocidade' }
                            ].map(field => (
                              <div key={field.key} className="space-y-2">
                                <Label>{field.label} (0-10)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={evaluationForm[field.key] || ''}
                                  onChange={(e) => setEvaluationForm(prev => ({
                                    ...prev,
                                    [field.key]: parseFloat(e.target.value) || 0
                                  }))}
                                />
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="mental" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { key: 'discipline_score', label: 'Disciplina' },
                              { key: 'respect_score', label: 'Respeito' },
                              { key: 'focus_score', label: 'Foco' },
                              { key: 'improvement_attitude', label: 'Atitude de Melhoria' },
                              { key: 'self_confidence', label: 'Autoconfiança' }
                            ].map(field => (
                              <div key={field.key} className="space-y-2">
                                <Label>{field.label} (0-10)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={evaluationForm[field.key] || ''}
                                  onChange={(e) => setEvaluationForm(prev => ({
                                    ...prev,
                                    [field.key]: parseFloat(e.target.value) || 0
                                  }))}
                                />
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Observações Gerais</Label>
                          <Textarea
                            placeholder="Observações sobre o desempenho geral do aluno..."
                            value={evaluationForm.observations || ''}
                            onChange={(e) => setEvaluationForm(prev => ({
                              ...prev,
                              observations: e.target.value
                            }))}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Pontos Fortes</Label>
                            <Textarea
                              placeholder="Principais pontos fortes do aluno..."
                              value={evaluationForm.strengths || ''}
                              onChange={(e) => setEvaluationForm(prev => ({
                                ...prev,
                                strengths: e.target.value
                              }))}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Áreas para Melhoria</Label>
                            <Textarea
                              placeholder="Áreas que precisam de mais atenção..."
                              value={evaluationForm.areas_for_improvement || ''}
                              onChange={(e) => setEvaluationForm(prev => ({
                                ...prev,
                                areas_for_improvement: e.target.value
                              }))}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Metas de Curto Prazo</Label>
                            <Textarea
                              placeholder="Objetivos para as próximas semanas..."
                              value={evaluationForm.short_term_goals || ''}
                              onChange={(e) => setEvaluationForm(prev => ({
                                ...prev,
                                short_term_goals: e.target.value
                              }))}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Metas de Longo Prazo</Label>
                            <Textarea
                              placeholder="Objetivos para os próximos meses..."
                              value={evaluationForm.long_term_goals || ''}
                              onChange={(e) => setEvaluationForm(prev => ({
                                ...prev,
                                long_term_goals: e.target.value
                              }))}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Data da Avaliação</Label>
                          <Input
                            type="date"
                            value={evaluationForm.evaluation_date || new Date().toISOString().split('T')[0]}
                            onChange={(e) => setEvaluationForm(prev => ({
                              ...prev,
                              evaluation_date: e.target.value
                            }))}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsEvaluationDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" className="bg-gradient-primary">
                          Salvar Avaliação
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" onClick={() => setIsGoalDialogOpen(true)}>
                  <Target className="mr-2 h-4 w-4" />
                  Nova Meta
                </Button>
              </div>
            )}
          </div>
        </div>

        {!selectedStudentId ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Selecione um Aluno</h3>
              <p className="text-muted-foreground">
                Selecione um aluno acima para visualizar sua evolução e desenvolvimento
              </p>
            </CardContent>
          </Card>
        ) : evolutionLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-8 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Métricas Principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Média Técnica</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">
                    {getAverageScore('technical').toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {latestEvaluation ? 'Última avaliação' : 'Sem avaliações'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Combate</CardTitle>
                  <Swords className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {getAverageScore('combat').toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Habilidades de luta
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Condição Física</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {getAverageScore('physical').toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Força, velocidade, flexibilidade
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disciplina Mental</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {getAverageScore('mental').toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Foco, disciplina, confiança
                  </p>
                </CardContent>
              </Card>
            </div>

            {evolutionChartData.length > 0 && (
              <>
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Evolução por Categoria */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Evolução por Categoria</CardTitle>
                      <CardDescription>
                        Progresso nas diferentes áreas ao longo do tempo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={evolutionChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 10]} />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="tecnicas" 
                            stackId="1"
                            stroke="hsl(var(--primary))" 
                            fill="hsl(var(--primary))"
                            fillOpacity={0.3}
                            name="Técnicas"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="combate" 
                            stackId="2"
                            stroke="hsl(var(--secondary))" 
                            fill="hsl(var(--secondary))"
                            fillOpacity={0.3}
                            name="Combate"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="fisico" 
                            stackId="3"
                            stroke="hsl(var(--accent))" 
                            fill="hsl(var(--accent))"
                            fillOpacity={0.3}
                            name="Físico"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="mental" 
                            stackId="4"
                            stroke="hsl(var(--warning))" 
                            fill="hsl(var(--warning))"
                            fillOpacity={0.3}
                            name="Mental"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Radar de Habilidades */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Perfil Atual de Habilidades</CardTitle>
                      <CardDescription>
                        Avaliação detalhada por área técnica
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="categoria" />
                          <PolarRadiusAxis domain={[0, 10]} />
                          <Radar
                            name="Habilidades"
                            dataKey="valor"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Seção Específica de Poomsae */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <BookOpen className="h-5 w-5 mr-2" />
                          Evolução em Poomsae
                        </CardTitle>
                        <CardDescription>
                          Progressão específica em Poomsae e precisão
                        </CardDescription>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setIsPoomsaeDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Avaliar Movimentos
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={poomsaeProgressData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 10]} />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="poomsae"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.3}
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            name="Poomsae Geral"
                          />
                          <Line
                            type="monotone"
                            dataKey="precisao"
                            stroke="hsl(var(--secondary))"
                            strokeWidth={2}
                            name="Precisão"
                            dot={{ fill: "hsl(var(--secondary))" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="posicoes"
                            stroke="hsl(var(--accent))"
                            strokeWidth={2}
                            name="Posições"
                            dot={{ fill: "hsl(var(--accent))" }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Swords className="h-5 w-5 mr-2" />
                        Evolução em Combate
                      </CardTitle>
                      <CardDescription>
                        Progressão específica em técnicas de combate
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={combatProgressData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 10]} />
                          <Tooltip />
                          <Bar dataKey="tecnica" fill="hsl(var(--primary))" name="Técnica" />
                          <Bar dataKey="estrategia" fill="hsl(var(--secondary))" name="Estratégia" />
                          <Bar dataKey="defesa" fill="hsl(var(--accent))" name="Defesa" />
                          <Bar dataKey="controle" fill="hsl(var(--warning))" name="Controle" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Poomsae da Faixa Atual */}
                <Card>
                  <CardHeader>
                    <CardTitle>Poomsae da Faixa {selectedStudent?.belt_color}</CardTitle>
                    <CardDescription>
                      Movimentos e técnicas específicas para a faixa atual
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentPoomsae.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {currentPoomsae.map((poomsae, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">{poomsae}</h4>
                            <div className="space-y-2">
                              {Object.entries(movementsByCategory).map(([category, movements]) => (
                                <div key={category}>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">{category}:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {movements.slice(0, 3).map((movement, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {movement}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        Nenhum Poomsae específico encontrado para esta faixa.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Indicadores de Progresso */}
                <div className="grid gap-6 md:grid-cols-4">
                  {[
                    { label: 'Técnicas', value: getAverageScore('technical'), icon: BookOpen },
                    { label: 'Combate', value: getAverageScore('combat'), icon: Swords },
                    { label: 'Físico', value: getAverageScore('physical'), icon: Zap },
                    { label: 'Mental', value: getAverageScore('mental'), icon: Brain }
                  ].map(({ label, value, icon: Icon }) => (
                    <Card key={label}>
                      <CardContent className="flex items-center p-6">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{label}</p>
                            <p className="text-2xl font-bold">{value.toFixed(1)}</p>
                            <div className="flex items-center mt-1">
                              {value >= 8 ? (
                                <ArrowUp className="h-4 w-4 text-green-500" />
                              ) : value >= 6 ? (
                                <Minus className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <ArrowDown className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-xs text-muted-foreground ml-1">
                                {value >= 8 ? 'Excelente' : value >= 6 ? 'Bom' : 'Precisa melhorar'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Metas Ativas */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Metas Ativas</CardTitle>
                    <CardDescription>
                      Objetivos em andamento
                    </CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsGoalDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Meta
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goals.filter(g => !g.completed).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhuma meta ativa. Crie uma nova meta para acompanhar o progresso.
                    </p>
                  ) : (
                    goals.filter(g => !g.completed).map((goal) => {
                      const Icon = categoryIcons[goal.category as keyof typeof categoryIcons];
                      return (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <Icon className="h-4 w-4" style={{ color: categoryColors[goal.category as keyof typeof categoryColors] }} />
                              <span className="text-sm font-medium">{goal.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{goal.current_progress}%</span>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => updateGoalProgress(goal.id, Math.min(100, goal.current_progress + 10))}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <Progress value={goal.current_progress} className="h-2" />
                          {goal.description && (
                            <p className="text-xs text-muted-foreground">{goal.description}</p>
                          )}
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              {/* Conquistas Recentes */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Conquistas Recentes</CardTitle>
                    <CardDescription>
                      Últimas conquistas e marcos
                    </CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsAchievementDialogOpen(true)}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Nova Conquista
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements.slice(0, 5).map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          <Award className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{achievement.title}</p>
                          {achievement.description && (
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(achievement.achievement_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        {achievement.points && achievement.points > 0 && (
                          <Badge variant="secondary">
                            {achievement.points} pts
                          </Badge>
                        )}
                      </div>
                    ))}
                    
                    {achievements.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        Nenhuma conquista registrada ainda.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Competições */}
            {competitions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Competições</CardTitle>
                  <CardDescription>
                    Participações e resultados em competições
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {competitions.map((competition) => (
                      <div key={competition.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{competition.competition_name}</h4>
                          {competition.position && (
                            <Badge 
                              variant={competition.position <= 3 ? "default" : "secondary"}
                              className={
                                competition.position === 1 ? "bg-yellow-500" :
                                competition.position === 2 ? "bg-gray-400" :
                                competition.position === 3 ? "bg-amber-600" : ""
                              }
                            >
                              {competition.position}º lugar
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {competition.category} - {competition.division}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(competition.competition_date).toLocaleDateString('pt-BR')}
                        </p>
                        {competition.total_participants && (
                          <p className="text-xs text-muted-foreground">
                            {competition.total_participants} participantes
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Última Avaliação Detalhada */}
            {latestEvaluation && (
              <Card>
                <CardHeader>
                  <CardTitle>Última Avaliação Detalhada</CardTitle>
                  <CardDescription>
                    Avaliação de {new Date(latestEvaluation.evaluation_date).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {latestEvaluation.observations && (
                    <div>
                      <h4 className="font-medium mb-2">Observações Gerais</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {latestEvaluation.observations}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {latestEvaluation.strengths && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                          Pontos Fortes
                        </h4>
                        <p className="text-sm text-muted-foreground bg-green-50 p-3 rounded">
                          {latestEvaluation.strengths}
                        </p>
                      </div>
                    )}
                    
                    {latestEvaluation.areas_for_improvement && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <TrendingDown className="h-4 w-4 mr-2 text-amber-500" />
                          Áreas para Melhoria
                        </h4>
                        <p className="text-sm text-muted-foreground bg-amber-50 p-3 rounded">
                          {latestEvaluation.areas_for_improvement}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {latestEvaluation.short_term_goals && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <Target className="h-4 w-4 mr-2 text-blue-500" />
                          Metas de Curto Prazo
                        </h4>
                        <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                          {latestEvaluation.short_term_goals}
                        </p>
                      </div>
                    )}
                    
                    {latestEvaluation.long_term_goals && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <Star className="h-4 w-4 mr-2 text-purple-500" />
                          Metas de Longo Prazo
                        </h4>
                        <p className="text-sm text-muted-foreground bg-purple-50 p-3 rounded">
                          {latestEvaluation.long_term_goals}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Dialog para Nova Meta */}
        <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Meta</DialogTitle>
              <DialogDescription>
                Defina uma nova meta para {selectedStudent?.profile?.full_name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="space-y-2">
                <Label>Título da Meta</Label>
                <Input
                  required
                  placeholder="Ex: Aperfeiçoar Ap Chagi"
                  value={goalForm.title || ''}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select 
                  value={goalForm.category || ''} 
                  onValueChange={(value) => setGoalForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technique">Técnica</SelectItem>
                    <SelectItem value="physical">Física</SelectItem>
                    <SelectItem value="mental">Mental</SelectItem>
                    <SelectItem value="competition">Competição</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Detalhes sobre a meta..."
                  value={goalForm.description || ''}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Data Alvo</Label>
                <Input
                  type="date"
                  value={goalForm.target_date || ''}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, target_date: e.target.value }))}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsGoalDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-primary">
                  Criar Meta
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para Nova Conquista */}
        <Dialog open={isAchievementDialogOpen} onOpenChange={setIsAchievementDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Conquista</DialogTitle>
              <DialogDescription>
                Registre uma conquista para {selectedStudent?.profile?.full_name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAchievement} className="space-y-4">
              <div className="space-y-2">
                <Label>Título da Conquista</Label>
                <Input
                  required
                  placeholder="Ex: 1º Lugar em Poomsae"
                  value={achievementForm.title || ''}
                  onChange={(e) => setAchievementForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tipo de Conquista</Label>
                <Select 
                  value={achievementForm.achievement_type || ''} 
                  onValueChange={(value) => setAchievementForm(prev => ({ ...prev, achievement_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="belt">Graduação</SelectItem>
                    <SelectItem value="competition">Competição</SelectItem>
                    <SelectItem value="milestone">Marco</SelectItem>
                    <SelectItem value="technique">Técnica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Detalhes sobre a conquista..."
                  value={achievementForm.description || ''}
                  onChange={(e) => setAchievementForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data da Conquista</Label>
                  <Input
                    type="date"
                    value={achievementForm.achievement_date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setAchievementForm(prev => ({ ...prev, achievement_date: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Pontos (Opcional)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={achievementForm.points || ''}
                    onChange={(e) => setAchievementForm(prev => ({ 
                      ...prev, 
                      points: e.target.value ? parseInt(e.target.value) : 0 
                    }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAchievementDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-primary">
                  Registrar Conquista
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para Avaliar Movimentos de Poomsae */}
        <Dialog open={isPoomsaeDialogOpen} onOpenChange={setIsPoomsaeDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Avaliação de Poomsae - {selectedStudent?.profile?.full_name}</DialogTitle>
              <DialogDescription>
                Avalie os movimentos específicos do Poomsae para a faixa {selectedStudent?.belt_color}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Poomsae da Faixa */}
              <div className="space-y-4">
                <h4 className="font-medium">Poomsae da Faixa Atual:</h4>
                <div className="flex flex-wrap gap-2">
                  {currentPoomsae.map((poomsae, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {poomsae}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Avaliação por Categoria de Movimento */}
              <div className="space-y-6">
                {Object.entries(movementsByCategory).map(([category, movements]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="font-medium text-lg">{category}</h4>
                    <div className="grid gap-4">
                      {movements.map((movement, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={poomsaeForm.movements[movement]?.mastered || false}
                              onCheckedChange={(checked) => 
                                setPoomsaeForm(prev => ({
                                  ...prev,
                                  movements: {
                                    ...prev.movements,
                                    [movement]: {
                                      ...prev.movements[movement],
                                      mastered: checked
                                    }
                                  }
                                }))
                              }
                            />
                            <span className="text-sm font-medium">{movement}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label className="text-xs">Nível (1-10):</Label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              className="w-16 h-8"
                              value={poomsaeForm.movements[movement]?.score || ''}
                              onChange={(e) => 
                                setPoomsaeForm(prev => ({
                                  ...prev,
                                  movements: {
                                    ...prev.movements,
                                    [movement]: {
                                      ...prev.movements[movement],
                                      score: parseInt(e.target.value) || 1
                                    }
                                  }
                                }))
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Observações Específicas */}
              <div className="space-y-2">
                <Label>Observações sobre Poomsae</Label>
                <Textarea
                  placeholder="Observações específicas sobre a execução dos Poomsae..."
                  value={poomsaeForm.observations || ''}
                  onChange={(e) => setPoomsaeForm(prev => ({
                    ...prev,
                    observations: e.target.value
                  }))}
                />
              </div>

              {/* Pontos para Focar */}
              <div className="space-y-2">
                <Label>Pontos para Focar na Próxima Aula</Label>
                <Textarea
                  placeholder="Movimentos específicos que precisam de mais prática..."
                  value={poomsaeForm.focus_points || ''}
                  onChange={(e) => setPoomsaeForm(prev => ({
                    ...prev,
                    focus_points: e.target.value
                  }))}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsPoomsaeDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button className="bg-gradient-primary" onClick={() => {
                  // Aqui você poderia salvar a avaliação específica de Poomsae
                  console.log('Avaliação de Poomsae:', poomsaeForm);
                  setIsPoomsaeDialogOpen(false);
                }}>
                  Salvar Avaliação
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}