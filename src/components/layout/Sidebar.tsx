import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Settings,
  GraduationCap,
  Calendar,
  FileText,
  Award
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  userType: "mestre" | "aluno" | "responsavel";
  isOpen?: boolean;
  className?: string;
}

const navigationItems = {
  mestre: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Alunos", href: "/alunos" },
    { icon: MessageCircle, label: "Mensagens", href: "/mensagens" },
    { icon: TrendingUp, label: "Evolução", href: "/evolucao" },
    { icon: GraduationCap, label: "Graduações", href: "/graduacoes" },
    { icon: Calendar, label: "Agenda", href: "/agenda" },
    { icon: FileText, label: "Relatórios", href: "/relatorios" },
    { icon: Settings, label: "Configurações", href: "/configuracoes" },
  ],
  aluno: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: TrendingUp, label: "Meu Progresso", href: "/progresso" },
    { icon: MessageCircle, label: "Mensagens", href: "/mensagens" },
    { icon: Award, label: "Conquistas", href: "/conquistas" },
    { icon: Calendar, label: "Agenda", href: "/agenda" },
    { icon: Settings, label: "Configurações", href: "/configuracoes" },
  ],
  responsavel: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: TrendingUp, label: "Progresso do Atleta", href: "/progresso" },
    { icon: MessageCircle, label: "Mensagens", href: "/mensagens" },
    { icon: Calendar, label: "Agenda", href: "/agenda" },
    { icon: Settings, label: "Configurações", href: "/configuracoes" },
  ],
};

export function Sidebar({ userType, isOpen = true, className }: SidebarProps) {
  const items = navigationItems[userType];

  return (
    <div className={cn(
      "pb-12 transition-all duration-300 ease-in-out",
      isOpen ? "w-64" : "w-0 overflow-hidden",
      className
    )}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {items.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors",
                    isActive 
                      ? "bg-gradient-primary text-white shadow-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}