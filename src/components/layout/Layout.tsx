import { ReactNode } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

interface LayoutProps {
  children: ReactNode;
}

/** Mostra o botão de toggle apenas quando o sidebar está recolhido (desktop) ou sempre no mobile, evitando dois toggles visíveis. */
function LayoutHeader() {
  const { state, isMobile } = useSidebar();
  const showTrigger = isMobile || state === "collapsed";
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b bg-background px-3 sm:px-4 dark:bg-gray-900 dark:border-gray-800">
      {showTrigger && (
        <SidebarTrigger
          className="shrink-0"
          aria-label={state === "collapsed" ? "Expandir menu" : "Recolher ou expandir menu"}
        />
      )}
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