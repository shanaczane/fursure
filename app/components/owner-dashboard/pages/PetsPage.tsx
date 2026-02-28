"use client";

import React, { useState } from "react";
import { useAppContext } from "@/app/contexts/AppContext";
import { type Pet } from "@/app/types";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import ConfirmDialog from "../components/ConfirmDialog";
import SuccessModal from "../components/SuccessModal";

const PetsPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [isAddingPet, setIsAddingPet] = useState(false);
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
  const { user, pets, bookings, addPet, updatePet, deletePet } =
    useAppContext();
  const [formData, setFormData] = useState({
    name: "",
    type: "dog" as Pet["type"],
    breed: "",
    age: 1,
  });

  const upcomingCount = bookings.filter(
    (b) =>
      (b.status === "pending" || b.status === "confirmed") &&
      new Date(b.date + "T00:00:00") >=
        new Date(new Date().setHours(0, 0, 0, 0)),
  ).length;

  const handleStartAdd = () => {
    setFormData({ name: "", type: "dog", breed: "", age: 1 });
    setIsAddingPet(true);
    setEditingPet(null);
  };
  const handleStartEdit = (pet: Pet) => {
    setFormData({
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
    });
    setEditingPet(pet);
    setIsAddingPet(false);
  };
  const handleCancelEdit = () => {
    setEditingPet(null);
    setIsAddingPet(false);
    setFormData({ name: "", type: "dog", breed: "", age: 1 });
  };

  const handleSavePet = () => {
    if (!formData.name || !formData.breed) {
      alert("Please fill in all required fields");
      return;
    }
    if (editingPet) {
      updatePet(editingPet.id, formData);
      setSuccessModal({
        isOpen: true,
        title: "Pet Updated",
        message: `${formData.name}'s profile has been updated successfully!`,
      });
    } else {
      addPet(formData);
      setSuccessModal({
        isOpen: true,
        title: "Pet Added",
        message: `${formData.name} has been added to your pets!`,
      });
    }
    handleCancelEdit();
  };

  const handleDeletePet = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Pet",
      message: `Are you sure you want to delete ${name}? This action cannot be undone.`,
      onConfirm: () => {
        deletePet(id);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        setSuccessModal({
          isOpen: true,
          title: "Pet Deleted",
          message: `${name} has been removed from your pets.`,
        });
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
      <div
        className={`transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "lg:ml-0"}`}
      >
        <TopNavbar
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-4 md:p-6 mt-16">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  My Pets
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  Manage your pet profiles
                </p>
              </div>
              <button
                onClick={handleStartAdd}
                className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>➕</span>
                <span>Add New Pet</span>
              </button>
            </div>

            {(isAddingPet || editingPet) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingPet ? "Edit Pet" : "Add New Pet"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pet Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Max"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as Pet["type"],
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="bird">Bird</option>
                      <option value="rabbit">Rabbit</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Breed *
                    </label>
                    <input
                      type="text"
                      value={formData.breed}
                      onChange={(e) =>
                        setFormData({ ...formData, breed: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Golden Retriever"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age (years) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          age: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-4xl mb-4 mx-auto">
                    {pet.type === "dog"
                      ? "🐕"
                      : pet.type === "cat"
                        ? "🐈"
                        : "🐾"}
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {pet.name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      <p className="capitalize">
                        {pet.type} • {pet.breed}
                      </p>
                      <p>
                        {pet.age} year{pet.age !== 1 ? "s" : ""} old
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStartEdit(pet)}
                        className="flex-1 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePet(pet.id, pet.name)}
                        className="flex-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pets.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🐾</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No pets registered yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Add your first pet to start booking services
                </p>
                <button
                  onClick={handleStartAdd}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add Your First Pet
                </button>
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
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }
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
