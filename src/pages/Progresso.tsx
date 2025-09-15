import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Target, Calendar } from "lucide-react";

export default function Progresso() {
  const progressoAtual = {
    faixa: "Azul",
    proximaFaixa: "Azul com ponta vermelha",
    progresso: 65,
    tempoNaFaixa: "8 meses",
    proximoExame: "15 de Dezembro, 2024"
  };

  const habilidades = [
    { nome: "Poomsae", nivel: 80, total: 100 },
    { nome: "Kyorugi (Combate)", nivel: 70, total: 100 },
    { nome: "Chutes", nivel: 85, total: 100 },
    { nome: "Defesa Pessoal", nivel: 60, total: 100 },
    { nome: "Quebramento", nivel: 45, total: 100 }
  ];

  const conquistas = [
    { nome: "Primeira Graduação", data: "Janeiro 2024", tipo: "graduacao" },
    { nome: "Melhor Poomsae", data: "Março 2024", tipo: "competicao" },
    { nome: "100 Treinos", data: "Junho 2024", tipo: "dedicacao" },
    { nome: "Campeonato Regional", data: "Agosto 2024", tipo: "competicao" }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Progresso</h1>
          <p className="text-muted-foreground">
            Acompanhe sua evolução no Taekwondo
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Faixa Atual
              </CardTitle>
              <CardDescription>Progresso para próxima graduação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Faixa {progressoAtual.faixa}</p>
                  <p className="text-sm text-muted-foreground">
                    {progressoAtual.tempoNaFaixa} nesta faixa
                  </p>
                </div>
                <Badge variant="secondary">{progressoAtual.progresso}%</Badge>
              </div>
              <Progress value={progressoAtual.progresso} className="w-full" />
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                Próximo exame: {progressoAtual.proximoExame}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Habilidades
              </CardTitle>
              <CardDescription>Suas competências técnicas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {habilidades.map((habilidade) => (
                  <div key={habilidade.nome} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{habilidade.nome}</span>
                      <span>{habilidade.nivel}%</span>
                    </div>
                    <Progress value={habilidade.nivel} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Conquistas Recentes
            </CardTitle>
            <CardDescription>
              Seus marcos e conquistas no Taekwondo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {conquistas.map((conquista, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`p-2 rounded-full ${
                    conquista.tipo === 'graduacao' ? 'bg-green-100 text-green-600' :
                    conquista.tipo === 'competicao' ? 'bg-blue-100 text-blue-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    <Award className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{conquista.nome}</p>
                    <p className="text-sm text-muted-foreground">{conquista.data}</p>
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