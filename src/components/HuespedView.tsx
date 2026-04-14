import { motion } from "framer-motion";
import { Recycle, Leaf, Heart, Utensils } from "lucide-react";
import { contadorHuesped } from "@/lib/mock-data";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="text-5xl font-bold"
    >
      {value.toLocaleString()}{suffix}
    </motion.span>
  );
}

export function HuespedView() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Recycle size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold">FullCycle Solutions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tu consumo responsable hace la diferencia 🌱</p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 rounded-2xl border bg-card p-8 shadow-lg"
        >
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Esta semana hemos rescatado</p>
          <div className="text-primary">
            <AnimatedCounter value={contadorHuesped.comidaRescatadaSemana} />
            <p className="mt-1 text-lg font-medium">kilogramos de comida</p>
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border bg-card p-5"
          >
            <Utensils size={24} className="mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{contadorHuesped.platosEquivalentes}</p>
            <p className="text-xs text-muted-foreground">platos equivalentes</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border bg-card p-5"
          >
            <Leaf size={24} className="mx-auto mb-2 text-success" />
            <p className="text-2xl font-bold">{contadorHuesped.co2EvitadoSemana}</p>
            <p className="text-xs text-muted-foreground">kg CO₂ evitados</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 rounded-xl bg-primary/5 p-4"
        >
          <Heart size={20} className="mx-auto mb-2 text-primary" />
          <p className="text-sm font-medium text-foreground">
            Juntos contribuimos al ODS 2: Hambre Cero
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Cada porción que sirves con conciencia ayuda a reducir el desperdicio alimentario global.
          </p>
        </motion.div>

        <p className="mt-8 text-xs text-muted-foreground">
          Powered by FullCycle Solutions • Universidad de La Sabana
        </p>
      </motion.div>
    </div>
  );
}
