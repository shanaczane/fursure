"use client";

import React, { useState } from "react";
import Link from "next/link";
import { type Service, type Pet } from "@/app/types";

interface BookingFormProps {
  service: Service | null;
  pets: Pet[];
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
  isOpen,
  onClose,
  onBook,
}) => {
  const [selectedPetId, setSelectedPetId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [notes, setNotes] = useState("");

  React.useEffect(() => {
    if (isOpen && pets.length > 0) {
      setSelectedPetId(pets[0].id);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split("T")[0]);
      setSelectedTime("10:00");
      setNotes("");
    }
  }, [isOpen, pets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !selectedPetId || !selectedDate || !selectedTime) {
      alert("Please fill in all required fields");
      return;
    }
    onBook(service.id, selectedPetId, selectedDate, selectedTime, notes);
    onClose();
  };

  if (!isOpen || !service) return null;

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
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Book {service.name}
            </h2>
            <p className="text-gray-600 mb-6">{service.provider}</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Pet *
                </label>
                {pets.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                      You need to add a pet before booking.{" "}
                      <Link
                        href="/owner/pets"
                        className="text-yellow-900 font-semibold underline"
                      >
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
                  <span className="text-gray-700 font-medium">
                    Total Price:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${service.price} {service.priceUnit}
                  </span>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={pets.length === 0}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                >
                  Confirm Booking
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
