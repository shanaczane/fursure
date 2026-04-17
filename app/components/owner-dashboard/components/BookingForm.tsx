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
  // ── onBook now receives the full policy snapshot so the caller can
  //    stamp depositPercentage, depositRefundable, and downPaymentDeadlineHours
  //    directly onto the booking row at insert time. ──────────────────────────
  onBook: (
    serviceId: string,
    petId: string,
    date: string,
    time: string,
    notes: string,
    policySnapshot: {
      requiresDownPayment: boolean;
      depositPercentage: number;
      depositRefundable: boolean;
      downPaymentDeadlineHours: number;
      fullPaymentRequiredUpfront: boolean;
    },
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

// Day-of-week index matching JS Date.getDay() (0 = Sun)
const DAY_INDEX: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

/**
 * Parse a time string into an hour (0-23).
 * Handles all formats produced by AvailabilitySchedule:
 *   "9AM"  "9:00 AM"  "9:00AM"  "12:00 PM"  "17:00"
 * Returns -1 if unparseable.
 */
function parseTimeToHour(timeStr: string): number {
  if (!timeStr) return -1;
  const s = timeStr.trim().toLowerCase().replace(/\s+/g, "");

  const match = s.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/);
  if (!match) return -1;

  let hour = parseInt(match[1]);
  const meridiem = match[3];

  if (meridiem === "pm" && hour !== 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;

  return hour;
}

/**
 * Given a service's availability strings and a selected date, returns
 * { startHour, endHour } for that day, or null if the provider is closed.
 */
function getAvailabilityForDate(
  availability: string[],
  dateStr: string,
): { startHour: number; endHour: number } | null {
  if (!availability || availability.length === 0) return { startHour: 0, endHour: 24 };

  const [y, m, d] = dateStr.split("-").map(Number);
  const dayOfWeek = new Date(y, m - 1, d).getDay();

  for (const slot of availability) {
    const colonIdx = slot.indexOf(":");
    if (colonIdx === -1) continue;

    const daysPart = slot.slice(0, colonIdx).trim();
    const timePart = slot.slice(colonIdx + 1).trim();

    const timeSepMatch = timePart.match(/^(.+?)\s*[-\u2013\u2014]\s*(.+)$/);
    if (!timeSepMatch) continue;

    const startHour = parseTimeToHour(timeSepMatch[1].trim());
    const endHour   = parseTimeToHour(timeSepMatch[2].trim());
    if (startHour === -1 || endHour === -1) continue;

    const activeDays = new Set<number>();
    const tokens = daysPart.split(/[\s,]+/).map((t) => t.toLowerCase());

    for (const token of tokens) {
      if (!token) continue;

      const rangeMatch = token.match(/^([a-z]{3})-([a-z]{3})$/);
      if (rangeMatch) {
        const from = DAY_INDEX[rangeMatch[1]];
        const to   = DAY_INDEX[rangeMatch[2]];
        if (from === undefined || to === undefined) continue;

        if (to >= from) {
          for (let di = from; di <= to; di++) activeDays.add(di);
        } else {
          for (let di = from; di <= 6; di++) activeDays.add(di);
          for (let di = 0; di <= to; di++) activeDays.add(di);
        }
        continue;
      }

      const abbrev = token.slice(0, 3);
      if (DAY_INDEX[abbrev] !== undefined) {
        activeDays.add(DAY_INDEX[abbrev]);
      }
    }

    if (activeDays.has(dayOfWeek)) {
      return { startHour, endHour };
    }
  }

  return null;
}

function getAvailableSlots(dateStr: string, availability?: string[]) {
  const today = new Date().toISOString().split("T")[0];
  const nowHour = new Date().getHours();

  let slots = TIME_SLOTS;

  if (availability && availability.length > 0) {
    const avail = getAvailabilityForDate(availability, dateStr);
    if (!avail) return [];
    slots = slots.filter((s) => {
      const h = parseInt(s.value);
      return h >= avail.startHour && h < avail.endHour;
    });
  }

  if (dateStr === today) {
    slots = slots.filter((s) => parseInt(s.value) > nowHour);
  }

  return slots;
}

function getFirstAvailableTime(dateStr: string, availability?: string[]): string {
  const slots = getAvailableSlots(dateStr, availability);
  return slots[0]?.value ?? "";
}

/* ─── Format deadline hours into a human-readable string ────────────────── */
function formatDeadlineHours(hours: number): string {
  if (hours === 1)  return "1 hour";
  if (hours < 24)   return `${hours} hours`;
  if (hours === 24) return "24 hours (1 day)";
  if (hours === 48) return "48 hours (2 days)";
  if (hours === 72) return "72 hours (3 days)";
  const days = Math.round(hours / 24);
  return `${hours} hours (${days} days)`;
}

/* ─── Term row ───────────────────────────────────────────────────────────── */
interface TermRowProps {
  label: string;
  value: React.ReactNode;
  accent?: string;
}
const TermRow: React.FC<TermRowProps> = ({ label, value, accent = "#E5E7EB" }) => (
  <div
    className="flex flex-col gap-0.5 px-4 py-3 rounded-xl border"
    style={{ background: "var(--fur-cream)", borderColor: "var(--border)", borderLeft: `3px solid ${accent}` }}
  >
    <p className="text-xs font-700 uppercase tracking-wide" style={{ color: "var(--fur-slate-mid)", fontFamily: "'Nunito', sans-serif" }}>
      {label}
    </p>
    <div className="text-sm font-600 leading-relaxed" style={{ color: "var(--fur-slate)", fontFamily: "'Nunito', sans-serif" }}>
      {value}
    </div>
  </div>
);

/* ─── Main component ─────────────────────────────────────────────────────── */
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
      setSelectedTime(getFirstAvailableTime(tomorrowStr, service?.availability));
    }
  }, [isOpen, pets, service]);

  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime(getFirstAvailableTime(dateStr, service?.availability));
  };

  const availableSlots = getAvailableSlots(selectedDate, service?.availability ?? []);
  const providerClosedThisDay =
    (service?.availability ?? []).length > 0 &&
    getAvailabilityForDate(service!.availability, selectedDate) === null;
  const noSlotsLeft = !providerClosedThisDay && availableSlots.length === 0;

  // ── Derive from policy ────────────────────────────────────────────────────
  // All values read directly from the ProviderPolicy the provider saved.
  // These are also what gets stamped onto the booking row at creation time.
  const requiresDownPayment     = Boolean(policy?.depositRequired);
  const depositPct              = policy?.depositPercentage ?? 0;
  const isFullUpfront           = policy?.fullPaymentRequiredUpfront ?? false;
  const depositRefundable       = policy?.depositRefundable ?? false;
  const cancellationHours       = policy?.cancellationHoursNotice ?? 0;
  const additionalNotes         = policy?.additionalNotes ?? "";
  const depositDeadlineHours    = policy?.downPaymentDeadlineHours ?? 24;
  const deadlineLabel           = formatDeadlineHours(depositDeadlineHours);

  const depositLabel = isFullUpfront
    ? "full amount upfront"
    : `${depositPct}% down payment`;

  const formattedTime = (t: string) => {
    const [h] = t.split(":");
    const hr = parseInt(h);
    return `${hr % 12 || 12}:00 ${hr >= 12 ? "PM" : "AM"}`;
  };

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  const depositAmount   = service ? (service.price * depositPct) / 100 : 0;
  const remainingAmount = service ? service.price - depositAmount : 0;

  // ── Build the policy snapshot that gets passed through onBook ────────────
  // This is the single source of truth: whatever the provider has set in
  // their Policies tab is what gets recorded on the booking row.
  const policySnapshot = {
    requiresDownPayment,
    depositPercentage:        depositPct,
    depositRefundable,
    downPaymentDeadlineHours: depositDeadlineHours,
    fullPaymentRequiredUpfront: isFullUpfront,
  };

  const handleDetailsNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !selectedPetId || !selectedDate || !selectedTime) {
      alert("Please fill in all required fields");
      return;
    }
    if (policy) {
      setStep("policy");
    } else {
      // No policy configured — book immediately with safe defaults
      onBook(service.id, selectedPetId, selectedDate, selectedTime, notes, {
        requiresDownPayment: false,
        depositPercentage: 0,
        depositRefundable: false,
        downPaymentDeadlineHours: 24,
        fullPaymentRequiredUpfront: false,
      });
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!service) return;
    // ── Pass the full policy snapshot so the booking insert can store
    //    depositPercentage, depositRefundable, and downPaymentDeadlineHours
    //    alongside the booking row. ──────────────────────────────────────────
    onBook(service.id, selectedPetId, selectedDate, selectedTime, notes, policySnapshot);
    onClose();
  };

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity"
        style={{ background: "rgba(26,35,50,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full flex flex-col"
          style={{ maxWidth: "580px", maxHeight: "90vh" }}
        >
          {/* ── Modal header: step bar + close ── */}
          <div
            className="flex items-center gap-2 px-6 py-4 border-b shrink-0"
            style={{ borderColor: "var(--border)", background: "var(--fur-cream)", borderRadius: "1rem 1rem 0 0" }}
          >
            {policy ? (
              <>
                {(["details", "policy"] as const).map((s, i) => {
                  const done   = i === 0 && step === "policy";
                  const active = step === s;
                  return (
                    <React.Fragment key={s}>
                      <div
                        className="flex items-center gap-1.5 text-xs font-700 shrink-0"
                        style={{ color: done ? "var(--fur-teal)" : active ? "var(--fur-slate)" : "var(--fur-slate-light)" }}
                      >
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-800"
                          style={{
                            background: done ? "var(--fur-teal)" : active ? "var(--fur-slate)" : "var(--fur-mist)",
                            color: done || active ? "white" : "var(--fur-slate-light)",
                          }}
                        >
                          {done ? "✓" : i + 1}
                        </span>
                        <span>{s === "details" ? "Booking Details" : "Payment Terms"}</span>
                      </div>
                      {i === 0 && (
                        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            ) : (
              <p className="font-800 text-sm" style={{ color: "var(--fur-slate)", fontFamily: "'Fraunces', serif" }}>
                Book a Service
              </p>
            )}

            <div className="flex-1" />

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors"
              style={{ background: "var(--fur-mist)", color: "var(--fur-slate-mid)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#E5E7EB")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--fur-mist)")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* ── Scrollable body ── */}
          <div className="overflow-y-auto flex-1 px-6 py-5">

            {/* ── Step 1: Details ── */}
            {step === "details" && (
              <>
                <div className="mb-5">
                  <h2 className="text-xl font-900 leading-tight" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                    Book {service.name}
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: "var(--fur-slate-light)" }}>{service.provider}</p>
                </div>

                <form onSubmit={handleDetailsNext} className="space-y-4">
                  {/* Pet */}
                  <div>
                    <label className="block text-sm font-700 mb-1.5" style={{ color: "var(--fur-slate)" }}>
                      Select Pet <span style={{ color: "var(--fur-rose)" }}>*</span>
                    </label>
                    {pets.length === 0 ? (
                      <div className="rounded-xl px-4 py-3 border" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
                        <p className="text-sm" style={{ color: "#92400E" }}>
                          You need to add a pet before booking.{" "}
                          <Link href="/owner/pets" className="font-700 underline" style={{ color: "#78350F" }}>
                            Add a pet now
                          </Link>
                        </p>
                      </div>
                    ) : (
                      <select
                        value={selectedPetId}
                        onChange={(e) => setSelectedPetId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm border"
                        style={{ borderColor: "var(--border)", color: "var(--fur-slate)", background: "white", fontFamily: "'Nunito', sans-serif" }}
                        required
                      >
                        {pets.map((pet) => (
                          <option key={pet.id} value={pet.id}>
                            {pet.name} ({pet.type} — {pet.breed})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Availability hint */}
                  {service.availability && service.availability.length > 0 && (
                    <div
                      className="rounded-xl px-4 py-2.5 border flex flex-wrap gap-x-3 gap-y-1"
                      style={{ background: "var(--fur-teal-light)", borderColor: "var(--fur-teal-light)" }}
                    >
                      <p className="text-xs font-700 w-full" style={{ color: "var(--fur-teal-dark)" }}>
                        Provider availability
                      </p>
                      {service.availability.map((a, i) => (
                        <span key={i} className="text-xs font-600" style={{ color: "var(--fur-teal-dark)" }}>
                          {a}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Date + Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-700 mb-1.5" style={{ color: "var(--fur-slate)" }}>
                        Select Date <span style={{ color: "var(--fur-rose)" }}>*</span>
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        min={todayStr}
                        className="w-full px-4 py-3 rounded-xl text-sm border"
                        style={{ borderColor: "var(--border)", color: "var(--fur-slate)", background: "white" }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-700 mb-1.5" style={{ color: "var(--fur-slate)" }}>
                        Select Time <span style={{ color: "var(--fur-rose)" }}>*</span>
                      </label>
                      {providerClosedThisDay ? (
                        <div className="rounded-xl px-4 py-3 border text-sm" style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#991B1B" }}>
                          Not available on this day — choose another date.
                        </div>
                      ) : noSlotsLeft ? (
                        <div className="rounded-xl px-4 py-3 border text-sm" style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}>
                          No slots left — pick a future date.
                        </div>
                      ) : (
                        <select
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl text-sm border"
                          style={{ borderColor: "var(--border)", color: "var(--fur-slate)", background: "white", fontFamily: "'Nunito', sans-serif" }}
                          required
                        >
                          {availableSlots.map((slot) => (
                            <option key={slot.value} value={slot.value}>{slot.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-700 mb-1.5" style={{ color: "var(--fur-slate)" }}>
                      Special Instructions{" "}
                      <span className="font-600" style={{ color: "var(--fur-slate-light)" }}>(optional)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Any special requests or notes for the provider..."
                      className="w-full px-4 py-3 rounded-xl text-sm border resize-none"
                      style={{ borderColor: "var(--border)", color: "var(--fur-slate)", background: "white", fontFamily: "'Nunito', sans-serif" }}
                    />
                  </div>

                  {/* Price */}
                  <div
                    className="rounded-xl px-4 py-3 space-y-1"
                    style={{ background: "var(--fur-teal-light)", border: "1px solid var(--fur-teal-light)" }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-700" style={{ color: "var(--fur-teal-dark)" }}>Total Price</span>
                      <span className="font-900 text-lg" style={{ color: "var(--fur-teal)", fontFamily: "'Fraunces', serif" }}>
                        ₱{service.price}{" "}
                        <span className="text-sm font-600" style={{ color: "var(--fur-teal-dark)" }}>{service.priceUnit}</span>
                      </span>
                    </div>
                    {requiresDownPayment && depositPct > 0 && (
                      <div className="flex justify-between items-center pt-1 border-t" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                        <span className="text-xs font-600" style={{ color: "var(--fur-teal-dark)" }}>
                          {isFullUpfront ? "Pay upfront (100%)" : `Down payment (${depositPct}%)`}
                        </span>
                        <span className="text-sm font-800" style={{ color: "var(--fur-teal-dark)", fontFamily: "'Fraunces', serif" }}>
                          ₱{depositAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {requiresDownPayment && depositPct > 0 && !isFullUpfront && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-600" style={{ color: "var(--fur-teal-dark)" }}>
                          Remaining (on appointment day)
                        </span>
                        <span className="text-sm font-800" style={{ color: "var(--fur-teal-dark)", fontFamily: "'Fraunces', serif" }}>
                          ₱{remainingAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={pets.length === 0 || providerClosedThisDay || noSlotsLeft || !selectedTime}
                      className="flex-1 py-3 rounded-xl font-800 text-sm transition-colors"
                      style={{ background: "var(--fur-teal)", color: "white" }}
                    >
                      {policy ? "Next: Review Terms →" : "Confirm Booking"}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-3 rounded-xl font-700 text-sm transition-colors"
                      style={{ background: "var(--fur-mist)", color: "var(--fur-slate)" }}
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
                <div className="mb-5">
                  <h2 className="text-xl font-900 leading-tight" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
                    Payment &amp; Terms
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: "var(--fur-slate-light)" }}>
                    Review before confirming your booking.
                  </p>
                </div>

                {/* Booking summary */}
                <div
                  className="rounded-xl px-4 py-3 mb-5 border"
                  style={{ background: "var(--fur-mist)", borderColor: "var(--border)" }}
                >
                  <p className="text-xs font-700 uppercase tracking-wide mb-1" style={{ color: "var(--fur-slate-mid)" }}>
                    Your Booking
                  </p>
                  <p className="font-800 text-sm" style={{ color: "var(--fur-slate)" }}>{service.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--fur-slate-light)" }}>
                    {selectedPet?.name} · {selectedDate} at {formattedTime(selectedTime)}
                  </p>

                  {requiresDownPayment && depositPct > 0 && (
                    <div className="mt-2 pt-2 border-t space-y-0.5" style={{ borderColor: "var(--border)" }}>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: "var(--fur-slate-mid)" }}>Total</span>
                        <span className="font-700" style={{ color: "var(--fur-slate)" }}>₱{service.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: "var(--fur-slate-mid)" }}>
                          {isFullUpfront ? "Pay upfront (100%)" : `Down payment (${depositPct}%)`}
                        </span>
                        <span className="font-700" style={{ color: "var(--fur-teal)" }}>₱{depositAmount.toFixed(2)}</span>
                      </div>
                      {!isFullUpfront && (
                        <div className="flex justify-between text-xs">
                          <span style={{ color: "var(--fur-slate-mid)" }}>Remaining on appointment day</span>
                          <span className="font-700" style={{ color: "var(--fur-slate)" }}>₱{remainingAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 mb-5">
                  <TermRow
                    label="Payment"
                    accent="var(--fur-teal)"
                    value={
                      requiresDownPayment ? (
                        <span>
                          Pay a <strong>{depositLabel}</strong>{" "}
                          {depositPct > 0 && !isFullUpfront && (
                            <>(₱{depositAmount.toFixed(2)})</>
                          )}{" "}
                          in cash to the provider within{" "}
                          <strong>{deadlineLabel}</strong> to hold your slot. This deposit is{" "}
                          <strong>{depositRefundable ? "refundable" : "non-refundable"}</strong> if you cancel.
                        </span>
                      ) : (
                        <span>
                          No down payment needed. Pay the <strong>full amount in cash</strong> to the provider on the day of your appointment.
                        </span>
                      )
                    }
                  />

                  <TermRow
                    label="Booking flow"
                    accent="#F59E0B"
                    value={
                      requiresDownPayment ? (
                        <span>
                          Your booking stays <strong>Pending</strong> until your cash down payment is received.
                          If not paid within <strong>{deadlineLabel}</strong>, it is automatically cancelled.
                        </span>
                      ) : (
                        <span>
                          Your booking stays <strong>Pending</strong> until the provider manually accepts it.
                          You can freely edit or cancel while it is still Pending and within 24 hours of booking.
                        </span>
                      )
                    }
                  />

                  <TermRow
                    label="Cancellation"
                    accent="#A78BFA"
                    value={
                      cancellationHours > 0 ? (
                        <span>
                          Once <strong>confirmed</strong>, cancellations must be requested at least{" "}
                          <strong>{cancellationHours} hour{cancellationHours !== 1 ? "s" : ""}</strong> before your appointment and require provider approval.
                        </span>
                      ) : (
                        <span>
                          Once <strong>confirmed</strong>, any edits or cancellations require the provider&apos;s approval.
                          You may cancel at any time — no advance notice required.
                        </span>
                      )
                    }
                  />

                  {additionalNotes && (
                    <TermRow
                      label="Provider note"
                      accent="#F97316"
                      value={<span>{additionalNotes}</span>}
                    />
                  )}
                </div>

                <label
                  className="flex items-start gap-3 cursor-pointer mb-4 select-none rounded-xl px-4 py-3 border"
                  style={{ background: "var(--fur-cream)", borderColor: "var(--border)" }}
                >
                  <input
                    type="checkbox"
                    checked={agreedToPolicy}
                    onChange={(e) => setAgreedToPolicy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 shrink-0"
                    style={{ accentColor: "var(--fur-teal)" }}
                  />
                  <span className="text-sm font-600 leading-relaxed" style={{ color: "var(--fur-slate)" }}>
                    I have read and agree to the payment and cancellation terms above.
                  </span>
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={handleConfirm}
                    disabled={!agreedToPolicy}
                    className="flex-1 py-3 rounded-xl font-800 text-sm transition-colors"
                    style={{
                      background: agreedToPolicy ? "var(--fur-teal)" : "var(--fur-mist)",
                      color: agreedToPolicy ? "white" : "var(--fur-slate-light)",
                      cursor: agreedToPolicy ? "pointer" : "not-allowed",
                    }}
                  >
                    Confirm Booking
                  </button>
                  <button
                    onClick={() => setStep("details")}
                    className="px-5 py-3 rounded-xl font-700 text-sm transition-colors"
                    style={{ background: "var(--fur-mist)", color: "var(--fur-slate)" }}
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