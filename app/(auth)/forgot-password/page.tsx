"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Step = "email" | "reset" | "done";

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Step 1 — verify email is registered via API (server-side listUsers check)
  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No account found with that email address.");
        return;
      }

      // Email confirmed registered — show reset form
      setStep("reset");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — reset the password via API route (service role key, no session needed)
  const handleResetSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to reset password.");

      setStep("done");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #1A2332 0%, #2D4A6B 100%)",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Background texture */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div
        className="fixed top-0 right-0 w-150 h-150 rounded-full opacity-10 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"
        style={{ background: "var(--fur-teal)" }}
      />

      {/* Navbar */}
      <nav
        className="relative z-10 flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => router.push("/login")}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--fur-teal)" }}
          >
            <svg width="17" height="17" viewBox="0 0 100 100" fill="white">
              <ellipse cx="50" cy="72" rx="22" ry="16" />
              <ellipse cx="17" cy="44" rx="10" ry="13" />
              <ellipse cx="37" cy="30" rx="10" ry="13" />
              <ellipse cx="63" cy="30" rx="10" ry="13" />
              <ellipse cx="83" cy="44" rx="10" ry="13" />
            </svg>
          </div>
          <span
            className="text-xl font-900 text-white"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            FurSure
          </span>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="text-sm font-700 px-5 py-2 rounded-full border transition-all"
          style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)";
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          Back to Login
        </button>
      </nav>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center mb-10">
          <p
            className="text-sm font-700 uppercase tracking-widest mb-4"
            style={{ color: "var(--fur-teal)" }}
          >
            Account Recovery
          </p>
          <h1
            className="text-4xl md:text-5xl font-900 text-white mb-5 leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {step === "email"
              ? "Forgot Your Password?"
              : step === "reset"
              ? "Reset Your Password"
              : "All Done!"}
          </h1>
          <p className="text-lg max-w-md mx-auto" style={{ color: "#7A90A8" }}>
            {step === "email"
              ? "Enter your registered email to get started."
              : step === "reset"
              ? `Setting a new password for ${email}`
              : "Your password has been updated successfully."}
          </p>
        </div>

        <div
          className="w-full max-w-md rounded-3xl p-8 shadow-2xl"
          style={{ background: "white" }}
        >
          {/* ── Step 1: Email check ── */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label
                  className="block text-xs font-700 uppercase tracking-wide mb-1.5"
                  style={{ color: "var(--fur-slate-mid)" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="you@example.com"
                  className="fur-input"
                />
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
                {loading ? "Checking..." : "Continue"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="btn-secondary w-full py-2.5 text-sm"
              >
                Back to Login
              </button>
            </form>
          )}

          {/* ── Step 2: Reset form ── */}
          {step === "reset" && (
            <form onSubmit={handleResetSubmit} className="space-y-5">
              {/* Email display — read-only confirmation */}
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-600"
                style={{ background: "var(--fur-slate-50, #F1F5F9)", color: "var(--fur-slate)" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.5, flexShrink: 0 }}
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span style={{ opacity: 0.7 }}>{email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setError(null);
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className="ml-auto text-xs font-700"
                  style={{ color: "var(--fur-teal)" }}
                >
                  Change
                </button>
              </div>

              {/* New password */}
              <div>
                <label
                  className="block text-xs font-700 uppercase tracking-wide mb-1.5"
                  style={{ color: "var(--fur-slate-mid)" }}
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Min. 8 characters"
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

              {/* Confirm password */}
              <div>
                <label
                  className="block text-xs font-700 uppercase tracking-wide mb-1.5"
                  style={{ color: "var(--fur-slate-mid)" }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Re-enter your password"
                    className="fur-input pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-700"
                    style={{ color: "var(--fur-slate-light)" }}
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
                {confirmPassword && (
                  <p
                    className="text-xs mt-1.5 font-600"
                    style={{
                      color:
                        password === confirmPassword ? "#065F46" : "var(--fur-rose)",
                    }}
                  >
                    {password === confirmPassword
                      ? "✓ Passwords match"
                      : "✗ Passwords do not match"}
                  </p>
                )}
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
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </form>
          )}

          {/* ── Step 3: Success ── */}
          {step === "done" && (
            <div className="text-center py-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "#D1FAE5" }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#065F46"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2
                className="text-xl font-900 mb-2"
                style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}
              >
                Password Updated!
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--fur-slate-light)" }}>
                Your password has been reset. You can now log in with your new password.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="btn-primary w-full py-3 text-sm"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="relative z-10 text-center py-5 border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <p className="text-xs" style={{ color: "#4A6280" }}>
          © 2025 FurSure · Making pet care easy, one booking at a time
        </p>
      </div>
    </div>
  );
}