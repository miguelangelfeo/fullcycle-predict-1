import { motion } from "framer-motion";
import {
  ShoppingCart, AlertTriangle, Package, Download, Database,
  CreditCard, CheckCircle2, History, Mail, Building2, ChevronRight,
  Clock, Send, Inbox,
} from "lucide-react";
import { inventario as mockInventario, pedidoSugerido as mockPedido, proveedores } from "@/lib/mock-data";
import { StatCard } from "./StatCard";
import { Button } from "./ui/button";
import { DocumentUploader } from "./DocumentUploader";
import { PagoModal } from "./PagoModal";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { useLang } from "@/lib/lang-context";
import { useInventario, type PedidoItem, type EstadoPedido } from "@/lib/inventario-store";

// Orden de progreso de estados
const ORDEN_ESTADOS: EstadoPedido[] = ["pendiente", "enviado", "recibido", "pagado"];

const ESTADO_ICON: Record<EstadoPedido, React.ReactNode> = {
  pendiente: <Clock size={13} />,
  enviado:   <Send size={13} />,
  recibido:  <Inbox size={13} />,
  pagado:    <CheckCircle2 size={13} />,
};

export function ComprasView() {
  const { user } = useAuth();
  const { t } = useLang();
  const {
    inventario: invReal, pedidoSugerido: pedidoReal,
    tieneDataReal, estadosPedido, pagosPorSku, setEstadoPedido,
  } = useInventario();
  const [descargando, setDescargando] = useState(false);
  const [pagoItem, setPagoItem] = useState<PedidoItem | null>(null);
  const canUpload = user && ["gerente", "compras"].includes(user.role);

  const inventario = tieneDataReal
    ? invReal.map((p) => ({ ...p, estado: (p.stock < p.minimo ? "critico" : "ok") as "critico" | "ok" }))
    : mockInventario;
  const pedido = tieneDataReal ? pedidoReal : mockPedido;
  const criticos = inventario.filter((i) => i.estado === "critico").length;

  // Para demo sin datos reales: mostrar INS-002 como "recibido" si no hay estado guardado
  const getEstado = (sku: string): EstadoPedido => {
    if (estadosPedido[sku]) return estadosPedido[sku];
    if (!tieneDataReal && sku === "INS-002") return "recibido";
    return "pendiente";
  };

  const avanzarEstado = (sku: string) => {
    const actual = getEstado(sku);
    const idx = ORDEN_ESTADOS.indexOf(actual);
    if (idx < 2) setEstadoPedido(sku, ORDEN_ESTADOS[idx + 1] as EstadoPedido);
  };

  const handleDescargar = () => {
    setDescargando(true);
    setTimeout(() => {
      const csv = "SKU,Nombre,Cantidad Actual,Cantidad a Pedir,Unidad\n" +
        pedido.map((p) => `${p.sku},${p.nombre},${p.cantidadActual},${p.cantidadPedir},${p.unidad}`).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pedido_sugerido.csv";
      a.click();
      URL.revokeObjectURL(url);
      setDescargando(false);
    }, 800);
  };

  // Contadores para StatCards
  const pendientesPago = pedido.filter((p) => getEstado(p.sku) === "recibido").length;
  const totalPagados = Object.keys(pagosPorSku).length;

  const estadoStyles: Record<EstadoPedido, string> = {
    pendiente: "bg-warning/10 text-warning border-warning/20",
    enviado:   "bg-primary/10 text-primary border-primary/20",
    recibido:  "bg-success/10 text-success border-success/20",
    pagado:    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  };
  const estadoLabels: Record<EstadoPedido, string> = {
    pendiente: t.pendiente ?? "Pendiente",
    enviado:   t.enviado   ?? "Enviado",
    recibido:  t.recibido  ?? "Recibido",
    pagado:    t.pagado    ?? "Pagado",
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.comprasTitle}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-muted-foreground">{t.comprasSub}</p>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tieneDataReal ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
              <Database size={10} />
              {tieneDataReal ? (t.datosCargados ?? "Datos cargados") : (t.datosDemo ?? "Datos de ejemplo")}
            </span>
          </div>
        </div>
        {canUpload && <DocumentUploader />}
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title={t.productosInventario}  value={inventario.length.toString()} icon={<Package size={20} />} />
        <StatCard title={t.alertasCriticas}       value={criticos.toString()}           icon={<AlertTriangle size={20} />} variant="warning" />
        <StatCard title={t.pedidosPendientes}     value={pedido.length.toString()}      icon={<ShoppingCart size={20} />} />
        <StatCard
          title={t.pagosPendientes ?? "Pagos pendientes"}
          value={pendientesPago.toString()}
          icon={<CreditCard size={20} />}
          variant={pendientesPago > 0 ? "warning" : undefined}
        />
      </div>

      {/* ── Inventario + Pedido sugerido ───────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inventario */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card">
          <div className="border-b px-5 py-3">
            <h3 className="text-sm font-semibold">{t.inventarioActual}</h3>
          </div>
          <div className="grid grid-cols-5 gap-2 border-b px-5 py-2 text-xs font-semibold text-muted-foreground">
            <span>{t.sku}</span><span>{t.nombre}</span><span>{t.stock}</span><span>{t.minimo}</span><span>{t.estado}</span>
          </div>
          {inventario.map((item, i) => (
            <motion.div key={item.sku} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className="grid grid-cols-5 gap-2 border-b px-5 py-2.5 text-sm last:border-0">
              <span className="font-mono text-xs text-muted-foreground">{item.sku}</span>
              <span className="font-medium">{item.nombre}</span>
              <span>{item.stock} {item.unidad}</span>
              <span className="text-muted-foreground">{item.minimo} {item.unidad}</span>
              <span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  item.estado === "critico" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                  {item.estado === "critico" && <AlertTriangle size={12} />}
                  {item.estado === "critico" ? t.critico : "OK"}
                </span>
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Pedido sugerido */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="text-sm font-semibold">{t.pedidoSugerido}</h3>
            <Button size="sm" variant="outline" onClick={handleDescargar} disabled={descargando}>
              <Download size={14} className="mr-1" />
              {descargando ? t.generando : t.descargarCSV}
            </Button>
          </div>
          <div className="grid grid-cols-6 gap-2 border-b px-5 py-2 text-xs font-semibold text-muted-foreground">
            <span>{t.sku}</span><span>{t.nombre}</span><span>{t.actual}</span>
            <span>{t.aPedir}</span><span>{t.unidad}</span><span>{t.estado}</span>
          </div>
          {pedido.map((item, i) => {
            const estado = getEstado(item.sku);
            const clickable = estado === "pendiente" || estado === "enviado";
            return (
              <motion.div key={item.sku} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="grid grid-cols-6 gap-2 border-b px-5 py-2.5 text-sm last:border-0 items-center">
                <span className="font-mono text-xs text-muted-foreground">{item.sku}</span>
                <span className="font-medium">{item.nombre}</span>
                <span className="text-destructive">{item.cantidadActual}</span>
                <span className="font-semibold text-primary">{item.cantidadPedir}</span>
                <span className="text-muted-foreground">{item.unidad}</span>
                <button
                  onClick={() => clickable && avanzarEstado(item.sku)}
                  disabled={!clickable}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-opacity ${estadoStyles[estado]} ${clickable ? "cursor-pointer hover:opacity-70" : "cursor-default"}`}
                  title={clickable ? "Clic para avanzar estado" : undefined}
                >
                  {ESTADO_ICON[estado]}
                  {estadoLabels[estado]}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* ── Pagos a Proveedores ────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border bg-card">
        <div className="flex items-center gap-2 border-b px-5 py-3">
          <CreditCard size={16} className="text-primary" />
          <h3 className="text-sm font-semibold">{t.pagosTitulo ?? "Pagos a Proveedores"}</h3>
          {pendientesPago > 0 && (
            <span className="ml-auto inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
              {pendientesPago} {t.pendiente ?? "pendiente"}{pendientesPago > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="divide-y">
          {pedido.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-muted-foreground">{t.sinPedidos ?? "Sin pedidos"}</p>
          ) : (
            pedido.map((item, i) => {
              const estado = getEstado(item.sku);
              const prov = proveedores.find((p) => p.skus.includes(item.sku)) ?? {
                nombre: "Proveedor General",
                email: "pagos@proveedor.com",
                telefono: "",
              };
              const pago = pagosPorSku[item.sku];

              return (
                <motion.div
                  key={item.sku}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  {/* Proveedor */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                    estado === "pagado" ? "border-emerald-500/30 bg-emerald-500/10" :
                    estado === "recibido" ? "border-primary/30 bg-primary/10" :
                    "border-muted bg-muted/40"}`}>
                    <Building2 size={18} className={estado === "pagado" ? "text-emerald-600" : estado === "recibido" ? "text-primary" : "text-muted-foreground"} />
                  </div>

                  {/* Info proveedor + item */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{prov.nombre}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail size={11} />
                      <span className="truncate">{prov.email}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.nombre} — {item.cantidadPedir} {item.unidad}
                    </p>
                  </div>

                  {/* Progreso de estados */}
                  <div className="hidden md:flex items-center gap-1">
                    {ORDEN_ESTADOS.map((s, idx) => {
                      const estadoIdx = ORDEN_ESTADOS.indexOf(estado);
                      const done = idx <= estadoIdx;
                      return (
                        <div key={s} className="flex items-center gap-1">
                          <div className={`h-2 w-2 rounded-full transition-colors ${done ? (s === "pagado" ? "bg-emerald-500" : "bg-primary") : "bg-muted"}`} />
                          {idx < ORDEN_ESTADOS.length - 1 && (
                            <div className={`h-0.5 w-4 transition-colors ${idx < estadoIdx ? (estado === "pagado" ? "bg-emerald-500/50" : "bg-primary/50") : "bg-muted"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Badge estado */}
                  <span className={`hidden sm:inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${estadoStyles[estado]}`}>
                    {ESTADO_ICON[estado]}
                    {estadoLabels[estado]}
                  </span>

                  {/* Acción */}
                  <div className="shrink-0">
                    {estado === "pendiente" && (
                      <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => avanzarEstado(item.sku)}>
                        <Send size={12} /> {t.marcarEnviado ?? "Marcar enviado"}
                        <ChevronRight size={12} />
                      </Button>
                    )}
                    {estado === "enviado" && (
                      <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => avanzarEstado(item.sku)}>
                        <Inbox size={12} /> {t.marcarRecibido ?? "Marcar recibido"}
                        <ChevronRight size={12} />
                      </Button>
                    )}
                    {estado === "recibido" && (
                      <Button
                        size="sm"
                        className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 shadow-sm animate-pulse"
                        onClick={() => setPagoItem(item)}
                      >
                        <CreditCard size={13} />
                        {t.pagarProveedor ?? "Pagar proveedor"}
                      </Button>
                    )}
                    {estado === "pagado" && pago && (
                      <div className="text-right">
                        <p className="text-xs font-semibold text-emerald-600">
                          ${pago.monto.toLocaleString("es-CO")} COP
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(pago.fechaPago).toLocaleDateString("es-CO")}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* ── Historial de pagos ─────────────────────────────────────────── */}
      {Object.keys(pagosPorSku).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-card">
          <div className="flex items-center gap-2 border-b px-5 py-3">
            <History size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold">{t.historialPagos ?? "Historial de Pagos"}</h3>
            <span className="ml-auto text-xs text-muted-foreground">
              {totalPagados} {t.pagado?.toLowerCase() ?? "pagado"}{totalPagados > 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2 border-b px-5 py-2 text-xs font-semibold text-muted-foreground">
            <span>{t.proveedor ?? "Proveedor"}</span>
            <span>{t.referencia ?? "Referencia"}</span>
            <span>{t.monto ?? "Monto"}</span>
            <span>{t.metodo ?? "Método"}</span>
            <span>{t.fechaPago ?? "Fecha"}</span>
          </div>
          {Object.entries(pagosPorSku).map(([sku, pago]) => (
            <div key={sku} className="grid grid-cols-5 gap-2 border-b px-5 py-3 text-sm last:border-0 items-center">
              <div>
                <p className="text-xs font-medium">{pago.proveedorNombre}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Mail size={10} /> {pago.proveedorEmail}
                </p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{pago.referencia}</span>
              <span className="font-semibold text-primary text-xs">${pago.monto.toLocaleString("es-CO")} COP</span>
              <span className="capitalize text-xs text-muted-foreground">{pago.metodoPago}</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span className="text-xs text-muted-foreground">
                  {new Date(pago.fechaPago).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {pagoItem && (
        <PagoModal item={pagoItem} open={!!pagoItem} onClose={() => setPagoItem(null)} />
      )}
    </div>
  );
}
