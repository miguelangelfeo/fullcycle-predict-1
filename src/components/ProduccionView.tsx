import { motion } from "framer-motion";
import { ChefHat, AlertTriangle, CheckCircle2 } from "lucide-react";
import { produccionRecomendada } from "@/lib/mock-data";
import { StatCard } from "./StatCard";
import { useState } from "react";

export function ProduccionView() {
  const [aceptados, setAceptados] = useState<Set<string>>(new Set());
  const totalAhorro = produccionRecomendada.reduce((s, i) => s + (i.actual - i.recomendado), 0);

  const toggleAceptar = (item: string) => {
    setAceptados((prev) => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Recomendación de Producción</h1>
        <p className="text-sm text-muted-foreground">Cantidades sugeridas basadas en 187 reservas para hoy</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Reservas del día" value="187" icon={<ChefHat size={20} />} />
        <StatCard title="Reducción potencial" value={`${totalAhorro} unidades`} icon={<AlertTriangle size={20} />} variant="warning" />
        <StatCard title="Ítems aceptados" value={`${aceptados.size}/${produccionRecomendada.length}`} icon={<CheckCircle2 size={20} />} variant="success" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card">
        <div className="grid grid-cols-7 gap-4 border-b px-5 py-3 text-xs font-semibold text-muted-foreground">
          <span className="col-span-2">Ítem</span>
          <span>Actual</span>
          <span>Recomendado</span>
          <span>Unidad</span>
          <span>Confianza</span>
          <span>Acción</span>
        </div>
        {produccionRecomendada.map((item, i) => (
          <motion.div
            key={item.item}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="grid grid-cols-7 gap-4 border-b px-5 py-3 text-sm last:border-0"
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
                {aceptados.has(item.item) ? "✓ Aceptado" : "Aceptar"}
              </button>
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
