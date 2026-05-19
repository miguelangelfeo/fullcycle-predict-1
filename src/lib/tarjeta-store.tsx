import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type MarcaTarjeta = "visa" | "mastercard" | "amex" | "otro";

export interface TarjetaGuardada {
  id: string;
  titular: string;
  ultimos4: string;
  marca: MarcaTarjeta;
  mesVencimiento: string;  // "MM"
  anioVencimiento: string; // "YY"
  esPrincipal: boolean;
}

interface TarjetaState {
  tarjetas: TarjetaGuardada[];
}

interface TarjetaContextType extends TarjetaState {
  agregarTarjeta: (t: Omit<TarjetaGuardada, "id">) => TarjetaGuardada;
  eliminarTarjeta: (id: string) => void;
  setPrincipal: (id: string) => void;
  tarjetaPrincipal: TarjetaGuardada | null;
}

const STORAGE_KEY = "fc_tarjetas";

const TarjetaContext = createContext<TarjetaContextType | null>(null);

function generarId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id-" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("") + "-" + Date.now();
}

export function TarjetaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TarjetaState>({ tarjetas: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* noop */ }
  }, [state]);

  const agregarTarjeta = (t: Omit<TarjetaGuardada, "id">): TarjetaGuardada => {
    const nueva: TarjetaGuardada = { ...t, id: generarId() };
    setState((prev) => {
      const tarjetas = t.esPrincipal
        ? [...prev.tarjetas.map((c) => ({ ...c, esPrincipal: false })), nueva]
        : [...prev.tarjetas, nueva];
      return { tarjetas };
    });
    return nueva;
  };

  const eliminarTarjeta = (id: string) => {
    setState((prev) => ({ tarjetas: prev.tarjetas.filter((t) => t.id !== id) }));
  };

  const setPrincipal = (id: string) => {
    setState((prev) => ({
      tarjetas: prev.tarjetas.map((t) => ({ ...t, esPrincipal: t.id === id })),
    }));
  };

  const tarjetaPrincipal = state.tarjetas.find((t) => t.esPrincipal) ?? state.tarjetas[0] ?? null;

  return (
    <TarjetaContext.Provider value={{ ...state, agregarTarjeta, eliminarTarjeta, setPrincipal, tarjetaPrincipal }}>
      {children}
    </TarjetaContext.Provider>
  );
}

export function useTarjeta() {
  const ctx = useContext(TarjetaContext);
  if (!ctx) throw new Error("useTarjeta debe estar dentro de TarjetaProvider");
  return ctx;
}

// ── Helpers de detección de marca ────────────────────────────────────────────
export function detectarMarca(numero: string): MarcaTarjeta {
  const n = numero.replace(/\s/g, "");
  if (n.startsWith("4")) return "visa";
  if (n.startsWith("5") || n.startsWith("2")) return "mastercard";
  if (n.startsWith("3")) return "amex";
  return "otro";
}

export function formatearNumeroTarjeta(valor: string, marca: MarcaTarjeta): string {
  const solo = valor.replace(/\D/g, "");
  if (marca === "amex") {
    // XXXX XXXXXX XXXXX
    return solo.slice(0, 4) +
      (solo.length > 4  ? " " + solo.slice(4, 10)  : "") +
      (solo.length > 10 ? " " + solo.slice(10, 15) : "");
  }
  // XXXX XXXX XXXX XXXX
  return solo.match(/.{1,4}/g)?.join(" ").slice(0, 19) ?? solo;
}

export function longitidMaxima(marca: MarcaTarjeta): number {
  return marca === "amex" ? 17 : 19; // con espacios
}
