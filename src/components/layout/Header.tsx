import { Button } from "@/components/ui/button";
import { User, LogOut, Menu } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  userType?: "mestre" | "aluno" | "responsavel";
  userName?: string;
  avatarUrl?: string | null;
  onToggleSidebar?: () => void;
}

export function Header({ userType = "mestre", userName = "", avatarUrl, onToggleSidebar }: HeaderProps) {
  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case "mestre": return "Mestre";
      case "aluno": return "Aluno";
      case "responsavel": return "Responsável";
      default: return "Usuário";
    }
  };

  return (
    <header className="border-b bg-white dark:bg-gray-900 shadow-sm dark:border-gray-800">
      <div className="flex h-16 items-center px-4 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2 dark:hover:bg-gray-800"
          onClick={onToggleSidebar}
        >
          <Menu className="h-6 w-6 dark:text-gray-200" />
        </Button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center dark:bg-gradient-to-br dark:from-amber-500 dark:to-orange-600">
            <span className="text-white dark:text-amber-50 text-sm font-bold">畳</span>
          </div>
          <h1 className="text-xl font-bold text-foreground dark:text-gray-100">Tatame</h1>
        </div>

        <div className="flex-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={userName || "Usuário"} />}
                <AvatarFallback className="bg-gradient-accent text-white">
                  {userName ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">
                  {getUserTypeLabel(userType)}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}