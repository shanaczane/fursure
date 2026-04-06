"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import type { RegisterData } from "@/app/types/auth";

type RegisterRole = "PET_OWNER" | "SERVICE_PROVIDER";

export default function Register() {
  const [formData, setFormData] = useState<RegisterData & { contactLink?: string }>({
    email: "", password: "", firstName: "", lastName: "", role: "PET_OWNER", contactLink: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [validIdFile, setValidIdFile] = useState<File | null>(null);
  const [credentialsFile, setCredentialsFile] = useState<File | null>(null);
  const router = useRouter();

  const passwordRules = [
    { label: "At least 8 characters",       test: (p: string) => p.length >= 8 },
    { label: "Contains a number",            test: (p: string) => /\d/.test(p) },
    { label: "Contains a special character", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
  ];

  const isPasswordValid = passwordRules.every(r => r.test(formData.password));
  const isContactLinkValid = formData.role !== "SERVICE_PROVIDER" || (formData.contactLink ?? "").trim().length > 0;

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isPasswordValid) return;
    if (formData.role === "SERVICE_PROVIDER" && !validIdFile) {
      setError("Please upload a valid government ID before submitting.");
      return;
    }
    if (formData.role === "SERVICE_PROVIDER" && !(formData.contactLink ?? "").trim()) {
      setError("Please provide a social media or contact link.");
      return;
    }
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

      const userId = authData.user.id;

      const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      let validIdBase64: string | undefined;
      let validIdExt: string | undefined;
      let credentialsBase64: string | undefined;
      let credentialsExt: string | undefined;

      if (formData.role === "SERVICE_PROVIDER") {
        if (validIdFile) {
          validIdBase64 = await toBase64(validIdFile);
          validIdExt = validIdFile.name.split(".").pop();
        }
        if (credentialsFile) {
          credentialsBase64 = await toBase64(credentialsFile);
          credentialsExt = credentialsFile.name.split(".").pop();
        }
      }

      const syncRes = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          contactLink: formData.role === "SERVICE_PROVIDER" ? formData.contactLink : undefined,
          validIdBase64,
          validIdExt,
          credentialsBase64,
          credentialsExt,
        }),
      });
      const syncData = await syncRes.json();
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

  const tabs: { role: RegisterRole; label: string; desc: string }[] = [
    { role: "PET_OWNER",        label: "Pet Owner",        desc: "Book and manage pet care services" },
    { role: "SERVICE_PROVIDER", label: "Service Provider", desc: "List services and manage bookings"  },
  ];

  const isProviderFormValid =
    formData.role !== "SERVICE_PROVIDER" ||
    (!!validIdFile && (formData.contactLink ?? "").trim().length > 0);

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: "linear-gradient(135deg, #1A2332 0%, #2D4A6B 100%)",
      fontFamily: "'Nunito', sans-serif",
    }}>
      {/* Background texture */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
        backgroundSize: "36px 36px",
      }} />
      <div className="fixed top-0 left-0 w-150 h-150 rounded-full opacity-10 blur-3xl pointer-events-none -translate-y-1/2 -translate-x-1/4"
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
          onClick={() => router.push("/login")}
          className="text-sm font-700 px-5 py-2 rounded-full border transition-all"
          style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "transparent"; }}
        >
          Log In
        </button>
      </nav>

      {/* Hero + Form */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Headline */}
        <div className="text-center mb-8">
          <p className="text-sm font-700 uppercase tracking-widest mb-4" style={{ color: "var(--fur-teal)" }}>
            Get started
          </p>
          <h1 className="text-4xl md:text-6xl font-900 text-white mb-5 leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}>
            Join FurSure Today
          </h1>
          <p className="text-lg max-w-md mx-auto" style={{ color: "#7A90A8" }}>
            Connect with trusted local pet care providers and give your furry friend the life they deserve.
          </p>
        </div>

        {/* Form card */}
        <div className="w-full max-w-lg rounded-3xl p-8 shadow-2xl" style={{ background: "white" }}>

          {/* Role selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.role}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: tab.role }))}
                className="p-4 rounded-2xl border-2 text-left transition-all"
                style={formData.role === tab.role
                  ? { borderColor: "var(--fur-teal)", background: "var(--fur-teal-light)" }
                  : { borderColor: "var(--border)", background: "var(--fur-cream)" }}
              >
                <p className="font-800 text-sm mb-1" style={{ color: "var(--fur-slate)" }}>{tab.label}</p>
                <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>{tab.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {formData.role === "SERVICE_PROVIDER" ? (
              <div>
                <label className="block text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>Place Name</label>
                <input type="text" value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value, lastName: "" }))}
                  required disabled={loading} placeholder="e.g. Happy Paws Pet Care" className="fur-input" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>First Name</label>
                  <input type="text" value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required disabled={loading} placeholder="John" className="fur-input" />
                </div>
                <div>
                  <label className="block text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>Last Name</label>
                  <input type="text" value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required disabled={loading} placeholder="Doe" className="fur-input" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>Email Address</label>
              <input type="email" value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required disabled={loading} placeholder="you@example.com" className="fur-input" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-700 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)" }}>Password</label>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-600" style={{ color: "var(--fur-slate-light)" }}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                minLength={8} required disabled={loading}
                placeholder="Min. 8 characters" className="fur-input" />
              {formData.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {passwordRules.map((rule) => {
                    const passed = rule.test(formData.password);
                    return (
                      <p key={rule.label} className="text-xs font-600 flex items-center gap-1.5"
                        style={{ color: passed ? "var(--fur-teal)" : "var(--fur-rose)" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          {passed
                            ? <><polyline points="20 6 9 17 4 12"/></>
                            : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                          }
                        </svg>
                        {rule.label}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Provider-specific fields */}
            {formData.role === "SERVICE_PROVIDER" && (
              <div className="space-y-3 p-4 rounded-2xl border" style={{ background: "var(--fur-cream)", borderColor: "var(--border)" }}>
                <p className="text-xs font-800 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)" }}>
                  Provider Details
                </p>

                {/* Social / Contact Link — REQUIRED */}
                <div>
                  <label className="block text-xs font-700 mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>
                    Social Media / Contact Link <span style={{ color: "var(--fur-rose)" }}>*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.contactLink ?? ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactLink: e.target.value }))}
                    required={formData.role === "SERVICE_PROVIDER"}
                    disabled={loading}
                    placeholder="https://facebook.com/yourpage or https://instagram.com/..."
                    className="fur-input"
                    style={(formData.contactLink ?? "").trim().length === 0 && formData.role === "SERVICE_PROVIDER"
                      ? { borderColor: "#FCA5A5" }
                      : {}}
                  />
                  <p className="text-xs mt-1.5 font-600 flex items-start gap-1.5" style={{ color: "var(--fur-slate-light)" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    This is displayed to pet owners after their booking is confirmed so they can reach you.
                  </p>
                </div>

                <p className="text-xs font-800 uppercase tracking-wide mt-2" style={{ color: "var(--fur-slate-mid)" }}>
                  Verification Documents
                </p>
                <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                  Upload your valid government ID and any supporting credentials. These will be reviewed by an admin before your account is activated.
                </p>

                {/* Valid ID */}
                <div>
                  <label className="block text-xs font-700 mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>
                    Valid Government ID <span style={{ color: "var(--fur-rose)" }}>*</span>
                  </label>
                  <label
                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all"
                    style={{
                      borderColor: validIdFile ? "var(--fur-teal)" : "var(--border)",
                      background: validIdFile ? "var(--fur-teal-light)" : "white",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                      style={{ color: validIdFile ? "var(--fur-teal)" : "var(--fur-slate-light)", flexShrink: 0 }}>
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      {validIdFile ? (
                        <p className="text-sm font-700 truncate" style={{ color: "var(--fur-teal-dark)" }}>{validIdFile.name}</p>
                      ) : (
                        <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>Click to upload (JPG, PNG, PDF)</p>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => setValidIdFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>

                {!validIdFile && (
                  <p className="text-xs font-600" style={{ color: "var(--fur-rose)" }}>
                    A valid government ID is required to register as a provider.
                  </p>
                )}

                {/* Supporting credentials */}
                <div>
                  <label className="block text-xs font-700 mb-1.5" style={{ color: "var(--fur-slate-mid)" }}>
                    Supporting Credentials <span className="font-400" style={{ color: "var(--fur-slate-light)" }}>(optional)</span>
                  </label>
                  <label
                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all"
                    style={{
                      borderColor: credentialsFile ? "var(--fur-teal)" : "var(--border)",
                      background: credentialsFile ? "var(--fur-teal-light)" : "white",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                      style={{ color: credentialsFile ? "var(--fur-teal)" : "var(--fur-slate-light)", flexShrink: 0 }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      {credentialsFile ? (
                        <p className="text-sm font-700 truncate" style={{ color: "var(--fur-teal-dark)" }}>{credentialsFile.name}</p>
                      ) : (
                        <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>Certificates, licenses, etc.</p>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => setCredentialsFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl text-sm font-600 border" style={{ background: "var(--fur-rose-light)", color: "var(--fur-rose)", borderColor: "#FCA5A5" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !isProviderFormValid} className="btn-primary w-full py-3 text-sm disabled:opacity-60">
              {loading ? "Creating account..." : `Create Account as ${formData.role === "SERVICE_PROVIDER" ? "Provider" : "Pet Owner"}`}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm mb-4" style={{ color: "var(--fur-slate-light)" }}>Already have an account?</p>
            <button onClick={() => router.push("/login")} className="btn-secondary w-full py-2.5 text-sm">
              Log In
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