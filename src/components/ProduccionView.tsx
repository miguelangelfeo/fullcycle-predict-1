import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, AlertTriangle, CheckCircle2, ClipboardList, Heart } from "lucide-react";
import { produccionRecomendada } from "@/lib/mock-data";
import { StatCard } from "./StatCard";
import { useState } from "react";
import { useLang } from "@/lib/lang-context";
import { useInventario } from "@/lib/inventario-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";

export function ProduccionView() {
  const { t } = useLang();
  const { registrosDesperdicio, agregarDesperdicio, donarDesperdicioHoy } = useInventario();
  
  // Estado local para confirmación de optimización de ítem individual
  const [itemPorOptimizar, setItemPorOptimizar] = useState<typeof produccionRecomendada[0] | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Estado local para el proceso de donación
  const [donarOpen, setDonarOpen] = useState(false);
  const [donarSuccess, setDonarSuccess] = useState(false);
  const [cantidadDonadaExito, setCantidadDonadaExito] = useState(0);

  const hoy = new Date().toISOString().slice(0, 10);
  const registrosHoy = registrosDesperdicio.filter((r) => r.fecha === hoy);
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
    setDonarOpen(true);
    setDonarSuccess(false);
  };

  const confirmarDonacion = () => {
    setCantidadDonadaExito(totalPendienteDonacion);
    donarDesperdicioHoy();
    setDonarSuccess(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.produccionTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.produccionSub}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title={t.reservasDia} value="187" icon={<ChefHat size={20} />} />
        <StatCard title={t.reduccionPotencial} value={`${totalAhorro} ${t.unidades}`} icon={<AlertTriangle size={20} />} variant="warning" />
        <StatCard title={t.itemsAceptados} value={`${optimizadosCount}/${produccionRecomendada.length}`} icon={<CheckCircle2 size={20} />} variant="success" />
        <StatCard title={t.desperdicioRegistrado} value={`${totalDesperdicioHoy.toFixed(1)} kg`} icon={<ClipboardList size={20} />} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card">
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
            
            {/* Botón de Donar excedentes si hay registros sin donar */}
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
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-semibold text-warning">
                    <CheckCircle2 size={10} /> {t.desperdicioRegistrado}
                  </span>
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
                <DialogTitle className="flex items-center gap-2 text-foreground">
                  <Heart className="text-primary fill-current" size={20} />
                  Donar Excedentes Alimentarios
                </DialogTitle>
                <DialogDescription className="pt-3 space-y-4">
                  <p className="text-sm">
                    Estás a punto de donar un total de{" "}
                    <strong className="text-primary text-base font-bold">
                      {totalPendienteDonacion.toFixed(1)} kg
                    </strong>{" "}
                    de excedentes alimentarios aptos para consumo humano.
                  </p>
                  
                  {/* Tarjeta del Banco de Alimentos asignado */}
                  <div className="rounded-xl border bg-muted/40 p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">Banco de Alimentos Arquidiocesano</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Socio de Red Local de Donaciones</p>
                      </div>
                      <span className="inline-flex rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                        El más confiable
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-muted">
                      <div>
                        <span className="text-muted-foreground block">Distancia</span>
                        <strong className="text-foreground">2.4 km (Cercano)</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Fiabilidad</span>
                        <strong className="text-foreground">99.4% (Excelente)</strong>
                      </div>
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
                  El **Banco de Alimentos Arquidiocesano** ha recibido la solicitud. El recolector asignado llegará en aproximadamente **35 minutos**.
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
