import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-dojang.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSupabaseAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Tatame
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema completo de gestão para academias de artes marciais. 
            Gerencie alunos, graduações, presenças e muito mais.
          </p>
          <Button 
            onClick={() => navigate("/login")}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-3"
          >
            Acessar Sistema
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <img 
            src={heroImage} 
            alt="Dojang de Taekwondo" 
            className="w-full h-96 object-cover rounded-2xl shadow-lg"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center p-6 rounded-lg bg-card">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Gestão de Alunos</h3>
            <p className="text-muted-foreground">Controle completo de matrículas, dados pessoais e histórico acadêmico.</p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🥋</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Graduações</h3>
            <p className="text-muted-foreground">Registre e acompanhe o progresso das faixas e graduações dos alunos.</p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Relatórios</h3>
            <p className="text-muted-foreground">Análises detalhadas de frequência, pagamentos e evolução dos alunos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
