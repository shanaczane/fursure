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

  const tabs: { role: UserRole; label: string; icon: string; desc: string }[] = [
    { role: "PET_OWNER",        label: "Pet Owner",  icon: "🐾", desc: "Book & manage services"    },
    { role: "SERVICE_PROVIDER", label: "Provider",   icon: "🏢", desc: "Manage your business"      },
    { role: "ADMIN",            label: "Admin",      icon: "🔑", desc: "System administration"     },
  ];

  const roleMap: Record<string, UserRole> = {
    owner:    "PET_OWNER",
    provider: "SERVICE_PROVIDER",
    admin:    "ADMIN",
  };

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
      // 1. Sign in with Supabase Auth
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

      // 2. Fetch the user's actual role from the database
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error("Account not found. Please register first.");
      }

      const actualRole = roleMap[profile.role] ?? "PET_OWNER";

      // 3. Validate that the selected tab matches the real role
      if (actualRole !== selectedRole) {
        await supabase.auth.signOut();
        const correctLabel = tabs.find((t) => t.role === actualRole)?.label ?? profile.role;
        throw new Error(
          `This account is registered as a ${correctLabel}. Please select the correct role tab.`
        );
      }

      // 4. Persist session cookies
      const token = authData.session.access_token;
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      document.cookie = `role=${selectedRole}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;

      // 5. Verify token via API then redirect
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

  // Per-role accent colours used in the form
  const roleAccent: Record<UserRole, { ring: string; btn: string; badge: string; badgeText: string }> = {
    PET_OWNER:        { ring: "#2563EB", btn: "linear-gradient(135deg,#2563EB,#1D4ED8)",        badge: "#DBEAFE", badgeText: "#1E40AF" },
    SERVICE_PROVIDER: { ring: "#7C3AED", btn: "linear-gradient(135deg,#7C3AED,#5B21B6)",        badge: "#EDE9FE", badgeText: "#5B21B6" },
    ADMIN:            { ring: "#DC2626", btn: "linear-gradient(135deg,#EF4444,#DC2626)",        badge: "#FEE2E2", badgeText: "#991B1B" },
  };

  const accent = roleAccent[selectedRole];

  // Left-panel flavour per role
  const panelMeta: Record<UserRole, { headline: string; sub: string; cards: { emoji: string; name: string; detail: string; color: string }[] }> = {
    PET_OWNER: {
      headline: "Welcome back to\nyour pet care hub",
      sub: "Manage bookings, track your pets' care history, and connect with trusted service providers.",
      cards: [
        { emoji: "🐕", name: "Max's Grooming",    detail: "Confirmed · Tomorrow 10am", color: "#FEF3C7" },
        { emoji: "🐈", name: "Luna's Vet Visit",  detail: "Completed · Last week",     color: "#D1FAE5" },
        { emoji: "🦴", name: "Charlie's Training",detail: "Pending · Friday 2pm",      color: "#EDE9FE" },
      ],
    },
    SERVICE_PROVIDER: {
      headline: "Manage your\nbusiness with ease",
      sub: "Handle bookings, showcase your services, and grow your client base — all in one place.",
      cards: [
        { emoji: "📅", name: "3 bookings today",  detail: "2 confirmed · 1 pending",  color: "#DBEAFE" },
        { emoji: "⭐", name: "Rating: 4.9",       detail: "127 total reviews",         color: "#FEF3C7" },
        { emoji: "💰", name: "₱12,480 earned",    detail: "This month",               color: "#D1FAE5" },
      ],
    },
    ADMIN: {
      headline: "System\nAdministration",
      sub: "Verify providers, monitor users, and keep the FurSure platform running smoothly.",
      cards: [
        { emoji: "✅", name: "Provider Queue",    detail: "3 awaiting verification",  color: "#FEE2E2" },
        { emoji: "👥", name: "Active Users",      detail: "1,240 registered",         color: "#EDE9FE" },
        { emoji: "📋", name: "System Activity",   detail: "48 events today",          color: "#FEF3C7" },
      ],
    },
  };

  const panel = panelMeta[selectedRole];

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Nunito', sans-serif" }}>

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden transition-all duration-500"
        style={{ background: "linear-gradient(145deg,#0F172A 0%,#1E293B 100%)" }}
      >
        {/* dot grid */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
        {/* accent blob */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-700"
          style={{ background: accent.ring }}
        />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <span className="text-3xl">🐾</span>
            <span className="text-3xl font-900 text-white" style={{ fontFamily: "'Fraunces', serif" }}>
              FurSure
            </span>
          </div>
          <h2
            className="text-4xl font-900 text-white mb-6 leading-tight whitespace-pre-line"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {panel.headline}
          </h2>
          <p className="text-lg" style={{ color: "#7A90A8" }}>
            Manage bookings, track your pets&apos; care history, and connect with trusted service providers.
          </p>
        </div>

        <div className="relative space-y-3">
          {panel.cards.map((card) => (
            <div
              key={card.name}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: card.color }}>
                {card.emoji}
              </div>
              <div>
                <p className="font-700 text-white text-sm">{card.name}</p>
                <p className="text-xs" style={{ color: "#7A90A8" }}>{card.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: "var(--fur-cream)" }}>
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">🐾</span>
            <span className="text-2xl font-900" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-teal)" }}>
              FurSure
            </span>
          </div>

          <h1 className="text-3xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
            Log In
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--fur-slate-light)" }}>
            Select your role and sign in to continue.
          </p>

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
            {/* Email */}
            <div>
              <label className="block text-sm font-700 mb-2" style={{ color: "var(--fur-slate)" }}>
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
                style={{ "--tw-ring-color": accent.ring } as React.CSSProperties}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>Password</label>
                <a href="/forgot-password" className="text-xs font-600 hover:underline" style={{ color: accent.ring }}>
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

            {/* Submit */}
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
            <p className="text-sm mb-4" style={{ color: "var(--fur-slate-light)" }}>Don&apos;t have an account?</p>
            <button
              onClick={() => router.push("/register")}
              className="btn-secondary w-full py-3 text-base"
            >
              Create an Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}