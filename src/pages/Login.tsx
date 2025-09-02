import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/taekwondo-hero.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"mestre" | "aluno" | "responsavel">("mestre");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulação de login
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Login realizado com sucesso!",
      description: `Bem-vindo ao sistema, ${userType}!`,
    });

    navigate("/dashboard", { state: { userType } });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-accent/5 p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center justify-items-center">
        {/* Hero Section */}
        <div className="hidden lg:block w-full max-w-lg">
          <div className="relative overflow-hidden rounded-2xl shadow-accent h-[600px]">
            <img
              src={heroImage} 
              alt="Dojang de Taekwondo - Tatame" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-hero opacity-70"></div>
            <div className="absolute inset-0 flex items-center justify-center text-center p-8">
              <div className="text-white max-w-xs">
                <div className="mb-6 flex items-center justify-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                    <span className="text-white text-2xl font-bold">跆</span>
                  </div>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                    <span className="text-white text-2xl font-bold">拳</span>
                  </div>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                    <span className="text-white text-2xl font-bold">道</span>
                  </div>
                </div>
                <h1 className="text-4xl font-bold mb-4 tracking-wide">Tatame</h1>
                <p className="text-lg opacity-95 leading-relaxed">Sistema completo de gestão para artes marciais</p>
                <div className="mt-6 flex items-center justify-center space-x-2 text-xs opacity-90">
                  <span>✓ Gestão</span>
                  <span>•</span>
                  <span>✓ Graduações</span>
                  <span>•</span>
                  <span>✓ Comunicação</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-lg">
          <Card className="shadow-primary border-0 bg-card/95 backdrop-blur-sm h-[600px] flex flex-col">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-primary">
                <span className="text-white text-2xl font-bold">畳</span>
              </div>
              <CardTitle className="text-2xl font-bold mb-2">Bem-vindo ao Tatame</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Acesse sua conta para gerenciar seu tatame
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userType">Tipo de Usuário</Label>
                  <Select value={userType} onValueChange={(value: any) => setUserType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mestre">Mestre</SelectItem>
                      <SelectItem value="aluno">Aluno</SelectItem>
                      <SelectItem value="responsavel">Responsável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-primary hover:opacity-90 transition-all text-lg font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12 border-2 hover:bg-muted/50 transition-all"
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </Button>

                <div className="text-center text-sm text-muted-foreground space-y-2">
                  <a href="#" className="hover:text-primary transition-colors">Esqueceu sua senha?</a>
                  <div>
                    Não tem uma conta? <a href="#" className="text-primary hover:underline">Cadastre-se</a>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}