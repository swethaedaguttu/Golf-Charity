import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`text-sm font-medium transition-colors duration-150 ${
        isActive(to)
          ? "text-brand-400"
          : "text-slate-400 hover:text-slate-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: "rgba(8,12,14,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5">
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
          style={{
            background: "linear-gradient(135deg, #22c55e, #15803d)",
            fontFamily: "Syne, sans-serif",
          }}
        >
          P
        </span>
        <span
          className="text-base font-bold tracking-tight"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          Par &amp; Purpose
        </span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-6">
        {navLink("/", "Home")}
        {navLink("/charities", "Charities")}
        {user && navLink("/dashboard", "Dashboard")}
        {user?.role === "admin" && navLink("/admin", "Admin")}
      </div>

      {/* Auth actions */}
      <div className="hidden md:flex items-center gap-3">
        {user ? (
          <>
            <span className="text-xs text-slate-500 font-medium">{user.name}</span>
            {user.subscriptionStatus !== "active" && (
              <button
                className="btn-primary text-xs px-4 py-2"
                onClick={() => navigate("/subscribe")}
              >
                Subscribe
              </button>
            )}
            <button
              onClick={logout}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-slate-400 hover:text-slate-100 font-medium transition-colors">
              Login
            </Link>
            <Link to="/register" className="btn-primary text-xs px-4 py-2">
              Get Started
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-slate-400 hover:text-white transition-colors"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {menuOpen ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 flex flex-col gap-4 px-6 py-5 md:hidden"
          style={{
            background: "rgba(13,17,23,0.97)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {navLink("/", "Home")}
          {navLink("/charities", "Charities")}
          {user && navLink("/dashboard", "Dashboard")}
          {user?.role === "admin" && navLink("/admin", "Admin")}
          <div className="border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{user.email}</span>
                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="text-xs text-red-400 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-xs py-2 px-4">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-xs py-2 px-4">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
