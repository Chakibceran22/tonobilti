"use client";

import { useEffect, useState } from "react";
import {
  Car,
  Calendar,
  Fuel,
  Gauge,
  Settings,
  Search,
  Filter,
  ChevronDown,
  Copy,
  Check,
  Menu,
  X,
  Home,
  User as UserIcon,
  LayoutDashboard,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { CarData } from "@/types/carTypes";
import { carService } from "@/lib/carService";
import { TranslationFn } from "@/providers/LanguageContext";
import axios from "axios";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
interface AgentCarCardProps {
  car: CarData;
  t: TranslationFn;
  isRtl: boolean;
  onGetLink: (carId: string) => void;
}

const CarCard: React.FC<AgentCarCardProps> = ({ car, onGetLink, isRtl, t }) => {
  const [copied, setCopied] = useState(false);

  const handleGetLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCopied(true);
    onGetLink(car.id);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col bg-white rounded-md shadow-md overflow-hidden border border-blue-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-pointer h-full">
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        <Image
          width={350}
          height={350}
          src={car.images[car.imageIndex]}
          alt={car.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3rem]">{car.title}</h3>

        <div className="grid grid-cols-2 gap-2 mb-4 flex-grow">
          <div className="flex items-center text-xs text-gray-600">
            <Calendar className="h-3 w-3 mr-1 text-blue-800 flex-shrink-0" />
            <span>{car.year}</span>
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <Gauge className="h-3 w-3 mr-1 text-blue-800 flex-shrink-0" />
            <span>{car.mileage.toLocaleString()} km</span>
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <Fuel className="h-3 w-3 mr-1 text-blue-800 flex-shrink-0" />
            <span>{car.fuel}</span>
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <Settings className="h-3 w-3 mr-1 text-blue-800 flex-shrink-0" />
            <span className="truncate">{car.transmission}</span>
          </div>
        </div>

        <button
          onClick={handleGetLink}
          className={`w-full py-2 font-medium rounded-lg transition-all duration-300 flex items-center justify-center mt-auto ${
            copied
              ? "bg-blue-800 text-white"
              : "bg-blue-50 text-blue-800 hover:bg-blue-100"
          }`}
        >
          {copied ? (
            <>
              <Check className={`h-4 w-4 ${isRtl ? "ml-1" : "mr-1"}`} />
              Link Copied!
            </>
          ) : (
            <>
              <Copy className={`h-4 w-4 ${isRtl ? "ml-1" : "mr-1"}`} />
              Get Selling Link
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Loading skeleton for car cards
const CarCardSkeleton = () => {
  return (
    <div className="flex flex-col bg-white rounded-md shadow-md overflow-hidden border border-blue-100 h-full">
      <div className="relative h-48 overflow-hidden flex-shrink-0 bg-gray-200 animate-pulse"></div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="h-6 bg-gray-200 rounded mb-3 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-2 mb-4 flex-grow">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
};

const SalesAgentPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const { user, loading} = useAuth();
  const { data: cars = [], isLoading, error, refetch } = useQuery<CarData[]>({
    queryKey: ["cars"],
    queryFn: () => carService.getAllCars(),
    staleTime: 30 * 60 * 1000,
  });
  const router = useRouter()
  

  useEffect(() => {
    if(loading) return;
    if(!user) {
        router.push('/login')
    }
  },[user,router, loading])
  const generateToken = async(userId: string | undefined, userEmail: string | undefined): Promise<string> => {
    if(!userId || !userEmail) {
      throw new Error("User ID or email is missing");
    }
    const res = await axios.post('/api/token', {
      userId,
      username: userEmail
    });
    return res.data.token;
  }

  const handleGetSellingLink = async (carId: string) => {
  try {
    if (typeof window === "undefined" || !navigator?.clipboard) {
      console.error("Clipboard API not available");
      return;
    }

    const agentToken = await generateToken(user?.id, user?.email);

    const saleLink = `tonobilti-/product?id=${carId}&token=${agentToken}`;

    await navigator.clipboard.writeText(saleLink);

    console.log("Copied to clipboard:", saleLink);
  } catch (err) {
    console.error("Error generating or copying link:", err);
  }
};

  const filteredCars = cars;

  return (
    <div
      className={`min-h-screen bg-gray-50 ${isRtl ? "rtl" : "ltr"}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header />

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sales Agent Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your car inventory and generate selling links
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Cars</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? (
                      <span className="inline-block w-16 h-8 bg-gray-200 rounded animate-pulse"></span>
                    ) : (
                      cars.length
                    )}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Car className="h-6 w-6 text-blue-800" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? (
                      <span className="inline-block w-24 h-8 bg-gray-200 rounded animate-pulse"></span>
                    ) : (
                      `${(cars.reduce((sum, car) => sum + car.price, 0) / 1000000).toFixed(1)}M DZD`
                    )}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <LayoutDashboard className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Links Generated</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Copy className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <button className="px-6 py-3 bg-white border border-blue-200 text-blue-800 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center">
              <Filter className={`h-5 w-5 ${isRtl ? "ml-2" : "mr-2"}`} />
              Filters
              <ChevronDown className={`h-4 w-4 ${isRtl ? "mr-2" : "ml-2"}`} />
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <CarCardSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-md border border-red-100">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Failed to Load Cars
              </h3>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                {error instanceof Error ? error.message : "An error occurred while loading the cars. Please try again."}
              </p>
              <div className="flex gap-4">
                <button
                  className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors flex items-center shadow-md"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Try Again
                </button>
               
              </div>
            </div>
          )}

          {/* Cars Grid */}
          {!isLoading && !error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCars.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    onGetLink={handleGetSellingLink}
                    isRtl={isRtl}
                    t={t}
                  />
                ))}
              </div>

              {filteredCars.length === 0 && (
                <div className="text-center py-12">
                  <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No cars found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <Footer t={t} isRtl={isRtl} />
    </div>
  );
};

export default SalesAgentPage;