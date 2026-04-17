"use client";

import React, { useState, useEffect } from "react";
import { useProviderContext } from "../context/ProviderAppContext";
import ProviderLayout from "../components/ProviderLayout";
import type { ProviderPolicy } from "../types";

const PoliciesPage: React.FC = () => {
  const { policy, savePolicy } = useProviderContext();
  const [policyForm, setPolicyForm] = useState<ProviderPolicy>(policy);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync form when policy loads from Supabase
  useEffect(() => {
    setPolicyForm(policy);
  }, [policy]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      await savePolicy(policyForm);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError("Failed to save policies. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProviderLayout>
      <div className="space-y-5 max-w-4xl">
        <div>
          <h1 style={{ fontSize: "1.65rem", fontWeight: 400, color: "var(--fur-slate)", marginBottom: 3 }}>Policies</h1>
          <p className="text-gray-500 text-sm">These are shown to pet owners before they confirm a booking.</p>
        </div>

        {saved && (
          <div className="flex items-center gap-3 p-4 rounded-xl border"
            style={{ background: "#D1FAE5", borderColor: "#6EE7B7", color: "#065F46" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="font-700 text-sm">Policies saved successfully!</span>
          </div>
        )}

        {saveError && (
          <div className="flex items-center gap-3 p-4 rounded-xl border"
            style={{ background: "#FEE2E2", borderColor: "#FCA5A5", color: "#991B1B" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="font-700 text-sm">{saveError}</span>
          </div>
        )}

        <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--border)" }}>
          <div className="p-6 space-y-5">

            {/* Cash-only notice */}
            <div className="flex gap-3 p-4 rounded-xl border" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
              <span style={{ fontSize: 16 }}>💵</span>
              <div>
                <p className="text-sm font-700" style={{ color: "#92400E" }}>Cash Payments Only</p>
                <p className="text-xs mt-0.5" style={{ color: "#B45309" }}>
                  All payments are handled in cash. Pet owners pay you directly — no cards or online transfers.
                </p>
              </div>
            </div>

            {/* ── Down Payment ── */}
            <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="text-sm font-900" style={{ color: "var(--fur-slate)", fontFamily: "'Fraunces', serif" }}>
                  💰 Down Payment
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--fur-slate-light)" }}>
                  A down payment is a partial amount pet owners pay upfront to secure their booking slot.
                </p>
              </div>

              {/* Require deposit toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: "var(--fur-cream)", border: "1px solid var(--border)" }}>
                <div>
                  <p className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>
                    Ask for a down payment?
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--fur-slate-light)" }}>
                    {policyForm.depositRequired
                      ? "Yes — pet owners pay a deposit before their booking is confirmed."
                      : "No — pet owners pay the full amount on the day of service."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPolicyForm((prev) => ({ ...prev, depositRequired: !prev.depositRequired }))}
                  className="relative shrink-0 ml-4 rounded-full transition-colors duration-200"
                  style={{ width: 48, height: 26, background: policyForm.depositRequired ? "var(--fur-teal)" : "var(--fur-mist)" }}>
                  <span className="absolute rounded-full bg-white shadow-md transition-all duration-200"
                    style={{ width: 18, height: 18, top: 4, left: policyForm.depositRequired ? 26 : 4 }} />
                </button>
              </div>

              {policyForm.depositRequired && (
                <div className="space-y-5">

                  {/* How much */}
                  <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>How much is the down payment?</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--fur-slate-light)" }}>Choose what percentage of the total price pet owners pay upfront.</p>
                      </div>
                      <span className="text-sm font-900 px-2.5 py-1 rounded-lg"
                        style={{ background: "var(--fur-teal-light)", color: "var(--fur-teal-dark)" }}>
                        {policyForm.depositPercentage === 100 ? "Full amount" : `${policyForm.depositPercentage}%`}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 75, 100].map((pct) => (
                        <button key={pct} type="button"
                          onClick={() => setPolicyForm((prev) => ({ ...prev, depositPercentage: pct, fullPaymentRequiredUpfront: pct === 100 }))}
                          className="py-2.5 rounded-xl text-sm font-700 border-2 transition-all"
                          style={policyForm.depositPercentage === pct
                            ? { borderColor: "var(--fur-teal)", background: "var(--fur-teal-light)", color: "var(--fur-teal-dark)" }
                            : { borderColor: "var(--border)", background: "white", color: "var(--fur-slate-mid)" }}>
                          {pct === 100 ? "Full" : `${pct}%`}
                        </button>
                      ))}
                    </div>
                    <div className="p-3 rounded-lg text-xs" style={{ background: "var(--fur-cream)", color: "var(--fur-slate)" }}>
                      {policyForm.depositPercentage === 100
                        ? "Pet owners pay 100% upfront. No remaining balance on the day."
                        : `Pet owners pay ${policyForm.depositPercentage}% now to secure the booking. The remaining ${100 - policyForm.depositPercentage}% is paid on the day of service.`}
                    </div>
                  </div>

                  {/* Payment deadline — slider */}
                  <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <p className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>
                        How long does the pet owner have to pay the deposit?
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--fur-slate-light)" }}>
                        Slide to set a deadline. After this time, the booking slot may be released.
                      </p>
                    </div>

                    {(() => {
                      const STEPS = [1, 2, 3, 6, 12, 24, 48, 72];
                      const currentHours: number = (policyForm as any).depositDeadlineHours ?? 24;
                      const stepIndex = Math.max(0, STEPS.indexOf(currentHours) === -1 ? 5 : STEPS.indexOf(currentHours));

                      const label = currentHours === 1
                        ? "Within 1 hour"
                        : currentHours <= 12
                        ? `Within ${currentHours} hours`
                        : currentHours === 24
                        ? "Within 24 hours (1 day)"
                        : currentHours === 48
                        ? "Within 48 hours (2 days)"
                        : "Within 72 hours (3 days)";

                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>1 hour</span>
                            <span className="text-sm font-900 px-2.5 py-1 rounded-lg"
                              style={{ background: "var(--fur-teal-light)", color: "var(--fur-teal-dark)" }}>
                              {label}
                            </span>
                            <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>3 days</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={STEPS.length - 1}
                            step={1}
                            value={stepIndex}
                            onChange={(e) => {
                              const hrs = STEPS[parseInt(e.target.value)];
                              setPolicyForm((prev) => ({ ...prev, depositDeadlineHours: hrs } as any));
                            }}
                            className="w-full"
                            suppressHydrationWarning
                          />
                          <div className="p-3 rounded-lg text-xs" style={{ background: "var(--fur-cream)", color: "var(--fur-slate)" }}>
                            Pet owners will see: <span className="font-700">"{label} of booking confirmation"</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Refundable toggle */}
                  <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--border)" }}>
                    <p className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>Is the down payment refundable?</p>
                    <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>
                      If a pet owner cancels their booking, will you return the deposit?
                    </p>
                    <div className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: "var(--fur-cream)", border: "1px solid var(--border)" }}>
                      <p className="text-sm font-700" style={{ color: policyForm.depositRefundable ? "#059669" : "#DC2626" }}>
                        {policyForm.depositRefundable ? "Yes — refundable" : "No — non-refundable"}
                      </p>
                      <button
                        type="button"
                        onClick={() => setPolicyForm((prev) => ({ ...prev, depositRefundable: !prev.depositRefundable }))}
                        className="relative shrink-0 ml-4 rounded-full transition-colors duration-200"
                        style={{ width: 48, height: 26, background: policyForm.depositRefundable ? "#059669" : "var(--fur-rose)" }}>
                        <span className="absolute rounded-full bg-white shadow-md transition-all duration-200"
                          style={{ width: 18, height: 18, top: 4, left: policyForm.depositRefundable ? 26 : 4 }} />
                      </button>
                    </div>
                    <div className="p-3 rounded-lg text-xs" style={{
                      background: policyForm.depositRefundable ? "#D1FAE5" : "#FEE2E2",
                      color: policyForm.depositRefundable ? "#065F46" : "#991B1B"
                    }}>
                      {policyForm.depositRefundable
                        ? "Pet owners will see: \"Down payment is refundable if you cancel.\""
                        : "Pet owners will see: \"Down payment is non-refundable if you cancel.\""}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* ── Cancellation Policy ── */}
            <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="text-sm font-900" style={{ color: "var(--fur-slate)", fontFamily: "'Fraunces', serif" }}>
                  ⏰ Cancellation Policy
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--fur-slate-light)" }}>
                  How much advance notice do you need before a pet owner can cancel their booking?
                </p>
              </div>

              <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>Minimum notice to cancel:</p>
                  <span className="text-sm font-900 px-2.5 py-1 rounded-lg"
                    style={{ background: "var(--fur-teal-light)", color: "var(--fur-teal-dark)" }}>
                    {policyForm.cancellationHoursNotice === 0
                      ? "Anytime"
                      : `${policyForm.cancellationHoursNotice} hours`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>Anytime</span>
                  <span className="text-xs" style={{ color: "var(--fur-slate-light)" }}>72 hours</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={72}
                  step={1}
                  value={policyForm.cancellationHoursNotice}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      cancellationHoursNotice: Number(e.target.value),
                    }))
                  }
                  className="w-full"
                  suppressHydrationWarning
                />
                <div className="p-3 rounded-lg text-xs" style={{ background: "var(--fur-cream)", color: "var(--fur-slate)" }}>
                  {policyForm.cancellationHoursNotice === 0
                    ? "Pet owners can cancel at any time, even last minute."
                    : `Pet owners must notify you at least ${policyForm.cancellationHoursNotice} hours before the service to cancel.`}
                </div>
              </div>
            </div>

            {/* ── Additional Notes ── */}
            <div className="rounded-xl border p-5 space-y-3" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="text-sm font-900" style={{ color: "var(--fur-slate)", fontFamily: "'Fraunces', serif" }}>
                  📝 Additional Notes
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--fur-slate-light)" }}>
                  Anything else pet owners should know before booking. This is shown directly on your booking page.
                </p>
              </div>
              <textarea
                value={policyForm.additionalNotes ?? ""}
                rows={3}
                onChange={(e) => setPolicyForm((prev) => ({ ...prev, additionalNotes: e.target.value }))}
                placeholder="e.g. Please bring vaccination records. Prepare the exact cash amount."
                className="fur-input resize-none"
                suppressHydrationWarning
              />
            </div>

            {/* Save */}
            <div className="flex items-center gap-3 pt-1">
              <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60">
                {saving ? "Saving..." : "Save Policies"}
              </button>
              {saved && (
                <p className="text-sm font-700 flex items-center gap-1" style={{ color: "#059669" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Policies saved
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </ProviderLayout>
  );
};

export default PoliciesPage;