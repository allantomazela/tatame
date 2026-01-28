import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";
import { Users, Award, Calendar, MessageSquare, TrendingUp, DollarSign, CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { profile, userType, user } = useSupabaseAuth();
  const { stats, recentActivities, loading } = useDashboard();
  const { sessions: upcomingSessions, fetchSessions, loading: sessionsLoading } = useTrainingSessions();

  useEffect(() => {
    if (!user) return;
    const start = format(new Date(), "yyyy-MM-dd");
    const end = format(addDays(new Date(), 7), "yyyy-MM-dd");
    fetchSessions(undefined, start, end);
  }, [user?.id, fetchSessions]);

  const alunosLabel =
    userType === "responsavel" ? "Seus alunos" : "Total de Alunos";

  const dashboardStats = [
    { title: alunosLabel, value: loading ? "..." : stats.activeStudents.toString(), icon: Users, change: "—" },
    { title: "Graduações este mês", value: loading ? "..." : stats.graduationsThisMonth.toString(), icon: Award, change: "—" },
    { title: "Turmas ativas", value: loading ? "..." : stats.totalClasses.toString(), icon: Calendar, change: "—" },
    { title: "Mensagens", value: loading ? "..." : stats.pendingMessages.toString(), icon: MessageSquare, change: "—" },
  ];

  if (userType === "mestre") {
    dashboardStats.push(
      { 
        title: "Receita mensal", 
        value: loading ? "..." : `R$ ${stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
        icon: DollarSign, 
        change: "—" 
      },
      { 
        title: "Taxa de frequência", 
        value: loading ? "..." : `${stats.attendanceRate}%`, 
        icon: TrendingUp, 
        change: "—" 
      }
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'graduation': return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'student': return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case 'payment': return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>;
      default: return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Agora';
    if (diffHours < 24) return `${diffHours}h atrás`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrás`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo de volta, {profile?.full_name}!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  <span className={stat.change !== "—" && stat.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : stat.change !== "—" && stat.change.startsWith('-') ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}>
                    {stat.change}
                  </span>
                  {stat.change === "—" ? " sem comparação anterior" : " em relação ao mês anterior"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>Últimas ações no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="w-2 h-2 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-3 w-12" />
                    </div>
                  ))
                ) : recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma atividade recente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximas Aulas</CardTitle>
              <CardDescription>Agenda dos próximos dias</CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-10 flex-1 mr-4" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  ))}
                </div>
              ) : upcomingSessions.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">
                  <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Nenhuma aula agendada</p>
                  <p className="text-xs mt-1">
                    {userType === "mestre"
                      ? "Crie sessões na Agenda ou configure horários nos Polos para ver os treinos aqui."
                      : "Quando houver treinos cadastrados no seu polo, eles aparecerão aqui."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.slice(0, 5).map((session) => {
                    const sessionDate = new Date(session.session_date + "T12:00:00");
                    const hoje = new Date();
                    hoje.setHours(0, 0, 0, 0);
                    const diffDays = Math.floor((sessionDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
                    const badge =
                      diffDays === 0
                        ? "Hoje"
                        : diffDays === 1
                          ? "Amanhã"
                          : `${diffDays} dias`;
                    const badgeClass =
                      diffDays === 0
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : diffDays === 1
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          : "bg-muted text-muted-foreground";
                    return (
                      <div key={session.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {session.class_name || "Sessão de Treino"}
                            {session.polo_name && session.polo_name !== "Não encontrado" && (
                              <span className="text-muted-foreground font-normal"> · {session.polo_name}</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(sessionDate, "EEEE", { locale: ptBR })}, {session.start_time}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${badgeClass}`}>{badge}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}