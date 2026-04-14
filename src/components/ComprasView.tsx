import { motion } from "framer-motion";
import { ShoppingCart, AlertTriangle, Package, Download } from "lucide-react";
import { inventario, pedidoSugerido } from "@/lib/mock-data";
import { StatCard } from "./StatCard";
import { Button } from "./ui/button";
import { useState } from "react";

export function ComprasView() {
  const criticos = inventario.filter((i) => i.estado === "critico").length;
  const [descargando, setDescargando] = useState(false);

  const handleDescargar = () => {
    setDescargando(true);
    setTimeout(() => {
      const csv = "SKU,Nombre,Cantidad Actual,Cantidad a Pedir,Unidad\n" +
        pedidoSugerido.map((p) => `${p.sku},${p.nombre},${p.cantidadActual},${p.cantidadPedir},${p.unidad}`).join("\n");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Compras</h1>
        <p className="text-sm text-muted-foreground">Inventario actual y pedidos sugeridos</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Productos en inventario" value={inventario.length.toString()} icon={<Package size={20} />} />
        <StatCard title="Alertas críticas" value={criticos.toString()} icon={<AlertTriangle size={20} />} variant="warning" />
        <StatCard title="Pedidos pendientes" value={pedidoSugerido.length.toString()} icon={<ShoppingCart size={20} />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="text-sm font-semibold">Inventario Actual</h3>
          </div>
          <div className="grid grid-cols-5 gap-2 border-b px-5 py-2 text-xs font-semibold text-muted-foreground">
            <span>SKU</span>
            <span>Nombre</span>
            <span>Stock</span>
            <span>Mínimo</span>
            <span>Estado</span>
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
                  {item.estado === "critico" ? "Crítico" : "OK"}
                </span>
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="text-sm font-semibold">Pedido Sugerido</h3>
            <Button size="sm" variant="outline" onClick={handleDescargar} disabled={descargando}>
              <Download size={14} className="mr-1" />
              {descargando ? "Generando..." : "Descargar CSV"}
            </Button>
          </div>
          <div className="grid grid-cols-5 gap-2 border-b px-5 py-2 text-xs font-semibold text-muted-foreground">
            <span>SKU</span>
            <span>Nombre</span>
            <span>Actual</span>
            <span>A pedir</span>
            <span>Unidad</span>
          </div>
          {pedidoSugerido.map((item, i) => (
            <motion.div
              key={item.sku}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-5 gap-2 border-b px-5 py-2.5 text-sm last:border-0"
            >
              <span className="font-mono text-xs text-muted-foreground">{item.sku}</span>
              <span className="font-medium">{item.nombre}</span>
              <span className="text-destructive">{item.cantidadActual}</span>
              <span className="font-semibold text-primary">{item.cantidadPedir}</span>
              <span className="text-muted-foreground">{item.unidad}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
