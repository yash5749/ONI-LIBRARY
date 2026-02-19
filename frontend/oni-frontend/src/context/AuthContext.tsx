import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

interface User {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAdmin: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(null);

  const isAdmin = user?.role === "admin";

  const loadUser = async (tk: string) => {
    try {
      const res = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${tk}` },
      });
      setUser(res.data);
    } catch (err) {
      console.log("Failed to load user", err);
      //logout();
    }
  };

  const login = async (tk: string) => {
    localStorage.setItem("token", tk);
    console.log(tk);
    //console.log("TOKEN TYPE:", typeof tk);
    
    setToken(tk);
    await loadUser(tk);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) loadUser(token);
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
