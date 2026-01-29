import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Página de callback após confirmação de e-mail (link do Supabase).
 * O Supabase redireciona para esta URL com hash (#access_token=...). O client parseia o hash
 * e estabelece a sessão; aguardamos a sessão e redirecionamos para /dashboard.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Confirmando sua conta...");

  useEffect(() => {
    let mounted = true;

    const redirectToDashboard = () => {
      if (!mounted) return;
      setMessage("Conta confirmada! Redirecionando...");
      navigate("/dashboard", { replace: true });
    };

    const redirectToLogin = () => {
      if (!mounted) return;
      setMessage("Redirecionando para o login...");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        if (event === "SIGNED_IN" && session?.user) {
          redirectToDashboard();
          return;
        }
      }
    );

    const checkSession = async () => {
      await new Promise((r) => setTimeout(r, 500));
      if (!mounted) return;
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!mounted) return;
      if (error) {
        redirectToLogin();
        return;
      }
      if (session?.user) {
        redirectToDashboard();
      } else {
        redirectToLogin();
      }
    };

    checkSession();
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/20 to-accent/5 p-4">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-muted-foreground text-center">{message}</p>
    </div>
  );
}
