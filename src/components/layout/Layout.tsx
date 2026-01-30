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
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>
        <PWAInstallPrompt />
      </SidebarInset>
    </SidebarProvider>
  );
}