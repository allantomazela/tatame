import { ReactNode } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

interface LayoutProps {
  children: ReactNode;
}

/** Header com único toggle visível (desktop e mobile). */
function LayoutHeader() {
  const { state } = useSidebar();
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b bg-background px-3 sm:px-4 dark:bg-gray-900 dark:border-gray-800">
      <SidebarTrigger
        className="shrink-0"
        aria-label={state === "collapsed" ? "Expandir menu" : "Recolher ou expandir menu"}
      />
    </header>
  );
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <LayoutHeader />
        <div className="flex-1 min-w-0 p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
        <PWAInstallPrompt />
      </SidebarInset>
    </SidebarProvider>
  );
}