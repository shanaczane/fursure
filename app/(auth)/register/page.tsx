"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import type { RegisterData } from "@/app/types/auth";

type RegisterRole = "PET_OWNER" | "SERVICE_PROVIDER" | "ADMIN";

const roleToDb: Record<RegisterRole, string> = {
  PET_OWNER:        "owner",
  SERVICE_PROVIDER: "provider",
  ADMIN:            "admin",
};

const routes: Record<RegisterRole, string> = {
  PET_OWNER:        "/owner",
  SERVICE_PROVIDER: "/provider",
  ADMIN:            "/admin",
};

export default function Register() {
  const [formData, setFormData] = useState<RegisterData>({
    email: "", password: "", firstName: "", lastName: "", role: "PET_OWNER",
  });
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // ── Password rules ──────────────────────────────────────────────────
  const passwordRules = [
    { label: "At least 8 characters",        test: (p: string) => p.length >= 8 },
    { label: "Contains a number",            test: (p: string) => /\d/.test(p) },
    { label: "Contains a special character", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
  ];

  const passwordValid = passwordRules.every((r) => r.test(formData.password));

  // ── Role tabs ────────────────────────────────────────────────────────
  const tabs: { role: RegisterRole; label: string; icon: string; desc: string }[] = [
    { role: "PET_OWNER",        label: "Pet Owner", icon: "🐾", desc: "Book and manage pet care services" },
    { role: "SERVICE_PROVIDER", label: "Provider",  icon: "🏢", desc: "List services and manage bookings"  },
    { role: "ADMIN",            label: "Admin",     icon: "🔑", desc: "System administrator access"       },
  ];

  const roleAccent: Record<RegisterRole, { border: string; bg: string; shadow: string; btn: string; badgeBg: string; badgeText: string }> = {
    PET_OWNER:        { border: "#2563EB", bg: "#EFF6FF", shadow: "rgba(37,99,235,0.12)",  btn: "linear-gradient(135deg,#2563EB,#1D4ED8)", badgeBg: "#DBEAFE", badgeText: "#1E40AF" },
    SERVICE_PROVIDER: { border: "#7C3AED", bg: "#F5F3FF", shadow: "rgba(124,58,237,0.12)", btn: "linear-gradient(135deg,#7C3AED,#5B21B6)", badgeBg: "#EDE9FE", badgeText: "#5B21B6" },
    ADMIN:            { border: "#DC2626", bg: "#FFF5F5", shadow: "rgba(220,38,38,0.12)",  btn: "linear-gradient(135deg,#EF4444,#DC2626)", badgeBg: "#FEE2E2", badgeText: "#991B1B" },
  };

  const accent = roleAccent[formData.role as RegisterRole];

  // ── Submit ───────────────────────────────────────────────────────────
  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate password BEFORE hitting the network
    if (!passwordValid) {
      setError("Please make sure your password meets all the requirements below.");
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            firstName: formData.firstName,
            lastName:  formData.lastName,
            role:      formData.role,
          },
        },
      });
      if (signupError) throw signupError;
      if (!authData.user) throw new Error("No user data returned.");

      // Sync to custom users table
      const response = await fetch("/api/auth/sync", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:    authData.user.id,
          email:     formData.email,
          firstName: formData.firstName,
          lastName:  formData.lastName,
          role:      roleToDb[formData.role as RegisterRole],
        }),
      });
      const syncData = await response.json();
      if (!syncData.success) throw new Error(syncData.message || "Failed to sync user.");

      if (authData.session) {
        const token = authData.session.access_token;
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
        document.cookie = `role=${formData.role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
        router.push(routes[formData.role as RegisterRole]);
      } else {
        // Email confirmation required
        router.push("/login");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const currentTab = tabs.find((t) => t.role === formData.role)!;

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Nunito', sans-serif" }}>

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg,#0F172A 0%,#1E293B 100%)" }}
      >
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-20 blur-3xl transition-all duration-700"
          style={{ background: accent.border }}
        />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <span className="text-3xl">🐾</span>
            <span className="text-3xl font-900 text-white" style={{ fontFamily: "'Fraunces', serif" }}>
              FurSure
            </span>
          </div>
          <h2 className="text-4xl font-900 text-white mb-6 leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            {formData.role === "ADMIN"
              ? "Join as a\nSystem Admin"
              : formData.role === "SERVICE_PROVIDER"
              ? "Grow your\npet care business"
              : "Join 10,000+\npet lovers today"}
          </h2>
          <p style={{ color: "#7A90A8" }}>
            {formData.role === "ADMIN"
              ? "Manage platform operations, verify providers, and ensure a safe experience for everyone."
              : formData.role === "SERVICE_PROVIDER"
              ? "List your services, accept bookings, and build your reputation on the FurSure platform."
              : "Connect with the best local pet care providers and give your furry friend the life they deserve."}
          </p>
        </div>

        <div className="relative space-y-4">
          {formData.role === "ADMIN"
            ? ["🛡️ Verify providers", "👥 Monitor accounts", "📋 View system activity", "🔍 Content moderation"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: "#EF4444" }} />
                  <span className="text-sm font-600" style={{ color: "#A0B8D0" }}>{item}</span>
                </div>
              ))
            : formData.role === "SERVICE_PROVIDER"
            ? ["📅 Accept bookings instantly", "🐾 Showcase your services", "⭐ Build your reputation", "💰 Track your earnings", "📊 View analytics"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: "#7C3AED" }} />
                  <span className="text-sm font-600" style={{ color: "#A0B8D0" }}>{item}</span>
                </div>
              ))
            : ["✂️ Professional Grooming", "🏥 Trusted Vets", "🎓 Expert Training", "🏠 Safe Boarding", "🚶 Daily Walking"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--fur-amber)" }} />
                  <span className="text-sm font-600" style={{ color: "#A0B8D0" }}>{item}</span>
                </div>
              ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div
        className="flex-1 flex items-center justify-center p-8 overflow-y-auto"
        style={{ background: "var(--fur-cream)" }}
      >
        <div className="w-full max-w-lg py-8">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">🐾</span>
            <span className="text-2xl font-900" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-teal)" }}>
              FurSure
            </span>
          </div>

          <h1 className="text-3xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
            Create Account
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--fur-slate-light)" }}>
            Choose your role and get started in seconds.
          </p>

          {/* Role cards */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {tabs.map((tab) => {
              const isActive = formData.role === tab.role;
              const ta = roleAccent[tab.role];
              return (
                <button
                  key={tab.role}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, role: tab.role }))}
                  className="p-4 rounded-2xl border-2 text-left transition-all"
                  style={
                    isActive
                      ? { borderColor: ta.border, background: ta.bg, boxShadow: `0 0 0 3px ${ta.shadow}` }
                      : { borderColor: "var(--border)", background: "white" }
                  }
                >
                  <span className="text-2xl block mb-2">{tab.icon}</span>
                  <p className="font-700 text-sm mb-0.5" style={{ color: "var(--fur-slate)" }}>
                    {tab.label}
                  </p>
                  <p className="text-xs leading-snug" style={{ color: "var(--fur-slate-light)" }}>
                    {tab.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Admin notice */}
          {formData.role === "ADMIN" && (
            <div
              className="flex items-start gap-3 mb-6 p-4 rounded-xl text-sm"
              style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B" }}
            >
              <span className="flex-shrink-0 text-base">🔑</span>
              <span className="font-600">
                Admin accounts require manual role assignment in the database after registration.
                Register here, then update your <code className="font-800">role</code> column in the{" "}
                <code className="font-800">users</code> table to <code className="font-800">admin</code>.
              </span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-700 mb-2" style={{ color: "var(--fur-slate)" }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                  required
                  disabled={loading}
                  placeholder="John"
                  className="fur-input"
                />
              </div>
              <div>
                <label className="block text-sm font-700 mb-2" style={{ color: "var(--fur-slate)" }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                  required
                  disabled={loading}
                  placeholder="Doe"
                  className="fur-input"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-700 mb-2" style={{ color: "var(--fur-slate)" }}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                required
                disabled={loading}
                placeholder="you@example.com"
                className="fur-input"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-600"
                  style={{ color: "var(--fur-slate-light)" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                required
                disabled={loading}
                placeholder="Min. 8 characters"
                className="fur-input"
              />

              {/* Live password rules — shown as soon as user starts typing */}
              {formData.password.length > 0 && (
                <div className="mt-3 p-3 rounded-xl space-y-1.5" style={{ background: "var(--fur-mist)" }}>
                  {passwordRules.map((rule) => {
                    const passed = rule.test(formData.password);
                    return (
                      <p
                        key={rule.label}
                        className="text-xs font-600 flex items-center gap-2"
                        style={{ color: passed ? "#059669" : "#DC2626" }}
                      >
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0"
                          style={{ background: passed ? "#059669" : "#DC2626", fontSize: 9 }}
                        >
                          {passed ? "✓" : "✗"}
                        </span>
                        {rule.label}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-3 p-4 rounded-xl text-sm font-600"
                style={{ background: "#FEE2E2", color: "#991B1B", border: "1px solid #FCA5A5" }}
              >
                <span className="flex-shrink-0 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-base font-700 text-white transition-all disabled:opacity-60 mt-2"
              style={{
                background: loading ? "#94A3B8" : accent.btn,
                boxShadow: loading ? "none" : `0 4px 14px ${accent.shadow}`,
              }}
            >
              {loading
                ? "Creating account…"
                : `Create Account as ${currentTab.label}`}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm mb-4" style={{ color: "var(--fur-slate-light)" }}>
              Already have an account?
            </p>
            <button
              onClick={() => router.push("/login")}
              className="btn-secondary w-full py-3"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}