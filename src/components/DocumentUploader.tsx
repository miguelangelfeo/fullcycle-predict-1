import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, X, TrendingDown, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useLang } from "@/lib/lang-context";
import { useInventario, type ProductoInventario, type PedidoItem } from "@/lib/inventario-store";

interface ParsedRow {
  sku: string;
  nombre: string;
  stock: number;
  minimo: number;
  unidad: string;
}

interface AnalysisResult {
  totalProductos: number;
  criticos: ParsedRow[];
  saludables: ParsedRow[];
  stockTotal: number;
  alertas: string[];
  sugerencias: { sku: string; nombre: string; cantidadActual: number; cantidadPedir: number; unidad: string }[];
}

function analyzeData(rows: ParsedRow[], productosBajoMinimo: string, masDe50: string): AnalysisResult {
  const criticos = rows.filter((r) => r.stock < r.minimo);
  const saludables = rows.filter((r) => r.stock >= r.minimo);
  const stockTotal = rows.reduce((sum, r) => sum + r.stock, 0);

  const alertas: string[] = [];
  if (criticos.length > 0) alertas.push(`${criticos.length} ${productosBajoMinimo}`);
  if (criticos.length > rows.length * 0.5) alertas.push(masDe50);

  const sugerencias = criticos.map((c) => ({
    sku: c.sku,
    nombre: c.nombre,
    cantidadActual: c.stock,
    cantidadPedir: Math.ceil((c.minimo - c.stock) * 1.3),
    unidad: c.unidad,
  }));

  return { totalProductos: rows.length, criticos, saludables, stockTotal, alertas, sugerencias };
}

function normalizeHeaders(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  const patterns: Record<string, string[]> = {
    sku: ["sku", "codigo", "código", "code", "id"],
    nombre: ["nombre", "name", "producto", "item", "descripcion", "descripción"],
    stock: ["stock", "cantidad", "qty", "quantity", "existencia", "inventario"],
    minimo: ["minimo", "mínimo", "min", "minimum", "reorder", "punto_reorden"],
    unidad: ["unidad", "unit", "uom", "medida"],
  };

  for (const header of headers) {
    const normalized = header.toLowerCase().trim().replace(/[^a-záéíóúñü0-9]/gi, "");
    for (const [key, aliases] of Object.entries(patterns)) {
      if (aliases.some((a) => normalized.includes(a))) {
        map[header] = key;
        break;
      }
    }
  }
  return map;
}

export function DocumentUploader() {
  const { t } = useLang();
  const { setInventario } = useInventario();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  const reset = () => {
    setFile(null);
    setAnalysis(null);
    setError(null);
    setParsing(false);
  };

  const processFile = useCallback((f: File) => {
    reset();
    setFile(f);
    setParsing(true);

    const ext = f.name.split(".").pop()?.toLowerCase();
    const isExcel = ["xlsx", "xls"].includes(ext || "");
    const isCsvOrTxt = ["csv", "txt"].includes(ext || "");

    if (!isExcel && !isCsvOrTxt) {
      setError(t.formatoNoSoportado);
      setParsing(false);
      return;
    }

    const parseData = (input: File | string) => {
      Papa.parse(input as any, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            if (!results.data || results.data.length === 0) {
              setError(t.archivoVacio);
              setParsing(false);
              return;
            }

            const headers = Object.keys(results.data[0] as Record<string, unknown>);
            const headerMap = normalizeHeaders(headers);

            if (!headerMap[headers.find((h) => normalizeHeaders([h])[h] === "sku") || ""] &&
                !Object.values(headerMap).includes("sku")) {
              setError(t.sinColumnasSKU);
              setParsing(false);
              return;
            }

            const rows: ParsedRow[] = [];
            for (const raw of results.data as Record<string, string>[]) {
              const mapped: Record<string, string> = {};
              for (const [origHeader, value] of Object.entries(raw)) {
                const key = headerMap[origHeader];
                if (key) mapped[key] = value;
              }

              if (mapped.sku && mapped.nombre) {
                rows.push({
                  sku: mapped.sku.trim(),
                  nombre: mapped.nombre.trim(),
                  stock: parseFloat(mapped.stock) || 0,
                  minimo: parseFloat(mapped.minimo) || 0,
                  unidad: mapped.unidad?.trim() || "und",
                });
              }
            }

            if (rows.length === 0) {
              setError(t.sinDatosValidos);
              setParsing(false);
              return;
            }

            const resultado = analyzeData(rows, t.productosBajoMinimo, t.masDe50);
            setAnalysis(resultado);

            // Persistir en el store global
            const productos: ProductoInventario[] = rows.map((r) => ({
              sku: r.sku,
              nombre: r.nombre,
              stock: r.stock,
              minimo: r.minimo,
              unidad: r.unidad,
            }));
            const pedido: PedidoItem[] = resultado.sugerencias.map((s) => ({
              sku: s.sku,
              nombre: s.nombre,
              cantidadActual: s.cantidadActual,
              cantidadPedir: s.cantidadPedir,
              unidad: s.unidad,
            }));
            setInventario(productos, pedido);

            setParsing(false);
          } catch {
            setError(t.errorProcesar);
            setParsing(false);
          }
        },
        error: () => {
          setError(t.errorLeer);
          setParsing(false);
        },
      });
    };

    if (isExcel) {
      f.arrayBuffer().then((buffer) => {
        try {
          const workbook = XLSX.read(buffer, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          parseData(csv);
        } catch {
          setError(t.errorProcesar);
          setParsing(false);
        }
      }).catch(() => {
        setError(t.errorLeer);
        setParsing(false);
      });
    } else {
      parseData(f);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) processFile(f);
    },
    [processFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const descargarPlantilla = () => {
    const data = [
      { SKU: "INS-001", Nombre: "Ejemplo Producto", Stock: 10, Minimo: 20, Unidad: "kg" },
      { SKU: "INS-002", Nombre: "Otro Producto", Stock: 50, Minimo: 15, Unidad: "und" },
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla");
    XLSX.writeFile(workbook, "plantilla_inventario.xlsx");
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => { reset(); setOpen(true); }}>
        <Upload size={14} className="mr-1" />
        {t.subirDocumento}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.subirDocTitle}</DialogTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <DialogDescription className="max-w-md">
                {t.subirDocDesc}
              </DialogDescription>
              <Button variant="outline" size="sm" onClick={descargarPlantilla}>
                <FileSpreadsheet size={14} className="mr-1" />
                {t.descargarPlantilla ?? "Descargar Plantilla"}
              </Button>
            </div>
          </DialogHeader>

          {!analysis && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer ${
                dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
            >
              <FileSpreadsheet size={40} className="text-muted-foreground" />
              <p className="text-sm font-medium">{t.arrastraCSV}</p>
              <p className="text-xs text-muted-foreground">{t.haceClic}</p>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,.txt,.xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
              />
              {parsing && <p className="text-xs text-primary animate-pulse">{t.analizando}</p>}
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {analysis && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle size={14} className="text-success" />
                <span><strong>{file?.name}</strong> {t.archivoAnalizado}</span>
                <Button variant="ghost" size="sm" className="ml-auto h-6 px-2" onClick={reset}>
                  <X size={12} />
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <BarChart3 size={18} className="text-primary" />
                  <div>
                    <p className="text-lg font-bold">{analysis.totalProductos}</p>
                    <p className="text-xs text-muted-foreground">{t.productos}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <TrendingDown size={18} className="text-destructive" />
                  <div>
                    <p className="text-lg font-bold">{analysis.criticos.length}</p>
                    <p className="text-xs text-muted-foreground">{t.criticos}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <TrendingUp size={18} className="text-success" />
                  <div>
                    <p className="text-lg font-bold">{analysis.saludables.length}</p>
                    <p className="text-xs text-muted-foreground">{t.saludables}</p>
                  </div>
                </div>
              </div>

              {analysis.alertas.length > 0 && (
                <div className="space-y-1.5">
                  {analysis.alertas.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md bg-warning/10 px-3 py-2 text-xs font-medium text-warning">
                      <AlertTriangle size={12} />
                      {a}
                    </div>
                  ))}
                </div>
              )}

              {analysis.sugerencias.length > 0 && (
                <div className="rounded-xl border">
                  <div className="border-b px-4 py-2.5">
                    <h4 className="text-sm font-semibold">{t.pedidoAutoGenerado}</h4>
                  </div>
                  <div className="grid grid-cols-5 gap-2 border-b px-4 py-2 text-xs font-semibold text-muted-foreground">
                    <span>{t.sku}</span><span>{t.nombre}</span><span>{t.actual}</span><span>{t.aPedir}</span><span>{t.unidad}</span>
                  </div>
                  {analysis.sugerencias.map((s) => (
                    <div key={s.sku} className="grid grid-cols-5 gap-2 border-b px-4 py-2 text-sm last:border-0">
                      <span className="font-mono text-xs text-muted-foreground">{s.sku}</span>
                      <span className="font-medium">{s.nombre}</span>
                      <span className="text-destructive">{s.cantidadActual}</span>
                      <span className="font-semibold text-primary">{s.cantidadPedir}</span>
                      <span className="text-muted-foreground">{s.unidad}</span>
                    </div>
                  ))}
                </div>
              )}

              <details className="group">
                <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                  {t.verInventario} ({analysis.totalProductos} {t.items})
                </summary>
                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border">
                  <div className="grid grid-cols-5 gap-2 border-b px-4 py-2 text-xs font-semibold text-muted-foreground">
                    <span>{t.sku}</span><span>{t.nombre}</span><span>{t.stock}</span><span>{t.minimo}</span><span>{t.estado}</span>
                  </div>
                  {[...analysis.criticos, ...analysis.saludables].map((r) => (
                    <div key={r.sku} className="grid grid-cols-5 gap-2 border-b px-4 py-1.5 text-xs last:border-0">
                      <span className="font-mono text-muted-foreground">{r.sku}</span>
                      <span>{r.nombre}</span>
                      <span>{r.stock} {r.unidad}</span>
                      <span className="text-muted-foreground">{r.minimo} {r.unidad}</span>
                      <span className={r.stock < r.minimo ? "text-destructive font-medium" : "text-success"}>
                        {r.stock < r.minimo ? t.critico : "OK"}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
