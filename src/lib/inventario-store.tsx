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
  estado?: "registrado" | "donado";
}

/** SKUs que acaban de ser pagados/adquiridos (para badge especial en inventario) */
export type SkusRecienAdquiridos = Record<string, boolean>;

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
  /** SKUs recién adquiridos tras un pago (se muestra badge especial en inventario) */
  skusRecienAdquiridos: SkusRecienAdquiridos;
}

interface InventarioContextType extends InventarioState {
  setInventario: (productos: ProductoInventario[], pedido: PedidoItem[]) => void;
  clearInventario: () => void;
  setEstadoPedido: (sku: string, estado: EstadoPedido) => void;
  registrarPago: (
    sku: string,
    pago: PagoInfo,
    cantidadAdquirida?: number,
    inventarioBase?: ProductoInventario[],
    pedidoBase?: PedidoItem[],
  ) => void;
  agregarDesperdicio: (registro: RegistroDesperdicio) => void;
  donarDesperdicioHoy: () => void;
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
  skusRecienAdquiridos: {},
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

// ── Sistema de listeners para sincronización automática ──────────────────────
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

// ── Context ────────────────────────────────────────────────────────────────────
const InventarioContext = createContext<InventarioContextType | null>(null);

export function InventarioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InventarioState>(INITIAL_STATE);

  // Hidratar desde localStorage al montar
  useEffect(() => {
    setState(loadFromStorage());
  }, []);

  // Persistir cada cambio (excepto la carga inicial) y notificar listeners
  useEffect(() => {
    if (state.ultimaActualizacion !== null || state.registrosDesperdicio.length > 0) {
      saveToStorage(state);
    }
    notifyListeners();
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

  const registrarPago = (
    sku: string,
    pago: PagoInfo,
    cantidadAdquirida?: number,
    inventarioBase?: ProductoInventario[],
    pedidoBase?: PedidoItem[],
  ) => {
    setState((prev) => {
      // En modo demo, si el inventario del store está vacío, sembramos el base
      const invActual = prev.inventario.length > 0 ? prev.inventario : (inventarioBase ?? []);
      const pedActual = prev.pedidoSugerido.length > 0 ? prev.pedidoSugerido : (pedidoBase ?? []);

      // Cantidad a añadir al stock
      const cantidadPedida = cantidadAdquirida ??
        pedActual.find((p) => p.sku === sku)?.cantidadPedir ?? 0;

      // Actualizar stock del producto pagado
      const inventarioActualizado = invActual.map((prod) => {
        if (prod.sku !== sku) return prod;
        return { ...prod, stock: prod.stock + cantidadPedida };
      });

      return {
        ...prev,
        inventario: inventarioActualizado,
        pedidoSugerido: pedActual,
        ultimaActualizacion: prev.ultimaActualizacion ?? new Date().toISOString(),
        estadosPedido: { ...prev.estadosPedido, [sku]: "pagado" },
        pagosPorSku: { ...prev.pagosPorSku, [sku]: pago },
        skusRecienAdquiridos: { ...prev.skusRecienAdquiridos, [sku]: true },
      };
    });
  };

  const agregarDesperdicio = (registro: RegistroDesperdicio) => {
    setState((prev) => ({
      ...prev,
      registrosDesperdicio: [...prev.registrosDesperdicio, { ...registro, estado: "registrado" }],
    }));
  };

  const donarDesperdicioHoy = () => {
    setState((prev) => {
      const hoy = new Date().toISOString().slice(0, 10);
      const actualizados = prev.registrosDesperdicio.map((r) => {
        if (r.fecha === hoy) {
          return { ...r, estado: "donado" as const };
        }
        return r;
      });
      return {
        ...prev,
        registrosDesperdicio: actualizados,
      };
    });
  };

  const tieneDataReal = state.inventario.length > 0;

  return (
    <InventarioContext.Provider
      value={{
        ...state,
        setInventario,
        clearInventario,
        setEstadoPedido,
        registrarPago,
        agregarDesperdicio,
        donarDesperdicioHoy,
        tieneDataReal,
      }}
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

/**
 * Hook de sincronización automática para vistas que necesitan actualizarse
 * cuando otras secciones (Compras, Produccion) hacen cambios al inventario.
 * 
 * Uso en Dashboard, SostenibilidadView, etc.:
 * ```tsx
 * const { inventario, registrosDesperdicio } = useInventario();
 * useInventarioSync(); // se suscribe a cambios automáticamente
 * ```
 */
export function useInventarioSync() {
  const [, forceUpdate] = useState<number>(0);
  
  useEffect(() => {
    // Crear un handler que fuerza re-render cuando el inventario cambia
    const handler = () => {
      forceUpdate((prev) => prev + 1);
    };
    
    listeners.add(handler);
    
    return () => {
      listeners.delete(handler);
    };
  }, []);
}
