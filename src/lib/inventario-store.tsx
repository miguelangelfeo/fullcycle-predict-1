import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// ── Tipos ──────────────────────────────────────────────────────────────────────
export interface ProductoInventario {
  sku: string;
  nombre: string;
  stock: number;
  minimo: number;
  unidad: string;
}

export interface PedidoItem {
  sku: string;
  nombre: string;
  cantidadActual: number;
  cantidadPedir: number;
  unidad: string;
}

export type EstadoPedido = "pendiente" | "enviado" | "recibido" | "pagado";

export interface PagoInfo {
  referencia: string;
  monto: number;
  metodoPago: "transferencia" | "cheque" | "efectivo" | "tarjeta";
  proveedorNombre: string;
  proveedorEmail: string;
  fechaPago: string;
}

export interface RegistroDesperdicio {
  item: string;
  cantidad: number;
  fecha: string; // ISO date
}

interface InventarioState {
  /** Productos cargados del CSV */
  inventario: ProductoInventario[];
  /** Pedido sugerido (generado por analyzeData — lógica existente) */
  pedidoSugerido: PedidoItem[];
  /** Timestamp de la última carga */
  ultimaActualizacion: string | null;
  /** Estado de cada pedido (por SKU) */
  estadosPedido: Record<string, EstadoPedido>;
  /** Información de pago por SKU */
  pagosPorSku: Record<string, PagoInfo>;
  /** Registros de desperdicio diario (producción/cocina) */
  registrosDesperdicio: RegistroDesperdicio[];
}

interface InventarioContextType extends InventarioState {
  setInventario: (productos: ProductoInventario[], pedido: PedidoItem[]) => void;
  clearInventario: () => void;
  setEstadoPedido: (sku: string, estado: EstadoPedido) => void;
  registrarPago: (sku: string, pago: PagoInfo) => void;
  agregarDesperdicio: (registro: RegistroDesperdicio) => void;
  tieneDataReal: boolean;
}

// ── Constantes ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = "fc_inventario";

const INITIAL_STATE: InventarioState = {
  inventario: [],
  pedidoSugerido: [],
  ultimaActualizacion: null,
  estadosPedido: {},
  pagosPorSku: {},
  registrosDesperdicio: [],
};

// ── Helpers de localStorage ────────────────────────────────────────────────────
function loadFromStorage(): InventarioState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as Partial<InventarioState>;
    return { ...INITIAL_STATE, ...parsed };
  } catch {
    return INITIAL_STATE;
  }
}

function saveToStorage(state: InventarioState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage lleno o no disponible — silenciar
  }
}

// ── Context ────────────────────────────────────────────────────────────────────
const InventarioContext = createContext<InventarioContextType | null>(null);

export function InventarioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InventarioState>(INITIAL_STATE);

  // Hidratar desde localStorage al montar
  useEffect(() => {
    setState(loadFromStorage());
  }, []);

  // Persistir cada cambio (excepto la carga inicial)
  useEffect(() => {
    if (state.ultimaActualizacion !== null || state.registrosDesperdicio.length > 0) {
      saveToStorage(state);
    }
  }, [state]);

  const setInventario = (productos: ProductoInventario[], pedido: PedidoItem[]) => {
    setState((prev) => ({
      ...prev,
      inventario: productos,
      pedidoSugerido: pedido,
      ultimaActualizacion: new Date().toISOString(),
    }));
  };

  const clearInventario = () => {
    setState(INITIAL_STATE);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  };

  const setEstadoPedido = (sku: string, estado: EstadoPedido) => {
    setState((prev) => ({
      ...prev,
      estadosPedido: { ...prev.estadosPedido, [sku]: estado },
    }));
  };

  const registrarPago = (sku: string, pago: PagoInfo) => {
    setState((prev) => ({
      ...prev,
      estadosPedido: { ...prev.estadosPedido, [sku]: "pagado" },
      pagosPorSku: { ...prev.pagosPorSku, [sku]: pago },
    }));
  };

  const agregarDesperdicio = (registro: RegistroDesperdicio) => {
    setState((prev) => ({
      ...prev,
      registrosDesperdicio: [...prev.registrosDesperdicio, registro],
    }));
  };

  const tieneDataReal = state.inventario.length > 0;

  return (
    <InventarioContext.Provider
      value={{ ...state, setInventario, clearInventario, setEstadoPedido, registrarPago, agregarDesperdicio, tieneDataReal }}
    >
      {children}
    </InventarioContext.Provider>
  );
}

export function useInventario() {
  const ctx = useContext(InventarioContext);
  if (!ctx) throw new Error("useInventario debe estar dentro de InventarioProvider");
  return ctx;
}
