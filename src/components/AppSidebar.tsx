import { Link, useLocation } from "@tanstack/react-router";
import { useAuth, type UserRole } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { motion } from "framer-motion";
import {
  BarChart3,
  ChefHat,
  ShoppingCart,
  Leaf,
  LogOut,
  Recycle,
} from "lucide-react";
import { Sheet, SheetContent } from "./ui/sheet";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

interface SidebarPanelProps {
  onNavigate?: () => void;
  className?: string;
}

function SidebarPanel({ onNavigate, className }: SidebarPanelProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t, lang, setLang } = useLang();

  if (!user) return null;

  const NAV_ITEMS: Record<UserRole, { to: string; label: string; icon: React.ReactNode }[]> = {
    gerente: [
      { to: "/dashboard", label: t.dashboard, icon: <BarChart3 size={20} /> },
      { to: "/produccion", label: t.produccion, icon: <ChefHat size={20} /> },
      { to: "/compras", label: t.compras, icon: <ShoppingCart size={20} /> },
      { to: "/sostenibilidad", label: t.sostenibilidad, icon: <Leaf size={20} /> },
    ],
    cocina: [
      { to: "/produccion", label: t.produccion, icon: <ChefHat size={20} /> },
    ],
    compras: [
      { to: "/compras", label: t.compras, icon: <ShoppingCart size={20} /> },
    ],
    sostenibilidad: [
      { to: "/dashboard", label: t.dashboard, icon: <BarChart3 size={20} /> },
      { to: "/sostenibilidad", label: t.sostenibilidad, icon: <Leaf size={20} /> },
    ],
  };

  const items = NAV_ITEMS[user.role];

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="flex shrink-0 items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary">
          <Recycle size={22} className="text-sidebar-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight">FullCycle</p>
          <p className="text-xs text-sidebar-foreground/60">Solutions</p>
        </div>
        <button
          type="button"
          onClick={() => setLang(lang === "es" ? "en" : "es")}
          className="ml-auto shrink-0 rounded-md border border-sidebar-border px-2 py-1 text-xs font-semibold text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {lang === "es" ? "EN" : "ES"}
        </button>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-2">
        {items.map((item, i) => {
          const active = location.pathname === item.to;
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + i * 0.05 }}
            >
              <Link
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-lg bg-sidebar-accent"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex min-w-0 items-center gap-3">
                  <span className="shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border px-4 py-4">
        <div className="mb-3 px-2">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="text-xs capitalize text-sidebar-foreground/50">{user.role}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            logout();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="truncate">{t.cerrarSesion}</span>
        </button>
      </div>
    </div>
  );
}

export function AppSidebar({ mobileOpen = false, onMobileOpenChange }: AppSidebarProps) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      <motion.aside
        initial={{ x: -264, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="hidden h-full w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex"
      >
        <SidebarPanel />
      </motion.aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          className="w-[min(18rem,88vw)] max-w-xs border-sidebar-border bg-sidebar p-0 text-sidebar-foreground [&>button]:text-sidebar-foreground/70"
        >
          <SidebarPanel onNavigate={() => onMobileOpenChange?.(false)} className="pt-2" />
        </SheetContent>
      </Sheet>
    </>
  );
}
