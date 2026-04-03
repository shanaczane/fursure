"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppContext } from "@/app/contexts/AppContext";
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
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const upcomingCount = bookings.filter(
    (b) =>
      (b.status === "pending" || b.status === "confirmed") &&
      new Date(b.date + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0)),
  ).length;

  const handleSaveProfile = () => {
    if (!formData.name || !formData.email) {
      alert("Name and email are required!");
      return;
    }
    updateUser({ name: formData.name, email: formData.email, phone: formData.phone });
    setSuccessModal({ isOpen: true, title: "Profile Updated", message: "Your profile has been updated successfully!" });
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert("Please fill in all password fields!");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }
    setSuccessModal({ isOpen: true, title: "Password Changed", message: "Your password has been changed successfully!" });
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const inputClass = "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-0";
  const inputStyle = { borderColor: "var(--border)", color: "var(--fur-slate)" };

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
          <div className="max-w-4xl mx-auto space-y-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>Profile</h1>
              <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>Manage your account settings</p>
            </div>

            <div className="rounded-2xl border p-6 space-y-6" style={{ background: "white", borderColor: "var(--border)" }}>
              {/* Avatar row */}
              <div className="flex items-center gap-5 pb-6 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-900 shrink-0"
                  style={{ background: "linear-gradient(135deg, var(--fur-teal), var(--fur-teal-dark))" }}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-900 text-xl" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>{user.name}</h2>
                  <p className="text-sm mb-2" style={{ color: "var(--fur-slate-light)" }}>{user.email}</p>
                  <button className="text-sm font-700" style={{ color: "var(--fur-teal)" }}>Change Photo</button>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="font-800 text-sm uppercase tracking-wide mb-4" style={{ color: "var(--fur-slate-mid)" }}>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-700 mb-1.5 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)" }}>Full Name</label>
                    <input type="text" value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClass} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-700 mb-1.5 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)" }}>Email</label>
                    <input type="email" value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClass} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-700 mb-1.5 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)" }}>Phone</label>
                    <input type="tel" value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputClass} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-700 mb-1.5 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)" }}>Role</label>
                    <input type="text" defaultValue="Pet Owner" disabled
                      className={inputClass} style={{ ...inputStyle, background: "var(--fur-cream)", opacity: 0.7 }} />
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="pt-6 border-t" style={{ borderColor: "var(--border)" }}>
                <h3 className="font-800 text-sm uppercase tracking-wide mb-4" style={{ color: "var(--fur-slate-mid)" }}>
                  Change Password
                </h3>
                <div className="space-y-4 max-w-sm">
                  <div>
                    <label className="block text-xs font-700 mb-1.5 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)" }}>Current Password</label>
                    <input type="password" value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className={inputClass} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-700 mb-1.5 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)" }}>New Password</label>
                    <input type="password" value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className={inputClass} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-700 mb-1.5 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)" }}>Confirm New Password</label>
                    <input type="password" value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className={inputClass} style={inputStyle} />
                  </div>
                  <button onClick={handleChangePassword} className="btn-secondary px-5 py-2.5 text-sm">
                    Change Password
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
                <Link href="/owner/settings" className="btn-secondary px-5 py-2.5 text-sm flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  Settings
                </Link>
                <button
                  onClick={() => setFormData({ name: user.name, email: user.email, phone: user.phone || "" })}
                  className="btn-secondary px-5 py-2.5 text-sm">
                  Cancel
                </button>
                <button onClick={handleSaveProfile} className="btn-primary px-5 py-2.5 text-sm">
                  Save Changes
                </button>
              </div>
            </div>
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
