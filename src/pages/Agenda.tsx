import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Plus } from "lucide-react";

export default function Agenda() {
  const eventos = [
    {
      id: 1,
      titulo: "Treino Infantil",
      horario: "16:00 - 17:00",
      data: "Segunda-feira",
      participantes: 12,
      tipo: "treino",
      cor: "tkd-blue"
    },
    {
      id: 2,
      titulo: "Treino Adulto",
      horario: "19:00 - 20:30",
      data: "Segunda-feira", 
      participantes: 8,
      tipo: "treino",
      cor: "tkd-red"
    },
    {
      id: 3,
      titulo: "Exame de Graduação",
      horario: "10:00 - 12:00",
      data: "Sábado",
      participantes: 5,
      tipo: "evento",
      cor: "tkd-gold"
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
            <p className="text-muted-foreground">
              Gerencie treinos e eventos do dojang
            </p>
          </div>
          <Button className="bg-gradient-accent hover:bg-accent shadow-accent">
            <Plus className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {eventos.map((evento) => (
            <Card key={evento.id} className="hover:shadow-lg transition-all duration-200 animate-fade-in">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{evento.titulo}</CardTitle>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm ${
                    evento.tipo === 'treino' 
                      ? `bg-${evento.cor}` 
                      : `bg-${evento.cor}`
                  }`}>
                    {evento.tipo}
                  </div>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {evento.data}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-tkd-blue" />
                    {evento.horario}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-tkd-green" />
                    {evento.participantes} participantes
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}