import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Leaf, TreePine, Car, Target, TrendingDown, Database, Info,
  CheckCircle2, AlertTriangle, XCircle,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { StatCard } from "./StatCard";
import { SostenibilidadUploadCard } from "./SostenibilidadUploadCard";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { impactoAmbiental, impactoSemanal } from "@/lib/mock-data";
import { useLang } from "@/lib/lang-context";
import { useSostenibilidad } from "@/lib/sostenibilidad-store";
import {
  calcularEstadoMeta,
  ESTADO_CARD_STYLES,
  ESTADO_CHART_FILL,
  subtituloEstadoMeta,
  type EstadoIndicador,
} from "@/lib/sostenibilidad-estado";
import { cn } from "@/lib/utils";

const ESTADO_BADGE: Record<EstadoIndicador, { className: string; icon: React.ReactNode; labelKey: "metaCumplida" | "enProgreso" | "critico" }> = {
  success: {
    className: "bg-success/10 text-success border-success/30",
    icon: <CheckCircle2 size={14} />,
    labelKey: "metaCumplida",
  },
  warning: {
    className: "bg-warning/10 text-warning border-warning/30",
    icon: <AlertTriangle size={14} />,
    labelKey: "enProgreso",
  },
  destructive: {
    className: "bg-destructive/10 text-destructive border-destructive/30",
    icon: <XCircle size={14} />,
    labelKey: "critico",
  },
};

const PROGRESS_BAR: Record<EstadoIndicador, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

function datosDesdeMock() {
  const reduccion = impactoAmbiental.reduccionPorcentual;
  const meta = impactoAmbiental.metaReduccion;
  return {
    reduccionPorcentual: reduccion,
    metaReduccion: meta,
    estado: calcularEstadoMeta(reduccion, meta),
    estadoFuente: "calculado" as const,
    comidaRescatada: impactoAmbiental.comidaRescatada,
    co2Evitado: impactoAmbiental.co2Evitado,
    metanoEvitado: impactoAmbiental.metanoEvitado,
    equivalencias: impactoAmbiental.equivalencias,
    impactoSemanal: impactoSemanal,
  };
}

export function SostenibilidadView() {
  const { t } = useLang();
  const { reporte, tieneReporte } = useSostenibilidad();

  const datos = reporte ?? datosDesdeMock();
  const {
    reduccionPorcentual,
    metaReduccion,
    estado: estadoMeta,
    comidaRescatada,
    co2Evitado,
    metanoEvitado,
    equivalencias,
    impactoSemanal: serieSemanal,
  } = datos;

  const estiloCards = ESTADO_CARD_STYLES[estadoMeta];
  const progresoPct = metaReduccion > 0
    ? Math.min((reduccionPorcentual / metaReduccion) * 100, 100)
    : 0;

  const chartYMax = useMemo(() => {
    const peak = Math.max(...serieSemanal.map((d) => d.rescatadoKg), 1);
    return Math.ceil(peak * 1.15);
  }, [serieSemanal]);

  const totalSemanalKg = useMemo(
    () => serieSemanal.reduce((s, d) => s + d.rescatadoKg, 0),
    [serieSemanal],
  );

  const subtituloMeta = `${t.meta}: ${metaReduccion}% — ${subtituloEstadoMeta(estadoMeta, {
    cumpliendo: t.cumpliendoMeta,
    enProgreso: t.enProgreso,
    critico: t.critico,
  })}`;

  const cardHighlight = (estado: EstadoIndicador) =>
    estadoMeta === estado ? "ring-2 ring-offset-2 ring-offset-background" : "opacity-60";

  const ringColor: Record<EstadoIndicador, string> = {
    success: "ring-success/50",
    warning: "ring-warning/50",
    destructive: "ring-destructive/50",
  };

  const sostenibilidadSteps = [
    { number: 1, title: t.sostenibilidadPaso1Title, description: t.sostenibilidadPaso1Desc },
    { number: 2, title: t.sostenibilidadPaso2Title, description: t.sostenibilidadPaso2Desc },
    { number: 3, title: t.sostenibilidadPaso3Title, description: t.sostenibilidadPaso3Desc },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.sostenibilidadTitle}</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-0.5">
          <div>
            <p className="text-sm text-muted-foreground">{t.sostenibilidadSub}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tieneReporte ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
              <Database size={10} />
              {tieneReporte ? (t.datosCargados ?? "Datos cargados") : (t.datosDemo ?? "Datos de ejemplo")}
            </span>
            <span className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
              ESTADO_BADGE[estadoMeta].className,
            )}>
              {ESTADO_BADGE[estadoMeta].icon}
              {t[ESTADO_BADGE[estadoMeta].labelKey]}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {sostenibilidadSteps.map((step) => (
            <div key={step.number} className="rounded-2xl border border-muted/80 bg-card p-4 text-sm shadow-sm">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                {step.number}
              </div>
              <p className="mt-3 font-semibold text-foreground">{step.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <SostenibilidadUploadCard compact={tieneReporte} />

      <div className="rounded-2xl border border-muted/80 bg-muted/50 p-4 text-sm text-muted-foreground">
        {t.sostenibilidadHint}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-card p-5"
      >
        <h3 className="text-sm font-semibold">{t.estadosSistema}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{t.estadosSistemaSub}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className={cn("rounded-lg border border-success/25 bg-success/5 p-4 transition-all", cardHighlight("success"), ringColor.success)}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
              <CheckCircle2 size={13} /> OK
            </span>
            <p className="mt-3 text-sm font-medium text-success">{t.estadoSuccessTitulo}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.leyendaVerde}</p>
          </div>
          <div className={cn("rounded-lg border border-warning/25 bg-warning/5 p-4 transition-all", cardHighlight("warning"), ringColor.warning)}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
              <AlertTriangle size={13} /> {t.enProgreso}
            </span>
            <p className="mt-3 text-sm font-medium text-warning">{t.estadoWarningTitulo}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.leyendaAmarillo}</p>
          </div>
          <div className={cn("rounded-lg border border-destructive/25 bg-destructive/5 p-4 transition-all", cardHighlight("destructive"), ringColor.destructive)}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
              <XCircle size={13} /> {t.critico}
            </span>
            <p className="mt-3 text-sm font-medium text-destructive">{t.estadoDestructiveTitulo}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.leyendaRojo}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t.comidaRescatada} value={`${comidaRescatada.toLocaleString("es-CO")} kg`} icon={<Leaf size={20} />} variant={estadoMeta} />
        <StatCard title={t.co2Evitado} value={`${co2Evitado.toLocaleString("es-CO")} kg`} icon={<TreePine size={20} />} tooltip={t.co2Tooltip} variant={estadoMeta} />
        <StatCard title={t.metanoEvitado} value={`${metanoEvitado.toLocaleString("es-CO")} kg`} icon={<TrendingDown size={20} />} variant={estadoMeta} />
        <StatCard
          title={t.metaReduccion}
          value={`${reduccionPorcentual}%`}
          subtitle={subtituloMeta}
          icon={<Target size={20} />}
          variant={estadoMeta}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <h3 className="text-sm font-semibold">{t.comidaRescatadaSem}</h3>
            <p className={cn("text-xs font-medium tabular-nums", estiloCards.value)}>
              {t.totalMes}: {totalSemanalKg.toLocaleString("es-CO")} kg
            </p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              key={`semanal-${estadoMeta}-${totalSemanalKg}`}
              data={serieSemanal}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="semana" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, chartYMax]} allowDataOverflow={false} />
              <RechartsTooltip
                formatter={(value: any) => {
                  const numericValue = typeof value === "number" ? value : Number(value ?? 0);
                  return `${numericValue.toLocaleString("es-CO")} kg`;
                }}
              />
              <Bar
                dataKey="rescatadoKg"
                fill={ESTADO_CHART_FILL[estadoMeta]}
                radius={[6, 6, 0, 0]}
                name="rescatadoKg"
                isAnimationActive
                animationDuration={450}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">{t.progresoMeta}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.reduccionActual}</span>
                <span className={cn(
                  "font-bold",
                  estadoMeta === "success" && "text-success",
                  estadoMeta === "warning" && "text-warning",
                  estadoMeta === "destructive" && "text-destructive",
                )}>
                  {reduccionPorcentual}%
                </span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={false}
                  animate={{ width: `${progresoPct}%` }}
                  transition={{ duration: 0.35 }}
                  className={cn("h-full rounded-full", PROGRESS_BAR[estadoMeta])}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t.meta}: {metaReduccion}% — {estadoMeta === "success" ? t.metaCumplida : estadoMeta === "warning" ? t.enProgreso : t.critico}
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">{t.equivalenciasAmbientales}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={cn("flex items-center gap-3 rounded-lg border p-3", estiloCards.box)}>
                <TreePine size={24} className={estiloCards.icon} />
                <div>
                  <p className={cn("text-lg font-bold", estiloCards.value)}>{equivalencias.arboles}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    {t.arboles}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex cursor-help text-muted-foreground hover:text-foreground"><Info size={12} /></span>
                      </TooltipTrigger>
                      <TooltipContent side="top">{t.arbolesTooltip}</TooltipContent>
                    </Tooltip>
                  </p>
                </div>
              </div>
              <div className={cn("flex items-center gap-3 rounded-lg border p-3", estiloCards.box)}>
                <Car size={24} className={estiloCards.icon} />
                <div>
                  <p className={cn("text-lg font-bold", estiloCards.value)}>{equivalencias.viajesAuto.toLocaleString("es-CO")}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    {t.kmAuto}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex cursor-help text-muted-foreground hover:text-foreground"><Info size={12} /></span>
                      </TooltipTrigger>
                      <TooltipContent side="top">{t.autoTooltip}</TooltipContent>
                    </Tooltip>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {tieneReporte && reporte && reporte.filasDetalle.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">{t.detalleArchivo ?? "Detalle del archivo"}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-3">{t.semana ?? "Semana"}</th>
                  <th className="py-2 pr-3">{t.comidaRescatada}</th>
                  <th className="py-2 pr-3">{t.reduccionActual}</th>
                  <th className="py-2 pr-3">{t.meta}</th>
                  <th className="py-2">{t.estado}</th>
                </tr>
              </thead>
              <tbody>
                {reporte.filasDetalle.map((f, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-medium">{f.semana}</td>
                    <td className="py-2 pr-3">{f.comidaRescatada} kg</td>
                    <td className="py-2 pr-3">{f.reduccionPorcentual != null ? `${f.reduccionPorcentual}%` : "—"}</td>
                    <td className="py-2 pr-3">{f.metaReduccion != null ? `${f.metaReduccion}%` : "—"}</td>
                    <td className="py-2">
                      {f.estado ? (
                        <span className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          f.estado === "success" ? "border-success/30 text-success" :
                          f.estado === "warning" ? "border-warning/30 text-warning" :
                          "border-destructive/30 text-destructive",
                        )}>
                          {f.estado === "success" ? "OK" : f.estado === "warning" ? t.enProgreso : t.critico}
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
