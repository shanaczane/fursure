"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import type { LoginCredentials, AuthResponse } from "@/app/types/auth";

type UserRole = "PET_OWNER" | "SERVICE_PROVIDER" | "ADMIN";

export default function Login() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [selectedRole, setSelectedRole] = useState<UserRole>("PET_OWNER");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

      if (loginError) throw loginError;
      if (!authData.session) throw new Error("No session returned");

      const token = authData.session.access_token;
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;

      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData: AuthResponse = await response.json();

      if (userData.success && userData.data) {
        switch (userData.data.role) {
          case "PET_OWNER":
            router.push("/owner");
            break;
          case "SERVICE_PROVIDER":
            router.push("/provider");
            break;
          case "ADMIN":
            router.push("/admin");
            break;
          default:
            throw new Error("Invalid user role");
        }
      } else {
        throw new Error(userData.message || "Authentication failed");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof LoginCredentials) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const tabs: { role: UserRole; label: string }[] = [
    { role: "PET_OWNER", label: "Customer" },
    { role: "SERVICE_PROVIDER", label: "Service Provider" },
    { role: "ADMIN", label: "Admin" },
  ];

  return (
    <div className="min-h-screen bg-[#dce8f5] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-md w-full max-w-md px-10 py-10">
        {/* Role Tabs */}
        <div className="flex gap-6 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.role}
              type="button"
              onClick={() => setSelectedRole(tab.role)}
              className={`text-sm font-medium pb-1 transition-all ${
                selectedRole === tab.role
                  ? "text-black border-b-2 border-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black">Log In</h1>
          <p className="text-gray-400 text-sm mt-1">To access your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Email Address
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={handleInputChange("email")}
              required
              disabled={loading}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-gray-400">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {showPassword ? (
                    <>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </>
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  )}
                </svg>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={credentials.password}
              onChange={handleInputChange("password")}
              required
              disabled={loading}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
            <div className="mt-2 text-center">
              <a
                href="/forgot-password"
                className="text-xs text-gray-500 underline hover:text-gray-700 transition-colors"
              >
                I forget my password
              </a>
            </div>
          </div>

          {error && (
            <div
              className="bg-red-50 text-red-500 text-xs rounded-xl px-4 py-3"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-full transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-7 text-center">
          <p className="text-sm text-gray-400 mb-4">
            Don&apos;t have an account?
          </p>
          <button
            onClick={() => router.push("/register")}
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-10 py-3 rounded-full transition-colors"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}
