import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Subscribe from "./pages/Subscribe";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Charities from "./pages/Charities";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/charities" element={<Charities />} />

          {/* Auth-protected */}
          <Route
            path="/subscribe"
            element={
              <ProtectedRoute>
                <Subscribe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin-only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20">
                <div className="text-6xl mb-4">⛳</div>
                <h1
                  className="text-4xl font-bold mb-3"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  404 — Out of Bounds
                </h1>
                <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
                  This page doesn't exist.
                </p>
                <a href="/" className="btn-primary px-6 py-3">
                  Back to Home →
                </a>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
