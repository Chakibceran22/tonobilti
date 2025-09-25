// src/app/product/[id]/CarDetailClientComponent.tsx (Client Component)
"use client";

import {  useState } from "react";
import {
  Car,
  Calendar,
  Fuel,
  Gauge,
  Settings,
  ChevronLeft,
  ChevronRight,
  Share2,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  Cog,
  Zap,
  Globe,
  Check,
} from "lucide-react";
import { carService } from "@/lib/carService";
import { useLanguage } from "@/hooks/useLanguage";
import Footer from "@/components/Footer";
import { CarData } from "@/types/carTypes";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface CarDetailClientComponentProps {
  id: string;
  token: string | null;
}

const CarDetailClientComponent: React.FC<CarDetailClientComponentProps> = ({
  id,
  token
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("specs");
  const [showShareTooltipState, setShowShareTooltipState] =
    useState<boolean>(false);
  const { language, setLanguage, t, isRtl } = useLanguage();
  const { data: car , isLoading} = useQuery<CarData>({
    queryKey:['cars', id],
    queryFn:() => carService.getCarById(id),
    staleTime: 5 * 1000 * 60
  })
  if( car == undefined){
    return
  }

 

 

  // Function to handle sharing the current page URL
  const handleShare = (): void => {
    const currentUrl = window.location.href;
    console.log("Id:", id, "Token:", token);

    // Check if the Web Share API is available (better for mobile)
    if (navigator.share && /mobile|android|ios/i.test(navigator.userAgent)) {
      navigator
        .share({
          title: car?.title || "Car Details",
          url: currentUrl,
        })
        .catch((error) => {
          console.error("Error sharing:", error);
          // Fallback to clipboard if sharing fails
          copyToClipboard(currentUrl);
        });
    } else {
      // Use clipboard API for desktop or if Web Share API is not available
      copyToClipboard(currentUrl);
    }
  };

  // Helper function to copy to clipboard and show tooltip
  const copyToClipboard = (text: string): void => {
    // Try to use the Clipboard API
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setShowShareTooltipState(true);
          // Set a timeout to hide the tooltip after 2 seconds
          setTimeout(() => {
            setShowShareTooltipState(false);
          }, 2000);
        })
        .catch(() => fallbackCopyToClipboard(text));
    } else {
      // Fallback for browsers that don't support Clipboard API
      fallbackCopyToClipboard(text);
    }
  };

  // Fallback copy method using textarea
  const fallbackCopyToClipboard = (text: string): void => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "0";
      textArea.style.top = "0";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      // Show tooltip and set timeout to hide it
      setShowShareTooltipState(true);
      setTimeout(() => {
        setShowShareTooltipState(false);
      }, 2000);
    } catch (err) {
      console.error("Fallback: Could not copy text: ", err);
    }
  };

  const nextImage = (): void => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === car.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = (): void => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? car.images.length - 1 : prevIndex - 1
    );
  };

  const toggleLanguage = (): void => {
    if (language === "fr") {
      setLanguage("ar");
    } else {
      setLanguage("fr");
    }
  };

  // isLoading skeleton UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white overflow-y-auto">
        {/* Header skeleton */}
        <div className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex items-center">
            <div className="mr-4 p-2 rounded-full bg-blue-100 animate-pulse">
              <div className="h-5 w-5"></div>
            </div>
            <div className="h-6 w-48 bg-blue-100 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
            <div className="flex flex-col lg:flex-row">
              {/* LEFT SIDE - Image skeleton */}
              <div className="lg:w-3/5 p-4">
                <div className="h-64 sm:h-80 md:h-96 lg:h-[500px] bg-blue-100 rounded-lg animate-pulse"></div>
                <div className="flex mt-4 space-x-2 overflow-x-auto">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div
                      key={index}
                      className="w-20 h-20 bg-blue-100 rounded-md animate-pulse flex-shrink-0"
                    ></div>
                  ))}
                </div>
              </div>

              {/* RIGHT SIDE - Content skeleton */}
              <div className="lg:w-2/5 p-6 border-l border-blue-100">
                <div className="h-8 w-3/4 bg-blue-100 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-1/2 bg-blue-100 rounded animate-pulse mb-4"></div>
                <div className="h-10 w-1/3 bg-blue-100 rounded animate-pulse mb-6"></div>

                {/* Specs skeleton */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 mb-6 py-4 border-t border-b border-blue-100">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div key={index} className="flex items-center">
                      <div className="h-5 w-5 bg-blue-100 rounded-full mr-2 animate-pulse"></div>
                      <div>
                        <div className="h-3 w-16 bg-blue-100 rounded animate-pulse mb-1"></div>
                        <div className="h-4 w-20 bg-blue-100 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Buttons skeleton */}
                <div className="flex space-x-4 mb-8">
                  <div className="flex-1 h-12 bg-blue-100 rounded-lg animate-pulse"></div>
                  <div className="flex-1 h-12 bg-blue-100 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Return actual content when data is loaded
  if (!car)
    return (
      <div
        className={`min-h-screen bg-white flex items-center justify-center ${
          isRtl ? "rtl" : "ltr"
        }`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md mx-auto border border-blue-100">
          <Car className="h-16 w-16 text-blue-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("product_vehicleNotFound")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("product_vehicleNoLongerAvailable")}
          </p>
          <Link
            href={"/user"}
            className="px-6 py-3 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors"
          >
            {t("product_browseOtherVehicles")}
          </Link>
        </div>
      </div>
    );

  return (
    <div
      className={`min-h-screen bg-white overflow-y-auto ${
        isRtl ? "rtl" : "ltr"
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header bar */}
      <header className="bg-white shadow-md w-full sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href={"/user"}
              className="mr-3 sm:mr-4 p-2 rounded-full hover:bg-blue-50 transition-colors text-blue-800"
            >
              <ArrowLeft className={`h-5 w-5 ${isRtl ? "rotate-180" : ""}`} />
            </Link>

            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-800 cursor-pointer">
              Tonobilti
            </h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full ml-2 hidden sm:inline-block">
              {t("product_collection")}
            </span>
          </div>

          <button
            onClick={toggleLanguage}
            className="p-2 text-gray-500 hover:text-blue-800 transition-colors duration-300 flex items-center"
          >
            <Globe className="h-5 w-5 mr-1" />
            <span className="text-xs font-medium">
              {language.toUpperCase()}
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-4 sm:mb-6 flex items-center text-sm text-blue-800 overflow-x-auto whitespace-nowrap py-1">
          <Link href="/" className="hover:underline">
            {t("product_breadcrumbHome")}
          </Link>
          <ChevronRight
            className={`h-4 w-4 mx-2 flex-shrink-0 ${
              isRtl ? "rotate-180" : ""
            }`}
          />
          <Link href="/user" className="hover:underline">
            {t("product_breadcrumbVehicles")}
          </Link>
          <ChevronRight
            className={`h-4 w-4 mx-2 flex-shrink-0 ${
              isRtl ? "rotate-180" : ""
            }`}
          />
          <span className="text-gray-600 truncate">{car.title}</span>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100 mb-8 animate-fadeIn">
          {/* Main product section */}
          <div className="flex flex-col lg:flex-row">
            {/* LEFT SIDE - Image Gallery */}
            <div
              className={`w-full lg:w-3/5 p-3 sm:p-4 ${
                isRtl ? "lg:order-2" : ""
              }`}
            >
              {/* Main product image */}
              <div className="relative group">
                <div className="h-64 sm:h-80 md:h-96 lg:h-[500px] bg-blue-50 border border-blue-100 rounded-lg overflow-hidden">
                  <Image
                  width={1200}
                  height={1200}
                    src={car.images[currentImageIndex] || "/placeholder.svg"}
                    alt={`${car.title} - View ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Image navigation arrows - always visible on mobile, hover on desktop */}
                  <div className="absolute inset-0 flex items-center justify-between px-4 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={prevImage}
                      className="bg-white/90 rounded-full p-2 sm:p-3 shadow-md hover:bg-blue-50 transition-colors text-blue-800"
                      aria-label="Previous image"
                    >
                      <ChevronLeft
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          isRtl ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={nextImage}
                      className="bg-white/90 rounded-full p-2 sm:p-3 shadow-md hover:bg-blue-50 transition-colors text-blue-800"
                      aria-label="Next image"
                    >
                      <ChevronRight
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          isRtl ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Image counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {currentImageIndex + 1} / {car.images.length}
                  </div>
                </div>
              </div>

              {/* Thumbnail gallery - scrollable on mobile */}
              <div className="flex mt-3 sm:mt-4 space-x-2 overflow-x-auto pb-2 px-1">
                {car.images.map((image, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 sm:w-20 sm:h-20 border-2 rounded-md flex-shrink-0 cursor-pointer transition-all ${
                      index === currentImageIndex
                        ? "border-blue-800 shadow-md"
                        : "border-blue-100 hover:border-blue-300"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      width={1200}
                      height={1200}
                      src={image || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover rounded-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE - All Product Info */}
            <div
              className={`w-full lg:w-2/5 p-4 sm:p-6 border-t lg:border-t-0 lg:border-l border-blue-100 mt-3 lg:mt-0 ${
                isRtl ? "lg:order-1" : ""
              }`}
            >
              {/* Product title and price section */}
              <div className="mb-5 sm:mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mb-2">
                      {car.maker || t("product_premiumVehicle")}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      {car.title}
                    </h2>
                    {/* Location removed */}
                  </div>
                  <div className="relative">
                    <div className="relative">
                      <button
                        className="p-2 rounded-full hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-800"
                        onClick={handleShare}
                        aria-label={t("product_shareVehicle")}
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                      {/* Share tooltip - positioned based on RTL */}
                      {showShareTooltipState && (
                        <div
                          className={`absolute ${
                            isRtl ? "left-0" : "right-0"
                          } top-full mt-2 px-3 py-2 bg-blue-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10 flex items-center`}
                          style={{ minWidth: "100px", textAlign: "center" }}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          {t("product_linkCopied")}
                          <div
                            className={`absolute -top-1 ${
                              isRtl ? "left-3" : "right-3"
                            } w-2 h-2 bg-blue-800 transform rotate-45`}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-blue-800 font-bold text-2xl sm:text-3xl mb-1">
                    {car.price?.toLocaleString() || "0"} DA
                  </div>
                  <p className="text-sm text-gray-600">
                    {t("product_includesTaxesLicense")}
                  </p>
                </div>
              </div>

              {/* Main specs highlight - adjust to 2 columns on all screens */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-4 sm:gap-x-6 mb-5 sm:mb-6 py-4 border-t border-b border-blue-100">
                <div className="flex items-center">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-2 sm:mr-3 flex-shrink-0">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {t("product_year")}
                    </p>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                      {car.year}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-2 sm:mr-3 flex-shrink-0">
                    <Gauge className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {t("product_mileage")}
                    </p>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                      {car.mileage?.toLocaleString() || "0"} Km
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-2 sm:mr-3 flex-shrink-0">
                    <Fuel className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {t("product_fuelType")}
                    </p>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                      {car.fuel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-2 sm:mr-3 flex-shrink-0">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {t("product_transmission")}
                    </p>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                      {car.transmission}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons - stack on very small screens */}
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 mb-6 sm:mb-8">
                <Link
                  href={`/checkout?id=${car.id}&token=${token}`}
                  className="flex-1 flex justify-center items-center bg-blue-800 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-900 transition-colors shadow-sm"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {t("product_proceedToCheckout")}
                </Link>

                <Link
                  href={" https://wa.me/message/TGUCWCSB54XKM1"}
                  className="flex-1 flex justify-center items-center border border-blue-800 text-blue-800 font-medium py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  {t("product_messageSeller")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for additional information */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden mb-8 animate-fadeInUp">
          <div className="border-b border-blue-100">
            <div className="flex overflow-x-auto scrollbar-hide">
              
              <button
                className={`py-3 sm:py-4 px-4 sm:px-6 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === "specs"
                    ? "border-b-2 border-blue-800 text-blue-800"
                    : "text-gray-500 hover:text-blue-800 hover:border-blue-300"
                }`}
                onClick={() => setActiveTab("specs")}
              >
                <Cog className="inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t("product_specifications")}
              </button>
              <button
                className={`py-3 sm:py-4 px-4 sm:px-6 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === "features"
                    ? "border-b-2 border-blue-800 text-blue-800"
                    : "text-gray-500 hover:text-blue-800 hover:border-blue-300"
                }`}
                onClick={() => setActiveTab("features")}
              >
                <Zap className="inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t("product_features")}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "features" && (
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {t("product_keyFeatures")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {(
                    car.features || [
                      "Premium Sound System",
                      "Leather Interior",
                      "Navigation System",
                      "Bluetooth Connectivity",
                      "Heated Seats",
                      "Sunroof/Moonroof",
                      "Backup Camera",
                      "Keyless Entry",
                      "Adaptive Cruise Control",
                      "Lane Departure Warning",
                      "Automatic Emergency Braking",
                      "Premium Wheels",
                    ]
                  ).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-white border border-blue-100 rounded-lg p-2 sm:p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-2 sm:mr-3 flex-shrink-0">
                        <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <p className="text-gray-800 text-sm sm:text-base">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "specs" && (
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {t("product_technicalSpecifications")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  {/* Engine & Performance */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                      <Car className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-800" />
                      {t("product_enginePerformance")}
                    </h4>
                    <ul className="space-y-2 sm:space-y-3">
                      <li className="flex justify-between py-1.5 sm:py-2 border-b border-blue-50">
                        <span className="text-gray-600 text-sm sm:text-base">
                          {t("product_engine")}
                        </span>
                        <span className="font-medium text-gray-900 text-sm sm:text-base">
                          {car.engine || "N/A"}
                        </span>
                      </li>
                      <li className="flex justify-between py-1.5 sm:py-2 border-b border-blue-50">
                        <span className="text-gray-600 text-sm sm:text-base">
                          {t("product_horsepower")}
                        </span>
                        <span className="font-medium text-gray-900 text-sm sm:text-base">
                          {car.horsepower || "N/A"}
                        </span>
                      </li>
                      <li className="flex justify-between py-1.5 sm:py-2 border-b border-blue-50">
                        <span className="text-gray-600 text-sm sm:text-base">
                          {t("product_acceleration")}
                        </span>
                        <span className="font-medium text-gray-900 text-sm sm:text-base">
                          {car.acceleration || "N/A"} sec
                        </span>
                      </li>
                      <li className="flex justify-between py-1.5 sm:py-2">
                        <span className="text-gray-600 text-sm sm:text-base">
                          {t("product_topSpeed")}
                        </span>
                        <span className="font-medium text-gray-900 text-sm sm:text-base">
                          {car.topSpeed || "N/A"} km/h
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Design & Dimensions */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                      <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-800" />
                      {t("product_designDimensions")}
                    </h4>
                    <ul className="space-y-2 sm:space-y-3">
                      <li className="flex justify-between py-1.5 sm:py-2 border-b border-blue-50">
                        <span className="text-gray-600 text-sm sm:text-base">
                          {t("product_bodyType")}
                        </span>
                        <span className="font-medium text-gray-900 text-sm sm:text-base">
                          {car.bodyType || "SUV"}
                        </span>
                      </li>
                      <li className="flex justify-between py-1.5 sm:py-2 border-b border-blue-50">
                        <span className="text-gray-600 text-sm sm:text-base">
                          {t("product_exteriorColor")}
                        </span>
                        <span className="font-medium text-gray-900 text-sm sm:text-base">
                          {car.color || "N/A"}
                        </span>
                      </li>
                      <li className="flex justify-between py-1.5 sm:py-2 border-b border-blue-50">
                        <span className="text-gray-600 text-sm sm:text-base">
                          {t("product_interiorColor")}
                        </span>
                        <span className="font-medium text-gray-900 text-sm sm:text-base">
                          {car.interiorColor || "N/A"}
                        </span>
                      </li>
                      <li className="flex justify-between py-1.5 sm:py-2 border-b border-blue-50">
                        <span className="text-gray-600 text-sm sm:text-base">
                          {t("product_seatingCapacity")}
                        </span>
                        <span className="font-medium text-gray-900 text-sm sm:text-base">
                          {car.seats || "5"} {t("product_passengers")}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer t={t} isRtl={isRtl} />
    </div>
  );
};

export default CarDetailClientComponent;
