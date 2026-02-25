"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import type { RegisterData } from "@/app/types/auth";

export default function Register() {
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "PET_OWNER",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign up with Supabase
      const { data: authData, error: signupError } =
        await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

      if (signupError) throw signupError;
      if (!authData.user) throw new Error("No user data returned");

      // Sync user to Next.js API route (replaces Express /api/auth/sync)
      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authData.user.id,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
        }),
      });

      const syncData = await response.json();

      if (!syncData.success) {
        throw new Error(syncData.message || "Failed to sync user");
      }

      // Store token as cookie
      if (authData.session) {
        const token = authData.session.access_token;
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      }

      alert("Account created successfully! Please log in.");
      router.push("/login");
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof RegisterData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <div className="register-container">
      <h2>Create Account</h2>
      <p>Join FurSure today</p>

      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange("firstName")}
            placeholder="Enter your first name"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange("lastName")}
            placeholder="Enter your last name"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={formData.email}
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
            value={formData.password}
            onChange={handleInputChange("password")}
            placeholder="Create a password (min 6 characters)"
            minLength={6}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="role">I am a:</label>
          <select
            id="role"
            value={formData.role}
            onChange={handleInputChange("role")}
            disabled={loading}
          >
            <option value="PET_OWNER">Pet Owner (Customer)</option>
            <option value="SERVICE_PROVIDER">Service Provider</option>
          </select>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="register-button">
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="login-prompt">
        <p>Already have an account?</p>
        <button
          onClick={() => router.push("/login")}
          className="login-link-button"
          type="button"
        >
          Log in
        </button>
      </div>
    </div>
  );
}
