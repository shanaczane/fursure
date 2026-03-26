"use client";

import React, { useState, useEffect } from "react";
import { useProviderContext } from "../context/ProviderAppContext";
import ProviderLayout from "../components/ProviderLayout";
import type { ProviderPolicy } from "../types";

const PAYMENT_OPTIONS = ["Cash", "GCash", "Maya", "Bank Transfer", "Credit Card"];

const PoliciesPage: React.FC = () => {
  const { policy, savePolicy } = useProviderContext();
  const [form, setForm] = useState<ProviderPolicy>(policy);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync form when policy loads from Supabase
  useEffect(() => {
    setForm(policy);
  }, [policy]);

  const togglePaymentMethod = (method: string) => {
    setForm((prev) => ({
      ...prev,
      paymentMethodsAccepted: prev.paymentMethodsAccepted.includes(method)
        ? prev.paymentMethodsAccepted.filter((m) => m !== method)
        : [...prev.paymentMethodsAccepted, method],
    }));
  };

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">My Policies</h1>
          <p className="text-gray-600 text-sm">
            Set your payment rules and cancellation policy. These will be shown to pet owners before they confirm a booking.
          </p>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">💳 Accepted Payment Methods</h2>
          <p className="text-sm text-gray-500">Select all methods you accept from customers.</p>
          <div className="flex flex-wrap gap-3">
            {PAYMENT_OPTIONS.map((method) => {
              const selected = form.paymentMethodsAccepted.includes(method);
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => togglePaymentMethod(method)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                    selected
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {selected ? "✓ " : ""}{method}
                </button>
              );
            })}
          </div>
        </div>

        {/* Deposit Rules */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-900">💰 Deposit Policy</h2>

          {/* Require deposit toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Require a downpayment?</p>
              <p className="text-xs text-gray-500 mt-0.5">Pet owners must pay a deposit when booking.</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, depositRequired: !prev.depositRequired }))}
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
              {/* Deposit percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Percentage: <span className="text-blue-600 font-bold">{form.depositPercentage}%</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={form.depositPercentage}
                  onChange={(e) => setForm((prev) => ({ ...prev, depositPercentage: Number(e.target.value) }))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>10%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Full payment upfront */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Require full payment upfront?</p>
                  <p className="text-xs text-gray-500 mt-0.5">Overrides the deposit percentage to 100%.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({
                    ...prev,
                    fullPaymentRequiredUpfront: !prev.fullPaymentRequiredUpfront,
                    depositPercentage: !prev.fullPaymentRequiredUpfront ? 100 : prev.depositPercentage,
                  }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    form.fullPaymentRequiredUpfront ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      form.fullPaymentRequiredUpfront ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Refundable */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Is the deposit refundable?</p>
                  <p className="text-xs text-gray-500 mt-0.5">If cancelled, will the deposit be returned?</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, depositRefundable: !prev.depositRefundable }))}
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
              <p className="text-xs text-gray-500">
                {form.depositRefundable
                  ? "✅ Deposit is refundable upon cancellation."
                  : "❌ Deposit is non-refundable."}
              </p>
            </>
          )}
        </div>

        {/* Cancellation Policy */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">⏰ Cancellation Policy</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum notice required to cancel:{" "}
              <span className="text-blue-600 font-bold">{form.cancellationHoursNotice} hours</span>
            </label>
            <input
              type="range"
              min={0}
              max={72}
              step={1}
              value={form.cancellationHoursNotice}
              onChange={(e) => setForm((prev) => ({ ...prev, cancellationHoursNotice: Number(e.target.value) }))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0 hrs</span>
              <span>24 hrs</span>
              <span>48 hrs</span>
              <span>72 hrs</span>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-3">
          <h2 className="text-lg font-bold text-gray-900">📝 Additional Notes</h2>
          <p className="text-sm text-gray-500">Any other terms or reminders shown to customers during booking.</p>
          <textarea
            value={form.additionalNotes ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, additionalNotes: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="e.g., Please bring your pet's vaccination record on the day of service."
          />
        </div>

        {/* Policy Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 space-y-2">
          <p className="text-sm font-bold text-blue-800">📋 What customers will see:</p>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Payment: {form.paymentMethodsAccepted.join(", ") || "Not specified"}</li>
            {form.depositRequired ? (
              <li>
                {form.fullPaymentRequiredUpfront
                  ? "Full payment required upfront"
                  : `${form.depositPercentage}% deposit required`}
                {" "}— {form.depositRefundable ? "refundable" : "non-refundable"}
              </li>
            ) : (
              <li>No deposit required</li>
            )}
            <li>
              Cancellation: {form.cancellationHoursNotice === 0
                ? "No advance notice required"
                : `${form.cancellationHoursNotice}-hour notice required`}
            </li>
            {form.additionalNotes && <li>{form.additionalNotes}</li>}
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
