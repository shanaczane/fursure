"use client";

import React from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "blue" | "red" | "yellow" | "green";
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "red",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const confirmStyles: Record<string, { background: string; hover: string }> = {
    red:    { background: "#EF4444", hover: "#DC2626" },
    blue:   { background: "var(--fur-teal)", hover: "var(--fur-teal-dark)" },
    yellow: { background: "#F59E0B", hover: "#D97706" },
    green:  { background: "#10B981", hover: "#059669" },
  };

  const cs = confirmStyles[confirmColor];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay — soft blur instead of solid black */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(26,35,50,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{ background: "white", fontFamily: "'Nunito', sans-serif" }}
      >
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "#FEF3C7" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#92400E"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h3 className="font-900 text-lg mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
            {title}
          </h3>
          <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-700 transition-colors"
            style={{ background: "var(--fur-cream)", color: "var(--fur-slate)", border: "1.5px solid var(--border)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--border)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--fur-cream)")}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-700 text-white transition-colors"
            style={{ background: cs.background }}
            onMouseEnter={e => (e.currentTarget.style.background = cs.hover)}
            onMouseLeave={e => (e.currentTarget.style.background = cs.background)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
