import { NavLink, useLocation } from "react-router-dom"
import { 
  Home, 
  Users, 
  Award, 
  Calendar, 
  MessageSquare, 
  DollarSign, 
  BarChart3,
  Settings,
  LogOut 
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
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Alunos", url: "/alunos", icon: Users, requiredRole: "mestre" },
  { title: "Graduações", url: "/graduacoes", icon: Award, requiredRole: "mestre" },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Mensagens", url: "/mensagens", icon: MessageSquare },
]

const managementItems = [
  { title: "Financeiro", url: "/financeiro", icon: DollarSign, requiredRole: "mestre" },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3, requiredRole: "mestre" },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const { userType, signOut } = useSupabaseAuth()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"

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
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">畳</span>
            </div>
            {state !== "collapsed" && <span className="font-bold text-lg">Tatame</span>}
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
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
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
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
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
                <SidebarMenuButton onClick={handleSignOut} className="hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="h-4 w-4" />
                  {state !== "collapsed" && <span>Sair</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}