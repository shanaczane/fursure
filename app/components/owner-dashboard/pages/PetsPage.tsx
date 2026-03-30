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

const PET_EMOJI: Record<Pet["type"], string> = {
  dog: "🐕",
  cat: "🐈",
  bird: "🦜",
  rabbit: "🐇",
  other: "🐾",
};

const GENDER_LABELS: Record<string, string> = {
  male: "♂ Male",
  female: "♀ Female",
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

const PetsPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loadingVaccinations, setLoadingVaccinations] = useState(false);
  const [isAddingVaccination, setIsAddingVaccination] = useState(false);
  const [vaccinationForm, setVaccinationForm] = useState(emptyVaccinationForm);
  const [activeTab, setActiveTab] = useState<"profile" | "vaccinations">("profile");
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false, title: "", message: "", onConfirm: () => {},
  });
  const [successModal, setSuccessModal] = useState({
    isOpen: false, title: "", message: "",
  });

  const { user, pets, bookings, addPet, updatePet, deletePet } = useAppContext();
  const [formData, setFormData] = useState(emptyForm);

  const upcomingCount = bookings.filter(
    (b) =>
      (b.status === "pending" || b.status === "confirmed") &&
      new Date(b.date + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0)),
  ).length;

  // Load vaccinations when a pet is selected
  useEffect(() => {
    if (!selectedPet) return;
    setLoadingVaccinations(true);
    fetchPetVaccinations(selectedPet.id)
      .then(setVaccinations)
      .catch(() => setVaccinations([]))
      .finally(() => setLoadingVaccinations(false));
  }, [selectedPet]);

  const handleStartAdd = () => {
    setFormData(emptyForm);
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
    setEditingPet(pet);
    setIsAddingPet(false);
    setSelectedPet(null);
  };

  const handleCancelEdit = () => {
    setEditingPet(null);
    setIsAddingPet(false);
    setFormData(emptyForm);
  };

  const handleSavePet = async () => {
    if (!formData.name || !formData.breed) {
      alert("Please fill in all required fields");
      return;
    }
    try {
      if (editingPet) {
        await updatePet(editingPet.id, formData);
        setSuccessModal({ isOpen: true, title: "Pet Updated", message: `${formData.name}'s profile has been updated successfully!` });
      } else {
        await addPet(formData);
        setSuccessModal({ isOpen: true, title: "Pet Added", message: `${formData.name} has been added to your pets!` });
      }
      handleCancelEdit();
    } catch {
      alert("Failed to save pet. Please try again.");
    }
  };

  const handleDeletePet = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Pet",
      message: `Are you sure you want to delete ${name}? This action cannot be undone.`,
      onConfirm: async () => {
        await deletePet(id);
        if (selectedPet?.id === id) setSelectedPet(null);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        setSuccessModal({ isOpen: true, title: "Pet Deleted", message: `${name} has been removed from your pets.` });
      },
    });
  };

  const handleSelectPet = (pet: Pet) => {
    setSelectedPet(pet);
    setActiveTab("profile");
    setIsAddingPet(false);
    setEditingPet(null);
  };

  const handleAddVaccination = async () => {
    if (!vaccinationForm.name || !vaccinationForm.dateGiven || !selectedPet) return;
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
    } catch {
      alert("Failed to save vaccination. Please try again.");
    }
  };

  const handleDeleteVaccination = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Vaccination",
      message: `Remove ${name} from the vaccination records?`,
      onConfirm: async () => {
        await deleteVaccinationRecord(id);
        setVaccinations((prev) => prev.filter((v) => v.id !== id));
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        upcomingBookingsCount={upcomingCount}
      />
      <div style={{ marginLeft: isSidebarOpen ? "16rem" : "0", transition: "margin-left 300ms ease-in-out" }}>
        <TopNavbar
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-4 md:p-6 mt-16">
          <div className="max-w-7xl mx-auto space-y-4">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">My Pets</h1>
                <p className="text-gray-600 text-sm md:text-base">Manage your pet profiles</p>
              </div>
              <button
                onClick={handleStartAdd}
                className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>➕</span>
                <span>Add New Pet</span>
              </button>
            </div>

            {/* Add / Edit Form */}
            {(isAddingPet || editingPet) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingPet ? "Edit Pet" : "Add New Pet"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pet Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Max"
                    />
                  </div>
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as Pet["type"] })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="bird">Bird</option>
                      <option value="rabbit">Rabbit</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {/* Breed */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Breed *</label>
                    <input
                      type="text"
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Golden Retriever"
                    />
                  </div>
                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age (years) *</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as Pet["gender"] })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="unknown">Unknown</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 5 kg"
                    />
                  </div>
                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color / Coat</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Golden, White"
                    />
                  </div>
                  {/* Medical Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical Notes</label>
                    <textarea
                      value={formData.medicalNotes}
                      onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Allergies, conditions, special care instructions..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePet}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {editingPet ? "Save Changes" : "Add Pet"}
                  </button>
                </div>
              </div>
            )}

            {/* Pet Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  onClick={() => handleSelectPet(pet)}
                  className={`bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-all cursor-pointer border-2 ${
                    selectedPet?.id === pet.id ? "border-blue-500" : "border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-3xl shrink-0">
                      {PET_EMOJI[pet.type]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{pet.name}</h3>
                      <p className="text-sm text-gray-500 capitalize truncate">{pet.type} · {pet.breed}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                      {pet.age} yr{pet.age !== 1 ? "s" : ""}
                    </span>
                    {pet.gender && pet.gender !== "unknown" && (
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium">
                        {GENDER_LABELS[pet.gender]}
                      </span>
                    )}
                    {pet.weight && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                        {pet.weight}
                      </span>
                    )}
                    {pet.color && (
                      <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full font-medium">
                        {pet.color}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleSelectPet(pet)}
                      className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleStartEdit(pet)}
                      className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePet(pet.id, pet.name)}
                      className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state */}
            {pets.length === 0 && !isAddingPet && !editingPet && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🐾</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No pets registered yet</h3>
                <p className="text-gray-500 mb-6">Add your first pet to start booking services</p>
                <button
                  onClick={handleStartAdd}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add Your First Pet
                </button>
              </div>
            )}

            {/* Pet Detail Panel */}
            {selectedPet && !isAddingPet && !editingPet && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Detail header */}
                <div className="flex items-center gap-4 p-6 border-b border-gray-100">
                  <div className="w-16 h-16 bg-linear-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-4xl">
                    {PET_EMOJI[selectedPet.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPet.name}</h2>
                    <p className="text-gray-500 capitalize">{selectedPet.type} · {selectedPet.breed}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPet(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                  {(["profile", "vaccinations"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                        activeTab === tab
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab === "vaccinations" ? "💉 Vaccinations" : "📋 Profile"}
                    </button>
                  ))}
                </div>

                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: "Type", value: selectedPet.type },
                      { label: "Breed", value: selectedPet.breed },
                      { label: "Age", value: `${selectedPet.age} year${selectedPet.age !== 1 ? "s" : ""}` },
                      { label: "Gender", value: selectedPet.gender ? GENDER_LABELS[selectedPet.gender] : "—" },
                      { label: "Weight", value: selectedPet.weight || "—" },
                      { label: "Color / Coat", value: selectedPet.color || "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
                        <p className="text-sm font-semibold text-gray-800 capitalize">{value}</p>
                      </div>
                    ))}
                    {selectedPet.medicalNotes && (
                      <div className="col-span-2 md:col-span-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-xs text-amber-700 font-medium mb-1">⚕️ Medical Notes</p>
                        <p className="text-sm text-gray-800">{selectedPet.medicalNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Vaccinations Tab */}
                {activeTab === "vaccinations" && (
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {vaccinations.length} vaccination record{vaccinations.length !== 1 ? "s" : ""}
                      </p>
                      <button
                        onClick={() => setIsAddingVaccination(!isAddingVaccination)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {isAddingVaccination ? "Cancel" : "＋ Add Record"}
                      </button>
                    </div>

                    {/* Add vaccination form */}
                    {isAddingVaccination && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <h4 className="font-semibold text-gray-800 text-sm">New Vaccination Record</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Vaccine Name *</label>
                            <input
                              type="text"
                              value={vaccinationForm.name}
                              onChange={(e) => setVaccinationForm({ ...vaccinationForm, name: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., Rabies, DHPP"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Date Given *</label>
                            <input
                              type="date"
                              value={vaccinationForm.dateGiven}
                              onChange={(e) => setVaccinationForm({ ...vaccinationForm, dateGiven: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Next Due Date</label>
                            <input
                              type="date"
                              value={vaccinationForm.nextDueDate}
                              onChange={(e) => setVaccinationForm({ ...vaccinationForm, nextDueDate: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Veterinarian</label>
                            <input
                              type="text"
                              value={vaccinationForm.vetName}
                              onChange={(e) => setVaccinationForm({ ...vaccinationForm, vetName: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Vet name or clinic"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                            <input
                              type="text"
                              value={vaccinationForm.notes}
                              onChange={(e) => setVaccinationForm({ ...vaccinationForm, notes: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Any additional notes"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => { setIsAddingVaccination(false); setVaccinationForm(emptyVaccinationForm); }}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddVaccination}
                            disabled={!vaccinationForm.name || !vaccinationForm.dateGiven}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            Save Record
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Vaccination list */}
                    {loadingVaccinations ? (
                      <p className="text-sm text-gray-400 text-center py-4">Loading records...</p>
                    ) : vaccinations.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">💉</div>
                        <p className="text-gray-500 text-sm">No vaccination records yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {vaccinations.map((v) => {
                          const isDue = v.nextDueDate && new Date(v.nextDueDate) <= new Date();
                          return (
                            <div
                              key={v.id}
                              className={`flex items-start justify-between p-4 rounded-lg border ${
                                isDue ? "border-red-200 bg-red-50" : "border-gray-100 bg-gray-50"
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-800 text-sm">{v.name}</p>
                                  {isDue && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                      Due
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">
                                  Given: {new Date(v.dateGiven).toLocaleDateString()}
                                  {v.nextDueDate && ` · Next due: ${new Date(v.nextDueDate).toLocaleDateString()}`}
                                </p>
                                {v.vetName && <p className="text-xs text-gray-500">🏥 {v.vetName}</p>}
                                {v.notes && <p className="text-xs text-gray-400 italic">{v.notes}</p>}
                              </div>
                              <button
                                onClick={() => handleDeleteVaccination(v.id, v.name)}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors shrink-0"
                              >
                                🗑
                              </button>
                            </div>
                          );
                        })}
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