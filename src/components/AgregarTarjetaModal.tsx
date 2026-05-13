import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Lock, CheckCircle2, Trash2, Star } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "./ui/dialog";
import {
  useTarjeta,
  detectarMarca,
  formatearNumeroTarjeta,
  longitidMaxima,
  type TarjetaGuardada,
  type MarcaTarjeta,
} from "@/lib/tarjeta-store";
import { useLang } from "@/lib/lang-context";

// ── Logos de marca ────────────────────────────────────────────────────────────
function MarcaLabel({ marca, size = "sm" }: { marca: MarcaTarjeta; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "text-sm font-black tracking-wider" : "text-[10px] font-black tracking-wider";
  if (marca === "visa")
    return <span className={`${cls} text-white italic`}>VISA</span>;
  if (marca === "mastercard")
    return (
      <span className="inline-flex items-center gap-0.5">
        <span className="h-4 w-4 rounded-full bg-red-500 opacity-90" />
        <span className="h-4 w-4 rounded-full bg-yellow-400 opacity-90 -ml-2" />
      </span>
    );
  if (marca === "amex")
    return <span className={`${cls} text-white`}>AMEX</span>;
  return <CreditCard size={size === "lg" ? 18 : 14} className="text-white/70" />;
}

// ── Vista previa de la tarjeta ────────────────────────────────────────────────
function TarjetaVisual({
  numero, titular, expiry, cvv, showBack, marca,
}: {
  numero: string; titular: string; expiry: string;
  cvv: string; showBack: boolean; marca: MarcaTarjeta;
}) {
  const gradients: Record<MarcaTarjeta, string> = {
    visa:       "from-blue-700 via-blue-600 to-indigo-700",
    mastercard: "from-orange-600 via-red-600 to-orange-700",
    amex:       "from-teal-700 via-teal-600 to-cyan-700",
    otro:       "from-slate-700 via-slate-600 to-slate-700",
  };

  const displayNum = numero.padEnd(marca === "amex" ? 17 : 19, "•").replace(/X/g, "•");

  return (
    <div className="relative h-44 w-full perspective-1000" style={{ perspective: "800px" }}>
      <motion.div
        animate={{ rotateY: showBack ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradients[marca]} p-5 shadow-xl backface-hidden`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Chip + marca */}
          <div className="flex items-start justify-between">
            <div className="h-7 w-9 rounded-md bg-yellow-300/80 border border-yellow-200/50" />
            <MarcaLabel marca={marca} size="lg" />
          </div>

          {/* Número */}
          <p className="mt-4 font-mono text-lg tracking-[0.18em] text-white/95 select-none">
            {displayNum || "•••• •••• •••• ••••"}
          </p>

          {/* Titular + Vence */}
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/50">Titular</p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-white truncate max-w-[150px]">
                {titular || "NOMBRE APELLIDO"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-white/50">Vence</p>
              <p className="mt-0.5 font-mono text-xs text-white">{expiry || "MM/YY"}</p>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradients[marca]} shadow-xl`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="mt-7 h-10 w-full bg-black/60" />
          <div className="mt-3 mx-5 flex items-center justify-end gap-2">
            <div className="flex-1 h-8 rounded bg-white/20" />
            <div className="flex h-8 min-w-[52px] items-center justify-center rounded bg-white/90 font-mono text-sm font-bold text-slate-800">
              {cvv || "•••"}
            </div>
          </div>
          <p className="mt-2 px-5 text-right text-[9px] text-white/40">CVV</p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Selector de tarjetas guardadas ────────────────────────────────────────────
export function TarjetaSelector({
  seleccionada,
  onSeleccionar,
  onAgregar,
}: {
  seleccionada: string | null;
  onSeleccionar: (id: string) => void;
  onAgregar: () => void;
}) {
  const { tarjetas, eliminarTarjeta, setPrincipal } = useTarjeta();
  const { t } = useLang();

  if (tarjetas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-8 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <CreditCard size={22} className="text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{t.sinTarjetas ?? "Sin métodos de pago"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t.agregarTarjetaParaPagar ?? "Agrega una tarjeta para continuar con el pago"}
          </p>
        </div>
        <Button size="sm" onClick={onAgregar} className="gap-1.5 mt-1">
          <CreditCard size={13} />
          {t.agregarTarjeta ?? "Agregar tarjeta"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tarjetas.map((tc) => (
        <button
          key={tc.id}
          onClick={() => onSeleccionar(tc.id)}
          className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
            seleccionada === tc.id
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-muted/30"
          }`}
        >
          {/* Mini tarjeta visual */}
          <div className={`flex h-8 w-12 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${
            tc.marca === "visa" ? "from-blue-600 to-indigo-700" :
            tc.marca === "mastercard" ? "from-orange-500 to-red-600" :
            tc.marca === "amex" ? "from-teal-600 to-cyan-700" : "from-slate-600 to-slate-700"
          }`}>
            <MarcaLabel marca={tc.marca} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              •••• {tc.ultimos4}
              {tc.esPrincipal && (
                <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  <Star size={9} /> Principal
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">{tc.titular} · {tc.mesVencimiento}/{tc.anioVencimiento}</p>
          </div>

          {seleccionada === tc.id && <CheckCircle2 size={16} className="text-primary shrink-0" />}

          <button
            onClick={(e) => { e.stopPropagation(); eliminarTarjeta(tc.id); }}
            className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </button>
      ))}
      <Button size="sm" variant="outline" onClick={onAgregar} className="w-full gap-1.5 mt-1">
        <CreditCard size={13} />
        {t.agregarOtraTarjeta ?? "Agregar otra tarjeta"}
      </Button>
    </div>
  );
}

// ── Modal principal ───────────────────────────────────────────────────────────
interface AgregarTarjetaModalProps {
  open: boolean;
  onClose: () => void;
  onGuardada?: (tarjeta: TarjetaGuardada) => void;
}

export function AgregarTarjetaModal({ open, onClose, onGuardada }: AgregarTarjetaModalProps) {
  const { agregarTarjeta, tarjetas } = useTarjeta();
  const { t } = useLang();

  const [numero, setNumero]   = useState("");
  const [titular, setTitular] = useState("");
  const [expiry, setExpiry]   = useState("");
  const [cvv, setCvv]         = useState("");
  const [showBack, setShowBack] = useState(false);
  const [esPrincipal, setEsPrincipal] = useState(tarjetas.length === 0);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [guardada, setGuardada] = useState(false);

  const marca = detectarMarca(numero);
  const maxLen = longitidMaxima(marca);

  const handleNumero = (v: string) => {
    const m = detectarMarca(v);
    setNumero(formatearNumeroTarjeta(v, m));
    setErrors((p) => ({ ...p, numero: "" }));
  };

  const handleExpiry = (v: string) => {
    const solo = v.replace(/\D/g, "").slice(0, 4);
    let fmt = solo;
    if (solo.length >= 3) fmt = solo.slice(0, 2) + "/" + solo.slice(2);
    setExpiry(fmt);
    setErrors((p) => ({ ...p, expiry: "" }));
  };

  const handleCvv = (v: string) => {
    const max = marca === "amex" ? 4 : 3;
    setCvv(v.replace(/\D/g, "").slice(0, max));
    setErrors((p) => ({ ...p, cvv: "" }));
  };

  const validar = () => {
    const e: Record<string, string> = {};
    const soloDigitos = numero.replace(/\s/g, "");
    const minLen = marca === "amex" ? 15 : 16;
    if (soloDigitos.length < minLen) e.numero = t.errorNumeroTarjeta ?? "Número de tarjeta inválido";
    if (!titular.trim() || titular.trim().length < 3) e.titular = t.errorTitular ?? "Ingresa el nombre del titular";
    const [mes, anio] = expiry.split("/");
    const mesN = parseInt(mes ?? "0");
    const anioN = parseInt("20" + (anio ?? "0"));
    const hoy = new Date();
    if (!mes || !anio || mesN < 1 || mesN > 12 || anioN < hoy.getFullYear() ||
        (anioN === hoy.getFullYear() && mesN < hoy.getMonth() + 1)) {
      e.expiry = t.errorExpiry ?? "Fecha de vencimiento inválida";
    }
    const cvvMin = marca === "amex" ? 4 : 3;
    if (cvv.length < cvvMin) e.cvv = t.errorCvv ?? "CVV inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = () => {
    if (!validar()) return;
    const soloDigitos = numero.replace(/\s/g, "");
    const [mes, anio] = expiry.split("/");
    const nueva = agregarTarjeta({
      titular: titular.trim().toUpperCase(),
      ultimos4: soloDigitos.slice(-4),
      marca,
      mesVencimiento: mes,
      anioVencimiento: anio,
      esPrincipal: esPrincipal || tarjetas.length === 0,
    });
    setGuardada(true);
    setTimeout(() => {
      onGuardada?.(nueva);
      onClose();
      // reset
      setNumero(""); setTitular(""); setExpiry(""); setCvv("");
      setGuardada(false); setShowBack(false);
    }, 900);
  };

  const handleClose = () => {
    if (!guardada) {
      setNumero(""); setTitular(""); setExpiry(""); setCvv("");
      setErrors({}); setShowBack(false); setGuardada(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CreditCard size={17} className="text-primary" />
            {t.agregarTarjeta ?? "Agregar tarjeta"}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1 text-xs">
            <Lock size={11} />
            {t.tarjetaSegura ?? "Solo guardamos los últimos 4 dígitos. Nunca el número completo."}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {guardada ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2 py-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 size={28} className="text-emerald-600" />
              </div>
              <p className="font-semibold">{t.tarjetaGuardada ?? "Tarjeta guardada"}</p>
              <p className="text-xs text-muted-foreground">•••• {numero.replace(/\s/g, "").slice(-4)}</p>
            </motion.div>
          ) : (
            <motion.div key="form" className="space-y-4">
              {/* Vista previa */}
              <TarjetaVisual numero={numero} titular={titular} expiry={expiry} cvv={cvv} showBack={showBack} marca={marca} />

              {/* Número */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t.numeroTarjeta ?? "Número de tarjeta"}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                  value={numero}
                  maxLength={maxLen}
                  onChange={(e) => handleNumero(e.target.value)}
                  onFocus={() => setShowBack(false)}
                  className={`w-full rounded-md border px-3 py-2 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.numero ? "border-destructive" : ""}`}
                />
                {errors.numero && <p className="text-xs text-destructive">{errors.numero}</p>}
              </div>

              {/* Titular */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t.titularTarjeta ?? "Titular de la tarjeta"}
                </label>
                <input
                  type="text"
                  autoComplete="cc-name"
                  placeholder="NOMBRE APELLIDO"
                  value={titular}
                  onChange={(e) => { setTitular(e.target.value.toUpperCase()); setErrors((p) => ({ ...p, titular: "" })); }}
                  onFocus={() => setShowBack(false)}
                  className={`w-full rounded-md border px-3 py-2 text-sm uppercase tracking-wide bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.titular ? "border-destructive" : ""}`}
                />
                {errors.titular && <p className="text-xs text-destructive">{errors.titular}</p>}
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t.vencimiento ?? "Vencimiento"}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    value={expiry}
                    maxLength={5}
                    onChange={(e) => handleExpiry(e.target.value)}
                    onFocus={() => setShowBack(false)}
                    className={`w-full rounded-md border px-3 py-2 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.expiry ? "border-destructive" : ""}`}
                  />
                  {errors.expiry && <p className="text-xs text-destructive">{errors.expiry}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    CVV
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder={marca === "amex" ? "••••" : "•••"}
                    value={cvv}
                    maxLength={marca === "amex" ? 4 : 3}
                    onChange={(e) => handleCvv(e.target.value)}
                    onFocus={() => setShowBack(true)}
                    onBlur={() => setShowBack(false)}
                    className={`w-full rounded-md border px-3 py-2 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.cvv ? "border-destructive" : ""}`}
                  />
                  {errors.cvv && <p className="text-xs text-destructive">{errors.cvv}</p>}
                </div>
              </div>

              {/* Principal */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={esPrincipal || tarjetas.length === 0}
                  disabled={tarjetas.length === 0}
                  onChange={(e) => setEsPrincipal(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">{t.establecerPrincipal ?? "Establecer como método principal"}</span>
              </label>

              {/* Acciones */}
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={handleClose}>{t.cancelar ?? "Cancelar"}</Button>
                <Button size="sm" onClick={handleGuardar} className="gap-1.5">
                  <Lock size={13} />
                  {t.guardarTarjeta ?? "Guardar tarjeta"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
