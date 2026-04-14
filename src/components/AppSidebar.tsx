import { Link, useLocation } from "@tanstack/react-router";
import { useAuth, type UserRole } from "@/lib/auth-context";
import {
  BarChart3,
  ChefHat,
  ShoppingCart,
  Leaf,
  LogOut,
  Recycle,
} from "lucide-react";

const NAV_ITEMS: Record<UserRole, { to: string; label: string; icon: React.ReactNode }[]> = {
  gerente: [
    { to: "/dashboard", label: "Dashboard", icon: <BarChart3 size={20} /> },
    { to: "/produccion", label: "Producción", icon: <ChefHat size={20} /> },
    { to: "/compras", label: "Compras", icon: <ShoppingCart size={20} /> },
    { to: "/sostenibilidad", label: "Sostenibilidad", icon: <Leaf size={20} /> },
  ],
  cocina: [
    { to: "/produccion", label: "Producción", icon: <ChefHat size={20} /> },
  ],
  compras: [
    { to: "/compras", label: "Compras", icon: <ShoppingCart size={20} /> },
  ],
  sostenibilidad: [
    { to: "/dashboard", label: "Dashboard", icon: <BarChart3 size={20} /> },
    { to: "/sostenibilidad", label: "Sostenibilidad", icon: <Leaf size={20} /> },
  ],
};

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  if (!user) return null;

  const items = NAV_ITEMS[user.role];

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
          <Recycle size={22} className="text-sidebar-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight">FullCycle</p>
          <p className="text-xs text-sidebar-foreground/60">Solutions</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-4">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs capitalize text-sidebar-foreground/50">{user.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
