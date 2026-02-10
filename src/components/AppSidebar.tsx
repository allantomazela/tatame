// Sidebar refatorado: logo fixo no topo, collapse 250px/80px, transições suaves
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
  PanelLeft,
  PanelLeftClose,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
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

/** Logo: símbolo coreano preto (道 - Do, "o caminho"). Fixo no topo; recolhido mostra só o ícone. */
function SidebarLogo() {
  const { state, isMobile, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <SidebarHeader className={cn("flex flex-col gap-2 shrink-0 border-b border-sidebar-border/80 pb-3 mb-2 transition-all duration-300 ease-in-out", collapsed ? "px-2" : "px-3")}>
      <div
        className={cn(
          "flex items-center w-full transition-all duration-300 ease-in-out",
          collapsed ? "justify-center gap-1" : "gap-3"
        )}
      >
        {/* Ícone coreano preto: 道 (Do) - sempre visível, nunca some */}
        <div
          className={cn(
            "flex items-center justify-center rounded-lg bg-black text-white font-bold shrink-0 transition-all duration-300 ease-in-out",
            collapsed ? "w-9 h-9 text-base" : "w-11 h-11 text-xl"
          )}
          title="Tatame"
        >
          道
        </div>
        {/* Nome quando expandido; recolhido: w-0 overflow-hidden para não quebrar layout */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out flex-1 min-w-0",
            collapsed ? "w-0 min-w-0 opacity-0" : "opacity-100"
          )}
        >
          <span className="font-bold text-sidebar-foreground whitespace-nowrap pl-1 dark:text-gray-100">
            Tatame
          </span>
        </div>
        {/* Toggle dentro do menu (apenas desktop) */}
        {!isMobile && (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className="shrink-0 flex items-center justify-center rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 ease-in-out"
          >
            {collapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </SidebarHeader>
  )
}

function NavItem({
  item,
  isActive,
  collapsed,
  onNavigate,
}: {
  item: MenuItem
  isActive: boolean
  collapsed: boolean
  onNavigate: () => void
}) {
  const Icon = item.icon
  const activeBlue = item.activeColor === "blue"
  const activeClasses = isActive
    ? activeBlue
      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/25 dark:from-blue-500 dark:to-blue-600"
      : "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-500/25 dark:from-red-500 dark:to-red-600"
    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
  const iconClasses = isActive
    ? "text-white"
    : item.iconColor
      ? `${item.iconColor} dark:text-gray-300`
      : "text-foreground/70 dark:text-gray-300"

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={collapsed ? { children: item.title, sideOffset: 10 } : undefined}
      >
        <NavLink
          to={item.url}
          end
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 w-full min-w-0 rounded-lg px-3 py-2.5 transition-all duration-200 ease-in-out",
            collapsed && "justify-center px-2",
            activeClasses
          )}
        >
          <Icon className={cn("h-5 w-5 flex-shrink-0 shrink-0", iconClasses)} />
          {/* Texto oculto via CSS no sidebar.tsx (group-data-[collapsible=icon]:[&>span:last-child]:!hidden) */}
          <span className={cn("font-medium whitespace-nowrap truncate", isActive && "text-white")}>
            {item.title}
          </span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar() {
  const { state, isMobile, setOpenMobile, toggleSidebar } = useSidebar()
  const location = useLocation()
  const { userType, signOut } = useSupabaseAuth()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

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

  return (
    <Sidebar collapsible="icon" className="transition-[width] duration-300 ease-in-out">
      <SidebarContent className="overflow-y-auto overflow-x-hidden min-w-0 flex flex-col pt-3 transition-[max-width] duration-300 ease-in-out">
        {/* Logo fixo no topo (símbolo coreano 道) + toggle */}
        <SidebarLogo />

        <SidebarGroup className="flex-1 min-h-0">
          <SidebarGroupLabel className="text-sidebar-foreground/90 font-semibold dark:text-gray-300 px-3">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {filterItemsByRole(mainItems).map((item) => (
                <NavItem
                  key={item.title}
                  item={item}
                  isActive={isActive(item.url)}
                  collapsed={collapsed}
                  onNavigate={closeMobileMenu}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/90 font-semibold dark:text-gray-300 px-3">
            Gestão
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {filterItemsByRole(managementItems).map((item) => (
                <NavItem
                  key={item.title}
                  item={item}
                  isActive={isActive(item.url)}
                  collapsed={collapsed}
                  onNavigate={closeMobileMenu}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto shrink-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    closeMobileMenu()
                    handleSignOut()
                  }}
                  tooltip={collapsed ? { children: "Sair", sideOffset: 10 } : undefined}
                  className={cn(
                    "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 transition-all duration-200 ease-in-out",
                    "hover:bg-destructive/10 hover:text-destructive dark:hover:bg-red-900/20 dark:hover:text-red-400",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <LogOut className="h-5 w-5 flex-shrink-0 text-destructive dark:text-red-400" />
                  <span className="font-medium whitespace-nowrap truncate">
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
