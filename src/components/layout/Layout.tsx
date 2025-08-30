import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  userType?: "mestre" | "aluno" | "responsavel";
  userName?: string;
}

export function Layout({ children, userType = "mestre", userName = "Mestre Kim" }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userType={userType} 
        userName={userName}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex">
        <aside className="hidden lg:block">
          <Sidebar userType={userType} isOpen={sidebarOpen} />
        </aside>
        
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="fixed inset-0 bg-black/50" 
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed left-0 top-16 h-full w-64 bg-white border-r shadow-lg">
              <Sidebar userType={userType} isOpen={true} />
            </div>
          </div>
        )}
        
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          sidebarOpen ? "lg:ml-0" : "lg:ml-0"
        )}>
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}