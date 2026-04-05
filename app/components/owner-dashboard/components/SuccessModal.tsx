"use client";

import React, { useEffect } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  isError?: boolean;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 2000,
  isError = false,
}) => {
  useEffect(() => {
    if (isOpen && autoClose && !isError) {
      const timer = setTimeout(() => onClose(), autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose, isError]);

  if (!isOpen) return null;

  const isSuccess = !isError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Soft blurred overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(26,35,50,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center"
        style={{ background: "white", fontFamily: "'Nunito', sans-serif" }}
      >
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: isSuccess ? "#D1FAE5" : "#FEE2E2" }}
        >
          {isSuccess ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#991B1B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          )}
        </div>

        {/* Text */}
        <h3 className="font-900 text-lg mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
          {title}
        </h3>
        <p className="text-sm mb-6" style={{ color: "var(--fur-slate-light)" }}>{message}</p>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-sm font-700 text-white transition-colors"
          style={{ background: isSuccess ? "var(--fur-teal)" : "#EF4444" }}
          onMouseEnter={e => (e.currentTarget.style.background = isSuccess ? "var(--fur-teal-dark)" : "#DC2626")}
          onMouseLeave={e => (e.currentTarget.style.background = isSuccess ? "var(--fur-teal)" : "#EF4444")}
        >
          {isSuccess ? "Got it" : "OK"}
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
