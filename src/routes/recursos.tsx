import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { AppSidebar } from "@/components/AppSidebar";
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
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        <RecursosView />
      </main>
    </div>
  );
}
