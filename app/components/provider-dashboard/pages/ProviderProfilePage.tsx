"use client";

import React, { useState } from "react";
import { useProviderContext } from "../context/ProviderAppContext";
import { getProviderDashboardStats, formatCurrency } from "../utils/providerUtils";
import ProviderLayout from "../components/ProviderLayout";

const ProviderProfilePage: React.FC = () => {
  const { user, services, bookings, updateUser } = useProviderContext();
  const stats = getProviderDashboardStats(bookings, services);

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    businessName: user.businessName,
    businessAddress: user.businessAddress || "",
    bio: user.bio || "",
  });
  const [passwordData, setPasswordData] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "business" | "security">("profile");

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSaveProfile = () => {
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
    });
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

  const TABS = [
    { id: "profile" as const, label: "Personal Info", icon: "👤" },
    { id: "business" as const, label: "Business", icon: "🏢" },
    { id: "security" as const, label: "Security", icon: "🔒" },
  ];

  return (
    <ProviderLayout>
      <div className="space-y-5 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Profile</h1>
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