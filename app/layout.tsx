import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";

// UPDATE YOUR METADATA WITH SEO-OPTIMIZED CONTENT
export const metadata: Metadata = {
  title: "Tonobilti - Cars Import Algeria",
  description:
    "استيراد السيارات الفاخرة من الصين إلى الجزائر. سيارات 0 كيلومتر وأقل من 3 سنوات. بطاقة رمادية فورية أو مؤجلة. أفضل الأسعار والجودة المضمونة في الجزائر.",
  keywords:
    "استيراد سيارات, الجزائر, الصين, سيارات فاخرة, بطاقة رمادية, سيارات 0 كيلومتر, Algérie voitures, importation Chine, luxury cars Algeria, car import Algeria, Chinese cars Algeria, Tonobilti",
  authors: [{ name: "Tonobilti" }],
  creator: "Tonobilti",
  publisher: "Tonobilti",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_DZ",
    alternateLocale: ["fr_DZ", "en_US"],
    url: "https://tonobilti.store",
    siteName: "Tonobilti - Car Import Algeria",
    title: "Tonbilti - استيراد السيارات من الصين إلى الجزائر | Tonobilti",
    description:
      "استيراد السيارات الفاخرة من الصين إلى الجزائر. سيارات 0 كيلومتر وأقل من 3 سنوات. بطاقة رمادية فورية أو مؤجلة.",
    images: [
      {
        url: "/og-image-tonobilti.jpg",
        width: 1200,
        height: 630,
        alt: "Tonobilti - Car Import from China to Algeria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "استيراد السيارات من الصين إلى الجزائر | Tonobilti",
    description:
      "استيراد السيارات الفاخرة من الصين إلى الجزائر. سيارات 0 كيلومتر وأقل من 3 سنوات.",
    images: ["/twitter-image-tonobilti.jpg"],
  },
  alternates: {
    canonical: "https://tonobilti.store",
    languages: {
      ar: "/ar",
      fr: "/fr",
      en: "/en",
    },
  },
  verification: {
    google: "your-google-verification-code-here",
    yandex: "your-yandex-verification-code-here",
    yahoo: "your-yahoo-verification-code-here",
  },
  other: {
    "geo.region": "DZ",
    "geo.placename": "Algeria",
    "geo.position": "36.7539;3.0588",
    ICBM: "36.7539, 3.0588",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* EXISTING FONTS - KEEP AS IS */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@500&display=swap"
          rel="stylesheet"
        />

        {/* Favicon and App Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Theme and Mobile */}
        <meta name="theme-color" content="#1e40af" />
        <meta name="msapplication-TileColor" content="#1e40af" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />

        {/* Performance - DNS Prefetch */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />
        <link
          rel="preload"
          href="https://res.cloudinary.com/dzfaa28ro/image/upload/v1742780926/lan-page-car_mpcwvn.png"
          as="image"
        />

        {/* STRUCTURED DATA - JSON-LD SCHEMAS */}

        {/* Auto Dealer Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AutoDealer",
              name: "Tonobilti - Car Import Algeria",
              description:
                "Premium car import services from China to Algeria. Luxury vehicles, 0km and under 3 years old.",
              url: "https://tonobilti.store",
              logo: "https://tonobilti.store/logo.png",
              image: "https://tonobilti.store/hero-image.jpg",
              telephone: "+213-XXX-XXX-XXX",
              email: "tonobilticars@gmail.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Your Street Address",
                addressLocality: "Algiers",
                addressRegion: "Algiers",
                postalCode: "16000",
                addressCountry: "DZ",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 36.7539,
                longitude: 3.0588,
              },
              openingHours: "Mo-Sa 08:00-18:00",
              priceRange: "$$-$$$",
              currenciesAccepted: "DZD",
              paymentAccepted: "Cash, Bank Transfer",
              areaServed: {
                "@type": "Country",
                name: "Algeria",
              },
              serviceArea: {
                "@type": "Country",
                name: "Algeria",
              },
              makesOffered: [
                "Toyota",
                "Honda",
                "BMW",
                "Mercedes-Benz",
                "Audi",
                "Lexus",
                "Nissan",
                "Hyundai",
                "Volkswagen",
                "Ford",
              ],
              sameAs: [
                "https://www.facebook.com/tonobilti",
                "https://www.instagram.com/tonobilti",
              ],
            }),
          }}
        />

        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Tonobilti - Premium Vehicle Import Services",
              url: "https://tonobilti.store",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://tonobilti.store/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        {/* Service Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              name: "Car Import from China to Algeria",
              description:
                "Professional car import services specializing in luxury vehicles from China to Algeria",
              provider: {
                "@type": "Organization",
                name: "Tonobilti",
              },
              areaServed: {
                "@type": "Country",
                name: "Algeria",
              },
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Car Import Services",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "New Car Import (0km)",
                      description:
                        "Import brand new vehicles from China to Algeria",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Used Car Import (Under 3 years)",
                      description:
                        "Import recent model vehicles under 3 years old from China",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Gray Card Processing",
                      description:
                        "Immediate or deferred gray card registration services",
                    },
                  },
                ],
              },
            }),
          }}
        />

        {/* Local Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Tonobilti",
              description: "Car import services from China to Algeria",
              url: "https://tonobilti.store",
              telephone: "+213781282376",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Algeria, Algiers",
                addressLocality: "Algiers",
                addressRegion: "Algiers",
                postalCode: "16000",
                addressCountry: "DZ",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 36.7539,
                longitude: 3.0588,
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ],
                  opens: "08:00",
                  closes: "18:00",
                },
              ],
            }),
          }}
        />
      </head>
      <body
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}