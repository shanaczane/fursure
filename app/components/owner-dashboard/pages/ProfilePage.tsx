"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppContext } from "@/app/contexts/AppContext";
import { updateAuthCredentials, verifyCurrentPassword } from "@/app/lib/api";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import SuccessModal from "../components/SuccessModal";

const ProfilePage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, bookings, updateUser } = useAppContext();

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", message: "" });
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  const passwordRules = [
    { label: "At least 8 characters",       test: (p: string) => p.length >= 8 },
    { label: "Contains a number",            test: (p: string) => /\d/.test(p) },
    { label: "Contains a special character", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
  ];
  const isNewPasswordValid = passwordRules.every(r => r.test(passwordData.newPassword));
  const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword.length > 0;

  const upcomingCount = bookings.filter(
    (b) =>
      (b.status === "pending" || b.status === "confirmed") &&
      new Date(b.date + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0)),
  ).length;

  const handleSaveProfile = async () => {
    setProfileError("");
    if (!formData.name || !formData.email) {
      setProfileError("Name and email are required.");
      return;
    }
    setIsSavingProfile(true);
    try {
      await updateUser({ name: formData.name, email: formData.email, phone: formData.phone });
      if (formData.email !== user.email) {
        await updateAuthCredentials(user.id, { email: formData.email });
      }
      setSuccessModal({ isOpen: true, title: "Profile Updated", message: "Your profile has been updated successfully!" });
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (!isNewPasswordValid) {
      setPasswordError("New password does not meet all requirements.");
      return;
    }
    setIsSavingPassword(true);
    try {
      await verifyCurrentPassword(user.email, passwordData.currentPassword);
      await updateAuthCredentials(user.id, { password: passwordData.newPassword });
      setSuccessModal({ isOpen: true, title: "Password Changed", message: "Your password has been changed successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-0";
  const inputStyle = { borderColor: "var(--border)", color: "var(--fur-slate)", background: "white" };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--fur-cream)", fontFamily: "'Nunito', sans-serif" }}>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        upcomingBookingsCount={upcomingCount}
      />
      <div style={{ marginLeft: isSidebarOpen ? "16rem" : "0", transition: "margin-left 300ms ease-in-out" }}>
        <TopNavbar
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-4 md:p-6 mt-16">
          <div className="max-w-3xl mx-auto space-y-5">

            {/* Page title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>My Profile</h1>
              <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>View and update your account details</p>
            </div>

            {/* Profile header card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, var(--fur-teal), var(--fur-teal-dark))" }}
            >
              <div className="p-6 flex items-center gap-5">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-900 text-2xl shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontFamily: "'Fraunces', serif",
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* Name + details */}
                <div className="min-w-0">
                  <h2 className="font-900 text-xl text-white leading-tight mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                    {user.name}
                  </h2>
                  <span className="text-xs font-700 px-2.5 py-0.5 rounded-full inline-block mb-3" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
                    Pet Owner
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-600 truncate" style={{ color: "rgba(255,255,255,0.85)" }}>{user.email}</p>
                    <p className="text-sm font-600" style={{ color: "rgba(255,255,255,0.65)" }}>
                      {user.phone || "No phone number set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal information card */}
            <div className="rounded-2xl border p-6 space-y-5" style={{ background: "white", borderColor: "var(--border)" }}>
              <div>
                <h3 className="font-900 text-base" style={{ color: "var(--fur-slate)" }}>Personal Information</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--fur-slate-light)" }}>Update your name, email, and phone number</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-700 mb-1.5 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)" }}>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClass}
                    style={inputStyle}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-700 mb-1.5 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)" }}>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass}
                    style={inputStyle}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-700 mb-1.5 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)" }}>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={inputClass}
                    style={inputStyle}
                    placeholder="+63 900 000 0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-700 mb-1.5 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)" }}>Role</label>
                  <input
                    type="text"
                    value="Pet Owner"
                    disabled
                    className={inputClass}
                    style={{ ...inputStyle, background: "var(--fur-cream)", opacity: 0.6, cursor: "not-allowed" }}
                  />
                </div>
              </div>

              {profileError && (
                <p className="text-sm font-600 px-4 py-2.5 rounded-xl" style={{ background: "#FEE2E2", color: "#991B1B" }}>{profileError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setFormData({ name: user.name, email: user.email, phone: user.phone || "" })}
                  className="btn-secondary px-5 py-2.5 text-sm"
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="btn-primary px-5 py-2.5 text-sm"
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Change password card */}
            <div className="rounded-2xl border p-6 space-y-5" style={{ background: "white", borderColor: "var(--border)" }}>
              <div>
                <h3 className="font-900 text-base" style={{ color: "var(--fur-slate)" }}>Change Password</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--fur-slate-light)" }}>Enter your current password to set a new one</p>
              </div>

              <div className="space-y-4">
                {/* Current password */}
                <div>
                  <label className="block text-xs font-700 mb-1.5 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)" }}>Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className={inputClass}
                      style={{ ...inputStyle, paddingRight: "3rem" }}
                      placeholder="Enter your current password"
                    />
                    <button type="button"
                      onClick={() => setShowPasswords(s => ({ ...s, current: !s.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-700"
                      style={{ color: "var(--fur-slate-light)", background: "none", border: "none", cursor: "pointer" }}>
                      {showPasswords.current ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="block text-xs font-700 mb-1.5 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)" }}>New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className={inputClass}
                      style={{ ...inputStyle, paddingRight: "3rem" }}
                      placeholder="Create a strong password"
                    />
                    <button type="button"
                      onClick={() => setShowPasswords(s => ({ ...s, new: !s.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-700"
                      style={{ color: "var(--fur-slate-light)", background: "none", border: "none", cursor: "pointer" }}>
                      {showPasswords.new ? "Hide" : "Show"}
                    </button>
                  </div>
                  {/* Live validation checklist */}
                  {passwordData.newPassword.length > 0 && (
                    <div className="mt-2.5 p-3 rounded-xl space-y-1.5" style={{ background: "var(--fur-cream)" }}>
                      {passwordRules.map((rule) => {
                        const passed = rule.test(passwordData.newPassword);
                        return (
                          <p key={rule.label} className="text-xs font-600 flex items-center gap-2"
                            style={{ color: passed ? "var(--fur-teal)" : "var(--fur-slate-light)" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              {passed
                                ? <polyline points="20 6 9 17 4 12"/>
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

                {/* Confirm password */}
                <div>
                  <label className="block text-xs font-700 mb-1.5 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)" }}>Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className={inputClass}
                      style={{
                        ...inputStyle,
                        paddingRight: "3rem",
                        borderColor: passwordData.confirmPassword.length > 0
                          ? passwordsMatch ? "var(--fur-teal)" : "#FCA5A5"
                          : "var(--border)",
                      }}
                      placeholder="Repeat new password"
                    />
                    <button type="button"
                      onClick={() => setShowPasswords(s => ({ ...s, confirm: !s.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-700"
                      style={{ color: "var(--fur-slate-light)", background: "none", border: "none", cursor: "pointer" }}>
                      {showPasswords.confirm ? "Hide" : "Show"}
                    </button>
                  </div>
                  {passwordData.confirmPassword.length > 0 && (
                    <p className="text-xs font-600 mt-1.5 flex items-center gap-1.5"
                      style={{ color: passwordsMatch ? "var(--fur-teal)" : "#EF4444" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {passwordsMatch
                          ? <polyline points="20 6 9 17 4 12"/>
                          : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                        }
                      </svg>
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </p>
                  )}
                </div>
              </div>

              {passwordError && (
                <p className="text-sm font-600 px-4 py-2.5 rounded-xl" style={{ background: "#FEE2E2", color: "#991B1B" }}>{passwordError}</p>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleChangePassword}
                  disabled={isSavingPassword || !isNewPasswordValid || !passwordsMatch || !passwordData.currentPassword}
                  className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
                >
                  {isSavingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>

            {/* Settings link */}
            <Link
              href="/owner/settings"
              className="rounded-2xl border p-5 flex items-center justify-between transition-all card-hover"
              style={{ background: "white", borderColor: "var(--border)", textDecoration: "none" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--fur-cream)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--fur-slate-mid)" }}>
                    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-800 text-sm" style={{ color: "var(--fur-slate)" }}>Settings</p>
                  <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>Notifications, privacy, and account preferences</p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--fur-slate-light)" }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>

          </div>
        </main>
      </div>

      <SuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
      />
    </div>
  );
};

export default ProfilePage;
