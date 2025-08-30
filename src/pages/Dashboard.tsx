import { useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Calendar,
  Award,
  Clock,
  Target,
  Activity
} from "lucide-react";

export default function Dashboard() {
  const location = useLocation();
  const userType = location.state?.userType || "mestre";

  const getDashboardContent = () => {
    switch (userType) {
      case "mestre":
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-xs text-muted-foreground">+3 novos este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">5 não lidas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próximas Graduações</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Neste trimestre</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Frequência Média</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">+5% este mês</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Alunos Recentes</CardTitle>
                  <CardDescription>Últimos alunos cadastrados na academia</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Ana Silva", faixa: "Branca", data: "Hoje" },
                      { name: "Carlos Santos", faixa: "Amarela", data: "Ontem" },
                      { name: "Maria Oliveira", faixa: "Branca", data: "2 dias" },
                      { name: "João Costa", faixa: "Verde", data: "3 dias" },
                    ].map((aluno, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center text-white font-medium">
                            {aluno.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium">{aluno.name}</p>
                            <p className="text-sm text-muted-foreground">Faixa {aluno.faixa}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{aluno.data}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Agenda de Hoje</CardTitle>
                  <CardDescription>Próximas atividades agendadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { hora: "09:00", atividade: "Aula Infantil", participantes: 15 },
                      { hora: "14:00", atividade: "Aula Adultos", participantes: 22 },
                      { hora: "16:00", atividade: "Treinamento Competição", participantes: 8 },
                      { hora: "19:00", atividade: "Aula Iniciantes", participantes: 12 },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2">
                        <div className="w-2 h-2 bg-secondary rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.atividade}</p>
                          <p className="text-xs text-muted-foreground">{item.hora} • {item.participantes} alunos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        );

      case "aluno":
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Faixa Atual</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">Verde</div>
                  <p className="text-xs text-muted-foreground">Próxima: Azul</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Frequência</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92%</div>
                  <p className="text-xs text-muted-foreground">Este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tempo de Treino</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24h</div>
                  <p className="text-xs text-muted-foreground">Este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próxima Graduação</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">dias restantes</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Progresso nas Técnicas</CardTitle>
                  <CardDescription>Sua evolução nas habilidades principais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { tecnica: "Chagi (Chutes)", progresso: 85 },
                    { tecnica: "Jirugi (Socos)", progresso: 72 },
                    { tecnica: "Makgi (Defesas)", progresso: 68 },
                    { tecnica: "Poomsae (Formas)", progresso: 91 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.tecnica}</span>
                        <span>{item.progresso}%</span>
                      </div>
                      <Progress value={item.progresso} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conquistas Recentes</CardTitle>
                  <CardDescription>Suas últimas conquistas no taekwondo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { conquista: "Faixa Verde Conquistada", data: "15 dias atrás", tipo: "graduacao" },
                      { conquista: "1º Lugar - Poomsae Regional", data: "1 mês atrás", tipo: "competicao" },
                      { conquista: "100 Aulas Frequentadas", data: "2 meses atrás", tipo: "frequencia" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
                          <Award className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.conquista}</p>
                          <p className="text-xs text-muted-foreground">{item.data}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        );

      case "responsavel":
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Atleta Acompanhado</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">Maria Silva</div>
                  <p className="text-xs text-muted-foreground">Faixa Verde</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Frequência</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94%</div>
                  <p className="text-xs text-muted-foreground">Este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Não lidas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próxima Graduação</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">dias restantes</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução da Maria</CardTitle>
                  <CardDescription>Progresso nas técnicas principais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { tecnica: "Chagi (Chutes)", progresso: 88 },
                    { tecnica: "Jirugi (Socos)", progresso: 75 },
                    { tecnica: "Makgi (Defesas)", progresso: 82 },
                    { tecnica: "Poomsae (Formas)", progresso: 94 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.tecnica}</span>
                        <span>{item.progresso}%</span>
                      </div>
                      <Progress value={item.progresso} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atividades da Semana</CardTitle>
                  <CardDescription>Agenda de treinos e eventos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { dia: "Segunda", atividade: "Aula Técnica", horario: "19:00" },
                      { dia: "Quarta", atividade: "Treinamento", horario: "19:00" },
                      { dia: "Sexta", atividade: "Aula Poomsae", horario: "19:00" },
                      { dia: "Sábado", atividade: "Simulado Graduação", horario: "09:00" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{item.atividade}</p>
                          <p className="text-xs text-muted-foreground">{item.dia} • {item.horario}</p>
                        </div>
                        <Badge variant="outline">Agendado</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const getUserName = () => {
    switch (userType) {
      case "mestre": return "Mestre Kim";
      case "aluno": return "João Silva";
      case "responsavel": return "Ana Silva";
      default: return "Usuário";
    }
  };

  return (
    <Layout userType={userType} userName={getUserName()}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta! Aqui está um resumo da sua atividade.
          </p>
        </div>
        
        {getDashboardContent()}
      </div>
    </Layout>
  );
}