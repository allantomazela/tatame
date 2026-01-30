import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

const PWA_DISMISS_KEY = "tatame-pwa-install-dismissed";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const dismissedAt = sessionStorage.getItem(PWA_DISMISS_KEY);
    if (dismissedAt) {
      const t = parseInt(dismissedAt, 10);
      if (Date.now() - t < 7 * 24 * 60 * 60 * 1000) return; // não mostrar de novo por 7 dias
    }

    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem(PWA_DISMISS_KEY, String(Date.now()));
  };

  if (!showBanner || !isMobile) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm rounded-lg border bg-background shadow-lg p-4 flex items-center gap-3 animate-in slide-in-from-bottom-4"
      role="dialog"
      aria-label="Instalar aplicativo"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Instalar Tatame</p>
        <p className="text-xs text-muted-foreground">Use como app no celular para acesso rápido.</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" onClick={handleInstall} className="gap-1">
          <Download className="h-4 w-4" />
          Instalar
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleDismiss} aria-label="Fechar">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
