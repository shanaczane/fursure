"use client";

import { useState, useMemo, useCallback } from "react";
import {
  type Service,
  type Booking,
  type Pet,
  type ServiceFilters,
  type User,
} from "@/app/types";
import {
  filterServices,
  sortServices,
  getUpcomingBookings,
  getPastBookings,
} from "@/app/utils/dashboardUtils";

interface UseDashboardProps {
  services: Service[];
  bookings: Booking[];
  pets: Pet[];
  user: User;
}

export const useDashboard = ({
  services,
  bookings,
  pets,
  user,
}: UseDashboardProps) => {
  const [filters, setFilters] = useState<ServiceFilters>({
    category: "all",
    priceRange: { min: 0, max: 500 },
    minRating: 0,
    maxDistance: 100,
    searchQuery: "",
    sortBy: "rating",
  });

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const filteredServices = useMemo(() => {
    const filtered = filterServices(services, filters);
    return sortServices(filtered, filters.sortBy);
  }, [services, filters]);

  const upcomingBookings = useMemo(
    () => getUpcomingBookings(bookings),
    [bookings],
  );
  const pastBookings = useMemo(() => getPastBookings(bookings), [bookings]);

  const dashboardStats = useMemo(
    () => ({
      upcomingBookings: upcomingBookings.length,
      completedBookings: bookings.filter((b) => b.status === "completed")
        .length,
      totalPets: pets.length,
      totalServices: services.length,
    }),
    [upcomingBookings, bookings, pets, services],
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<ServiceFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    [],
  );

  const handleResetFilters = useCallback(() => {
    setFilters({
      category: "all",
      priceRange: { min: 0, max: 500 },
      minRating: 0,
      maxDistance: 100,
      searchQuery: "",
      sortBy: "rating",
    });
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const handleServiceClick = useCallback((service: Service) => {
    setSelectedService(service);
    setIsServiceModalOpen(true);
  }, []);

  const handleCloseServiceModal = useCallback(() => {
    setIsServiceModalOpen(false);
    setTimeout(() => setSelectedService(null), 300);
  }, []);

  return {
    user,
    services: filteredServices,
    allServices: services,
    bookings,
    upcomingBookings,
    pastBookings,
    pets,
    dashboardStats,
    filters,
    handleFilterChange,
    handleResetFilters,
    handleSearchChange,
    selectedService,
    isServiceModalOpen,
    handleServiceClick,
    handleCloseServiceModal,
  };
};

export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  return { isOpen, open, close, toggle };
};
