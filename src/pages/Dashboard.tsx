import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Users, Award, Calendar, MessageSquare, TrendingUp, DollarSign } from "lucide-react";

export default function Dashboard() {
  const { profile, userType } = useSupabaseAuth();

  const stats = [
    { title: "Total de Alunos", value: "156", icon: Users, change: "+12%" },
    { title: "Graduações este mês", value: "8", icon: Award, change: "+25%" },
    { title: "Aulas agendadas", value: "32", icon: Calendar, change: "+5%" },
    { title: "Mensagens", value: "24", icon: MessageSquare, change: "0%" },
  ];

  if (userType === "mestre") {
    stats.push(
      { title: "Receita mensal", value: "R$ 12.500", icon: DollarSign, change: "+8%" },
      { title: "Taxa de frequência", value: "87%", icon: TrendingUp, change: "+3%" }
    );
  }

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
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
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
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nova graduação registrada</p>
                    <p className="text-xs text-muted-foreground">João Silva - Faixa Amarela</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2h atrás</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Novo aluno cadastrado</p>
                    <p className="text-xs text-muted-foreground">Maria Santos</p>
                  </div>
                  <span className="text-xs text-muted-foreground">5h atrás</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Pagamento recebido</p>
                    <p className="text-xs text-muted-foreground">Pedro Costa - Mensalidade Março</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1d atrás</span>
                </div>
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