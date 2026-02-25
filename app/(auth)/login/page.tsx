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
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Login with Supabase
      const { data: authData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

      if (loginError) throw loginError;
      if (!authData.session) throw new Error("No session returned");

      const token = authData.session.access_token;

      // Store token as cookie (so Next.js middleware can read it)
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;

      // Verify with Next.js API route (replaces Express /api/auth/me)
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData: AuthResponse = await response.json();

      if (userData.success && userData.data) {
        const userRole = userData.data.role;

        switch (userRole) {
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
      const error = err as Error;
      setError(error.message);
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof LoginCredentials) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <div className="login-container">
      {/* Role Tabs */}
      <div className="tabs">
        <button
          className={selectedRole === "PET_OWNER" ? "active" : ""}
          onClick={() => setSelectedRole("PET_OWNER")}
          type="button"
        >
          Customer
        </button>
        <button
          className={selectedRole === "SERVICE_PROVIDER" ? "active" : ""}
          onClick={() => setSelectedRole("SERVICE_PROVIDER")}
          type="button"
        >
          Service Provider
        </button>
        <button
          className={selectedRole === "ADMIN" ? "active" : ""}
          onClick={() => setSelectedRole("ADMIN")}
          type="button"
        >
          Admin
        </button>
      </div>

      <h2>Log In</h2>
      <p>To access your account</p>

      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={credentials.email}
            onChange={handleInputChange("email")}
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={credentials.password}
            onChange={handleInputChange("password")}
            placeholder="Enter your password"
            required
            disabled={loading}
          />
          <a href="/forgot-password" className="forgot-link">
            I forgot my password
          </a>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="login-button">
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <div className="signup-prompt">
        <p>Don&apos;t have an account?</p>
        <button
          onClick={() => router.push("/register")}
          className="create-account-button"
          type="button"
        >
          Create an account
        </button>
      </div>
    </div>
  );
}
