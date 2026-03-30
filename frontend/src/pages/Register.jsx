import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CHARITIES } from "../data/charities";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    charity: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const res = await register(form.name, form.email, form.password, form.charity);
    if (res.success) {
      navigate("/subscribe");
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
      <div className="w-full max-w-sm animate-slide-up">
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
            Create your account
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Start playing with purpose today
          </p>
        </div>

        <div className="card p-6">
          {error && <div className="alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                minLength={2}
              />
            </div>

            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="label">Choose a charity <span style={{ color: "var(--text-muted)" }}>(optional)</span></label>
              <select
                className="select"
                value={form.charity}
                onChange={(e) => setForm({ ...form, charity: e.target.value })}
              >
                <option value="">Select a charity…</option>
                {CHARITIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 mt-2"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </form>

          <p
            className="text-center text-sm mt-5"
            style={{ color: "var(--text-secondary)" }}
          >
            Already have an account?{" "}
            <Link to="/login" className="text-brand-400 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
