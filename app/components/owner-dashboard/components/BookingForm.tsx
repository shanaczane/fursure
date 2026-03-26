"use client";

import React, { useState } from "react";
import Link from "next/link";
import { type Service, type Pet } from "@/app/types";
import type { ProviderPolicy } from "@/app/components/provider-dashboard/types";

interface BookingFormProps {
  service: Service | null;
  pets: Pet[];
  policy: ProviderPolicy | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (
    serviceId: string,
    petId: string,
    date: string,
    time: string,
    notes: string,
  ) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  service,
  pets,
  policy,
  isOpen,
  onClose,
  onBook,
}) => {
  const [step, setStep] = useState<"details" | "policy">("details");
  const [selectedPetId, setSelectedPetId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  React.useEffect(() => {
    if (isOpen && pets.length > 0) {
      setStep("details");
      setSelectedPetId(pets[0].id);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split("T")[0]);
      setSelectedTime("10:00");
      setNotes("");
      setAgreedToPolicy(false);
    }
  }, [isOpen, pets]);

  const handleDetailsNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !selectedPetId || !selectedDate || !selectedTime) {
      alert("Please fill in all required fields");
      return;
    }
    // If provider has a policy, show it; otherwise confirm directly
    if (policy) {
      setStep("policy");
    } else {
      onBook(service.id, selectedPetId, selectedDate, selectedTime, notes);
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!service) return;
    onBook(service.id, selectedPetId, selectedDate, selectedTime, notes);
    onClose();
  };

  if (!isOpen || !service) return null;

  const depositLabel = () => {
    if (!policy?.depositRequired) return "No deposit required";
    if (policy.fullPaymentRequiredUpfront) return "Full payment required upfront";
    return `${policy.depositPercentage}% deposit required — ${policy.depositRefundable ? "refundable" : "non-refundable"}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Step indicator */}
          {policy && (
            <div className="flex items-center gap-2 px-8 pt-8 pb-0">
              {(["details", "policy"] as const).map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-1.5 text-xs font-semibold ${step === s ? "text-blue-600" : i < (step === "policy" ? 1 : 0) ? "text-green-600" : "text-gray-400"}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === s ? "bg-blue-600 text-white" : i < (step === "policy" ? 1 : 0) ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                      {i < (step === "policy" ? 1 : 0) ? "✓" : i + 1}
                    </span>
                    {s === "details" ? "Booking Details" : "Payment Terms"}
                  </div>
                  {i === 0 && <div className="flex-1 h-px bg-gray-200" />}
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="p-8 pt-5">
            {/* ── Step 1: Details ── */}
            {step === "details" && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Book {service.name}</h2>
                <p className="text-gray-600 mb-6">{service.provider}</p>
                <form onSubmit={handleDetailsNext} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Pet *
                    </label>
                    {pets.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm">
                          You need to add a pet before booking.{" "}
                          <Link href="/owner/pets" className="text-yellow-900 font-semibold underline">
                            Add a pet now
                          </Link>
                        </p>
                      </div>
                    ) : (
                      <select
                        value={selectedPetId}
                        onChange={(e) => setSelectedPetId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {pets.map((pet) => (
                          <option key={pet.id} value={pet.id}>
                            {pet.name} ({pet.type} - {pet.breed})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Date *
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Time *
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="08:00">8:00 AM</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Any special requests or notes for the service provider..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Total Price:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ₱{service.price} {service.priceUnit}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={pets.length === 0}
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                    >
                      {policy ? "Next: Review Payment Terms →" : "Confirm Booking"}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ── Step 2: Policy ── */}
            {step === "policy" && policy && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment Terms</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Review the provider's payment and cancellation policy before confirming.
                </p>

                {/* Booking summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Booking</p>
                  <p className="font-semibold text-gray-900">{service.name}</p>
                  <p className="text-sm text-gray-600">
                    {pets.find(p => p.id === selectedPetId)?.name} · {selectedDate} at{" "}
                    {(() => {
                      const [h] = selectedTime.split(":");
                      const hr = parseInt(h);
                      return `${hr % 12 || 12}:00 ${hr >= 12 ? "PM" : "AM"}`;
                    })()}
                  </p>
                </div>

                {/* Policy cards */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200">
                    <span className="text-xl">💳</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Accepted Payments</p>
                      <p className="text-sm text-gray-600">
                        {policy.paymentMethodsAccepted.length > 0
                          ? policy.paymentMethodsAccepted.join(", ")
                          : "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200">
                    <span className="text-xl">💰</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Deposit Policy</p>
                      <p className="text-sm text-gray-600">{depositLabel()}</p>
                      {policy.depositRequired && (
                        <p className="text-xs mt-1 font-medium" style={{ color: policy.depositRefundable ? "#059669" : "#DC2626" }}>
                          {policy.depositRefundable ? "✓ Refundable upon cancellation" : "✗ Non-refundable"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200">
                    <span className="text-xl">⏰</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Cancellation Policy</p>
                      <p className="text-sm text-gray-600">
                        {policy.cancellationHoursNotice === 0
                          ? "No advance notice required"
                          : `${policy.cancellationHoursNotice}-hour notice required to cancel`}
                      </p>
                    </div>
                  </div>

                  {policy.additionalNotes && (
                    <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50">
                      <span className="text-xl">📝</span>
                      <div>
                        <p className="text-sm font-semibold text-amber-800">Additional Notes</p>
                        <p className="text-sm text-amber-700">{policy.additionalNotes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Agree checkbox */}
                <label className="flex items-start gap-3 cursor-pointer mb-6 select-none">
                  <input
                    type="checkbox"
                    checked={agreedToPolicy}
                    onChange={(e) => setAgreedToPolicy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0"
                  />
                  <span className="text-sm text-gray-700">
                    I understand and agree to the payment and cancellation terms above.
                  </span>
                </label>

                <div className="flex space-x-4">
                  <button
                    onClick={handleConfirm}
                    disabled={!agreedToPolicy}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                  >
                    Confirm Booking
                  </button>
                  <button
                    onClick={() => setStep("details")}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    ← Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
