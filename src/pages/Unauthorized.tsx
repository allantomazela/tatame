import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <ShieldX className="mx-auto h-16 w-16 text-amber-500 dark:text-amber-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Acesso não autorizado
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Você não tem permissão para acessar esta página. Entre em contato com o administrador se acredita que isso é um erro.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
