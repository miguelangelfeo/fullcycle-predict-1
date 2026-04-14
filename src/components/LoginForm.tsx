import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import { Recycle, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "El correo es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Correo inválido";
    if (!password) e.password = "La contraseña es obligatoria";
    else if (password.length < 6) e.password = "Mínimo 6 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    const result = login(email, password);
    if (!result.success) setError(result.error || "Error al iniciar sesión");
  };

  return (
    <div className="flex min-h-screen">
      <div className="gradient-hero hidden flex-1 items-center justify-center lg:flex">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md px-12 text-center"
        >
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm">
            <Recycle size={40} className="text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-primary-foreground">
            FullCycle Solutions
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/70">
            Reduciendo el desperdicio alimentario en hoteles y cruceros. Alineados con el ODS 2: Hambre Cero.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { val: "1,240", label: "kg rescatados" },
              { val: "12.5%", label: "reducción" },
              { val: "3,224", label: "kg CO₂ evitados" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-primary-foreground/10 p-3 backdrop-blur-sm">
                <p className="text-xl font-bold text-primary-foreground">{s.val}</p>
                <p className="text-xs text-primary-foreground/60">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Recycle size={22} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FullCycle</span>
          </div>

          <h2 className="text-2xl font-bold">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresa tus credenciales para acceder al sistema
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="gerente@fullcycle.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full">
              Ingresar
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-muted p-4">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Credenciales de prueba:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium">Gerente:</span> gerente@fullcycle.com / Gerente123!</p>
              <p><span className="font-medium">Cocina:</span> cocina@fullcycle.com / Cocina123!</p>
              <p><span className="font-medium">Compras:</span> compras@fullcycle.com / Compras123!</p>
              <p><span className="font-medium">Sostenibilidad:</span> sostenibilidad@fullcycle.com / Sosten123!</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
