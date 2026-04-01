"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import type { LoginCredentials, AuthResponse } from "@/app/types/auth";

type UserRole = "PET_OWNER" | "SERVICE_PROVIDER" | "ADMIN";

export default function Login() {
  const [credentials, setCredentials] = useState<LoginCredentials>({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState<UserRole>("PET_OWNER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const tabs: { role: UserRole; label: string }[] = [
    { role: "PET_OWNER",        label: "Pet Owner"  },
    { role: "SERVICE_PROVIDER", label: "Provider"   },
    { role: "ADMIN",            label: "Admin"      },
  ];

  const routes: Record<UserRole, string> = {
    PET_OWNER:        "/owner",
    SERVICE_PROVIDER: "/provider",
    ADMIN:            "/admin",
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (loginError) throw loginError;
      if (!authData.session) throw new Error("No session returned");

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error("Account not found. Please register first.");
      }

      const roleMap: Record<string, UserRole> = {
        owner: "PET_OWNER",
        provider: "SERVICE_PROVIDER",
        admin: "ADMIN",
      };
      const actualRole = roleMap[profile.role] ?? "PET_OWNER";

      if (actualRole !== selectedRole) {
        await supabase.auth.signOut();
        const label = tabs.find(t => t.role === actualRole)?.label ?? profile.role;
        throw new Error(`This account is registered as a ${label}. Please select the correct role tab.`);
      }

      const token = authData.session.access_token;
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      document.cookie = `role=${selectedRole}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;

      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData: AuthResponse = await response.json();

      if (userData.success && userData.data) {
        router.push(routes[selectedRole]);
      } else {
        throw new Error(userData.message || "Authentication failed.");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: "linear-gradient(135deg, #1A2332 0%, #2D4A6B 100%)",
      fontFamily: "'Nunito', sans-serif",
    }}>
      {/* Subtle background texture */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
        backgroundSize: "36px 36px",
      }} />
      <div className="fixed top-0 right-0 w-150 h-150 rounded-full opacity-10 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"
        style={{ background: "var(--fur-teal)" }} />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--fur-teal)" }}>
            <svg width="17" height="17" viewBox="0 0 100 100" fill="white">
              <ellipse cx="50" cy="72" rx="22" ry="16" />
              <ellipse cx="17" cy="44" rx="10" ry="13" />
              <ellipse cx="37" cy="30" rx="10" ry="13" />
              <ellipse cx="63" cy="30" rx="10" ry="13" />
              <ellipse cx="83" cy="44" rx="10" ry="13" />
            </svg>
          </div>
          <span className="text-xl font-900 text-white" style={{ fontFamily: "'Fraunces', serif" }}>FurSure</span>
        </div>
        <button
          onClick={() => router.push("/register")}
          className="text-sm font-700 px-5 py-2 rounded-full border transition-all"
          style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "transparent"; }}
        >
          Create Account
        </button>
      </nav>

      {/* Hero + Form */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Headline */}
        <div className="text-center mb-10">
          <p className="text-sm font-700 uppercase tracking-widest mb-4" style={{ color: "var(--fur-teal)" }}>
            Welcome back
          </p>
          <h1 className="text-4xl md:text-6xl font-900 text-white mb-5 leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}>
            Your Pet Hub Awaits
          </h1>
          <p className="text-lg max-w-md mx-auto" style={{ color: "#7A90A8" }}>
            Sign in to manage bookings, track your pets&apos; care, and connect with trusted providers.
          </p>
        </div>

        {/* Form card */}
        <div className="w-full max-w-md rounded-3xl p-8 shadow-2xl"
          style={{ background: "white" }}>

          {/* Role tabs */}
          <div className="flex gap-1.5 mb-7 p-1 rounded-xl" style={{ background: "var(--fur-mist)" }}>
            {tabs.map((tab) => (
              <button
                key={tab.role}
                type="button"
                onClick={() => setSelectedRole(tab.role)}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-700 transition-all"
                style={selectedRole === tab.role
                  ? { background: "white", color: "var(--fur-teal)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }
                  : { color: "var(--fur-slate-light)" }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>
                Email Address
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials((p) => ({ ...p, email: e.target.value }))}
                required
                disabled={loading}
                placeholder="you@example.com"
                className="fur-input"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-700 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)" }}>Password</label>
                <a href="/forgot-password" className="text-xs font-600 hover:underline" style={{ color: "var(--fur-teal)" }}>
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials((p) => ({ ...p, password: e.target.value }))}
                  required
                  disabled={loading}
                  placeholder="••••••••"
                  className="fur-input pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-700"
                  style={{ color: "var(--fur-slate-light)" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs font-600" style={{ color: "var(--fur-rose)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm disabled:opacity-60"
            >
              {loading ? "Logging in..." : `Log In as ${tabs.find(t => t.role === selectedRole)?.label}`}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm mb-4" style={{ color: "var(--fur-slate-light)" }}>Don&apos;t have an account?</p>
            <button
              onClick={() => router.push("/register")}
              className="btn-secondary w-full py-2.5 text-sm"
            >
              Create an Account
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-xs" style={{ color: "#4A6280" }}>© 2025 FurSure · Making pet care easy, one booking at a time</p>
      </div>
    </div>
  );
}
