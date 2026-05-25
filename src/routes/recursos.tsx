import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";
import { RecursosView } from "@/components/RecursosView";

export const Route = createFileRoute("/recursos")({
  component: RecursosPage,
});

function RecursosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/" });
  }, [user, navigate]);

  if (!user) return null;

  return (
    <AppShell>
      <RecursosView />
    </AppShell>
  );
}
