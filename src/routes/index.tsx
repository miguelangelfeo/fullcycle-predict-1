import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { LoginForm } from "@/components/LoginForm";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const defaultRoutes = {
        gerente: "/dashboard",
        cocina: "/produccion",
        compras: "/compras",
        sostenibilidad: "/dashboard",
      } as const;
      navigate({ to: defaultRoutes[user.role] });
    }
  }, [user, navigate]);

  return <LoginForm />;
}
