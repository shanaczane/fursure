"use client";

import React, { useState } from "react";
import ProviderSidebar from "./ProviderSidebar";
import ProviderTopNavbar from "./ProviderTopNavbar";
import { useProviderContext } from "../context/ProviderAppContext";

interface ProviderLayoutProps {
  children: React.ReactNode;
}

const PendingApprovalScreen = () => (
  <div
    className="min-h-screen flex items-center justify-center p-6"
    style={{ background: "var(--fur-cream)", fontFamily: "'Nunito', sans-serif" }}
  >
    <div className="max-w-md w-full text-center">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
        style={{ background: "linear-gradient(135deg, #1A2332, #2D4A6B)" }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>

      <h1
        className="text-3xl font-900 mb-3"
        style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}
      >
        Pending Approval
      </h1>

      <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--fur-slate-light)" }}>
        Your provider account is under review. An admin will verify your credentials and approve your account shortly. You'll have full access once approved.
      </p>

      <div
        className="rounded-2xl p-5 mb-6 text-left space-y-3 border"
        style={{ background: "white", borderColor: "var(--border)" }}
      >
        {[
          {
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
            text: "Account submitted for review",
          },
          {
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
            text: "Admin is reviewing your credentials",
          },
          {
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
            text: "You'll be notified once approved",
          },
        ].map((step) => (
          <div key={step.text} className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--fur-mist)", color: "var(--fur-slate-mid)" }}>{step.icon}</span>
            <p className="text-sm font-600" style={{ color: "var(--fur-slate)" }}>{step.text}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          document.cookie = "token=; path=/; max-age=0";
          document.cookie = "role=; path=/; max-age=0";
          window.location.href = "/login";
        }}
        className="btn-secondary w-full py-2.5 text-sm"
      >
        Log Out
      </button>
    </div>
  </div>
);

const ProviderLayout: React.FC<ProviderLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, isLoading } = useProviderContext();

  // Show loading state while context initializes
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--fur-cream)" }}
      >
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "var(--fur-teal)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  // Block access if provider is not yet approved
  if (user.id && !user.isVerified) {
    return <PendingApprovalScreen />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <ProviderSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div
        style={{
          marginLeft: isSidebarOpen ? "16rem" : "0",
          transition: "margin-left 300ms ease-in-out",
        }}
      >
        <ProviderTopNavbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-4 md:p-6 mt-16">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default ProviderLayout;
