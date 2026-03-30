import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(form.email, form.password);
    if (res.success) {
      navigate(res.user.role === "admin" ? "/admin" : "/dashboard");
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo mark */}
        <div className="text-center mb-8">
          <span
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg, #22c55e, #15803d)",
              fontFamily: "Syne, sans-serif",
              display: "flex",
            }}
          >
            P
          </span>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
            Welcome back
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Sign in to your account
          </p>
        </div>

        <div className="card p-6">
          {error && <div className="alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 mt-2"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p
            className="text-center text-sm mt-5"
            style={{ color: "var(--text-secondary)" }}
          >
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-400 hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>

        {/* Demo credentials hint */}
        <div
          className="mt-4 rounded-xl px-4 py-3 text-xs text-center"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          Admin demo: <strong className="text-slate-400">admin@golfcharity.com</strong> /{" "}
          <strong className="text-slate-400">Admin@1234</strong>
        </div>
      </div>
    </div>
  );
}
