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

      // Fetch the user's actual role from the database
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

      const response = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      const userData: AuthResponse = await response.json();

      if (userData.success && userData.data) {
        const routes: Record<UserRole, string> = { PET_OWNER: "/owner", SERVICE_PROVIDER: "/provider", ADMIN: "/admin" };
        router.push(routes[selectedRole] || "/owner");
      } else {
        throw new Error(userData.message || "Authentication failed");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const tabs: { role: UserRole; label: string; icon: string }[] = [
    { role: "PET_OWNER", label: "Pet Owner", icon: "🐾" },
    { role: "SERVICE_PROVIDER", label: "Provider", icon: "🏢" },
    { role: "ADMIN", label: "Admin", icon: "🔑" },
  ];

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 auth-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <span className="text-3xl">🐾</span>
            <span className="text-3xl font-900 text-white" style={{ fontFamily: "'Fraunces', serif" }}>FurSure</span>
          </div>
          <h2 className="text-4xl font-900 text-white mb-6 leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            Welcome back to<br />your pet care hub
          </h2>
          <p className="text-lg" style={{ color: "#7A90A8" }}>
            Manage bookings, track your pets' care history, and connect with trusted service providers.
          </p>
        </div>
        <div className="relative space-y-3">
          {[
            { emoji: "🐕", name: "Max's Grooming", detail: "Confirmed · Tomorrow 10am", color: "#FEF3C7" },
            { emoji: "🐈", name: "Luna's Vet Visit", detail: "Completed · Last week", color: "#D1FAE5" },
            { emoji: "🦴", name: "Charlie's Training", detail: "Pending · Friday 2pm", color: "#EDE9FE" },
          ].map((item) => (
            <div key={item.name} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: item.color }}>
                {item.emoji}
              </div>
              <div>
                <p className="font-700 text-white text-sm">{item.name}</p>
                <p className="text-xs" style={{ color: "#7A90A8" }}>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: "var(--fur-cream)" }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">🐾</span>
            <span className="text-2xl font-900" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-teal)" }}>FurSure</span>
          </div>

          <h1 className="text-3xl font-900 mb-2" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>Log In</h1>
          <p className="text-sm mb-8" style={{ color: "var(--fur-slate-light)" }}>Welcome back! Select your role to continue.</p>

          {/* Role tabs */}
          <div className="flex gap-2 mb-8 p-1 rounded-xl" style={{ background: "var(--fur-mist)" }}>
            {tabs.map((tab) => (
              <button
                key={tab.role}
                type="button"
                onClick={() => setSelectedRole(tab.role)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-700 transition-all"
                style={selectedRole === tab.role
                  ? { background: "white", color: "var(--fur-teal)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }
                  : { color: "var(--fur-slate-light)" }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-700 mb-2" style={{ color: "var(--fur-slate)" }}>Email Address</label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={loading}
                placeholder="you@example.com"
                className="fur-input"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>Password</label>
                <a href="/forgot-password" className="text-xs font-600 hover:underline" style={{ color: "var(--fur-teal)" }}>Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  required
                  disabled={loading}
                  placeholder="••••••••"
                  className="fur-input pr-12"
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

            <p className="text-xs font-600 min-h-4" style={{ color: "var(--fur-rose)" }}>
              {error ? `✗ ${error}` : ""}
            </p>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-60"
            >
              <span className="invisible absolute">{`Log In as ${tabs.find(t => t.role === selectedRole)?.label}`}</span>
              <span>{loading ? "Logging in..." : `Log In as ${tabs.find(t => t.role === selectedRole)?.label}`}</span>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t text-center" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm mb-4" style={{ color: "var(--fur-slate-light)" }}>Don't have an account?</p>
            <button
              onClick={() => router.push("/register")}
              className="btn-amber w-full py-3 text-base"
            >
              Create an Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}