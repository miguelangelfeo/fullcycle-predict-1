import { motion } from "framer-motion";
import { BarChart3, TrendingDown, DollarSign, Leaf, Database } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, LabelList } from "recharts";
import { StatCard } from "./StatCard";
import { consumoVsDesperdicioData, ahorroProyectadoData, statCardData, type PeriodKey } from "@/lib/mock-data";
import { useState } from "react";
import { useLang } from "@/lib/lang-context";
import { useInventario, useInventarioSync } from "@/lib/inventario-store";

export function DashboardView() {
  const { t } = useLang();
  const { inventario, tieneDataReal } = useInventario();
  useInventarioSync(); // Auto-actualiza cuando Compras registra pagos
  const FILTROS: { label: string; key: PeriodKey }[] = [
    { label: t.diario, key: "diario" },
    { label: t.semanal, key: "semanal" },
    { label: t.mensual, key: "mensual" },
  ];
  const [periodoKey, setPeriodoKey] = useState<PeriodKey>("semanal");

  const stats = statCardData[periodoKey];
  const barData = consumoVsDesperdicioData[periodoKey];
  const lineData = ahorroProyectadoData[periodoKey];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.dashboardTitle}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-muted-foreground">{t.dashboardSub}</p>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tieneDataReal ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
              <Database size={10} />
              {tieneDataReal ? (t.datosCargados ?? "Datos cargados") : (t.datosDemo ?? "Datos de ejemplo")}
            </span>
          </div>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {FILTROS.map((f) => (
            <button
              key={f.key}
              onClick={() => setPeriodoKey(f.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                periodoKey === f.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t.consumoTotal} value={stats.consumo} icon={<BarChart3 size={20} />} trend={{ value: 3.2, label: t.vsAnterior }} />
        <StatCard title={t.desperdicio} value={stats.desperdicio} subtitle={stats.desperdicioPct} icon={<TrendingDown size={20} />} trend={{ value: -8.5, label: t.reduccion }} variant="success" />
        <StatCard title={t.ahorroProyectado} value={stats.ahorro} subtitle={stats.ahorroSub} icon={<DollarSign size={20} />} trend={{ value: 17, label: t.vsAnteriorMes }} />
        <StatCard title={t.comidaRescatada} value={stats.rescatada} subtitle={t.acumuladoMes} icon={<Leaf size={20} />} variant="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div key={`bar-${periodoKey}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">{t.consumoVsDesperdicio}</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData} barGap={2} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="turno" 
                tick={{ fontSize: 10 }} 
                label={{ value: t.periodo ?? "Periodo", position: 'insideBottom', offset: -5, fontSize: 12, fill: "currentColor" }} 
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                label={{ value: "Cantidad (kg)", angle: -90, position: 'insideLeft', offset: -5, fontSize: 12, fill: "currentColor" }} 
              />
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ bottom: 0 }} />
              <Bar dataKey="consumo" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} name="Consumo">
                <LabelList dataKey="consumo" position="top" offset={6} fontSize={8} fill="currentColor" opacity={0.8} />
              </Bar>
              <Bar dataKey="desperdicio" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} name="Desperdicio">
                <LabelList dataKey="desperdicio" position="top" offset={6} fontSize={8} fill="currentColor" opacity={0.8} />
              </Bar>
              <Bar dataKey="meta" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} name="Meta">
                <LabelList dataKey="meta" position="top" offset={6} fontSize={8} fill="currentColor" opacity={0.8} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div key={`line-${periodoKey}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">{t.proyeccionAhorro}</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 11 }} 
                padding={{ left: 20, right: 20 }}
                label={{ value: t.tiempo ?? "Tiempo", position: 'insideBottom', offset: -5, fontSize: 12, fill: "currentColor" }} 
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fontSize: 11 }} 
                label={{ value: "Ahorro ($)", angle: -90, position: 'insideLeft', offset: -5, fontSize: 12, fill: "currentColor" }} 
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 11 }} 
                label={{ value: "Desperdicio (kg)", angle: 90, position: 'insideRight', offset: -5, fontSize: 12, fill: "currentColor" }} 
              />
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ bottom: 0 }} />
              <Line yAxisId="left" type="monotone" dataKey="ahorro" stroke="var(--color-chart-1)" strokeWidth={2} name="Ahorro ($)" dot={{ r: 4 }}>
                <LabelList dataKey="ahorro" position="bottom" offset={10} fontSize={8} fill="currentColor" opacity={0.8} formatter={(v: any) => `$${v}`} />
              </Line>
              <Line yAxisId="right" type="monotone" dataKey="desperdicioKg" stroke="var(--color-chart-3)" strokeWidth={2} name="Desperdicio (kg)" dot={{ r: 4 }}>
                <LabelList dataKey="desperdicioKg" position="top" offset={10} fontSize={8} fill="currentColor" opacity={0.8} formatter={(v: any) => `${v} kg`} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
