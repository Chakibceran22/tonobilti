"use client";
import { useState, useMemo, memo } from "react";
import {
  User,
  Store,
  ArrowRight,
  BarChart,
  ChevronRight,
  Check,
  Settings,
  Fuel,
  Gauge,
  Calendar,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../hooks/useLanguage";
import Footer from "@/components/Footer";
import { Language } from "../providers/LanguageContext";
import type { TranslationFn } from "@/providers/LanguageContext";
import Header from "@/components/Header";
import { carService } from "@/lib/carService";
import type { CarData } from "@/types/carTypes";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";

const benefitDescriptions: {
  [key: string]: {
    [key: string]: string;
  };
} = {
  fr: {
    // Premium Buyer benefits
    "Importation facile et flexible selon vos besoins":
      "Nous vous offrons la possibilité d'importer des voitures neuves ou de moins de trois ans, vous donnant un large éventail d'options pour trouver la voiture qui correspond à votre budget et à vos besoins.",
    "Carte grise immédiate ou à coût réduit plus tard":
      "Obtenez votre carte grise immédiatement en payant un supplément, ou choisissez d'attendre trois ans et bénéficiez de coûts réduits - la décision vous appartient !",
    "Voitures disponibles ou sur commande":
      "Vous pouvez choisir parmi les voitures importées disponibles sur le territoire national, ou faire une demande pour importer votre voiture préférée selon vos propres spécifications.",
    "Importation sécurisée et garantie avec solutions intelligentes":
      "Nous vous garantissons un processus d'importation sûr et sans complications, avec des solutions intelligentes pour gérer toutes les préoccupations et problèmes potentiels, afin que vous obteniez votre voiture en toute confiance et tranquillité d'esprit.",

    // Luxury Showroom benefits
    "Accès à des acheteurs sérieux et fiables":
      "Présentez vos véhicules à une clientèle sérieuse et fiable à la recherche d'automobiles exclusives.",
    "Clients potentiels qualifiés":
      "Tous les acheteurs sont pré-qualifiés financièrement, vous permettant de vous concentrer sur les clients sérieux.",
    "Outils d'analyse pour suivre les performances et augmenter les ventes":
      "Accédez à des outils d'analyse avancés pour suivre vos performances et augmenter vos ventes.",

    // Elite Agent benefits
    "Outils marketing avancés pour attirer plus de clients":
      "Accédez à des outils marketing de pointe pour attirer davantage de clients et augmenter vos ventes.",
    "Base de données étendue d'acheteurs potentiels sérieux":
      "Profitez d'une base de données étendue d'acheteurs potentiels sérieux pour développer votre activité.",
    "Génération de prospects":
      "Recevez des prospects qualifiés directement dans votre tableau de bord, sans avoir à dépenser en publicité.",
  },
  ar: {
    // Premium Buyer benefits
    "استيراد سهل ومرن حسب احتياجاتك":
      "نوفر لك إمكانية استيراد سيارات 0 كلم أو أقل من ثلاث سنوات، مما يمنحك خيارات واسعة للعثور على السيارة التي تناسب ميزانيتك واحتياجاتك.",
    "بطاقة رمادية فورية أو بتكلفة أقل لاحقًا":
      "احصل على بطاقتك الرمادية في الحين عند دفع مبلغ إضافي، أو اختر الانتظار لمدة ثلاث سنوات والاستفادة من التكاليف المخفضة – القرار بين يديك!",
    "سيارات جاهزة للتسليم أو حسب الطلب":
      "يمكنك الاختيار من بين سيارات مستوردة متوفرة داخل التراب الوطني، أو تقديم طلب لاستيراد سيارتك المفضلة وفقًا لمواصفاتك الخاصة.",
    "استيراد آمن ومضمون مع حلول ذكية":
      "نحن نضمن لك عملية استيراد آمنة وخالية من التعقيدات، مع حلول ذكية للتعامل مع كل المخاوف والمشاكل المحتملة، حتى تحصل على سيارتك بثقة وراحة بال.",

    // Luxury Showroom benefits
    "وصول إلى مشترين جادين وموثوقين":
      "اعرض مركباتك لعملاء دوليين ذوي قيمة عالية يبحثون عن سيارات حصرية.",
    "عملاء محتملين مؤهلين":
      "جميع المشترين مؤهلون ماليًا مسبقًا، مما يتيح لك التركيز على العملاء الجادين.",
    "أدوات تحليل لمتابعة الأداء وزيادة المبيعات":
      "أبرز تراث وحصرية علامتك التجارية من خلال عروض تقديمية مخصصة وفعاليات افتراضية.",

    // Elite Agent benefits
    "أدوات تسويقية متطورة لجذب المزيد من العملاء":
      "اكسب حتى 15٪ عمولة على كل معاملة، وهو أعلى بكثير من متوسط الصناعة.",
    "قاعدة بيانات موسعة لمشترين محتملين جادين ":
      "الوصول إلى أدوات تسويقية متطورة، بما في ذلك الجولات الافتراضية والعروض التقديمية القابلة للتخصيص.",
    "توليد العملاء المحتملين":
      "استلم عملاء محتملين مؤهلين مباشرة في لوحة التحكم الخاصة بك، دون الحاجة إلى الإنفاق على الإعلانات.",
  },
};
const LuxuryAutoLanding = () => {
  const { language, isRtl, t } = useLanguage();

  return (
    <div
      className={`min-h-screen bg-white ${
        language === "ar" ? "rtl text-right" : "ltr text-left"
      }`}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <Header />
      <Hero t={t} isRtl={isRtl} />
      <UserTypeSection language={language} t={t} isRtl={isRtl} />
      <FeaturedCars t={t} isRtl={isRtl} />
      <CallToAction t={t} isRtl={isRtl} />
      <Footer t={t} isRtl={isRtl} />
    </div>
  );
};

// Hero Section Component
const Hero = memo(({ t, isRtl }: { t: TranslationFn; isRtl: boolean }) => {
  const router = useRouter();
  const scrollToCars = useCallback(() => {
    const carsSection = document.getElementById("cars");
    if (carsSection) {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        carsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);
  return (
    <div className="relative bg-gradient-to-br from-blue-900 to-blue-800 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-blue-800 bg-[url('/placeholder.svg?height=100&width=100')] bg-repeat"></div>
      <div className="container mx-auto px-4 py-14 md:py-16 relative z-10">
        <div
          dir={isRtl ? "rtl" : ""}
          className="grid md:grid-cols-2 gap-8 items-center"
        >
          {/* Text Section */}
          <div
            className={`  space-y-6 animate-fadeInUp ${
              isRtl ? "md:mr-15 md:order-2" : " md:ml-15 md:order-1"
            }`}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {t("home_discoverYour")}{" "}
              <span className="text-blue-300 relative inline-block">
                {t("home_luxuryVehicle")}
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 8"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0,5 Q50,0 100,5 Q150,10 200,5"
                    stroke="rgba(191, 219, 254, 0.6)"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </span>
            </h1>

            {/* Replace paragraph with bullet points */}
            <ul className="space-y-3 text-blue-100 max-w-lg">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-700 flex items-center justify-center mt-0.5">
                  <Check className="h-3.5 w-3.5 text-blue-300" />
                </div>
                <span className="ml-2 text-base">{t("home_luxeryDesc")}</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-700 flex items-center justify-center mt-0.5">
                  <Check className="h-3.5 w-3.5 text-blue-300" />
                </div>
                <span className="ml-2 text-base">{t("home_luxeryDesc2")}</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-700 flex items-center justify-center mt-0.5">
                  <Check className="h-3.5 w-3.5 text-blue-300" />
                </div>
                <span className="ml-2 text-base">{t("home_luxeryDesc3")}</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-700 flex items-center justify-center mt-0.5">
                  <Check className="h-3.5 w-3.5 text-blue-300" />
                </div>
                <span className="ml-2 text-base">{t("home_luxeryDesc4")}</span>
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={scrollToCars}
                className="px-6 py-3 bg-white text-blue-800 font-medium rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center group"
              >
                {t("home_viewCollection")}
                <ArrowRight
                  className={`ml-2 h-5 w-5 transform transition-transform duration-300 ${
                    isRtl
                      ? "rotate-180 group-hover:-translate-x-1"
                      : "group-hover:translate-x-1"
                  }`}
                />
              </button>
              <button
                onClick={() => router.push("/signup")}
                className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-800 hover:bg-opacity-10 transition-all duration-300 backdrop-blur-sm"
              >
                {t("home_becomeMember")}
              </button>
            </div>
          </div>

          {/* Image Section */}
          <div
            className={`relative hidden md:block animate-fadeInRight ${
              isRtl ? "md:order-1" : "md:order-2"
            }`}
          >
            <Image
              width={800}
              height={800}
              src="/hero-image.avif"
              alt="Luxury car"
              className="relative z-10 bg-transparent w-full"
              priority // Add this for above-the-fold images
            />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-900 to-transparent"></div>
    </div>
  );
});

// User Type Section
const UserTypeSection = memo(
  ({
    language,
    t,
    isRtl,
  }: {
    language: Language;
    t: TranslationFn;
    isRtl: boolean;
  }) => {
    const router = useRouter();
    const handleSignup = useCallback(() => {
      router.push("/signup");
    }, [router]);

    const handleLockedFeature = useCallback(() => {
      alert(t("home_featureNotUnlocked"));
    }, [t]);
    // Add state to track which dropdowns are open
    const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    // Add state to track hover for showroom and broker cards

    // Function to toggle dropdown state

    const toggleDropdown = useCallback(
      (typeIndex: number, benefitIndex: number) => {
        const key = `${typeIndex}-${benefitIndex}`;
        setOpenDropdowns((prev) => {
          const next = new Set(prev);
          if (next.has(key)) {
            next.delete(key);
          } else {
            next.add(key);
          }
          return next;
        });
      },
      []
    );

    // Add descriptions for each benefit

    const userTypes = useMemo(
      () => [
        {
          title: t("home_premiumBuyer"),
          description: t("home_premiumBuyerDesc"),
          benefits: [
            t("home_easyImport"),
            t("home_grayCard"),
            t("home_readyCars"),
            t("home_safeImport"),
          ],
          bgColor: "bg-white",
          buttonText: t("home_exploreBuyer"),
        },
        {
          title: t("home_luxuryShowroom"),
          description: t("home_luxuryShowroomDesc"),
          benefits: [
            t("home_globalVisibility"),
            t("home_qualifiedLeads"),
            t("home_brandPromotion"),
          ],
          bgColor: "bg-blue-800",
          buttonText: t("home_partnerWithUs"),
          featured: true,
          locked: true, // Mark as locked feature
        },
        {
          title: t("home_eliteAgent"),
          description: t("home_eliteAgentDesc"),
          benefits: [
            t("home_highCommission"),
            t("home_marketingTools"),
            t("home_leadGeneration"),
          ],
          bgColor: "bg-white",
          buttonText: t("home_joinAsAgent"),
          locked: true, // Mark as locked feature
        },
      ],
      [t]
    );

    return (
      <div className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("home_chooseExperience")}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t("home_experienceDescription")}
            </p>
            <div className="w-20 h-1 bg-blue-800 mx-auto mt-6"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {userTypes.map((type, typeIndex: number) => (
              <div
                key={typeIndex}
                className={`${type.bgColor} ${
                  type.featured ? "ring-2 ring-blue-800" : ""
                } rounded-xl overflow-hidden shadow-lg transition-all hover:-translate-y-1 duration-300 hover:shadow-xl relative group`}
                onMouseEnter={() => type.locked && setHoveredCard(typeIndex)}
                onMouseLeave={() => type.locked && setHoveredCard(null)}
              >
                <div
                  className={`p-8 ${
                    type.featured ? "text-white" : "text-gray-800"
                  }`}
                >
                  <h3 className="text-xl font-bold mb-3">{type.title}</h3>
                  <p
                    className={`mb-6 ${
                      type.featured ? "text-blue-100" : "text-gray-600"
                    }`}
                  >
                    {type.description}
                  </p>
                  <ul className="space-y-4 mb-8">
                    {type.benefits.map((benefit, benefitIndex: number) => {
                      const isOpen = openDropdowns.has(
                        `${typeIndex}-${benefitIndex}`
                      );
                      const description =
                        benefitDescriptions[language][benefit];

                      return (
                        <li key={benefitIndex} className="overflow-hidden">
                          <div
                            onClick={() =>
                              toggleDropdown(typeIndex, benefitIndex)
                            }
                            className={`flex items-center cursor-pointer rounded-lg transition-all duration-300 ${
                              type.featured
                                ? `${
                                    isOpen ? "bg-blue-700" : ""
                                  } hover:bg-blue-700`
                                : `${
                                    isOpen ? "bg-blue-50" : ""
                                  } hover:bg-blue-50`
                            } ${isOpen ? "shadow-sm" : ""}`}
                          >
                            <div className="flex items-center w-full">
                              <div
                                className={`flex items-center justify-center h-8 w-8 rounded-full mr-2 transition-all duration-300 ${
                                  type.featured
                                    ? `${
                                        isOpen ? "bg-blue-600" : "bg-blue-700"
                                      } text-blue-300`
                                    : `${
                                        isOpen ? "bg-blue-100" : "bg-blue-50"
                                      } text-blue-800`
                                }`}
                              >
                                <svg
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1 py-2">
                                <span
                                  className={`text-sm font-medium ${
                                    type.featured
                                      ? "text-white"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {benefit}
                                </span>
                              </div>
                              <div
                                className={`flex items-center justify-center h-8 w-8 rounded-full transition-transform duration-300 ${
                                  type.featured
                                    ? "text-blue-300"
                                    : "text-blue-800"
                                }`}
                              >
                                <ChevronRight
                                  className={`h-4 w-4 transition-transform duration-300 ${
                                    isRtl ? "rotate-180" : ""
                                  } ${isOpen ? "transform rotate-90" : ""}`}
                                />
                              </div>
                            </div>
                          </div>

                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              isOpen
                                ? "max-h-96 opacity-100"
                                : "max-h-0 opacity-0"
                            }`}
                          >
                            <div
                              className={`mt-2 mx-2 px-4 py-3 text-sm rounded-lg ${
                                type.featured
                                  ? "bg-blue-700 text-blue-100"
                                  : "bg-blue-50 text-gray-600"
                              } border-l-2 ${
                                type.featured
                                  ? "border-blue-300"
                                  : "border-blue-300"
                              }`}
                            >
                              {description}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <button
                    className={`w-full py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                      type.featured
                        ? "bg-white text-blue-800 hover:bg-gray-100 shadow-md hover:shadow-lg"
                        : "bg-blue-800 text-white hover:bg-blue-900 shadow-md hover:shadow-lg"
                    }`}
                    onClick={
                      type.buttonText === t("home_exploreBuyer")
                        ? handleSignup
                        : handleLockedFeature
                    }
                  >
                    {type.buttonText}
                    <ChevronRight
                      className={`ml-2 h-4 w-4 opacity-70 transition-transform duration-300 ${
                        isRtl
                          ? "rotate-180 group-hover:-translate-x-1"
                          : "group-hover:translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Feature not unlocked overlay */}
                {type.locked && (
                  <div
                    className={`absolute inset-0 bg-black/80 flex items-center justify-center transition-opacity duration-300 ${
                      hoveredCard === typeIndex
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                    dir={language === "ar" ? "rtl" : "ltr"}
                  >
                    <div className="text-center p-6">
                      <div className="bg-blue-800 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-white text-lg font-medium mb-2">
                        {t("home_featureNotUnlocked")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

// FeaturedCars Section
const FeaturedCars = ({ t, isRtl }: { t: TranslationFn; isRtl: boolean }) => {
  const router = useRouter();

  const {
    data: cars = [],
    isLoading,
    error,
  } = useQuery<CarData[]>({
    queryKey: ["cars"],
    queryFn: () => carService.getFirstFourCars(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30, // Keep in cache
  });

  if (isLoading) {
    return (
      <div className="py-20 bg-white relative overflow-hidden" id="cars">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-4 mx-auto w-64"></div>
              <div className="h-4 bg-gray-300 rounded mb-6 mx-auto w-96"></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100"
                  >
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded mb-4 w-24"></div>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="h-3 bg-gray-300 rounded"></div>
                        <div className="h-3 bg-gray-300 rounded"></div>
                        <div className="h-3 bg-gray-300 rounded"></div>
                        <div className="h-3 bg-gray-300 rounded"></div>
                      </div>
                      <div className="h-8 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 bg-white relative overflow-hidden" id="cars">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-600 mb-4">
            <h3 className="text-xl font-semibold mb-2">
              {t("home_errorLoadingVehicles")}
            </h3>
            <p>{t("home_pleaseTryAgainLater")}</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="py-20 bg-white relative overflow-hidden" id="cars">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("home_featuredVehicles")}
          </h2>
          <p className="text-gray-600">No vehicles available at the moment</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-white relative overflow-hidden" id="cars">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("home_featuredVehicles")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("home_featuredVehiclesDesc")}
          </p>
          <div className="w-20 h-1 bg-blue-800 mx-auto mt-6"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cars.map((car) => (
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
                  alt={`${car.year} ${car.maker} ${car.title}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  quality={85}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,..."
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
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => router.push("/user")}
            className="px-6 py-3 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center mx-auto group"
          >
            {t("home_viewAllVehicles")}
            <ArrowRight
              className={`ml-2 h-5 w-5 transform transition-transform duration-300 ${
                isRtl
                  ? "rotate-180 group-hover:-translate-x-1"
                  : "group-hover:translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
    </div>
  );
};

// Call To Action
const CallToAction = memo(
  ({ t, isRtl }: { t: TranslationFn; isRtl: boolean }) => {
    const router = useRouter();

    return (
      <div className="bg-white text-gray-900 py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] bg-repeat opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">
            {t("home_readyExperience")}
          </h2>
          <p className="max-w-2xl mx-auto mb-8 text-gray-600">
            {t("home_joinExclusive")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/signup")}
              className="px-8 py-4 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-all duration-300 shadow-md hover:shadow-lg group"
            >
              {t("home_createAccount")}
              <ArrowRight
                className={`ml-2 h-5 w-5 inline-block  transition-transform duration-300 ${
                  isRtl
                    ? "rotate-180 group-hover:-translate-x-1"
                    : " group-hover:translate-x-1"
                }`}
              />
            </button>
            <button
              onClick={() => router.push("/learn-more")}
              className="px-8 py-4 bg-transparent border border-blue-800 text-blue-800 font-medium rounded-lg hover:bg-blue-50 transition-all duration-300"
            >
              {t("home_learnMore")}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default LuxuryAutoLanding;
