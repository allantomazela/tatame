import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-dojang.jpg";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-6xl mx-4 grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="hidden lg:block">
          <div className="relative">
            <img 
              src={heroImage} 
              alt="Academia de Taekwondo" 
              className="w-full h-[600px] object-cover rounded-lg shadow-primary"
            />
            <div className="absolute inset-0 bg-gradient-hero opacity-60 rounded-lg"></div>
            <div className="absolute inset-0 flex items-center justify-center text-center p-8">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-4">Academia de Taekwondo</h1>
                <p className="text-lg opacity-90">Sistema completo de gestão para academias de taekwondo</p>
                <div className="mt-6 flex items-center justify-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl font-bold">跆</span>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl font-bold">拳</span>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl font-bold">道</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-accent">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl font-bold">TKD</span>
              </div>
              <CardTitle className="text-2xl">Entrar no Sistema</CardTitle>
              <CardDescription>
                Acesse sua conta para gerenciar a academia
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  className="w-full bg-gradient-primary hover:opacity-90 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <a href="#" className="hover:text-primary">Esqueceu sua senha?</a>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}