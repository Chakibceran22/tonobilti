"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  Settings,
  Heart,
  LogOut,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Shield,
  ChevronRight,
  ArrowLeft,
  Bell,
  UserCog,
  Globe,
  Clock,
  CheckCircle,
  Package,
  Truck,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/Footer";
import Link from "next/link";
import { CarData } from "@/types/carTypes";
import { userService } from "@/lib/userService";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

interface OrderInfo {
  id: string;
  carTitle: string;
  carImage: string;
  orderDate: string;
  expectedDelivery: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  trackingNumber: string;
  totalAmount: number;
  shippingAddress: string;
  sellerName: string;
  sellerPhone: string;
  estimatedDeliveryTime: string;
}

const UserProfilePage: React.FC = () => {
  const { loading: isLoading, user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { language, setLanguage, t, tArray, isRtl } = useLanguage(); // Default to French
  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const queryClient = useQueryClient()
  const {
    data: favoritesData,
    isLoading: favoritesLoading,
    error: favoritesError,
    refetch: refetchFavorites,
  } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => userService.getFavorites(user!.id),
    enabled: !!user?.id && !isLoading, // Only run when user.id exists
    staleTime: 5 * 60 * 1000,
  });
    const removeFavoriteMutation = useMutation({
    mutationFn: ({ userId, carId }: { userId: string; carId: string }) => 
      userService.removeFavorite(userId, carId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"]});
      queryClient.invalidateQueries({ queryKey: ["favoriteIds"]})
    }
  });

  // Extract car data from favorites response
  console.log("Raw favorites data:", favoritesData);
  const favorites = favoritesData?.map((fav) => fav.cars).filter(Boolean) || [];
  console.log("Processed favorites:", favorites);
  const mockOrders: OrderInfo[] = [
    {
      id: "ORD-2025-001",
      carTitle: "BMW X5 2020 - Luxury SUV",
      carImage: "/placeholder.svg?height=300&width=400",
      orderDate: "2025-01-15",
      expectedDelivery: "2025-01-20",
      status: "shipped",
      trackingNumber: "TRK123456789",
      totalAmount: 4500000,
      shippingAddress: "Alger, Algiers, Algeria",
      sellerName: "Ahmed Benali",
      sellerPhone: "+213 555 123 456",
      estimatedDeliveryTime: "2-3 days",
    },
    {
      id: "ORD-2025-002",
      carTitle: "Mercedes C-Class 2019",
      carImage: "/placeholder.svg?height=300&width=400",
      orderDate: "2025-01-10",
      expectedDelivery: "2025-01-18",
      status: "delivered",
      trackingNumber: "TRK987654321",
      totalAmount: 3200000,
      shippingAddress: "Oran, Algeria",
      sellerName: "Fatima Zohra",
      sellerPhone: "+213 555 987 654",
      estimatedDeliveryTime: "Delivered",
    },
  ];
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "confirmed":
        return "text-blue-600 bg-blue-100";
      case "processing":
        return "text-purple-600 bg-purple-100";
      case "shipped":
        return "text-orange-600 bg-orange-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const toggleLanguage = (): void => {
    if (language === "fr") {
      setLanguage("ar");
    } else {
      setLanguage("fr");
    }
  };

  useEffect(() => {
    const handleClickOutsideMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideMenu);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, []);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Auth state listener
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/");
      return;
    }
  }, [user, isLoading]);

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Car card component for favorites and recent views
  const CarCard: React.FC<{ car: CarData }> = ({ car }) => {
    const removeFavoriteFront = async (): Promise<void> => {
      try {
        if (!user?.id) {
          alert("User Not Found");
          return;
        }
        const response = await userService.removeFavorite(user.id, car.id);
        console.log(response);
        refetchFavorites();
      } catch (error) {
        console.log(error);
        return;
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-blue-100 flex flex-col group hover:-translate-y-1">
        <div className="relative">
          <img
            src={
              car.images[car.imageIndex] ||
              "/placeholder.svg?height=300&width=400"
            }
            alt={car.title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <button
            className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-colors"
            aria-label={`Remove ${car.title} from favorites`}
            onClick={() => removeFavoriteFront()}
          >
            <Heart className="h-5 w-5 fill-blue-500 text-blue-500" />
          </button>
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-800 transition-colors">
              {car.title}
            </h3>
            <p className="text-gray-600 text-sm flex items-center">
              <MapPin
                className={`h-3.5 w-3.5 ${
                  isRtl ? "ml-1" : "mr-1"
                } text-blue-500`}
              />
              {car.location}
            </p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="text-blue-800 font-bold">
              {car.price?.toLocaleString() || "0"} DA
            </div>
            <Link
              href={`/product?id=${car.id}`}
              className="px-3 py-1.5 bg-blue-800 text-white text-sm font-medium rounded-lg hover:bg-blue-900 transition-colors flex items-center group"
              aria-label={`View details for ${car.title}`}
              prefetch={true}
            >
              {t("profile_viewDetails")}
              <ChevronRight
                className={`${
                  isRtl ? "mr-1 rotate-180" : "ml-1"
                } h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform duration-300`}
              />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600 font-medium">
            {t("profile_loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-white overflow-y-auto ${
        isRtl ? "rtl" : "ltr"
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header dir="ltr" className="bg-white shadow-md w-full sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => window.history.back()}
              className="mr-4 p-2 rounded-full hover:bg-blue-50 transition-colors text-blue-600"
              aria-label={t("profile_goBack")}
            >
              <ArrowLeft className={`h-5 w-5  text-blue-800`} />
            </button>
            <h1
              className="text-xl sm:text-2xl font-bold text-blue-800 cursor-pointer"
              onClick={() => router.push("/")}
            >
              Tonobilti
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={toggleLanguage}
              className="p-2 text-gray-500 hover:text-blue-800 transition-colors duration-300 flex items-center"
            >
              <Globe className="h-5 w-5 mx-1" />
              <span className="text-xs font-medium">
                {language.toUpperCase()}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Profile Header Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-blue-100 animate-fadeIn">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32 sm:h-48 relative">
            <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=1200')] opacity-10 mix-blend-overlay"></div>
          </div>
          <div className="px-4 sm:px-6 pb-6 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-24 mb-6">
              <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-white shadow-md bg-white overflow-hidden">
                <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-700 text-4xl font-bold">
                  {user?.user_metadata.full_name
                    ? user?.user_metadata.full_name
                        .split(" ")
                        .slice(0, 2)
                        .map((full_name: string) => full_name[0])
                        .join("")
                        .toUpperCase()
                    : "U"}
                </div>
              </div>
              <div className="flex-1 sm:text-left sm:ml-6 mt-4 sm:mt-0">
                {/* Fixed username orientation */}
                <h2
                  className={`text-2xl sm:text-3xl font-bold text-gray-900 ${
                    isRtl ? "text-right" : "text-left"
                  }`}
                >
                  {user?.user_metadata.full_name}
                </h2>
                <p className="text-blue-800 flex items-center justify-center sm:justify-start mt-1">
                  <MapPin className={`h-4 w-4 ${isRtl ? "ml-1" : "mr-1"}`} />
                  Algeria, Algiers
                </p>
                <p className="text-gray-500 text-sm flex items-center justify-center sm:justify-start mt-1">
                  <Calendar className={`h-4 w-4 ${isRtl ? "ml-1" : "mr-1"}`} />
                  {t("profile_memberSince")}{" "}
                  {new Date().toLocaleDateString(isRtl ? "ar-DZ" : "fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                {/* <button className="flex items-center px-4 py-2 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors shadow-sm">
                  <Edit className={`h-4 w-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                  {t.editInformation}
                </button> */}
                <button
                  className="flex items-center px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                  onClick={handleSignOut}
                >
                  <LogOut className={`h-4 w-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                  {isMobile ? "" : t("profile_signOut")}
                </button>
              </div>
            </div>
            {/* Profile Tabs */}
            <div className="border-b border-blue-100">
              <nav className="flex space-x-6 overflow-x-auto">
                <button
                  className={`py-4 px-1 font-medium text-sm border-b-2 ${
                    activeTab === "personal"
                      ? "border-blue-800 text-blue-800"
                      : "border-transparent text-gray-500 hover:text-blue-800 hover:border-blue-300"
                  } transition-colors whitespace-nowrap`}
                  onClick={() => setActiveTab("personal")}
                >
                  <User
                    className={`inline-block h-4 w-4 ${
                      isRtl ? "ml-2" : "mr-2"
                    }`}
                  />
                  {t("profile_personalInfo")}
                </button>
                <button
                  className={`py-4 px-1 font-medium text-sm border-b-2 ${
                    activeTab === "favorites"
                      ? "border-blue-800 text-blue-800"
                      : "border-transparent text-gray-500 hover:text-blue-800 hover:border-blue-300"
                  } transition-colors whitespace-nowrap`}
                  onClick={() => setActiveTab("favorites")}
                >
                  <Heart
                    className={`inline-block h-4 w-4 ${
                      isRtl ? "ml-2" : "mr-2"
                    }`}
                  />
                  {t("profile_favorites")}
                </button>
                <button
                  className={`py-4 px-1 font-medium text-sm border-b-2 ${
                    activeTab === "orders"
                      ? "border-blue-800 text-blue-800"
                      : "border-transparent text-gray-500 hover:text-blue-800 hover:border-blue-300"
                  } transition-colors whitespace-nowrap`}
                  onClick={() => setActiveTab("orders")}
                >
                  <Package
                    className={`inline-block h-4 w-4 ${
                      isRtl ? "ml-2" : "mr-2"
                    }`}
                  />
                  Orders
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100 animate-fadeInUp">
          {activeTab === "personal" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {t("profile_personalInfo")}
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {t("profile_verifiedAccount")}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      {t("profile_fullName")}
                    </p>
                    <p className="flex items-center text-gray-900 font-medium">
                      <User
                        className={`h-4 w-4 ${
                          isRtl ? "ml-2" : "mr-2"
                        } text-blue-500`}
                      />
                      {user?.user_metadata.full_name}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      {t("profile_emailAddress")}
                    </p>
                    <p className="flex items-center text-gray-900 font-medium">
                      <Mail
                        className={`h-4 w-4 ${
                          isRtl ? "ml-2" : "mr-2"
                        } text-blue-500`}
                      />
                      {user?.email}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      {t("profile_phoneNumber")}
                    </p>
                    <p className="flex items-center text-gray-900 font-medium">
                      <Phone
                        className={`h-4 w-4 ${
                          isRtl ? "ml-2" : "mr-2"
                        } text-blue-500`}
                      />
                      {user?.user_metadata.phone || "0679"}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      {t("profile_location")}
                    </p>
                    <p className="flex items-center text-gray-900 font-medium">
                      <MapPin
                        className={`h-4 w-4 ${
                          isRtl ? "ml-2" : "mr-2"
                        } text-blue-500`}
                      />
                      Alger
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      {t("profile_memberSince")}
                    </p>
                    <p className="flex items-center text-gray-900 font-medium">
                      <Calendar
                        className={`h-4 w-4 ${
                          isRtl ? "ml-2" : "mr-2"
                        } text-blue-500`}
                      />
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString(
                            isRtl ? "ar-DZ" : "fr-FR",
                            {
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "N/A"}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      {t("profile_accountStatus")}
                    </p>
                    <p className="flex items-center text-gray-900 font-medium">
                      <Shield
                        className={`h-4 w-4 ${
                          isRtl ? "ml-2" : "mr-2"
                        } text-green-500`}
                      />
                      {t("profile_verified")}
                    </p>
                  </div>
                </div>
              </div>

              {/* <div className="mt-8 flex flex-wrap gap-4">
                <button className="px-4 py-2 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors shadow-sm flex items-center">
                  <Edit className={`h-4 w-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                  {t.editInformation}
                </button>
                <button className="px-4 py-2 bg-white border border-blue-200 text-blue-800 font-medium rounded-lg hover:bg-blue-50 transition-colors shadow-sm flex items-center">
                  <Lock className={`h-4 w-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                  {t.changePassword}
                </button>
              </div> */}
            </div>
          )}

          {activeTab === "favorites" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {t("profile_favoriteVehicles")}
                  </h3>
                  <p className="text-blue-800 text-sm mt-1">
                    {t("profile_savedPremiumVehicles")}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  {favorites.length} {t("profile_vehicles")}
                </span>
              </div>

              {favoritesLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-blue-600 font-medium">
                    Loading favorites...
                  </p>
                </div>
              ) : favoritesError ? (
                <div className="text-center py-16 bg-red-50 rounded-xl border border-red-100">
                  <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-red-500 border border-red-200">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    Error loading favorites
                  </h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    There was an error loading your favorite vehicles.
                  </p>
                  <button
                    className="px-6 py-3 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors shadow-md flex items-center mx-auto group"
                    onClick={() => refetchFavorites()}
                  >
                    Try Again
                  </button>
                </div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-blue-500 border border-blue-200">
                    <Heart className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {t("profile_noFavoriteVehicles")}
                  </h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {t("profile_startBrowsing")}
                  </p>
                  <button
                    className="px-6 py-3 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors shadow-md flex items-center mx-auto group"
                    onClick={() => router.push("/user")}
                  >
                    {t("profile_browseVehicles")}
                    <ChevronRight
                      className={`${
                        isRtl
                          ? "mr-2 group-hover:-translate-x-1"
                          : "ml-2 group-hover:translate-x-1"
                      } h-5 w-5 transition-transform`}
                    />
                  </button>
                </div>
              )}
            </div>
          )}
          {activeTab === "orders" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">My Orders</h3>
                  <p className="text-blue-800 text-sm mt-1">
                    Track your vehicle purchases
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  {orders.length} Orders
                </span>
              </div>

              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-blue-100 group hover:-translate-y-1"
                    >
                      <div className="p-6">
                        {/* Order Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">
                              {order.carTitle}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Order #{order.id}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            <span
                              className={`${
                                isRtl ? "mr-1" : "ml-1"
                              } capitalize`}
                            >
                              {order.status}
                            </span>
                          </span>
                        </div>

                        {/* Car Image and Details */}
                        <div className="flex gap-4 mb-4">
                          <img
                            src={order.carImage}
                            alt={order.carTitle}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar
                                className={`h-4 w-4 ${
                                  isRtl ? "ml-2" : "mr-2"
                                } text-blue-500`}
                              />
                              Ordered:{" "}
                              {new Date(order.orderDate).toLocaleDateString(
                                isRtl ? "ar-DZ" : "fr-FR"
                              )}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin
                                className={`h-4 w-4 ${
                                  isRtl ? "ml-2" : "mr-2"
                                } text-blue-500`}
                              />
                              {order.shippingAddress}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Truck
                                className={`h-4 w-4 ${
                                  isRtl ? "ml-2" : "mr-2"
                                } text-blue-500`}
                              />
                              Tracking: {order.trackingNumber}
                            </div>
                          </div>
                        </div>

                        {/* Seller Info */}
                        <div className="bg-blue-50 rounded-lg p-3 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <User
                                className={`h-4 w-4 ${
                                  isRtl ? "ml-2" : "mr-2"
                                } text-blue-600`}
                              />
                              <span className="text-sm font-medium text-blue-800">
                                {order.sellerName}
                              </span>
                            </div>
                            <a
                              href={`tel:${order.sellerPhone}`}
                              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                            >
                              <Phone
                                className={`h-4 w-4 ${isRtl ? "ml-1" : "mr-1"}`}
                              />
                              Contact
                            </a>
                          </div>
                        </div>

                        {/* Order Footer */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-800 font-bold text-lg">
                              {order.totalAmount.toLocaleString()} DA
                            </p>
                            <p className="text-xs text-gray-500">
                              Expected: {order.estimatedDeliveryTime}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              router.push(`/orders?id=${order.id}`)
                            }
                            className="px-4 py-2 bg-blue-800 text-white text-sm font-medium rounded-lg hover:bg-blue-900 transition-colors flex items-center group"
                          >
                            Track Order
                            <ChevronRight
                              className={`${
                                isRtl ? "mr-1 rotate-180" : "ml-1"
                              } h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform duration-300`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-blue-500 border border-blue-200">
                    <Package className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    No orders yet
                  </h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    You haven't placed any orders yet. Start browsing our
                    premium vehicles!
                  </p>
                  <button
                    className="px-6 py-3 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors shadow-md flex items-center mx-auto group"
                    onClick={() => router.push("/user")}
                  >
                    Browse Vehicles
                    <ChevronRight
                      className={`${
                        isRtl
                          ? "mr-2 group-hover:-translate-x-1"
                          : "ml-2 group-hover:translate-x-1"
                      } h-5 w-5 transition-transform`}
                    />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer t={t} isRtl={isRtl} />
    </div>
  );
};

export default UserProfilePage;
