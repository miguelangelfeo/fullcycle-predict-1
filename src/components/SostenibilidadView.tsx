import { motion } from "framer-motion";
import { Leaf, TreePine, Car, Target, TrendingDown, Database, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatCard } from "./StatCard";
import { impactoAmbiental, impactoSemanal } from "@/lib/mock-data";
import { useLang } from "@/lib/lang-context";
import { useInventario, useInventarioSync } from "@/lib/inventario-store";

export function SostenibilidadView() {
  const { t } = useLang();
  const { registrosDesperdicio } = useInventario();
  useInventarioSync(); // Auto-actualiza cuando Produccion registra desperdicio

  // Si hay registros reales de desperdicio, calcular métricas reales
  // Factor: 2.6 kg CO2 evitado por kg de comida rescatada (WRAP/FAO)
  const CO2_FACTOR = 2.6;
  const METANO_FACTOR = 0.15;
  const totalDesperdicioReal = registrosDesperdicio.reduce((s, r) => s + r.cantidad, 0);
  const tieneDataReal = registrosDesperdicio.length > 0;

  const comidaRescatada = tieneDataReal ? totalDesperdicioReal : impactoAmbiental.comidaRescatada;
  const co2Evitado = tieneDataReal ? Math.round(totalDesperdicioReal * CO2_FACTOR) : impactoAmbiental.co2Evitado;
  const metanoEvitado = tieneDataReal ? Math.round(totalDesperdicioReal * METANO_FACTOR) : impactoAmbiental.metanoEvitado;

  const { reduccionPorcentual, metaReduccion, equivalencias } = impactoAmbiental;
  const metaCumplida = reduccionPorcentual >= metaReduccion;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.sostenibilidadTitle}</h1>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-sm text-muted-foreground">{t.sostenibilidadSub}</p>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tieneDataReal ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
            <Database size={10} />
            {tieneDataReal ? (t.datosCargados ?? "Datos cargados") : (t.datosDemo ?? "Datos de ejemplo")}
          </span>
        </div>
        
        {/* Leyenda de colores */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
          <span className="font-semibold text-muted-foreground">{t.leyendaColores}:</span>
          <div className="flex items-center gap-1.5 text-success">
            <div className="h-2 w-2 rounded-full bg-success"></div>
            {t.leyendaVerde}
          </div>
          <div className="flex items-center gap-1.5 text-warning">
            <div className="h-2 w-2 rounded-full bg-warning"></div>
            {t.leyendaAmarillo}
          </div>
          <div className="flex items-center gap-1.5 text-destructive">
            <div className="h-2 w-2 rounded-full bg-destructive"></div>
            {t.leyendaRojo}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t.comidaRescatada} value={`${comidaRescatada} kg`} icon={<Leaf size={20} />} variant="success" />
        <StatCard title={t.co2Evitado} value={`${co2Evitado} kg`} icon={<TreePine size={20} />} tooltip={t.co2Tooltip} />
        <StatCard title={t.metanoEvitado} value={`${metanoEvitado} kg`} icon={<TrendingDown size={20} />} />
        <StatCard
          title={t.metaReduccion}
          value={`${reduccionPorcentual}%`}
          subtitle={`${t.meta}: ${metaReduccion}% — ${metaCumplida ? t.cumpliendoMeta : t.noCumpliendoMeta}`}
          icon={<Target size={20} />}
          variant={metaCumplida ? "success" : "warning"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">{t.comidaRescatadaSem}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={impactoSemanal}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="semana" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="rescatadoKg" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} name="Rescatado (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">{t.progresoMeta}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.reduccionActual}</span>
                <span className="font-bold">{reduccionPorcentual}%</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((reduccionPorcentual / metaReduccion) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground">{t.meta}: {metaReduccion}% — {metaCumplida ? t.metaCumplida : t.enProgreso}</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">{t.equivalenciasAmbientales}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-lg bg-success/5 p-3">
                <TreePine size={24} className="text-success" />
                <div>
                  <p className="text-lg font-bold">{equivalencias.arboles}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    {t.arboles}
                    <span title={t.arbolesTooltip} className="inline-flex items-center cursor-help">
                      <Info size={12} />
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3">
                <Car size={24} className="text-primary" />
                <div>
                  <p className="text-lg font-bold">{equivalencias.viajesAuto.toLocaleString()}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    {t.kmAuto}
                    <span title={t.autoTooltip} className="inline-flex items-center cursor-help">
                      <Info size={12} />
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
