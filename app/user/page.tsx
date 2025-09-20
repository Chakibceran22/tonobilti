"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  Filter,
  Car,
  ChevronRight,
  ArrowRight,
  X,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import Footer from "@/components/Footer";
import { useLanguage } from "../../hooks/useLanguage";
import Header from "@/components/Header";
import { CarData } from "@/types/carTypes";
import { useQuery } from "@tanstack/react-query";
import { carService } from "@/lib/carService";
import { TranslationFn } from "@/providers/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface FilterState {
  maker: string;
  year: string;
  fuel: string;
  bodyType: string;
}

interface CarCardProps {
  car: CarData;
  t: TranslationFn;
  isRtl: boolean;
}

const CarListingPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Get current page from URL, default to 1
  const currentPage = Number(searchParams.get("page")) || 1;
  const [carsPerPage] = useState<number>(12);

  const [filteredCars, setFilteredCars] = useState<CarData[]>([]);
  const [filter, setFilter] = useState<FilterState>({
    maker: "All Makes",
    year: "All Years",
    fuel: "All Types",
    bodyType: "All Body Types",
  });

  // Get selected fuel filter for backend filtering
  const selectedFuelFilter = filter.fuel !== "All Types" ? filter.fuel : undefined;

  // Fetch paginated cars using server-side pagination with fuel filtering
  const {
    data: paginatedData,
    isLoading: loading,
    error,
    isError,
    refetch,
  } = useQuery<CarData[]>({
    queryKey: ["cars", "paginated", currentPage, carsPerPage, selectedFuelFilter],
    queryFn: async () => {
      const data = await carService.getPaginatedFilteredCars(currentPage, carsPerPage, selectedFuelFilter);
      if (!data) {
        throw new Error("Failed to fetch cars");
      }
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch all cars for filtering options only
  const { data: allCars } = useQuery<CarData[]>({
    queryKey: ["cars", "all"],
    queryFn: carService.getAllCars,
    staleTime: 1000 * 60 * 60,
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch total count for current fuel filter for proper pagination
  const { data: totalCarsCount } = useQuery<number>({
    queryKey: ["cars", "count", selectedFuelFilter],
    queryFn: () => carService.getFilteredCarsCount(selectedFuelFilter),
    staleTime: 1000 * 60 * 5,
    retry: 3,
    retryDelay: 1000,
  });
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<
    "all" | "electric" | "bus"
  >("all");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortType, setSortType] = useState<string>("");

  const { t, isRtl } = useLanguage();

  // Calculate display cars based on filters and search
  // Fuel filtering is handled by backend, so only check for other active filters
  const hasActiveClientFilters = 
    filter.maker !== "All Makes" ||
    filter.year !== "All Years" ||
    filter.bodyType !== "All Body Types";
    
  const displayCars =
    filteredCars.length > 0 ||
    searchQuery ||
    selectedQuickFilter !== "all" ||
    sortType ||
    hasActiveClientFilters
      ? filteredCars
      : paginatedData || [];

  // Use the filtered count for pagination when fuel filter is active, otherwise use all cars count
  const totalCars = totalCarsCount ?? (allCars?.length || 0);
  const totalPages = Math.ceil(totalCars / carsPerPage);

  // Update filtered cars when paginated data changes
  useEffect(() => {
    if (
      paginatedData &&
      !searchQuery &&
      selectedQuickFilter === "all" &&
      !sortType &&
      !hasActiveClientFilters
    ) {
      setFilteredCars(paginatedData);
    }
  }, [paginatedData, searchQuery, selectedQuickFilter, sortType, hasActiveClientFilters]);

  // Handle page change by updating URL
  const handlePageChange = (pageNumber: number): void => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set("page", pageNumber.toString());
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  // Reset to page 1 when filters change (fuel filter triggers backend refetch)
  useEffect(() => {
    if (
      searchQuery ||
      selectedQuickFilter !== "all" ||
      hasActiveClientFilters ||
      filter.fuel !== "All Types" // Reset page when fuel filter changes (backend)
    ) {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [
    searchQuery,
    selectedQuickFilter,
    filter,
    hasActiveClientFilters,
    searchParams,
    pathname,
    router,
  ]);

  const handleSort = (sortType: string): void => {
    if (!displayCars) return;
    setSortType(sortType);

    if (sortType === t("user_priceLowToHigh")) {
      const sorted = [...displayCars].sort((a, b) => a.price - b.price);
      setFilteredCars(sorted);
    } else if (sortType === t("user_priceHighToLow")) {
      const sorted = [...displayCars].sort((a, b) => b.price - a.price);
      setFilteredCars(sorted);
    }
  };

  // Close filter when clicking outside
  useEffect(() => {
    if (!filterOpen) return;

    const handleClickOutside = (event: MouseEvent): void => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterOpen]);

  const handleSearch = (query: string): void => {
    if (!allCars) return;
    setSearchQuery(query);

    const filtered = allCars.filter((car) =>
      car?.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCars(filtered);
  };

  const handleFilter = (): void => {
    // Fuel filtering is now handled by backend, only apply other filters client-side
    if (!paginatedData) return;

    const filtered = paginatedData.filter((car) => {
      const makerMatch =
        filter.maker === "All Makes"
          ? true
          : car?.maker?.trim().toLowerCase() ===
            filter.maker.trim().toLowerCase();

      const yearMatch =
        filter.year === "All Years"
          ? true
          : car?.year.toString() === filter.year;

      const bodyTypeMatch =
        filter.bodyType === "All Body Types"
          ? true
          : car?.bodyType?.trim().toLowerCase() ===
            filter.bodyType.trim().toLowerCase();

      return makerMatch && yearMatch && bodyTypeMatch;
    });

    setFilteredCars(filtered);
    setFilterOpen(false);
  };

  const toggleFilter = (e?: React.MouseEvent): void => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFilterOpen((prevState) => !prevState);
  };

  // Car card component
  const CarCard: React.FC<CarCardProps> = ({ car, t, isRtl }) => {
    return (
      <Link
        key={car.id}
        href={`/product?id=${car.id}`}
        className="block bg-white rounded-md shadow-md overflow-hidden border border-blue-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-pointer"
      >
        <div className="relative h-48 overflow-hidden">
          <Image
            width={350}
            height={350}
            src={car.images[car.imageIndex] || "/placeholder.svg"}
            alt={car.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-1">{car.title}</h3>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center text-xs text-gray-600">
              <Calendar className="h-3 w-3 mr-1 text-blue-800" />
              <span>{car.year}</span>
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <Gauge className="h-3 w-3 mr-1 text-blue-800" />
              <span>{car.mileage.toLocaleString()} km</span>
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <Fuel className="h-3 w-3 mr-1 text-blue-800" />
              <span>{car.fuel}</span>
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <Settings className="h-3 w-3 mr-1 text-blue-800" />
              <span>{car.transmission}</span>
            </div>
          </div>

          <div className="w-full py-2 bg-blue-50 text-blue-800 font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center">
            {t("home_viewDetails")}
            <ChevronRight
              className={`ml-1 h-4 w-4 transition-transform duration-300 ${
                isRtl
                  ? "rotate-180 group-hover:-translate-x-1"
                  : "group-hover:translate-x-1"
              }`}
            />
          </div>
        </div>
      </Link>
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    handleSearch(e.target.value);
  };

  const handleFilterChange =
    (field: keyof FilterState) =>
    (e: React.ChangeEvent<HTMLSelectElement>): void => {
      setFilter({ ...filter, [field]: e.target.value });
    };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    handleSort(e.target.value);
  };

  const resetFilters = (): void => {
    setFilteredCars([]);
    setSearchQuery("");
    setSortType("");
    setSelectedQuickFilter("all");
    setFilter({
      maker: "All Makes",
      year: "All Years",
      fuel: "All Types",
      bodyType: "All Body Types",
    });
  };

  const handleQuickFilter = (filterType: "all" | "electric" | "bus"): void => {
    if (!allCars) return;

    setSelectedQuickFilter(filterType);
    setFilterOpen(false);

    switch (filterType) {
      case "all":
        setFilteredCars([]);
        break;
      case "electric":
        const electricCars = allCars.filter(
          (car) =>
            car?.fuel?.trim().toLowerCase().includes("electric") ||
            car?.fuel?.trim().toLowerCase().includes("électrique")
        );
        setFilteredCars(electricCars);
        break;
      case "bus":
        const buses = allCars.filter(
          (car) =>
            car?.bodyType?.trim().toLowerCase().includes("bus") ||
            car?.title?.toLowerCase().includes("bus")
        );
        setFilteredCars(buses);
        break;
      default:
        setFilteredCars([]);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 mx-1 rounded-lg text-sm font-medium transition-colors ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-blue-800 border border-blue-200 hover:bg-blue-50"
        }`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    );

    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 mx-1 rounded-lg text-sm font-medium bg-white text-blue-800 border border-blue-200 hover:bg-blue-50"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2 py-2 text-gray-400">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 mx-1 rounded-lg text-sm font-medium transition-colors ${
            currentPage === i
              ? "bg-blue-800 text-white shadow-md"
              : "bg-white text-blue-800 border border-blue-200 hover:bg-blue-50"
          }`}
          aria-label={`Page ${i}`}
          aria-current={currentPage === i ? "page" : undefined}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-2 py-2 text-gray-400">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 mx-1 rounded-lg text-sm font-medium bg-white text-blue-800 border border-blue-200 hover:bg-blue-50"
        >
          {totalPages}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 mx-1 rounded-lg text-sm font-medium transition-colors ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-blue-800 border border-blue-200 hover:bg-blue-50"
        }`}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    );

    return buttons;
  };

  return (
    <div
      className={`min-h-screen bg-white overflow-x-hidden overflow-y-auto ${
        isRtl ? "rtl" : "ltr"
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative">
        {/* Page Title and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 sm:mb-10">
          <div className="mb-6 md:mb-0 animate-fadeInUp">
           
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {t("user_discoverPerfectVehicle")}
            </h2>
            <p className="text-blue-800 max-w-lg">
              {t("user_browseExclusiveSelection")}
            </p>
          </div>
          <div className="relative animate-fadeInRight">
            <div className="flex w-full md:w-80">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder={
                    isError
                      ? t("user_searchDisabled") || "Search disabled"
                      : t("user_searchCars")
                  }
                  className={`w-full rounded-lg border py-2 focus:outline-none shadow-sm ${
                    isError
                      ? "border-gray-300 bg-gray-100 cursor-not-allowed text-gray-400"
                      : "border-blue-800 focus:border-blue-800 focus:ring-1 focus:ring-blue-800 bg-white"
                  } ${isRtl ? "pr-10 pl-4" : "pl-10 pr-4"}`}
                  aria-label="Search for cars"
                  onChange={isError ? undefined : handleInputChange}
                  disabled={isError}
                />
                <Search
                  className={`absolute ${
                    isRtl ? "right-3" : "left-3"
                  } top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    isError ? "text-gray-400" : "text-blue-800"
                  }`}
                  aria-hidden="true"
                />
              </div>
              <button
                ref={filterButtonRef}
                className={`mx-2 px-3 py-2 text-white rounded-lg transition-colors shadow-sm ${
                  isError
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-800 hover:bg-blue-900"
                }`}
                onClick={isError ? undefined : toggleFilter}
                disabled={isError}
                aria-expanded={filterOpen}
                aria-controls="filter-panel"
                aria-label="Toggle filters"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div
          ref={filterRef}
          id="filter-panel"
          className={`bg-white rounded-xl shadow-md p-6 mb-8 transition-all duration-300 border border-blue-100 ${
            filterOpen
              ? "max-h-[1000px] opacity-100 overflow-visible"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Filter
                className="h-5 w-5 text-blue-800 mx-2"
                aria-hidden="true"
              />
              <h3 className="text-lg font-bold text-gray-900">
                {t("user_refineSearch")}
              </h3>
            </div>
            <button
              className="text-blue-800 hover:text-blue-900 text-sm font-medium flex items-center"
              aria-label="Reset all filters"
              onClick={resetFilters}
            >
              {t("user_resetAll")}
              <X className="ml-1 h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-gray-700 flex items-center"
                htmlFor="make"
              >
                <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mx-2">
                  <Car className="h-4 w-4" />
                </span>
                {t("user_make")}
              </label>
              <select
                id="make"
                className="rounded-lg border border-blue-200 px-3 py-2 w-full focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50"
                aria-label="Car make"
                value={filter.maker}
                onChange={handleFilterChange("maker")}
              >
                <option>All Makes</option>
                {[...new Set((allCars || []).map((car) => car.maker))]
                  .sort()
                  .map((maker) => (
                    <option key={maker} value={maker}>
                      {maker}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-gray-700 flex items-center"
                htmlFor="year"
              >
                <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mx-2">
                  <Calendar className="h-4 w-4" />
                </span>
                {t("user_year")}
              </label>
              <select
                id="year"
                className="rounded-lg border border-blue-200 px-3 py-2 w-full focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50"
                aria-label="Car year"
                value={filter.year}
                onChange={handleFilterChange("year")}
              >
                <option>All Years</option>
                {[...new Set((allCars || []).map((car) => car.year))]
                  .sort((a, b) => b - a)
                  .map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-gray-700 flex items-center"
                htmlFor="bodyType"
              >
                <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mx-2">
                  <Car className="h-4 w-4" />
                </span>
                Body Type
              </label>
              <select
                id="bodyType"
                className="rounded-lg border border-blue-200 px-3 py-2 w-full focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50"
                aria-label="Body type"
                value={filter.bodyType}
                onChange={handleFilterChange("bodyType")}
              >
                <option>All Body Types</option>
                {[
                  ...new Set(
                    (allCars || []).map((car) => car.bodyType).filter(Boolean)
                  ),
                ]
                  .sort()
                  .map((bodyType) => (
                    <option key={bodyType} value={bodyType}>
                      {bodyType}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <button
              className="px-6 py-3 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-all duration-300 shadow-md hover:shadow-lg flex items-center group"
              aria-label="Apply filters"
              onClick={handleFilter}
            >
              {t("user_applyFilters")}
              <ArrowRight
                className={`${
                  isRtl
                    ? "mr-2 group-hover:-translate-x-1 rotate-180"
                    : "ml-2 group-hover:translate-x-1"
                } h-5 w-5 transform transition-transform duration-300`}
              />
            </button>
          </div>
        </div>

        {/* Quick Filter Toggle Buttons */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 text-blue-800 mr-2" />
              {t("user_quickFilters")}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={isError ? undefined : () => handleQuickFilter("all")}
              disabled={isError}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium rounded-lg transition-all duration-300 flex items-center justify-center shadow-sm border min-w-[120px] sm:min-w-[140px] ${
                isError
                  ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                  : selectedQuickFilter === "all"
                  ? "bg-blue-800 text-white border-blue-800 shadow-lg transform scale-105"
                  : "bg-white text-gray-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800"
              }`}
            >
              <Car
                className={`h-4 w-4 sm:h-5 sm:w-5 ${isRtl ? "ml-2" : "mr-2"}`}
              />
              <span className="whitespace-nowrap">{t("user_allCars")}</span>
            </button>
            <button
              onClick={
                isError ? undefined : () => handleQuickFilter("electric")
              }
              disabled={isError}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium rounded-lg transition-all duration-300 flex items-center justify-center shadow-sm border min-w-[120px] sm:min-w-[140px] ${
                isError
                  ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                  : selectedQuickFilter === "electric"
                  ? "bg-blue-800 text-white border-blue-800 shadow-lg transform scale-105"
                  : "bg-white text-gray-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800"
              }`}
            >
              <Fuel
                className={`h-4 w-4 sm:h-5 sm:w-5 ${isRtl ? "ml-2" : "mr-2"}`}
              />
              <span className="whitespace-nowrap">{t("user_electric")}</span>
            </button>
            <button
              onClick={isError ? undefined : () => handleQuickFilter("bus")}
              disabled={isError}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium rounded-lg transition-all duration-300 flex items-center justify-center shadow-sm border min-w-[120px] sm:min-w-[140px] ${
                isError
                  ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                  : selectedQuickFilter === "bus"
                  ? "bg-blue-800 text-white border-blue-800 shadow-lg transform scale-105"
                  : "bg-white text-gray-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800"
              }`}
            >
              <Car
                className={`h-4 w-4 sm:h-5 sm:w-5 ${isRtl ? "ml-2" : "mr-2"}`}
              />
              <span className="whitespace-nowrap">{t("user_bus")}</span>
            </button>
          </div>
        </div>

        {/* Results Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-blue-100">
          <div className="flex items-center mb-4 sm:mb-0">
            <Filter className="h-5 w-5 text-blue-800 mr-2" aria-hidden="true" />
            <span className="text-gray-700">
              {loading ? (
                t("user_loadingCars")
              ) : isError ? (
                <span className="text-red-600">
                  {t("user_errorLoadingData") || "Error loading data"}
                </span>
              ) : (
                <>
                  {t("user_showing")}{" "}
                  <span className="font-medium text-blue-800">
                    {displayCars.length}
                  </span>{" "}
                  {t("user_results")}
                </>
              )}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mx-2">
                {t("user_sortBy")}
              </span>
              <div className="relative">
                <select
                  className={`appearance-none rounded-lg border pr-8 pl-3 py-2 focus:outline-none ${
                    isError
                      ? "border-gray-300 bg-gray-100 cursor-not-allowed text-gray-400"
                      : "border-blue-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                  aria-label="Sort results by"
                  onChange={isError ? undefined : handleSortChange}
                  disabled={isError}
                >
                  <option>{t("user_priceLowToHigh")}</option>
                  <option>{t("user_priceHighToLow")}</option>
                </select>
                <ChevronDown
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none ${
                    isError ? "text-gray-400" : "text-blue-500"
                  }`}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Car Grid/List */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-md border border-blue-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
            <p className="mt-4 text-lg font-medium text-blue-800">
              {t("user_loadingPremiumVehicles")}
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-md border border-red-100">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
              <X className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t("user_errorLoadingCars") || "Failed to Load Vehicles"}
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              {error?.message ||
                t("user_errorLoadingMessage") ||
                "We encountered an issue while loading the vehicles. Please check your connection and try again."}
            </p>
            <div className="flex gap-4">
              <button
                className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors flex items-center shadow-md"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-5 w-5 mr-2 rotate-[-90deg]" />
                {t("user_tryAgain") || "Try Again"}
              </button>
              <button
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => window.location.reload()}
              >
                {t("user_refreshPage") || "Refresh Page"}
              </button>
            </div>
          </div>
        ) : displayCars.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-md border border-blue-100">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mb-4">
              <Car className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t("user_noVehiclesFound")}
            </h3>
            <p className="text-gray-600 mb-6">{t("user_tryAdjusting")}</p>
            <button
              className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
              onClick={resetFilters}
            >
              {t("user_resetFilters")}
            </button>
          </div>
        ) : (
          <>
            {/* Car Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayCars.map((car) => (
                <CarCard key={car?.id} car={car} t={t} isRtl={isRtl} />
              ))}
            </div>

            {/* Pagination - Only show when not filtering/searching (fuel filter is backend-handled) */}
            {!searchQuery &&
              selectedQuickFilter === "all" &&
              !sortType &&
              !hasActiveClientFilters &&
              totalPages > 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Pagination Info */}
                    <div className="text-sm text-gray-600">
                      {t("user_showing")}{" "}
                      <span className="font-medium text-blue-800">
                        {(currentPage - 1) * carsPerPage + 1}
                      </span>{" "}
                      -{" "}
                      <span className="font-medium text-blue-800">
                        {Math.min(currentPage * carsPerPage, totalCars)}
                      </span>{" "}
                      {t("user_of")}{" "}
                      <span className="font-medium text-blue-800">
                        {totalCars}
                      </span>{" "}
                      {t("user_results")}
                    </div>

                    {/* Pagination Buttons */}
                    <div className="flex items-center justify-center">
                      <nav
                        className="flex items-center space-x-1"
                        aria-label="Pagination"
                      >
                        {renderPaginationButtons()}
                      </nav>
                    </div>

                    {/* Page Jump */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">
                        {t("user_goToPage") || "Go to page"}
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => {
                          const page = parseInt(e.target.value);
                          if (page >= 1 && page <= totalPages) {
                            handlePageChange(page);
                          }
                        }}
                        className="w-16 px-2 py-1 border border-blue-200 rounded text-center focus:outline-none focus:border-blue-500"
                        aria-label="Jump to page"
                      />
                      <span className="text-gray-600">of {totalPages}</span>
                    </div>
                  </div>
                </div>
              )}
          </>
        )}
      </main>

      <Footer t={t} isRtl={isRtl} />
    </div>
  );
};

export default CarListingPage;
