"use client";

import React, { useState, useEffect } from "react";
import { useProviderContext } from "../context/ProviderAppContext";
import { getProviderDashboardStats, formatCurrency } from "../utils/providerUtils";
import { upsertProviderContactLink } from "@/app/lib/api";
import { supabase } from "@/app/lib/supabase";
import ProviderLayout from "../components/ProviderLayout";
import type { ProviderPolicy } from "../types";

const PAYMENT_OPTIONS = ["Cash", "GCash", "Maya", "Bank Transfer", "Credit Card"];

const ProviderProfilePage: React.FC = () => {
  const { user, services, bookings, updateUser, policy, savePolicy } = useProviderContext();
  const stats = getProviderDashboardStats(bookings, services);

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    businessName: user.businessName,
    businessAddress: user.businessAddress || "",
    bio: user.bio || "",
    contactLink: user.contactLink || "",
  });
  const [passwordData, setPasswordData] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "business" | "security" | "policies">("profile");
  const [policyForm, setPolicyForm] = useState<ProviderPolicy>(policy);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [policySaved, setPolicySaved] = useState(false);

  useEffect(() => { setPolicyForm(policy); }, [policy]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      return alert("Name and email are required");
    }
    updateUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      businessName: formData.businessName,
      businessAddress: formData.businessAddress,
      bio: formData.bio,
      contactLink: formData.contactLink,
    });
    // Persist contact link to Supabase providers table
    if (formData.contactLink !== undefined) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        upsertProviderContactLink(authUser.id, formData.contactLink).catch(console.error);
      }
    }
    showSuccess("Profile updated successfully!");
  };

  const handleChangePassword = () => {
    if (!passwordData.current || !passwordData.next || !passwordData.confirm) {
      return alert("Please fill in all password fields");
    }
    if (passwordData.next !== passwordData.confirm) {
      return alert("New passwords do not match");
    }
    if (passwordData.next.length < 6) {
      return alert("Password must be at least 6 characters");
    }
    setPasswordData({ current: "", next: "", confirm: "" });
    showSuccess("Password changed successfully!");
  };

  const handleSavePolicy = async () => {
    setSavingPolicy(true);
    try {
      await savePolicy(policyForm);
      setPolicySaved(true);
      setTimeout(() => setPolicySaved(false), 3000);
    } catch {
      alert("Failed to save policies. Please try again.");
    } finally {
      setSavingPolicy(false);
    }
  };

  const togglePaymentMethod = (method: string) => {
    setPolicyForm((prev) => ({
      ...prev,
      paymentMethodsAccepted: prev.paymentMethodsAccepted.includes(method)
        ? prev.paymentMethodsAccepted.filter((m) => m !== method)
        : [...prev.paymentMethodsAccepted, method],
    }));
  };

  const TABS = [
    { id: "profile" as const, label: "Personal Info", icon: "👤" },
    { id: "business" as const, label: "Business", icon: "🏢" },
    { id: "security" as const, label: "Security", icon: "🔒" },
    { id: "policies" as const, label: "Policies", icon: "📋" },
  ];

  return (
    <ProviderLayout>
      <div className="space-y-5 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl mb-1" style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, color: "var(--fur-slate)" }}>Profile</h1>
          <p className="text-gray-500 text-sm">Manage your account and business settings</p>
        </div>

        {/* Success Toast */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-2">
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {user.avatar || user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                {user.isVerified && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center space-x-1">
                    <span>✓</span>
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">{user.businessName}</p>
              <p className="text-gray-400 text-xs mt-0.5">{user.email}</p>
            </div>
            {/* Stat pills */}
            <div className="flex sm:flex-col gap-2">
              <div className="flex items-center space-x-1.5 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-full">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-bold text-yellow-700">{user.rating}</span>
                <span className="text-xs text-yellow-600">({user.totalReviews})</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                <span className="text-green-500">💰</span>
                <span className="text-sm font-bold text-green-700">{formatCurrency(stats.totalEarnings)}</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100">
            {[
              { label: "Total Bookings", value: stats.totalBookings },
              { label: "Completed", value: stats.completedBookings },
              { label: "Active Services", value: stats.activeServices },
              { label: "This Month", value: formatCurrency(stats.monthlyEarnings) },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Personal Info Tab */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                    <input
                      type="text"
                      defaultValue="Service Provider"
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Business Tab */}
            {activeTab === "business" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Address</label>
                  <input
                    type="text"
                    value={formData.businessAddress}
                    onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                    placeholder="123 Main St, City, State ZIP"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio / About</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell pet owners about your experience and approach..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/500 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact / Social Link</label>
                  <input
                    type="url"
                    value={formData.contactLink}
                    onChange={(e) => setFormData({ ...formData, contactLink: e.target.value })}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Pet owners will see this link after their booking is confirmed.</p>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Policies Tab */}
            {activeTab === "policies" && (
              <div className="space-y-5">
                {/* Payment Methods */}
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">💳 Accepted Payment Methods</p>
                  <div className="flex flex-wrap gap-2">
                    {PAYMENT_OPTIONS.map((method) => {
                      const selected = policyForm.paymentMethodsAccepted.includes(method);
                      return (
                        <button key={method} type="button" onClick={() => togglePaymentMethod(method)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${selected ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}>
                          {selected ? "✓ " : ""}{method}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Deposit */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-800">💰 Deposit Policy</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700">Require a downpayment?</p>
                      <p className="text-xs text-gray-400">Pet owners pay a deposit when booking.</p>
                    </div>
                    <button type="button"
                      onClick={() => setPolicyForm((prev) => ({ ...prev, depositRequired: !prev.depositRequired }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${policyForm.depositRequired ? "bg-blue-600" : "bg-gray-200"}`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${policyForm.depositRequired ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>

                  {policyForm.depositRequired && (
                    <div className="pl-2 space-y-3 border-l-2 border-blue-100">
                      <div>
                        <p className="text-sm text-gray-700 mb-1">Deposit: <span className="font-bold text-blue-600">{policyForm.depositPercentage}%</span></p>
                        <input type="range" min={10} max={100} step={5} value={policyForm.depositPercentage}
                          onChange={(e) => setPolicyForm((prev) => ({ ...prev, depositPercentage: Number(e.target.value) }))}
                          className="w-full accent-blue-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-700">Refundable if cancelled?</p>
                        <button type="button"
                          onClick={() => setPolicyForm((prev) => ({ ...prev, depositRefundable: !prev.depositRefundable }))}
                          className={`relative w-11 h-6 rounded-full transition-colors ${policyForm.depositRefundable ? "bg-green-500" : "bg-red-400"}`}>
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${policyForm.depositRefundable ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cancellation */}
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">⏰ Cancellation Notice: <span className="text-blue-600">{policyForm.cancellationHoursNotice} hrs</span></p>
                  <input type="range" min={0} max={72} step={1} value={policyForm.cancellationHoursNotice}
                    onChange={(e) => setPolicyForm((prev) => ({ ...prev, cancellationHoursNotice: Number(e.target.value) }))}
                    className="w-full accent-blue-600" />
                </div>

                {/* Notes */}
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">📝 Additional Notes</p>
                  <textarea value={policyForm.additionalNotes ?? ""} rows={2}
                    onChange={(e) => setPolicyForm((prev) => ({ ...prev, additionalNotes: e.target.value }))}
                    placeholder="e.g., Please bring vaccination records on the day of service."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button onClick={handleSavePolicy} disabled={savingPolicy}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-60">
                    {savingPolicy ? "Saving..." : "Save Policies"}
                  </button>
                  {policySaved && <p className="text-sm text-green-600 font-medium">✓ Saved</p>}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={passwordData.next}
                    onChange={(e) => setPasswordData({ ...passwordData, next: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  Password must be at least 6 characters long.
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleChangePassword}
                    className="px-6 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
};

export default ProviderProfilePage;