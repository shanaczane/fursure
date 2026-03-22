"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import type { RegisterData } from "@/app/types/auth";

type RegisterRole = "PET_OWNER" | "SERVICE_PROVIDER";

export default function Register() {
  const [formData, setFormData] = useState<RegisterData>({
    email: "", password: "", firstName: "", lastName: "", role: "PET_OWNER",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { firstName: formData.firstName, lastName: formData.lastName, role: formData.role } },
      });
      if (signupError) throw signupError;
      if (!authData.user) throw new Error("No user data returned");

      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: authData.user.id, email: formData.email, firstName: formData.firstName, lastName: formData.lastName, role: formData.role }),
      });
      const syncData = await response.json();
      if (!syncData.success) throw new Error(syncData.message || "Failed to sync user");

      if (authData.session) {
        const token = authData.session.access_token;
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
        document.cookie = `role=${formData.role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
        router.push(formData.role === "SERVICE_PROVIDER" ? "/provider" : "/owner");
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const tabs: { role: RegisterRole; label: string; icon: string; desc: string }[] = [
    { role: "PET_OWNER", label: "Pet Owner", icon: "🐾", desc: "Book and manage pet care services" },
    { role: "SERVICE_PROVIDER", label: "Service Provider", icon: "🏢", desc: "List services and manage bookings" },
  ];

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 auth-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <span className="text-3xl">🐾</span>
            <span className="text-3xl font-900 text-white" style={{ fontFamily: "'Fraunces', serif" }}>FurSure</span>
          </div>
          <h2 className="text-4xl font-900 text-white mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
            Join 10,000+ pet<br />lovers today
          </h2>
          <p style={{ color: "#7A90A8" }}>
            Connect with the best local pet care providers and give your furry friend the life they deserve.
          </p>
        </div>
        <div className="relative space-y-4">
          {["✂️ Professional Grooming", "🏥 Trusted Vets", "🎓 Expert Training", "🏠 Safe Boarding", "🚶 Daily Walking"].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ background: "var(--fur-amber)" }} />
              <span className="text-sm font-600" style={{ color: "#A0B8D0" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto" style={{ background: "var(--fur-cream)" }}>
        <div className="w-full max-w-lg py-8">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">🐾</span>
            <span className="text-2xl font-900" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-teal)" }}>FurSure</span>
          </div>

          <h1 className="text-3xl font-900 mb-2" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>Create Account</h1>
          <p className="text-sm mb-8" style={{ color: "var(--fur-slate-light)" }}>Join FurSure and start booking trusted pet care.</p>

          {/* Role selection cards */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.role}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: tab.role }))}
                className="p-4 rounded-xl border-2 text-left transition-all"
                style={formData.role === tab.role
                  ? { borderColor: "var(--fur-teal)", background: "var(--fur-teal-light)", boxShadow: "0 0 0 3px rgba(45,140,114,0.12)" }
                  : { borderColor: "var(--border)", background: "white" }}
              >
                <span className="text-2xl block mb-2">{tab.icon}</span>
                <p className="font-700 text-sm mb-1" style={{ color: "var(--fur-slate)" }}>{tab.label}</p>
                <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{tab.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-700 mb-2" style={{ color: "var(--fur-slate)" }}>First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                  disabled={loading}
                  placeholder="John"
                  className="fur-input"
                />
              </div>
              <div>
                <label className="block text-sm font-700 mb-2" style={{ color: "var(--fur-slate)" }}>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                  disabled={loading}
                  placeholder="Doe"
                  className="fur-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-700 mb-2" style={{ color: "var(--fur-slate)" }}>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={loading}
                placeholder="you@example.com"
                className="fur-input"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>Password</label>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-600" style={{ color: "var(--fur-slate-light)" }}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                minLength={6}
                required
                disabled={loading}
                placeholder="Min. 6 characters"
                className="fur-input"
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl text-sm font-600" style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", border: "1px solid #FCA5A5" }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base disabled:opacity-60">
              {loading ? "Creating account..." : `Create Account as ${formData.role === "SERVICE_PROVIDER" ? "Provider" : "Pet Owner"}`}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm mb-4" style={{ color: "var(--fur-slate-light)" }}>Already have an account?</p>
            <button onClick={() => router.push("/login")} className="btn-secondary w-full py-3">
              Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}