import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, Shield, Users, User, Lock } from "lucide-react";
import { useSupabaseAuth, UserType } from "@/hooks/useSupabaseAuth";
import heroImage from "@/assets/taekwondo-hero.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<UserType>("aluno");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, resetPasswordForEmail, isAuthenticated, loading } = useSupabaseAuth();
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // Redirect if already authenticated using useEffect
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location.state?.from?.pathname]);

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-accent/5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case "mestre": return <Shield className="w-4 h-4" />;
      case "aluno": return <User className="w-4 h-4" />;
      case "responsavel": return <Users className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevenir múltiplas chamadas
    
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (!error) {
        // O redirecionamento será feito pelo useEffect
        return;
      }
    } catch (error) {
      // Erro já tratado pelo hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      const result = await signUp(email, password, {
        fullName,
        userType,
        phone
      });
      
      if (!result.error) {
        setActiveTab("login");
        setEmail("");
        setPassword("");
        setFullName("");
        setPhone("");
      } else if (result.switchToLogin) {
        // Automaticamente trocar para aba de login se usuário já existe
        setActiveTab("login");
      }
    } catch (error) {
      // Erro já tratado pelo hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-accent/5 p-4 animate-fade-in overflow-y-auto">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center justify-items-center py-8">
        {/* Hero Section */}
        <div className="hidden lg:block w-full max-w-lg animate-scale-in">
          <div className="relative overflow-hidden rounded-2xl shadow-accent h-[600px] group hover:shadow-2xl transition-all duration-500">
            <img
              src={heroImage} 
              alt="Dojang de Taekwondo - Tatame" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-hero opacity-70 transition-opacity duration-300 group-hover:opacity-60"></div>
            <div className="absolute inset-0 flex items-center justify-center text-center p-8">
              <div className="text-white max-w-xs">
                <div className="mb-6 flex items-center justify-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 animate-float hover:bg-white/30 transition-all duration-300 hover:scale-110">
                    <span className="text-white text-2xl font-bold">跆</span>
                  </div>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 animate-float hover:bg-white/30 transition-all duration-300 hover:scale-110" style={{ animationDelay: '0.5s' }}>
                    <span className="text-white text-2xl font-bold">拳</span>
                  </div>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 animate-float hover:bg-white/30 transition-all duration-300 hover:scale-110" style={{ animationDelay: '1s' }}>
                    <span className="text-white text-2xl font-bold">道</span>
                  </div>
                </div>
                <h1 className="text-4xl font-bold mb-4 tracking-wide animate-pulse-glow">Tatame</h1>
                <p className="text-lg opacity-95 leading-relaxed">Sistema completo de gestão para artes marciais</p>
                <div className="mt-6 flex items-center justify-center space-x-2 text-xs opacity-90">
                  <span className="hover:text-accent transition-colors">✓ Gestão</span>
                  <span>•</span>
                  <span className="hover:text-accent transition-colors">✓ Graduações</span>
                  <span>•</span>
                  <span className="hover:text-accent transition-colors">✓ Comunicação</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-lg animate-slide-in-right">
          <Card className="shadow-primary border-0 bg-card/95 backdrop-blur-sm min-h-fit flex flex-col hover:shadow-2xl transition-all duration-500 group">
            <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-primary animate-pulse-glow group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl font-bold">畳</span>
              </div>
              <CardTitle className="text-2xl font-bold mb-2 animate-fade-in">Bem-vindo ao Tatame</CardTitle>
              <CardDescription className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Acesse sua conta para gerenciar seu tatame
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center pb-6 sm:pb-8 px-4 sm:px-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4 mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">

                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <Label htmlFor="email" className={`text-sm font-medium transition-colors duration-200 ${
                    focusedField === 'email' ? 'text-primary' : 'text-foreground'
                  }`}>Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={`h-12 border-2 transition-all duration-300 bg-background/50 pr-10 ${
                        focusedField === 'email' 
                          ? 'border-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                          : 'hover:border-primary/50'
                      }`}
                      required
                    />
                    {email && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <Label htmlFor="password" className={`text-sm font-medium transition-colors duration-200 ${
                    focusedField === 'password' ? 'text-primary' : 'text-foreground'
                  }`}>Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className={`h-12 border-2 transition-all duration-300 bg-background/50 pr-10 ${
                        focusedField === 'password' 
                          ? 'border-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                          : 'hover:border-primary/50'
                      }`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 
                        <EyeOff className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" /> : 
                        <Eye className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                      }
                    </Button>
                  </div>
                  <div className="flex flex-col items-end gap-1 mt-1">
                    <Dialog open={recoveryOpen} onOpenChange={setRecoveryOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="link" className="text-primary font-medium text-sm h-auto p-0 hover:underline">
                          <Lock className="w-3 h-3 mr-1" />
                          Esqueci minha senha
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Recuperar senha</DialogTitle>
                          <DialogDescription>
                            Informe o e-mail da sua conta. Enviaremos um link para redefinir sua senha.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="recovery-email">E-mail</Label>
                            <Input
                              id="recovery-email"
                              type="email"
                              placeholder="seu@email.com"
                              value={recoveryEmail}
                              onChange={(e) => setRecoveryEmail(e.target.value)}
                              className="h-11"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setRecoveryOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            disabled={!recoveryEmail.trim() || recoveryLoading}
                            onClick={async () => {
                              setRecoveryLoading(true);
                              await resetPasswordForEmail(recoveryEmail.trim());
                              setRecoveryLoading(false);
                              setRecoveryOpen(false);
                              setRecoveryEmail("");
                            }}
                          >
                            {recoveryLoading ? "Enviando..." : "Enviar link"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-primary hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-lg font-medium shadow-primary animate-fade-in group relative overflow-hidden"
                  style={{ animationDelay: '0.5s' }}
                  disabled={isLoading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {isLoading ? (
                    <div className="flex items-center space-x-2 relative z-10">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    <span className="relative z-10">Entrar</span>
                  )}
                </Button>

                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome Completo</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-12 border-2 hover:border-primary/50 focus:border-primary transition-all duration-300 bg-background/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 border-2 hover:border-primary/50 focus:border-primary transition-all duration-300 bg-background/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Telefone (opcional)</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-12 border-2 hover:border-primary/50 focus:border-primary transition-all duration-300 bg-background/50"
                      />
                    </div>

                    <div className="space-y-2 relative">
                      <Label htmlFor="signup-userType">Tipo de Usuário</Label>
                      <Select value={userType ?? "aluno"} onValueChange={(value: UserType) => setUserType(value)}>
                        <SelectTrigger className="h-12 border-2 hover:border-primary/50 focus:border-primary transition-all duration-300 bg-background/50">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent 
                          className="bg-card border-border shadow-lg max-h-48 overflow-auto"
                          position="popper"
                          sideOffset={4}
                        >
                          <SelectItem value="aluno">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Aluno
                            </div>
                          </SelectItem>
                          <SelectItem value="responsavel">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Responsável
                            </div>
                          </SelectItem>
                          <SelectItem value="mestre">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Mestre
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Sua senha"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 border-2 hover:border-primary/50 focus:border-primary transition-all duration-300 bg-background/50 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/10"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? 
                            <EyeOff className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" /> : 
                            <Eye className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                          }
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-primary hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-lg font-medium shadow-primary group relative overflow-hidden"
                      disabled={isLoading}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      {isLoading ? (
                        <div className="flex items-center space-x-2 relative z-10">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Cadastrando...</span>
                        </div>
                      ) : (
                        <span className="relative z-10">Cadastrar</span>
                      )}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground mt-2">
                      Esqueceu sua senha?{" "}
                      <Link to="/redefinir-senha" className="text-primary font-medium hover:underline">
                        Redefinir senha
                      </Link>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}