// Sidebar com ícones atualizados
import React from "react"
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
import { cn } from "@/lib/utils"

type MenuItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  requiredRole?: string
  iconColor?: string
  activeColor?: "blue" | "red"
}

const mainItems: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, iconColor: "text-blue-600", activeColor: "blue" },
  { title: "Alunos", url: "/alunos", icon: GraduationCap, requiredRole: "mestre", iconColor: "text-purple-600", activeColor: "blue" },
  { title: "Graduações", url: "/graduacoes", icon: Trophy, requiredRole: "mestre", iconColor: "text-yellow-600", activeColor: "red" },
  { title: "Evolução", url: "/evolucao", icon: TrendingUp, iconColor: "text-green-600", activeColor: "blue" },
  { title: "Agenda", url: "/agenda", icon: CalendarDays, iconColor: "text-orange-600", activeColor: "red" },
  { title: "Mensagens", url: "/mensagens", icon: MessageCircle, iconColor: "text-pink-600", activeColor: "red" },
]

const managementItems: MenuItem[] = [
  { title: "Financeiro", url: "/financeiro", icon: Banknote, requiredRole: "mestre", iconColor: "text-emerald-600", activeColor: "blue" },
  { title: "Relatórios", url: "/relatorios", icon: PieChart, requiredRole: "mestre", iconColor: "text-indigo-600", activeColor: "blue" },
  { title: "Configurações", url: "/configuracoes", icon: Settings, iconColor: "text-gray-600", activeColor: "red" },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const { userType, signOut } = useSupabaseAuth()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive, activeColor = "blue" }: { isActive: boolean; activeColor?: "blue" | "red" }) =>
    cn(
      "flex items-center gap-2 w-full",
      isActive 
        ? activeColor === "blue"
          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
          : "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30"
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
    )

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
          <SidebarGroupLabel className="text-sidebar-foreground/90 font-semibold">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterItemsByRole(mainItems).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end className={getNavCls({ isActive: isActive(item.url), activeColor: item.activeColor })}>
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                        isActive(item.url) 
                          ? "text-white" 
                          : item.iconColor || "text-foreground/70 group-hover:text-foreground"
                      )} />
                      {state !== "collapsed" && (
                        <span className={cn(
                          "font-medium transition-colors",
                          isActive(item.url)
                            ? "text-white"
                            : "text-foreground/80 group-hover:text-foreground"
                        )}>
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/90 font-semibold">
            Gestão
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterItemsByRole(managementItems).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end className={getNavCls({ isActive: isActive(item.url), activeColor: item.activeColor })}>
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                        isActive(item.url) 
                          ? "text-white" 
                          : item.iconColor || "text-foreground/70 group-hover:text-foreground"
                      )} />
                      {state !== "collapsed" && (
                        <span className={cn(
                          "font-medium transition-colors",
                          isActive(item.url)
                            ? "text-white"
                            : "text-foreground/80 group-hover:text-foreground"
                        )}>
                          {item.title}
                        </span>
                      )}
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
                <SidebarMenuButton 
                  onClick={handleSignOut} 
                  className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group text-foreground/80"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0 text-destructive group-hover:rotate-12 transition-all duration-200" />
                  {state !== "collapsed" && (
                    <span className="font-medium text-foreground/80 group-hover:text-destructive transition-colors">
                      Sair
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}