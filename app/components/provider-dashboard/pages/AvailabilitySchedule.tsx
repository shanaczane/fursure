"use client";

import React from "react";

export interface ScheduleSlot {
  id: number;
  days: string[];
  open: string;
  close: string;
}

interface AvailabilityScheduleProps {
  slots: ScheduleSlot[];
  onChange: (slots: ScheduleSlot[]) => void;
  error?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const HOURS = [
  "12:00 AM", "1:00 AM", "2:00 AM", "3:00 AM", "4:00 AM", "5:00 AM",
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM",
];

let _uid = 0;
export const makeSlot = (
  open = "9:00 AM",
  close = "6:00 PM",
  days: string[] = []
): ScheduleSlot => ({ id: ++_uid, days, open, close });

export function slotsToAvailability(slots: ScheduleSlot[]): string[] {
  return slots
    .filter((s) => s.days.length > 0 && s.open !== s.close)
    .map((s) => {
      const sorted = [...s.days].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
      return `${sorted.join(", ")}: ${s.open} – ${s.close}`;
    });
}

const AvailabilitySchedule: React.FC<AvailabilityScheduleProps> = ({
  slots,
  onChange,
  error,
}) => {
  const addSlot = () => onChange([...slots, makeSlot()]);

  const removeSlot = (id: number) => {
    if (slots.length <= 1) return;
    onChange(slots.filter((s) => s.id !== id));
  };

  const setTime = (id: number, field: "open" | "close", val: string) =>
    onChange(slots.map((s) => (s.id === id ? { ...s, [field]: val } : s)));

  const toggleDay = (id: number, day: string) =>
    onChange(
      slots.map((s) => {
        if (s.id !== id) return s;
        const days = s.days.includes(day)
          ? s.days.filter((d) => d !== day)
          : [...s.days, day];
        return { ...s, days };
      })
    );

  return (
    <div
      className="rounded-2xl p-6 border"
      style={{ background: "white", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-800 text-base" style={{ color: "var(--fur-slate)" }}>
          🕐 Availability
        </h2>
      </div>
      <p className="text-xs mb-5" style={{ color: "var(--fur-slate-light)" }}>
        Set the days and hours you're available for bookings.
      </p>

      {error && (
        <p className="text-xs mb-4" style={{ color: "var(--fur-rose)" }}>
          {error}
        </p>
      )}

      <div className="space-y-3">
        {slots.map((slot) => {
          const sameTime = slot.open === slot.close;

          return (
            <div
              key={slot.id}
              className="rounded-xl border p-4"
              style={{ borderColor: "var(--border)", background: "var(--fur-cream)" }}
            >
              {/* Open / Close + Remove */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: "12px",
                  alignItems: "flex-end",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <p
                    className="text-xs font-700 mb-1.5"
                    style={{
                      color: "var(--fur-slate-mid)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Open at
                  </p>
                  <select
                    value={slot.open}
                    onChange={(e) => setTime(slot.id, "open", e.target.value)}
                    className="fur-input text-sm"
                    style={sameTime ? { borderColor: "var(--fur-rose)" } : {}}
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p
                    className="text-xs font-700 mb-1.5"
                    style={{
                      color: "var(--fur-slate-mid)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Close at
                  </p>
                  <select
                    value={slot.close}
                    onChange={(e) => setTime(slot.id, "close", e.target.value)}
                    className="fur-input text-sm"
                    style={sameTime ? { borderColor: "var(--fur-rose)" } : {}}
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Remove — flush with input bottom */}
                <button
                  type="button"
                  onClick={() => removeSlot(slot.id)}
                  disabled={slots.length <= 1}
                  className="rounded-xl border transition-all flex items-center justify-center"
                  style={{
                    width: "38px",
                    height: "38px",
                    flexShrink: 0,
                    alignSelf: "flex-end",
                    borderColor: "var(--border)",
                    background: "white",
                    color: slots.length <= 1 ? "var(--fur-slate-light)" : "var(--fur-rose)",
                    opacity: slots.length <= 1 ? 0.4 : 1,
                    cursor: slots.length <= 1 ? "default" : "pointer",
                  }}
                  title="Remove schedule"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", background: "var(--border)", marginBottom: "14px" }} />

              {/* Day checkboxes */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {DAYS.map((day) => {
                  const checked = slot.days.includes(day);
                  return (
                    <label
                      key={day}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "5px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        background: checked ? "var(--fur-teal-light)" : "white",
                        border: `1px solid ${checked ? "var(--fur-teal)" : "var(--border)"}`,
                        transition: "all 0.12s",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDay(slot.id, day)}
                        style={{
                          width: "14px",
                          height: "14px",
                          accentColor: "var(--fur-teal)",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        className="text-xs font-700"
                        style={{
                          color: checked ? "var(--fur-teal-dark)" : "var(--fur-slate-mid)",
                          userSelect: "none",
                        }}
                      >
                        {day}
                      </span>
                    </label>
                  );
                })}
              </div>

              {sameTime && (
                <p className="text-xs mt-2" style={{ color: "var(--fur-rose)" }}>
                  Open and close times must be different.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add more */}
     <button
        type="button"
        onClick={addSlot}
        className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-700 transition-all"
        style={{
            border: "0.5px solid var(--border)",
            background: "var(--fur-cream)",
            color: "var(--fur-slate-mid)",
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--fur-teal)";
            e.currentTarget.style.background = "var(--fur-teal-light)";
            e.currentTarget.style.color = "var(--fur-teal-dark)";
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.background = "var(--fur-cream)";
            e.currentTarget.style.color = "var(--fur-slate-mid)";
        }}
        >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add schedule
        </button>
    </div>
  );
};

export default AvailabilitySchedule;