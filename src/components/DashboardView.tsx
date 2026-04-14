import { motion } from "framer-motion";
import { BarChart3, TrendingDown, DollarSign, Leaf } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { StatCard } from "./StatCard";
import { consumoVsDesperdicio, ahorroProyectado } from "@/lib/mock-data";
import { useState } from "react";

const FILTROS = ["Diario", "Semanal", "Mensual"] as const;

export function DashboardView() {
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>("Semanal");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Analítico</h1>
          <p className="text-sm text-muted-foreground">Consumo, desperdicio y ahorro en tiempo real</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filtro === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Consumo total" value="4,630 kg" icon={<BarChart3 size={20} />} trend={{ value: 3.2, label: "vs sem anterior" }} />
        <StatCard title="Desperdicio" value="539 kg" subtitle="11.6% del total" icon={<TrendingDown size={20} />} trend={{ value: -8.5, label: "reducción" }} variant="success" />
        <StatCard title="Ahorro proyectado" value="$4,800" subtitle="Abril 2026" icon={<DollarSign size={20} />} trend={{ value: 17, label: "vs mes anterior" }} />
        <StatCard title="Comida rescatada" value="1,240 kg" subtitle="Acumulado del mes" icon={<Leaf size={20} />} variant="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Consumo vs Desperdicio por Turno (kg)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={consumoVsDesperdicio} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="turno" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="consumo" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} name="Consumo" />
              <Bar dataKey="desperdicio" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} name="Desperdicio" />
              <Bar dataKey="meta" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} name="Meta" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Proyección de Ahorro Mensual</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={ahorroProyectado}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="ahorro" stroke="var(--color-chart-1)" strokeWidth={2} name="Ahorro ($)" dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="desperdicioKg" stroke="var(--color-chart-3)" strokeWidth={2} name="Desperdicio (kg)" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
