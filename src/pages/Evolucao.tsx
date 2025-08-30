import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Bar
} from "recharts";
import { 
  TrendingUp, 
  Award, 
  Target,
  Calendar,
  Users,
  Activity
} from "lucide-react";

const dadosProgresso = [
  { mes: 'Jan', chutes: 65, socos: 70, defesas: 60, formas: 75 },
  { mes: 'Fev', chutes: 70, socos: 72, defesas: 65, formas: 78 },
  { mes: 'Mar', chutes: 75, socos: 75, defesas: 70, formas: 82 },
  { mes: 'Abr', chutes: 80, socos: 78, defesas: 75, formas: 85 },
  { mes: 'Mai', chutes: 85, socos: 82, defesas: 80, formas: 88 },
  { mes: 'Jun', chutes: 88, socos: 85, defesas: 82, formas: 91 },
];

const dadosRadar = [
  { habilidade: 'Chutes', valor: 88 },
  { habilidade: 'Socos', valor: 85 },
  { habilidade: 'Defesas', valor: 82 },
  { habilidade: 'Formas', valor: 91 },
  { habilidade: 'Equilíbrio', valor: 78 },
  { habilidade: 'Flexibilidade', valor: 86 },
];

const dadosFrequencia = [
  { semana: 'S1', presencas: 3 },
  { semana: 'S2', presencas: 4 },
  { semana: 'S3', presencas: 3 },
  { semana: 'S4', presencas: 4 },
  { semana: 'S5', presencas: 2 },
  { semana: 'S6', presencas: 4 },
  { semana: 'S7', presencas: 3 },
  { semana: 'S8', presencas: 4 },
];

export default function Evolucao() {
  return (
    <Layout userType="mestre" userName="Mestre Kim">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard de Evolução</h1>
            <p className="text-muted-foreground">
              Acompanhe o progresso técnico dos alunos
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue="joao">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="joao">João Silva</SelectItem>
                <SelectItem value="maria">Maria Santos</SelectItem>
                <SelectItem value="pedro">Pedro Oliveira</SelectItem>
                <SelectItem value="ana">Ana Costa</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-gradient-primary">
              <Calendar className="mr-2 h-4 w-4" />
              Relatório
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faixa Atual</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">Verde</div>
              <p className="text-xs text-muted-foreground">
                Próxima: Azul em 45 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">86%</div>
              <p className="text-xs text-muted-foreground">
                +12% este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Frequência</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">
                28 aulas de 30
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meta Mensal</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8/10</div>
              <p className="text-xs text-muted-foreground">
                Objetivos alcançados
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Evolução por Técnica */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução por Técnica</CardTitle>
              <CardDescription>
                Progresso nas habilidades principais nos últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosProgresso}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="chutes" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Chutes"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="socos" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    name="Socos"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="defesas" 
                    stroke="hsl(var(--warning))" 
                    strokeWidth={2}
                    name="Defesas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="formas" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    name="Formas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Radar de Habilidades */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil de Habilidades</CardTitle>
              <CardDescription>
                Avaliação atual em todas as áreas técnicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={dadosRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="habilidade" />
                  <PolarRadiusAxis domain={[0, 100]} />
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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Frequência Semanal */}
          <Card>
            <CardHeader>
              <CardTitle>Frequência Semanal</CardTitle>
              <CardDescription>
                Presenças nas últimas 8 semanas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dadosFrequencia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="presencas" 
                    fill="hsl(var(--accent))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Metas e Conquistas */}
          <Card>
            <CardHeader>
              <CardTitle>Metas do Mês</CardTitle>
              <CardDescription>
                Objetivos técnicos e de frequência
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { meta: "Aperfeiçoar Ap Chagi", progresso: 85, concluido: false },
                { meta: "Memorizar Poomsae Taegeuk 4", progresso: 100, concluido: true },
                { meta: "Frequência 90%+", progresso: 92, concluido: true },
                { meta: "Melhoria na Flexibilidade", progresso: 70, concluido: false },
                { meta: "Técnicas de Defesa", progresso: 60, concluido: false },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.meta}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{item.progresso}%</span>
                      {item.concluido && (
                        <Badge className="bg-gradient-secondary text-white">
                          Concluído
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={item.progresso} 
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Conquistas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Conquistas Recentes</CardTitle>
            <CardDescription>
              Últimas conquistas e marcos alcançados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  titulo: "Faixa Verde Conquistada",
                  data: "15/02/2024",
                  tipo: "graduacao",
                  descricao: "Aprovado em todos os quesitos técnicos"
                },
                {
                  titulo: "100 Aulas Frequentadas",
                  data: "10/02/2024",
                  tipo: "frequencia",
                  descricao: "Marco de dedicação e persistência"
                },
                {
                  titulo: "1º Lugar - Poomsae Regional",
                  data: "28/01/2024",
                  tipo: "competicao",
                  descricao: "Excelente desempenho em competição"
                }
              ].map((conquista, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-secondary" />
                    <h4 className="font-medium">{conquista.titulo}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{conquista.descricao}</p>
                  <p className="text-xs text-muted-foreground">{conquista.data}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}