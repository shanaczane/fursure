"use client";

import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopNavbar from "./AdminTopNavbar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--fur-cream)", fontFamily: "'Nunito', sans-serif" }}>
      <AdminSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div style={{
        marginLeft: isSidebarOpen ? "16rem" : "0",
        transition: "margin-left 300ms ease-in-out",
      }}>
        <AdminTopNavbar
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

export default AdminLayout;