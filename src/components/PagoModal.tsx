import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Mail, CheckCircle2, Building2, ArrowRight, Lock } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "./ui/dialog";
import { useLang } from "@/lib/lang-context";
import { useInventario, type PagoInfo } from "@/lib/inventario-store";
import { useTarjeta, type TarjetaGuardada, type MarcaTarjeta } from "@/lib/tarjeta-store";
import { TarjetaSelector, AgregarTarjetaModal } from "./AgregarTarjetaModal";
import { proveedores } from "@/lib/mock-data";
import type { PedidoItem } from "@/lib/inventario-store";

interface PagoModalProps {
  item: PedidoItem;
  open: boolean;
  onClose: () => void;
}

type Step = "tarjeta" | "form" | "preview" | "done";

// Mini chip visual de tarjeta seleccionada
function TarjetaChip({ tarjeta }: { tarjeta: TarjetaGuardada }) {
  const gradients: Record<MarcaTarjeta, string> = {
    visa:       "from-blue-600 to-indigo-700",
    mastercard: "from-orange-500 to-red-600",
    amex:       "from-teal-600 to-cyan-700",
    otro:       "from-slate-600 to-slate-700",
  };
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2">
      <div className={`flex h-8 w-12 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${gradients[tarjeta.marca]}`}>
        <span className="text-[9px] font-black text-white tracking-wider uppercase">{tarjeta.marca}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">•••• {tarjeta.ultimos4}</p>
        <p className="text-xs text-muted-foreground">{tarjeta.titular} · {tarjeta.mesVencimiento}/{tarjeta.anioVencimiento}</p>
      </div>
      <Lock size={13} className="text-muted-foreground shrink-0" />
    </div>
  );
}

export function PagoModal({ item, open, onClose }: PagoModalProps) {
  const { t } = useLang();
  const { registrarPago } = useInventario();
  const { tarjetas, tarjetaPrincipal } = useTarjeta();

  const proveedor = proveedores.find((p) => p.skus.includes(item.sku)) ?? {
    nombre: "Proveedor General",
    email: "pagos@proveedor.com",
    telefono: "",
  };

  const [step, setStep]           = useState<Step>("tarjeta");
  const [tarjetaId, setTarjetaId] = useState<string | null>(tarjetaPrincipal?.id ?? null);
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [monto, setMonto]         = useState("");
  const [referencia, setReferencia] = useState(`ORD-${item.sku}-${Date.now().toString().slice(-6)}`);
  const [metodoPago, setMetodoPago] = useState<PagoInfo["metodoPago"]>("tarjeta");
  const [errors, setErrors]       = useState<{ monto?: string; referencia?: string }>({});
  const [procesando, setProcesando] = useState(false);

  const tarjetaSeleccionada = tarjetas.find((t) => t.id === tarjetaId) ?? null;

  const metodos: { value: PagoInfo["metodoPago"]; label: string }[] = [
    { value: "tarjeta",       label: t.tarjeta        ?? "Tarjeta de crédito" },
    { value: "transferencia", label: t.transferencia  ?? "Transferencia bancaria" },
    { value: "cheque",        label: t.cheque         ?? "Cheque" },
    { value: "efectivo",      label: t.efectivo       ?? "Efectivo" },
  ];

  const handleContinuarConTarjeta = () => {
    if (!tarjetaSeleccionada) return;
    setStep("form");
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) e.monto = t.montoObligatorio ?? "Ingresa el monto";
    if (!referencia.trim()) e.referencia = t.referenciaObligatoria ?? "Ingresa la referencia";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleVerPreview = () => { if (validate()) setStep("preview"); };

  const handleConfirmar = () => {
    setProcesando(true);
    setTimeout(() => {
      const pago: PagoInfo = {
        referencia: referencia.trim(),
        monto: Number(monto),
        metodoPago,
        proveedorNombre: proveedor.nombre,
        proveedorEmail: proveedor.email,
        fechaPago: new Date().toISOString(),
      };
      registrarPago(item.sku, pago);

      toast.custom(() => (
        <div className="flex w-80 items-start gap-3 rounded-xl border bg-card p-4 shadow-lg">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
            <Mail size={18} className="text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t.pagoRegistrado ?? "Pago registrado"}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t.emailSimulado ?? "Email enviado a"}{" "}
              <span className="font-medium text-foreground">{proveedor.email}</span>
            </p>
            <div className="mt-2 rounded-md border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground space-y-0.5">
              <p><span className="font-medium text-foreground">De:</span> compras@fullcycle.com</p>
              <p><span className="font-medium text-foreground">Para:</span> {proveedor.email}</p>
              <p><span className="font-medium text-foreground">Asunto:</span> Pago confirmado — {referencia}</p>
              <p className="border-t mt-1 pt-1">
                Pago de <strong>${Number(monto).toLocaleString("es-CO")} COP</strong> procesado con
                {" "}•••• {tarjetaSeleccionada?.ultimos4 ?? "****"}
              </p>
            </div>
          </div>
        </div>
      ), { duration: 7000 });

      setStep("done");
      setProcesando(false);
      setTimeout(onClose, 1200);
    }, 1000);
  };

  const handleClose = () => {
    if (!procesando) {
      setStep("tarjeta");
      setErrors({});
      onClose();
    }
  };

  // Cuando se guarda una nueva tarjeta, seleccionarla automáticamente
  const handleTarjetaGuardada = (tc: TarjetaGuardada) => {
    setTarjetaId(tc.id);
    setMostrarAgregar(false);
  };

  const stepTitles: Record<Step, string> = {
    tarjeta: t.seleccionarTarjeta ?? "Método de pago",
    form:    t.datosPago          ?? "Datos del pago",
    preview: t.previewEmail       ?? "Confirmar y enviar",
    done:    "",
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="max-w-md">
          {step !== "done" && (
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <CreditCard size={17} className="text-primary" />
                {stepTitles[step]}
              </DialogTitle>
              {step === "tarjeta" && (
                <DialogDescription className="text-xs flex items-center gap-1">
                  <Lock size={11} />
                  {t.pagoSeguro ?? "Pago seguro · powered by Stripe (cuando se conecte el backend)"}
                </DialogDescription>
              )}
            </DialogHeader>
          )}

          {/* ── Step 1: selección de tarjeta ───────────────────────── */}
          {step === "tarjeta" && (
            <div className="space-y-4 pt-1">
              {/* Info proveedor */}
              <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5">
                <Building2 size={15} className="text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate">{proveedor.nombre}</p>
                  <p className="text-[11px] text-muted-foreground">{item.nombre} · {item.cantidadPedir} {item.unidad}</p>
                </div>
              </div>

              <TarjetaSelector
                seleccionada={tarjetaId}
                onSeleccionar={setTarjetaId}
                onAgregar={() => setMostrarAgregar(true)}
              />

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={handleClose}>{t.cancelar ?? "Cancelar"}</Button>
                <Button
                  size="sm"
                  onClick={handleContinuarConTarjeta}
                  disabled={!tarjetaSeleccionada}
                  className="gap-1.5"
                >
                  {t.continuar ?? "Continuar"}
                  <ArrowRight size={13} />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: form de pago ───────────────────────────────── */}
          {step === "form" && (
            <div className="space-y-4 pt-1">
              {/* Tarjeta seleccionada */}
              {tarjetaSeleccionada && <TarjetaChip tarjeta={tarjetaSeleccionada} />}

              {/* Proveedor */}
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Building2 size={16} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{proveedor.nombre}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail size={10} /> {proveedor.email}
                  </p>
                </div>
              </div>

              {/* Ítem */}
              <div className="grid grid-cols-3 gap-3 rounded-lg border bg-muted/10 px-4 py-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">SKU</p>
                  <p className="font-mono font-medium text-xs mt-0.5">{item.sku}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.nombre ?? "Producto"}</p>
                  <p className="font-medium text-xs mt-0.5 truncate">{item.nombre}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.aPedir ?? "Cantidad"}</p>
                  <p className="font-semibold text-xs text-primary mt-0.5">{item.cantidadPedir} {item.unidad}</p>
                </div>
              </div>

              {/* Monto */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t.montoTotal ?? "Monto total (COP)"}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={monto}
                    onChange={(e) => { setMonto(e.target.value); setErrors((p) => ({ ...p, monto: undefined })); }}
                    className={`w-full rounded-md border pl-7 pr-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.monto ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.monto && <p className="text-xs text-destructive">{errors.monto}</p>}
              </div>

              {/* Método */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t.metodoPago ?? "Método de pago"}</label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value as PagoInfo["metodoPago"])}
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {metodos.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>

              {/* Referencia */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t.referenciaPago ?? "Referencia / N° de orden"}</label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => { setReferencia(e.target.value); setErrors((p) => ({ ...p, referencia: undefined })); }}
                  className={`w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.referencia ? "border-destructive" : ""}`}
                />
                {errors.referencia && <p className="text-xs text-destructive">{errors.referencia}</p>}
              </div>

              <div className="flex justify-between gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setStep("tarjeta")}>← {t.atras ?? "Atrás"}</Button>
                <Button size="sm" onClick={handleVerPreview} className="gap-1.5">
                  {t.verPreviewEmail ?? "Ver preview email"}
                  <ArrowRight size={13} />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: preview email ──────────────────────────────── */}
          {step === "preview" && (
            <div className="space-y-4 pt-1">
              {tarjetaSeleccionada && <TarjetaChip tarjeta={tarjetaSeleccionada} />}

              <div className="rounded-lg border bg-muted/20 overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground w-12">De:</span>
                    <span className="font-medium">compras@fullcycle.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground w-12">Para:</span>
                    <span className="font-medium text-primary">{proveedor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground w-12">Asunto:</span>
                    <span className="font-medium">Confirmación de pago — {referencia}</span>
                  </div>
                </div>
                <div className="px-4 py-4 text-sm space-y-3">
                  <p>Estimado equipo de <strong>{proveedor.nombre}</strong>,</p>
                  <p className="text-muted-foreground leading-relaxed text-xs">
                    Por medio del presente correo, confirmamos el pago por la siguiente orden:
                  </p>
                  <div className="rounded-md border bg-background px-4 py-3 text-xs space-y-1.5">
                    <div className="flex justify-between"><span className="text-muted-foreground">Producto:</span><span className="font-medium">{item.nombre}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Cantidad:</span><span className="font-medium">{item.cantidadPedir} {item.unidad}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Referencia:</span><span className="font-mono font-medium">{referencia}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Pagado con:</span><span className="font-medium">•••• {tarjetaSeleccionada?.ultimos4}</span></div>
                    <div className="flex justify-between border-t pt-1.5 mt-1">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-primary">${Number(monto).toLocaleString("es-CO")} COP</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground border-t pt-3">
                    Atentamente,<br />
                    <strong>Equipo de Compras — FullCycle Solutions</strong>
                  </p>
                </div>
              </div>

              <div className="flex justify-between gap-2">
                <Button variant="outline" size="sm" onClick={() => setStep("form")} disabled={procesando}>
                  ← {t.atras ?? "Atrás"}
                </Button>
                <Button size="sm" onClick={handleConfirmar} disabled={procesando} className="gap-1.5">
                  {procesando ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {t.generando ?? "Procesando..."}
                    </span>
                  ) : (
                    <>
                      <Mail size={13} />
                      {t.confirmarPago ?? "Confirmar y enviar email"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 4: éxito ─────────────────────────────────────── */}
          {step === "done" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 size={28} className="text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold">{t.pagoRegistrado ?? "Pago registrado"}</p>
                <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <Mail size={13} />
                  {t.emailSimulado ?? "Email enviado a"} <strong>{proveedor.email}</strong>
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AgregarTarjetaModal
        open={mostrarAgregar}
        onClose={() => setMostrarAgregar(false)}
        onGuardada={handleTarjetaGuardada}
      />
    </>
  );
}
