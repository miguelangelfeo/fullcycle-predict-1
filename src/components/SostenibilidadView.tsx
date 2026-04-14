import { motion } from "framer-motion";
import { Leaf, TreePine, Car, Target, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatCard } from "./StatCard";
import { impactoAmbiental, impactoSemanal } from "@/lib/mock-data";

export function SostenibilidadView() {
  const { comidaRescatada, co2Evitado, metanoEvitado, reduccionPorcentual, metaReduccion, equivalencias } = impactoAmbiental;
  const metaCumplida = reduccionPorcentual >= metaReduccion;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reporte de Sostenibilidad</h1>
        <p className="text-sm text-muted-foreground">Impacto ambiental y progreso hacia el ODS 2: Hambre Cero</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Comida rescatada" value={`${comidaRescatada} kg`} icon={<Leaf size={20} />} variant="success" />
        <StatCard title="CO₂ evitado" value={`${co2Evitado} kg`} icon={<TreePine size={20} />} />
        <StatCard title="Metano evitado" value={`${metanoEvitado} kg`} icon={<TrendingDown size={20} />} />
        <StatCard
          title="Meta de reducción"
          value={`${reduccionPorcentual}%`}
          subtitle={`Meta: ${metaReduccion}%`}
          icon={<Target size={20} />}
          variant={metaCumplida ? "success" : "warning"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Comida Rescatada por Semana (kg)</h3>
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
            <h3 className="mb-4 text-sm font-semibold">Progreso hacia la Meta</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reducción actual</span>
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
              <p className="text-xs text-muted-foreground">Meta: {metaReduccion}% — {metaCumplida ? "✅ Meta cumplida" : "En progreso"}</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">Equivalencias Ambientales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-lg bg-success/5 p-3">
                <TreePine size={24} className="text-success" />
                <div>
                  <p className="text-lg font-bold">{equivalencias.arboles}</p>
                  <p className="text-xs text-muted-foreground">árboles plantados equiv.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3">
                <Car size={24} className="text-primary" />
                <div>
                  <p className="text-lg font-bold">{equivalencias.viajesAuto.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">km en auto evitados</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
