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

const TIME_SLOTS = [
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" },
];

function getFirstAvailableTime(dateStr: string): string {
  const today = new Date().toISOString().split("T")[0];
  if (dateStr !== today) return TIME_SLOTS[0].value;
  const nowHour = new Date().getHours();
  const available = TIME_SLOTS.find((s) => parseInt(s.value) > nowHour);
  return available ? available.value : "";
}

function getAvailableSlots(dateStr: string) {
  const today = new Date().toISOString().split("T")[0];
  if (dateStr !== today) return TIME_SLOTS;
  const nowHour = new Date().getHours();
  return TIME_SLOTS.filter((s) => parseInt(s.value) > nowHour);
}

// ── Rule card ────────────────────────────────────────────────────

interface RuleCardProps {
  icon: string;
  title: string;
  description: string;
  variant?: "default" | "warning" | "success" | "info";
}

const RuleCard: React.FC<RuleCardProps> = ({ icon, title, description, variant = "default" }) => {
  const styles: Record<string, { bg: string; border: string; titleColor: string; descColor: string }> = {
    default: { bg: "#F9FAFB", border: "#E5E7EB", titleColor: "#111827", descColor: "#6B7280" },
    warning: { bg: "#FFFBEB", border: "#FDE68A", titleColor: "#92400E", descColor: "#B45309" },
    success: { bg: "#F0FDF4", border: "#BBF7D0", titleColor: "#065F46", descColor: "#059669" },
    info:    { bg: "#EFF6FF", border: "#BFDBFE", titleColor: "#1E3A8A", descColor: "#2563EB" },
  };
  const s = styles[variant];

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl border"
      style={{ background: s.bg, borderColor: s.border }}
    >
      <span className="text-xl mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-sm font-semibold" style={{ color: s.titleColor }}>{title}</p>
        <p className="text-sm mt-0.5 leading-relaxed" style={{ color: s.descColor }}>{description}</p>
      </div>
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────

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
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  React.useEffect(() => {
    if (isOpen && pets.length > 0) {
      setStep("details");
      setSelectedPetId(pets[0].id);
      setNotes("");
      setAgreedToPolicy(false);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];
      setSelectedDate(tomorrowStr);
      setSelectedTime(getFirstAvailableTime(tomorrowStr));
    }
  }, [isOpen, pets]);

  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime(getFirstAvailableTime(dateStr));
  };

  const availableSlots = getAvailableSlots(selectedDate);
  const noSlotsLeft = selectedDate === todayStr && availableSlots.length === 0;

  const handleDetailsNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !selectedPetId || !selectedDate || !selectedTime) {
      alert("Please fill in all required fields");
      return;
    }
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

  // ── Derive from policy ──
  const requiresDownPayment   = Boolean(policy?.depositRequired);
  const depositPct            = policy?.depositPercentage ?? 0;
  const isFullUpfront         = policy?.fullPaymentRequiredUpfront ?? false;
  const depositRefundable     = policy?.depositRefundable ?? false;
  const cancellationHours     = policy?.cancellationHoursNotice ?? 0;
  const paymentMethods        = policy?.paymentMethodsAccepted ?? [];
  const additionalNotes       = policy?.additionalNotes ?? "";

  const depositLabel = isFullUpfront
    ? "Full payment required upfront (cash)"
    : `${depositPct}% cash down payment required`;

  const formattedTime = (t: string) => {
    const [h] = t.split(":");
    const hr = parseInt(h);
    return `${hr % 12 || 12}:00 ${hr >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full">

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Step indicator */}
          {policy && (
            <div className="flex items-center gap-2 px-8 pt-8 pb-4">
              {(["details", "policy"] as const).map((s, i) => {
                const done = i === 0 && step === "policy";
                const active = step === s;
                return (
                  <React.Fragment key={s}>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${active ? "text-blue-600" : done ? "text-green-600" : "text-gray-400"}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${active ? "bg-blue-600 text-white" : done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                        {done ? "✓" : i + 1}
                      </span>
                      {s === "details" ? "Booking Details" : "Payment Terms"}
                    </div>
                    {i === 0 && <div className="flex-1 h-px bg-gray-200" />}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          <div className={`p-8 ${policy ? "pt-2" : "pt-8"}`}>

            {/* ── Step 1: Details ── */}
            {step === "details" && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Book {service.name}</h2>
                <p className="text-gray-500 mb-6">{service.provider}</p>
                <form onSubmit={handleDetailsNext} className="space-y-5">

                  {/* Pet */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Pet *</label>
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

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date *</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={todayStr}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Time *</label>
                    {noSlotsLeft ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                        <p className="text-sm text-yellow-800 font-medium">
                          ⏰ No time slots left for today. Please select a future date.
                        </p>
                      </div>
                    ) : (
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {availableSlots.map((slot) => (
                          <option key={slot.value} value={slot.value}>{slot.label}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Special Instructions <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Any special requests or notes for the service provider..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* Price */}
                  <div className="bg-blue-50 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total Price</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₱{service.price} <span className="text-sm font-medium text-blue-400">{service.priceUnit}</span>
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={pets.length === 0 || noSlotsLeft || !selectedTime}
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
                    >
                      {policy ? "Next: Review Payment Terms →" : "Confirm Booking"}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ── Step 2: Payment Terms ── */}
            {step === "policy" && policy && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment & Booking Terms</h2>
                <p className="text-gray-500 text-sm mb-5">
                  Read the provider's terms carefully before confirming your booking.
                </p>

                {/* Booking summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Your Booking</p>
                  <p className="font-semibold text-gray-900">{service.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {pets.find((p) => p.id === selectedPetId)?.name}&nbsp;·&nbsp;
                    {selectedDate} at {formattedTime(selectedTime)}
                  </p>
                </div>

                {/* ── PAYMENT ── */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment</p>
                  <div className="space-y-2">

                    {/* Cash only — always shown */}
                    <RuleCard
                      icon="💵"
                      title="Cash Payment Only"
                      description="All payments are made directly in cash to the provider — no online or card payments."
                    />

                    {/* Accepted methods if specified */}
                    {paymentMethods.length > 0 && (
                      <RuleCard
                        icon="💳"
                        title="Accepted Payment Methods"
                        description={paymentMethods.join(", ")}
                      />
                    )}

                    {/* Down payment or none */}
                    {requiresDownPayment ? (
                      <RuleCard
                        icon="💰"
                        title={depositLabel}
                        description={
                          depositRefundable
                            ? `You must pay ${isFullUpfront ? "the full amount" : `${depositPct}% of the total`} in cash within 24 hours of booking. This deposit is refundable if you cancel within the allowed window.`
                            : `You must pay ${isFullUpfront ? "the full amount" : `${depositPct}% of the total`} in cash within 24 hours of booking. Note: this deposit is non-refundable.`
                        }
                        variant={depositRefundable ? "info" : "warning"}
                      />
                    ) : (
                      <RuleCard
                        icon="✅"
                        title="No Down Payment Required"
                        description="No deposit needed. Pay the full amount in cash on the day of service."
                        variant="success"
                      />
                    )}
                  </div>
                </div>

                {/* ── BOOKING FLOW ── */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">How Your Booking Works</p>
                  <div className="space-y-2">

                    {requiresDownPayment ? (
                      <>
                        {/* Rule 1 — pending until down payment received */}
                        <RuleCard
                          icon="⏳"
                          title="Booking stays Pending until down payment is received"
                          description={`Your booking will remain Pending after submission. It will only be confirmed once the provider receives your ${isFullUpfront ? "full payment" : `${depositPct}% down payment`} in cash.`}
                          variant="warning"
                        />

                        {/* Rule 2 — auto-declined after 24 hrs */}
                        <RuleCard
                          icon="❌"
                          title="Automatically declined if no payment within 24 hours"
                          description="If the down payment is not made within 24 hours of booking, your booking will be automatically declined. You will need to rebook."
                          variant="warning"
                        />

                        {/* Rule 3 — free to cancel/edit within 24 hrs, no approval needed */}
                        <RuleCard
                          icon="✏️"
                          title="Cancel or edit freely within 24 hours"
                          description="Within the first 24 hours after booking, you can cancel or edit your booking on your own — no approval from the provider is needed."
                          variant="info"
                        />
                      </>
                    ) : (
                      <>
                        {/* Rule 1 — pending until provider accepts */}
                        <RuleCard
                          icon="⏳"
                          title="Booking stays Pending until the provider accepts"
                          description="After submitting, your booking will remain Pending until the provider manually confirms or declines it."
                          variant="info"
                        />

                        {/* Rule 2 — self-cancel/edit while pending within 24 hrs */}
                        <RuleCard
                          icon="✏️"
                          title="Cancel or edit on your own while Pending (within 24 hrs)"
                          description="You can cancel or edit your booking without asking the provider — as long as it is still Pending and within 24 hours of submission."
                          variant="info"
                        />

                        {/* Rule 3 — need provider approval once confirmed */}
                        <RuleCard
                          icon="🤝"
                          title="Provider approval required after booking is confirmed"
                          description="Once the provider has confirmed your booking, any edits or cancellations will require the provider's approval before they take effect."
                          variant="warning"
                        />
                      </>
                    )}

                    {/* Rule — shared by both flows */}
                    <RuleCard
                      icon="🗑️"
                      title="Booking can only be deleted when Cancelled or Completed"
                      description="You cannot delete an active or pending booking. It must be cancelled first or already completed before it can be removed from your records."
                    />
                  </div>
                </div>

                {/* ── CANCELLATION NOTICE ── */}
                {cancellationHours > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Cancellation Notice</p>
                    <RuleCard
                      icon="🔔"
                      title={`${cancellationHours}-hour advance notice required`}
                      description={`You must inform the provider at least ${cancellationHours} hour${cancellationHours > 1 ? "s" : ""} before your appointment if you need to cancel.`}
                      variant="warning"
                    />
                  </div>
                )}

                {/* ── PROVIDER NOTES ── */}
                {additionalNotes && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Provider Notes</p>
                    <RuleCard
                      icon="📌"
                      title="Additional Instructions from Provider"
                      description={additionalNotes}
                      variant="warning"
                    />
                  </div>
                )}

                {/* Agree checkbox */}
                <label className="flex items-start gap-3 cursor-pointer mt-5 mb-5 select-none">
                  <input
                    type="checkbox"
                    checked={agreedToPolicy}
                    onChange={(e) => setAgreedToPolicy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0"
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    I understand and agree to the payment terms, booking rules, and cancellation policy above.
                  </span>
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={handleConfirm}
                    disabled={!agreedToPolicy}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
                  >
                    Confirm Booking
                  </button>
                  <button
                    onClick={() => setStep("details")}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
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