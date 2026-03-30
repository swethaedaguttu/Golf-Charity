import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("gc_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  // Sync user state to localStorage
  const persistUser = (userData) => {
    if (userData) {
      localStorage.setItem("gc_user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("gc_user");
      localStorage.removeItem("gc_token");
    }
    setUser(userData);
  };

  // Refresh user profile from server
  const refreshUser = async () => {
    try {
      const res = await api.get("/api/user/profile");
      persistUser(res.data);
      return res.data;
    } catch {
      return null;
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("gc_token", res.data.token);
      persistUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "Login failed." };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, charity) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", { name, email, password, charity });
      localStorage.setItem("gc_token", res.data.token);
      persistUser(res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "Registration failed." };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    persistUser(null);
    window.location.href = "/";
  };

  const updateUser = (patch) => {
    const updated = { ...user, ...patch };
    persistUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
