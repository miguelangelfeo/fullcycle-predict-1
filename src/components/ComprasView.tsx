import { motion } from "framer-motion";
import { ShoppingCart, AlertTriangle, Package, Download, Database } from "lucide-react";
import { inventario as mockInventario, pedidoSugerido as mockPedido } from "@/lib/mock-data";
import { StatCard } from "./StatCard";
import { Button } from "./ui/button";
import { DocumentUploader } from "./DocumentUploader";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { useLang } from "@/lib/lang-context";
import { useInventario } from "@/lib/inventario-store";

export function ComprasView() {
  const { user } = useAuth();
  const { t } = useLang();
  const { inventario: invReal, pedidoSugerido: pedidoReal, tieneDataReal, estadosPedido, setEstadoPedido } = useInventario();
  const [descargando, setDescargando] = useState(false);
  const canUpload = user && ["gerente", "compras"].includes(user.role);

  // Usar datos reales si hay, sino mock
  const inventario = tieneDataReal
    ? invReal.map((p) => ({ ...p, estado: (p.stock < p.minimo ? "critico" : "ok") as "critico" | "ok" }))
    : mockInventario;
  const pedido = tieneDataReal ? pedidoReal : mockPedido;
  const criticos = inventario.filter((i) => i.estado === "critico").length;

  const siguienteEstado = (sku: string) => {
    const actual = estadosPedido[sku] || "pendiente";
    if (actual === "pendiente") setEstadoPedido(sku, "enviado");
    else if (actual === "enviado") setEstadoPedido(sku, "recibido");
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

  const estadoBadge = (sku: string) => {
    const estado = estadosPedido[sku] || "pendiente";
    const styles = {
      pendiente: "bg-warning/10 text-warning",
      enviado: "bg-primary/10 text-primary",
      recibido: "bg-success/10 text-success",
    };
    const labels = {
      pendiente: t.pendiente ?? "Pendiente",
      enviado: t.enviado ?? "Enviado",
      recibido: t.recibido ?? "Recibido",
    };
    return (
      <button
        onClick={() => siguienteEstado(sku)}
        disabled={estado === "recibido"}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${styles[estado]} ${estado !== "recibido" ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
      >
        {labels[estado]}
      </button>
    );
  };

  return (
    <div className="space-y-6">
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

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title={t.productosInventario} value={inventario.length.toString()} icon={<Package size={20} />} />
        <StatCard title={t.alertasCriticas} value={criticos.toString()} icon={<AlertTriangle size={20} />} variant="warning" />
        <StatCard title={t.pedidosPendientes} value={pedido.length.toString()} icon={<ShoppingCart size={20} />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="text-sm font-semibold">{t.inventarioActual}</h3>
          </div>
          <div className="grid grid-cols-5 gap-2 border-b px-5 py-2 text-xs font-semibold text-muted-foreground">
            <span>{t.sku}</span>
            <span>{t.nombre}</span>
            <span>{t.stock}</span>
            <span>{t.minimo}</span>
            <span>{t.estado}</span>
          </div>
          {inventario.map((item, i) => (
            <motion.div
              key={item.sku}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="grid grid-cols-5 gap-2 border-b px-5 py-2.5 text-sm last:border-0"
            >
              <span className="font-mono text-xs text-muted-foreground">{item.sku}</span>
              <span className="font-medium">{item.nombre}</span>
              <span>{item.stock} {item.unidad}</span>
              <span className="text-muted-foreground">{item.minimo} {item.unidad}</span>
              <span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  item.estado === "critico" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                }`}>
                  {item.estado === "critico" && <AlertTriangle size={12} />}
                  {item.estado === "critico" ? t.critico : "OK"}
                </span>
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="text-sm font-semibold">{t.pedidoSugerido}</h3>
            <Button size="sm" variant="outline" onClick={handleDescargar} disabled={descargando}>
              <Download size={14} className="mr-1" />
              {descargando ? t.generando : t.descargarCSV}
            </Button>
          </div>
          <div className="grid grid-cols-6 gap-2 border-b px-5 py-2 text-xs font-semibold text-muted-foreground">
            <span>{t.sku}</span>
            <span>{t.nombre}</span>
            <span>{t.actual}</span>
            <span>{t.aPedir}</span>
            <span>{t.unidad}</span>
            <span>{t.estado}</span>
          </div>
          {pedido.map((item, i) => (
            <motion.div
              key={item.sku}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-6 gap-2 border-b px-5 py-2.5 text-sm last:border-0"
            >
              <span className="font-mono text-xs text-muted-foreground">{item.sku}</span>
              <span className="font-medium">{item.nombre}</span>
              <span className="text-destructive">{item.cantidadActual}</span>
              <span className="font-semibold text-primary">{item.cantidadPedir}</span>
              <span className="text-muted-foreground">{item.unidad}</span>
              <span>{estadoBadge(item.sku)}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

