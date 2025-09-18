import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquarePlus, Search, User as UserIcon } from "lucide-react";
import { useUsers, type User } from "@/hooks/useUsers";

interface NewConversationDialogProps {
  onSelectUser: (userId: string) => void;
}

export function NewConversationDialog({ onSelectUser }: NewConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { users, loading } = useUsers();

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const getTipoColor = (tipo: User['user_type']) => {
    const colors = {
      "instrutor": "bg-gradient-primary text-white",
      "aluno": "bg-gradient-accent text-white", 
      "responsavel": "bg-gradient-secondary text-white"
    };
    return colors[tipo] || "bg-gray-100 text-gray-800";
  };

  const getTipoLabel = (tipo: User['user_type']) => {
    switch (tipo) {
      case 'instrutor':
        return 'Prof.';
      case 'responsavel':
        return 'Resp.';
      case 'aluno':
        return 'Aluno';
      default:
        return '';
    }
  };

  const handleSelectUser = (userId: string) => {
    onSelectUser(userId);
    setOpen(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-primary">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          Nova Conversa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar Nova Conversa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista de Usuários */}
          <ScrollArea className="h-[300px] border rounded-md">
            <div className="p-2 space-y-1">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-3 flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    className="w-full p-3 text-left rounded-lg hover:bg-muted transition-colors"
                    onClick={() => handleSelectUser(user.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback className={getTipoColor(user.user_type)}>
                          {user.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {getTipoLabel(user.user_type)} {user.full_name}
                          </p>
                          <Badge variant="outline" className="ml-2">
                            {user.user_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {search ? 'Nenhum usuário encontrado' : 'Nenhum usuário disponível'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}