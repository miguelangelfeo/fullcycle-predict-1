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

export function AppSidebar() {
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
    <motion.aside
      initial={{ x: -264, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground"
    >
      <div className="flex items-center gap-3 px-6 py-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary"
        >
          <Recycle size={22} className="text-sidebar-primary-foreground" />
        </motion.div>
        <div>
          <p className="text-sm font-bold tracking-tight">FullCycle</p>
          <p className="text-xs text-sidebar-foreground/60">Solutions</p>
        </div>
        <button
          onClick={() => setLang(lang === "es" ? "en" : "es")}
          className="ml-auto rounded-md border border-sidebar-border px-2 py-1 text-xs font-semibold text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          {lang === "es" ? "EN" : "ES"}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item, i) => {
          const active = location.pathname === item.to;
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
            >
              <Link
                to={item.to}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-lg bg-sidebar-accent"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="border-t border-sidebar-border px-4 py-4"
      >
        <div className="mb-3 px-2">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs capitalize text-sidebar-foreground/50">{user.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut size={18} />
          {t.cerrarSesion}
        </button>
      </motion.div>
    </motion.aside>
  );
}

