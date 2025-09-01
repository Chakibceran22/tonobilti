"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  ArrowLeft,
  Globe,
  AlertCircle,
  Copy,
  Navigation,
  MapPin as MapPinIcon,
  Route,
  Timer,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/Footer";
import L from "leaflet";

interface OrderInfo {
  id: string;
  carTitle: string;
  carImage: string;
  carImages: string[];
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
  sellerEmail: string;
  estimatedDeliveryTime: string;
  orderHistory: {
    status: string;
    date: string;
    description: string;
    location?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }[];
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
    lastUpdated: string;
  };
  route: {
    origin: {
      lat: number;
      lng: number;
      address: string;
    };
    destination: {
      lat: number;
      lng: number;
      address: string;
    };
    waypoints?: {
      lat: number;
      lng: number;
      address: string;
      estimatedArrival?: string;
    }[];
  };
  carSpecs: {
    year: number;
    maker: string;
    model?: string;
    mileage: number;
    fuel: string;
    transmission: string;
    engine: string;
    horsepower: string;
    topSpeed: number;
    acceleration: number;
    weight: number;
    dimensions: string;
    seats: number;
    color: string;
    interiorColor: string;
    bodyType: string;
    warranty: string;
    features: string[];
  };
}

const OrderDetailPage: React.FC = () => {
  const { loading: isLoading } = useAuth();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [orderLoading, setOrderLoading] = useState<boolean>(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const { language, setLanguage, t, isRtl } = useLanguage();

  // Mock data with complete location tracking and new car object structure
  const mockOrderDetail: OrderInfo = {
    id: orderId || "ORD-2025-001",
    carTitle: "2024 Volkswagen T-Roc 1.5TSI Starlight Edition",
    carImage:
      "https://res.cloudinary.com/dvcjcsp29/image/upload/v1756297657/image1_dmhq64.png",
    carImages: [
      "https://res.cloudinary.com/dvcjcsp29/image/upload/v1756297657/image1_dmhq64.png",
      "https://res.cloudinary.com/dvcjcsp29/image/upload/v1756297657/image2_jpw6ax.png",
      "https://res.cloudinary.com/dvcjcsp29/image/upload/v1756297659/image5_u9uwtx.png",
      "https://res.cloudinary.com/dvcjcsp29/image/upload/v1756297662/image6_az22fm.png",
      "https://res.cloudinary.com/dvcjcsp29/image/upload/v1756297662/image3_sw4r2l.png",
      "https://res.cloudinary.com/dvcjcsp29/image/upload/v1756297663/image4_xnnpc9.png",
    ],
    orderDate: "2025-01-15",
    expectedDelivery: "2025-01-20",
    status: "shipped",
    trackingNumber: "TRK123456789",
    totalAmount: 45000,
    shippingAddress: "123 Main Street, Alger, Algiers, Algeria",
    sellerName: "Ahmed Benali",
    sellerPhone: "+213 555 123 456",
    sellerEmail: "ahmed.benali@example.com",
    estimatedDeliveryTime: "2-3 days",
    orderHistory: [
      {
        status: "Order Placed",
        date: "2025-01-15T10:00:00Z",
        description: t("order_orderPlacedDesc"),
        coordinates: { lat: 36.7538, lng: 3.0588 },
      },
      {
        status: "Order Confirmed",
        date: "2025-01-15T14:30:00Z",
        description: t("order_orderConfirmedDesc"),
        coordinates: { lat: 36.7538, lng: 3.0588 },
      },
      {
        status: "Processing",
        date: "2025-01-16T09:15:00Z",
        description: t("order_processingDesc"),
        location: "Volkswagen Service Center - Qingdu",
        coordinates: { lat: 36.7645, lng: 3.0597 },
      },
      {
        status: "Shipped",
        date: "2025-01-17T11:45:00Z",
        description: t("order_shippedDesc"),
        location: "Algiers Distribution Center",
        coordinates: { lat: 36.7755, lng: 3.0799 },
      },
    ],
    currentLocation: {
      lat: 36.79,
      lng: 3.12,
      address: "Highway A1, En route to Algiers",
      lastUpdated: "2025-01-18T15:30:00Z",
    },
    route: {
      origin: {
        lat: 36.7645,
        lng: 3.0597,
        address: "Volkswagen Service Center, Qingdu",
      },
      destination: {
        lat: 36.8,
        lng: 3.15,
        address: "123 Main Street, Alger, Algiers, Algeria",
      },
      waypoints: [
        {
          lat: 36.7755,
          lng: 3.0799,
          address: "Algiers Distribution Center",
          estimatedArrival: "2025-01-17T12:00:00Z",
        },
        {
          lat: 36.79,
          lng: 3.12,
          address: "Highway A1 Checkpoint",
          estimatedArrival: "2025-01-18T16:00:00Z",
        },
      ],
    },
    carSpecs: {
      acceleration: 9.4,
      bodyType: "Compact SUV",
      color: "White",
      dimensions: "4319 × 1819 × 1592 mm",
      engine: "1.5T 160HP L4",
      features: [
        "Panoramic Sunroof",
        "Adaptive Cruise Control",
        "LED Matrix Headlights",
        "Wireless Phone Charging",
        "Electric Tailgate",
        "Automatic Parking",
        "Lane Keeping Assist",
        "Forward Collision Warning",
        "Heated Steering Wheel",
        "Dual-zone Climate Control",
      ],
      fuel: "Gasoline",
      horsepower: "160 HP",
      interiorColor: "Black",
      maker: "Volkswagen",
      mileage: 0,
      seats: 5,
      topSpeed: 200,
      transmission: "7-speed DCT",
      warranty: "3 years/100,000 km",
      weight: 1416,
      year: 2024,
    },
  };

  const toggleLanguage = (): void => {
    if (language === "fr") {
      setLanguage("ar");
    } else {
      setLanguage("fr");
    }
  };

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Load order data based on ID from query params
  useEffect(() => {
    if (orderId) {
      setOrderLoading(true);
      // Simulate API call - replace with actual API call
      setTimeout(() => {
        setOrderInfo(mockOrderDetail);
        setOrderLoading(false);
      }, 1000);
    } else {
      router.push("/profile"); // Redirect if no order ID
    }
  }, [orderId, router, t]);

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
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
    switch (status.toLowerCase()) {
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

  const getStatusText = (status: string): string => {
    switch (status.toLowerCase()) {
      case "pending":
        return t("order_pending");
      case "confirmed":
        return t("order_confirmed");
      case "processing":
        return t("order_processing");
      case "shipped":
        return t("order_shipped");
      case "delivered":
        return t("order_delivered");
      case "cancelled":
        return t("order_cancelled");
      default:
        return status;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getEstimatedTimeRemaining = (): string => {
    if (!orderInfo?.currentLocation || !orderInfo?.route?.destination)
      return t("order_calculating");

    const distance = calculateDistance(
      orderInfo.currentLocation.lat,
      orderInfo.currentLocation.lng,
      orderInfo.route.destination.lat,
      orderInfo.route.destination.lng
    );

    const averageSpeed = 60; // km/h
    const hours = distance / averageSpeed;

    if (hours < 1) {
      return `${Math.round(hours * 60)} ${t("order_minutes")}`;
    } else if (hours < 24) {
      return `${Math.round(hours)} ${t("order_hours")}`;
    } else {
      return `${Math.round(hours / 24)} ${t("order_days")}`;
    }
  };

  // Map component for tracking
  const DeliveryMap: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
      if (typeof window !== "undefined" && mapRef.current && !mapLoaded) {
        // Load Leaflet from CDN
        const loadLeaflet = async () => {
          // Load Leaflet CSS
          if (!document.querySelector('link[href*="leaflet"]')) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
          }

          // Load Leaflet JS
          if (!window.L) {
            const script = document.createElement("script");
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.onload = initializeMap;
            document.head.appendChild(script);
          } else {
            initializeMap();
          }
        };

        const initializeMap = () => {
          const L = window.L;
          if (!L || !mapRef.current) return;

          // Initialize map centered on Algeria
          const map = L.map(mapRef.current).setView([36.7755, 3.0599], 11);

          // Add OpenStreetMap tiles
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
          }).addTo(map);

          // Custom marker icons
          const originIcon = L.divIcon({
            html: '<div style="background: #2563eb; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
            className: "custom-marker",
          });

          const destinationIcon = L.divIcon({
            html: '<div style="background: #dc2626; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
            className: "custom-marker",
          });

          const vehicleIcon = L.divIcon({
            html: '<div style="background: #059669; width: 30px; height: 30px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.4); animation: pulse 2s infinite; display: flex; align-items: center; justify-content: center; font-size: 16px;">🚛</div><style>@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(5, 150, 105, 0); } 100% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); } }</style>',
            iconSize: [38, 38],
            iconAnchor: [19, 19],
            className: "vehicle-marker",
          });

          const checkpointIcon = L.divIcon({
            html: '<div style="background: #eab308; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            className: "custom-marker",
          });

          // Add markers with data from orderInfo
          if (orderInfo?.route) {
            // Origin marker
            L.marker([orderInfo.route.origin.lat, orderInfo.route.origin.lng], {
              icon: originIcon,
            })
              .addTo(map)
              .bindPopup(
                `<b>${t("order_originPoint")}</b><br>${
                  orderInfo.route.origin.address
                }`
              );

            // Destination marker
            L.marker(
              [
                orderInfo.route.destination.lat,
                orderInfo.route.destination.lng,
              ],
              { icon: destinationIcon }
            )
              .addTo(map)
              .bindPopup(
                `<b>${t("order_finalDestination")}</b><br>${
                  orderInfo.route.destination.address
                }`
              );

            // Waypoint markers
            orderInfo.route.waypoints?.forEach((waypoint, index) => {
              L.marker([waypoint.lat, waypoint.lng], { icon: checkpointIcon })
                .addTo(map)
                .bindPopup(
                  `<b>${t("order_checkpoint")} ${index + 1}</b><br>${
                    waypoint.address
                  }`
                );
            });

            // Current vehicle location
            if (orderInfo.currentLocation) {
              L.marker(
                [orderInfo.currentLocation.lat, orderInfo.currentLocation.lng],
                { icon: vehicleIcon }
              )
                .addTo(map)
                .bindPopup(
                  `<b>${t("order_currentVehicleLocation")}</b><br>${
                    orderInfo.currentLocation.address
                  }<br><small>${t("order_lastUpdated")}: ${new Date(
                    orderInfo.currentLocation.lastUpdated
                  ).toLocaleTimeString()}</small>`
                );
            }

            // Draw route line
            const routePoints: [number, number][] = [
              [orderInfo.route.origin.lat, orderInfo.route.origin.lng],
              ...(orderInfo.route.waypoints?.map(
                (wp) => [wp.lat, wp.lng] as [number, number]
              ) || []),
              [
                orderInfo.route.destination.lat,
                orderInfo.route.destination.lng,
              ],
            ];

            L.polyline(routePoints, {
              color: "#3b82f6",
              weight: 4,
              opacity: 0.8,
              dashArray: "10, 5",
            }).addTo(map);

            // Fit map to show all markers
            const group = new L.FeatureGroup([
              L.marker([
                orderInfo.route.origin.lat,
                orderInfo.route.origin.lng,
              ]),
              L.marker([
                orderInfo.route.destination.lat,
                orderInfo.route.destination.lng,
              ]),
              ...(orderInfo.currentLocation
                ? [
                    L.marker([
                      orderInfo.currentLocation.lat,
                      orderInfo.currentLocation.lng,
                    ]),
                  ]
                : []),
            ]);
            map.fitBounds(group.getBounds().pad(0.1));
          }

          setMapLoaded(true);
        };

        loadLeaflet();
      }
    }, [orderInfo, mapLoaded, t]);

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100 mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {t("order_liveTracking")}
            </h3>
            {orderInfo?.currentLocation && (
              <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                {t("order_live")}
              </span>
            )}
          </div>

          {/* Real Map Container */}
          <div
            ref={mapRef}
            className="h-64 sm:h-96 w-full rounded-lg overflow-hidden border-2 border-blue-200 bg-gray-100"
            style={{ minHeight: isMobile ? "256px" : "400px" }}
          >
            {!mapLoaded && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">
                    {t("order_loadingMap")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Current Location Info */}
          {orderInfo?.currentLocation && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3 sm:p-4 border border-green-200 mt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3">
                <h4 className="font-bold text-gray-900 flex items-center text-base sm:text-lg">
                  <Navigation
                    className={`h-4 sm:h-5 w-4 sm:w-5 ${
                      isRtl ? "ml-2" : "mr-2"
                    } text-green-600`}
                  />
                  {t("order_currentVehicleLocation")}
                </h4>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full mt-1 sm:mt-0">
                  {t("order_lastUpdated")}:{" "}
                  {new Date(
                    orderInfo.currentLocation.lastUpdated
                  ).toLocaleTimeString(isRtl ? "ar-DZ" : "fr-FR")}
                </span>
              </div>
              <p className="text-sm sm:text-base text-gray-700 flex items-center font-medium">
                <MapPinIcon
                  className={`h-4 sm:h-5 w-4 sm:w-5 ${
                    isRtl ? "ml-2" : "mr-2"
                  } text-blue-500`}
                />
                {orderInfo.currentLocation.address}
              </p>
              <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm">
                <span className="text-green-700 font-medium">
                  {t("order_vehicleMoving")}
                </span>
                <span className="text-blue-600 font-medium mt-1 sm:mt-0">
                  {t("order_eta")}: {getEstimatedTimeRemaining()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading || orderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600 font-medium">
            {t("order_loadingDetails")}
          </p>
        </div>
      </div>
    );
  }

  if (!orderInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {t("order_orderNotFound")}
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {t("order_orderNotFoundDesc")}
          </p>
          <button
            onClick={() => router.push("/profile")}
            className="px-6 py-3 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors"
          >
            {t("order_backToProfile")}
          </button>
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-3 sm:mr-4 p-1 sm:p-2 rounded-full hover:bg-blue-50 transition-colors text-blue-600"
              aria-label="Go back"
            >
              <ArrowLeft className={`h-4 sm:h-5 w-4 sm:w-5 text-blue-800`} />
            </button>
            <h1
              className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-800 cursor-pointer"
              onClick={() => router.push("/")}
            >
              Tonobilti
            </h1>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-4">
            <button
              onClick={toggleLanguage}
              className="p-1 sm:p-2 text-gray-500 hover:text-blue-800 transition-colors duration-300 flex items-center"
            >
              <Globe className="h-4 sm:h-5 w-4 sm:w-5 mx-1" />
              <span className="text-xs font-medium">
                {language.toUpperCase()}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 lg:py-12">
        {/* Order Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 sm:mb-8 border border-blue-100">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {t("order_detailsTitle")}
                </h1>
                <p className="text-blue-800 text-sm sm:text-base">
                  {t("order_orderPlaced")} #{orderInfo.id}
                </p>
              </div>
              <span
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center ${getStatusColor(
                  orderInfo.status
                )} mt-4 sm:mt-0`}
              >
                {getStatusIcon(orderInfo.status)}
                <span className={`${isRtl ? "mr-2" : "ml-2"} capitalize`}>
                  {getStatusText(orderInfo.status)}
                </span>
              </span>
            </div>

            {/* Tracking Number */}
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">
                    {t("order_trackingNumber")}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-blue-800">
                    {orderInfo.trackingNumber}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(orderInfo.trackingNumber)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                  title={t("order_copyTrackingNumber")}
                >
                  <Copy className="h-4 sm:h-5 w-4 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left Column - Map and Route Info */}
          <div className="lg:col-span-2">
            {/* Live Tracking Map */}
            <DeliveryMap />

            {/* Route Information */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100 mb-6">
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  {t("order_routeInformation")}
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {/* Origin */}
                  <div className="flex items-center p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                      <MapPinIcon className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-blue-800">
                        {t("order_originPoint")}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-700">
                        {orderInfo?.route.origin.address}
                      </p>
                    </div>
                  </div>

                  {/* Waypoints */}
                  {orderInfo?.route.waypoints?.map((waypoint, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 sm:p-4 bg-yellow-50 rounded-xl border border-yellow-200"
                    >
                      <div className="w-8 sm:w-10 h-8 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                        <div className="w-3 sm:w-4 h-3 sm:h-4 bg-white rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-bold text-yellow-800">
                          {t("order_checkpoint")} {index + 1}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-700">
                          {waypoint.address}
                        </p>
                        {waypoint.estimatedArrival && (
                          <p className="text-xs text-gray-500 mt-1">
                            {t("order_estArrival")}:{" "}
                            {new Date(waypoint.estimatedArrival).toLocaleString(
                              isRtl ? "ar-DZ" : "fr-FR"
                            )}
                          </p>
                        )}
                      </div>
                      {orderInfo?.currentLocation && (
                        <div className="text-xs text-gray-500 font-medium">
                          ~
                          {Math.round(
                            calculateDistance(
                              orderInfo.currentLocation.lat,
                              orderInfo.currentLocation.lng,
                              waypoint.lat,
                              waypoint.lng
                            )
                          )}{" "}
                          km
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Destination */}
                  <div className="flex items-center p-3 sm:p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-green-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                      <MapPinIcon className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-bold text-green-800">
                        {t("order_finalDestination")}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-700">
                        {orderInfo?.route.destination.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 flex items-center font-medium">
                        <Timer className="h-3 w-3 mr-1" />
                        {t("order_eta")}: {getEstimatedTimeRemaining()}
                      </p>
                      {orderInfo?.currentLocation && (
                        <p className="text-xs text-gray-500 font-medium">
                          ~
                          {Math.round(
                            calculateDistance(
                              orderInfo.currentLocation.lat,
                              orderInfo.currentLocation.lng,
                              orderInfo.route.destination.lat,
                              orderInfo.route.destination.lng
                            )
                          )}{" "}
                          {t("order_kmRemaining")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100 mb-6">
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  {t("order_vehicleInformation")}
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <img
                    src={orderInfo.carImage}
                    alt={orderInfo.carTitle}
                    className="w-full sm:w-32 h-48 sm:h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="flex-1">
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                      {orderInfo.carTitle}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">{t("order_year")}:</span>{" "}
                        {orderInfo.carSpecs.year}
                      </p>
                      <p>
                        <span className="font-medium">{t("order_maker")}:</span>{" "}
                        {orderInfo.carSpecs.maker}
                      </p>
                      <p>
                        <span className="font-medium">
                          {t("order_mileage")}:
                        </span>{" "}
                        {orderInfo.carSpecs.mileage} km
                      </p>
                      <p>
                        <span className="font-medium">{t("order_fuel")}:</span>{" "}
                        {orderInfo.carSpecs.fuel}
                      </p>
                      <p>
                        <span className="font-medium">
                          {t("order_transmission")}:
                        </span>{" "}
                        {orderInfo.carSpecs.transmission}
                      </p>
                      <p>
                        <span className="font-medium">
                          {t("order_engine")}:
                        </span>{" "}
                        {orderInfo.carSpecs.engine}
                      </p>
                      <p>
                        <span className="font-medium">
                          {t("order_horsepower")}:
                        </span>{" "}
                        {orderInfo.carSpecs.horsepower}
                      </p>
                      <p>
                        <span className="font-medium">
                          {t("order_topSpeed")}:
                        </span>{" "}
                        {orderInfo.carSpecs.topSpeed} km/h
                      </p>
                      <p>
                        <span className="font-medium">
                          {t("order_acceleration")}:
                        </span>{" "}
                        {orderInfo.carSpecs.acceleration}s (0-100 km/h)
                      </p>
                      <p>
                        <span className="font-medium">
                          {t("order_weight")}:
                        </span>{" "}
                        {orderInfo.carSpecs.weight} kg
                      </p>
                      <p>
                        <span className="font-medium">{t("order_seats")}:</span>{" "}
                        {orderInfo.carSpecs.seats}
                      </p>
                      <p>
                        <span className="font-medium">{t("order_color")}:</span>{" "}
                        {orderInfo.carSpecs.color}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Vehicle Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium text-blue-800 mb-1">
                      {t("order_dimensions")}
                    </p>
                    <p className="text-blue-700 text-xs sm:text-sm">
                      {orderInfo.carSpecs.dimensions}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="font-medium text-green-800 mb-1">
                      {t("order_bodyType")}
                    </p>
                    <p className="text-green-700 text-xs sm:text-sm">
                      {orderInfo.carSpecs.bodyType}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="font-medium text-purple-800 mb-1">
                      {t("order_warranty")}
                    </p>
                    <p className="text-purple-700 text-xs sm:text-sm">
                      {orderInfo.carSpecs.warranty}
                    </p>
                  </div>
                </div>

                {/* Vehicle Features */}
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                    Features:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {orderInfo.carSpecs.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xl sm:text-2xl font-bold text-blue-800">
                  ${orderInfo.totalAmount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                  {t("order_orderTimeline")}
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {orderInfo.orderHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 sm:gap-4"
                    >
                      <div className="flex-shrink-0 w-8 sm:w-10 h-8 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.status === "Order Placed"
                              ? t("order_orderPlaced")
                              : item.status === "Order Confirmed"
                              ? t("order_orderConfirmed")
                              : item.status === "Processing"
                              ? t("order_processing")
                              : item.status === "Shipped"
                              ? t("order_shipped")
                              : item.status}
                          </h4>
                          <time className="text-xs text-gray-500 mt-1 sm:mt-0">
                            {new Date(item.date).toLocaleDateString(
                              isRtl ? "ar-DZ" : "fr-FR",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </time>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                        {item.location && (
                          <p className="text-xs text-blue-600 mt-1 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {item.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Delivery Stats & Seller Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Real-time Delivery Stats */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                  {t("order_deliveryStatus")}
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Route
                        className={`h-4 sm:h-5 w-4 sm:w-5 ${
                          isRtl ? "ml-3" : "mr-3"
                        } text-blue-600`}
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-blue-800">
                          {t("order_progress")}
                        </p>
                        <p className="text-xs text-gray-600">
                          65% {t("order_complete")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-12 sm:w-16 h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-blue-600 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Timer
                        className={`h-4 sm:h-5 w-4 sm:w-5 ${
                          isRtl ? "ml-3" : "mr-3"
                        } text-green-600`}
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-green-800">
                          {t("order_eta")}
                        </p>
                        <p className="text-xs text-gray-600">
                          {getEstimatedTimeRemaining()}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-green-600">
                      {t("order_onTime")}
                    </div>
                  </div>

                  {orderInfo?.currentLocation && (
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center">
                        <Navigation
                          className={`h-4 sm:h-5 w-4 sm:w-5 ${
                            isRtl ? "ml-3" : "mr-3"
                          } text-yellow-600`}
                        />
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-yellow-800">
                            {t("order_distance")}
                          </p>
                          <p className="text-xs text-gray-600">
                            {t("order_remaining")}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-yellow-600">
                        {Math.round(
                          calculateDistance(
                            orderInfo.currentLocation.lat,
                            orderInfo.currentLocation.lng,
                            orderInfo.route.destination.lat,
                            orderInfo.route.destination.lng
                          )
                        )}{" "}
                        km
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                  {t("order_deliveryInformation")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar
                      className={`h-4 w-4 ${
                        isRtl ? "ml-2" : "mr-2"
                      } text-blue-500`}
                    />
                    <div>
                      <p className="font-medium">
                        {t("order_expectedDelivery")}
                      </p>
                      <p className="text-xs sm:text-sm">
                        {new Date(
                          orderInfo.expectedDelivery
                        ).toLocaleDateString(isRtl ? "ar-DZ" : "fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin
                      className={`h-4 w-4 ${
                        isRtl ? "ml-2" : "mr-2"
                      } text-blue-500 mt-0.5`}
                    />
                    <div>
                      <p className="font-medium">
                        {t("order_deliveryAddress")}
                      </p>
                      <p className="text-xs sm:text-sm">
                        {orderInfo.shippingAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                  {t("order_actions")}
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => copyToClipboard(orderInfo.trackingNumber)}
                    className="w-full px-4 py-2 sm:py-3 bg-blue-800 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-900 transition-colors flex items-center justify-center"
                  >
                    <Copy className={`h-4 w-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                    {t("order_copyTrackingNumber")}
                  </button>
                  <button
                    onClick={() => router.push("/profile")}
                    className="w-full px-4 py-2 sm:py-3 bg-white border border-blue-200 text-blue-800 text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                  >
                    <Package className={`h-4 w-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                    {t("order_viewAllOrders")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer t={t} isRtl={isRtl} />
    </div>
  );
};

export default OrderDetailPage;
