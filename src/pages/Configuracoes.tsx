import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Bell, 
  Shield, 
  User, 
  Eye,
  Globe,
  Lock,
  Upload,
  Loader2,
  MapPin,
  Phone
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useSettings } from "@/hooks/useSettings";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Configuracoes() {
  const { profile, loading: profileLoading, updateProfile, updatePassword, uploadAvatar } = useProfile();
  const { settings, loading: settingsLoading, updateSettings } = useSettings();
  const { user, userType } = useSupabaseAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "appearance" | "system">("profile");
  const showSystemTab = userType !== "aluno";
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    birth_date: "",
    address: "",
    emergency_contact: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Se for aluno, não deixar aba Sistema ativa
  useEffect(() => {
    if (userType === "aluno" && activeTab === "system") {
      setActiveTab("profile");
    }
  }, [userType, activeTab]);

  // Carregar dados do perfil
  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        birth_date: profile.birth_date || "",
        address: profile.address || "",
        emergency_contact: profile.emergency_contact || ""
      });
      if (profile.avatar_url) {
        setAvatarPreview(profile.avatar_url);
      }
    }
  }, [profile]);

  // Handlers
  const handleUpdateProfile = async () => {
    try {
      setActionLoading(true);
      if (avatarFile) {
        const { url } = await uploadAvatar(avatarFile);
        await updateProfile({ ...profileForm, avatar_url: url });
        setAvatarFile(null);
      } else {
        await updateProfile(profileForm);
      }
    } catch (error) {
      // Error já tratado no hook
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(true);
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      // Error já tratado no hook
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) {
      toast({
        title: "Aviso",
        description: "Selecione uma imagem para fazer upload.",
        variant: "default",
      });
      return;
    }

    try {
      setActionLoading(true);
      const { url } = await uploadAvatar(avatarFile);
      await updateProfile({ avatar_url: url });
      setAvatarFile(null);
    } catch (error) {
      // Error já tratado no hook
    } finally {
      setActionLoading(false);
    }
  };

  /** Alinhado ao limite do useProfile (2MB). Evita enviar arquivo grande só para ser rejeitado no hook. */
  const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > AVATAR_MAX_BYTES) {
        toast({
          title: "Arquivo grande",
          description: `A imagem deve ter no máximo 2 MB. O arquivo tem ${(file.size / 1024 / 1024).toFixed(2)} MB.`,
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione uma imagem válida.",
          variant: "destructive",
        });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSettingsChange = async (key: keyof typeof settings, value: any) => {
    try {
      await updateSettings({ [key]: value });
    } catch (error) {
      // Error já tratado no hook
    }
  };

  if (profileLoading || settingsLoading) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              <p className="text-muted-foreground mt-2">Carregando configurações...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e informações pessoais
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className={`grid w-full ${showSystemTab ? "grid-cols-5" : "grid-cols-4"}`}>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            {showSystemTab && <TabsTrigger value="system">Sistema</TabsTrigger>}
          </TabsList>

          {/* Tab Perfil */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">
                      {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="avatar-upload">Foto de Perfil</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="w-auto"
                      />
                      {avatarFile && (
                        <Button
                          size="sm"
                          onClick={handleUploadAvatar}
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          Enviar
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Formatos: JPEG, PNG, WebP, GIF. Tamanho máximo: 2 MB. A foto é salva no Storage, não no banco.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Formulário de Perfil */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo *</Label>
                    <Input
                      id="full_name"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={profileForm.birth_date}
                      onChange={(e) => setProfileForm({ ...profileForm, birth_date: e.target.value })}
                    />
                  </div>
                </div>

                <Separator />

                {/* Endereço - bloco visual */}
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Endereço
                  </div>
                  <Textarea
                    id="address"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="Rua, número, bairro, cidade, estado e CEP"
                    rows={3}
                    className="resize-none bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Endereço completo para contato e eventual necessidade em eventos ou competições.
                  </p>
                </div>

                {/* Contato de Emergência - bloco visual */}
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Contato de Emergência
                  </div>
                  <Input
                    id="emergency_contact"
                    value={profileForm.emergency_contact}
                    onChange={(e) => setProfileForm({ ...profileForm, emergency_contact: e.target.value })}
                    placeholder="Ex: Maria Silva - (11) 99999-9999"
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nome e telefone de alguém a ser avisado em caso de necessidade (ex.: responsável, familiar).
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleUpdateProfile} disabled={actionLoading || !profileForm.full_name || !profileForm.email}>
                    {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Segurança */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Alterar Senha
                </CardTitle>
                <CardDescription>
                  Altere sua senha de acesso ao sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual *</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Digite sua senha atual"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha *</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Digite a nova senha (mínimo 6 caracteres)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirme a nova senha"
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleUpdatePassword} 
                    disabled={
                      actionLoading || 
                      !passwordForm.currentPassword || 
                      !passwordForm.newPassword || 
                      !passwordForm.confirmPassword
                    }
                  >
                    {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Alterar Senha
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Segurança da Conta
                </CardTitle>
                <CardDescription>
                  Informações sobre a segurança da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tipo de Usuário</p>
                    <p className="text-sm text-muted-foreground">
                      {userType === 'mestre' ? 'Mestre' : userType === 'aluno' ? 'Aluno' : 'Responsável'}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {userType === 'mestre' ? 'Administrador' : 'Usuário'}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Conta criada em</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.created_at ? format(new Date(profile.created_at), "dd/MM/yyyy 'às' HH:mm") : 'Não disponível'}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Última atualização</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.updated_at ? format(new Date(profile.updated_at), "dd/MM/yyyy 'às' HH:mm") : 'Não disponível'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Notificações */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Preferências de Notificação
                </CardTitle>
                <CardDescription>
                  Configure como e quando você deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber atualizações importantes por email
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => handleSettingsChange('email_notifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações no navegador
                    </p>
                  </div>
                  <Switch
                    checked={settings.push_notifications}
                    onCheckedChange={(checked) => handleSettingsChange('push_notifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lembretes de Pagamento</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber lembretes sobre pagamentos pendentes
                    </p>
                  </div>
                  <Switch
                    checked={settings.payment_reminders}
                    onCheckedChange={(checked) => handleSettingsChange('payment_reminders', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações de Presença</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações sobre frequência e presença
                    </p>
                  </div>
                  <Switch
                    checked={settings.attendance_notifications}
                    onCheckedChange={(checked) => handleSettingsChange('attendance_notifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações de Eventos</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações sobre eventos e competições
                    </p>
                  </div>
                  <Switch
                    checked={settings.event_notifications}
                    onCheckedChange={(checked) => handleSettingsChange('event_notifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações de Mensagens</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações quando receber mensagens
                    </p>
                  </div>
                  <Switch
                    checked={settings.message_notifications}
                    onCheckedChange={(checked) => handleSettingsChange('message_notifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Aparência */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Aparência e Visualização
                </CardTitle>
                <CardDescription>
                  Personalize a aparência do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value: any) => handleSettingsChange('theme', value)}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Escolha o tema visual do sistema
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value: any) => handleSettingsChange('language', value)}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Idioma da interface do sistema
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="date_format">Formato de Data</Label>
                  <Select
                    value={settings.date_format}
                    onValueChange={(value) => handleSettingsChange('date_format', value)}
                  >
                    <SelectTrigger id="date_format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Formato de exibição de datas
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="time_format">Formato de Hora</Label>
                  <Select
                    value={settings.time_format}
                    onValueChange={(value: any) => handleSettingsChange('time_format', value)}
                  >
                    <SelectTrigger id="time_format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 horas</SelectItem>
                      <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Formato de exibição de horas
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="currency_symbol">Símbolo de Moeda</Label>
                  <Input
                    id="currency_symbol"
                    value={settings.currency_symbol}
                    onChange={(e) => handleSettingsChange('currency_symbol', e.target.value)}
                    placeholder="R$"
                    maxLength={5}
                  />
                  <p className="text-sm text-muted-foreground">
                    Símbolo usado para exibir valores monetários
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Sistema - oculta para aluno */}
          {showSystemTab && (
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações do Sistema
                </CardTitle>
                <CardDescription>
                  Configurações gerais e preferências do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Fazer backup dos dados automaticamente
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_backup}
                    onCheckedChange={(checked) => handleSettingsChange('auto_backup', checked)}
                  />
                </div>
                <Separator />
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">Informações do Sistema</p>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Versão: 1.0.0</p>
                        <p>Última atualização: {format(new Date(), "dd/MM/yyyy")}</p>
                        {user && (
                          <p>ID do Usuário: {user.id.substring(0, 8)}...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {userType === 'mestre' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Configurações Administrativas
                  </CardTitle>
                  <CardDescription>
                    Configurações disponíveis apenas para mestres
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      Como mestre, você tem acesso completo a todas as funcionalidades do sistema, incluindo gerenciamento de usuários, polos, finanças e relatórios.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
