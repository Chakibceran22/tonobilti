"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Building,
  Map,
  Check,
  Car,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Globe,
  Clock,
  Ship,
} from "lucide-react";
import { useRouter } from "next/navigation";
import wilayas from "@/data/wilaya.json";
import comunes from "@/data/comunes.json";
import { useLanguage } from "@/hooks/useLanguage";
import Footer from "@/components/Footer";
import type { CarData } from "@/types/carTypes";
import useAuth from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { carService } from "@/lib/carService";
import { OrderToSend } from "@/types/orderTypes";
import { orderService } from "@/lib/orderService";
import toast from "react-hot-toast";
import { Comune, Comunes, Wilayas, Wilaya } from "@/types/locationTypes";
import Image from "next/image";
import PromoCodeSection from "@/components/PromoCodeSection";
interface ShippingOption {
  id: string;
  name: string;
  price: number;
  priceRange?: {
    min: number;
    max: number;
  };
  duration: string;
  description: string;
  maxDays: number;
}

const CheckoutClientComponent = ({ id }: { id: string }) => {
  const [step, setStep] = useState<number>(1);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [filteredCities, setFilteredCities] = useState<Comune[]>([]);
  const { language, setLanguage, t, isRtl } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    data: car,
    isLoading,
    error,
    isError,
  } = useQuery<CarData | undefined>({
    queryKey: ["cars", id],
    queryFn: () => carService.getCarById(id),
    enabled: !!id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  const addOrderMutation = useMutation({
    mutationFn: async (order: OrderToSend) =>
      await orderService.addOrder(order),
    onError: (error) => {
      console.error("Order submission error:", error.message);
      if (
        error.message ==
        'duplicate key value violates unique constraint "unique_user_car"'
      ) {
        toast.error(t("checkout_orderDoneBefore"));
      } else {
        toast.error(t("checkout_orderError"));
      }
      setIsSubmitting(false);
    },
    onSuccess: () => {
      toast.success(t("checkout_orderPlacedSuccess"));
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setIsSubmitting(false);
      // Optionally redirect to success page or orders page
      // router.push('/orders');
    },
  });

  // Get USD to DZD conversion rate from environment variables
  const USD_TO_DZD_RATE = process.env.NEXT_PUBLIC_USD_TO_DZD_RATE
    ? Number.parseFloat(process.env.NEXT_PUBLIC_USD_TO_DZD_RATE)
    : 240;

  // Service fee for handling customs clearance and our cut
  const SERVICE_FEE = 150000;

  // Shipping options with prices in USD converted to DZD
  const shippingOptions: ShippingOption[] = [
    {
      id: "standard",
      name: t("checkout_shippingStandard"),
      price: 1350 * USD_TO_DZD_RATE, // Base price for calculations
      priceRange: {
        min: 1350 * USD_TO_DZD_RATE,
        max: 1500 * USD_TO_DZD_RATE,
      },
      duration: t("checkout_shipping60to100Days"),
      description: t("checkout_shippingStandardDesc"),
      maxDays: 100,
    },
    {
      id: "express",
      name: t("checkout_shippingExpress"),
      price: 1750 * USD_TO_DZD_RATE, // Base price for calculations
      priceRange: {
        min: 1750 * USD_TO_DZD_RATE,
        max: 1850 * USD_TO_DZD_RATE,
      },
      duration: t("checkout_shippingMax55Days"),
      description: t("checkout_shippingExpressDesc"),
      maxDays: 55,
    },
    {
      id: "premium",
      name: t("checkout_shippingPremium"),
      price: 2000 * USD_TO_DZD_RATE, // Base price for calculations
      priceRange: {
        min: 2000 * USD_TO_DZD_RATE,
        max: 2200 * USD_TO_DZD_RATE,
      },
      duration: t("checkout_shippingMax40Days"),
      description: t("checkout_shippingPremiumDesc"),
      maxDays: 40,
    },
  ];
  const handlePromoApplied = (code: string, discount: number, label: string): void => {
  setFormData((prev) => ({
    ...prev,
    promo_code: code,
    promo_code_disscount: discount,
  }));
};

// Handle promo code removal
const handlePromoRemoved = (): void => {
  setFormData((prev) => ({
    ...prev,
    promo_code: "",
    promo_code_disscount: 0,
  }));
};
  const handleChangeWilaya = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If wilaya changes, update available cities
    if (name === "state") {
      const selectedWilaya = (wilayas as Wilayas).wilayas.find(
        (w: Wilaya) => (language === "ar" ? w.ar_name : w.name) === value
      );
      if (selectedWilaya) {
        const wilayaCode =
          selectedWilaya.code.length === 1
            ? `0${selectedWilaya.code}`
            : selectedWilaya.code;
        const matchingCities = (comunes as Comunes).comunes
          .filter((c: Comune) => c.wilaya_code === wilayaCode)
          .sort((a: Comune, b: Comune) =>
            a.commune_name_ascii.localeCompare(b.commune_name_ascii)
          );

        setFilteredCities(matchingCities);
      } else {
        setFilteredCities([]);
      }

      // Reset city selection
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  };

  // Form state
  const [formData, setFormData] = useState<OrderToSend>({
    // Contact information
    phone: "",

    // Location information
    state: "",
    city: "",
    specificLocation: "",

    // Shipping options
    shippingOption: "",
    shippingPrice: 0,
    promo_code: "",
    promo_code_disscount: 0,

    user_id: user?.id || "",
    car_id: id,
    total: 0,
    status: "Pending",
    customsClearance: "service", // Default to service handling
  });

  // Calculate dédouanement (customs clearance) tax based on car condition and age
  const calculateDedouanementTax = (car: CarData | undefined): number => {
    const basePrice = car?.price || 0;
    const mileage = car?.mileage || 0;
    const vehicleAge = new Date().getFullYear() - (car?.year || 0);

    // 45% for new cars (0 mileage)
    // 30% for used cars with less than 3 years and more than 0 mileage
    let dedouanementRate = 0;

    if (mileage === 0) {
      dedouanementRate = 0.45; // 45% for new cars
    } else if (mileage > 0 && vehicleAge < 3) {
      dedouanementRate = 0.3; // 30% for used cars less than 3 years
    } else {
      dedouanementRate = 0.3; // Default to 30% for older cars
    }

    return basePrice * dedouanementRate;
  };

  const toggleLanguage = (): void => {
    if (language === "fr") {
      setLanguage("ar");
    } else {
      setLanguage("fr");
    }
  };

  // Fixed port delivery fee: $2750 converted to DZD
  const portDeliveryFeeUSD = 2750;
  const portDeliveryFeeDZD = portDeliveryFeeUSD * USD_TO_DZD_RATE;

  // Calculate dédouanement tax (only if user chooses self-clearance)
  const dedouanementTax =
    car?.price && formData.customsClearance === "self"
      ? calculateDedouanementTax(car)
      : 0;

  // Service fee (includes our cut and customs handling if chosen)
  const serviceFee = formData.customsClearance === "service" ? SERVICE_FEE : 0;

  // Total calculation: car price + port delivery fee + shipping price + (dédouanement tax OR service fee)
  const total = car?.price
    ? car.price +
      portDeliveryFeeDZD +
      formData.shippingPrice +
      dedouanementTax +
      serviceFee -
      formData.promo_code_disscount
    : 0;

  useEffect(() => {
    setFormData((prev) => ({ ...prev, total: total, user_id: user?.id || "" }));
  }, [total, user?.id]);

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

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle shipping option selection
  const handleShippingOptionChange = (optionId: string): void => {
    const selectedOption = shippingOptions.find(
      (option) => option.id === optionId
    );
    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        shippingOption: optionId,
        shippingPrice: selectedOption.price,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (step < 3) {
      setStep(step + 1);
    } else {
      // Validate user is logged in
      if (!user?.id) {
        toast.error("Please log in to place an order");
        return;
      }

      // Validate required fields
      if (
        !formData.phone ||
        !formData.state ||
        !formData.city ||
        !formData.specificLocation
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      setIsSubmitting(true);

      // Update form data with latest user_id and total before submitting
      const orderData = {
        ...formData,
        user_id: user.id,
        total: total,
        vehiclePrice: car?.price,
        portDeliveryFee: portDeliveryFeeDZD,
        serviceFee: serviceFee,
        customsTax: dedouanementTax,
      };

      addOrderMutation.mutate(orderData);
    }
  };

  // Go back to previous step
  const goBack = (): void => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      // Navigate back to car details page
      window.history.back();
    }
  };

  // Go back to car listing
  const backToListing = (): void => {
    window.history.back();
  };

  // Render progress steps
  const renderProgressSteps = () => {
    const steps = [
      { number: 1, label: t("checkout_locationContact") },
      { number: 2, label: t("checkout_shippingOptions") },
      { number: 3, label: t("checkout_deliveryOptions") },
    ];

    return (
      <div className="mb-8">
        <div className="flex justify-between relative">
          {steps.map((s) => (
            <div
              key={s.number}
              className="flex flex-col items-center relative z-1"
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                  step >= s.number
                    ? "bg-blue-800 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s.number ? (
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  s.number
                )}
              </div>
              <div
                className={`mt-2 text-xs sm:text-sm ${
                  step >= s.number
                    ? "text-blue-800 font-medium"
                    : "text-gray-500"
                } ${isMobile ? "hidden" : ""}`}
              >
                {s.label}
              </div>
            </div>
          ))}

          {/* Progress bar */}
          <div className="absolute top-4 sm:top-5 left-0 right-0 h-0.5 bg-gray-200">
            <div
              className="h-full bg-blue-800 transition-all duration-300"
              style={{ width: `${((step - 1) * 100) / (steps.length - 1)}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  // Render location and contact form
  const renderLocationContactForm = () => {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
          {t("checkout_contactLocationInfo")}
        </h3>

        <div className="space-y-3 sm:space-y-4">
          <label
            htmlFor="phone"
            className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-0 block sm:inline"
          >
            {t("checkout_phoneNumber")}
          </label>
          <div className="relative">
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full rounded-md sm:rounded-lg border border-blue-200 bg-blue-50 pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800 ${
                isRtl ? "text-right" : ""
              }`}
              required
              placeholder={t("checkout_phonePlaceholder")}
            />
            <Phone className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-blue-800" />
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <label
            htmlFor="state"
            className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-0 block sm:inline"
          >
            {t("checkout_wilaya")}
          </label>
          <div className="relative">
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChangeWilaya}
              className={`w-full rounded-md sm:rounded-lg border border-blue-200 bg-blue-50 py-2 sm:py-3 text-sm sm:text-base focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800 appearance-none ${
                isRtl
                  ? "text-right pr-8 sm:pr-10 pl-3 sm:pl-4"
                  : "pl-8 sm:pl-10 pr-3 sm:pr-4"
              }`}
              required
            >
              <option value="">{t("checkout_selectWilaya")}</option>
              {(wilayas as Wilayas).wilayas.map((state: Wilaya) => (
                <option
                  key={state.id}
                  value={language === "ar" ? state.ar_name : state.name}
                >
                  {language === "ar" ? state.ar_name : state.name}
                </option>
              ))}
            </select>
            <Map
              className={`absolute top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-blue-800 ${
                isRtl ? "right-2.5 sm:right-3" : "left-2.5 sm:left-3"
              }`}
            />
            <ChevronRight
              className={`absolute top-1/2 transform -translate-y-1/2 rotate-90 h-4 sm:h-5 w-4 sm:w-5 text-blue-800 ${
                isRtl ? "left-2.5 sm:left-3" : "right-2.5 sm:right-3"
              }`}
            />
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <label
            htmlFor="city"
            className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-0 block sm:inline"
          >
            {t("checkout_cityCommune")}
          </label>
          <div className="relative">
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full rounded-md sm:rounded-lg border border-blue-200 bg-blue-50 py-2 sm:py-3 text-sm sm:text-base focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800 appearance-none ${
                isRtl
                  ? "text-right pr-8 sm:pr-10 pl-3 sm:pl-4"
                  : "pl-8 sm:pl-10 pr-3 sm:pr-4"
              }`}
              required
              disabled={!formData.state}
            >
              <option value="">{t("checkout_selectCity")}</option>
              {filteredCities.map((city) => (
                <option key={city.id} value={city.commune_name_ascii}>
                  {language == "ar"
                    ? city.commune_name
                    : city.commune_name_ascii}
                </option>
              ))}
            </select>
            <Building
              className={`absolute top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-blue-800 ${
                isRtl ? "right-2.5 sm:right-3" : "left-2.5 sm:left-3"
              }`}
            />
            <ChevronRight
              className={`absolute top-1/2 transform -translate-y-1/2 rotate-90 h-4 sm:h-5 w-4 sm:w-5 text-blue-800 ${
                isRtl ? "left-2.5 sm:left-3" : "right-2.5 sm:right-3"
              }`}
            />
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <label
            htmlFor="specificLocation"
            className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-0 block sm:inline"
          >
            {t("checkout_preferredLocation")}
          </label>
          <div className="relative">
            <input
              type="text"
              id="specificLocation"
              name="specificLocation"
              value={formData.specificLocation}
              onChange={handleChange}
              className="w-full rounded-md sm:rounded-lg border border-blue-200 bg-blue-50 pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
              required
              placeholder={t("checkout_addressPlaceholder")}
            />
            <MapPin className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-blue-800" />
          </div>
        </div>
      </div>
    );
  };

  // Render shipping options form
  const renderShippingOptionsForm = () => {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
          {t("checkout_shippingOptionsTitle")}
        </h3>

        <div className="space-y-3">
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-3 block">
            {t("checkout_chooseShippingMethod")}
          </label>

          <div className="grid grid-cols-1 gap-4">
            {shippingOptions.map((option) => (
              <div
                key={option.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  formData.shippingOption === option.id
                    ? "border-blue-800 bg-blue-50 ring-2 ring-blue-800"
                    : "border-blue-200 hover:border-blue-400 hover:bg-blue-25"
                }`}
                onClick={() => handleShippingOptionChange(option.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-5 h-5 mt-1 mr-3">
                      <input
                        type="radio"
                        name="shippingOption"
                        value={option.id}
                        checked={formData.shippingOption === option.id}
                        onChange={() => handleShippingOptionChange(option.id)}
                        className="w-4 h-4 text-blue-800 border-blue-300 focus:ring-blue-800"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Ship className="h-5 w-5 text-blue-800 mr-2" />
                        <h4 className="font-bold text-sm sm:text-base text-gray-900">
                          {option.name}
                        </h4>
                      </div>
                      <div className="flex items-center mb-2">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600 font-medium">
                          {option.duration}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-bold text-lg text-blue-800">
                      {option.priceRange
                        ? `${option.priceRange.min.toLocaleString()} - ${option.priceRange.max.toLocaleString()} DZD`
                        : `${option.price.toLocaleString()} DZD`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {option.priceRange
                        ? `~${Math.round(
                            option.priceRange.min / USD_TO_DZD_RATE
                          )}-${Math.round(
                            option.priceRange.max / USD_TO_DZD_RATE
                          )}$`
                        : `~${Math.round(option.price / USD_TO_DZD_RATE)}$`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong>{" "}
            {t("checkout_estimatedPricing") ||
              "Les prix affichés sont des estimations et peuvent varier selon les conditions du marché."}
          </p>
        </div>

        {/* Information about shipping */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-800 mb-3 text-sm">
            {t("checkout_shippingInformation")}
          </h5>
          <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
            <li>• {t("checkout_shippingInfo1")}</li>
            <li>• {t("checkout_shippingInfo2")}</li>
            <li>• {t("checkout_shippingInfo3")}</li>
            <li>• {t("checkout_shippingInfo4")}</li>
          </ul>
        </div>

        {formData.shippingOption && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <h4 className="font-medium text-green-800">
                  {t("checkout_selectedOption")}
                </h4>
                <p className="text-sm text-green-700">
                  {
                    shippingOptions.find(
                      (opt) => opt.id === formData.shippingOption
                    )?.name
                  }{" "}
                  -
                  {
                    shippingOptions.find(
                      (opt) => opt.id === formData.shippingOption
                    )?.duration
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render delivery options form (now step 3)
  const renderDeliveryOptionsForm = () => {
    // const vehicleAge = new Date().getFullYear() - (car?.year || 0);
    // const isNewCar = (car?.mileage || 0) === 0;
    // const dedouanementRate = isNewCar ? 45 : vehicleAge < 3 ? 30 : 30;

    return (
      <div className="space-y-3 !text-xs">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
          {t("checkout_customsClearanceTitle")}
        </h3>

        {/* Port delivery information */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-3 block">
            {t("checkout_deliveryMethod")}
          </label>
          <div className="border rounded-md p-2 sm:p-3 border-blue-800 bg-blue-50">
            <div className="flex items-start">
              <div className="ml-2 sm:ml-3">
                <h4 className="font-bold text-sm sm:text-base">
                  {t("checkout_portDelivery")}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 leading-tight sm:leading-snug">
                  {t("checkout_portDeliveryDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customs clearance options */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-3 block">
            {t("checkout_customsClearance")}
          </label>
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            <div
              className={`border rounded-md p-2 sm:p-3 cursor-pointer ${
                formData.customsClearance === "service"
                  ? "border-blue-800 bg-blue-50"
                  : "border-blue-200"
              }`}
              onClick={() =>
                setFormData({ ...formData, customsClearance: "service" })
              }
            >
              <div className="flex items-start">
                <div className="ml-2 sm:ml-3">
                  <h4 className="font-bold text-xs sm:text-base">
                    {t("checkout_fullService")}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 leading-tight sm:leading-snug">
                    {t("checkout_fullServiceDescription")}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`border rounded-md p-2 sm:p-3 cursor-pointer ${
                formData.customsClearance === "self"
                  ? "border-blue-800 bg-blue-50"
                  : "border-blue-200"
              }`}
              onClick={() =>
                setFormData({ ...formData, customsClearance: "self" })
              }
            >
              <div className="flex items-start">
                <div className="ml-2 sm:ml-3">
                  <h4 className="font-bold text-xs sm:text-base">
                    {t("checkout_selfClearance")}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 leading-tight sm:leading-snug">
                    {t("checkout_selfClearanceDescription")}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-orange-600 mt-0.5 sm:mt-1">
                    {t("checkout_estimatedCustomsTax")}:{" "}
                    {calculateDedouanementTax(car).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}{" "}
                    DZD
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing information */}
        <div className="bg-blue-50 rounded-md p-3 sm:p-4 border border-blue-100">
          <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-3 sm:mb-3">
            {t("checkout_pricingBreakdown")}
          </h4>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span>{t("checkout_vehiclePrice")}:</span>
              <span className="font-medium">
                {car?.price?.toLocaleString()} DZD
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("checkout_shippingFees")}:</span>
              <span className="font-medium">
                {formData.shippingPrice.toLocaleString()} DZD
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("checkout_portFees")}:</span>
              <span className="font-medium">
                {portDeliveryFeeDZD.toLocaleString()} DZD
              </span>
            </div>

            {formData.customsClearance === "service" ? (
              <div className="flex justify-between">
                <span>{t("checkout_customsService")}:</span>
                <span className="font-medium">
                  {(
                    SERVICE_FEE + calculateDedouanementTax(car)
                  ).toLocaleString()}{" "}
                  DZD
                </span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-orange-600">
                  {t("checkout_estimatedCustomsTax")}:
                </span>
                <span className="font-medium text-orange-600">
                  {calculateDedouanementTax(car).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  DZD
                </span>
              </div>
            )}
            <div className="border-t border-blue-200 pt-2 flex justify-between font-bold">
              <span>
                {t("checkout_total")}{" "}
                {formData.customsClearance === "self"
                  ? t("checkout_excludingCustoms")
                  : ""}
                :
              </span>
              <span>
                {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
                DZD
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-3 sm:p-4 border border-blue-100">
          <PromoCodeSection
            isRtl={isRtl}
            t={t}
            currentPromoCode={formData.promo_code}
            currentPromoDiscount={formData.promo_code_disscount}
            onPromoApplied={handlePromoApplied}
            onPromoRemoved={handlePromoRemoved}
          />
        </div>
        {/* Additional information */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4">
          <h5 className="font-medium text-blue-800 mb-3 text-xs sm:text-sm">
            {t("checkout_importantInformation")}
          </h5>
          <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
            <li>• {t("checkout_infoBullet1")}</li>
            <li>• {t("checkout_infoBullet2")}</li>
            <li>• {t("checkout_infoBullet3")}</li>
          </ul>
        </div>

        {/* Order summary in mobile view */}
        <div className="mt-4 block md:hidden">
          <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-3">
            {t("checkout_orderSummary")}
          </h4>
          <div className="bg-blue-50 rounded-md p-3 sm:p-4 sticky top-6 border border-blue-100">
            <div className="flex justify-between mb-2 text-xs sm:text-sm">
              <span>{t("checkout_vehicle")}:</span>
              <span>{car?.title}</span>
            </div>
            <div className="flex justify-between mb-1 pt-2 border-t border-blue-200 font-bold text-xs sm:text-sm">
              <span>
                {t("checkout_total")}{" "}
                {formData.customsClearance === "self"
                  ? t("checkout_excludingCustoms")
                  : ""}
                :
              </span>
              <span>
                {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
                DZD
              </span>
            </div>
          </div>
        </div>

        {/* Terms and conditions checkbox */}
        <div className="mt-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              className="mt-0.5 h-3 w-3 rounded border-blue-300 text-blue-800 focus:ring-blue-800"
            />
            <span className="mx-2 text-xs sm:text-sm text-gray-600 leading-snug">
              {t("checkout_termsConditions")}{" "}
              <a href="#" className="text-blue-800 hover:text-blue-800">
                {t("checkout_terms")}
              </a>{" "}
              {t("checkout_and")}{" "}
              <a href="#" className="text-blue-800 hover:text-blue-800">
                {t("checkout_privacyPolicy")}
              </a>
            </span>
          </label>
        </div>
      </div>
    );
  };

  // Render current step form
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderLocationContactForm();
      case 2:
        return renderShippingOptionsForm();
      case 3:
        return renderDeliveryOptionsForm();
      default:
        return null;
    }
  };

  // Render order summary
  const renderOrderSummary = () => {
    const selectedShippingOption = shippingOptions.find(
      (opt) => opt.id === formData.shippingOption
    );

    return (
      <div className="bg-blue-50 rounded-xl p-6 sticky top-6 border border-blue-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Récapitulatif de Commande
        </h3>

        {/* Car details */}
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-blue-100">
            <Image
              width={300}
              height={300}
              src={car?.images[car?.imageIndex] || "/placeholder.svg"}
              alt={car?.title || "Car Image"}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="ml-4">
            <h4 className="font-medium text-gray-900">{car?.title}</h4>
            <div className="text-sm text-gray-500 mt-1">
              <div className="flex items-center">
                <Car className="h-4 w-4 mr-1" />
                <span>
                  {car?.year} • {car?.mileage?.toLocaleString()} km
                </span>
              </div>
              <div className="mt-1">
                <span>Couleur: {car?.color}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected location info */}
        {(formData.state || formData.city || formData.specificLocation) && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-blue-100">
            <h5 className="font-medium text-gray-900 mb-2">
              Localisation Sélectionnée
            </h5>
            {formData.state && (
              <p className="text-sm">Wilaya: {formData.state}</p>
            )}
            {formData.city && <p className="text-sm">Ville: {formData.city}</p>}
            {formData.specificLocation && (
              <p className="text-sm">Adresse: {formData.specificLocation}</p>
            )}
          </div>
        )}

        {/* Selected shipping option */}
        {selectedShippingOption && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-blue-100">
            <h5 className="font-medium text-gray-900 mb-2">
              Option de Livraison
            </h5>
            <div className="flex items-center mb-1">
              <Ship className="h-4 w-4 text-blue-800 mr-2" />
              <span className="text-sm font-medium">
                {selectedShippingOption.name}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">
                {selectedShippingOption.duration}
              </span>
            </div>
          </div>
        )}

        {/* Price breakdown */}
        <div className="pt-2">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Prix du véhicule:</span>
              <span>{car?.price?.toLocaleString()} DZD</span>
            </div>
            {formData.shippingPrice > 0 && (
              <div className="flex justify-between">
                <span>Livraison maritime:</span>
                <span>{formData.shippingPrice.toLocaleString()} DZD</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Frais de port:</span>
              <span>{portDeliveryFeeDZD.toLocaleString()} DZD</span>
            </div>
            {formData.customsClearance === "service" && (
              <div className="flex justify-between">
                <span>Service de dédouanement:</span>
                <span>
                  {(
                    SERVICE_FEE + calculateDedouanementTax(car)
                  ).toLocaleString()}{" "}
                  DZD
                </span>
              </div>
            )}
            {formData.customsClearance === "self" && (
              <div className="flex justify-between text-orange-600">
                <span>Taxe douanière estimée:</span>
                <span>
                  {calculateDedouanementTax(car).toLocaleString()} DZD
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-b border-blue-200 py-3 flex justify-between mt-3">
            <span className="font-bold text-gray-900">
              Total{" "}
              {formData.customsClearance === "self" ? "(hors douanes)" : ""}
            </span>
            <span className="font-bold text-gray-900">
              {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
              DZD
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Validation for each step
  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          formData.phone &&
          formData.state &&
          formData.city &&
          formData.specificLocation
        );
      case 2:
        return formData.shippingOption;
      case 3:
        return formData.customsClearance;
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-white ${
          isRtl ? "rtl" : "ltr"
        }`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="text-center">
          <Loader2 className="inline-block w-12 h-12 text-blue-800 animate-spin mb-4" />
          <h2 className="text-xl font-medium text-gray-900">
            Chargement du véhicule...
          </h2>
          <p className="text-blue-800 mt-2">Veuillez patienter</p>
        </div>
      </div>
    );
  }
  if (isError || !car) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-white ${
          isRtl ? "rtl" : "ltr"
        }`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            {t("checkout_carNotFound") || "Véhicule non trouvé"}
          </h2>
          <p className="text-gray-600 mb-6">
            {error?.message ||
              t("checkout_carLoadError") ||
              "Impossible de charger les informations du véhicule."}
          </p>
          <button
            onClick={() => router.push("/cars")}
            className="px-6 py-3 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors"
          >
            {t("checkout_backToCars") || "Retour aux véhicules"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-white ${isRtl ? "rtl" : "ltr"}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <header dir="ltr" className="bg-white shadow-md w-full sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <button
            onClick={backToListing}
            className="flex items-center text-gray-600 hover:text-blue-800 transition-colors mx-2"
          >
            <ArrowLeft className={`h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2`} />
            <span className="font-medium sm:text-base">
              Retour aux Annonces
            </span>
          </button>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-800">
            Commande
          </h1>
          <button
            onClick={toggleLanguage}
            className="p-2 text-gray-500 hover:text-blue-800 transition-colors duration-300 flex items-center"
          >
            <Globe className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
            <span className="text-xs font-medium">
              {language.toUpperCase()}
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Progress Steps */}
        {renderProgressSteps()}

        {/* Checkout Form and Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-blue-100">
              <form onSubmit={handleSubmit}>
                {renderStepContent()}

                <div className="mt-6 sm:mt-8 flex flex-row justify-between gap-4 sm:gap-0">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex items-center justify-center px-4 py-3 border text-sm border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors order-2 sm:order-1 m-0"
                    >
                      <ChevronLeft
                        className={`h-5 w-5 mr-1 ${isRtl ? "rotate-180" : ""}`}
                      />
                      Retour
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !isStepValid()}
                    className={`px-6 py-3 bg-blue-800 text-white font-medium rounded-lg transition-colors order-1 sm:order-2 text-sm ${
                      isSubmitting || !isStepValid()
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:bg-blue-900"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <Loader2 size={20} className="mr-2 animate-spin" />
                        {step < 3 ? "Traitement..." : "Finalisation..."}
                      </span>
                    ) : step < 3 ? (
                      "Continuer"
                    ) : (
                      "Passer Commande"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 hidden md:block">
            {renderOrderSummary()}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer t={t} isRtl={isRtl} />

      {/* Full-screen loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900/20 backdrop-blur-sm">
          <div className="rounded-lg bg-white p-6 shadow-xl border border-blue-100">
            <div className="flex flex-col items-center space-y-3">
              <Loader2 size={40} className="animate-spin text-blue-800" />
              <p className="font-medium text-gray-700">
                {step < 3
                  ? "Traitement des informations..."
                  : "Finalisation de votre commande..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutClientComponent;
