import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Users, TrendingUp, DollarSign } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Skeleton } from "@/components/ui/skeleton";

export default function Relatorios() {
  const { userType } = useSupabaseAuth();
  const { stats, loading } = useDashboard();

  const relatorios: Array<{
    id: string;
    titulo: string;
    descricao: string;
    periodo: string;
    tipo: string;
    status: string;
  }> = [];

  const estatisticas = [
    {
      titulo: "Total de Alunos",
      valor: loading ? "—" : stats.activeStudents.toString(),
      icon: Users,
      cor: "text-tkd-blue",
      bg: "bg-gradient-accent"
    },
    {
      titulo: "Graduações este mês",
      valor: loading ? "—" : stats.graduationsThisMonth.toString(),
      icon: TrendingUp,
      cor: "text-tkd-purple",
      bg: "bg-gradient-secondary"
    },
    {
      titulo: "Frequência Média",
      valor: loading ? "—" : `${stats.attendanceRate}%`,
      icon: Calendar,
      cor: "text-tkd-gold",
      bg: "bg-gradient-gold"
    },
    ...(userType === "mestre"
      ? [
          {
            titulo: "Receita Mensal",
            valor: loading
              ? "—"
              : `R$ ${stats.monthlyRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            cor: "text-tkd-green",
            bg: "bg-gradient-success"
          } as const
        ]
      : [])
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground">
              Análises e relatórios do dojang
            </p>
          </div>
          <Button className="bg-gradient-accent hover:bg-accent shadow-accent" disabled>
            <FileText className="mr-2 h-4 w-4" />
            Gerar Relatório (em breve)
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {estatisticas.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.titulo} className="hover:shadow-lg transition-all duration-200 animate-fade-in">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.titulo}
                      </p>
                      {loading ? (
                        <Skeleton className="h-8 w-20 my-2" />
                      ) : (
                        <p className="text-2xl font-bold">{stat.valor}</p>
                      )}
                    </div>
                    <div className={`p-3 rounded-full ${stat.bg} shadow-lg`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios Disponíveis</CardTitle>
            <CardDescription>
              Relatórios gerados ficarão listados aqui
            </CardDescription>
          </CardHeader>
          <CardContent>
            {relatorios.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-50" />
                <p className="font-medium">Nenhum relatório gerado ainda</p>
                <p className="text-sm mt-1">
                  Use o botão &quot;Gerar Relatório&quot; quando a funcionalidade estiver disponível.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {relatorios.map((relatorio) => (
                  <div
                    key={relatorio.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-blue-100">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{relatorio.titulo}</h3>
                        <p className="text-sm text-muted-foreground">
                          {relatorio.descricao}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {relatorio.periodo}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
