import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award, Target, Calendar } from "lucide-react";

export default function Progresso() {
  const habilidades: Array<{ nome: string; nivel: number; total: number }> = [];
  const conquistas: Array<{ nome: string; data: string; tipo: string }> = [];

  const progressoAtual: {
    faixa: string | null;
    proximaFaixa: string | null;
    progresso: number;
    tempoNaFaixa: string | null;
    proximoExame: string | null;
  } = {
    faixa: null,
    proximaFaixa: null,
    progresso: 0,
    tempoNaFaixa: null,
    proximoExame: null
  };

  const temDados = progressoAtual.faixa != null || habilidades.length > 0 || conquistas.length > 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Progresso</h1>
          <p className="text-muted-foreground">
            Acompanhe sua evolução no Taekwondo
          </p>
        </div>

        {!temDados ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Target className="h-16 w-16 mb-4 opacity-50" />
              <p className="font-medium text-lg">Nenhum progresso registrado ainda</p>
              <p className="text-sm mt-2 max-w-md">
                Sua faixa, habilidades e conquistas aparecerão aqui conforme forem registradas pelo seu mestre na página de Evolução.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {(progressoAtual.faixa != null || progressoAtual.proximoExame != null) && (
              <Card className="bg-gradient-to-br from-card to-muted/20 border-tkd-blue/20 shadow-accent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-accent">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    Faixa Atual
                  </CardTitle>
                  <CardDescription>Progresso para próxima graduação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-lg">
                        {progressoAtual.faixa ? `Faixa ${progressoAtual.faixa}` : "—"}
                      </p>
                      {progressoAtual.tempoNaFaixa && (
                        <p className="text-sm text-muted-foreground">
                          {progressoAtual.tempoNaFaixa} nesta faixa
                        </p>
                      )}
                    </div>
                    <span className="bg-gradient-accent text-white shadow-accent px-2 py-1 rounded text-sm font-medium">
                      {progressoAtual.progresso}%
                    </span>
                  </div>
                  <Progress value={progressoAtual.progresso} className="w-full h-3" />
                  {progressoAtual.proximoExame && (
                    <div className="flex items-center gap-2 text-sm bg-muted/50 p-3 rounded-lg">
                      <Calendar className="h-4 w-4 text-tkd-gold" />
                      Próximo exame: {progressoAtual.proximoExame}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {habilidades.length > 0 && (
              <Card className="bg-gradient-to-br from-card to-muted/20 border-tkd-green/20 shadow-success">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-success">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    Habilidades
                  </CardTitle>
                  <CardDescription>Suas competências técnicas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {habilidades.map((h) => (
                      <div key={h.nome} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{h.nome}</span>
                          <span className="text-tkd-blue font-bold">{h.nivel}%</span>
                        </div>
                        <Progress value={h.nivel} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {conquistas.length > 0 && (
              <Card className="bg-gradient-to-br from-card to-muted/20 border-tkd-gold/20 shadow-gold">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-gold">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    Conquistas Recentes
                  </CardTitle>
                  <CardDescription>
                    Seus marcos e conquistas no Taekwondo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {conquistas.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-muted hover:border-tkd-gold/50 transition-colors animate-fade-in"
                      >
                        <div
                          className={`p-3 rounded-full shadow-lg ${
                            c.tipo === "graduacao"
                              ? "bg-gradient-success"
                              : c.tipo === "competicao"
                                ? "bg-gradient-accent"
                                : "bg-gradient-secondary"
                          }`}
                        >
                          <Award className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-lg">{c.nome}</p>
                          <p className="text-sm text-muted-foreground">{c.data}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
