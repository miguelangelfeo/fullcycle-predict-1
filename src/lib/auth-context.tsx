import { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole = "gerente" | "cocina" | "compras" | "sostenibilidad";

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const MOCK_USERS: Record<string, { password: string; name: string; role: UserRole }> = {
  "gerente@fullcycle.com": { password: "Gerente123!", name: "Carlos Mendoza", role: "gerente" },
  "cocina@fullcycle.com": { password: "Cocina123!", name: "María García", role: "cocina" },
  "compras@fullcycle.com": { password: "Compras123!", name: "Luis Pérez", role: "compras" },
  "sostenibilidad@fullcycle.com": { password: "Sosten123!", name: "Ana Rodríguez", role: "sostenibilidad" },
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    const normalized = email.toLowerCase().trim();
    const mockUser = MOCK_USERS[normalized];
    if (!mockUser) return { success: false, error: "Usuario no encontrado" };
    if (mockUser.password !== password) return { success: false, error: "Contraseña incorrecta" };
    setUser({ email: normalized, name: mockUser.name, role: mockUser.role });
    return { success: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
