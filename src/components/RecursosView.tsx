import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, ExternalLink, FileSpreadsheet, Download, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { useLang } from "@/lib/lang-context";

interface Recurso {
  id: string;
  titulo: string;
  descripcion: string;
  url: string;
}

function generarCSV(): string {
  const headers = ["SKU", "Nombre", "Stock", "Minimo", "Unidad"];
  const filas = [
    ["SKU-001", "Tomate", "50", "20", "kg"],
    ["SKU-002", "Lechuga", "15", "10", "und"],
    ["SKU-003", "Pollo", "30", "25", "kg"],
    ["SKU-004", "Arroz", "100", "40", "kg"],
    ["SKU-005", "Aceite", "8", "10", "L"],
  ];
  return [headers, ...filas].map((r) => r.join(",")).join("\n");
}

export function RecursosView() {
  const { t } = useLang();
  const [pdfActivo, setPdfActivo] = useState<Recurso | null>(null);

  const PDFS: Recurso[] = [
    {
      id: "pdf1",
      titulo: t.manualOperaciones,
      descripcion: t.manualOperacionesDesc,
      url: "https://www.fao.org/3/i3347e/i3347e.pdf",
    },
    {
      id: "pdf2",
      titulo: t.reporteSostenibilidadDoc,
      descripcion: t.reporteSostenibilidadDocDesc,
      url: "https://sdgs.un.org/sites/default/files/2023-06/SDG%20Report%202023_0.pdf",
    },
  ];

  const LINK_EXTERNO = {
    titulo: t.ods2Onu,
    descripcion: t.ods2OnuDesc,
    url: "https://www.un.org/sustainabledevelopment/es/hunger/",
  };

  const EXCEL = {
    titulo: t.plantillaInventario,
    descripcion: t.plantillaInventarioDesc,
    filename: "plantilla_inventario.csv",
  };

  const descargarExcel = () => {
    const blob = new Blob([generarCSV()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = EXCEL.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.recursosTitle}</h1>
        <p className="text-sm text-muted-foreground">
          {t.recursosSub}
        </p>
      </div>

      {/* PDFs */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t.documentosPDF}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {PDFS.map((pdf, i) => (
            <motion.div
              key={pdf.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-card p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <FileText size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">{pdf.titulo}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{pdf.descripcion}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPdfActivo(pdf)}>
                  <Eye size={14} className="mr-1" />
                  {t.ver}
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <a href={pdf.url} target="_blank" rel="noopener noreferrer">
                    <Download size={14} className="mr-1" />
                    {t.abrir}
                  </a>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Link externo */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t.enlaceExterno}
        </h2>
        <motion.a
          href={LINK_EXTERNO.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 rounded-xl border bg-card p-5 transition-colors hover:bg-accent/30"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ExternalLink size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold">{LINK_EXTERNO.titulo}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{LINK_EXTERNO.descripcion}</p>
          </div>
          <ExternalLink size={16} className="text-muted-foreground" />
        </motion.a>
      </section>

      {/* Excel */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t.archivoExcel}
        </h2>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 rounded-xl border bg-card p-5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
            <FileSpreadsheet size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold">{EXCEL.titulo}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{EXCEL.descripcion}</p>
          </div>
          <Button size="sm" onClick={descargarExcel}>
            <Download size={14} className="mr-1" />
            {t.descargar}
          </Button>
        </motion.div>
      </section>

      {/* Visor PDF */}
      {pdfActivo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPdfActivo(null)}
        >
          <div
            className="relative flex h-[90vh] w-full max-w-5xl flex-col rounded-xl bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h3 className="text-sm font-semibold">{pdfActivo.titulo}</h3>
              <Button size="sm" variant="ghost" onClick={() => setPdfActivo(null)}>
                {t.cerrar}
              </Button>
            </div>
            <iframe
              src={pdfActivo.url}
              title={pdfActivo.titulo}
              className="h-full w-full rounded-b-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
