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
  { title: "Polos", url: "/polos", icon: MapPin, requiredRole: "mestre", iconColor: "text-cyan-600", activeColor: "blue" },
  { title: "Financeiro", url: "/financeiro", icon: Banknote, requiredRole: "mestre", iconColor: "text-emerald-600", activeColor: "blue" },
  { title: "Relatórios", url: "/relatorios", icon: PieChart, requiredRole: "mestre", iconColor: "text-indigo-600", activeColor: "blue" },
  { title: "Configurações", url: "/configuracoes", icon: Settings, iconColor: "text-gray-600", activeColor: "red" },
]

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar()
  const location = useLocation()
  const { userType, signOut } = useSupabaseAuth()
  const currentPath = location.pathname

  const closeMobileMenu = () => {
    if (isMobile) setOpenMobile(false)
  }

  const isActive = (path: string) => currentPath === path

  const filterItemsByRole = (items: typeof mainItems) => {
    return items.filter(item => {
      if (!item.requiredRole) return true
      return userType === item.requiredRole || (item.requiredRole === "mestre" && userType === "administrador")
    })
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" className="transition-[width] duration-300 ease-in-out">
      <SidebarContent className="overflow-y-auto overflow-x-hidden min-w-0 pt-3 transition-[max-width] duration-300 ease-in-out">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/90 font-semibold dark:text-gray-300">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterItemsByRole(mainItems).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={isCollapsed ? { children: item.title, sideOffset: 10 } : undefined}
                  >
                    <NavLink
                      to={item.url}
                      end
                      onClick={closeMobileMenu}
                      className={cn(
                        "flex items-center gap-2 w-full justify-start min-w-0 group-data-[collapsible=icon]:justify-center",
                        isActive(item.url)
                          ? item.activeColor === "blue"
                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 dark:from-blue-500 dark:to-blue-600 dark:shadow-blue-500/50"
                            : "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30 dark:from-red-500 dark:to-red-600 dark:shadow-red-500/50"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors duration-200 shrink-0",
                        isActive(item.url)
                          ? "text-white"
                          : item.iconColor ? `${item.iconColor} dark:text-gray-300` : "text-foreground/70 group-hover:text-foreground dark:text-gray-300 dark:group-hover:text-white"
                      )} />
                      <span className={cn(
                        "font-medium transition-colors whitespace-nowrap truncate min-w-0 group-data-[collapsible=icon]:hidden",
                        isActive(item.url)
                          ? "text-white"
                          : "text-foreground/80 group-hover:text-foreground dark:text-gray-200 dark:group-hover:text-white"
                      )}>
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/90 font-semibold dark:text-gray-300">
            Gestão
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterItemsByRole(managementItems).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={isCollapsed ? { children: item.title, sideOffset: 10 } : undefined}
                  >
                    <NavLink
                      to={item.url}
                      end
                      onClick={closeMobileMenu}
                      className={cn(
                        "flex items-center gap-2 w-full justify-start min-w-0 group-data-[collapsible=icon]:justify-center",
                        isActive(item.url)
                          ? item.activeColor === "blue"
                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 dark:from-blue-500 dark:to-blue-600 dark:shadow-blue-500/50"
                            : "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30 dark:from-red-500 dark:to-red-600 dark:shadow-red-500/50"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors duration-200 shrink-0",
                        isActive(item.url)
                          ? "text-white"
                          : item.iconColor ? `${item.iconColor} dark:text-gray-300` : "text-foreground/70 group-hover:text-foreground dark:text-gray-300 dark:group-hover:text-white"
                      )} />
                      <span className={cn(
                        "font-medium transition-colors whitespace-nowrap truncate min-w-0 group-data-[collapsible=icon]:hidden",
                        isActive(item.url)
                          ? "text-white"
                          : "text-foreground/80 group-hover:text-foreground dark:text-gray-200 dark:group-hover:text-white"
                      )}>
                        {item.title}
                      </span>
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
                  onClick={() => {
                    closeMobileMenu()
                    handleSignOut()
                  }}
                  tooltip={isCollapsed ? { children: "Sair", sideOffset: 10 } : undefined}
                  className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group text-foreground/80 dark:text-gray-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 flex items-center gap-2 w-full justify-start min-w-0 group-data-[collapsible=icon]:justify-center"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0 text-destructive group-hover:rotate-12 transition-all duration-200 dark:text-red-400" />
                  <span className="font-medium text-foreground/80 group-hover:text-destructive transition-colors whitespace-nowrap dark:text-gray-200 dark:group-hover:text-red-400 group-data-[collapsible=icon]:hidden">
                    Sair
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}