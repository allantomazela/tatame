import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, Users, TrendingUp, DollarSign } from "lucide-react";

export default function Relatorios() {
  const relatorios = [
    {
      id: 1,
      titulo: "Relatório Mensal de Alunos",
      descricao: "Frequência e progresso dos alunos",
      periodo: "Novembro 2024",
      tipo: "alunos",
      status: "pronto"
    },
    {
      id: 2,
      titulo: "Relatório Financeiro",
      descricao: "Receitas e despesas do mês",
      periodo: "Novembro 2024",
      tipo: "financeiro", 
      status: "pronto"
    },
    {
      id: 3,
      titulo: "Relatório de Graduações",
      descricao: "Exames e aprovações realizadas",
      periodo: "Último Trimestre",
      tipo: "graduacoes",
      status: "pronto"
    },
    {
      id: 4,
      titulo: "Relatório de Eventos",
      descricao: "Campeonatos e eventos organizados",
      periodo: "2024",
      tipo: "eventos",
      status: "em_andamento"
    }
  ];

  const estatisticas = [
    {
      titulo: "Total de Alunos",
      valor: "48",
      variacao: "+8%",
      icon: Users,
      cor: "text-tkd-blue",
      bg: "bg-gradient-accent"
    },
    {
      titulo: "Receita Mensal",
      valor: "R$ 12.500",
      variacao: "+15%", 
      icon: DollarSign,
      cor: "text-tkd-green",
      bg: "bg-gradient-success"
    },
    {
      titulo: "Graduações",
      valor: "12",
      variacao: "+3",
      icon: TrendingUp,
      cor: "text-tkd-purple",
      bg: "bg-gradient-secondary"
    },
    {
      titulo: "Frequência Média",
      valor: "85%",
      variacao: "+5%",
      icon: Calendar,
      cor: "text-tkd-gold",
      bg: "bg-gradient-gold"
    }
  ];

  const getTipoColor = (tipo: string) => {
    const colors = {
      alunos: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
      financeiro: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
      graduacoes: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
      eventos: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200"
    };
    return colors[tipo as keyof typeof colors] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pronto: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
      em_andamento: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
      pendente: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pronto: "Pronto",
      em_andamento: "Em Andamento", 
      pendente: "Pendente"
    };
    return labels[status as keyof typeof labels] || status;
  };

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
          <Button className="bg-gradient-accent hover:bg-accent shadow-accent">
            <FileText className="mr-2 h-4 w-4" />
            Gerar Relatório
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
                      <p className="text-2xl font-bold">{stat.valor}</p>
                      <p className={`text-xs font-semibold ${stat.cor}`}>
                        {stat.variacao} do mês anterior
                      </p>
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
              Baixe ou visualize os relatórios gerados
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  <div className="flex items-center gap-2">
                    <Badge className={getTipoColor(relatorio.tipo)}>
                      {relatorio.tipo}
                    </Badge>
                    <Badge className={getStatusColor(relatorio.status)}>
                      {getStatusLabel(relatorio.status)}
                    </Badge>
                    {relatorio.status === 'pronto' && (
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}