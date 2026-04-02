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

// ── Simple rule row ───────────────────────────────────────────────

interface RuleRowProps {
  icon: string;
  text: React.ReactNode;
  variant?: "default" | "warning" | "success" | "info";
}

const VARIANT_STYLES = {
  default: { bg: "#F9FAFB", border: "#E5E7EB", color: "#374151" },
  warning: { bg: "#FFFBEB", border: "#FDE68A", color: "#92400E" },
  success: { bg: "#F0FDF4", border: "#BBF7D0", color: "#065F46" },
  info:    { bg: "#EFF6FF", border: "#BFDBFE", color: "#1E3A8A" },
};

const RuleRow: React.FC<RuleRowProps> = ({ icon, text, variant = "default" }) => {
  const s = VARIANT_STYLES[variant];
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl border text-sm"
      style={{ background: s.bg, borderColor: s.border, color: s.color }}>
      <span className="shrink-0 mt-0.5">{icon}</span>
      <span className="leading-relaxed">{text}</span>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────

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
  const requiresDownPayment     = Boolean(policy?.depositRequired);
  const depositPct              = policy?.depositPercentage ?? 0;
  const isFullUpfront           = policy?.fullPaymentRequiredUpfront ?? false;
  const depositRefundable       = policy?.depositRefundable ?? false;
  const cancellationHours       = policy?.cancellationHoursNotice ?? 0;
  const additionalNotes         = policy?.additionalNotes ?? "";

  const depositAmountDescription = isFullUpfront
    ? "the full service amount"
    : `${depositPct}% of the total service fee`;

  const formattedTime = (t: string) => {
    const [h] = t.split(":");
    const hr = parseInt(h);
    return `${hr % 12 || 12}:00 ${hr >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Frosted glass backdrop */}
      <div
        className="fixed inset-0 transition-opacity backdrop-blur-sm"
        style={{ background: "rgba(15, 23, 42, 0.4)" }}
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full">

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Step indicator */}
          {policy && (
            <div className="flex items-center gap-2 px-6 pt-6 pb-3">
              {(["details", "policy"] as const).map((s, i) => {
                const done = i === 0 && step === "policy";
                const active = step === s;
                return (
                  <React.Fragment key={s}>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${active ? "text-blue-600" : done ? "text-green-600" : "text-gray-400"}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${active ? "bg-blue-600 text-white" : done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
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

          <div className={`px-6 pb-6 ${policy ? "pt-1" : "pt-6"}`}>

            {/* ── Step 1: Details ── */}
            {step === "details" && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-0.5">Book {service.name}</h2>
                <p className="text-gray-400 text-sm mb-5">{service.provider}</p>
                <form onSubmit={handleDetailsNext} className="space-y-4">

                  {/* Pet */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Pet *</label>
                    {pets.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm">
                          You need to add a pet before booking.{" "}
                          <Link href="/owner/pets" className="text-yellow-900 font-semibold underline">Add a pet now</Link>
                        </p>
                      </div>
                    ) : (
                      <select value={selectedPetId} onChange={(e) => setSelectedPetId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required>
                        {pets.map((pet) => (
                          <option key={pet.id} value={pet.id}>{pet.name} ({pet.type} — {pet.breed})</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Date *</label>
                    <input type="date" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)}
                      min={todayStr}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Time *</label>
                    {noSlotsLeft ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800 font-medium">
                        ⏰ No slots left for today. Please pick a future date.
                      </div>
                    ) : (
                      <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required>
                        {availableSlots.map((slot) => (
                          <option key={slot.value} value={slot.value}>{slot.label}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Special Instructions <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                      placeholder="Any special requests or notes for the provider..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm" />
                  </div>

                  {/* Price */}
                  <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-blue-50">
                    <span className="text-sm font-semibold text-gray-700">Total Price</span>
                    <span className="text-xl font-bold text-blue-600">
                      ₱{service.price} <span className="text-sm font-medium text-blue-400">{service.priceUnit}</span>
                    </span>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="submit"
                      disabled={pets.length === 0 || noSlotsLeft || !selectedTime}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors">
                      {policy ? "Next: Review Terms →" : "Confirm Booking"}
                    </button>
                    <button type="button" onClick={onClose}
                      className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ── Step 2: Payment Terms ── */}
            {step === "policy" && policy && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-0.5">Payment & Booking Terms</h2>
                <p className="text-gray-400 text-sm mb-4">Read carefully before confirming.</p>

                {/* Booking summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Your Booking</p>
                  <p className="font-semibold text-gray-900 text-sm">{service.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {pets.find((p) => p.id === selectedPetId)?.name} · {selectedDate} at {formattedTime(selectedTime)}
                  </p>
                </div>

                <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-1">

                  {/* ── PAYMENT ── */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment</p>
                    <div className="space-y-1.5">
                      <RuleRow icon="💵" text={<span>All payments are <strong>cash only</strong> — paid directly to the provider.</span>} />
                      {requiresDownPayment ? (
                        <RuleRow
                          icon="💰"
                          variant={depositRefundable ? "info" : "warning"}
                          text={
                            <span>
                              A cash down payment of <strong>{depositAmountDescription}</strong> must be paid within <strong>24 hours</strong> of booking.{" "}
                              This deposit is <strong>{depositRefundable ? "refundable" : "non-refundable"}</strong> if you cancel.
                            </span>
                          }
                        />
                      ) : (
                        <RuleRow icon="✅" variant="success"
                          text={<span>No down payment needed. Pay the full amount in cash on the day of service.</span>} />
                      )}
                    </div>
                  </div>

                  {/* ── HOW IT WORKS ── */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">How Your Booking Works</p>
                    <div className="space-y-1.5">
                      {requiresDownPayment ? (
                        <>
                          <RuleRow icon="⏳" variant="warning"
                            text={<span>Your booking stays <strong>Pending</strong> until the provider receives your down payment in cash.</span>} />
                          <RuleRow icon="❌" variant="warning"
                            text={<span>If the down payment is not made within <strong>24 hours</strong>, your booking is <strong>automatically declined</strong>. You will need to rebook.</span>} />
                          <RuleRow icon="✏️" variant="info"
                            text={<span>You can cancel or edit your booking on your own while it is still <strong>Pending</strong> and within <strong>24 hours</strong> of submission.</span>} />
                          <RuleRow icon="🤝" variant="warning"
                            text={<span>Once <strong>confirmed</strong>, any edits or cancellations require the provider's approval.</span>} />
                        </>
                      ) : (
                        <>
                          <RuleRow icon="⏳" variant="info"
                            text={<span>Your booking stays <strong>Pending</strong> until the provider manually accepts or declines it.</span>} />
                          <RuleRow icon="✏️" variant="info"
                            text={<span>You can cancel or edit on your own while the booking is still <strong>Pending</strong> and within <strong>24 hours</strong> of submission.</span>} />
                          <RuleRow icon="🤝" variant="warning"
                            text={<span>Once <strong>confirmed</strong>, any edits or cancellations require the provider's approval.</span>} />
                        </>
                      )}
                      <RuleRow icon="🗑️"
                        text={<span>A booking can only be deleted once it is <strong>Cancelled</strong> or <strong>Completed</strong>.</span>} />
                    </div>
                  </div>

                  {/* ── CANCELLATION ── */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Cancellation</p>
                    <div className="space-y-1.5">
                      <RuleRow icon="✏️" variant="info"
                        text={<span>You can cancel for free while your booking is still <strong>Pending</strong> and within <strong>24 hours</strong> of submission — no notice needed.</span>} />
                      {cancellationHours > 0 ? (
                        <RuleRow icon="🔔" variant="warning"
                          text={<span>Once confirmed, cancellations must be made at least <strong>{cancellationHours} hour{cancellationHours > 1 ? "s" : ""}</strong> before your appointment.</span>} />
                      ) : (
                        <RuleRow icon="🔔" variant="success"
                          text={<span>Once confirmed, you may cancel at any time — no advance notice required.</span>} />
                      )}
                    </div>
                  </div>

                  {/* ── PROVIDER NOTES ── */}
                  {additionalNotes && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Provider Notes</p>
                      <RuleRow icon="📌" variant="warning" text={<span>{additionalNotes}</span>} />
                    </div>
                  )}

                </div>

                {/* Agree checkbox */}
                <label className="flex items-start gap-3 cursor-pointer mt-4 mb-4 select-none">
                  <input type="checkbox" checked={agreedToPolicy} onChange={(e) => setAgreedToPolicy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0" />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I have read and agree to the payment terms, booking rules, and cancellation policy above.
                  </span>
                </label>

                <div className="flex gap-3">
                  <button onClick={handleConfirm} disabled={!agreedToPolicy}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors">
                    Confirm Booking
                  </button>
                  <button onClick={() => setStep("details")}
                    className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors">
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