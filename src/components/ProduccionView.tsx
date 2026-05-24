import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, AlertTriangle, CheckCircle2, ClipboardList, Heart } from "lucide-react";
import { produccionRecomendada, bancosAlimentos, BancoAlimentos } from "@/lib/mock-data";
import { StatCard } from "./StatCard";
import { useState } from "react";
import { useLang } from "@/lib/lang-context";
import { useInventario, type RegistroDesperdicio } from "@/lib/inventario-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";

export function ProduccionView() {
  const { t } = useLang();
  const { registrosDesperdicio, agregarDesperdicio, donarDesperdicioHoy, donarRegistro } = useInventario();
  
  // Estado local para confirmación de optimización de ítem individual
  const [itemPorOptimizar, setItemPorOptimizar] = useState<typeof produccionRecomendada[0] | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Estado local para el proceso de donación
  const [donarOpen, setDonarOpen] = useState(false);
  const [donarSuccess, setDonarSuccess] = useState(false);
  const [cantidadDonadaExito, setCantidadDonadaExito] = useState(0);
  const [bancoSeleccionado, setBancoSeleccionado] = useState<BancoAlimentos | null>(null);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroDesperdicio | null>(null);
  const [pendingQueue, setPendingQueue] = useState<typeof registrosDesperdicio>([]);
  const [pendingIndex, setPendingIndex] = useState(0);
  const [candidateBancos, setCandidateBancos] = useState<BancoAlimentos[]>([]);

  const hoy = new Date().toISOString().slice(0, 10);
  const registrosHoy = registrosDesperdicio.filter((r) => r.fecha === hoy);

  const produccionSteps = [
    { number: 1, title: t.produccionPaso1Title, description: t.produccionPaso1Desc },
    { number: 2, title: t.produccionPaso2Title, description: t.produccionPaso2Desc },
    { number: 3, title: t.produccionPaso3Title, description: t.produccionPaso3Desc },
  ];
  const totalDesperdicioHoy = registrosHoy.reduce((s, r) => s + r.cantidad, 0);

  // Excedentes aún no donados hoy
  const excedentesPendientesDonacion = registrosHoy.filter((r) => r.estado !== "donado");
  const totalPendienteDonacion = excedentesPendientesDonacion.reduce((s, r) => s + r.cantidad, 0);

  // Obtener el conjunto de nombres de ítems ya registrados el día de hoy
  const itemsRegistradosHoy = new Set(registrosHoy.map((r) => r.item));

  // Filtrar las recomendaciones activas (las que aún no han sido registradas hoy)
  const activeItems = produccionRecomendada.filter((item) => !itemsRegistradosHoy.has(item.item));

  // Cantidad de ítems optimizados hoy (los que ya están en los registros de hoy)
  const optimizadosCount = produccionRecomendada.filter((item) => itemsRegistradosHoy.has(item.item)).length;

  // Ahorro potencial dinámico basado únicamente en lo que queda pendiente en la tabla
  const totalAhorro = activeItems.reduce((s, i) => s + (i.actual - i.recomendado), 0);

  const handleRegistrarClick = (item: typeof produccionRecomendada[0]) => {
    setItemPorOptimizar(item);
    setConfirmOpen(true);
  };

  const confirmarOptimizacion = () => {
    if (!itemPorOptimizar) return;
    const diff = itemPorOptimizar.actual - itemPorOptimizar.recomendado;
    
    // 1. Agregar a desperdicio global (automáticamente se almacena y persiste en el hook useInventario)
    agregarDesperdicio({
      item: itemPorOptimizar.item,
      cantidad: diff,
      fecha: hoy,
    });

    // 2. Cerrar confirmación y limpiar selección
    setConfirmOpen(false);
    setItemPorOptimizar(null);
  };

  const handleDonarClick = () => {
    // Iniciar cola de donaciones: confirmaciones por registro en orden
    const pendientes = excedentesPendientesDonacion;
    if (pendientes.length === 0) return;

    // Inicializar queue (copia para proceso secuencial)
    setPendingQueue(pendientes);
    setPendingIndex(0);
    const first = pendientes[0];

    // Seleccionar candidatos (top 3) para el primer registro
    const computeTopCandidates = (itemName: string, cantidad: number) => {
      const name = itemName.toLowerCase();
      const scores = bancosAlimentos.map((b) => {
        let score = 0;
        b.necesidades.forEach((k) => {
          if (name.includes(k.toLowerCase())) score += cantidad;
        });
        return { banco: b, score };
      });
      // Si todos score 0, fallback por distancia+fiabilidad
      const anyPositive = scores.some((s) => s.score > 0);
      if (!anyPositive) {
        return bancosAlimentos.slice().sort((a, b) => a.distanciaKm - b.distanciaKm || b.fiabilidadPct - a.fiabilidadPct).slice(0, 3);
      }
      return scores.sort((a, b) => b.score - a.score || a.banco.distanciaKm - b.banco.distanciaKm).map((s) => s.banco).slice(0, 3);
    };

    const candidates = computeTopCandidates(first.item, first.cantidad);
    setCandidateBancos(candidates);
    setRegistroSeleccionado(first);
    setBancoSeleccionado(candidates[0] || null);
    setCantidadDonadaExito(0);
    setDonarOpen(true);
    setDonarSuccess(false);
  };

  const handleDonarRegistroClick = (registro: typeof registrosDesperdicio[0]) => {
    // Seleccionar banco basado únicamente en el nombre del ítem del registro
    const nombre = registro.item.toLowerCase();
    let maxScore = 0;
    let elegido: BancoAlimentos | null = null;
    const computeTopCandidates = (itemName: string, cantidad: number) => {
      const name = itemName.toLowerCase();
      const scores = bancosAlimentos.map((b) => {
        let score = 0;
        b.necesidades.forEach((k) => {
          if (name.includes(k.toLowerCase())) score += cantidad;
        });
        return { banco: b, score };
      });
      const anyPositive = scores.some((s) => s.score > 0);
      if (!anyPositive) {
        return bancosAlimentos.slice().sort((a, b) => a.distanciaKm - b.distanciaKm || b.fiabilidadPct - a.fiabilidadPct).slice(0, 3);
      }
      return scores.sort((a, b) => b.score - a.score || a.banco.distanciaKm - b.banco.distanciaKm).map((s) => s.banco).slice(0, 3);
    };

    const candidates = computeTopCandidates(registro.item, registro.cantidad);
    // Single-item queue
    setPendingQueue([registro]);
    setPendingIndex(0);
    setRegistroSeleccionado(registro);
    setCandidateBancos(candidates);
    setBancoSeleccionado(candidates[0] || null);
    setCantidadDonadaExito(0);
    setDonarOpen(true);
    setDonarSuccess(false);
  };

  const confirmarDonacion = () => {
    if (registroSeleccionado) {
      // Donar el registro actual
      donarRegistro(registroSeleccionado.item, registroSeleccionado.fecha);
      const nuevoAcumulado = cantidadDonadaExito + registroSeleccionado.cantidad;
      setCantidadDonadaExito(nuevoAcumulado);

      // Avanzar en la cola
      const nextIndex = pendingIndex + 1;
      if (nextIndex < pendingQueue.length) {
        const next = pendingQueue[nextIndex];
        // Seleccionar candidatos y banco para siguiente
        const computeTopCandidates = (itemName: string, cantidad: number) => {
          const name = itemName.toLowerCase();
          const scores = bancosAlimentos.map((b) => {
            let score = 0;
            b.necesidades.forEach((k) => {
              if (name.includes(k.toLowerCase())) score += cantidad;
            });
            return { banco: b, score };
          });
          const anyPositive = scores.some((s) => s.score > 0);
          if (!anyPositive) {
            return bancosAlimentos.slice().sort((a, b) => a.distanciaKm - b.distanciaKm || b.fiabilidadPct - a.fiabilidadPct).slice(0, 3);
          }
          return scores.sort((a, b) => b.score - a.score || a.banco.distanciaKm - b.banco.distanciaKm).map((s) => s.banco).slice(0, 3);
        };

        const candidates = computeTopCandidates(next.item, next.cantidad);
        setPendingIndex(nextIndex);
        setRegistroSeleccionado(next);
        setCandidateBancos(candidates);
        setBancoSeleccionado(candidates[0] || null);
        // mantener dialogo abierto para siguiente confirmación
        return;
      }

      // Si no quedan más, terminar proceso
      setRegistroSeleccionado(null);
      setPendingQueue([]);
      setPendingIndex(0);
      setDonarSuccess(true);
      return;
    }

    // Si no hay registroSeleccionado, es una donación global (fallback)
    setCantidadDonadaExito(totalPendienteDonacion);
    donarDesperdicioHoy();
    setDonarSuccess(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.produccionTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.produccionSub}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {produccionSteps.map((step) => (
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

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title={t.reservasDia} value="187" icon={<ChefHat size={20} />} />
        <StatCard title={t.reduccionPotencial} value={`${totalAhorro} ${t.unidades}`} icon={<AlertTriangle size={20} />} variant="warning" />
        <StatCard title={t.itemsAceptados} value={`${optimizadosCount}/${produccionRecomendada.length}`} icon={<CheckCircle2 size={20} />} variant="success" />
        <StatCard title={t.desperdicioRegistrado} value={`${totalDesperdicioHoy.toFixed(1)} kg`} icon={<ClipboardList size={20} />} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card">
        <div className="border-b px-5 py-3">
          <p className="text-xs text-muted-foreground">{t.produccionTableHint}</p>
        </div>
        <div className="grid grid-cols-8 gap-4 border-b px-5 py-3 text-xs font-semibold text-muted-foreground">
          <span className="col-span-2">{t.item}</span>
          <span>{t.actual}</span>
          <span>{t.recomendado}</span>
          <span>{t.unidad}</span>
          <span>{t.confianza}</span>
          <span className="col-span-2">{t.registrarDesperdicio}</span>
        </div>

        <AnimatePresence mode="popLayout">
          {activeItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-10 text-center gap-3"
            >
              <CheckCircle2 size={48} className="text-success" />
              <div>
                <p className="text-sm font-semibold text-foreground">¡Todo en orden!</p>
                <p className="text-xs text-muted-foreground mt-1">Todos los productos recomendados han sido optimizados con éxito para el día de hoy.</p>
              </div>
            </motion.div>
          ) : (
            activeItems.map((item, i) => (
              <motion.div
                key={item.item}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-8 gap-4 border-b px-5 py-3 text-sm last:border-0 items-center"
              >
                <span className="col-span-2 font-medium">{item.item}</span>
                <span className="text-muted-foreground">{item.actual}</span>
                <span className="font-semibold text-primary">{item.recomendado}</span>
                <span className="text-muted-foreground">{item.unidad}</span>
                <span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.confianza >= 93 ? "bg-success/10 text-success" : item.confianza >= 90 ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                  }`}>
                    {item.confianza}%
                  </span>
                </span>
                <span className="col-span-2 flex items-center gap-3">
                  <span className="font-semibold text-destructive">
                    {item.actual - item.recomendado} {item.unidad}
                  </span>
                  <button
                    onClick={() => handleRegistrarClick(item)}
                    className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                  >
                    Registrar
                  </button>
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Registros de hoy */}
      {registrosHoy.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card">
          <div className="border-b px-5 py-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t.registrosHoy} ({registrosHoy.length})</h3>
            {totalPendienteDonacion > 0 && (
              <button
                onClick={handleDonarClick}
                className="rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Heart size={14} className="fill-current" />
                Donar excedentes a Banco de Alimentos ({totalPendienteDonacion.toFixed(1)} kg)
              </button>
            )}
          </div>
          <div className="px-5 py-3 text-xs text-muted-foreground border-b">
            {t.produccionRegistrosHint}
          </div>
          <div className="grid grid-cols-3 gap-4 border-b px-5 py-2 text-xs font-semibold text-muted-foreground">
            <span>{t.item}</span>
            <span>{t.cantidadKg}</span>
            <span>{t.estado}</span>
          </div>
          {registrosHoy.map((r, i) => (
            <div key={`${r.item}-${i}`} className="grid grid-cols-3 gap-4 border-b px-5 py-2.5 text-sm last:border-0 items-center">
              <span className="font-medium">{r.item}</span>
              <span className="text-destructive font-semibold">{r.cantidad} kg</span>
              <span>
                {r.estado === "donado" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                    <Heart size={10} className="fill-current" /> Donado a Banco de Alimentos
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-semibold text-warning">
                      <CheckCircle2 size={10} /> {t.desperdicioRegistrado}
                    </span>
                    <button
                      onClick={() => handleDonarRegistroClick(r)}
                      className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                    >
                      Donar
                    </button>
                  </div>
                )}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Ventana de Confirmación de Optimización */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="text-primary" />
              Confirmar Optimización
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm">
              ¿Seguro que quiere registrar{" "}
              <strong className="text-destructive">
                {itemPorOptimizar ? itemPorOptimizar.actual - itemPorOptimizar.recomendado : 0}{" "}
                {itemPorOptimizar?.unidad}
              </strong>{" "}
              de desperdicio para <strong>"{itemPorOptimizar?.item}"</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <button
              onClick={() => setConfirmOpen(false)}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarOptimizacion}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Aceptar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ventana de Donación a Banco de Alimentos */}
      <Dialog open={donarOpen} onOpenChange={setDonarOpen}>
        <DialogContent className="max-w-md">
          {!donarSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-col gap-2 text-foreground">
                  <div className="flex items-center gap-2">
                    <Heart className="text-primary fill-current" size={20} />
                    Donar Excedentes Alimentarios
                  </div>
                  {pendingQueue.length > 1 && registroSeleccionado ? (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Paso {pendingIndex + 1} de {pendingQueue.length}
                    </span>
                  ) : null}
                </DialogTitle>
                <DialogDescription className="pt-3 space-y-4">
                  {registroSeleccionado ? (
                    <p className="text-sm">
                      Estás a punto de donar <strong className="text-primary text-base font-bold">{registroSeleccionado.cantidad} {registroSeleccionado.cantidad === 1 ? registroSeleccionado.item : "kg"}</strong> de <strong>{registroSeleccionado.item}</strong>.
                    </p>
                  ) : (
                    <p className="text-sm">
                      Estás a punto de donar un total de <strong className="text-primary text-base font-bold">{totalPendienteDonacion.toFixed(1)} kg</strong> de excedentes alimentarios aptos para consumo humano.
                    </p>
                  )}
                  
                  {/* Tarjeta del Banco de Alimentos asignado */}
                  <div className="rounded-xl border bg-muted/40 p-4 space-y-2">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">Elige banco receptor</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Selecciona uno de los bancos sugeridos para esta donación.</p>
                    </div>
                    <div className="grid gap-2 pt-2">
                      {candidateBancos.length > 0 ? (
                        candidateBancos.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => setBancoSeleccionado(b)}
                            className={`w-full text-left rounded-lg border p-3 transition-colors ${bancoSeleccionado?.id === b.id ? "border-primary bg-primary/5" : "border-transparent hover:border-muted"}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-sm">{b.nombre}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{b.badge || "Socio de Red"}</div>
                              </div>
                              <div className="text-right text-xs">
                                <div className="text-foreground">{b.distanciaKm} km</div>
                                <div className="text-success">{b.fiabilidadPct.toFixed(1)}%</div>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">Banco de Alimentos (Asignación automática)</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">Se seleccionará el banco más cercano o disponible para esta donación.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-3 text-xs text-primary leading-relaxed border border-primary/10">
                    💡 <strong>Inocuidad Alimentaria:</strong> Toda donación consolidada se notifica instantáneamente al centro logístico del Banco de Alimentos. El camión de recolección preservará la cadena de frío para su distribución inmediata a comedores sociales.
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 flex gap-2 justify-end">
                <button
                  onClick={() => setDonarOpen(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarDonacion}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition-all flex items-center gap-1 shadow-md"
                >
                  <Heart size={14} className="fill-current" />
                  Confirmar Donación
                </button>
              </DialogFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="rounded-full bg-success/15 p-4 text-success"
              >
                <Heart size={48} className="fill-current animate-pulse" />
              </motion.div>
              <div>
                <DialogTitle className="text-xl font-bold text-foreground">¡Donación Programada con Éxito!</DialogTitle>
                <DialogDescription className="mt-2 text-sm max-w-sm">
                  {bancoSeleccionado ? (
                    <>{bancoSeleccionado.nombre} ha recibido la solicitud. El recolector asignado llegará en aproximadamente <strong>35 minutos</strong>.</>
                  ) : (
                    <>El banco receptor ha recibido la solicitud. El recolector asignado llegará en aproximadamente <strong>35 minutos</strong>.</>
                  )}
                </DialogDescription>
              </div>
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg border w-full text-left space-y-1">
                <div className="flex justify-between">
                  <span>ID de Operación:</span>
                  <strong className="text-foreground">DON-{Math.floor(100000 + Math.random() * 900000)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Cantidad Donada:</span>
                  <strong className="text-foreground">{cantidadDonadaExito.toFixed(1)} kg</strong>
                </div>
                <div className="flex justify-between">
                  <span>Manifiesto Digital:</span>
                  <strong className="text-success font-medium">Enviado al correo</strong>
                </div>
              </div>
              <button
                onClick={() => setDonarOpen(false)}
                className="mt-2 w-full rounded-lg bg-success hover:bg-success/90 text-success-foreground py-2 text-sm font-bold shadow-md transition-colors"
              >
                Entendido
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
