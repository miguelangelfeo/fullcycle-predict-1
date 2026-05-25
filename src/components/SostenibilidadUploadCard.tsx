import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileSpreadsheet, AlertTriangle, CheckCircle, X,
  CheckCircle2, AlertTriangle as AlertTri,
  XCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { useLang } from "@/lib/lang-context";
import { useSostenibilidad } from "@/lib/sostenibilidad-store";
import {
  COLUMNAS_SOSTENIBILIDAD,
  downloadSostenibilidadPlantilla,
  importSostenibilidadFile,
} from "@/lib/sostenibilidad-import";
import type { ReporteSostenibilidad } from "@/lib/sostenibilidad-store";
import { cn } from "@/lib/utils";
import type { EstadoIndicador } from "@/lib/sostenibilidad-estado";

const ESTADO_ICON: Record<EstadoIndicador, React.ReactNode> = {
  success: <CheckCircle2 size={12} className="text-success" />,
  warning: <AlertTri size={12} className="text-warning" />,
  destructive: <XCircle size={12} className="text-destructive" />,
};

const ESTADO_BADGE: Record<EstadoIndicador, string> = {
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  destructive: "bg-destructive/10 text-destructive border-destructive/30",
};

interface SostenibilidadUploadCardProps {
  compact?: boolean;
}

export function SostenibilidadUploadCard({ compact = false }: SostenibilidadUploadCardProps) {
  const { t } = useLang();
  const { setReporte, tieneReporte, reporte } = useSostenibilidad();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ReporteSostenibilidad | null>(null);

  const messages = {
    formatoNoSoportado: t.formatoNoSoportado,
    archivoVacio: t.archivoVacio,
    sinColumnaComida: t.sinColumnaComida ?? "Falta la columna ComidaRescatada.",
    sinDatosValidos: t.sinDatosValidos,
    errorProcesar: t.errorProcesar,
    errorLeer: t.errorLeer,
  };

  const resetPreview = () => {
    setError(null);
    setPreview(null);
  };

  const processFile = useCallback(async (f: File) => {
    resetPreview();
    setParsing(true);
    const result = await importSostenibilidadFile(f, messages);
    setParsing(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setPreview(result.reporte);
    setReporte(result.reporte);
  }, [messages, setReporte]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) void processFile(f);
  };

  const active = preview ?? reporte;
  const showCompact = compact && tieneReporte && !preview;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl border bg-card", showCompact ? "p-4" : "p-5")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Upload size={16} className="text-primary" />
            {t.subirReporteSostenibilidad ?? "Subir reporte de sostenibilidad"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
            {t.subirReporteSostenibilidadDesc ??
              "CSV o Excel (.xlsx) con el impacto semanal y el estado (ok, precaución, crítico)."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => downloadSostenibilidadPlantilla()} className="shrink-0">
          <FileSpreadsheet size={14} className="mr-1" />
          {t.descargarPlantilla ?? "Descargar plantilla"}
        </Button>
      </div>

      <details className="mt-3 group">
        <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
          {t.columnasExcel ?? "Columnas del Excel"} ({COLUMNAS_SOSTENIBILIDAD.length})
        </summary>
        <div className="mt-2 overflow-x-auto rounded-lg border text-xs">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-3 py-2 font-semibold">{t.columna ?? "Columna"}</th>
                <th className="px-3 py-2 font-semibold">{t.requerido ?? "Requerido"}</th>
                <th className="px-3 py-2 font-semibold">{t.ejemplo ?? "Ejemplo"}</th>
              </tr>
            </thead>
            <tbody>
              {COLUMNAS_SOSTENIBILIDAD.map((col) => (
                <tr key={col.key} className="border-b last:border-0">
                  <td className="px-3 py-1.5 font-mono">{col.key}</td>
                  <td className="px-3 py-1.5">{col.required ? "✓" : "—"}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">{col.ejemplo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "mt-4 relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors cursor-pointer",
          showCompact ? "p-4" : "p-6",
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
        )}
      >
        <FileSpreadsheet size={showCompact ? 28 : 36} className="text-muted-foreground" />
        <p className="text-sm font-medium">{t.arrastraCSV}</p>
        <p className="text-xs text-muted-foreground">{t.haceClic}</p>
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv,.txt,.xlsx,.xls"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void processFile(f);
            e.target.value = "";
          }}
          className="hidden"
        />
        {parsing && <p className="text-xs text-primary animate-pulse">{t.analizando}</p>}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {active && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle size={14} className="text-success shrink-0" />
            <span>
              <strong>{active.fileName}</strong> {t.archivoAnalizado}
            </span>
            <span className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ml-auto",
              ESTADO_BADGE[active.estado],
            )}>
              {ESTADO_ICON[active.estado]}
              {active.estado === "success" ? "OK" : active.estado === "warning" ? t.enProgreso : t.critico}
            </span>
            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={resetPreview}>
              <X size={12} />
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {active.estadoFuente === "archivo"
              ? (t.estadoDesdeArchivo ?? "Estado leído de la columna Estado del archivo")
              : (t.estadoCalculado ?? "Estado calculado: reducción vs meta (≥ meta OK, ≥50% precaución, &lt;50% crítico)")}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
