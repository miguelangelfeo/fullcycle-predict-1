import { motion } from "framer-motion";
import { ChefHat, AlertTriangle, CheckCircle2, ClipboardList } from "lucide-react";
import { produccionRecomendada } from "@/lib/mock-data";
import { StatCard } from "./StatCard";
import { useState } from "react";
import { useLang } from "@/lib/lang-context";
import { useInventario } from "@/lib/inventario-store";

export function ProduccionView() {
  const { t } = useLang();
  const { registrosDesperdicio, agregarDesperdicio } = useInventario();
  const [aceptados, setAceptados] = useState<Set<string>>(new Set());
  const [cantidades, setCantidades] = useState<Record<string, string>>({});
  const totalAhorro = produccionRecomendada.reduce((s, i) => s + (i.actual - i.recomendado), 0);

  const hoy = new Date().toISOString().slice(0, 10);
  const registrosHoy = registrosDesperdicio.filter((r) => r.fecha === hoy);
  const totalDesperdicioHoy = registrosHoy.reduce((s, r) => s + r.cantidad, 0);

  const toggleAceptar = (item: string) => {
    setAceptados((prev) => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  };

  const handleRegistrarDesperdicio = (item: string) => {
    const cantidad = parseFloat(cantidades[item] || "0");
    if (cantidad <= 0) return;
    agregarDesperdicio({ item, cantidad, fecha: hoy });
    setCantidades((prev) => ({ ...prev, [item]: "" }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.produccionTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.produccionSub}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title={t.reservasDia} value="187" icon={<ChefHat size={20} />} />
        <StatCard title={t.reduccionPotencial} value={`${totalAhorro} ${t.unidades}`} icon={<AlertTriangle size={20} />} variant="warning" />
        <StatCard title={t.itemsAceptados} value={`${aceptados.size}/${produccionRecomendada.length}`} icon={<CheckCircle2 size={20} />} variant="success" />
        <StatCard title={t.desperdicioRegistrado} value={`${totalDesperdicioHoy.toFixed(1)} kg`} icon={<ClipboardList size={20} />} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card">
        <div className="grid grid-cols-8 gap-4 border-b px-5 py-3 text-xs font-semibold text-muted-foreground">
          <span className="col-span-2">{t.item}</span>
          <span>{t.actual}</span>
          <span>{t.recomendado}</span>
          <span>{t.unidad}</span>
          <span>{t.confianza}</span>
          <span>{t.accion}</span>
          <span>{t.registrarDesperdicio}</span>
        </div>
        {produccionRecomendada.map((item, i) => (
          <motion.div
            key={item.item}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="grid grid-cols-8 gap-4 border-b px-5 py-3 text-sm last:border-0 items-center"
          >
            <span className="col-span-2 font-medium">{item.item}</span>
            <span className="text-muted-foreground">{item.actual}</span>
            <span className="font-semibold text-primary">{item.recomendado}</span>
            <span className="text-muted-foreground">{item.unidad}</span>
            <span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                item.confianza >= 93 ? "bg-success/10 text-success" : item.confianza >= 90 ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
              }`}>
                {item.confianza}%
              </span>
            </span>
            <span>
              <button
                onClick={() => toggleAceptar(item.item)}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                  aceptados.has(item.item)
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {aceptados.has(item.item) ? t.aceptado : t.aceptar}
              </button>
            </span>
            <span className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="kg"
                value={cantidades[item.item] || ""}
                onChange={(e) => setCantidades((prev) => ({ ...prev, [item.item]: e.target.value }))}
                className="w-16 rounded-md border bg-background px-2 py-1 text-xs"
              />
              <button
                onClick={() => handleRegistrarDesperdicio(item.item)}
                className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                +
              </button>
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Registros de hoy */}
      {registrosHoy.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card">
          <div className="border-b px-5 py-3">
            <h3 className="text-sm font-semibold">{t.registrosHoy} ({registrosHoy.length})</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 border-b px-5 py-2 text-xs font-semibold text-muted-foreground">
            <span>{t.item}</span>
            <span>{t.cantidadKg}</span>
            <span>{t.estado}</span>
          </div>
          {registrosHoy.map((r, i) => (
            <div key={`${r.item}-${i}`} className="grid grid-cols-3 gap-4 border-b px-5 py-2 text-sm last:border-0">
              <span className="font-medium">{r.item}</span>
              <span className="text-destructive">{r.cantidad} kg</span>
              <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                <CheckCircle2 size={12} /> {t.desperdicioRegistrado}
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

