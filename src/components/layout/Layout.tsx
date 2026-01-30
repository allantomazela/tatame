import { ReactNode } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 dark:bg-gray-900 dark:border-gray-800">
          <SidebarTrigger
            className="md:hidden shrink-0"
            aria-label="Abrir menu"
          />
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">畳</span>
            </div>
            <span className="font-semibold text-foreground truncate">Tatame</span>
          </div>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>
        <PWAInstallPrompt />
      </SidebarInset>
    </SidebarProvider>
  );
}