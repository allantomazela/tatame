// Sidebar com ícones atualizados
import { NavLink, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  GraduationCap, 
  Trophy, 
  CalendarDays, 
  MessageCircle, 
  Banknote, 
  PieChart,
  Settings,
  LogOut,
  TrendingUp,
  MapPin,
  Users2
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Alunos", url: "/alunos", icon: GraduationCap, requiredRole: "mestre" },
  { title: "Graduações", url: "/graduacoes", icon: Trophy, requiredRole: "mestre" },
  { title: "Evolução", url: "/evolucao", icon: TrendingUp },
  { title: "Agenda", url: "/agenda", icon: CalendarDays },
  { title: "Mensagens", url: "/mensagens", icon: MessageCircle },
]

const managementItems = [
  { title: "Financeiro", url: "/financeiro", icon: Banknote, requiredRole: "mestre" },
  { title: "Relatórios", url: "/relatorios", icon: PieChart, requiredRole: "mestre" },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const { userType, signOut } = useSupabaseAuth()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-gradient-primary text-white shadow-primary/20 shadow-lg" 
      : "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground transition-all duration-200"

  const filterItemsByRole = (items: typeof mainItems) => {
    return items.filter(item => {
      if (!item.requiredRole) return true
      return userType === item.requiredRole
    })
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"}>
      <SidebarContent>
        {/* Logo/Brand */}
        <div className="p-4 border-b border-sidebar-border/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary/20 shadow-lg">
              <span className="text-white font-bold text-lg">畳</span>
            </div>
            {state !== "collapsed" && (
              <div className="flex flex-col">
                <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">Tatame</span>
                <span className="text-xs text-muted-foreground">Academia</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterItemsByRole(mainItems).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {state !== "collapsed" && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterItemsByRole(managementItems).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {state !== "collapsed" && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sign Out */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group">
                  <LogOut className="h-5 w-5 flex-shrink-0 group-hover:rotate-12 transition-transform duration-200" />
                  {state !== "collapsed" && <span className="font-medium">Sair</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}