import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { Users, Award, Calendar, MessageSquare, TrendingUp, DollarSign, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { profile, userType } = useSupabaseAuth();
  const { stats, recentActivities, loading } = useDashboard();

  const dashboardStats = [
    { 
      title: "Total de Alunos", 
      value: loading ? "..." : stats.activeStudents.toString(), 
      icon: Users, 
      change: "+12%" 
    },
    { 
      title: "Graduações este mês", 
      value: loading ? "..." : stats.graduationsThisMonth.toString(), 
      icon: Award, 
      change: "+25%" 
    },
    { 
      title: "Turmas ativas", 
      value: loading ? "..." : stats.totalClasses.toString(), 
      icon: Calendar, 
      change: "+5%" 
    },
    { 
      title: "Mensagens", 
      value: loading ? "..." : stats.pendingMessages.toString(), 
      icon: MessageSquare, 
      change: "0%" 
    },
  ];

  if (userType === "mestre") {
    dashboardStats.push(
      { 
        title: "Receita mensal", 
        value: loading ? "..." : `R$ ${stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
        icon: DollarSign, 
        change: "+8%" 
      },
      { 
        title: "Taxa de frequência", 
        value: loading ? "..." : `${stats.attendanceRate}%`, 
        icon: TrendingUp, 
        change: "+3%" 
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
                  <span className={stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'}>
                    {stat.change}
                  </span>
                  {" "}em relação ao mês anterior
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Turma Iniciante</p>
                    <p className="text-xs text-muted-foreground">Segunda-feira, 19:00</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Hoje</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Turma Avançada</p>
                    <p className="text-xs text-muted-foreground">Terça-feira, 20:00</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Amanhã</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Turma Infantil</p>
                    <p className="text-xs text-muted-foreground">Quarta-feira, 18:00</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">2 dias</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}