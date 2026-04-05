"use client";

import React, { useState, useEffect } from "react";
import { useAppContext } from "@/app/contexts/AppContext";
import { type Pet, type Vaccination } from "@/app/types";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import ConfirmDialog from "../components/ConfirmDialog";
import SuccessModal from "../components/SuccessModal";
import {
  fetchPetVaccinations,
  insertVaccination,
  deleteVaccinationRecord,
} from "@/app/lib/api";

const PetAvatar = ({ name, size = "md" }: { name: string; size?: "md" | "lg" }) => {
  const initial = name.charAt(0).toUpperCase();
  const dim = size === "lg" ? "w-16 h-16 text-2xl" : "w-14 h-14 text-xl";
  return (
    <div
      className={`${dim} rounded-2xl flex items-center justify-center shrink-0 font-900`}
      style={{ background: "var(--fur-teal)", color: "white", fontFamily: "'Fraunces', serif" }}
    >
      {initial}
    </div>
  );
};

const GENDER_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  unknown: "Unknown",
};

const emptyForm = {
  name: "",
  type: "dog" as Pet["type"],
  breed: "",
  age: 1,
  weight: "",
  gender: "unknown" as Pet["gender"],
  color: "",
  medicalNotes: "",
};

const emptyVaccinationForm = {
  name: "",
  dateGiven: "",
  nextDueDate: "",
  vetName: "",
  notes: "",
};

// ─── Inline error banner ──────────────────────────────────────────────────────
const ErrorBanner = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div
    className="flex items-start gap-3 px-4 py-3 rounded-xl border"
    style={{ background: "#FEF2F2", borderColor: "#FCA5A5", color: "#991B1B" }}
  >
    <svg
      className="shrink-0 mt-0.5"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    <p className="text-sm flex-1">{message}</p>
    <button onClick={onClose} style={{ color: "#991B1B", opacity: 0.6 }}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
);

const PetsPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loadingVaccinations, setLoadingVaccinations] = useState(false);
  const [isAddingVaccination, setIsAddingVaccination] = useState(false);
  const [vaccinationForm, setVaccinationForm] = useState(emptyVaccinationForm);
  const [activeTab, setActiveTab] = useState<"profile" | "vaccinations">("profile");

  // ── Error state (replaces alert()) ──────────────────────────────────────────
  const [formError, setFormError] = useState<string | null>(null);
  const [vaccinationError, setVaccinationError] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const { user, pets, bookings, addPet, updatePet, deletePet } = useAppContext();
  const [formData, setFormData] = useState(emptyForm);

  const upcomingCount = bookings.filter(
    (b) =>
      (b.status === "pending" || b.status === "confirmed") &&
      new Date(b.date + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0)),
  ).length;

  useEffect(() => {
    if (!selectedPet) return;
    setLoadingVaccinations(true);
    setVaccinationError(null);
    fetchPetVaccinations(selectedPet.id)
      .then(setVaccinations)
      .catch((err) => {
        setVaccinations([]);
        setVaccinationError(
          err instanceof Error ? err.message : "Failed to load vaccination records.",
        );
      })
      .finally(() => setLoadingVaccinations(false));
  }, [selectedPet]);

  const handleStartAdd = () => {
    setFormData(emptyForm);
    setFormError(null);
    setIsAddingPet(true);
    setEditingPet(null);
    setSelectedPet(null);
  };

  const handleStartEdit = (pet: Pet) => {
    setFormData({
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight ?? "",
      gender: pet.gender ?? "unknown",
      color: pet.color ?? "",
      medicalNotes: pet.medicalNotes ?? "",
    });
    setFormError(null);
    setEditingPet(pet);
    setIsAddingPet(false);
    setSelectedPet(null);
  };

  const handleCancelEdit = () => {
    setEditingPet(null);
    setIsAddingPet(false);
    setFormData(emptyForm);
    setFormError(null);
  };

  const handleSavePet = async () => {
    if (!formData.name || !formData.breed) {
      setFormError("Please fill in all required fields (Name and Breed).");
      return;
    }
    setFormError(null);
    try {
      if (editingPet) {
        await updatePet(editingPet.id, formData);
        setSuccessModal({
          isOpen: true,
          title: "Pet Updated",
          message: `${formData.name}'s profile has been updated successfully!`,
        });
      } else {
        await addPet(formData);
        setSuccessModal({
          isOpen: true,
          title: "Pet Added",
          message: `${formData.name} has been added to your pets!`,
        });
      }
      handleCancelEdit();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save pet. Please try again.",
      );
    }
  };

  const handleDeletePet = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Pet",
      message: `Are you sure you want to delete ${name}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deletePet(id);
          if (selectedPet?.id === id) setSelectedPet(null);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          setSuccessModal({
            isOpen: true,
            title: "Pet Deleted",
            message: `${name} has been removed from your pets.`,
          });
        } catch (err) {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          setFormError(
            err instanceof Error ? err.message : "Failed to delete pet. Please try again.",
          );
        }
      },
    });
  };

  const handleSelectPet = (pet: Pet) => {
    setSelectedPet(pet);
    setActiveTab("profile");
    setIsAddingPet(false);
    setEditingPet(null);
    setVaccinationError(null);
  };

  const handleAddVaccination = async () => {
    if (!vaccinationForm.name || !vaccinationForm.dateGiven || !selectedPet) return;
    setVaccinationError(null);
    try {
      const created = await insertVaccination(user.id, selectedPet.id, {
        name: vaccinationForm.name,
        dateGiven: vaccinationForm.dateGiven,
        nextDueDate: vaccinationForm.nextDueDate || undefined,
        vetName: vaccinationForm.vetName || undefined,
        notes: vaccinationForm.notes || undefined,
      });
      setVaccinations((prev) => [created, ...prev]);
      setVaccinationForm(emptyVaccinationForm);
      setIsAddingVaccination(false);
    } catch (err) {
      setVaccinationError(
        err instanceof Error ? err.message : "Failed to save vaccination. Please try again.",
      );
    }
  };

  const handleDeleteVaccination = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Vaccination",
      message: `Remove ${name} from the vaccination records?`,
      onConfirm: async () => {
        try {
          await deleteVaccinationRecord(id);
          setVaccinations((prev) => prev.filter((v) => v.id !== id));
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          setVaccinationError(
            err instanceof Error
              ? err.message
              : "Failed to delete record. Please try again.",
          );
        }
      },
    });
  };

  const inputClass =
    "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-0";
  const inputStyle = { borderColor: "var(--border)", color: "var(--fur-slate)" };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--fur-cream)", fontFamily: "'Nunito', sans-serif" }}
    >
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        upcomingBookingsCount={upcomingCount}
      />
      <div
        style={{
          marginLeft: isSidebarOpen ? "16rem" : "0",
          transition: "margin-left 300ms ease-in-out",
        }}
      >
        <TopNavbar
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-4 md:p-6 mt-16">
          <div className="max-w-5xl mx-auto space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1
                  className="text-2xl md:text-3xl font-900 mb-1"
                  style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}
                >
                  My Pets
                </h1>
                <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
                  Manage your pet profiles
                </p>
              </div>
              <button
                onClick={handleStartAdd}
                className="btn-primary flex items-center gap-2 px-5 py-2.5"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add New Pet
              </button>
            </div>

            {/* Global form error (pet add/edit/delete) */}
            {formError && (
              <ErrorBanner message={formError} onClose={() => setFormError(null)} />
            )}

            {/* Add / Edit Form */}
            {(isAddingPet || editingPet) && (
              <div
                className="rounded-2xl border p-6"
                style={{ background: "white", borderColor: "var(--border)" }}
              >
                <h2
                  className="font-900 text-lg mb-5"
                  style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}
                >
                  {editingPet ? "Edit Pet" : "Add New Pet"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-xs font-700 mb-1.5 uppercase tracking-wide"
                      style={{ color: "var(--fur-slate-mid)" }}
                    >
                      Pet Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="e.g., Max"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-700 mb-1.5 uppercase tracking-wide"
                      style={{ color: "var(--fur-slate-mid)" }}
                    >
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value as Pet["type"] })
                      }
                      className={inputClass}
                      style={inputStyle}
                    >
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="bird">Bird</option>
                      <option value="rabbit">Rabbit</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-xs font-700 mb-1.5 uppercase tracking-wide"
                      style={{ color: "var(--fur-slate-mid)" }}
                    >
                      Breed *
                    </label>
                    <input
                      type="text"
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="e.g., Golden Retriever"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-700 mb-1.5 uppercase tracking-wide"
                      style={{ color: "var(--fur-slate-mid)" }}
                    >
                      Age (years) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: parseInt(e.target.value) || 0 })
                      }
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-700 mb-1.5 uppercase tracking-wide"
                      style={{ color: "var(--fur-slate-mid)" }}
                    >
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value as Pet["gender"] })
                      }
                      className={inputClass}
                      style={inputStyle}
                    >
                      <option value="unknown">Unknown</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-xs font-700 mb-1.5 uppercase tracking-wide"
                      style={{ color: "var(--fur-slate-mid)" }}
                    >
                      Weight
                    </label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="e.g., 5 kg"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-700 mb-1.5 uppercase tracking-wide"
                      style={{ color: "var(--fur-slate-mid)" }}
                    >
                      Color / Coat
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="e.g., Golden, White"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label
                      className="block text-xs font-700 mb-1.5 uppercase tracking-wide"
                      style={{ color: "var(--fur-slate-mid)" }}
                    >
                      Medical Notes
                    </label>
                    <textarea
                      value={formData.medicalNotes}
                      onChange={(e) =>
                        setFormData({ ...formData, medicalNotes: e.target.value })
                      }
                      rows={3}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="Allergies, conditions, special care instructions..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-5">
                  <button onClick={handleCancelEdit} className="btn-secondary px-5 py-2">
                    Cancel
                  </button>
                  <button onClick={handleSavePet} className="btn-primary px-5 py-2">
                    {editingPet ? "Save Changes" : "Add Pet"}
                  </button>
                </div>
              </div>
            )}

            {/* Pet Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="rounded-2xl border-2 overflow-hidden transition-all"
                  style={{
                    background: "white",
                    borderColor: selectedPet?.id === pet.id ? "var(--fur-teal)" : "var(--border)",
                    boxShadow: selectedPet?.id === pet.id ? "0 0 0 3px var(--fur-teal-light)" : "none",
                  }}
                >
                  {/* Card Header */}
                  <div className="px-5 pt-5 pb-4 flex items-start gap-3">
                    <PetAvatar name={pet.name} />
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3
                        className="font-800 text-base truncate"
                        style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}
                      >
                        {pet.name}
                      </h3>
                      <p className="text-xs mt-0.5 capitalize truncate" style={{ color: "var(--fur-slate-light)" }}>
                        {pet.type} · {pet.breed}
                      </p>
                    </div>
                    {/* Icon actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(pet)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "var(--fur-teal)", background: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-teal-light)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                        title="Edit pet"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeletePet(pet.id, pet.name)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "var(--fur-rose)", background: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-rose-light)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                        title="Delete pet"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Info rows */}
                  <div
                    className="mx-5 mb-4 rounded-xl px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-3"
                    style={{ background: "var(--fur-cream)" }}
                  >
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: "var(--fur-slate-light)" }}>Age</p>
                      <p className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>
                        {pet.age} yr{pet.age !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: "var(--fur-slate-light)" }}>Gender</p>
                      <p className="text-sm font-700 capitalize" style={{ color: "var(--fur-slate)" }}>
                        {pet.gender && pet.gender !== "unknown" ? GENDER_LABELS[pet.gender] : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: "var(--fur-slate-light)" }}>Weight</p>
                      <p className="text-sm font-700" style={{ color: "var(--fur-slate)" }}>
                        {pet.weight || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: "var(--fur-slate-light)" }}>Color / Coat</p>
                      <p className="text-sm font-700 truncate" style={{ color: "var(--fur-slate)" }}>
                        {pet.color || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Footer button */}
                  <div className="px-5 pb-5">
                    <button
                      onClick={() => handleSelectPet(pet)}
                      className="w-full py-2 rounded-xl text-sm font-700 transition-colors"
                      style={{
                        background: selectedPet?.id === pet.id ? "var(--fur-teal)" : "var(--fur-teal-light)",
                        color: selectedPet?.id === pet.id ? "white" : "var(--fur-teal-dark)",
                      }}
                      onMouseEnter={e => {
                        if (selectedPet?.id !== pet.id) e.currentTarget.style.background = "var(--fur-teal)";
                        if (selectedPet?.id !== pet.id) e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={e => {
                        if (selectedPet?.id !== pet.id) e.currentTarget.style.background = "var(--fur-teal-light)";
                        if (selectedPet?.id !== pet.id) e.currentTarget.style.color = "var(--fur-teal-dark)";
                      }}
                    >
                      {selectedPet?.id === pet.id ? "Viewing Details" : "View Details"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state */}
            {pets.length === 0 && !isAddingPet && !editingPet && (
              <div
                className="rounded-2xl p-16 text-center border"
                style={{ background: "white", borderColor: "var(--border)" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-900"
                  style={{
                    background: "var(--fur-teal)",
                    color: "white",
                    fontFamily: "'Fraunces', serif",
                  }}
                >
                  ?
                </div>
                <h3
                  className="font-900 text-lg mb-2"
                  style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}
                >
                  No pets registered yet
                </h3>
                <p className="text-sm mb-6" style={{ color: "var(--fur-slate-light)" }}>
                  Add your first pet to start booking services
                </p>
                <button onClick={handleStartAdd} className="btn-primary px-6 py-2.5">
                  Add Your First Pet
                </button>
              </div>
            )}

            {/* Pet Detail Panel */}
            {selectedPet && !isAddingPet && !editingPet && (
              <div
                className="rounded-2xl border overflow-hidden"
                style={{ background: "white", borderColor: "var(--border)" }}
              >
                {/* Detail header */}
                <div
                  className="relative flex items-center gap-5 px-6 py-6"
                  style={{
                    background: "linear-gradient(135deg, var(--fur-teal) 0%, var(--fur-teal-dark) 100%)",
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-2xl font-900"
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontFamily: "'Fraunces', serif",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {selectedPet.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2
                      className="font-900 text-xl"
                      style={{ fontFamily: "'Fraunces', serif", color: "white" }}
                    >
                      {selectedPet.name}
                    </h2>
                    <p className="text-sm mt-0.5 capitalize" style={{ color: "rgba(255,255,255,0.75)" }}>
                      {selectedPet.type} · {selectedPet.breed}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-700 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
                        {selectedPet.age} yr{selectedPet.age !== 1 ? "s" : ""}
                      </span>
                      {selectedPet.gender && selectedPet.gender !== "unknown" && (
                        <span className="text-xs font-700 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
                          {GENDER_LABELS[selectedPet.gender]}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleStartEdit(selectedPet)}
                      className="px-3 py-2 rounded-xl text-xs font-700 transition-colors"
                      style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.3)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setSelectedPet(null)}
                      className="p-2 rounded-xl transition-colors"
                      style={{ color: "rgba(255,255,255,0.8)", background: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}
                      title="Close"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
                  {(["profile", "vaccinations"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="px-6 py-3 text-sm font-700 capitalize transition-colors border-b-2"
                      style={
                        activeTab === tab
                          ? { borderColor: "var(--fur-teal)", color: "var(--fur-teal)" }
                          : { borderColor: "transparent", color: "var(--fur-slate-light)" }
                      }
                    >
                      {tab === "vaccinations" ? "Vaccinations" : "Profile"}
                    </button>
                  ))}
                </div>

                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="p-6 space-y-4">
                    {/* Info grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { label: "Type", value: selectedPet.type, capitalize: true },
                        { label: "Breed", value: selectedPet.breed },
                        { label: "Age", value: `${selectedPet.age} year${selectedPet.age !== 1 ? "s" : ""}` },
                        { label: "Gender", value: selectedPet.gender ? GENDER_LABELS[selectedPet.gender] : "—" },
                        { label: "Weight", value: selectedPet.weight || "—" },
                        { label: "Color / Coat", value: selectedPet.color || "—" },
                      ].map(({ label, value, capitalize }) => (
                        <div
                          key={label}
                          className="rounded-xl p-4 border"
                          style={{ background: "white", borderColor: "var(--border)" }}
                        >
                          <p className="text-xs font-700 uppercase tracking-wide mb-1.5" style={{ color: "var(--fur-slate-light)" }}>
                            {label}
                          </p>
                          <p className={`text-sm font-700 ${capitalize ? "capitalize" : ""}`} style={{ color: "var(--fur-slate)" }}>
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                    {selectedPet.medicalNotes && (
                      <div
                        className="rounded-xl p-4 border flex gap-3"
                        style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FEF3C7" }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-700 uppercase tracking-wide mb-1" style={{ color: "#92400E" }}>
                            Medical Notes
                          </p>
                          <p className="text-sm" style={{ color: "var(--fur-slate)" }}>
                            {selectedPet.medicalNotes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Vaccinations Tab */}
                {activeTab === "vaccinations" && (
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
                        {vaccinations.length} vaccination record
                        {vaccinations.length !== 1 ? "s" : ""}
                      </p>
                      <button
                        onClick={() => {
                          setIsAddingVaccination(!isAddingVaccination);
                          setVaccinationError(null);
                          setVaccinationForm(emptyVaccinationForm);
                        }}
                        className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5"
                      >
                        {isAddingVaccination ? (
                          "Cancel"
                        ) : (
                          <>
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add Record
                          </>
                        )}
                      </button>
                    </div>

                    {/* Vaccination error banner */}
                    {vaccinationError && (
                      <ErrorBanner
                        message={vaccinationError}
                        onClose={() => setVaccinationError(null)}
                      />
                    )}

                    {isAddingVaccination && (
                      <div
                        className="rounded-xl p-5 border space-y-3"
                        style={{
                          background: "var(--fur-cream)",
                          borderColor: "var(--border)",
                        }}
                      >
                        <h4
                          className="font-700 text-sm"
                          style={{ color: "var(--fur-slate)" }}
                        >
                          New Vaccination Record
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label
                              className="block text-xs font-700 mb-1 uppercase tracking-wide"
                              style={{ color: "var(--fur-slate-mid)" }}
                            >
                              Vaccine Name *
                            </label>
                            <input
                              type="text"
                              value={vaccinationForm.name}
                              onChange={(e) =>
                                setVaccinationForm({
                                  ...vaccinationForm,
                                  name: e.target.value,
                                })
                              }
                              className={inputClass}
                              style={inputStyle}
                              placeholder="e.g., Rabies, DHPP"
                            />
                          </div>
                          <div>
                            <label
                              className="block text-xs font-700 mb-1 uppercase tracking-wide"
                              style={{ color: "var(--fur-slate-mid)" }}
                            >
                              Date Given *
                            </label>
                            <input
                              type="date"
                              value={vaccinationForm.dateGiven}
                              onChange={(e) =>
                                setVaccinationForm({
                                  ...vaccinationForm,
                                  dateGiven: e.target.value,
                                })
                              }
                              className={inputClass}
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label
                              className="block text-xs font-700 mb-1 uppercase tracking-wide"
                              style={{ color: "var(--fur-slate-mid)" }}
                            >
                              Next Due Date
                            </label>
                            <input
                              type="date"
                              value={vaccinationForm.nextDueDate}
                              onChange={(e) =>
                                setVaccinationForm({
                                  ...vaccinationForm,
                                  nextDueDate: e.target.value,
                                })
                              }
                              className={inputClass}
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label
                              className="block text-xs font-700 mb-1 uppercase tracking-wide"
                              style={{ color: "var(--fur-slate-mid)" }}
                            >
                              Veterinarian
                            </label>
                            <input
                              type="text"
                              value={vaccinationForm.vetName}
                              onChange={(e) =>
                                setVaccinationForm({
                                  ...vaccinationForm,
                                  vetName: e.target.value,
                                })
                              }
                              className={inputClass}
                              style={inputStyle}
                              placeholder="Vet name or clinic"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label
                              className="block text-xs font-700 mb-1 uppercase tracking-wide"
                              style={{ color: "var(--fur-slate-mid)" }}
                            >
                              Notes
                            </label>
                            <input
                              type="text"
                              value={vaccinationForm.notes}
                              onChange={(e) =>
                                setVaccinationForm({
                                  ...vaccinationForm,
                                  notes: e.target.value,
                                })
                              }
                              className={inputClass}
                              style={inputStyle}
                              placeholder="Any additional notes"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => {
                              setIsAddingVaccination(false);
                              setVaccinationForm(emptyVaccinationForm);
                              setVaccinationError(null);
                            }}
                            className="btn-secondary px-4 py-2 text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddVaccination}
                            disabled={!vaccinationForm.name || !vaccinationForm.dateGiven}
                            className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
                          >
                            Save Record
                          </button>
                        </div>
                      </div>
                    )}

                    {loadingVaccinations ? (
                      <p
                        className="text-sm text-center py-4"
                        style={{ color: "var(--fur-slate-light)" }}
                      >
                        Loading records...
                      </p>
                    ) : vaccinations.length === 0 ? (
                      <div className="text-center py-8">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                          style={{
                            background: "var(--fur-mist)",
                            color: "var(--fur-slate-light)",
                          }}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                          </svg>
                        </div>
                        <p
                          className="text-sm"
                          style={{ color: "var(--fur-slate-light)" }}
                        >
                          No vaccination records yet.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                        <div className="overflow-x-auto">
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr style={{ background: "var(--fur-cream)" }}>
                                {["Vaccine", "Date Given", "Next Due Date", "Veterinarian", "Notes", ""].map((h) => (
                                  <th key={h} style={{
                                    padding: "0.6rem 1rem",
                                    textAlign: "left",
                                    fontSize: "0.68rem",
                                    fontWeight: 800,
                                    letterSpacing: "0.06em",
                                    textTransform: "uppercase",
                                    color: "var(--fur-slate-mid)",
                                    whiteSpace: "nowrap",
                                    borderBottom: "1.5px solid var(--border)",
                                  }}>
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {vaccinations.map((v, idx) => {
                                const isDue = v.nextDueDate && new Date(v.nextDueDate) <= new Date();
                                const isLast = idx === vaccinations.length - 1;
                                return (
                                  <tr key={v.id}
                                    style={{ borderBottom: isLast ? "none" : "1px solid var(--border)", background: isDue ? "#FFF5F5" : "white" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = isDue ? "#FEE2E2" : "var(--fur-cream)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = isDue ? "#FFF5F5" : "white")}
                                  >
                                    {/* Vaccine name */}
                                    <td style={{ padding: "0.85rem 1rem", minWidth: "130px" }}>
                                      <p className="font-800 text-sm" style={{ color: "var(--fur-slate)" }}>{v.name}</p>
                                    </td>

                                    {/* Date given */}
                                    <td style={{ padding: "0.85rem 1rem", whiteSpace: "nowrap" }}>
                                      <p className="text-sm font-600" style={{ color: "var(--fur-slate)" }}>
                                        {new Date(v.dateGiven).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                                      </p>
                                    </td>

                                    {/* Next due */}
                                    <td style={{ padding: "0.85rem 1rem", whiteSpace: "nowrap" }}>
                                      {v.nextDueDate ? (
                                        <div className="flex items-center gap-2">
                                          <p className="text-sm font-600" style={{ color: isDue ? "var(--fur-rose)" : "var(--fur-slate)" }}>
                                            {new Date(v.nextDueDate).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                                          </p>
                                          {isDue && (
                                            <span className="text-xs font-700 px-2 py-0.5 rounded-full" style={{ background: "#FEE2E2", color: "#991B1B" }}>
                                              Overdue
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-sm" style={{ color: "var(--fur-slate-light)" }}>—</span>
                                      )}
                                    </td>

                                    {/* Vet */}
                                    <td style={{ padding: "0.85rem 1rem", minWidth: "120px" }}>
                                      <p className="text-sm font-600" style={{ color: "var(--fur-slate)" }}>
                                        {v.vetName || <span style={{ color: "var(--fur-slate-light)" }}>—</span>}
                                      </p>
                                    </td>

                                    {/* Notes */}
                                    <td style={{ padding: "0.85rem 1rem", minWidth: "140px" }}>
                                      <p className="text-xs" style={{ color: "var(--fur-slate-light)", maxWidth: "160px" }}>
                                        {v.notes || "—"}
                                      </p>
                                    </td>

                                    {/* Delete */}
                                    <td style={{ padding: "0.85rem 1rem" }}>
                                      <button
                                        onClick={() => handleDeleteVaccination(v.id, v.name)}
                                        className="p-1.5 rounded-lg transition-colors"
                                        style={{ color: "var(--fur-rose)", background: "none", border: "none", cursor: "pointer" }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "var(--fur-rose-light)")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                        title="Delete record"
                                      >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="3 6 5 6 21 6"/>
                                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmColor="red"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
      <SuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
      />
    </div>
  );
};

export default PetsPage;