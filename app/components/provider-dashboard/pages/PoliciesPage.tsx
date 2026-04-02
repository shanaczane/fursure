"use client";

import React, { useState, useEffect } from "react";
import { useProviderContext } from "../context/ProviderAppContext";
import ProviderLayout from "../components/ProviderLayout";
import type { ProviderPolicy } from "../types";

const PoliciesPage: React.FC = () => {
  const { policy, savePolicy } = useProviderContext();
  const [form, setForm] = useState<ProviderPolicy>(policy);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync form when policy loads from Supabase
  useEffect(() => {
    setForm(policy);
  }, [policy]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await savePolicy(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save policies. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProviderLayout>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1
            className="text-2xl md:text-3xl mb-1"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, color: "var(--fur-slate)" }}
          >
            My Policies
          </h1>
          <p className="text-gray-600 text-sm">
            Set your booking and payment rules. These will be clearly shown to pet owners before
            they confirm a booking.
          </p>
        </div>

        {/* Payment Method — Cash Only Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 flex gap-3">
          <span className="text-2xl">💵</span>
          <div>
            <p className="text-sm font-bold text-amber-900">Cash Payment Only</p>
            <p className="text-sm text-amber-800 mt-0.5">
              All transactions on this platform are <strong>cash-based</strong>. Pet owners pay you
              directly — in person or via cash on the day of service (or as arranged). No online
              payment processing is used.
            </p>
          </div>
        </div>

        {/* Down Payment / Deposit Policy */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">💰 Down Payment Requirement</h2>
            <p className="text-sm text-gray-500 mt-1">
              A down payment is a partial cash payment made before the service date to confirm a
              booking. If you require one, the pet owner must pay it within{" "}
              <strong>24 hours</strong> of booking — or their booking will be{" "}
              <strong className="text-red-600">automatically declined</strong>.
            </p>
          </div>

          {/* Require deposit toggle */}
          <div className="flex items-center justify-between border border-gray-100 rounded-lg p-4 bg-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-800">Require a down payment?</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Pet owners must pay a cash deposit to secure their booking.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, depositRequired: !prev.depositRequired }))
              }
              className={`relative w-12 h-6 rounded-full transition-colors ${
                form.depositRequired ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.depositRequired ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {form.depositRequired && (
            <>
              {/* 24-hour rule info box */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <span className="text-lg mt-0.5">⏰</span>
                <div>
                  <p className="text-sm font-bold text-red-800">24-Hour Payment Rule</p>
                  <p className="text-sm text-red-700 mt-0.5">
                    Once a booking is made, the pet owner has exactly{" "}
                    <strong>24 hours</strong> to hand over the down payment in cash. If they miss
                    this window, the booking is <strong>automatically declined</strong> — no action
                    needed from you.
                  </p>
                </div>
              </div>

              {/* Deposit amount */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">How much is the down payment?</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Set it as a percentage of the total service fee.
                    </p>
                  </div>
                  <span className="text-xl font-black text-blue-600">{form.depositPercentage}%</span>
                </div>

                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={form.depositPercentage}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      depositPercentage: Number(e.target.value),
                      fullPaymentRequiredUpfront: Number(e.target.value) === 100,
                    }))
                  }
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>10% (small deposit)</span>
                  <span>50%</span>
                  <span>100% (full upfront)</span>
                </div>

                {/* Quick presets */}
                <div className="flex gap-2 flex-wrap">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          depositPercentage: pct,
                          fullPaymentRequiredUpfront: pct === 100,
                        }))
                      }
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                        form.depositPercentage === pct
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                      }`}
                    >
                      {pct === 100 ? "Full payment" : `${pct}%`}
                    </button>
                  ))}
                </div>

                {form.fullPaymentRequiredUpfront && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                    💡 You've set <strong>100% upfront</strong> — the pet owner must pay the full
                    service amount in cash within 24 hours of booking.
                  </div>
                )}
              </div>

              {/* Refundable */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Is the down payment refundable?</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      If the owner cancels, will you return the cash deposit?
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, depositRefundable: !prev.depositRefundable }))
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      form.depositRefundable ? "bg-green-500" : "bg-red-400"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        form.depositRefundable ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div
                  className={`text-xs rounded-lg px-3 py-2 font-medium ${
                    form.depositRefundable
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {form.depositRefundable
                    ? "✅ Refundable — if the owner cancels, you will return the down payment in cash."
                    : "❌ Non-refundable — if the owner cancels, you keep the down payment."}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Cancellation Policy */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">⏰ Cancellation Policy</h2>
            <p className="text-sm text-gray-500 mt-1">
              How much advance notice do you need before a pet owner can cancel their booking?
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Minimum notice to cancel:</p>
              <span className="text-base font-black text-blue-600">
                {form.cancellationHoursNotice === 0
                  ? "Anytime"
                  : `${form.cancellationHoursNotice} hours`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={72}
              step={1}
              value={form.cancellationHoursNotice}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  cancellationHoursNotice: Number(e.target.value),
                }))
              }
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Anytime</span>
              <span>24 hrs</span>
              <span>48 hrs</span>
              <span>72 hrs</span>
            </div>
            <p className="text-xs text-gray-500 pt-1">
              {form.cancellationHoursNotice === 0
                ? "Pet owners can cancel at any time, even last minute."
                : `Pet owners must notify you at least ${form.cancellationHoursNotice} hours before the service to cancel.`}
            </p>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">📝 Additional Notes</h2>
            <p className="text-sm text-gray-500 mt-1">
              Any other reminders or instructions shown to pet owners when they book.
            </p>
          </div>
          <textarea
            value={form.additionalNotes ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, additionalNotes: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="e.g., Please prepare the exact cash amount. Bring your pet's vaccination record on the day of service."
          />
        </div>

        {/* Policy Preview — what owners see */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 space-y-3">
          <p className="text-sm font-bold text-blue-900">📋 What pet owners will see:</p>
          <ul className="text-sm text-blue-800 space-y-1.5">

            {/* Cash only — always */}
            <li className="flex gap-2">
              <span>💵</span>
              <span>Payment is <strong>cash only</strong> — paid directly to the provider.</span>
            </li>

            {/* Down payment terms */}
            {form.depositRequired ? (
              <>
                <li className="flex gap-2">
                  <span>💰</span>
                  <span>
                    A{" "}
                    {form.fullPaymentRequiredUpfront
                      ? "full cash payment"
                      : `${form.depositPercentage}% cash down payment`}{" "}
                    is required to confirm your booking —{" "}
                    {form.depositRefundable ? "refundable" : "non-refundable"} if cancelled.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>⏳</span>
                  <span>
                    Your booking stays <strong>Pending</strong> until the down payment is received in cash.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>❌</span>
                  <span>
                    If the down payment is not made within <strong>24 hours</strong>, your booking
                    will be <strong>automatically declined</strong>.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>✏️</span>
                  <span>
                    You can cancel or edit your booking on your own within <strong>24 hours</strong>{" "}
                    of submission — no provider approval needed.
                  </span>
                </li>
              </>
            ) : (
              <>
                <li className="flex gap-2">
                  <span>✅</span>
                  <span>No down payment required — pay in full on the day of service.</span>
                </li>
                <li className="flex gap-2">
                  <span>⏳</span>
                  <span>
                    Your booking stays <strong>Pending</strong> until the provider manually accepts it.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>✏️</span>
                  <span>
                    You can cancel or edit on your own while the booking is still{" "}
                    <strong>Pending</strong> and within <strong>24 hours</strong> of submission.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>🤝</span>
                  <span>
                    Once <strong>confirmed</strong>, any edits or cancellations require the
                    provider's approval.
                  </span>
                </li>
              </>
            )}

            {/* Delete rule — always */}
            <li className="flex gap-2">
              <span>🗑️</span>
              <span>
                A booking can only be deleted once it is <strong>Cancelled</strong> or{" "}
                <strong>Completed</strong>.
              </span>
            </li>

            {/* Cancellation notice */}
            <li className="flex gap-2">
              <span>🚫</span>
              <span>
                {form.cancellationHoursNotice === 0
                  ? "You may cancel at any time."
                  : `Cancellations must be made at least ${form.cancellationHoursNotice} hours in advance.`}
              </span>
            </li>

            {/* Additional notes */}
            {form.additionalNotes && (
              <li className="flex gap-2">
                <span>📌</span>
                <span>{form.additionalNotes}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-4 pb-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Policies"}
          </button>
          {saved && (
            <p className="text-sm font-medium text-green-600">✓ Policies saved successfully</p>
          )}
        </div>
      </div>
    </ProviderLayout>
  );
};

export default PoliciesPage;