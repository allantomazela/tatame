import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Star, Target, Flame, Zap } from "lucide-react";

export default function Conquistas() {
  const conquistas = [
    {
      id: 1,
      titulo: "Primeira Graduação",
      descricao: "Conquistou sua primeira faixa colorida",
      data: "Janeiro 2024",
      categoria: "graduacao",
      icon: Trophy,
      desbloqueada: true
    },
    {
      id: 2,
      titulo: "Disciplina de Ferro",
      descricao: "Completou 30 treinos consecutivos",
      data: "Fevereiro 2024", 
      categoria: "dedicacao",
      icon: Flame,
      desbloqueada: true
    },
    {
      id: 3,
      titulo: "Mestre dos Poomsae",
      descricao: "Dominou 5 formas diferentes",
      data: "Março 2024",
      categoria: "tecnica",
      icon: Star,
      desbloqueada: true
    },
    {
      id: 4,
      titulo: "Campeão Regional",
      descricao: "1º lugar no campeonato regional",
      data: "Abril 2024",
      categoria: "competicao",
      icon: Medal,
      desbloqueada: true
    },
    {
      id: 5,
      titulo: "Velocidade do Raio",
      descricao: "Execute 10 chutes em 5 segundos",
      data: "A conquistar",
      categoria: "tecnica", 
      icon: Zap,
      desbloqueada: false
    },
    {
      id: 6,
      titulo: "Mentor",
      descricao: "Ajude 5 novos alunos em seus treinos",
      data: "A conquistar",
      categoria: "lideranca",
      icon: Target,
      desbloqueada: false
    }
  ];

  const getCategoriaColor = (categoria: string) => {
    const colors = {
      graduacao: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
      dedicacao: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200", 
      tecnica: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
      competicao: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
      lideranca: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
    };
    return colors[categoria as keyof typeof colors] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels = {
      graduacao: "Graduação",
      dedicacao: "Dedicação",
      tecnica: "Técnica", 
      competicao: "Competição",
      lideranca: "Liderança"
    };
    return labels[categoria as keyof typeof labels] || categoria;
  };

  const conquistasDesbloqueadas = conquistas.filter(c => c.desbloqueada);
  const conquistasBloqueadas = conquistas.filter(c => !c.desbloqueada);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conquistas</h1>
          <p className="text-muted-foreground">
            Suas conquistas e marcos no Taekwondo
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-gold text-white shadow-gold">
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="mx-auto h-12 w-12 mb-4 animate-float" />
                <div className="text-3xl font-bold">{conquistasDesbloqueadas.length}</div>
                <p className="text-sm opacity-90">Conquistas Desbloqueadas</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-accent text-white shadow-accent">
            <CardContent className="pt-6">
              <div className="text-center">
                <Target className="mx-auto h-12 w-12 mb-4 animate-pulse-glow" />
                <div className="text-3xl font-bold">{conquistasBloqueadas.length}</div>
                <p className="text-sm opacity-90">Metas Restantes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-secondary text-white shadow-secondary">
            <CardContent className="pt-6">
              <div className="text-center">
                <Star className="mx-auto h-12 w-12 mb-4 animate-float" />
                <div className="text-3xl font-bold">
                  {Math.round((conquistasDesbloqueadas.length / conquistas.length) * 100)}%
                </div>
                <p className="text-sm opacity-90">Progresso Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Conquistas Desbloqueadas</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {conquistasDesbloqueadas.map((conquista) => {
                const IconComponent = conquista.icon;
                return (
                <Card key={conquista.id} className="border-2 border-tkd-green/30 bg-gradient-to-br from-card to-tkd-green/5 shadow-success hover:shadow-lg transition-all duration-200 animate-fade-in">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-gradient-success shadow-lg">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-tkd-green">{conquista.titulo}</CardTitle>
                          <CardDescription className="text-tkd-green/70">{conquista.data}</CardDescription>
                        </div>
                      </div>
                      <Badge className={`${getCategoriaColor(conquista.categoria)} shadow-sm`}>
                        {getCategoriaLabel(conquista.categoria)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{conquista.descricao}</p>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Próximas Conquistas</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {conquistasBloqueadas.map((conquista) => {
                const IconComponent = conquista.icon;
                return (
                  <Card key={conquista.id} className="opacity-60 border-dashed">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-gray-100">
                            <IconComponent className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-gray-500">{conquista.titulo}</CardTitle>
                            <CardDescription>{conquista.data}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className={getCategoriaColor(conquista.categoria)}>
                          {getCategoriaLabel(conquista.categoria)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{conquista.descricao}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}